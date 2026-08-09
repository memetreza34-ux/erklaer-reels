#!/usr/bin/env node

import { applyAssetMap, buildAssetInventory } from '../core/asset-ingest.js';
import { prepareNumberedImageAssignments } from '../core/numbered-image-import.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const reelDirectory = getArgument('--dir');
  const shouldApply = process.argv.includes('--apply');
  const numberedOnly = process.argv.includes('--numbered');

  if (!reelDirectory) {
    console.log('Usage: npm run organize:assets -- --dir <reel-directory> [--numbered | --apply]');
    process.exitCode = 1;
    return;
  }

  if (numberedOnly && shouldApply) {
    throw new Error('--numbered und --apply nicht gleichzeitig verwenden. Erst nummeriert vorsortieren, dann visuell prüfen und danach --apply ausführen.');
  }

  if (shouldApply) {
    const report = await applyAssetMap(reelDirectory);
    console.log(`Scenes: ${report.summary.assignedScenes}/${report.summary.totalScenes}`);
    console.log(`Audio: ${report.summary.audioReady ? 'ready' : 'missing'}`);
    console.log(`Cover: ${report.summary.coverReady ? 'ready' : 'missing'}`);
    console.log(`Skipped: ${report.skipped.length}`);
    return;
  }

  const numbered = await prepareNumberedImageAssignments(reelDirectory, {
    skipWhenEmpty: !numberedOnly
  });

  if (numbered) {
    console.log(`Numbered images found: ${numbered.candidateCount}`);
    console.log(`Targets preassigned: ${numbered.assignedCount}`);
    console.log(`Unmatched/conflicts: ${numbered.unmatchedCount}`);
    console.log('Mapping: 00 -> cover, 01 -> scene 1, 02 -> scene 2, ...');
    console.log('The filename only preselects the target. Open every image and complete the visual QC fields in inbox/asset-map.json before --apply.');
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
