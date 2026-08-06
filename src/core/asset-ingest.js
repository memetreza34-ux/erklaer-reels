import { access, copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

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
      requiredCoverComparedFields: ['headline', 'coverVisualIdea', 'coverPrompt'],
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
    : (rules.requiredCoverComparedFields ?? []);
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

function sceneInventoryEntry(scene, index, sceneIndex, imagePrompt) {
  return {
    sceneId: scene.sceneId,
    order: scene.order,
    title: scene.title,
    narration: scene.narration ?? '',
    audioCue: scene.audioCue ?? '',
    imageText: scene.imageText ?? '',
    visualIdea: scene.visualIdea ?? '',
    imagePrompt,
    previousSceneId: sceneIndex[index - 1]?.sceneId ?? null,
    nextSceneId: sceneIndex[index + 1]?.sceneId ?? null
  };
}

export async function buildAssetInventory(reelDirectory) {
  const inboxDirectory = path.join(reelDirectory, 'inbox');
  const imagesDirectory = path.join(inboxDirectory, 'images');
  const audioDirectory = path.join(inboxDirectory, 'audio');

  await mkdir(imagesDirectory, { recursive: true });
  await mkdir(audioDirectory, { recursive: true });

  const sceneIndexPath = path.join(reelDirectory, 'scenes', 'scene-index.json');
  const sceneIndex = await readJson(sceneIndexPath, []);
  const qualityGates = await readQualityGates();

  const scenes = [];
  for (let index = 0; index < sceneIndex.length; index += 1) {
    const scene = sceneIndex[index];
    const promptPath = path.join(reelDirectory, 'scenes', scene.sceneId, 'image-prompt.txt');
    const imagePrompt = (await exists(promptPath)) ? (await readFile(promptPath, 'utf8')).trim() : '';
    scenes.push(sceneInventoryEntry(scene, index, sceneIndex, imagePrompt));
  }

  const imageFiles = (await walkFiles(imagesDirectory, inboxDirectory))
    .filter((file) => IMAGE_EXTENSIONS.has(extensionOf(file.relativePath)))
    .map((file) => ({ file: file.relativePath, extension: extensionOf(file.relativePath) }));

  const audioFiles = (await walkFiles(audioDirectory, inboxDirectory))
    .filter((file) => AUDIO_EXTENSIONS.has(extensionOf(file.relativePath)))
    .map((file) => ({ file: file.relativePath, extension: extensionOf(file.relativePath) }));

  const inventory = {
    version: 2,
    reelDirectory: reelDirectory.split(path.sep).join('/'),
    createdAt: new Date().toISOString(),
    matchingRules: qualityGates.assetMatching,
    instructions: [
      'Erster Durchgang: Betrachte jedes Bild ohne Dateinamen und beschreibe ausschließlich den sichtbaren Inhalt.',
      'Vergleiche danach das Bild mit narration, audioCue, visualIdea, imageText und imagePrompt jeder möglichen Szene.',
      'Zweiter Durchgang: Prüfe die gewählte Szene nochmals gegen die vorherige und die nächste Szene, damit benachbarte Bilder nicht vertauscht werden.',
      'Ordne niemals nach Upload-Reihenfolge, Dateiname, Erstellungszeit oder vermuteter laufender Nummer zu.',
      'Sichtbarer deutscher Schlüsseltext ist ein starkes Signal, reicht aber allein nicht aus.',
      'Jede Quelle und jedes Ziel darf höchstens einmal verwendet werden.',
      'Das Cover ist eine eigene Zuweisung und gehört nicht zu scene-01.',
      `Unter einer Konfidenz von ${qualityGates.assetMatching?.minimumConfidence ?? 0.9} bleibt die Datei unmatched.`,
      'Für jede Bildzuordnung sind visibleSummary, reason, comparedFields, matchMethod, visualReviewed und secondPassConfirmed Pflicht.',
      'Für Szenen sind zusätzlich confirmedTarget, confirmedSceneOrder und sceneOrderConfirmed Pflicht.'
    ],
    scenes,
    candidates: {
      images: imageFiles,
      audio: audioFiles
    }
  };

  await writeJson(path.join(inboxDirectory, 'asset-inventory.json'), inventory);

  const mapPath = path.join(inboxDirectory, 'asset-map.json');
  if (!(await exists(mapPath))) {
    await writeJson(mapPath, {
      version: 2,
      generatedBy: '',
      assignments: [],
      unmatched: []
    });
  }

  return inventory;
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
  const manifestPath = path.join(reelDirectory, 'assets-manifest.json');
  const manifest = await readJson(manifestPath, { audio: {}, scenes: [], cover: {} });
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
    } else if (target === 'cover') {
      if (!IMAGE_EXTENSIONS.has(extension)) {
        skipped.push({ assignment, reason: 'Datei ist kein unterstütztes Bildformat' });
        continue;
      }

      const visualError = validateVisualAssignment(assignment, target, null, matchingRules);
      if (visualError) {
        skipped.push({ assignment, reason: visualError });
        continue;
      }

      verification = {
        visualReviewed: true,
        secondPassConfirmed: true,
        visibleSummary: String(assignment.visibleSummary).trim(),
        reason: String(assignment.reason).trim(),
        comparedFields: normalizeComparedFields(assignment.comparedFields),
        matchMethod: assignment.matchMethod,
        reviewedAt: assignment.reviewedAt ?? new Date().toISOString()
      };

      destinationPath = path.join(reelDirectory, 'cover', `cover${extension}`);
      expectedRelativePath = `cover/cover${extension}`;
      const coverPath = path.join(reelDirectory, 'cover', 'cover.json');
      const cover = await readJson(coverPath, {});
      cover.expectedImageFileName = `cover${extension}`;
      cover.status = 'ready';
      cover.source = source;
      cover.confidence = confidence;
      cover.assetVerification = verification;
      await writeJson(coverPath, cover);
      manifest.cover = {
        expectedFile: expectedRelativePath,
        source,
        confidence,
        verification,
        status: 'ready'
      };
      status.cover = 'ready';
    } else if (scenesById.has(target)) {
      if (!IMAGE_EXTENSIONS.has(extension)) {
        skipped.push({ assignment, reason: 'Datei ist kein unterstütztes Bildformat' });
        continue;
      }

      const indexedScene = scenesById.get(target);
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
        visibleSummary: String(assignment.visibleSummary).trim(),
        reason: String(assignment.reason).trim(),
        comparedFields: normalizeComparedFields(assignment.comparedFields),
        matchMethod: assignment.matchMethod,
        reviewedAt: assignment.reviewedAt ?? new Date().toISOString()
      };

      destinationPath = path.join(reelDirectory, 'scenes', target, `${target}${extension}`);
      expectedRelativePath = `scenes/${target}/${target}${extension}`;
      const scenePath = path.join(reelDirectory, 'scenes', target, 'scene.json');
      const scene = await readJson(scenePath, indexedScene);
      scene.expectedImageFileName = `${target}${extension}`;
      scene.status = 'image-ready';
      scene.source = source;
      scene.matchConfidence = confidence;
      scene.matchReason = verification.reason;
      scene.assetVerification = verification;
      await writeJson(scenePath, scene);
      Object.assign(indexedScene, scene);

      const manifestScene = manifest.scenes.find((item) => item.sceneId === target);
      const nextManifestScene = {
        sceneId: target,
        expectedFile: expectedRelativePath,
        source,
        confidence,
        verification,
        status: 'ready'
      };
      if (manifestScene) Object.assign(manifestScene, nextManifestScene);
      else manifest.scenes.push(nextManifestScene);
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

  const verifiedSceneIds = new Set(
    applied
      .filter((entry) => scenesById.has(entry.target) && entry.verification?.secondPassConfirmed === true)
      .map((entry) => entry.target)
  );
  const readySceneCount = manifest.scenes.filter((scene) =>
    scene.status === 'ready' &&
    (scene.verification?.secondPassConfirmed === true || verifiedSceneIds.has(scene.sceneId))
  ).length;

  status.images = readySceneCount === sceneIndex.length
    ? 'ready'
    : readySceneCount > 0
      ? 'partial'
      : 'missing';
  status.assetMatching = readySceneCount === sceneIndex.length ? 'verified' : 'needs-review';

  await writeJson(sceneIndexPath, [...scenesById.values()].sort((a, b) => a.order - b.order));
  await writeJson(manifestPath, manifest);
  await writeJson(statusPath, status);

  const sceneVerification = sceneIndex.map((scene) => {
    const manifestScene = manifest.scenes.find((entry) => entry.sceneId === scene.sceneId);
    return {
      sceneId: scene.sceneId,
      order: scene.order,
      title: scene.title,
      narration: scene.narration ?? '',
      visualIdea: scene.visualIdea ?? '',
      imageText: scene.imageText ?? '',
      expectedFile: manifestScene?.expectedFile ?? null,
      verification: manifestScene?.verification ?? null,
      passed: manifestScene?.status === 'ready' && manifestScene?.verification?.secondPassConfirmed === true
    };
  });

  const verificationReport = {
    version: 1,
    createdAt: new Date().toISOString(),
    passed: sceneVerification.length > 0 && sceneVerification.every((entry) => entry.passed),
    minimumConfidence: matchingRules.minimumConfidence ?? 0.9,
    scenes: sceneVerification,
    instructions: [
      'Jede Szene muss anhand ihres sichtbaren Inhalts und nicht anhand des Dateinamens zugeordnet sein.',
      'Die zweite Prüfung muss die gewählte Szene gegen die vorherige und nächste Szene bestätigen.',
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
      assignedScenes: readySceneCount,
      totalScenes: sceneIndex.length,
      audioReady: status.audio === 'ready',
      coverReady: status.cover === 'ready',
      sceneVerificationPassed: verificationReport.passed
    }
  };

  await writeJson(path.join(reelDirectory, 'review', 'asset-matching-report.json'), report);
  await writeJson(path.join(reelDirectory, 'review', 'scene-asset-verification.json'), verificationReport);
  return report;
}
