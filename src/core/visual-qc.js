import { createHash } from 'node:crypto';
import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { readImageMetadata } from './image-metadata.js';
import { flattenSceneImagePhases } from '../shared/visual-moments.js';

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

async function buildReviewFingerprint(reelDirectory, asset) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify({
    assetId: asset.assetId,
    file: asset.file,
    kind: asset.kind,
    expected: asset.expected
  }));

  const filePath = path.join(reelDirectory, asset.file);
  if (await exists(filePath)) hash.update(await readFile(filePath));
  else hash.update('[missing-file]');
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
    checks: Object.fromEntries(requiredChecks.map((key) => [key, null])),
    notes: []
  };
}

async function ensureInspectionFile(reelDirectory, assets, rules, reel) {
  const inspectionPath = path.join(reelDirectory, 'review', 'visual-inspection.json');
  const current = await readJson(inspectionPath, null);
  const byId = new Map((current?.assets ?? []).map((entry) => [entry.assetId, entry]));
  const next = {
    version: 12,
    mode: 'single-pass-fast',
    imageCountMode: reel.imageCountMode ?? 'legacy-one-image-per-scene',
    plannedImageCount: assets.filter((asset) => asset.kind === 'scene').length,
    subtitlesEnabled: false,
    instructions: [
      'Nur ein schneller Sichtdurchgang: Bildnummer/Reihenfolge, grober Satzbezug, feste Serious-Minimal-Countryball-Welt und geplanter deutscher Text.',
      'Keine schriftliche Bildbeschreibung, keine Match-Begründung und kein zweiter Prüfpass pro Bild erforderlich.',
      'Nummerierte Bilder gelten chronologisch als autoritativ, solange kein offensichtlicher Inhaltskonflikt sichtbar ist.',
      'Setze status nur auf failed, wenn ein echter Hard Fail sichtbar ist: falscher Inhalt, falsche Reihenfolge, klarer Stilbruch oder falscher Pflichttext.',
      'Warnungen zu kleinen ästhetischen Unterschieden blockieren Phase 3 nicht.'
    ],
    safeZones: rules.safeZones,
    assets: assets.map((asset) => {
      const requiredChecks = requiredChecksForAsset(rules, asset.kind);
      const base = createReviewEntry(asset, requiredChecks);
      const previous = byId.get(asset.assetId);
      if (previous?.reviewFingerprint !== asset.reviewFingerprint) return base;
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

function explicitlyRejected(entry) {
  if (entry?.status === 'failed') return true;
  const checks = entry?.checks ?? {};
  return Object.values(checks).some((value) => value === false);
}

export async function runVisualQualityCheck(reelDirectory, { strict = false } = {}) {
  const rules = await readJson(path.resolve('config', 'visual-quality-rules.json'), null);
  if (!rules) throw new Error('config/visual-quality-rules.json wurde nicht gefunden.');

  const reel = await readJson(path.join(reelDirectory, 'reel.json'), {});
  const scenes = await readJson(path.join(reelDirectory, 'scenes', 'scene-index.json'), []);
  const manifest = await readJson(path.join(reelDirectory, 'assets-manifest.json'), { visuals: [], scenes: [] });
  const effects = await readJson(path.join(reelDirectory, 'effects', 'effects-plan.json'), { scenes: [] });
  const statusPath = path.join(reelDirectory, 'status.json');
  const status = await readJson(statusPath, {});

  const effectByScene = new Map((effects.scenes ?? []).map((entry) => [entry.sceneId, entry]));
  const manifestByVisual = new Map((manifest.visuals ?? []).map((entry) => [entry.targetId, entry]));
  const manifestByScene = new Map((manifest.scenes ?? []).map((entry) => [entry.sceneId, entry]));
  const flattened = flattenSceneImagePhases(scenes);
  const assets = [];

  for (let index = 0; index < flattened.length; index += 1) {
    const phase = flattened[index];
    const scene = scenes.find((entry) => entry.sceneId === phase.sceneId) ?? {};
    const promptPath = path.join(reelDirectory, 'scenes', phase.sceneId, phase.promptFileName);
    const imagePrompt = await exists(promptPath) ? (await readFile(promptPath, 'utf8')).trim() : '';
    const manifestVisual = manifestByVisual.get(phase.targetId) ?? (phase.primary ? manifestByScene.get(phase.sceneId) : null) ?? {};
    assets.push({
      assetId: phase.targetId,
      file: manifestVisual.expectedFile ?? `scenes/${phase.sceneId}/${phase.expectedImageFileName}`,
      kind: 'scene',
      parentSceneId: phase.sceneId,
      expected: {
        targetId: phase.targetId,
        sceneId: phase.sceneId,
        order: phase.sceneOrder,
        phaseId: phase.phaseId,
        phaseOrder: phase.phaseOrder,
        startPercent: phase.startPercent,
        title: phase.sceneTitle ?? '',
        narration: phase.narration ?? '',
        audioCue: phase.audioCue ?? '',
        visualIdea: phase.visualIdea || phase.sceneVisualIdea || '',
        imageText: phase.imageText || phase.sceneImageText || '',
        imagePrompt,
        previousTargetId: flattened[index - 1]?.targetId ?? null,
        nextTargetId: flattened[index + 1]?.targetId ?? null
      }
    });
  }

  for (const asset of assets) asset.reviewFingerprint = await buildReviewFingerprint(reelDirectory, asset);

  const inspection = await ensureInspectionFile(reelDirectory, assets, rules, reel);
  const inspectionById = new Map(inspection.assets.map((entry) => [entry.assetId, entry]));
  const checks = [];
  const technicalAssets = [];
  const expectedRatio = rules.composition.width / rules.composition.height;

  addCheck(checks, 'subtitles-disabled-config', rules.subtitlesEnabled === false,
    'config/visual-quality-rules.json muss Untertitel explizit deaktivieren.', 'error');
  addCheck(checks, 'reel-subtitles-disabled', reel.subtitlesEnabled === false,
    'reel.json muss Untertitel für den aktuellen Produktionsstandard deaktivieren.', 'error');
  addCheck(checks, 'visual-count-match', assets.filter((asset) => asset.kind === 'scene').length === flattened.length,
    'Die visuelle QC muss jede geplante Bildphase prüfen.', 'error');

  for (const asset of assets) {
    const filePath = path.join(reelDirectory, asset.file);
    const present = await exists(filePath);
    addCheck(checks, `${asset.assetId}-present`, present,
      `${asset.assetId}: Bilddatei fehlt (${asset.file}).`, strict ? 'error' : 'warning', asset.assetId);

    let metadata = null;
    if (present) {
      try { metadata = await readImageMetadata(filePath); } catch { metadata = null; }
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

    const effect = effectByScene.get(asset.parentSceneId) ?? {};
    const crop = motionCropPercent(effect.cameraMotion);
    const horizontalLimit = Math.min(rules.safeZones.leftPercent, rules.safeZones.rightPercent);
    const verticalLimit = Math.min(rules.safeZones.topPercent, rules.safeZones.bottomPercent);
    addCheck(checks, `${asset.assetId}-motion-horizontal-safe`, crop.horizontal <= horizontalLimit,
      `${asset.assetId}: Zoom und horizontaler Schwenk können mehr als ${horizontalLimit}% Rand abschneiden.`, 'warning', asset.assetId);
    addCheck(checks, `${asset.assetId}-motion-vertical-safe`, crop.vertical <= verticalLimit,
      `${asset.assetId}: Zoom und vertikaler Schwenk können mehr als ${verticalLimit}% Rand abschneiden.`, 'warning', asset.assetId);

    const inspectionEntry = inspectionById.get(asset.assetId);
    const rejected = explicitlyRejected(inspectionEntry);
    addCheck(checks, `${asset.assetId}-explicit-visual-rejection`, !rejected,
      `${asset.assetId}: Der schnelle Sichtcheck hat einen echten visuellen Hard Fail markiert.`, 'error', asset.assetId);

    technicalAssets.push({
      assetId: asset.assetId,
      file: asset.file,
      kind: asset.kind,
      parentSceneId: asset.parentSceneId,
      expected: asset.expected,
      reviewFingerprint: asset.reviewFingerprint,
      metadata,
      quickReviewStatus: inspectionEntry?.status ?? 'pending',
      manualEvidenceRequired: false
    });
  }

  const errors = checks.filter((check) => !check.passed && check.level === 'error');
  const warnings = checks.filter((check) => !check.passed && check.level === 'warning');
  const report = {
    version: 12,
    createdAt: new Date().toISOString(),
    strict,
    mode: 'single-pass-fast',
    passed: errors.length === 0,
    imageCountMode: reel.imageCountMode ?? 'legacy-one-image-per-scene',
    plannedImageCount: flattened.length,
    subtitlesEnabled: false,
    safeZones: rules.safeZones,
    summary: {
      assetsChecked: technicalAssets.length,
      sceneImagesChecked: technicalAssets.filter((asset) => asset.kind === 'scene').length,
      passedChecks: checks.filter((check) => check.passed).length,
      failedChecks: errors.length,
      warnings: warnings.length,
      totalChecks: checks.length
    },
    assets: technicalAssets,
    checks
  };

  await writeJson(path.join(reelDirectory, 'review', 'visual-quality-report.json'), report);
  status.subtitles = 'disabled';
  status.wordSync = 'not-required';
  status.plannedImageCount = flattened.length;
  status.visualQuality = report.passed ? (strict ? 'passed-fast' : 'technical-passed') : 'needs-review';
  status.qualityControl = report.passed && strict ? 'visual-fast-passed' : status.qualityControl;
  await writeJson(statusPath, status);
  return report;
}
