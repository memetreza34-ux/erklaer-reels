import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { verifyAudioPacingFileBinding } from './audio-pacing-file-guard.js';
import { ensureHumanReelView } from './human-reel-view.js';
import { validateRendererInput } from './render-validator.js';
import { verifyRequiredSourceQuality } from './source-quality-file-guard.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const entryPoint = path.resolve(currentDirectory, '..', 'renderer', 'index.jsx');
const EXPORT_VIDEO_NAME = 'FERTIGES-REEL.mp4';
const EXPORT_CAPTION_NAME = 'UNIVERSELLE-CAPTION.txt';
const CAPTION_MIN_WORDS = 60;
const CAPTION_MAX_WORDS = 130;
const HOOK_MIN_WORDS = 4;
const HOOK_MAX_WORDS = 24;
const HASHTAG_MINIMUM = 3;
const HASHTAG_MAXIMUM = 6;

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function exportVideoPathFor(reelDirectory) {
  return path.join(reelDirectory, 'export', EXPORT_VIDEO_NAME);
}

function exportCaptionPathFor(reelDirectory) {
  return path.join(reelDirectory, 'export', EXPORT_CAPTION_NAME);
}

function outputPathFor(reelDirectory, requestedOutput) {
  if (requestedOutput) return path.resolve(requestedOutput);
  return exportVideoPathFor(reelDirectory);
}

function wordsIn(text) {
  return String(text ?? '').match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? [];
}

function validateUniversalCaption(caption) {
  const text = String(caption ?? '').trim();
  if (!text) {
    throw new Error('caption/caption.txt ist leer. Vor dem Rendern ist eine individuelle Universal-Caption Pflicht.');
  }

  const wordCount = wordsIn(text).length;
  if (wordCount < CAPTION_MIN_WORDS || wordCount > CAPTION_MAX_WORDS) {
    throw new Error(`Die Universal-Caption muss ${CAPTION_MIN_WORDS}–${CAPTION_MAX_WORDS} Wörter haben; aktuell sind es ${wordCount}.`);
  }

  const firstLine = text.split(/\r?\n/).map((line) => line.trim()).find(Boolean) ?? '';
  const hookWordCount = wordsIn(firstLine).length;
  if (hookWordCount < HOOK_MIN_WORDS || hookWordCount > HOOK_MAX_WORDS) {
    throw new Error(`Die erste Caption-Zeile muss eine klare Hook mit ${HOOK_MIN_WORDS}–${HOOK_MAX_WORDS} Wörtern sein; aktuell sind es ${hookWordCount}.`);
  }

  const hashtags = text.match(/#[\p{L}\p{N}_]+/gu) ?? [];
  if (hashtags.length < HASHTAG_MINIMUM || hashtags.length > HASHTAG_MAXIMUM) {
    throw new Error(`Die Universal-Caption braucht ${HASHTAG_MINIMUM}–${HASHTAG_MAXIMUM} passende Hashtags; aktuell sind es ${hashtags.length}.`);
  }

  const platformSpecific = /\b(link in bio|duett|remix|story teilen|instagram|tiktok|youtube|facebook)\b/i;
  if (platformSpecific.test(text)) {
    throw new Error('Die Universal-Caption enthält plattformspezifische Formulierungen oder Plattformnamen. Sie muss für alle Social-Media-Accounts neutral bleiben.');
  }

  return { text, wordCount, hookWordCount, hashtags };
}

async function writeUniversalCaption(reelDirectory) {
  const sourcePath = path.join(reelDirectory, 'caption', 'caption.txt');
  const exportPath = exportCaptionPathFor(reelDirectory);
  let sourceCaption;
  try {
    sourceCaption = await readFile(sourcePath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error('caption/caption.txt fehlt. Vor dem Rendern ist eine individuelle Universal-Caption Pflicht.');
    }
    throw error;
  }

  const validation = validateUniversalCaption(sourceCaption);
  await mkdir(path.dirname(exportPath), { recursive: true });
  await writeFile(exportPath, `${validation.text}\n`, 'utf8');

  return {
    file: exportPath,
    source: 'caption/caption.txt',
    fallbackUsed: false,
    wordCount: validation.wordCount,
    hookWordCount: validation.hookWordCount,
    hashtagCount: validation.hashtags.length
  };
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

  const captionExport = await writeUniversalCaption(reelDirectory);
  const plan = validation.plan;
  const outputLocation = outputPathFor(reelDirectory, output);
  const canonicalExportVideo = exportVideoPathFor(reelDirectory);
  await mkdir(path.dirname(outputLocation), { recursive: true });
  await mkdir(path.dirname(canonicalExportVideo), { recursive: true });

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

    if (path.resolve(outputLocation) !== path.resolve(canonicalExportVideo)) {
      await copyFile(outputLocation, canonicalExportVideo);
    }

    // Die sichtbare Verknüpfung unter 03-export/ entsteht erst jetzt: Vor dem Render
    // zeigte sie auf eine noch nicht existierende Datei und hätte das Bündeln gebrochen.
    await ensureHumanReelView(reelDirectory);

    const fileStats = await stat(canonicalExportVideo);
    const report = {
      version: 4,
      startedAt,
      finishedAt: new Date().toISOString(),
      passed: true,
      renderer: 'remotion',
      compositionId: 'ErklaerReel',
      codec,
      crf: Number(crf),
      reelDirectory: path.resolve(reelDirectory),
      outputFile: canonicalExportVideo,
      renderedOutputFile: outputLocation,
      exportVideoFile: canonicalExportVideo,
      exportCaptionFile: captionExport.file,
      exportCaptionSource: captionExport.source,
      exportCaptionFallbackUsed: false,
      exportCaptionWordCount: captionExport.wordCount,
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
    status.export = 'complete';
    status.renderedFile = path.relative(reelDirectory, canonicalExportVideo).split(path.sep).join('/');
    status.exportedVideoFile = path.relative(reelDirectory, canonicalExportVideo).split(path.sep).join('/');
    status.exportedCaptionFile = path.relative(reelDirectory, captionExport.file).split(path.sep).join('/');
    status.visibleRenderedFile = '03-export/FERTIGES-REEL.mp4';
    status.visibleCaptionFile = '03-export/UNIVERSELLE-CAPTION.txt';
    status.qualityControl = 'render-complete';
    await writeJson(statusPath, status);

    return report;
  } catch (error) {
    const report = {
      version: 4,
      startedAt,
      finishedAt: new Date().toISOString(),
      passed: false,
      renderer: 'remotion',
      codec,
      reelDirectory: path.resolve(reelDirectory),
      outputFile: canonicalExportVideo,
      renderedOutputFile: outputLocation,
      exportCaptionFile: captionExport.file,
      subtitlesEnabled: false,
      error: error.message
    };
    await writeJson(reportPath, report);
    throw error;
  }
}
