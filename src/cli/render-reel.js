#!/usr/bin/env node

import path from 'node:path';

import { renderReel } from '../core/remotion-renderer.js';
import { validateRendererInput } from '../core/render-validator.js';
import { verifyAppliedWordSyncAudioBinding } from '../core/word-sync-audio-guard.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function showUsage() {
  console.log(`
Erzeugt aus render/render-plan.json eine fertige MP4-Datei mit Remotion.

Rendern:
  npm run render:reel -- --dir "reels/.../reel-01_titel"

Nur prüfen:
  npm run validate:render -- --dir "reels/.../reel-01_titel"

Optionen:
  --dir          Reel-Ordner
  --output       Ausgabepfad der MP4-Datei
  --codec        Remotion-Codec, Standard: h264
  --crf          Qualitätswert, Standard: 18
  --concurrency  Anzahl paralleler Renderprozesse
  --force        Renderer trotz fehlender finaler Freigabe starten
  --validate-only Nur Render-Plan und Assets prüfen
`);
}

function printValidation(report) {
  console.log(`Renderer-Prüfung: ${report.passed ? 'bestanden' : 'fehlgeschlagen'}`);
  console.log(`Bestanden: ${report.summary.passedChecks}/${report.summary.totalChecks}`);
  console.log(`Fehler: ${report.summary.failedChecks}`);
  console.log(`Warnungen: ${report.summary.warnings}`);
  for (const check of report.checks.filter((item) => !item.passed)) {
    console.log(`- ${check.level.toUpperCase()}: ${check.message}`);
  }
}

async function main() {
  if (process.argv.includes('--help')) {
    showUsage();
    return;
  }

  const reelDirectory = getArgument('--dir');
  if (!reelDirectory) {
    showUsage();
    process.exitCode = 1;
    return;
  }

  const force = process.argv.includes('--force');
  const validateOnly = process.argv.includes('--validate-only');
  const audioBinding = await verifyAppliedWordSyncAudioBinding(reelDirectory);
  if (audioBinding.required && !audioBinding.passed) {
    throw new Error(`${audioBinding.reason} Rendern mit veralteten Wortzeiten ist auch mit --force blockiert.`);
  }

  if (validateOnly) {
    const report = await validateRendererInput(reelDirectory, {
      requireFinalReadiness: !force
    });
    printValidation(report);
    if (audioBinding.required) console.log('Word-Sync-Audio: Fingerprint unverändert');
    if (!report.passed) process.exitCode = 1;
    return;
  }

  let lastPercent = -1;
  const report = await renderReel(reelDirectory, {
    output: getArgument('--output'),
    codec: getArgument('--codec') ?? 'h264',
    crf: Number(getArgument('--crf') ?? 18),
    concurrency: getArgument('--concurrency') ?? null,
    force,
    onProgress: ({ stage, progress }) => {
      const percent = Math.floor(Number(progress ?? 0) * 100);
      if (percent !== lastPercent && (percent % 5 === 0 || percent === 100)) {
        console.log(`${stage === 'bundle' ? 'Bundle' : 'Render'}: ${percent}%`);
        lastPercent = percent;
      }
    }
  });

  console.log('MP4 erfolgreich erzeugt.');
  if (audioBinding.required) console.log('Word-Sync-Audio: Fingerprint unverändert');
  console.log(`Datei: ${path.resolve(report.outputFile)}`);
  console.log(`Größe: ${(report.outputBytes / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
