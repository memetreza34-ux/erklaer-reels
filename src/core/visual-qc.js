import { createHash } from 'node:crypto';
import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { readImageMetadata } from './image-metadata.js';
import { SUBTITLE_STYLE } from '../shared/subtitle-style.js';

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
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function addCheck(checks, id, passed, message, level = 'error', assetId = null) {
  checks.push({ id, assetId, passed, level, message });
}

function requiredChecksForAsset(rules, kind) {
  const byKind = rules.manualChecksByKind?.[kind];
  if (Array.isArray(byKind)) return byKind;
  return Array.isArray(rules.manualChecks) ? rules.manualChecks : [];
}

function allManualChecksPassed(entry, requiredChecks) {
  return entry?.status === 'passed' && requiredChecks.every((key) => entry?.checks?.[key] === true);
}

function manualEvidencePassed(entry, asset, rules) {
  const evidenceRules = rules.manualEvidence ?? {};
  if (evidenceRules.requireVisibleSummary &&
      String(entry?.visibleSummary ?? '').trim().length < Number(evidenceRules.minimumVisibleSummaryLength ?? 15)) {
    return false;
  }
  if (evidenceRules.requireMatchReason &&
      String(entry?.matchReason ?? '').trim().length < Number(evidenceRules.minimumMatchReasonLength ?? 20)) {
    return false;
  }
  if (evidenceRules.requireComparedAssetId && String(entry?.comparedAssetId ?? '') !== asset.assetId) {
    return false;
  }
  if (asset.kind === 'scene' && evidenceRules.requireSecondPassConfirmationForScenes && entry?.secondPassConfirmed !== true) {
    return false;
  }
  return true;
}

async function buildReviewFingerprint(reelDirectory, asset) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify({
    assetId: asset.assetId,
    file: asset.file,
    kind: asset.kind,
    expected: asset.expected
  }));

  const filePath = path.join(reelDirectory, asset.file);
  if (await exists(filePath)) {
    hash.update(await readFile(filePath));
  } else {
    hash.update('[missing-file]');
  }

  return hash.digest('hex');
}

function createReviewEntry(asset, requiredChecks) {
  return {
    assetId: asset.assetId,
    file: asset.file,
    kind: asset.kind,
    expected: asset.expected,
    reviewFingerprint: asset.reviewFingerprint,
    reviewer: '',
    reviewedAt: null,
    status: 'pending',
    visibleSummary: '',
    matchReason: '',
    comparedAssetId: asset.assetId,
    secondPassConfirmed: false,
    checks: Object.fromEntries(requiredChecks.map((key) => [key, null])),
    notes: []
  };
}

async function ensureInspectionFile(reelDirectory, assets, rules, reel) {
  const inspectionPath = path.join(reelDirectory, 'review', 'visual-inspection.json');
  const current = await readJson(inspectionPath, null);
  const byId = new Map((current?.assets ?? []).map((entry) => [entry.assetId, entry]));
  const next = {
    version: 7,
    visualStyleId: reel?.visualStyleId ?? '',
    visualStyleReason: reel?.visualStyleReason ?? '',
    instructions: [
      'Öffne jedes Bild tatsächlich. Dateiname, Upload-Reihenfolge oder Ordnerposition sind kein Beweis für die richtige Szene.',
      'Erster Durchgang: Beschreibe den sichtbaren Inhalt neutral in visibleSummary, ohne die Szenennummer zu erraten.',
      'Vergleiche das Bild danach mit expected.narration, expected.audioCue, expected.visualIdea, expected.imageText und expected.imagePrompt.',
      'Trage in matchReason konkret ein, welche sichtbaren Objekte und Handlungen die Zuordnung bestätigen.',
      'Zweiter Durchgang für Szenen: Vergleiche die Zuordnung nochmals mit der vorherigen und nächsten Szene und setze erst danach secondPassConfirmed auf true.',
      'Setze comparedAssetId exakt auf die geprüfte scene-XX-ID. So werden vertauschte Nachbarszenen sichtbar blockiert.',
      'Prüfe die gewählte Hauptbildwelt, Figurenform, Konturen und Farbwelt gegen reel.visualStyleId und visualStyleReason.',
      'Geplanter deutscher Bildtext muss exakt stimmen; zusätzliche englische oder erfundene Wörter sind verboten.',
      'Prüfe genau einen klaren Bildmoment und keine mehrfach dargestellte Hauptperson innerhalb derselben Illustration.',
      'Prüfe eine natürliche Komposition ohne leeren Mittelstreifen. Die exakte Bildmitte darf normal belegt sein.',
      `Prüfe die Lesbarkeit der weißen Untertitel mit dunkler Kontur exakt bei ${SUBTITLE_STYLE.verticalPositionPercent} Prozent Bildhöhe, ohne schwarze Hintergrundbox.`,
      'Ändert sich die Bilddatei, Narration, visuelle Idee, der Bildtext, Prompt oder die Bildwelt, wird eine frühere Freigabe automatisch auf pending zurückgesetzt.',
      'Nur vollständig bestandene Bilder mit konkreter Begründung erhalten status passed.'
    ],
    safeZones: rules.safeZones,
    subtitlePalette: rules.subtitlePalette,
    assets: assets.map((asset) => {
      const requiredChecks = requiredChecksForAsset(rules, asset.kind);
      const base = createReviewEntry(asset, requiredChecks);
      const previous = byId.get(asset.assetId);
      const previousStillValid = previous?.reviewFingerprint === asset.reviewFingerprint;
      if (!previousStillValid) return base;

      return {
        ...base,
        ...previous,
        expected: asset.expected,
        reviewFingerprint: asset.reviewFingerprint,
        checks: { ...base.checks, ...(previous.checks ?? {}) },
        assetId: asset.assetId,
        file: asset.file,
        kind: asset.kind
      };
    })
  };
  await writeJson(inspectionPath, next);
  return next;
}

