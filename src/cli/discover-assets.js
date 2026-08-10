#!/usr/bin/env node

import { discoverExternalAssets } from '../core/external-asset-discovery.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const reelDirectory = getArgument('--dir');
  const preferredZipPath = getArgument('--zip');
  if (!reelDirectory) {
    console.log('Usage: npm run discover:assets -- --dir <reel-directory> [--zip <geprüfte-zip>]');
    process.exitCode = 1;
    return;
  }

  const report = await discoverExternalAssets(reelDirectory, { preferredZipPath });
  console.log(`Scanned files: ${report.scannedFiles}`);
  console.log(`Search roots: ${report.searchRoots.join(', ')}`);

  if (report.imageDiscovery.alreadyComplete) {
    console.log('Images: complete numbered set already present.');
  } else if (report.imageDiscovery.importedFrom) {
    console.log(`Images imported from ${report.imageDiscovery.importedFrom.type}: ${report.imageDiscovery.importedFrom.path}`);
    console.log(`Files staged: ${report.imageDiscovery.copiedFiles.length}`);
  } else if (report.imageDiscovery.ambiguousCompleteZips?.length > 0) {
    console.log(`Multiple complete ZIP candidates require agent review: ${report.imageDiscovery.ambiguousCompleteZips.length}`);
    for (const candidate of report.imageDiscovery.ambiguousCompleteZips) console.log(`- ${candidate}`);
    console.log('After content review, rerun with --zip <verified-candidate>. Do not ask the user unless the files cannot be distinguished safely.');
  } else if (report.imageDiscovery.ambiguousLooseSets?.length > 0) {
    console.log(`Multiple complete loose image sets require agent review: ${report.imageDiscovery.ambiguousLooseSets.length}`);
    for (const candidate of report.imageDiscovery.ambiguousLooseSets) console.log(`- ${candidate}`);
  } else {
    console.log('Images: no complete numbered set found.');
  }

  if (report.audioDiscovery?.staged) {
    console.log(`Audio staged: ${report.audioDiscovery.staged.source}`);
  } else if (report.audioDiscovery?.candidates?.length > 0) {
    console.log(`Audio candidates require review: ${report.audioDiscovery.candidates.length}`);
    for (const candidate of report.audioDiscovery.candidates) console.log(`- ${candidate}`);
  } else {
    console.log('Audio: no external candidate found.');
  }

  console.log('Discovery report: inbox/asset-discovery.json');
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
