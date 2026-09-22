import { access, mkdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const entryPoint = path.resolve(currentDirectory, '..', 'youtube-renderer', 'index.jsx');

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

export async function buildYoutubeRenderPlan(projectDirectory) {
  const projectDir = path.resolve(projectDirectory);
  const techDir = path.join(projectDir, '99-technik');
  const mapping = await readJson(path.join(techDir, 'BILD_AUDIO_ZUORDNUNG.json'));
  const timeline = await readJson(path.join(techDir, 'FINAL_TIMELINE.json'));
  const mapByNumber = new Map((mapping.images ?? []).map((item) => [Number(item.imageNumber), item]));
  const images = [];

  for (const time of timeline.images ?? []) {
    const item = mapByNumber.get(Number(time.imageNumber));
    if (!item) throw new Error(`FINAL_TIMELINE verweist auf unbekanntes Bild ${time.imageNumber}.`);
    const relative = path.posix.join('00-bildprompts', String(item.batchFolder), String(item.imageFile));
    const absolute = path.join(projectDir, relative);
    if (!(await exists(absolute))) throw new Error(`Bild fehlt: ${relative}`);
    images.push({
      imageNumber: Number(item.imageNumber),
      file: relative,
      startSeconds: Number(time.startSeconds),
      endSeconds: Number(time.endSeconds)
    });
  }

  const audioFile = String(timeline.audioMaster || mapping.audioMasterFile || '');
  if (!audioFile) throw new Error('Master-Audio fehlt in FINAL_TIMELINE/Mapping.');
  if (!(await exists(path.join(projectDir, audioFile)))) throw new Error(`Master-Audio fehlt: ${audioFile}`);
  const durationSeconds = Number(images.at(-1)?.endSeconds ?? 0);
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) throw new Error('Ungültige Renderdauer.');

  return { version: 1, width: 1920, height: 1080, fps: 30, durationSeconds, audioFile, images };
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
