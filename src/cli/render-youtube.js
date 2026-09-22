#!/usr/bin/env node

import { renderYoutube } from '../core/youtube-remotion-renderer.js';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const dir = arg('--dir');
  if (!dir) throw new Error('Nutzung: npm run render:youtube -- --dir "youtube/<woche>/<thema>"');
  let last = -1;
  const report = await renderYoutube(dir, {
    output: arg('--output') ?? null,
    crf: Number(arg('--crf') ?? 18),
    concurrency: arg('--concurrency') ?? null,
    onProgress: ({ stage, progress }) => {
      const percent = Math.floor(Number(progress ?? 0) * 100);
      if (percent !== last && (percent % 5 === 0 || percent === 100)) {
        console.log(`${stage === 'bundle' ? 'Bundle' : 'Render'}: ${percent}%`);
        last = percent;
      }
    }
  });
  console.log(`YouTube-Render fertig: ${report.outputFile}`);
  console.log(`Größe: ${(report.outputBytes / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((error) => {
  console.error(`YouTube Render: FEHLER — ${error.message}`);
  process.exitCode = 1;
});