function motionCropPercent(cameraMotion = {}) {
  const scale = Math.max(Number(cameraMotion.startScale ?? 1), Number(cameraMotion.endScale ?? 1), 1);
  const crop = ((1 - (1 / scale)) / 2) * 100;
  return {
    horizontal: crop + Math.abs(Number(cameraMotion.panXPercent ?? 0)),
    vertical: crop + Math.abs(Number(cameraMotion.panYPercent ?? 0))
  };
}

export async function runVisualQualityCheck(reelDirectory, { strict = false } = {}) {
  const rules = await readJson(path.resolve('config', 'visual-quality-rules.json'), null);
  if (!rules) throw new Error('config/visual-quality-rules.json wurde nicht gefunden.');

  const reel = await readJson(path.join(reelDirectory, 'reel.json'), {});
  const scenes = await readJson(path.join(reelDirectory, 'scenes', 'scene-index.json'), []);
  const manifest = await readJson(path.join(reelDirectory, 'assets-manifest.json'), { scenes: [], cover: {} });
  const effects = await readJson(path.join(reelDirectory, 'effects', 'effects-plan.json'), { scenes: [] });
  const subtitlePlan = await readJson(path.join(reelDirectory, 'subtitles', 'subtitle-plan.json'), {});
  const cover = await readJson(path.join(reelDirectory, 'cover', 'cover.json'), {});
  const coverPromptPath = path.join(reelDirectory, 'cover', 'cover-prompt.txt');
  const coverPrompt = await exists(coverPromptPath) ? (await readFile(coverPromptPath, 'utf8')).trim() : '';
  const statusPath = path.join(reelDirectory, 'status.json');
  const status = await readJson(statusPath, {});

  const effectByScene = new Map((effects.scenes ?? []).map((entry) => [entry.sceneId, entry]));
  const manifestByScene = new Map((manifest.scenes ?? []).map((entry) => [entry.sceneId, entry]));
  const assets = [];

  for (let index = 0; index < scenes.length; index += 1) {
    const scene = scenes[index];
    const promptPath = path.join(reelDirectory, 'scenes', scene.sceneId, 'image-prompt.txt');
    const imagePrompt = await exists(promptPath) ? (await readFile(promptPath, 'utf8')).trim() : '';
    assets.push({
      assetId: scene.sceneId,
      file: manifestByScene.get(scene.sceneId)?.expectedFile ?? `scenes/${scene.sceneId}/${scene.expectedImageFileName}`,
      kind: 'scene',
      scene,
      expected: {
        sceneId: scene.sceneId,
        order: scene.order,
        title: scene.title ?? '',
        narration: scene.narration ?? '',
        audioCue: scene.audioCue ?? '',
        visualIdea: scene.visualIdea ?? '',
        imageText: scene.imageText ?? '',
        imagePrompt,
        visualStyleId: reel.visualStyleId ?? '',
        visualStyleReason: reel.visualStyleReason ?? '',
        previousSceneId: scenes[index - 1]?.sceneId ?? null,
        nextSceneId: scenes[index + 1]?.sceneId ?? null
      }
    });
  }

  assets.push({
    assetId: 'cover',
    file: manifest.cover?.expectedFile ?? 'cover/cover.png',
    kind: 'cover',
    scene: null,
    expected: {
      headline: cover.headline ?? '',
      visualIdea: cover.visualIdea ?? '',
      imagePrompt: coverPrompt,
      visualStyleId: reel.visualStyleId ?? '',
      visualStyleReason: reel.visualStyleReason ?? '',
      reelTitle: reel.title ?? ''
    }
  });

  for (const asset of assets) {
    asset.reviewFingerprint = await buildReviewFingerprint(reelDirectory, asset);
  }

  const inspection = await ensureInspectionFile(reelDirectory, assets, rules, reel);
  const inspectionById = new Map(inspection.assets.map((entry) => [entry.assetId, entry]));
  const checks = [];
  const technicalAssets = [];
  const expectedRatio = rules.composition.width / rules.composition.height;

  const configuredSubtitleZone = rules.safeZones?.subtitleVerticalPercent ?? {};
  addCheck(checks, 'subtitle-safe-zone-config',
    Number(configuredSubtitleZone.min) === SUBTITLE_STYLE.safeVerticalRangePercent.min &&
    Number(configuredSubtitleZone.max) === SUBTITLE_STYLE.safeVerticalRangePercent.max &&
    Number(configuredSubtitleZone.default) === SUBTITLE_STYLE.verticalPositionPercent,
    `config/visual-quality-rules.json muss den zentralen Untertitelstandard von exakt ${SUBTITLE_STYLE.verticalPositionPercent} Prozent verwenden.`,
    'error');
  addCheck(checks, 'subtitle-palette-config',
    String(rules.subtitlePalette?.textColor ?? '').toUpperCase() === SUBTITLE_STYLE.textColor &&
    String(rules.subtitlePalette?.highlightColor ?? '').toUpperCase() === SUBTITLE_STYLE.highlightColor &&
    String(rules.subtitlePalette?.backgroundColor ?? '') === SUBTITLE_STYLE.backgroundColor,
    'config/visual-quality-rules.json muss die zentrale weiße Untertitelpalette verwenden.',
    'error');

  for (const asset of assets) {
    const filePath = path.join(reelDirectory, asset.file);
    const present = await exists(filePath);
    addCheck(checks, `${asset.assetId}-present`, present,
      `${asset.assetId}: Bilddatei fehlt (${asset.file}).`, strict ? 'error' : 'warning', asset.assetId);

    let metadata = null;
    if (present) {
      try {
        metadata = await readImageMetadata(filePath);
      } catch {
        metadata = null;
      }
    }

    addCheck(checks, `${asset.assetId}-metadata`, Boolean(metadata),
      `${asset.assetId}: Bildmaße oder Format konnten nicht gelesen werden.`, strict ? 'error' : 'warning', asset.assetId);

    if (metadata) {
      const supported = rules.supportedFormats.includes(metadata.format) || rules.supportedFormats.includes(metadata.extension);
      const ratioDifference = Math.abs(metadata.aspectRatio - expectedRatio);
      const minimumResolution = metadata.width >= rules.composition.minimumWidth && metadata.height >= rules.composition.minimumHeight;
      const targetResolution = metadata.width >= rules.composition.width && metadata.height >= rules.composition.height;

      addCheck(checks, `${asset.assetId}-format`, supported,
        `${asset.assetId}: Nicht unterstütztes Bildformat ${metadata.format}.`, 'error', asset.assetId);
      addCheck(checks, `${asset.assetId}-portrait`, metadata.height > metadata.width,
        `${asset.assetId}: Das Bild ist nicht im Hochformat.`, 'error', asset.assetId);
      addCheck(checks, `${asset.assetId}-aspect-ratio`, ratioDifference <= rules.composition.aspectRatioTolerance,
        `${asset.assetId}: Seitenverhältnis ist ${metadata.width}:${metadata.height} statt 9:16.`, strict ? 'error' : 'warning', asset.assetId);
      addCheck(checks, `${asset.assetId}-minimum-resolution`, minimumResolution,
        `${asset.assetId}: Mindestauflösung ${rules.composition.minimumWidth}×${rules.composition.minimumHeight} wird nicht erreicht.`, strict ? 'error' : 'warning', asset.assetId);
      addCheck(checks, `${asset.assetId}-target-resolution`, targetResolution,
        `${asset.assetId}: Empfohlen sind mindestens ${rules.composition.width}×${rules.composition.height} Pixel.`, 'warning', asset.assetId);
    }

    if (asset.kind === 'scene') {
      const effect = effectByScene.get(asset.assetId) ?? {};
      const crop = motionCropPercent(effect.cameraMotion);
      const horizontalLimit = Math.min(rules.safeZones.leftPercent, rules.safeZones.rightPercent);
      const verticalLimit = Math.min(rules.safeZones.topPercent, rules.safeZones.bottomPercent);
      addCheck(checks, `${asset.assetId}-motion-horizontal-safe`, crop.horizontal <= horizontalLimit,
        `${asset.assetId}: Zoom und horizontaler Schwenk können mehr als ${horizontalLimit}% Rand abschneiden.`, 'warning', asset.assetId);
      addCheck(checks, `${asset.assetId}-motion-vertical-safe`, crop.vertical <= verticalLimit,
        `${asset.assetId}: Zoom und vertikaler Schwenk können mehr als ${verticalLimit}% Rand abschneiden.`, 'warning', asset.assetId);
    }

    const inspectionEntry = inspectionById.get(asset.assetId);
    const requiredChecks = requiredChecksForAsset(rules, asset.kind);
    const manualPassed = allManualChecksPassed(inspectionEntry, requiredChecks);
    const evidencePassed = manualEvidencePassed(inspectionEntry, asset, rules);

    addCheck(checks, `${asset.assetId}-manual-review`, manualPassed,
      `${asset.assetId}: Manuelle visuelle Prüfpunkte sind noch nicht vollständig bestanden.`, strict ? 'error' : 'warning', asset.assetId);
    addCheck(checks, `${asset.assetId}-semantic-evidence`, evidencePassed,
      `${asset.assetId}: Sichtbare Bildbeschreibung, konkrete Zuordnungsbegründung oder zweite Szenenprüfung fehlt.`, strict ? 'error' : 'warning', asset.assetId);

    technicalAssets.push({
      assetId: asset.assetId,
      file: asset.file,
      kind: asset.kind,
      expected: asset.expected,
      reviewFingerprint: asset.reviewFingerprint,
      metadata,
      manualReviewStatus: inspectionEntry?.status ?? 'pending',
      semanticEvidencePassed: evidencePassed
    });
  }

  const subtitlePosition = Number(subtitlePlan.verticalPositionPercent ?? SUBTITLE_STYLE.verticalPositionPercent);
  addCheck(checks, 'subtitle-safe-zone',
    subtitlePosition >= SUBTITLE_STYLE.safeVerticalRangePercent.min && subtitlePosition <= SUBTITLE_STYLE.safeVerticalRangePercent.max,
    `Untertitelposition ${subtitlePosition}% muss exakt ${SUBTITLE_STYLE.verticalPositionPercent}% betragen.`,
    'error');

  const expectedTextColor = SUBTITLE_STYLE.textColor;
  const expectedHighlightColor = SUBTITLE_STYLE.highlightColor;
  const expectedBackgroundColor = SUBTITLE_STYLE.backgroundColor;
  const actualTextColor = String(subtitlePlan.textColor ?? '').toUpperCase();
  const actualHighlightColor = String(subtitlePlan.highlightColor ?? '').toUpperCase();
  const actualBackgroundColor = String(subtitlePlan.backgroundColor ?? '');
  addCheck(checks, 'subtitle-text-color', actualTextColor === expectedTextColor,
    `Untertitel-Normalfarbe muss ${expectedTextColor} sein.`, 'error');
  addCheck(checks, 'subtitle-highlight-color', actualHighlightColor === expectedHighlightColor,
    `Die Untertitelfarbe muss durchgehend ${expectedHighlightColor} sein.`, 'error');
  addCheck(checks, 'subtitle-colors-uniform', actualTextColor !== actualHighlightColor,
    'Untertitel und Highlight müssen unterschiedliche Farben haben.', 'error');
  addCheck(checks, 'subtitle-highlight-enabled', subtitlePlan.highlightCurrentWord === true,
    'Die Wortmarkierung muss aktiviert sein.', 'error');
  addCheck(checks, 'subtitle-background-transparent', actualBackgroundColor === expectedBackgroundColor,
    'Der Untertitelhintergrund muss transparent sein.', 'error');

  const errors = checks.filter((check) => !check.passed && check.level === 'error');
  const warnings = checks.filter((check) => !check.passed && check.level === 'warning');
  const report = {
    createdAt: new Date().toISOString(),
    strict,
    passed: errors.length === 0,
    visualStyleId: reel.visualStyleId ?? '',
    safeZones: rules.safeZones,
    subtitlePalette: rules.subtitlePalette,
    summary: {
      assetsChecked: technicalAssets.length,
      passedChecks: checks.filter((check) => check.passed).length,
      failedChecks: errors.length,
      warnings: warnings.length,
      totalChecks: checks.length
    },
    assets: technicalAssets,
    checks
  };

  await writeJson(path.join(reelDirectory, 'review', 'visual-quality-report.json'), report);
  status.visualQuality = report.passed ? (strict ? 'passed' : 'technical-passed') : 'needs-review';
  status.qualityControl = report.passed && strict ? 'visual-passed' : status.qualityControl;
  await writeJson(statusPath, status);
  return report;
}
