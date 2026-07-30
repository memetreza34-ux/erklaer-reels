#!/usr/bin/env node

import { applyAssetMap, buildAssetInventory } from '../core/asset-ingest.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const reelDirectory = getArgument('--dir');
  const shouldApply = process.argv.includes('--apply');

  if (!reelDirectory) {
    console.log('Usage: npm run organize:assets -- --dir <reel-directory> [--apply]');
    process.exitCode = 1;
    return;
  }

  if (shouldApply) {
    const report = await applyAssetMap(reelDirectory);
    console.log(`Scenes: ${report.summary.assignedScenes}/${report.summary.totalScenes}`);
    console.log(`Audio: ${report.summary.audioReady ? 'ready' : 'missing'}`);
    console.log(`Cover: ${report.summary.coverReady ? 'ready' : 'missing'}`);
    console.log(`Skipped: ${report.skipped.length}`);
    return;
  }

  const inventory = await buildAssetInventory(reelDirectory);
  console.log(`Images found: ${inventory.candidates.images.length}`);
  console.log(`Audio files found: ${inventory.candidates.audio.length}`);
  console.log('Fill inbox/asset-map.json, then run again with --apply.');
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
