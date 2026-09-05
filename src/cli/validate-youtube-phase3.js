#!/usr/bin/env node

import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

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

async function walkFiles(directory) {
  const files = [];
  if (!(await exists(directory))) return files;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function ffprobeDuration(filePath) {
  const result = spawnSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath
  ], { encoding: 'utf8' });

  if (result.error) throw new Error(`ffprobe konnte nicht gestartet werden: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`ffprobe konnte ${filePath} nicht lesen: ${result.stderr?.trim() || 'unbekannter Fehler'}`);
  const duration = Number(result.stdout.trim());
  if (!Number.isFinite(duration) || duration <= 0) throw new Error(`Ungültige Mediendauer für ${filePath}.`);
  return duration;
}

function fail(errors, message) {
  errors.push(message);
}

function numeric(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function sameDurationShare(durations, tolerance = 0.12) {
  if (durations.length < 10) return 0;
  let max = 0;
  for (const pivot of durations) {
    const count = durations.filter((value) => Math.abs(value - pivot) <= tolerance).length;
    max = Math.max(max, count);
  }
  return max / durations.length;
}

async function main() {
  const rawDir = arg('--dir');
  if (!rawDir) {
    console.error('Nutzung: npm run validate:youtube-phase3 -- --dir "youtube/<woche>/<thema>" [--audio <datei>] [--post-render]');
    process.exitCode = 1;
    return;
  }

  const projectDir = path.resolve(rawDir);
  const mappingPath = path.join(projectDir, '99-technik', 'BILD_AUDIO_ZUORDNUNG.json');
  const timelinePath = path.join(projectDir, '99-technik', 'FINAL_TIMELINE.json');
  const videoMetaPath = path.join(projectDir, '99-technik', 'video.json');
  const errors = [];

  if (!(await exists(mappingPath))) {
    fail(errors, 'BILD_AUDIO_ZUORDNUNG.json fehlt. Render ist blockiert.');
  }

  if (errors.length) {
    for (const error of errors) console.error(`BLOCKER: ${error}`);
    process.exitCode = 1;
    return;
  }

  const mapping = await readJson(mappingPath);
  const images = Array.isArray(mapping.images) ? mapping.images : [];
  if (!images.length) fail(errors, 'Mapping enthält keine Videobilder.');

  const expectedFirst = Number(mapping.videoFirstImageNumber ?? 1);
  const expectedLast = Number(mapping.videoLastImageNumber ?? images.length);
  const expectedCount = expectedLast - expectedFirst + 1;
  if (images.length !== expectedCount) fail(errors, `Mapping erwartet ${expectedCount} Bilder, enthält aber ${images.length}.`);

  if (mapping.thumbnailImageNumber !== 0 || mapping.rules?.image00ExcludedFromTimeline !== true) {
    fail(errors, 'Bild 00 muss als Thumbnail markiert und aus der Timeline ausgeschlossen sein.');
  }

  let plannedImageCount = null;
  if (await exists(videoMetaPath)) {
    const meta = await readJson(videoMetaPath);
    plannedImageCount = numeric(meta.plannedImageCount);
    if (plannedImageCount !== null && plannedImageCount !== images.length) {
      fail(errors, `video.json plant ${plannedImageCount} Videobilder, Mapping enthält ${images.length}.`);
    }
  }

  const minConfidence = numeric(mapping.alignmentConfidenceMinimum) ?? 0.95;
  const cutLead = numeric(mapping.cutLeadSecondsDefault) ?? 0.08;
  const durations = [];

  for (let index = 0; index < images.length; index += 1) {
    const item = images[index];
    const expectedNumber = expectedFirst + index;
    if (Number(item.imageNumber) !== expectedNumber) {
      fail(errors, `Bildfolge beschädigt: Position ${index + 1} muss Bild ${expectedNumber} sein, ist aber ${item.imageNumber}.`);
    }

    const start = numeric(item.actualStartSeconds);
    const end = numeric(item.actualEndSeconds);
    const confidence = numeric(item.alignmentConfidence);

    if (start === null) fail(errors, `Bild ${expectedNumber}: actualStartSeconds ist nicht gesetzt.`);
    if (end === null) fail(errors, `Bild ${expectedNumber}: actualEndSeconds ist nicht gesetzt.`);
    if (confidence === null) fail(errors, `Bild ${expectedNumber}: alignmentConfidence ist nicht gesetzt.`);
    else if (confidence < minConfidence) fail(errors, `Bild ${expectedNumber}: alignmentConfidence ${confidence} < ${minConfidence}.`);

    if (start !== null && end !== null) {
      if (end <= start) fail(errors, `Bild ${expectedNumber}: Ende (${end}) liegt nicht nach Start (${start}).`);
      else durations.push(end - start);
    }

    if (!String(item.startAnchor ?? '').trim()) fail(errors, `Bild ${expectedNumber}: startAnchor fehlt.`);
    if (index < images.length - 1 && !String(item.endAnchor ?? '').trim()) fail(errors, `Bild ${expectedNumber}: endAnchor fehlt.`);

    const folder = String(item.batchFolder ?? '').trim();
    const imageFile = String(item.imageFile ?? `Bild ${String(expectedNumber).padStart(2, '0')}.png`).trim();
    if (!folder) {
      fail(errors, `Bild ${expectedNumber}: batchFolder fehlt.`);
    } else {
      const expectedAsset = path.join(projectDir, '00-bildprompts', folder, imageFile);
      if (!(await exists(expectedAsset))) fail(errors, `Bild ${expectedNumber}: Asset fehlt unter ${path.relative(projectDir, expectedAsset)}.`);
    }
  }

  for (let index = 0; index < images.length - 1; index += 1) {
    const currentStart = numeric(images[index].actualStartSeconds);
    const currentEnd = numeric(images[index].actualEndSeconds);
    const nextStart = numeric(images[index + 1].actualStartSeconds);
    if (currentEnd !== null && nextStart !== null) {
      if (Math.abs(currentEnd - nextStart) > 0.20) {
        fail(errors, `Mapping-Lücke/Überlappung zwischen Bild ${images[index].imageNumber} und ${images[index + 1].imageNumber}: ${currentEnd} vs ${nextStart}.`);
      }
      if (currentStart !== null && nextStart <= currentStart) {
        fail(errors, `Startzeiten sind bei Bild ${images[index + 1].imageNumber} nicht streng aufsteigend.`);
      }
    }
  }

  const uniformShare = sameDurationShare(durations);
  if (uniformShare >= 0.70) {
    fail(errors, `${Math.round(uniformShare * 100)} % der Bildbereiche haben nahezu dieselbe Dauer. Das sieht nach einer starren Slideshow statt Audio-Sync aus.`);
  }

  const audioArg = arg('--audio');
  let audioPath = audioArg ? path.resolve(audioArg) : null;
  if (!audioPath) {
    const audioFiles = (await walkFiles(path.join(projectDir, '02-audio')))
      .filter((file) => /\.(mp3|wav|m4a|aac|flac|ogg|opus)$/i.test(file));
    if (audioFiles.length === 1) audioPath = audioFiles[0];
    else if (audioFiles.length === 0) fail(errors, 'Kein finales Voice-over unter 02-audio gefunden. Render ist blockiert.');
    else fail(errors, `Mehrere Audio-Dateien unter 02-audio gefunden (${audioFiles.length}). Mit --audio die finale Masterspur eindeutig angeben.`);
  }

  let audioDuration = null;
  if (audioPath && await exists(audioPath)) {
    try {
      audioDuration = ffprobeDuration(audioPath);
      const lastEnd = numeric(images.at(-1)?.actualEndSeconds);
      if (lastEnd !== null && Math.abs(lastEnd - audioDuration) > 0.75) {
        fail(errors, `Letztes Mapping-Ende (${lastEnd.toFixed(3)} s) passt nicht zur Audio-Dauer (${audioDuration.toFixed(3)} s).`);
      }
    } catch (error) {
      fail(errors, error.message);
    }
  }

  if (!(await exists(timelinePath))) {
    fail(errors, 'FINAL_TIMELINE.json fehlt. Antigravity muss die tatsächlich zu rendernde Timeline vor dem Render schreiben.');
  } else {
    const timelineJson = await readJson(timelinePath);
    const timeline = Array.isArray(timelineJson.images) ? timelineJson.images : [];
    const endHold = numeric(timelineJson.endHoldSeconds) ?? 0.6;
    if (timeline.length !== images.length) fail(errors, `FINAL_TIMELINE enthält ${timeline.length} Bilder statt ${images.length}.`);

    for (let index = 0; index < Math.min(timeline.length, images.length); index += 1) {
      const mapItem = images[index];
      const timeItem = timeline[index];
      const number = expectedFirst + index;
      if (Number(timeItem.imageNumber) !== number) fail(errors, `FINAL_TIMELINE Position ${index + 1}: erwartet Bild ${number}, gefunden ${timeItem.imageNumber}.`);
      const actualAnchor = numeric(mapItem.actualStartSeconds);
      const timelineStart = numeric(timeItem.startSeconds);
      const expectedTimelineStart = index === 0 ? 0 : actualAnchor === null ? null : Math.max(0, actualAnchor - cutLead);
      if (timelineStart === null) fail(errors, `FINAL_TIMELINE Bild ${number}: startSeconds fehlt.`);
      else if (expectedTimelineStart === null) fail(errors, `FINAL_TIMELINE Bild ${number}: kann ohne actualStartSeconds nicht gegen Audio geprüft werden.`);
      else if (Math.abs(timelineStart - expectedTimelineStart) > 0.15) {
        fail(errors, `FINAL_TIMELINE Bild ${number}: Start ${timelineStart} weicht vom Audio-Anker-Schnitt ${expectedTimelineStart.toFixed(3)} ab.`);
      }

      const timelineEnd = numeric(timeItem.endSeconds);
      if (timelineEnd === null) fail(errors, `FINAL_TIMELINE Bild ${number}: endSeconds fehlt.`);
      if (index < timeline.length - 1) {
        const nextStart = numeric(timeline[index + 1]?.startSeconds);
        if (timelineEnd !== null && nextStart !== null && Math.abs(timelineEnd - nextStart) > 0.08) {
          fail(errors, `FINAL_TIMELINE zwischen Bild ${number} und ${number + 1} hat Lücke/Überlappung.`);
        }
      } else if (audioDuration !== null && timelineEnd !== null) {
        const expectedEnd = audioDuration + endHold;
        if (Math.abs(timelineEnd - expectedEnd) > 0.30) {
          fail(errors, `Letztes Bild endet bei ${timelineEnd.toFixed(3)} s; erwartet ca. Audio ${audioDuration.toFixed(3)} + Hold ${endHold.toFixed(2)} = ${expectedEnd.toFixed(3)} s.`);
        }
      }
    }

    const timelineDurations = timeline
      .map((item) => {
        const start = numeric(item.startSeconds);
        const end = numeric(item.endSeconds);
        return start !== null && end !== null ? end - start : null;
      })
      .filter((value) => value !== null && value > 0);
    const timelineUniformShare = sameDurationShare(timelineDurations);
    if (timelineUniformShare >= 0.70) {
      fail(errors, `FINAL_TIMELINE ist verdächtig gleichmäßig: ${Math.round(timelineUniformShare * 100)} % der Holds sind nahezu identisch. Starre Slideshow ist blockiert.`);
    }
  }

  if (process.argv.includes('--post-render')) {
    const rendered = path.join(projectDir, '03-export', 'FERTIGES-VIDEO.mp4');
    if (!(await exists(rendered))) {
      fail(errors, 'Post-Render-QC: 03-export/FERTIGES-VIDEO.mp4 fehlt.');
    } else if (audioDuration !== null) {
      try {
        const videoDuration = ffprobeDuration(rendered);
        const trailing = videoDuration - audioDuration;
        if (trailing < 0.35 || trailing > 1.00) {
          fail(errors, `Post-Render-QC: Video endet ${trailing.toFixed(3)} s nach dem Voice-over. Erlaubt sind 0,35–1,00 s; langer stiller Nachlauf ist blockiert.`);
        }
      } catch (error) {
        fail(errors, error.message);
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
  console.log('Audio-Anker, FINAL_TIMELINE, Bildreihenfolge und Anti-Slideshow-Gate sind konsistent.');
}

main().catch((error) => {
  console.error(`YouTube Phase-3-Hard-Gate: FEHLER — ${error.message}`);
  process.exitCode = 1;
});
