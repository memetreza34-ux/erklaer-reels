import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

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
  const rate = Number(value ?? 1.05);
  if (!Number.isFinite(rate) || rate < 1 || rate > 1.1) {
    throw new Error('playbackRate muss zwischen 1,00 und 1,10 liegen.');
  }
  return rate;
}

export function buildAudioPacingFilter({
  thresholdDb = -35,
  minimumLongPauseSeconds = 0.24,
  retainedPauseSeconds = 0.05,
  playbackRate = 1.05
} = {}) {
  const rate = normalizePlaybackRate(playbackRate);
  const silenceFilter = [
    'silenceremove',
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

  return rate > 1.0001
    ? `${silenceFilter},atempo=${rate}`
    : silenceFilter;
}

// Rückwärtskompatibler Export für bestehende Tests und Aufrufer.
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

  // Bei erneutem Ausführen immer von der ursprünglichen Datei starten,
  // damit Tempo und Pausenkürzung nicht mehrfach angewendet werden.
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
  const filter = buildAudioPacingFilter({ ...options, playbackRate });
  const beforeSeconds = await probeDuration(sourcePath);
  const args = [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', sourcePath,
    '-vn',
    '-af', filter,
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

  manifest.audio = {
    ...manifest.audio,
    originalFile: manifest.audio.originalFile ?? sourceRelative,
    expectedFile: outputRelative,
    pauseTrimmed: true,
    tempoAdjusted: playbackRate > 1,
    playbackRate,
    pauseTrimSettings: {
      thresholdDb: Number(options.thresholdDb ?? -35),
      minimumLongPauseSeconds: Number(options.minimumLongPauseSeconds ?? 0.24),
      retainedPauseSeconds: Number(options.retainedPauseSeconds ?? 0.05),
      playbackRate
    },
    status: 'ready'
  };
  status.audio = 'ready';
  status.audioPacing = 'tightened-and-slightly-accelerated';
  status.timeline = 'needs-rebuild-after-audio-pacing';
  status.wordSync = 'needs-review-after-audio-pacing';
  status.render = 'waiting-for-timeline';

  await writeJson(manifestPath, manifest);
  await writeJson(statusPath, status);

  const audioSyncPath = path.join(reelDirectory, 'timeline', 'audio-sync.json');
  const audioSync = await readJson(audioSyncPath, null);
  if (audioSync) {
    audioSync.audioDurationSeconds = afterSeconds;
    audioSync.audioFile = outputRelative;
    audioSync.source = 'pause-trimmed-and-tempo-adjusted-voiceover';
    audioSync.timingStatus = 'requires-new-cue-sync';
    audioSync.cueTimings = (audioSync.cueTimings ?? []).map((cue, index) => ({
      ...cue,
      cueTimeSeconds: index === 0 ? 0 : null,
      confidence: index === 0 ? 1 : null
    }));
    await writeJson(audioSyncPath, audioSync);
  }

  const report = {
    version: 2,
    createdAt: new Date().toISOString(),
    passed: Boolean(afterSeconds && beforeSeconds && afterSeconds < beforeSeconds),
    sourceFile: sourceRelative,
    outputFile: outputRelative,
    beforeSeconds,
    afterSeconds,
    removedSeconds,
    reductionPercent,
    playbackRate,
    speedIncreasePercent: (playbackRate - 1) * 100,
    filter,
    settings: manifest.audio.pauseTrimSettings,
    note: 'Nach der Audio-Optimierung müssen Timeline, Szenen-Cues und Codex-Wortzeiten erneut synchronisiert werden.'
  };
  await writeJson(path.join(reelDirectory, 'review', 'audio-pacing-report.json'), report);
  return report;
}
