import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateYoutubeRendererInput } from './youtube-render-validator.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const entryPoint = path.resolve(currentDirectory, '..', 'renderer', 'index.jsx');

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export async function renderYoutubeVideo(projectDirectory, {
  output = null,
  codec = 'h264',
  crf = 18,
  concurrency = null,
  onProgress = null
} = {}) {
  const root = path.resolve(projectDirectory);
  const validation = await validateYoutubeRendererInput(root, { requireFinalReadiness: true });
  await writeJson(path.join(root, '08-edit', 'renderer-input-report.json'), validation);
  if (!validation.passed) {
    const messages = validation.checks.filter((entry) => !entry.passed && entry.level === 'error').map((entry) => entry.message).join('\n- ');
    throw new Error(`YouTube-Renderer-Eingabe ist nicht bereit:\n- ${messages}`);
  }

  const plan = validation.plan;
  const video = validation.video;
  const outputLocation = output ? path.resolve(output) : path.join(root, '10-output', `${video.videoId}.mp4`);
  await mkdir(path.dirname(outputLocation), { recursive: true });
  const startedAt = new Date().toISOString();
  const [{ bundle }, { renderMedia, selectComposition }] = await Promise.all([
    import('@remotion/bundler'),
    import('@remotion/renderer')
  ]);
  const serveUrl = await bundle({
    entryPoint,
    publicDir: root,
    onProgress: (progress) => onProgress?.({ stage: 'bundle', progress })
  });
  const inputProps = { plan };
  const composition = await selectComposition({ serveUrl, id: 'YoutubeExplainer', inputProps, logLevel: 'warn' });
  const renderOptions = {
    composition,
    serveUrl,
    codec,
    outputLocation,
    inputProps,
    crf: Number(crf),
    logLevel: 'info',
    onProgress: ({ progress, renderedFrames, encodedFrames }) => onProgress?.({ stage: 'render', progress, renderedFrames, encodedFrames })
  };
  if (concurrency !== null) renderOptions.concurrency = Number(concurrency);
  await renderMedia(renderOptions);
  const fileStats = await stat(outputLocation);
  const report = {
    schemaVersion: 1,
    passed: true,
    startedAt,
    finishedAt: new Date().toISOString(),
    compositionId: 'YoutubeExplainer',
    outputFile: outputLocation,
    outputBytes: fileStats.size,
    composition: plan.composition,
    subtitlesRendered: 0,
    finalVideoQcRequired: true
  };
  await writeJson(path.join(root, '08-edit', 'render-execution-report.json'), report);
  const status = await readJson(path.join(root, 'status.json'));
  status.phase = 'phase-3-antigravity';
  status.render = 'rendered-needs-final-video-qc';
  status.renderedFile = path.relative(root, outputLocation).split(path.sep).join('/');
  await writeJson(path.join(root, 'status.json'), status);
  return report;
}
