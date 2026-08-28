import { access, copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  flattenSceneImagePhases,
  normalizeSceneImagePhases,
  syncSceneImagePhases,
  visualTargetMap
} from '../shared/visual-moments.js';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg']);

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath, fallback = null) {
  if (!(await exists(filePath))) return fallback;
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function readQualityGates() {
  return readJson(path.resolve('config', 'production-quality-gates.json'), {
    assetMatching: {
      minimumConfidence: 0.9,
      requireVisualReview: true,
      requireSecondPassConfirmation: true,
      requireSceneOrderConfirmation: true,
      requireMatchReason: true,
      minimumMatchReasonLength: 20,
      requireVisibleSummary: true,
      minimumVisibleSummaryLength: 15,
      requiredSceneComparedFields: ['narration', 'visualIdea', 'imageText', 'imagePrompt'],
      forbidFilenameOnlyMatching: true,
      allowedMatchMethods: ['visual-content-review', 'visual-text-and-content-review']
    }
  });
}

async function walkFiles(directory, root = directory) {
  if (!(await exists(directory))) return [];

  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles(absolutePath, root));
    } else if (entry.isFile() && entry.name !== '.gitkeep') {
      files.push({
        absolutePath,
        relativePath: path.relative(root, absolutePath).split(path.sep).join('/')
      });
    }
  }

  return files;
}

function extensionOf(filePath) {
  return path.extname(filePath).toLowerCase();
}

