#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { knownSoundTypes, loadSoundLibrary, reviewSoundDramaturgy, syncReelSounds } from '../core/sound-library.js';

const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  if (process.argv.includes('--types')) {
    const library = await loadSoundLibrary();
    console.log('Verfügbare Sound-Typen:\n');
    for (const entry of library.types ?? []) {
      console.log(`  ${entry.type}`);
      console.log(`      ${entry.purpose}`);
      console.log(`      einsetzen: ${entry.useWhen}`);
      console.log(`      vermeiden: ${entry.avoidWhen}\n`);
    }
    return;
  }

  const reelDirectory = getArgument('--dir');
  if (!reelDirectory) {
    console.log(`
Löst die im Effekt-Plan geplanten Sound-Typen gegen die zentrale Bibliothek auf
und kopiert die benötigten Dateien in den Reel-Ordner.

Beispiele:
  npm run sync:sounds -- --types
  npm run sync:sounds -- --dir "reels/.../reel-01_titel"
  npm run sync:sounds -- --dir "reels/.../reel-01_titel" --strict

Optionen:
  --dir      Pfad zum Reel-Ordner
  --types    Alle verfügbaren Sound-Typen mit Verwendungszweck anzeigen
  --strict   Unbekannte Typen und fehlende Dateien als Fehler behandeln
`);
    process.exitCode = 1;
    return;
  }

  const result = await syncReelSounds(reelDirectory, { strict: process.argv.includes('--strict') });

  if (result.copied.length > 0) console.log(`Kopiert: ${result.copied.join(', ')}`);
  else console.log('Keine neuen Dateien zu kopieren.');

  for (const item of result.unknownTypes) {
    const library = await loadSoundLibrary();
    console.log(`Unbekannter Typ "${item.type}" in ${item.sceneId}. Erlaubt: ${knownSoundTypes(library).join(', ')}`);
  }
  for (const item of result.missingFiles) {
    console.log(`Datei fehlt für "${item.type}": ${item.expected} — siehe assets/sfx/README.md`);
  }

  if (result.unknownTypes.length === 0 && result.missingFiles.length === 0) {
    console.log('Alle geplanten Sounds sind aufgelöst.');
  }

  if (result.planPath) {
    const plan = JSON.parse(await readFile(result.planPath, 'utf8'));
    const rules = JSON.parse(await readFile(path.join(REPO_ROOT, 'config', 'effects-rules.json'), 'utf8'));
    const review = reviewSoundDramaturgy(plan, rules);
    for (const finding of review.findings) {
      if (finding.issue === 'no-sound-on-scene-change') {
        console.log(`Hinweis: ${finding.sceneId} hat keinen Sound am Szenenwechsel.`);
      } else {
        console.log(`Hinweis: ${finding.sceneId} wiederholt den Übergangssound "${finding.type}" direkt.`);
      }
    }
    if (review.passed) console.log('Sound-Dramaturgie: keine Wiederholungen, jeder Wechsel klingt.');
  }
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
