import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { verifyAudioPacingFileBinding } from './audio-pacing-file-guard.js';
import { ensureHumanReelView } from './human-reel-view.js';
import { validateRendererInput } from './render-validator.js';
import { verifyRequiredSourceQuality } from './source-quality-file-guard.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const entryPoint = path.resolve(currentDirectory, '..', 'renderer', 'index.jsx');

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function outputPathFor(reelDirectory, plan, requestedOutput) {
  if (requestedOutput) return path.resolve(requestedOutput);
  const fileName = `${plan.reelId ?? path.basename(reelDirectory)}.mp4`;
  return path.join(reelDirectory, 'output', fileName);
}

export async function renderReel(reelDirectory, {
  output = null,
  codec = 'h264',
  crf = 18,
  concurrency = null,
  force = false,
  onProgress = null
} = {}) {
  const startedAt = new Date().toISOString();

  await ensureHumanReelView(reelDirectory);

  const sourceGate = await verifyRequiredSourceQuality(reelDirectory);
  if (sourceGate.required && !sourceGate.passed) {
    throw new Error(`${sourceGate.reason} Der Renderer benötigt die verpflichtende Quellen-QC.`);
  }

  const pacingBinding = await verifyAudioPacingFileBinding(reelDirectory);
  if (pacingBinding.required && !pacingBinding.passed) {
    throw new Error(`${pacingBinding.reason} Der Renderer verwendet keine veralteten Lautheitsmesswerte.`);
  }

  const validation = await validateRendererInput(reelDirectory, {
    requireFinalReadiness: !force
  });
  const validationReportPath = path.join(reelDirectory, 'review', 'renderer-input-report.json');
  await writeJson(validationReportPath, validation);

  if (!validation.passed) {
    const messages = validation.checks
      .filter((check) => !check.passed && check.level === 'error')
      .map((check) => check.message)
      .join('\n- ');
    throw new Error(`Renderer-Eingabe ist nicht bereit:\n- ${messages}`);
  }

  const plan = validation.plan;
  const outputLocation = outputPathFor(reelDirectory, plan, output);
  await mkdir(path.dirname(outputLocation), { recursive: true });

  const reportPath = path.join(reelDirectory, 'review', 'render-execution-report.json');
  try {
    const [{ bundle }, { renderMedia, selectComposition }] = await Promise.all([
      import('@remotion/bundler'),
      import('@remotion/renderer')
    ]);

    const serveUrl = await bundle({
      entryPoint,
      publicDir: path.resolve(reelDirectory),
      onProgress: (progress) => {
        if (onProgress) onProgress({ stage: 'bundle', progress });
      }
    });

    const inputProps = { plan };
    const composition = await selectComposition({
      serveUrl,
      id: 'ErklaerReel',
      inputProps,
      logLevel: 'warn'
    });

    const renderOptions = {
      composition,
      serveUrl,
      codec,
      outputLocation,
      inputProps,
      crf: Number(crf),
      logLevel: 'info',
      onProgress: ({ progress, renderedFrames, encodedFrames }) => {
        if (onProgress) {
          onProgress({
            stage: 'render',
            progress,
            renderedFrames,
            encodedFrames
          });
        }
      }
    };
    if (concurrency !== null) renderOptions.concurrency = Number(concurrency);

    await renderMedia(renderOptions);

    const fileStats = await stat(outputLocation);
    const report = {
      version: 2,
      startedAt,
      finishedAt: new Date().toISOString(),
      passed: true,
      renderer: 'remotion',
      compositionId: 'ErklaerReel',
      codec,
      crf: Number(crf),
      reelDirectory: path.resolve(reelDirectory),
      outputFile: outputLocation,
      outputBytes: fileStats.size,
      subtitlesEnabled: false,
      composition: plan.composition,
      renderedSoundEffects: plan.scenes.reduce(
        (sum, scene) => sum + (scene.soundEffects ?? []).filter((sound) => sound.file).length,
        0
      ),
      validationReport: path.relative(reelDirectory, validationReportPath).split(path.sep).join('/')
    };
    await writeJson(reportPath, report);

    const statusPath = path.join(reelDirectory, 'status.json');
    const status = await readJson(statusPath);
    status.subtitles = 'disabled';
    status.wordSync = 'not-required';
    status.render = 'complete';
    status.renderedFile = path.relative(reelDirectory, outputLocation).split(path.sep).join('/');
    status.visibleRenderedFile = '04-video/FERTIGES-VIDEO';
    status.qualityControl = 'render-complete';
    await writeJson(statusPath, status);

    return report;
  } catch (error) {
    const report = {
      version: 2,
      startedAt,
      finishedAt: new Date().toISOString(),
      passed: false,
      renderer: 'remotion',
      codec,
      reelDirectory: path.resolve(reelDirectory),
      outputFile: outputLocation,
      subtitlesEnabled: false,
      error: error.message
    };
    await writeJson(reportPath, report);
    throw error;
  }
}
