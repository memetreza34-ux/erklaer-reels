import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import { buildAudioPacingFilter } from './audio-tightener.js';
import {
  AUDIO_PACING_STYLE,
  buildLoudnessFilter,
  isMeasuredLoudnessWithinTolerance
} from '../shared/audio-pacing-style.js';

const execFileAsync = promisify(execFile);
const AUDIO_RE = /\.(mp3|wav|m4a|aac|flac|ogg|opus)$/i;
export const YOUTUBE_AUDIO_PACING_FILE = 'YOUTUBE_AUDIO_PACING.json';
export const YOUTUBE_OPTIMIZED_AUDIO_FILE = 'YOUTUBE_AUDIO_OPTIMIZED.wav';

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function sha256(filePath) {
  return createHash('sha256').update(await readFile(filePath)).digest('hex');
}

async function probeDuration(filePath) {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', filePath
  ]);
  const duration = Number(String(stdout).trim());
  if (!Number.isFinite(duration) || duration <= 0) throw new Error(`Ungültige Audiodauer: ${filePath}`);
  return Number(duration.toFixed(3));
}

export function parseYoutubeLoudnessMeasurement(output) {
  const text = String(output ?? '');
  const objects = text.match(/\{[\s\S]*?\}/g) ?? [];

  for (let index = objects.length - 1; index >= 0; index -= 1) {
    try {
      const parsed = JSON.parse(objects[index]);
      const integratedLufs = Number(parsed.input_i);
      const truePeakDbtp = Number(parsed.input_tp);
      if (!Number.isFinite(integratedLufs) || !Number.isFinite(truePeakDbtp)) continue;
      return {
        measured: true,
        integratedLufs,
        truePeakDbtp,
        targetLufs: AUDIO_PACING_STYLE.loudnessTargetLufs,
        targetTruePeakDbtp: AUDIO_PACING_STYLE.truePeakDbtp,
        toleranceLu: AUDIO_PACING_STYLE.loudnessMeasurementToleranceLu,
        truePeakToleranceDb: AUDIO_PACING_STYLE.truePeakMeasurementToleranceDb,
        passed: isMeasuredLoudnessWithinTolerance({ integratedLufs, truePeakDbtp })
      };
    } catch {
      // FFmpeg schreibt neben dem JSON Statuszeilen nach stderr.
    }
  }

  return {
    measured: false,
    integratedLufs: null,
    truePeakDbtp: null,
    targetLufs: AUDIO_PACING_STYLE.loudnessTargetLufs,
    targetTruePeakDbtp: AUDIO_PACING_STYLE.truePeakDbtp,
    toleranceLu: AUDIO_PACING_STYLE.loudnessMeasurementToleranceLu,
    truePeakToleranceDb: AUDIO_PACING_STYLE.truePeakMeasurementToleranceDb,
    passed: false
  };
}

async function measureYoutubeLoudness(filePath) {
  const filter = `${buildLoudnessFilter()}:print_format=json`;
  const args = [
    '-hide_banner', '-nostats',
    '-i', filePath,
    '-vn',
    '-af', filter,
    '-f', 'null',
    '-'
  ];

  try {
    const { stderr } = await execFileAsync('ffmpeg', args, { timeout: 600_000, maxBuffer: 8 * 1024 * 1024 });
    return parseYoutubeLoudnessMeasurement(stderr);
  } catch (error) {
    const measurement = parseYoutubeLoudnessMeasurement(error?.stderr);
    if (measurement.measured) return measurement;
    return { ...measurement, error: error?.message ?? 'Lautheitsmessung fehlgeschlagen.' };
  }
}

async function discoverSingleOriginal(projectDir, explicitAudio = null) {
  if (explicitAudio) {
    const absolute = path.resolve(explicitAudio);
    if (!(await exists(absolute))) throw new Error(`Explizite Audiodatei fehlt: ${absolute}`);
    return absolute;
  }

  const audioDir = path.join(projectDir, '02-audio');
  const entries = (await exists(audioDir)) ? await readdir(audioDir, { withFileTypes: true }) : [];
  const files = entries
    .filter((entry) => entry.isFile() && AUDIO_RE.test(entry.name))
    .map((entry) => path.join(audioDir, entry.name));

  if (files.length !== 1) {
    throw new Error(`Neue YouTube-V2-Produktion erwartet genau eine finale Voice-over-Datei unter 02-audio; gefunden: ${files.length}.`);
  }
  return files[0];
}

