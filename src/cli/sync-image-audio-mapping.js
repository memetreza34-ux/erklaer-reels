#!/usr/bin/env node

import { getReelLayout } from '../core/compact-reel-layout.js';
import { writeReelImageAudioMapping } from '../core/reel-image-audio-mapping.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function usage() {
  console.log(`
Erzeugt oder aktualisiert die kanonische Bild↔Audio-Zuordnung eines Reels.

Beispiel:
  npm run sync:image-audio-map -- --dir "reels/.../reel-01_thema"

Ergebnis:
  <reel>/99-technik/BILD_AUDIO_ZUORDNUNG.json

Die Datei enthält für jeden Bildmoment den exakten gesprochenen Textbereich.
Die realen Sekundenwerte bleiben bis Phase 3 leer und werden am finalen
Voice-over bestimmt.
`);
}

async function main() {
  if (process.argv.includes('--help')) return usage();

  const reelDirectory = getArgument('--dir');
  if (!reelDirectory) {
    usage();
    process.exitCode = 1;
    return;
  }

  const layout = await getReelLayout(reelDirectory);
  const result = await writeReelImageAudioMapping(layout.technicalDirectory);

  console.log(`Bild↔Audio-Zuordnung aktualisiert: ${result.mapping.imageCount} Bildmomente`);
  console.log(result.outputPath);
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
