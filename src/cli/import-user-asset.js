#!/usr/bin/env node

import path from 'node:path';

import { getReelLayout } from '../core/compact-reel-layout.js';
import { copyUserAssetSafely } from '../core/user-asset-safety.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function usage() {
  console.log(`
Kopiert ein Nutzerasset sicher in das aktuelle Reel. Das Original wird nie verschoben oder gelöscht.

Beispiele:
  npm run import:user-asset -- --dir "reels/.../reel-01_thema" --source "$HOME/Downloads/download.zip" --kind images
  npm run import:user-asset -- --dir "reels/.../reel-01_thema" --source "$HOME/Downloads/voice.mp4" --kind audio

Optionen:
  --dir      aktueller Reel-Ordner
  --source   Quelldatei
  --kind     images oder audio
  --name     optionaler Zieldateiname

Sicherheitsregeln:
- Quelle aus einem anderen Reel wird blockiert.
- Es wird ausschließlich kopiert, niemals verschoben.
- Bestehende Zieldateien werden niemals überschrieben.
`);
}

async function main() {
  if (process.argv.includes('--help')) return usage();

  const reelDirectory = getArgument('--dir');
  const sourcePath = getArgument('--source');
  const kind = getArgument('--kind');
  const targetFileName = getArgument('--name') ?? null;

  if (!reelDirectory || !sourcePath || !['images', 'audio'].includes(kind)) {
    usage();
    process.exitCode = 1;
    return;
  }

  const layout = await getReelLayout(reelDirectory);
  const inboxRoot = path.join(layout.technicalDirectory, 'inbox');
  const targetDirectory = kind === 'images'
    ? path.join(inboxRoot, 'numbered-images')
    : path.join(inboxRoot, 'audio');

  const result = await copyUserAssetSafely({
    targetReelDirectory: layout.outerDirectory,
    sourcePath,
    targetDirectory,
    targetFileName
  });

  console.log(`Sicher kopiert: ${result.destination}`);
  console.log(`Original unverändert: ${result.source}`);
}

main().catch((error) => {
  console.error(`Sicherheitsfehler: ${error.message}`);
  process.exitCode = 1;
});
