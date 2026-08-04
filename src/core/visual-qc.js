import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { readImageMetadata } from './image-metadata.js';

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

function allManualChecksPassed(entry, requiredChecks) {
  return entry?.status === 'passed' && requiredChecks.every((key) => entry?.checks?.[key] === true);
}

function createReviewEntry(assetId, file, requiredChecks) {
  return {
    assetId,
    file,
    reviewer: '',
    reviewedAt: null,
    status: 'pending',
    checks: Object.fromEntries(requiredChecks.map((key) => [key, null])),
    notes: []
  };
}

async function ensureInspectionFile(reelDirectory, assets, rules) {
  const inspectionPath = path.join(reelDirectory, 'review', 'visual-inspection.json');
  const current = await readJson(inspectionPath, null);
  const byId = new Map((current?.assets ?? []).map((entry) => [entry.assetId, entry]));
  const next = {
    version: 3,
    instructions: [
      'Codex betrachtet jedes Bild visuell und setzt jeden Prüfpunkt auf true oder false.',
      'Bei einem Fehler status auf needs-fix setzen und eine konkrete Notiz ergänzen.',
      'Prüfe eine natürliche durchgehende Komposition ohne leeren Mittelstreifen oder künstlich getrennte obere und untere Bildhälfte.',
      'Prüfe, dass keine unerwünschten lesbaren Wörter oder englischen Labels im Bild stehen.',
      'Prüfe die Lesbarkeit der weißen Untertitel mit dunkler Kontur bei 76 Prozent Bildhöhe, ohne schwarze Hintergrundbox.',
      'Nur vollständig bestandene Bilder erhalten status passed.'
    ],
    safeZones: rules.safeZones,
    subtitlePalette: rules.subtitlePalette,
    assets: assets.map(({ assetId, file }) => {
      const base = createReviewEntry(assetId, file, rules.manualChecks);
      const previous = byId.get(assetId) ?? {};
      return {
        ...base,
        ...previous,
        checks: {
          ...base.checks,
          ...(previous.checks ?? {})
        },
        assetId,
        file
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

  const scenes = await readJson(path.join(reelDirectory, 'scenes', 'scene-index.json'), []);
  const manifest = await readJson(path.join(reelDirectory, 'assets-manifest.json'), { scenes: [], cover: {} });
  const effects = await readJson(path.join(reelDirectory, 'effects', 'effects-plan.json'), { scenes: [] });
  const subtitlePlan = await readJson(path.join(reelDirectory, 'subtitles', 'subtitle-plan.json'), {});
  const statusPath = path.join(reelDirectory, 'status.json');
  const status = await readJson(statusPath, {});

  const effectByScene = new Map((effects.scenes ?? []).map((entry) => [entry.sceneId, entry]));
  const manifestByScene = new Map((manifest.scenes ?? []).map((entry) => [entry.sceneId, entry]));
  const assets = scenes.map((scene) => ({
    assetId: scene.sceneId,
    file: manifestByScene.get(scene.sceneId)?.expectedFile ?? `scenes/${scene.sceneId}/${scene.expectedImageFileName}`,
    kind: 'scene',
    scene
  }));
  assets.push({
    assetId: 'cover',
    file: manifest.cover?.expectedFile ?? 'cover/cover.png',
    kind: 'cover',
    scene: null
  });

  const inspection = await ensureInspectionFile(reelDirectory, assets, rules);
  const inspectionById = new Map(inspection.assets.map((entry) => [entry.assetId, entry]));
  const checks = [];
  const technicalAssets = [];
  const expectedRatio = rules.composition.width / rules.composition.height;

  for (const asset of assets) {
    const filePath = path.join(reelDirectory, asset.file);
    const present = await exists(filePath);
    addCheck(
      checks,
      `${asset.assetId}-present`,
      present,
      `${asset.assetId}: Bilddatei fehlt (${asset.file}).`,
      strict ? 'error' : 'warning',
      asset.assetId
    );

    let metadata = null;
    if (present) {
      try {
        metadata = await readImageMetadata(filePath);
      } catch {
        metadata = null;
      }
    }

    addCheck(
      checks,
      `${asset.assetId}-metadata`,
      Boolean(metadata),
      `${asset.assetId}: Bildmaße oder Format konnten nicht gelesen werden.`,
      strict ? 'error' : 'warning',
      asset.assetId
    );

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

    const manualPassed = allManualChecksPassed(inspectionById.get(asset.assetId), rules.manualChecks);
    addCheck(
      checks,
      `${asset.assetId}-manual-review`,
      manualPassed,
      `${asset.assetId}: Manuelle visuelle Prüfung ist noch nicht vollständig bestanden.`,
      strict ? 'error' : 'warning',
      asset.assetId
    );

    technicalAssets.push({
      assetId: asset.assetId,
      file: asset.file,
      kind: asset.kind,
      metadata,
      manualReviewStatus: inspectionById.get(asset.assetId)?.status ?? 'pending'
    });
  }

  const subtitlePosition = Number(subtitlePlan.verticalPositionPercent ?? rules.safeZones.subtitleVerticalPercent.default);
  addCheck(checks, 'subtitle-safe-zone',
    subtitlePosition >= rules.safeZones.subtitleVerticalPercent.min && subtitlePosition <= rules.safeZones.subtitleVerticalPercent.max,
    `Untertitelposition ${subtitlePosition}% liegt außerhalb der sicheren Zone ${rules.safeZones.subtitleVerticalPercent.min}–${rules.safeZones.subtitleVerticalPercent.max}%.`,
    'error');

  const expectedTextColor = String(rules.subtitlePalette?.textColor ?? '').toUpperCase();
  const expectedHighlightColor = String(rules.subtitlePalette?.highlightColor ?? '').toUpperCase();
  const expectedBackgroundColor = String(rules.subtitlePalette?.backgroundColor ?? '');
  const actualTextColor = String(subtitlePlan.textColor ?? '').toUpperCase();
  const actualHighlightColor = String(subtitlePlan.highlightColor ?? '').toUpperCase();
  const actualBackgroundColor = String(subtitlePlan.backgroundColor ?? '');
  addCheck(checks, 'subtitle-text-color', actualTextColor === expectedTextColor,
    `Untertitel-Normalfarbe muss ${expectedTextColor} sein.`, 'error');
  addCheck(checks, 'subtitle-highlight-color', actualHighlightColor === expectedHighlightColor,
    `Die Untertitelfarbe muss durchgehend ${expectedHighlightColor} sein.`, 'error');
  addCheck(checks, 'subtitle-colors-uniform', actualTextColor === actualHighlightColor,
    'Alle Untertitelwörter müssen dieselbe weiße Farbe verwenden.', 'error');
  addCheck(checks, 'subtitle-highlight-disabled', subtitlePlan.highlightCurrentWord === false,
    'Die gelbe Wortmarkierung muss deaktiviert sein.', 'error');
  addCheck(checks, 'subtitle-background-transparent', actualBackgroundColor === expectedBackgroundColor,
    'Der Untertitelhintergrund muss transparent sein.', 'error');

  const errors = checks.filter((check) => !check.passed && check.level === 'error');
  const warnings = checks.filter((check) => !check.passed && check.level === 'warning');
  const report = {
    createdAt: new Date().toISOString(),
    strict,
    passed: errors.length === 0,
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
  status.visualQuality = report.passed
    ? (strict ? 'passed' : 'technical-passed')
    : 'needs-review';
  status.qualityControl = report.passed && strict ? 'visual-passed' : status.qualityControl;
  await writeJson(statusPath, status);
  return report;
}
