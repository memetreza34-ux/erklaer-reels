#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { validateYoutubeAlignmentEvidence } from '../core/youtube-audio-alignment.js';

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

function ffprobeDuration(filePath) {
  const result = spawnSync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', filePath
  ], { encoding: 'utf8' });
  if (result.error) throw new Error(`ffprobe konnte nicht gestartet werden: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`ffprobe konnte ${filePath} nicht lesen: ${result.stderr?.trim() || 'unbekannter Fehler'}`);
  const duration = Number(result.stdout.trim());
  if (!Number.isFinite(duration) || duration <= 0) throw new Error(`Ungültige Mediendauer für ${filePath}.`);
  return duration;
}

function numeric(value) {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function sameDurationShare(durations, tolerance = 0.12) {
  if (durations.length < 10) return 0;
  let max = 0;
  for (const pivot of durations) {
    max = Math.max(max, durations.filter((value) => Math.abs(value - pivot) <= tolerance).length);
  }
  return max / durations.length;
}

function runV2PacingGate(projectDir) {
  const result = spawnSync(process.execPath, ['src/cli/validate-youtube-adaptive-pacing.js', '--dir', projectDir], {
    encoding: 'utf8'
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return result.status === 0;
}

async function main() {
  const rawDir = arg('--dir');
  if (!rawDir) {
    console.error('Nutzung: npm run validate:youtube-phase3 -- --dir "youtube/<woche>/<thema>" [--post-render]');
    process.exitCode = 1;
    return;
  }

  const projectDir = path.resolve(rawDir);
  const techDir = path.join(projectDir, '99-technik');
  const mappingPath = path.join(techDir, 'BILD_AUDIO_ZUORDNUNG.json');
  const timelinePath = path.join(techDir, 'FINAL_TIMELINE.json');
  const videoMetaPath = path.join(techDir, 'video.json');
  const errors = [];

  if (!(await exists(mappingPath))) {
    errors.push('BILD_AUDIO_ZUORDNUNG.json fehlt. Render ist blockiert.');
    console.error(`BLOCKER: ${errors[0]}`);
    process.exitCode = 1;
    return;
  }

  const mapping = await readJson(mappingPath);
  const images = Array.isArray(mapping.images) ? mapping.images : [];
  if (!images.length) errors.push('Mapping enthält keine Videobilder.');

  const expectedFirst = Number(mapping.videoFirstImageNumber ?? 1);
  const expectedLast = Number(mapping.videoLastImageNumber ?? images.length);
  const expectedCount = expectedLast - expectedFirst + 1;
  if (images.length !== expectedCount) errors.push(`Mapping erwartet ${expectedCount} Bilder, enthält aber ${images.length}.`);
  if (mapping.thumbnailImageNumber !== 0 || mapping.rules?.image00ExcludedFromTimeline !== true) {
    errors.push('Bild 00 muss als Thumbnail markiert und aus der Timeline ausgeschlossen sein.');
  }

  let plannedImageCount = null;
  let productionRulesVersion = 1;
  if (await exists(videoMetaPath)) {
    const meta = await readJson(videoMetaPath);
    plannedImageCount = numeric(meta.plannedImageCount);
    productionRulesVersion = numeric(meta.productionRulesVersion) ?? 1;
    if (plannedImageCount !== null && plannedImageCount !== images.length) {
      errors.push(`video.json plant ${plannedImageCount} Videobilder, Mapping enthält ${images.length}.`);
    }
  }

  const minConfidence = numeric(mapping.alignmentConfidenceMinimum) ?? 0.95;
  const cutLead = numeric(mapping.cutLeadSecondsDefault) ?? 0.08;
  const durations = [];

  for (let index = 0; index < images.length; index += 1) {
    const item = images[index];
    const expectedNumber = expectedFirst + index;
    if (Number(item.imageNumber) !== expectedNumber) {
      errors.push(`Bildfolge beschädigt: Position ${index + 1} muss Bild ${expectedNumber} sein, ist aber ${item.imageNumber}.`);
    }
    const start = numeric(item.actualStartSeconds);
    const end = numeric(item.actualEndSeconds);
    const confidence = numeric(item.alignmentConfidence);
    if (start === null) errors.push(`Bild ${expectedNumber}: actualStartSeconds ist nicht gesetzt.`);
    if (end === null) errors.push(`Bild ${expectedNumber}: actualEndSeconds ist nicht gesetzt.`);
    if (confidence === null) errors.push(`Bild ${expectedNumber}: alignmentConfidence ist nicht gesetzt.`);
    else if (confidence < minConfidence) errors.push(`Bild ${expectedNumber}: alignmentConfidence ${confidence} < ${minConfidence}.`);
    if (start !== null && end !== null) {
      if (end <= start) errors.push(`Bild ${expectedNumber}: Ende (${end}) liegt nicht nach Start (${start}).`);
      else durations.push(end - start);
    }
    if (!String(item.startAnchor ?? '').trim()) errors.push(`Bild ${expectedNumber}: startAnchor fehlt.`);
    if (index < images.length - 1 && !String(item.endAnchor ?? '').trim()) errors.push(`Bild ${expectedNumber}: endAnchor fehlt.`);

    const folder = String(item.batchFolder ?? '').trim();
    const imageFile = String(item.imageFile ?? `Bild ${String(expectedNumber).padStart(2, '0')}.png`).trim();
    if (!folder) errors.push(`Bild ${expectedNumber}: batchFolder fehlt.`);
    else if (!(await exists(path.join(projectDir, '00-bildprompts', folder, imageFile)))) {
      errors.push(`Bild ${expectedNumber}: Asset fehlt unter 00-bildprompts/${folder}/${imageFile}.`);
    }
  }

  for (let index = 0; index < images.length - 1; index += 1) {
    const currentStart = numeric(images[index].actualStartSeconds);
    const currentEnd = numeric(images[index].actualEndSeconds);
    const nextStart = numeric(images[index + 1].actualStartSeconds);
    if (currentEnd !== null && nextStart !== null && Math.abs(currentEnd - nextStart) > 0.20) {
      errors.push(`Mapping-Lücke/Überlappung zwischen Bild ${images[index].imageNumber} und ${images[index + 1].imageNumber}: ${currentEnd} vs ${nextStart}.`);
    }
    if (currentStart !== null && nextStart !== null && nextStart <= currentStart) {
      errors.push(`Startzeiten sind bei Bild ${images[index + 1].imageNumber} nicht streng aufsteigend.`);
    }
  }

  const uniformShare = sameDurationShare(durations);
  if (uniformShare >= 0.70) errors.push(`${Math.round(uniformShare * 100)} % der Bildbereiche haben nahezu dieselbe Dauer. Starre Slideshow ist blockiert.`);

  const evidence = await validateYoutubeAlignmentEvidence(projectDir, mapping);
  if (!evidence.passed) {
    for (const error of evidence.errors) errors.push(`Audio-Messbeleg: ${error}`);
  }

  const audioRelative = String(mapping.audioMasterFile ?? evidence.evidence?.masterAudioFile ?? '').trim();
  const audioPath = audioRelative ? path.join(projectDir, audioRelative) : null;
  let audioDuration = null;
  if (!audioPath || !(await exists(audioPath))) {
    errors.push('Gemessene Master-Audiodatei fehlt. Erst auto-align:youtube ausführen.');
  } else {
    try {
      audioDuration = ffprobeDuration(audioPath);
      const lastEnd = numeric(images.at(-1)?.actualEndSeconds);
      if (lastEnd !== null && Math.abs(lastEnd - audioDuration) > 0.75) {
        errors.push(`Letztes Mapping-Ende (${lastEnd.toFixed(3)} s) passt nicht zur Master-Audio-Dauer (${audioDuration.toFixed(3)} s).`);
      }
    } catch (error) {
      errors.push(error.message);
    }
  }

  let timelineJson = null;
  if (!(await exists(timelinePath))) {
    errors.push('FINAL_TIMELINE.json fehlt. Erst build:youtube-timeline ausführen.');
  } else {
    timelineJson = await readJson(timelinePath);
    const timeline = Array.isArray(timelineJson.images) ? timelineJson.images : [];
    const endHold = numeric(timelineJson.endHoldSeconds) ?? 0.6;
    if (timeline.length !== images.length) errors.push(`FINAL_TIMELINE enthält ${timeline.length} Bilder statt ${images.length}.`);
    if (String(timelineJson.alignmentEvidence ?? '') !== String(mapping.alignmentEvidenceFile ?? '')) {
      errors.push('FINAL_TIMELINE verweist nicht auf denselben Audio-Messbeleg wie das Mapping.');
    }
    if (String(timelineJson.audioMaster ?? '') !== String(mapping.audioMasterFile ?? '')) {
      errors.push('FINAL_TIMELINE verweist nicht auf dieselbe Master-Audiodatei wie das Mapping.');
    }

    for (let index = 0; index < Math.min(timeline.length, images.length); index += 1) {
      const mapItem = images[index];
      const timeItem = timeline[index];
      const number = expectedFirst + index;
      if (Number(timeItem.imageNumber) !== number) errors.push(`FINAL_TIMELINE Position ${index + 1}: erwartet Bild ${number}, gefunden ${timeItem.imageNumber}.`);
      const actualAnchor = numeric(mapItem.actualStartSeconds);
      const timelineStart = numeric(timeItem.startSeconds);
      const expectedTimelineStart = index === 0 ? 0 : actualAnchor === null ? null : Math.max(0, actualAnchor - cutLead);
      if (timelineStart === null) errors.push(`FINAL_TIMELINE Bild ${number}: startSeconds fehlt.`);
      else if (expectedTimelineStart === null) errors.push(`FINAL_TIMELINE Bild ${number}: kein gemessener Audio-Anker.`);
      else if (Math.abs(timelineStart - expectedTimelineStart) > 0.15) {
        errors.push(`FINAL_TIMELINE Bild ${number}: Start ${timelineStart} weicht vom gemessenen Audio-Anker-Schnitt ${expectedTimelineStart.toFixed(3)} ab.`);
      }
      const timelineEnd = numeric(timeItem.endSeconds);
      if (timelineEnd === null) errors.push(`FINAL_TIMELINE Bild ${number}: endSeconds fehlt.`);
      if (index < timeline.length - 1) {
        const nextStart = numeric(timeline[index + 1]?.startSeconds);
        if (timelineEnd !== null && nextStart !== null && Math.abs(timelineEnd - nextStart) > 0.08) {
          errors.push(`FINAL_TIMELINE zwischen Bild ${number} und ${number + 1} hat Lücke/Überlappung.`);
        }
      } else if (audioDuration !== null && timelineEnd !== null) {
        const expectedEnd = audioDuration + endHold;
        if (Math.abs(timelineEnd - expectedEnd) > 0.30) {
          errors.push(`Letztes Bild endet bei ${timelineEnd.toFixed(3)} s; erwartet ca. ${expectedEnd.toFixed(3)} s.`);
        }
      }
    }

    const timelineDurations = timeline.map((item) => {
      const start = numeric(item.startSeconds);
      const end = numeric(item.endSeconds);
      return start !== null && end !== null ? end - start : null;
    }).filter((value) => value !== null && value > 0);
    const timelineUniformShare = sameDurationShare(timelineDurations);
    if (timelineUniformShare >= 0.70) errors.push(`FINAL_TIMELINE ist verdächtig gleichmäßig: ${Math.round(timelineUniformShare * 100)} % der Holds sind nahezu identisch.`);
  }

  if (productionRulesVersion >= 2 && timelineJson && !runV2PacingGate(projectDir)) {
    errors.push('Adaptive Pacing V2 Hard-Gate ist fehlgeschlagen.');
  }

  if (process.argv.includes('--post-render')) {
    const rendered = path.join(projectDir, '03-export', 'FERTIGES-VIDEO.mp4');
    if (!(await exists(rendered))) errors.push('Post-Render-QC: 03-export/FERTIGES-VIDEO.mp4 fehlt.');
    else if (audioDuration !== null) {
      try {
        const videoDuration = ffprobeDuration(rendered);
        const trailing = videoDuration - audioDuration;
        if (trailing < 0.35 || trailing > 1.00) {
          errors.push(`Post-Render-QC: Video endet ${trailing.toFixed(3)} s nach dem Voice-over. Erlaubt sind 0,35–1,00 s.`);
        }
      } catch (error) {
        errors.push(error.message);
      }
    }
  }

  if (errors.length) {
    console.error(`YouTube Phase-3-Hard-Gate: FEHLGESCHLAGEN (${errors.length} Blocker)`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log('YouTube Phase-3-Hard-Gate: BESTANDEN');
  console.log(`Bilder: ${images.length}${plannedImageCount !== null ? ` / geplant ${plannedImageCount}` : ''}`);
  if (audioDuration !== null) console.log(`Voice-over-Dauer: ${audioDuration.toFixed(3)} s`);
  console.log('Audio-Anker wurden gegen echte Whisper-Wortzeiten und Audio-Fingerprints verifiziert.');
}

main().catch((error) => {
  console.error(`YouTube Phase-3-Hard-Gate: FEHLER — ${error.message}`);
  process.exitCode = 1;
});
