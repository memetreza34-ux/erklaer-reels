#!/usr/bin/env node

import { alignYoutubeProject } from '../core/youtube-audio-alignment.js';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function usage() {
  console.log(`
Misst jeden YouTube-Bildanker am tatsächlich gesprochenen Wort.

Verwendung:
  npm run auto-align:youtube -- --dir "youtube/<woche>/<thema>"

Optionen:
  --audio <datei>   V1: explizite finale Audiodatei
  --model <name>    Whisper-Modell, Standard: small
  --refresh         Wortmessung trotz passendem Fingerprint neu erzeugen
`);
}

async function main() {
  if (process.argv.includes('--help')) return usage();
  const dir = arg('--dir');
  if (!dir) {
    usage();
    process.exitCode = 1;
    return;
  }

  const result = await alignYoutubeProject(dir, {
    audio: arg('--audio') ?? null,
    model: arg('--model') ?? 'small',
    refresh: process.argv.includes('--refresh')
  });

  console.log(`YouTube Audio-Alignment: ${result.missing.length ? 'UNVOLLSTÄNDIG' : 'BESTANDEN'}`);
  console.log(`Gemessene Bildanker: ${result.mapping.autoAlignment.matched}/${result.mapping.autoAlignment.total}`);
  console.log(`Master-Audio: ${result.mapping.audioMasterFile}`);
  console.log(`Messbeleg: ${result.mapping.alignmentEvidenceFile}`);
  for (const miss of result.missing) {
    console.error(`- Bild ${miss.imageNumber}: Anchor nicht gefunden: "${miss.startAnchor}" (${miss.audioFile})`);
  }
  if (result.missing.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`YouTube Audio-Alignment: FEHLER — ${error.message}`);
  process.exitCode = 1;
});