function ensureInside(parentDirectory, candidatePath) {
  const relative = path.relative(parentDirectory, candidatePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Ungültiger Dateipfad außerhalb des Inbox-Ordners: ${candidatePath}`);
  }
}

function normalizeComparedFields(value) {
  return Array.isArray(value)
    ? [...new Set(value.map((entry) => String(entry).trim()).filter(Boolean))]
    : [];
}

function validateVisualAssignment(assignment, target, scene, rules) {
  const confidence = Number(assignment.confidence ?? 0);
  if (confidence < Number(rules.minimumConfidence ?? 0.9)) {
    return `Konfidenz unter ${rules.minimumConfidence ?? 0.9}`;
  }

  if (rules.requireVisualReview && assignment.visualReviewed !== true) {
    return 'visuelle Prüfung wurde nicht bestätigt';
  }
  if (rules.requireSecondPassConfirmation && assignment.secondPassConfirmed !== true) {
    return 'zweite unabhängige Zuordnungsprüfung fehlt';
  }
  if (rules.requireMatchReason && String(assignment.reason ?? '').trim().length < Number(rules.minimumMatchReasonLength ?? 20)) {
    return 'konkrete Zuordnungsbegründung fehlt oder ist zu kurz';
  }
  if (rules.requireVisibleSummary && String(assignment.visibleSummary ?? '').trim().length < Number(rules.minimumVisibleSummaryLength ?? 15)) {
    return 'sichtbare Bildbeschreibung fehlt oder ist zu kurz';
  }

  const comparedFields = normalizeComparedFields(assignment.comparedFields);
  const requiredFields = scene
    ? (rules.requiredSceneComparedFields ?? rules.requiredComparedFields ?? [])
    : [];
  const missingComparedFields = requiredFields.filter((field) => !comparedFields.includes(field));
  if (missingComparedFields.length > 0) {
    return `nicht mit allen Pflichtfeldern verglichen: ${missingComparedFields.join(', ')}`;
  }

  const matchMethod = String(assignment.matchMethod ?? '').trim();
  if (rules.forbidFilenameOnlyMatching && (!matchMethod || matchMethod === 'filename-only')) {
    return 'Zuordnung nur nach Dateiname oder Reihenfolge ist verboten';
  }
  if (Array.isArray(rules.allowedMatchMethods) && !rules.allowedMatchMethods.includes(matchMethod)) {
    return `nicht erlaubte Zuordnungsmethode: ${matchMethod || 'keine'}`;
  }

  if (scene) {
    if (rules.requireSceneOrderConfirmation && assignment.sceneOrderConfirmed !== true) {
      return 'Szenenreihenfolge wurde nicht bestätigt';
    }
    if (String(assignment.confirmedTarget ?? '').trim() !== target) {
      return `confirmedTarget muss exakt ${target} sein`;
    }
    if (Number(assignment.confirmedSceneOrder) !== Number(scene.order)) {
      return `confirmedSceneOrder muss exakt ${scene.order} sein`;
    }
  }

  return null;
}

function visualInventoryEntry(phase, previousTargetId, nextTargetId, imagePrompt) {
  return {
    targetId: phase.targetId,
    sceneId: phase.sceneId,
    sceneOrder: phase.sceneOrder,
    phaseId: phase.phaseId,
    phaseOrder: phase.phaseOrder,
    globalOrder: phase.globalOrder,
    title: phase.sceneTitle,
    narration: phase.narration ?? '',
    audioCue: phase.audioCue ?? '',
    imageText: phase.imageText || phase.sceneImageText || '',
    visualIdea: phase.visualIdea || phase.sceneVisualIdea || '',
    imagePrompt,
    previousTargetId,
    nextTargetId
  };
}

export async function buildAssetInventory(reelDirectory) {
  const inboxDirectory = path.join(reelDirectory, 'inbox');
  const imagesDirectory = path.join(inboxDirectory, 'images');
  const audioDirectory = path.join(inboxDirectory, 'audio');

  await mkdir(imagesDirectory, { recursive: true });
  await mkdir(audioDirectory, { recursive: true });

  const sceneIndex = await readJson(path.join(reelDirectory, 'scenes', 'scene-index.json'), []);
  const qualityGates = await readQualityGates();
  const phases = flattenSceneImagePhases(sceneIndex);

  const visuals = [];
  for (let index = 0; index < phases.length; index += 1) {
    const phase = phases[index];
    const promptPath = path.join(reelDirectory, 'scenes', phase.sceneId, phase.promptFileName);
    const imagePrompt = (await exists(promptPath)) ? (await readFile(promptPath, 'utf8')).trim() : '';
    visuals.push(visualInventoryEntry(
      phase,
      phases[index - 1]?.targetId ?? null,
      phases[index + 1]?.targetId ?? null,
      imagePrompt
    ));
  }

  const imageFiles = (await walkFiles(imagesDirectory, inboxDirectory))
    .filter((file) => IMAGE_EXTENSIONS.has(extensionOf(file.relativePath)))
    .map((file) => ({ file: file.relativePath, extension: extensionOf(file.relativePath) }));

  const audioFiles = (await walkFiles(audioDirectory, inboxDirectory))
    .filter((file) => AUDIO_EXTENSIONS.has(extensionOf(file.relativePath)))
    .map((file) => ({ file: file.relativePath, extension: extensionOf(file.relativePath) }));

  const inventory = {
    version: 3,
    reelDirectory: reelDirectory.split(path.sep).join('/'),
    createdAt: new Date().toISOString(),
    plannedImageCount: phases.length,
    matchingRules: qualityGates.assetMatching,
    instructions: [
      'Erster Durchgang: Betrachte jedes Bild ohne Dateinamen und beschreibe ausschließlich den sichtbaren Inhalt.',
      'Vergleiche danach das Bild mit narration, audioCue, visualIdea, imageText und imagePrompt der konkreten Bildphase.',
      'Zweiter Durchgang: Prüfe die gewählte Bildphase nochmals gegen die vorherige und nächste Bildphase, damit benachbarte Bilder nicht vertauscht werden.',
      'Ordne niemals ausschließlich nach Upload-Reihenfolge, Dateiname, Erstellungszeit oder laufender Nummer zu.',
      'Eine narrative Szene kann mehrere Bildphasen besitzen; confirmedTarget muss deshalb exakt den Zielnamen der Bildphase enthalten.',
      `Unter einer Konfidenz von ${qualityGates.assetMatching?.minimumConfidence ?? 0.9} bleibt die Datei unmatched.`
    ],
    visuals,
    scenes: sceneIndex,
    candidates: {
      images: imageFiles,
      audio: audioFiles
    }
  };

  await writeJson(path.join(inboxDirectory, 'asset-inventory.json'), inventory);

  const mapPath = path.join(inboxDirectory, 'asset-map.json');
  if (!(await exists(mapPath))) {
    await writeJson(mapPath, {
      version: 4,
      generatedBy: '',
      assignments: [],
      unmatched: []
    });
  }

  return inventory;
}

function replaceExtension(fileName, extension) {
  const parsed = path.parse(fileName);
  return `${parsed.name}${extension}`;
}

function upsertVisualManifest(manifest, entry) {
  if (!Array.isArray(manifest.visuals)) manifest.visuals = [];
  const existing = manifest.visuals.find((item) => item.targetId === entry.targetId);
  if (existing) Object.assign(existing, entry);
  else manifest.visuals.push(entry);
}

function upsertLegacySceneManifest(manifest, entry) {
  if (!Array.isArray(manifest.scenes)) manifest.scenes = [];
  const existing = manifest.scenes.find((item) => item.sceneId === entry.sceneId);
  if (existing) Object.assign(existing, entry);
  else manifest.scenes.push(entry);
}

function seedVisualManifest(manifest, sceneIndex) {
  if (!Array.isArray(manifest.visuals)) manifest.visuals = [];
  const legacyByScene = new Map((manifest.scenes ?? []).map((entry) => [entry.sceneId, entry]));
  for (const phase of flattenSceneImagePhases(sceneIndex)) {
    if (manifest.visuals.some((entry) => entry.targetId === phase.targetId)) continue;
    const legacy = phase.primary ? legacyByScene.get(phase.sceneId) : null;
    manifest.visuals.push({
      targetId: phase.targetId,
      sceneId: phase.sceneId,
      sceneOrder: phase.sceneOrder,
      phaseId: phase.phaseId,
      phaseOrder: phase.phaseOrder,
      expectedFile: legacy?.expectedFile ?? `scenes/${phase.sceneId}/${phase.expectedImageFileName}`,
      source: legacy?.source ?? null,
      confidence: legacy?.confidence ?? null,
      verification: legacy?.verification ?? phase.assetVerification ?? null,
      status: legacy?.status ?? phase.imageStatus ?? 'missing'
    });
  }
}

export async function applyAssetMap(reelDirectory) {
  const inboxDirectory = path.join(reelDirectory, 'inbox');
  const mapPath = path.join(inboxDirectory, 'asset-map.json');
  const assetMap = await readJson(mapPath);
  const qualityGates = await readQualityGates();
  const matchingRules = qualityGates.assetMatching ?? {};

  if (!assetMap || !Array.isArray(assetMap.assignments)) {
    throw new Error('inbox/asset-map.json fehlt oder enthält keine assignments-Liste.');
  }

  const sceneIndexPath = path.join(reelDirectory, 'scenes', 'scene-index.json');
  const sceneIndex = await readJson(sceneIndexPath, []);
  const scenesById = new Map(sceneIndex.map((scene) => [scene.sceneId, scene]));
  const targets = visualTargetMap(sceneIndex);
  const manifestPath = path.join(reelDirectory, 'assets-manifest.json');
  const manifest = await readJson(manifestPath, { audio: {}, visuals: [], scenes: [] });
  seedVisualManifest(manifest, sceneIndex);
  const statusPath = path.join(reelDirectory, 'status.json');
  const status = await readJson(statusPath, {});

  const usedSources = new Set();
  const usedTargets = new Set();
  const applied = [];
  const skipped = [];

  for (const assignment of assetMap.assignments) {
    const source = String(assignment.source ?? '').trim();
    const target = String(assignment.target ?? '').trim();
    const confidence = Number(assignment.confidence ?? 0);

    if (!source || !target) {
      skipped.push({ assignment, reason: 'source oder target fehlt' });
      continue;
    }

    if (usedSources.has(source) || usedTargets.has(target)) {
      skipped.push({ assignment, reason: 'Quelle oder Ziel wurde doppelt verwendet' });
      continue;
    }

    const sourcePath = path.resolve(inboxDirectory, source);
    ensureInside(path.resolve(inboxDirectory), sourcePath);

    if (!(await exists(sourcePath))) {
      skipped.push({ assignment, reason: 'Quelldatei nicht gefunden' });
      continue;
    }

    const extension = extensionOf(sourcePath);
    let destinationPath;
    let expectedRelativePath;
    let verification = null;

    if (target === 'audio') {
      if (!AUDIO_EXTENSIONS.has(extension)) {
        skipped.push({ assignment, reason: 'Datei ist kein unterstütztes Audioformat' });
        continue;
      }

      destinationPath = path.join(reelDirectory, 'audio', `voiceover${extension}`);
      expectedRelativePath = `audio/voiceover${extension}`;
      manifest.audio = {
        expectedFile: expectedRelativePath,
        source,
        confidence,
        status: 'ready'
      };
      status.audio = 'ready';
    } else if (targets.has(target)) {
      if (!IMAGE_EXTENSIONS.has(extension)) {
        skipped.push({ assignment, reason: 'Datei ist kein unterstütztes Bildformat' });
        continue;
      }

      const phaseTarget = targets.get(target);
      const indexedScene = scenesById.get(phaseTarget.sceneId);
      const visualError = validateVisualAssignment(assignment, target, indexedScene, matchingRules);
      if (visualError) {
        skipped.push({ assignment, reason: visualError });
        continue;
      }

      verification = {
        visualReviewed: true,
        secondPassConfirmed: true,
        sceneOrderConfirmed: true,
        confirmedTarget: target,
        confirmedSceneOrder: Number(indexedScene.order),
        confirmedPhaseOrder: Number(phaseTarget.phaseOrder),
        visibleSummary: String(assignment.visibleSummary).trim(),
        reason: String(assignment.reason).trim(),
        comparedFields: normalizeComparedFields(assignment.comparedFields),
        matchMethod: assignment.matchMethod,
        reviewedAt: assignment.reviewedAt ?? new Date().toISOString()
      };

      const outputFileName = replaceExtension(phaseTarget.expectedImageFileName, extension);
      destinationPath = path.join(reelDirectory, 'scenes', phaseTarget.sceneId, outputFileName);
      expectedRelativePath = `scenes/${phaseTarget.sceneId}/${outputFileName}`;

      const scenePath = path.join(reelDirectory, 'scenes', phaseTarget.sceneId, 'scene.json');
      const scene = await readJson(scenePath, indexedScene);
      const phases = normalizeSceneImagePhases(scene).map((phase) => {
        if (phase.targetId !== target) return phase;
        return {
          ...phase,
          expectedImageFileName: outputFileName,
          imageStatus: 'ready',
          assetVerification: verification
        };
      });
      syncSceneImagePhases(scene, phases);
      scene.status = phases.every((phase) => phase.imageStatus === 'ready') ? 'image-ready' : 'images-partial';
      await writeJson(scenePath, scene);
      Object.assign(indexedScene, scene);

      upsertVisualManifest(manifest, {
        targetId: target,
        sceneId: phaseTarget.sceneId,
        sceneOrder: Number(indexedScene.order),
        phaseId: phaseTarget.phaseId,
        phaseOrder: Number(phaseTarget.phaseOrder),
        expectedFile: expectedRelativePath,
        source,
        confidence,
        verification,
        status: 'ready'
      });

      if (phaseTarget.primary) {
        upsertLegacySceneManifest(manifest, {
          sceneId: phaseTarget.sceneId,
          expectedFile: expectedRelativePath,
          source,
          confidence,
          verification,
          status: 'ready'
        });
      }
    } else {
      skipped.push({ assignment, reason: `Unbekanntes Ziel: ${target}` });
      continue;
    }

    await mkdir(path.dirname(destinationPath), { recursive: true });
    await copyFile(sourcePath, destinationPath);
    usedSources.add(source);
    usedTargets.add(target);
    applied.push({ source, target, destination: expectedRelativePath, confidence, verification });
  }

  const refreshedScenes = [...scenesById.values()].sort((a, b) => a.order - b.order);
  seedVisualManifest(manifest, refreshedScenes);
  const expectedVisualTargets = flattenSceneImagePhases(refreshedScenes);
  const manifestVisualByTarget = new Map((manifest.visuals ?? []).map((entry) => [entry.targetId, entry]));
  const readyVisualCount = expectedVisualTargets.filter((phase) => {
    const entry = manifestVisualByTarget.get(phase.targetId);
    return entry?.status === 'ready' && entry?.verification?.secondPassConfirmed === true;
  }).length;

  status.plannedImageCount = expectedVisualTargets.length;
  status.images = readyVisualCount === expectedVisualTargets.length
    ? 'ready'
    : readyVisualCount > 0
      ? 'partial'
      : 'missing';
  status.assetMatching = readyVisualCount === expectedVisualTargets.length ? 'verified' : 'needs-review';

  await writeJson(sceneIndexPath, refreshedScenes);
  await writeJson(manifestPath, manifest);
  await writeJson(statusPath, status);

  const visualVerification = expectedVisualTargets.map((phase) => {
    const manifestVisual = manifestVisualByTarget.get(phase.targetId);
    return {
      targetId: phase.targetId,
      sceneId: phase.sceneId,
      sceneOrder: phase.sceneOrder,
      phaseId: phase.phaseId,
      phaseOrder: phase.phaseOrder,
      expectedFile: manifestVisual?.expectedFile ?? null,
      verification: manifestVisual?.verification ?? null,
      passed: manifestVisual?.status === 'ready' && manifestVisual?.verification?.secondPassConfirmed === true
    };
  });

  const sceneVerification = refreshedScenes.map((scene) => {
    const entries = visualVerification.filter((entry) => entry.sceneId === scene.sceneId);
    return {
      sceneId: scene.sceneId,
      order: scene.order,
      title: scene.title,
      imageCount: entries.length,
      targetIds: entries.map((entry) => entry.targetId),
      passed: entries.length > 0 && entries.every((entry) => entry.passed)
    };
  });

  const verificationReport = {
    version: 2,
    createdAt: new Date().toISOString(),
    passed: visualVerification.length > 0 && visualVerification.every((entry) => entry.passed),
    minimumConfidence: matchingRules.minimumConfidence ?? 0.9,
    visuals: visualVerification,
    scenes: sceneVerification,
    instructions: [
      'Jede Bildphase muss anhand ihres sichtbaren Inhalts und nicht allein anhand des Dateinamens zugeordnet sein.',
      'Die zweite Prüfung muss die gewählte Bildphase gegen die vorherige und nächste Bildphase bestätigen.',
      'Bei einem Zweifel bleibt das Bild unmatched und blockiert den finalen Render.'
    ]
  };

  const report = {
    createdAt: new Date().toISOString(),
    applied,
    skipped,
    unmatched: assetMap.unmatched ?? [],
    verificationReport: 'review/scene-asset-verification.json',
    summary: {
      assignedImages: readyVisualCount,
      totalImages: expectedVisualTargets.length,
      totalScenes: refreshedScenes.length,
      audioReady: status.audio === 'ready',
      visualVerificationPassed: verificationReport.passed
    }
  };

  await writeJson(path.join(reelDirectory, 'review', 'asset-matching-report.json'), report);
  await writeJson(path.join(reelDirectory, 'review', 'scene-asset-verification.json'), verificationReport);
  return report;
}
