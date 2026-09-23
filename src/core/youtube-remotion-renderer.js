import { access, copyFile, mkdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadSoundLibrary } from './sound-library.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDirectory, '..', '..');
const entryPoint = path.resolve(currentDirectory, '..', 'youtube-renderer', 'index.jsx');
const COMPLEXITY_LEVELS = new Set(['A', 'B', 'C', 'D', 'E']);

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function round(value) {
  return Number(Number(value).toFixed(3));
}

export function motionForComplexity(levelValue, index = 0) {
  const level = COMPLEXITY_LEVELS.has(String(levelValue).toUpperCase()) ? String(levelValue).toUpperCase() : 'C';
  const direction = index % 2 === 0 ? 1 : -1;
  const verticalDirection = index % 4 < 2 ? 1 : -1;

  if (level === 'A') {
    return { type: 'gentle-push', scaleFrom: 1.008, scaleTo: 1.025, xFrom: 0, xTo: 0, yFrom: 0, yTo: 0 };
  }
  if (level === 'B') {
    return { type: 'soft-pan', scaleFrom: 1.015, scaleTo: 1.032, xFrom: -5 * direction, xTo: 5 * direction, yFrom: 0, yTo: 0 };
  }
  if (level === 'C') {
    return { type: 'narrative-pan', scaleFrom: 1.018, scaleTo: 1.045, xFrom: -9 * direction, xTo: 9 * direction, yFrom: 3 * verticalDirection, yTo: -3 * verticalDirection };
  }
  if (level === 'D') {
    return { type: 'complex-scan', scaleFrom: 1.045, scaleTo: 1.018, xFrom: -12 * direction, xTo: 12 * direction, yFrom: 5 * verticalDirection, yTo: -5 * verticalDirection };
  }
  return { type: 'overview-slow-push', scaleFrom: 1.008, scaleTo: 1.025, xFrom: -4 * direction, xTo: 4 * direction, yFrom: 0, yTo: 0 };
}

async function loadOptionalRenderPlan(techDir) {
  const renderPlanPath = path.join(techDir, 'YOUTUBE_RENDER_PLAN.json');
  if (!(await exists(renderPlanPath))) {
    return { schemaVersion: 1, motionPolicy: 'complexity-v1', backgroundMusic: false, motionOverrides: [], soundEffects: [] };
  }
  return readJson(renderPlanPath);
}

async function prepareSounds(projectDir, renderPlan, images) {
  const requested = Array.isArray(renderPlan.soundEffects) ? renderPlan.soundEffects : [];
  if (!requested.length) return [];

  const library = await loadSoundLibrary();
  const imageByNumber = new Map(images.map((item) => [Number(item.imageNumber), item]));
  const outputDir = path.join(projectDir, '99-technik', 'sfx');
  const sounds = [];

  for (const item of requested) {
    const imageNumber = Number(item.imageNumber);
    const image = imageByNumber.get(imageNumber);
    if (!image) throw new Error(`YouTube-SFX verweist auf unbekanntes Bild ${item.imageNumber}.`);
    const type = String(item.type ?? '').trim();
    const entry = library.byType.get(type);
    if (!entry) throw new Error(`Unbekannter YouTube-SFX-Typ: ${type || '(leer)'}.`);
    const source = path.join(repoRoot, library.libraryDirectory, entry.file);
    if (!(await exists(source))) throw new Error(`Soundbibliothek-Datei fehlt: ${path.relative(repoRoot, source)}.`);
    await mkdir(outputDir, { recursive: true });
    const relative = path.posix.join('99-technik', 'sfx', entry.file);
    const target = path.join(projectDir, relative);
    if (!(await exists(target))) await copyFile(source, target);

    const offset = Number(item.offsetSeconds ?? -0.04);
    const fromSeconds = Math.max(0, Number(image.startSeconds) + (Number.isFinite(offset) ? offset : -0.04));
    const volume = Number(item.volume ?? entry.volume ?? renderPlan.defaultSoundVolume ?? library.defaultVolume ?? 0.18);
    sounds.push({ imageNumber, type, file: relative, fromSeconds: round(fromSeconds), volume: Number.isFinite(volume) ? volume : 0.18 });
  }

  return sounds.sort((a, b) => a.fromSeconds - b.fromSeconds);
}

