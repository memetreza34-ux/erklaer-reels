import { access, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  AUDIO_PACING_STYLE,
  buildLoudnessFilter,
  isMeasuredLoudnessWithinTolerance
} from '../shared/audio-pacing-style.js';

const execFileAsync = promisify(execFile);

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath, fallback = {}) {
  if (!(await exists(filePath))) return fallback;
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function probeDuration(filePath) {
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath
    ]);
    const duration = Number(String(stdout).trim());
    return Number.isFinite(duration) ? duration : null;
  } catch {
    return null;
  }
}

function normalizePlaybackRate(value) {
  const rate = Number(value ?? AUDIO_PACING_STYLE.playbackRate);
  if (!Number.isFinite(rate) || rate < 1 || rate > AUDIO_PACING_STYLE.playbackRate) {
    throw new Error('playbackRate muss zwischen 1,00 und 1,10 liegen.');
  }
  return rate;
}

export function parseLoudnessMeasurement(output, {
  loudnessTargetLufs = AUDIO_PACING_STYLE.loudnessTargetLufs,
  truePeakDbtp = AUDIO_PACING_STYLE.truePeakDbtp
} = {}) {
  const text = String(output ?? '');
  const objects = text.match(/\{[\s\S]*?\}/g) ?? [];

  for (let index = objects.length - 1; index >= 0; index -= 1) {
    try {
      const parsed = JSON.parse(objects[index]);
      const integratedLufs = Number(parsed.input_i);
      const measuredTruePeakDbtp = Number(parsed.input_tp);
      if (!Number.isFinite(integratedLufs) || !Number.isFinite(measuredTruePeakDbtp)) continue;

      const loudnessDifferenceLu = Math.abs(integratedLufs - Number(loudnessTargetLufs));
      return {
        measured: true,
        integratedLufs,
        truePeakDbtp: measuredTruePeakDbtp,
        // Fuer den zweiten loudnorm-Durchgang: ohne diese beiden Werte kann FFmpeg
        // nicht linear nachregeln und schaetzt wieder.
        loudnessRange: Number(parsed.input_lra),
        threshold: Number(parsed.input_thresh),
        loudnessTargetLufs: Number(loudnessTargetLufs),
        truePeakTargetDbtp: Number(truePeakDbtp),
        loudnessToleranceLu: AUDIO_PACING_STYLE.loudnessMeasurementToleranceLu,
        truePeakToleranceDb: AUDIO_PACING_STYLE.truePeakMeasurementToleranceDb,
        loudnessDifferenceLu,
        passed: isMeasuredLoudnessWithinTolerance(
          { integratedLufs, truePeakDbtp: measuredTruePeakDbtp },
          { loudnessTargetLufs, truePeakTargetDbtp: truePeakDbtp }
        )
      };
    } catch {
      // FFmpeg kann neben dem JSON weitere Statuszeilen ausgeben. Nur gültige Messobjekte übernehmen.
    }
  }

  return {
    measured: false,
    integratedLufs: null,
    truePeakDbtp: null,
    loudnessTargetLufs: Number(loudnessTargetLufs),
    truePeakTargetDbtp: Number(truePeakDbtp),
    loudnessToleranceLu: AUDIO_PACING_STYLE.loudnessMeasurementToleranceLu,
    truePeakToleranceDb: AUDIO_PACING_STYLE.truePeakMeasurementToleranceDb,
    loudnessDifferenceLu: null,
    passed: false
  };
}

async function measureLoudness(filePath, loudnessSettings) {
  const filter = `${buildLoudnessFilter(loudnessSettings)}:print_format=json`;
  const args = [
    '-hide_banner', '-nostats',
    '-i', filePath,
    '-vn',
    '-af', filter,
    '-f', 'null',
    '-'
  ];

  try {
    const { stderr } = await execFileAsync('ffmpeg', args);
    return parseLoudnessMeasurement(stderr, loudnessSettings);
  } catch (error) {
    const parsed = parseLoudnessMeasurement(error?.stderr, loudnessSettings);
    if (parsed.measured) return parsed;
    return {
      ...parsed,
      error: error?.message ?? 'Lautheitsmessung fehlgeschlagen.'
    };
  }
}

