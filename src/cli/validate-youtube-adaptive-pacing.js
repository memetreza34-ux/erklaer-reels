#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';
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

const COMPLEXITY_RANGES = Object.freeze({
  A: [4, 5],
  B: [5, 7],
  C: [7, 9],
  D: [9, 12],
  E: [12, 15]
});

async function main() {
  const rawDir = arg('--dir');
  if (!rawDir) {
    console.error('Nutzung: npm run validate:youtube-pacing-v2 -- --dir "youtube/<woche>/<thema>"');
    process.exitCode = 1;
    return;
  }

  const projectDir = path.resolve(rawDir);
  const techDir = path.join(projectDir, '99-technik');
  const metaPath = path.join(techDir, 'video.json');

  if (!(await exists(metaPath))) {
    console.error('BLOCKER: 99-technik/video.json fehlt.');
    process.exitCode = 1;
    return;
  }

  const meta = await readJson(metaPath);
  const rulesVersion = numberOrNull(meta.productionRulesVersion) ?? 1;
  if (rulesVersion < 2) {
    console.log(`Adaptive Pacing V2: SKIP — productionRulesVersion=${rulesVersion}. Bestehendes V1-Projekt bleibt unverändert.`);
    return;
  }

  const errors = [];
  const warnings = [];
  const mappingPath = path.join(techDir, 'BILD_AUDIO_ZUORDNUNG.json');
  const timelinePath = path.join(techDir, 'FINAL_TIMELINE.json');
  const masterScriptPath = path.join(projectDir, '01-voice-script', 'voice-script.txt');

  if (!(await exists(mappingPath))) errors.push('BILD_AUDIO_ZUORDNUNG.json fehlt.');
  if (!(await exists(timelinePath))) errors.push('FINAL_TIMELINE.json fehlt.');
  if (!(await exists(masterScriptPath))) errors.push('01-voice-script/voice-script.txt fehlt. Neue V2-Projekte verwenden ein Gesamtskript.');

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

  for (let index = 0; index < images.length; index += 1) {
    const item = images[index];
    const imageNumber = Number(item.imageNumber);
    const expectedImageNumber = index + 1;
    if (imageNumber !== expectedImageNumber) {
      errors.push(`Bildfolge: Position ${index + 1} erwartet Bild ${expectedImageNumber}, gefunden ${item.imageNumber}.`);
      continue;
    }

    const level = String(item.complexityLevel ?? '').toUpperCase();
    if (!COMPLEXITY_RANGES[level]) {
      errors.push(`Bild ${imageNumber}: complexityLevel A–E fehlt oder ist ungültig.`);
      continue;
    }
    if (!String(item.complexityReason ?? '').trim()) {
      errors.push(`Bild ${imageNumber}: complexityReason fehlt.`);
    }
    const planned = numberOrNull(item.plannedHoldSeconds);
    if (planned === null) {
      errors.push(`Bild ${imageNumber}: plannedHoldSeconds fehlt.`);
    } else {
      const [min, max] = COMPLEXITY_RANGES[level];
      if (planned < min || planned > max) {
        errors.push(`Bild ${imageNumber}: geplante ${planned.toFixed(2)} s passen nicht zu Klasse ${level} (${min}–${max} s).`);
      }
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

  console.log(`Adaptive Pacing V2: BESTANDEN — ${images.length} Bilder, A–E-Planung vollständig, kein Hold >= ${hardMax.toFixed(2)} s.`);
  console.log('Sichtbare Script-/Audio-Parts sind nicht erforderlich; technische Segmentierung bleibt intern.');
}

main().catch((error) => {
  console.error(`Adaptive Pacing V2 Fehler: ${error.message}`);
  process.exitCode = 1;
});