export async function buildYoutubeRenderPlan(projectDirectory) {
  const projectDir = path.resolve(projectDirectory);
  const techDir = path.join(projectDir, '99-technik');
  const mapping = await readJson(path.join(techDir, 'BILD_AUDIO_ZUORDNUNG.json'));
  const timeline = await readJson(path.join(techDir, 'FINAL_TIMELINE.json'));
  const renderPlan = await loadOptionalRenderPlan(techDir);
  const mapByNumber = new Map((mapping.images ?? []).map((item) => [Number(item.imageNumber), item]));
  const overrideByNumber = new Map((renderPlan.motionOverrides ?? []).map((item) => [Number(item.imageNumber), item]));
  const images = [];

  for (const [index, time] of (timeline.images ?? []).entries()) {
    const item = mapByNumber.get(Number(time.imageNumber));
    if (!item) throw new Error(`FINAL_TIMELINE verweist auf unbekanntes Bild ${time.imageNumber}.`);
    const relative = path.posix.join('00-bildprompts', String(item.batchFolder), String(item.imageFile));
    const absolute = path.join(projectDir, relative);
    if (!(await exists(absolute))) throw new Error(`Bild fehlt: ${relative}`);
    const complexityLevel = String(item.complexityLevel ?? 'C').toUpperCase();
    const baseMotion = motionForComplexity(complexityLevel, index);
    const override = overrideByNumber.get(Number(item.imageNumber));
    const motion = override ? { ...baseMotion, ...override, imageNumber: undefined } : baseMotion;
    images.push({
      imageNumber: Number(item.imageNumber),
      file: relative,
      complexityLevel,
      startSeconds: Number(time.startSeconds),
      endSeconds: Number(time.endSeconds),
      motion
    });
  }

  const audioFile = String(timeline.audioMaster || mapping.audioMasterFile || '');
  if (!audioFile) throw new Error('Master-Audio fehlt in FINAL_TIMELINE/Mapping.');
  if (!(await exists(path.join(projectDir, audioFile)))) throw new Error(`Master-Audio fehlt: ${audioFile}`);
  const durationSeconds = Number(images.at(-1)?.endSeconds ?? 0);
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) throw new Error('Ungültige Renderdauer.');

  const sounds = await prepareSounds(projectDir, renderPlan, images);
  return {
    version: 2,
    width: 1920,
    height: 1080,
    fps: 30,
    durationSeconds,
    audioFile,
    motionPolicy: renderPlan.motionPolicy ?? 'complexity-v1',
    backgroundMusic: false,
    images,
    sounds
  };
}

export async function renderYoutube(projectDirectory, { output = null, crf = 18, concurrency = null, onProgress = null } = {}) {
  const projectDir = path.resolve(projectDirectory);
  const plan = await buildYoutubeRenderPlan(projectDir);
  const outputFile = output ? path.resolve(output) : path.join(projectDir, '03-export', 'FERTIGES-VIDEO.mp4');
  await mkdir(path.dirname(outputFile), { recursive: true });

  const [{ bundle }, { renderMedia, selectComposition }] = await Promise.all([
    import('@remotion/bundler'),
    import('@remotion/renderer')
  ]);
  const serveUrl = await bundle({
    entryPoint,
    publicDir: projectDir,
    onProgress: (progress) => onProgress?.({ stage: 'bundle', progress })
  });
  const inputProps = { plan };
  const composition = await selectComposition({ serveUrl, id: 'ErklaerYouTube', inputProps, logLevel: 'warn' });
  const renderOptions = {
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation: outputFile,
    inputProps,
    crf: Number(crf),
    logLevel: 'info',
    onProgress: ({ progress }) => onProgress?.({ stage: 'render', progress })
  };
  if (concurrency !== null) renderOptions.concurrency = Number(concurrency);
  await renderMedia(renderOptions);
  const stats = await stat(outputFile);
  return { outputFile, outputBytes: stats.size, plan };
}
