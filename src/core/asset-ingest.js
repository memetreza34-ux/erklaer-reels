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
    throw new Error('--numbered und --apply nicht gleichzeitig verwenden.');
  }

  if (shouldApply) {
    // Simple Mode: vollständige Bild-01..NN-Sets werden vor dem Apply automatisch
    // auf die globale Bildreihenfolge gemappt. Keine manuelle asset-map-Runde nötig.
    const numbered = await prepareNumberedImageAssignments(reelDirectory, { skipWhenEmpty: true });
    if (numbered) {
      console.log(`Numbered routing: ${numbered.assignedCount}/${numbered.plannedImageCount}`);
      if (numbered.unmatchedCount > 0) console.log(`Numbered conflicts: ${numbered.unmatchedCount}`);
    }

    const report = await applyAssetMap(reelDirectory);
    console.log(`Images: ${report.summary.assignedImages}/${report.summary.totalImages}`);
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
    console.log('Agent must inspect candidates and choose the one belonging to this Reel; user question only if they cannot be distinguished safely.');
  } else if (discovery.imageDiscovery.ambiguousLooseSets?.length > 0) {
    console.log(`Multiple complete loose image sets found: ${discovery.imageDiscovery.ambiguousLooseSets.length}`);
    for (const candidate of discovery.imageDiscovery.ambiguousLooseSets) console.log(`- ${candidate}`);
  } else if (!discovery.imageDiscovery.alreadyComplete) {
    console.log('No complete external numbered image set found after searching Reel folder, Downloads and Desktop.');
  }

  if (discovery.audioDiscovery?.staged) {
    console.log(`External audio staged: ${discovery.audioDiscovery.staged.source}`);
  } else if (discovery.audioDiscovery?.candidates?.length > 0) {
    console.log(`Audio candidates found: ${discovery.audioDiscovery.candidates.length}`);
  }

  const numbered = await prepareNumberedImageAssignments(reelDirectory, { skipWhenEmpty: !numberedOnly });
  if (numbered) {
    console.log(`Numbered images found: ${numbered.candidateCount}`);
    console.log(`Targets preassigned: ${numbered.assignedCount}`);
    console.log(`Unmatched/conflicts: ${numbered.unmatchedCount}`);
    console.log('Numbered global order is ready. Run --apply; check:visuals performs the fast one-pass QC afterward.');
    return;
  }

  const inventory = await buildAssetInventory(reelDirectory);
  console.log(`Images found: ${inventory.candidates.images.length}`);
  console.log(`Audio files found: ${inventory.candidates.audio.length}`);
  console.log('If images are not numbered, fill inbox/asset-map.json once; otherwise use numbered images for the fast path.');
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
