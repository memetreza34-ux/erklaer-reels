#!/usr/bin/env node

import { applyAssetMap, buildAssetInventory } from '../core/asset-ingest.js';
import { discoverExternalAssets } from '../core/external-asset-discovery.js';
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
    console.log(`Skipped: ${report.skipped.length}`);
    return;
  }

  const discovery = await discoverExternalAssets(reelDirectory);
  if (discovery.imageDiscovery.importedFrom) {
    console.log(`External images discovered: ${discovery.imageDiscovery.importedFrom.type}`);
    console.log(`Source: ${discovery.imageDiscovery.importedFrom.path}`);
    console.log(`Numbered images staged: ${discovery.imageDiscovery.copiedFiles.length}`);
  } else if (discovery.imageDiscovery.ambiguousCompleteZips?.length > 0) {
    console.log(`Multiple complete ZIP candidates found: ${discovery.imageDiscovery.ambiguousCompleteZips.length}`);
    for (const candidate of discovery.imageDiscovery.ambiguousCompleteZips) console.log(`- ${candidate}`);
    console.log('Agent must inspect the candidates and rerun discover:assets with --zip <verified-candidate>.');
  } else if (discovery.imageDiscovery.ambiguousLooseSets?.length > 0) {
    console.log(`Multiple complete loose image sets found: ${discovery.imageDiscovery.ambiguousLooseSets.length}`);
    for (const candidate of discovery.imageDiscovery.ambiguousLooseSets) console.log(`- ${candidate}`);
  } else if (!discovery.imageDiscovery.alreadyComplete) {
    console.log('No complete external numbered image set found after searching reel folder, Downloads and Desktop.');
  }

  if (discovery.audioDiscovery?.staged) {
    console.log(`External audio staged: ${discovery.audioDiscovery.staged.source}`);
  } else if (discovery.audioDiscovery?.candidates?.length > 0) {
    console.log(`Audio candidates found for review: ${discovery.audioDiscovery.candidates.length}`);
  }

  const numbered = await prepareNumberedImageAssignments(reelDirectory, {
    skipWhenEmpty: !numberedOnly
  });

  if (numbered) {
    console.log(`Numbered images found: ${numbered.candidateCount}`);
    console.log(`Targets preassigned: ${numbered.assignedCount}`);
    console.log(`Unmatched/conflicts: ${numbered.unmatchedCount}`);
    console.log('Mapping: 01 -> Szene 1 (zugleich Titelbild), 02 -> Szene 2, ...');
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
