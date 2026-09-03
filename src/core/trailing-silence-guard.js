import { access, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export const TRAILING_SILENCE_POLICY = Object.freeze({
  requiredSince: '2026-09-02',
  thresholdDb: -35,
  minimumDetectSeconds: 0.15,
  maximumTrailingSilenceSeconds: 0.25,
  endToleranceSeconds: 0.12
});

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

async function probeDuration(filePath) {
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath
    ]);
    const duration = Number(String(stdout).trim());
    return Number.isFinite(duration) && duration > 0 ? duration : null;
  } catch {
    return null;
  }
}

export function parseTrailingSilence(output, durationSeconds, policy = TRAILING_SILENCE_POLICY) {
  const duration = Number(durationSeconds);
  if (!Number.isFinite(duration) || duration <= 0) return null;

  const text = String(output ?? '');
  const starts = [...text.matchAll(/silence_start:\s*([0-9.]+)/g)].map((match) => Number(match[1]));
  const ends = [...text.matchAll(/silence_end:\s*([0-9.]+)/g)].map((match) => Number(match[1]));
  if (!starts.length) return 0;

  const lastStart = starts.at(-1);
  const lastEnd = ends.at(-1);
  const endedAtFileEnd = Number.isFinite(lastEnd)
    ? Math.abs(duration - lastEnd) <= Number(policy.endToleranceSeconds)
    : lastStart < duration;

  if (!endedAtFileEnd) return 0;
  return Math.max(0, Number((duration - lastStart).toFixed(3)));
}

async function detectTrailingSilence(filePath, durationSeconds, policy) {
  const args = [
    '-hide_banner', '-nostats',
    '-i', filePath,
    '-vn',
    '-af', `silencedetect=noise=${Number(policy.thresholdDb)}dB:d=${Number(policy.minimumDetectSeconds)}`,
    '-f', 'null', '-'
  ];

  try {
    const { stderr } = await execFileAsync('ffmpeg', args);
    return parseTrailingSilence(stderr, durationSeconds, policy);
  } catch (error) {
    const parsed = parseTrailingSilence(error?.stderr, durationSeconds, policy);
    return parsed;
  }
}

function resolveInside(root, relativePath) {
  const rootPath = path.resolve(root);
  const resolved = path.resolve(rootPath, String(relativePath ?? ''));
  const relative = path.relative(rootPath, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Pfad verlässt den Reel-Ordner: ${relativePath}`);
  }
  return resolved;
}

export async function verifyTrailingVoiceoverSilence(reelDirectory, policy = TRAILING_SILENCE_POLICY) {
  const reel = await readJson(path.join(reelDirectory, 'reel.json'), {});
  const required = String(reel?.date ?? '') >= String(policy.requiredSince);
  if (!required) {
    return { required: false, passed: true, trailingSilenceSeconds: null, reason: 'Archiv-Reel vor der Endstille-Hard-Gate-Regel.' };
  }

  const manifest = await readJson(path.join(reelDirectory, 'assets-manifest.json'), { audio: {} });
  const relativeFile = manifest?.audio?.expectedFile ?? null;
  if (!relativeFile) {
    return { required: true, passed: false, trailingSilenceSeconds: null, reason: 'Im Asset-Manifest fehlt die finale Voice-over-Datei.' };
  }

  let filePath;
  try {
    filePath = resolveInside(reelDirectory, relativeFile);
  } catch (error) {
    return { required: true, passed: false, trailingSilenceSeconds: null, reason: error.message };
  }

  if (!(await exists(filePath))) {
    return { required: true, passed: false, trailingSilenceSeconds: null, file: relativeFile, reason: `Finales Voice-over fehlt: ${relativeFile}.` };
  }

  const durationSeconds = await probeDuration(filePath);
  if (durationSeconds === null) {
    return { required: true, passed: false, trailingSilenceSeconds: null, file: relativeFile, reason: 'Die Dauer des finalen Voice-overs konnte nicht gemessen werden.' };
  }

  const trailingSilenceSeconds = await detectTrailingSilence(filePath, durationSeconds, policy);
  if (trailingSilenceSeconds === null) {
    return { required: true, passed: false, trailingSilenceSeconds: null, file: relativeFile, durationSeconds, reason: 'Die Endstille des finalen Voice-overs konnte nicht gemessen werden.' };
  }

  const passed = trailingSilenceSeconds <= Number(policy.maximumTrailingSilenceSeconds);
  return {
    required: true,
    passed,
    file: relativeFile,
    durationSeconds,
    trailingSilenceSeconds,
    maximumTrailingSilenceSeconds: Number(policy.maximumTrailingSilenceSeconds),
    reason: passed
      ? `Voice-over-Endstille ${trailingSilenceSeconds.toFixed(2)} s — innerhalb des Limits.`
      : `Voice-over enthält ${trailingSilenceSeconds.toFixed(2)} s Endstille. Erlaubt sind höchstens ${Number(policy.maximumTrailingSilenceSeconds).toFixed(2)} s; danach kommt nur der separate Schlussbild-Hold.`
  };
}
