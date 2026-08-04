#!/usr/bin/env node

import { ensureHumanReelView } from '../core/human-reel-view.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const reelDirectory = getArgument('--dir');
  const showTechnical = process.argv.includes('--show-technical');

  if (!reelDirectory) {
    console.log('Verwendung: npm run organize:finder -- --dir "content/.../reel-01_titel"');
    process.exitCode = 1;
    return;
  }

  const result = await ensureHumanReelView(reelDirectory, {
    hideTechnicalInFinder: !showTechnical
  });

  console.log('Übersichtliche Reel-Ansicht erstellt:');
  for (const folder of result.visibleFolders) console.log(`- ${folder}`);

  if (result.finder.applied) {
    console.log(`Technische Einträge wurden im macOS Finder ausgeblendet: ${result.finder.hiddenCount}`);
  } else if (showTechnical) {
    console.log('Technische Einträge bleiben sichtbar.');
  } else {
    console.log(`Finder-Ausblendung nicht angewendet: ${result.finder.reason}`);
  }
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
