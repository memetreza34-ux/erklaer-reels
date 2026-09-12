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
    throw new Error('--numbered und --apply getrennt ausführen: zuerst automatisch routen, danach übernehmen.');
  }

  if (shouldApply) {
    const report = await applyAssetMap(reelDirectory);
    console.log(`Bilder übernommen: ${report.summary.assignedImages}/${report.summary.totalImages}`);
    console.log(`Audio: ${report.summary.audioReady ? 'ready' : 'missing'}`);
    console.log(`Übersprungen: ${report.skipped.length}`);
    if (report.skipped.length > 0 || report.summary.assignedImages !== report.summary.totalImages) {
      process.exitCode = 1;
      console.error('Hard Blocker: Assets konnten nicht vollständig übernommen werden. Nur den konkreten Konflikt beheben; keine Einzel-Freigaben nötig.');
    }
    return;
  }

  if (numberedOnly) {
    const numbered = await prepareNumberedImageAssignments(reelDirectory);
    console.log(`Nummerierte Bilder: ${numbered.candidateCount}`);
    console.log(`Automatisch geroutet: ${numbered.assignedCount}/${numbered.plannedImageCount}`);
    console.log(`Audio automatisch zugeordnet: ${numbered.audioAssigned ? 'ja' : 'nein'}`);
    console.log(`Hard Blocker: ${numbered.hardBlockerCount}`);
    console.log('Routing-Regel: Bild 01 → erster geplanter Bildmoment, Bild 02 → zweiter usw.');
    console.log('Keine per-Bild-Beschreibungen oder zweite Zuordnungsprüfung. Der visuelle Check erfolgt später einmal gesammelt.');
    if (numbered.hardBlockerCount > 0) process.exitCode = 1;
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
  } else if (discovery.imageDiscovery.ambiguousLooseSets?.length > 0) {
    console.log(`Multiple complete loose image sets found: ${discovery.imageDiscovery.ambiguousLooseSets.length}`);
    for (const candidate of discovery.imageDiscovery.ambiguousLooseSets) console.log(`- ${candidate}`);
  }

  const numbered = await prepareNumberedImageAssignments(reelDirectory, { skipWhenEmpty: true });
  if (numbered) {
    console.log(`Automatische Nummernzuordnung vorbereitet: ${numbered.assignedCount}/${numbered.plannedImageCount}`);
    console.log('Danach mit --apply übernehmen; keine manuellen QC-Felder ausfüllen.');
    return;
  }

  const inventory = await buildAssetInventory(reelDirectory);
  console.log(`Images found: ${inventory.candidates.images.length}`);
  console.log(`Audio files found: ${inventory.candidates.audio.length}`);
  console.log('Keine vollständige nummerierte Serie gefunden. Nur bei einem echten Zuordnungskonflikt manuell eingreifen.');
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