export async function optimizeYoutubeVoiceover(projectDirectory, { audio = null } = {}) {
  const projectDir = path.resolve(projectDirectory);
  const source = await discoverSingleOriginal(projectDir, audio);
  const techDir = path.join(projectDir, '99-technik');
  await mkdir(techDir, { recursive: true });

  const output = path.join(techDir, YOUTUBE_OPTIMIZED_AUDIO_FILE);
  const reportPath = path.join(techDir, YOUTUBE_AUDIO_PACING_FILE);
  if (path.resolve(source) === path.resolve(output)) throw new Error('YouTube-Nutzeroriginal und internes Master dürfen nicht identisch sein.');

  const filter = buildAudioPacingFilter({ playbackRate: AUDIO_PACING_STYLE.playbackRate });
  const beforeSeconds = await probeDuration(source);
  const sourceFingerprintSha256 = await sha256(source);

  await execFileAsync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', source,
    '-vn',
    '-af', filter,
    '-ar', String(AUDIO_PACING_STYLE.outputSampleRateHz),
    '-ac', '2',
    '-c:a', 'pcm_s16le',
    output
  ], { timeout: 1_200_000 });

  const afterSeconds = await probeDuration(output);
  const outputFingerprintSha256 = await sha256(output);
  if (!(afterSeconds < beforeSeconds)) {
    throw new Error(`YouTube-Audio wurde nicht verkürzt (${beforeSeconds}s → ${afterSeconds}s). 1,10x/Pausen-Gate ist nicht belegt.`);
  }

  const loudnessMeasurement = await measureYoutubeLoudness(output);
  const report = {
    schemaVersion: 2,
    createdAt: new Date().toISOString(),
    passed: loudnessMeasurement.passed === true,
    sourceFile: path.relative(projectDir, source).split(path.sep).join('/'),
    sourceFingerprintSha256,
    optimizedFile: `99-technik/${YOUTUBE_OPTIMIZED_AUDIO_FILE}`,
    optimizedFingerprintSha256: outputFingerprintSha256,
    beforeSeconds,
    afterSeconds,
    removedSeconds: Number((beforeSeconds - afterSeconds).toFixed(3)),
    playbackRate: AUDIO_PACING_STYLE.playbackRate,
    pitchPreserved: AUDIO_PACING_STYLE.preservePitch,
    longPauseRemoval: {
      enabled: true,
      thresholdDb: AUDIO_PACING_STYLE.thresholdDb,
      minimumLongPauseSeconds: AUDIO_PACING_STYLE.minimumLongPauseSeconds,
      retainedPauseSeconds: AUDIO_PACING_STYLE.retainedPauseSeconds
    },
    trailingSilenceRemoval: true,
    loudness: {
      targetLufs: AUDIO_PACING_STYLE.loudnessTargetLufs,
      truePeakDbtp: AUDIO_PACING_STYLE.truePeakDbtp,
      normalized: loudnessMeasurement.passed === true,
      measured: loudnessMeasurement.measured === true,
      integratedLufs: loudnessMeasurement.integratedLufs,
      measuredTruePeakDbtp: loudnessMeasurement.truePeakDbtp,
      toleranceLu: loudnessMeasurement.toleranceLu,
      truePeakToleranceDb: loudnessMeasurement.truePeakToleranceDb
    },
    loudnessMeasurement,
    outputSampleRateHz: AUDIO_PACING_STYLE.outputSampleRateHz,
    filter,
    userOriginalModified: false,
    timingRule: 'Whisper muss nach dieser Optimierung und bestandener Lautheitsmessung auf dem optimierten Audio messen.'
  };
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  if (!loudnessMeasurement.passed) {
    const measured = loudnessMeasurement.measured
      ? `${loudnessMeasurement.integratedLufs} LUFS / ${loudnessMeasurement.truePeakDbtp} dBTP`
      : 'nicht messbar';
    throw new Error(`YouTube-Audio-Lautheitsmessung fehlgeschlagen (${measured}). Ziel: ${AUDIO_PACING_STYLE.loudnessTargetLufs} LUFS, True Peak max. ${AUDIO_PACING_STYLE.truePeakDbtp} dBTP.`);
  }

  return { ...report, sourceAbsolute: source, optimizedAbsolute: output, reportPath };
}

export async function validateYoutubeAudioPacing(projectDirectory) {
  const projectDir = path.resolve(projectDirectory);
  const reportPath = path.join(projectDir, '99-technik', YOUTUBE_AUDIO_PACING_FILE);
  const errors = [];
  if (!(await exists(reportPath))) return { passed: false, errors: [`${YOUTUBE_AUDIO_PACING_FILE} fehlt.`], report: null };

  const report = JSON.parse(await readFile(reportPath, 'utf8'));
  if (report.passed !== true) errors.push('YouTube-Audio-Pacing/Lautheit ist nicht als bestanden markiert.');
  if (Math.abs(Number(report.playbackRate) - AUDIO_PACING_STYLE.playbackRate) > AUDIO_PACING_STYLE.playbackRateTolerance) {
    errors.push(`YouTube-Voice-over muss exakt ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}x laufen.`);
  }
  if (report.pitchPreserved !== true) errors.push('Tonhöhe muss bei 1,10x erhalten bleiben.');
  if (report.longPauseRemoval?.enabled !== true) errors.push('Überlange Sprechpausen müssen automatisch gekürzt werden.');
  if (report.trailingSilenceRemoval !== true) errors.push('Endstille muss entfernt werden.');
  if (report.userOriginalModified !== false) errors.push('Nutzeroriginal darf nicht verändert werden.');
  if (report.loudnessMeasurement?.measured !== true) errors.push('Finale YouTube-Lautheit wurde nicht real nachgemessen.');
  if (report.loudnessMeasurement?.passed !== true) errors.push('Gemessene YouTube-Lautheit liegt außerhalb der erlaubten Toleranz.');
  if (!isMeasuredLoudnessWithinTolerance({
    integratedLufs: report.loudnessMeasurement?.integratedLufs,
    truePeakDbtp: report.loudnessMeasurement?.truePeakDbtp
  })) {
    errors.push('Gemessene LUFS-/True-Peak-Werte bestehen das aktuelle Audio-Hard-Gate nicht.');
  }

  const sourcePath = path.join(projectDir, String(report.sourceFile ?? ''));
  const optimizedPath = path.join(projectDir, String(report.optimizedFile ?? ''));
  if (!(await exists(sourcePath))) errors.push('Originales YouTube-Voice-over fehlt.');
  else if (await sha256(sourcePath) !== report.sourceFingerprintSha256) errors.push('Originales YouTube-Voice-over wurde nach der Audio-Optimierung geändert.');
  if (!(await exists(optimizedPath))) errors.push('Optimiertes internes YouTube-Audio fehlt.');
  else if (await sha256(optimizedPath) !== report.optimizedFingerprintSha256) errors.push('Optimiertes YouTube-Audio wurde nach dem Pacing-Gate geändert.');

  return { passed: errors.length === 0, errors, report };
}
