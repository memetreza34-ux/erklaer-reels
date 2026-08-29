#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

import { importReelPackage, validateReelPackage } from '../core/reel-package.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function usage() {
  console.log(`
Baut aus einem JSON-Paket ein vollständiges Reel. Damit braucht Phase 1 keinen
Schreibzugriff auf das Repository: Das Sprachmodell liefert nur die Datei.

Beispiele:
  npm run import:reel -- --file reel-paket.json
  npm run import:reel -- --file reel-paket.json --check
  npm run import:reel -- --file reel-paket.json --date 2026-08-30

Optionen:
  --file    Pfad zur JSON-Datei aus Phase 1
  --date    Produktionsdatum YYYY-MM-DD (Standard: heute)
  --output  Ausgabeordner (Standard: reels)
  --check   Nur prüfen, nichts anlegen

Das Format steht in WORKFLOW_PHASEN.md.
`);
}

async function main() {
  if (process.argv.includes('--help')) return usage();

  const datei = getArgument('--file');
  if (!datei) {
    usage();
    process.exitCode = 1;
    return;
  }

  const paket = JSON.parse(await readFile(datei, 'utf8'));
  const probleme = validateReelPackage(paket);

  if (probleme.length > 0) {
    console.error(`Paket unvollständig — ${probleme.length} Punkt(e):`);
    for (const problem of probleme) console.error(`  - ${problem}`);
    process.exitCode = 1;
    return;
  }

  console.log('Paket vollständig.');
  if (process.argv.includes('--check')) return;

  const rohesDatum = getArgument('--date');
  const datum = rohesDatum ? new Date(`${rohesDatum}T12:00:00`) : new Date();
  if (Number.isNaN(datum.getTime())) throw new Error('--date muss das Format YYYY-MM-DD haben.');

  const ergebnis = await importReelPackage(paket, {
    outputRoot: getArgument('--output') ?? 'reels',
    date: datum
  });

  console.log(`Reel angelegt: ${ergebnis.reelDirectory}`);
  console.log(`Szenen: ${ergebnis.sceneCount} | Bilder: ${ergebnis.plannedImageCount} | Wörter: ${ergebnis.wordCount}`);
  console.log('');
  console.log('Nächste Schritte:');
  console.log(`  npm run check:content  -- --dir "${ergebnis.reelDirectory}" --strict`);
  console.log(`  npm run export:prompts -- --dir "${ergebnis.reelDirectory}" --strict`);
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
