#!/usr/bin/env node

import { getReelLayout, compactReelLayout } from '../core/compact-reel-layout.js';
import { ensureHumanReelView } from '../core/human-reel-view.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const reelDirectory = getArgument('--dir');
  if (!reelDirectory) {
    console.log('Verwendung: npm run compact:reel -- --dir "reels/.../reel-01_titel"');
    process.exitCode = 1;
    return;
  }

  const layout = await getReelLayout(reelDirectory);
  if (!layout.compact) {
    await ensureHumanReelView(layout.outerDirectory, { hideTechnicalInFinder: false });
  }

  const result = await compactReelLayout(layout.outerDirectory);

  console.log(`Reel dauerhaft aufgeräumt: ${result.outerDirectory}`);
  console.log('Außen bleiben nur: 00-bildprompts, 01-voice-script, 02-audio, 03-export, 99-technik');
  console.log(`Verschobene technische Einträge: ${result.movedEntries.length}`);
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
