#!/usr/bin/env node

import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function exists(filePath) {
  return access(filePath).then(() => true).catch(() => false);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function partInfo(partId, imageCount) {
  const start = (partId - 1) * 10 + 1;
  const end = Math.min(partId * 10, imageCount);
  const prefix = `${pad(partId)}_part-bilder-${pad(start)}-bis-${pad(end)}`;
  return { partId, start, end, prefix };
}

async function listFiles(directory) {
  if (!(await exists(directory))) return [];
  return (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
}

async function main() {
  const rawDir = arg('--dir');
  if (!rawDir) {
    console.error('Nutzung: npm run validate:youtube-pacing-v2 -- --dir "youtube/<woche>/<thema>"');
    process.exitCode = 1;
    return;
  }

  const projectDir = path.resolve(rawDir);
  const metaPath = path.join(projectDir, '99-technik', 'video.json');

  if (!(await exists(metaPath))) {
    console.error('BLOCKER: 99-technik/video.json fehlt.');
    process.exitCode = 1;
    return;
  }

  const meta = await readJson(metaPath);
  const rulesVersion = numberOrNull(meta.productionRulesVersion) ?? 1;

  // Absichtlich grandfathered: alte Projekte werden durch V2 nicht rückwirkend verändert.
  if (rulesVersion < 2) {
    console.log(`Adaptive Pacing V2: SKIP — productionRulesVersion=${rulesVersion}. Bestehendes V1-Projekt bleibt unverändert.`);
    return;
  }

  const errors = [];
  const warnings = [];
  const mappingPath = path.join(projectDir, '99-technik', 'BILD_AUDIO_ZUORDNUNG.json');
  const timelinePath = path.join(projectDir, '99-technik', 'FINAL_TIMELINE.json');

  if (!(await exists(mappingPath))) errors.push('BILD_AUDIO_ZUORDNUNG.json fehlt.');
  if (!(await exists(timelinePath))) errors.push('FINAL_TIMELINE.json fehlt.');

  if (errors.length) {
    console.error(`Adaptive Pacing V2: FEHLGESCHLAGEN (${errors.length} Blocker)`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exitCode = 1;
    return;
  }

  const mapping = await readJson(mappingPath);
  const timelineJson = await readJson(timelinePath);
  const images = Array.isArray(mapping.images) ? mapping.images : [];
  const timeline = Array.isArray(timelineJson.images) ? timelineJson.images : [];

  if (!images.length) errors.push('Mapping enthält keine Videobilder.');
  if (timeline.length !== images.length) {
    errors.push(`FINAL_TIMELINE enthält ${timeline.length} Bilder, Mapping aber ${images.length}.`);
  }

  const imageCount = images.length;
  const expectedParts = Math.ceil(imageCount / 10);
  const scriptDir = path.join(projectDir, '01-voice-script');
  const audioDir = path.join(projectDir, '02-audio');
  const scriptFiles = await listFiles(scriptDir);
  const audioFiles = await listFiles(audioDir);

  if (!scriptFiles.includes('voice-script.txt')) {
    errors.push('01-voice-script/voice-script.txt fehlt.');
  }

  for (let partId = 1; partId <= expectedParts; partId += 1) {
    const info = partInfo(partId, imageCount);
    const scriptName = `${info.prefix}.txt`;
    if (!scriptFiles.includes(scriptName)) {
      errors.push(`Script-Part fehlt: 01-voice-script/${scriptName}`);
    }

    const matchingAudio = audioFiles.filter((name) => name.startsWith(`${info.prefix}.`) && !name.endsWith('.txt'));
    if (matchingAudio.length === 0) {
      errors.push(`Audio-Part fehlt für ${info.prefix}.`);
    } else if (matchingAudio.length > 1) {
      errors.push(`Mehrere Audio-Parts für ${info.prefix} gefunden: ${matchingAudio.join(', ')}`);
    }
  }

  for (let index = 0; index < images.length; index += 1) {
    const item = images[index];
    const imageNumber = Number(item.imageNumber);
    const expectedImageNumber = index + 1;
    if (imageNumber !== expectedImageNumber) {
      errors.push(`Bildfolge: Position ${index + 1} erwartet Bild ${expectedImageNumber}, gefunden ${item.imageNumber}.`);
      continue;
    }

    const expectedPartId = Math.ceil(imageNumber / 10);
    const info = partInfo(expectedPartId, imageCount);
    const audioPartId = numberOrNull(item.audioPartId);
    if (audioPartId !== expectedPartId) {
      errors.push(`Bild ${imageNumber}: audioPartId muss ${expectedPartId} sein, ist ${item.audioPartId ?? 'fehlend'}.`);
    }

    const expectedScriptPart = `01-voice-script/${info.prefix}.txt`;
    if (String(item.scriptPartFile ?? '') !== expectedScriptPart) {
      errors.push(`Bild ${imageNumber}: scriptPartFile muss ${expectedScriptPart} sein.`);
    }

    const audioPartFile = String(item.audioPartFile ?? '');
    if (!audioPartFile.startsWith(`02-audio/${info.prefix}.`)) {
      errors.push(`Bild ${imageNumber}: audioPartFile muss zum Part ${info.prefix} gehören.`);
    }
  }

  const pacing = meta.adaptivePacing ?? {};
  const hardMax = numberOrNull(pacing.hardMaximumExclusiveSeconds) ?? 20;
  const reviewFrom = numberOrNull(pacing.reviewFromSeconds) ?? 14;
  const strongReviewFrom = numberOrNull(pacing.strongSplitReviewFromSeconds) ?? 16;
  const shortReview = numberOrNull(pacing.reviewIfShorterThanSeconds) ?? 4;

  for (const item of timeline) {
    const start = numberOrNull(item.startSeconds);
    const end = numberOrNull(item.endSeconds);
    const imageNumber = Number(item.imageNumber);
    if (start === null || end === null || end <= start) {
      errors.push(`Bild ${imageNumber}: ungültige Timeline-Zeiten.`);
      continue;
    }
    const hold = end - start;
    if (hold >= hardMax) {
      errors.push(`Bild ${imageNumber}: Hold ${hold.toFixed(2)} s >= ${hardMax.toFixed(2)} s. V2-Hard-Fail: Bild muss aufgeteilt werden.`);
    } else if (hold >= strongReviewFrom) {
      warnings.push(`Bild ${imageNumber}: Hold ${hold.toFixed(2)} s — starke Split-Prüfung erforderlich.`);
    } else if (hold >= reviewFrom) {
      warnings.push(`Bild ${imageNumber}: Hold ${hold.toFixed(2)} s — bewusst prüfen, ob ein weiterer visueller Moment sinnvoll ist.`);
    } else if (hold < shortReview) {
      warnings.push(`Bild ${imageNumber}: Hold ${hold.toFixed(2)} s — auf unnötig hektischen Wechsel prüfen.`);
    }
  }

  if (warnings.length) {
    console.warn(`Adaptive Pacing V2: ${warnings.length} Hinweis(e)`);
    for (const warning of warnings) console.warn(`  - ${warning}`);
  }

  if (errors.length) {
    console.error(`Adaptive Pacing V2: FEHLGESCHLAGEN (${errors.length} Blocker)`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Adaptive Pacing V2: BESTANDEN — ${imageCount} Bilder, ${expectedParts} Script-/Audio-Part(s), kein Hold >= ${hardMax.toFixed(2)} s.`);
}

main().catch((error) => {
  console.error(`Adaptive Pacing V2 Fehler: ${error.message}`);
  process.exitCode = 1;
});