/**
 * Zweiter Lautheitsdurchgang.
 *
 * Ein einzelner loudnorm-Durchlauf schaetzt die Lautheit waehrend des Schreibens und
 * verfehlt das Ziel regelmaessig um mehrere LU - gemessen wurden hier -18,51 LUFS statt
 * der geforderten -16 bei 1 LU Toleranz. Der von FFmpeg vorgesehene Weg ist ein zweiter
 * Durchgang, dem die Messwerte des ersten uebergeben werden. Damit trifft die Datei das
 * Ziel genau.
 *
 * @param {string} filePath Bereits geschnittene Datei; wird an Ort und Stelle ersetzt.
 * @param {object} measurement Messergebnis aus measureLoudness.
 * @param {object} loudnessSettings Zielwerte.
 * @returns {Promise<boolean>} true, wenn der zweite Durchgang gelaufen ist.
 */
async function applyMeasuredLoudness(filePath, measurement, loudnessSettings) {
  const { integratedLufs, truePeakDbtp, loudnessRange, threshold } = measurement;
  if (![integratedLufs, truePeakDbtp, loudnessRange, threshold].every(Number.isFinite)) return false;

  const ziel = Number(loudnessSettings.loudnessTargetLufs);
  const peak = Number(loudnessSettings.truePeakDbtp);
  const lra = Number(loudnessSettings.loudnessRangeLra);
  const rate = Number(loudnessSettings.outputSampleRateHz);

  const filter = [
    `loudnorm=I=${ziel}:TP=${peak}:LRA=${lra}`,
    `measured_I=${integratedLufs}`,
    `measured_TP=${truePeakDbtp}`,
    `measured_LRA=${loudnessRange}`,
    `measured_thresh=${threshold}`,
    // Kein linear=true: Bei sprachlichem Material mit Peaks nahe dem Limit laesst sich das
    // Lautheitsziel linear nicht erreichen, ohne den True Peak zu sprengen. Im dynamischen
    // Modus regelt loudnorm sanft nach und trifft das Ziel - fuer Sprache der uebliche Weg.
    'linear=false',
    'print_format=summary'
  ].join(':') + `,aresample=${rate}`;

  const temporaer = `${filePath}.loudnorm.m4a`;
  await execFileAsync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', filePath, '-vn', '-af', filter,
    '-ar', String(rate), '-c:a', 'aac', '-b:a', '192k',
    temporaer
  ]);
  await rename(temporaer, filePath);
  return true;
}

export function buildAudioPacingFilter({
  thresholdDb = AUDIO_PACING_STYLE.thresholdDb,
  minimumLongPauseSeconds = AUDIO_PACING_STYLE.minimumLongPauseSeconds,
  retainedPauseSeconds = AUDIO_PACING_STYLE.retainedPauseSeconds,
  playbackRate = AUDIO_PACING_STYLE.playbackRate,
  loudnessTargetLufs = AUDIO_PACING_STYLE.loudnessTargetLufs,
  truePeakDbtp = AUDIO_PACING_STYLE.truePeakDbtp,
  loudnessRangeLra = AUDIO_PACING_STYLE.loudnessRangeLra,
  outputSampleRateHz = AUDIO_PACING_STYLE.outputSampleRateHz
} = {}) {
  const rate = normalizePlaybackRate(playbackRate);
  const silenceFilterArgs = [
    'start_periods=1',
    'start_duration=0.12',
    'start_threshold=-38dB',
    'start_silence=0.02',
    'stop_periods=-1',
    `stop_duration=${Number(minimumLongPauseSeconds)}`,
    `stop_threshold=${Number(thresholdDb)}dB`,
    `stop_silence=${Number(retainedPauseSeconds)}`,
    'detection=rms'
  ].join(':');
  const silenceFilter = `silenceremove=${silenceFilterArgs}`;
  const filters = [silenceFilter];

  if (rate > 1.0001) filters.push(`atempo=${rate}`);

  // Letzte stille Sekunden nie als Voice-over-Dauer behandeln. Durch Umkehren wird
  // die Endstille zu Anfangsstille, dort sauber entfernt und anschließend zurückgedreht.
  // So endet die Komposition am letzten gesprochenen Inhalt + dem festen Schluss-Hold.
  filters.push('areverse');
  filters.push(`silenceremove=start_periods=1:start_duration=0.10:start_threshold=${Number(thresholdDb)}dB:start_silence=0.05:detection=rms`);
  filters.push('areverse');
  filters.push(buildLoudnessFilter({ loudnessTargetLufs, truePeakDbtp, loudnessRangeLra }));
  filters.push(`aresample=${Number(outputSampleRateHz)}`);

  return filters.join(',');
}

