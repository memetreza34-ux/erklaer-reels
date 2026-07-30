#!/usr/bin/env node

import { calculateReelProgress } from '../core/reel-progress.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function yesNo(value) {
  return value ? 'ja' : 'nein';
}

async function main() {
  const reelDirectory = getArgument('--dir');
  const asJson = process.argv.includes('--json');

  if (!reelDirectory) {
    console.log('Verwendung: npm run status:reel -- --dir "content/.../reel-01_titel" [--json]');
    process.exitCode = 1;
    return;
  }

  const progress = await calculateReelProgress(reelDirectory);
  if (asJson) {
    console.log(JSON.stringify(progress, null, 2));
    return;
  }

  console.log(`${progress.title || progress.reelId}`);
  console.log(`Vorproduktion: ${progress.preProduction}%`);
  console.log(`Externe Assets: ${progress.assets}%`);
  console.log(`Gesamtstand: ${progress.overall}%`);
  console.log('');
  console.log(`Scripts fertig: ${yesNo(progress.details.scriptsReady)}`);
  console.log(`Bildwelt festgelegt: ${yesNo(progress.details.styleReady)}`);
  console.log(`Szenen geplant: ${progress.details.scenesReady}`);
  console.log(`Bildprompts fertig: ${progress.details.promptsReady}`);
  console.log(`Cover-Prompt fertig: ${yesNo(progress.details.coverPromptReady)}`);
  console.log(`Inhaltsprüfung bestanden: ${yesNo(progress.details.contentCheckReady)}`);
  console.log(`Szenenbilder übernommen: ${progress.details.sceneImagesReady}`);
  console.log(`Audio übernommen: ${yesNo(progress.details.audioReady)}`);
  console.log(`Cover übernommen: ${yesNo(progress.details.coverImageReady)}`);
  console.log('');
  console.log(`Nächster Schritt: ${progress.nextStep}`);
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
