#!/usr/bin/env node

import path from 'node:path';
import { renderYoutubeVideo } from '../core/youtube-renderer.js';
import { validateYoutubeRendererInput } from '../core/youtube-render-validator.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const directory = getArgument('--dir');
  if (!directory || process.argv.includes('--help')) {
    console.log('Verwendung: npm run render:youtube -- --dir "youtube/projects/video-XX_slug" [--output DATEI]');
    if (!directory) process.exitCode = 1;
    return;
  }
  if (process.argv.includes('--validate-only')) {
    const report = await validateYoutubeRendererInput(directory, { requireFinalReadiness: true });
    console.log(`YouTube-Renderer-Prüfung: ${report.passed ? 'bestanden' : 'fehlgeschlagen'}`);
    for (const failed of report.checks.filter((entry) => !entry.passed)) console.log(`- ${failed.level.toUpperCase()}: ${failed.message}`);
    if (!report.passed) process.exitCode = 1;
    return;
  }

  let lastPercent = -1;
  const report = await renderYoutubeVideo(directory, {
    output: getArgument('--output') ?? null,
    codec: getArgument('--codec') ?? 'h264',
    crf: Number(getArgument('--crf') ?? 18),
    concurrency: getArgument('--concurrency') ?? null,
    onProgress: ({ stage, progress }) => {
      const percent = Math.floor(Number(progress ?? 0) * 100);
      if (percent !== lastPercent && (percent % 5 === 0 || percent === 100)) {
        console.log(`${stage === 'bundle' ? 'Bundle' : 'Render'}: ${percent}%`);
        lastPercent = percent;
      }
    }
  });
  console.log(`YouTube-MP4 gerendert: ${path.resolve(report.outputFile)}`);
  console.log('Noch erforderlich: finale Video-QC durch Antigravity.');
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