export const buildSilenceRemovalFilter = buildAudioPacingFilter;

function resolveInside(root, relativePath) {
  const rootPath = path.resolve(root);
  const resolved = path.resolve(rootPath, relativePath);
  const relative = path.relative(rootPath, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Pfad verlässt den Reel-Ordner: ${relativePath}`);
  }
  return resolved;
}

export async function tightenVoiceover(reelDirectory, options = {}) {
  const manifestPath = path.join(reelDirectory, 'assets-manifest.json');
  const statusPath = path.join(reelDirectory, 'status.json');
  const manifest = await readJson(manifestPath, { audio: {} });
  const status = await readJson(statusPath, {});

  const sourceRelative = manifest.audio?.originalFile ?? manifest.audio?.expectedFile;
  if (!sourceRelative) throw new Error('Im Asset-Manifest ist keine Voice-over-Datei eingetragen.');
  const sourcePath = resolveInside(reelDirectory, sourceRelative);
  if (!(await exists(sourcePath))) throw new Error(`Voice-over-Datei fehlt: ${sourceRelative}`);

  const outputRelative = options.outputFile ?? 'audio/voiceover-tight.m4a';
  const outputPath = resolveInside(reelDirectory, outputRelative);
  if (path.resolve(sourcePath) === path.resolve(outputPath)) {
    throw new Error('Original- und Ausgabedatei dürfen nicht identisch sein.');
  }
  await mkdir(path.dirname(outputPath), { recursive: true });

  const playbackRate = normalizePlaybackRate(options.playbackRate);
  const outputSampleRateHz = Number(options.outputSampleRateHz ?? AUDIO_PACING_STYLE.outputSampleRateHz);
  const filter = buildAudioPacingFilter({ ...options, playbackRate, outputSampleRateHz });
  const beforeSeconds = await probeDuration(sourcePath);
  const args = [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', sourcePath,
    '-vn',
    '-af', filter,
    '-ar', String(outputSampleRateHz),
    '-c:a', 'aac',
    '-b:a', '192k',
    outputPath
  ];

  try {
    await execFileAsync('ffmpeg', args);
  } catch (error) {
    throw new Error(`FFmpeg konnte das Voice-over nicht optimieren: ${error.message}`);
  }

  const afterSeconds = await probeDuration(outputPath);
  const removedSeconds = beforeSeconds !== null && afterSeconds !== null
    ? Math.max(0, beforeSeconds - afterSeconds)
    : null;
  const reductionPercent = beforeSeconds && removedSeconds !== null
    ? (removedSeconds / beforeSeconds) * 100
    : null;
  const loudnessSettings = {
    loudnessTargetLufs: Number(options.loudnessTargetLufs ?? AUDIO_PACING_STYLE.loudnessTargetLufs),
    truePeakDbtp: Number(options.truePeakDbtp ?? AUDIO_PACING_STYLE.truePeakDbtp),
    loudnessRangeLra: Number(options.loudnessRangeLra ?? AUDIO_PACING_STYLE.loudnessRangeLra),
    outputSampleRateHz
  };
  let loudnessMeasurement = await measureLoudness(outputPath, loudnessSettings);

  // Der erste Durchgang schaetzt nur. Wenn er das Ziel verfehlt, mit seinen Messwerten
  // exakt nachnormalisieren und danach erneut messen.
  // loudnorm naehert sich dem Ziel im dynamischen Modus nur an - pro Durchgang etwa ein
  // Dezibel. Deshalb wird nachgeregelt, bis die Messung in der Toleranz liegt. Drei
  // Durchgaenge genuegen erfahrungsgemaess; danach wird abgebrochen, damit ein Sonderfall
  // nicht endlos laeuft.
  for (let versuch = 0; versuch < 3 && loudnessMeasurement.measured && !loudnessMeasurement.passed; versuch += 1) {
    const vorher = loudnessMeasurement.integratedLufs;
    const nachgeregelt = await applyMeasuredLoudness(outputPath, loudnessMeasurement, loudnessSettings)
      .catch((error) => {
        console.error(`Lautheits-Nachregelung fehlgeschlagen: ${error.message}`);
        return false;
      });
    if (!nachgeregelt) break;

    loudnessMeasurement = await measureLoudness(outputPath, loudnessSettings);
    // Ohne Fortschritt bringt ein weiterer Durchgang nichts.
    if (Number.isFinite(vorher) && Math.abs(loudnessMeasurement.integratedLufs - vorher) < 0.05) break;
  }

  const pacingPassed = Boolean(afterSeconds && beforeSeconds && afterSeconds < beforeSeconds && loudnessMeasurement.passed);

  manifest.audio = {
    ...manifest.audio,
    originalFile: manifest.audio.originalFile ?? sourceRelative,
    expectedFile: outputRelative,
    pauseTrimmed: true,
    tempoAdjusted: playbackRate > 1,
    loudnessNormalized: loudnessMeasurement.passed,
    loudnessMeasured: loudnessMeasurement.measured,
    measuredIntegratedLufs: loudnessMeasurement.integratedLufs,
    measuredTruePeakDbtp: loudnessMeasurement.truePeakDbtp,
    playbackRate,
    outputSampleRateHz,
    pauseTrimSettings: {
      thresholdDb: Number(options.thresholdDb ?? AUDIO_PACING_STYLE.thresholdDb),
      minimumLongPauseSeconds: Number(options.minimumLongPauseSeconds ?? AUDIO_PACING_STYLE.minimumLongPauseSeconds),
      retainedPauseSeconds: Number(options.retainedPauseSeconds ?? AUDIO_PACING_STYLE.retainedPauseSeconds),
      playbackRate,
      ...loudnessSettings
    },
    status: pacingPassed ? 'ready' : 'needs-review'
  };
  status.audio = pacingPassed ? 'ready' : 'needs-review';
  status.audioPacing = pacingPassed
    ? 'tightened-accelerated-loudness-measured-and-normalized'
    : 'needs-loudness-review';
  status.timeline = 'needs-rebuild-after-audio-pacing';
  status.subtitles = 'disabled';
  status.wordSync = 'not-required';
  status.render = 'waiting-for-timeline';

  await writeJson(manifestPath, manifest);
  await writeJson(statusPath, status);

  const audioSyncPath = path.join(reelDirectory, 'timeline', 'audio-sync.json');
  const audioSync = await readJson(audioSyncPath, null);
  if (audioSync) {
    audioSync.audioDurationSeconds = afterSeconds;
    audioSync.audioFile = outputRelative;
    audioSync.source = 'pause-trimmed-tempo-adjusted-and-loudness-normalized-voiceover';
    audioSync.timingStatus = 'requires-new-cue-sync';
    audioSync.cueTimings = (audioSync.cueTimings ?? []).map((cue, index) => ({
      ...cue,
      cueTimeSeconds: index === 0 ? 0 : null,
      confidence: index === 0 ? 1 : null
    }));
    await writeJson(audioSyncPath, audioSync);
  }

  const report = {
    version: 6,
    createdAt: new Date().toISOString(),
    passed: pacingPassed,
    sourceFile: sourceRelative,
    outputFile: outputRelative,
    beforeSeconds,
    afterSeconds,
    removedSeconds,
    reductionPercent,
    playbackRate,
    speedIncreasePercent: (playbackRate - 1) * 100,
    loudnessNormalized: loudnessMeasurement.passed,
    loudnessMeasured: loudnessMeasurement.measured,
    loudnessSettings,
    loudnessMeasurement,
    filter,
    settings: manifest.audio.pauseTrimSettings,
    subtitlesEnabled: false,
    wordSyncRequired: false,
    sceneTimelineInvalidated: true,
    note: loudnessMeasurement.passed
      ? 'Lautheit wurde nach der Verarbeitung erneut gemessen. Danach müssen nur Timeline und Szenen-Cues mit der neuen Audiodatei synchronisiert werden; Untertitel sind deaktiviert.'
      : 'Die Audioverarbeitung wurde ausgeführt, aber die anschließende Lautheitsmessung liegt außerhalb der Toleranz oder konnte nicht gelesen werden. Vor Timeline und Render muss die Audio-QC korrigiert werden.'
  };
  await writeJson(path.join(reelDirectory, 'review', 'audio-pacing-report.json'), report);
  return report;
}
