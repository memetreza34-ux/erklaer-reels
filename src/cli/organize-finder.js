#!/usr/bin/env node

import { readdir } from 'node:fs/promises';
import path from 'node:path';

import { ensureHumanReelView } from '../core/human-reel-view.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

/** Sucht alle Reel-Ordner unter reels/<woche>/<wochentag>/reel-*. */
async function findeAlleReels(wurzel) {
  const gefunden = [];
  let wochen = [];
  try {
    wochen = await readdir(wurzel, { withFileTypes: true });
  } catch {
    return gefunden;
  }

  for (const woche of wochen.filter((eintrag) => eintrag.isDirectory())) {
    const wochenPfad = path.join(wurzel, woche.name);
    const tage = await readdir(wochenPfad, { withFileTypes: true });
    for (const tag of tage.filter((eintrag) => eintrag.isDirectory())) {
      const tagPfad = path.join(wochenPfad, tag.name);
      const reels = await readdir(tagPfad, { withFileTypes: true });
      for (const reel of reels.filter((eintrag) => eintrag.isDirectory() && eintrag.name.startsWith('reel-'))) {
        gefunden.push(path.join(tagPfad, reel.name));
      }
    }
  }
  return gefunden;
}

function usage() {
  console.log(`
Räumt die Reel-Ansicht auf. Im normalen macOS-Finder bleiben außen nur diese fünf Arbeitsordner sichtbar:
00-bildprompts, 01-voice-script, 02-audio, 03-export und 99-technik.
Alle internen Produktionsdaten sind gesammelt über 99-technik erreichbar.

Beispiele:
  npm run organize:finder -- --all
  npm run organize:finder -- --dir "reels/.../reel-01_titel"
  npm run organize:finder -- --all --show-technical

Optionen:
  --all              alle Reels unter reels/ auf einmal aufräumen
  --dir              einzelner Reel-Ordner
  --root             abweichende Wurzel für --all (Standard: reels)
  --show-technical   technische Root-Einträge nur für Debugging wieder sichtbar machen
`);
}

async function main() {
  if (process.argv.includes('--help')) return usage();

  const showTechnical = process.argv.includes('--show-technical');
  const alle = process.argv.includes('--all');
  const reelDirectory = getArgument('--dir');

  if (!alle && !reelDirectory) {
    usage();
    process.exitCode = 1;
    return;
  }

  const ordner = alle
    ? await findeAlleReels(getArgument('--root') ?? 'reels')
    : [reelDirectory];

  if (ordner.length === 0) {
    console.log('Keine Reel-Ordner gefunden.');
    return;
  }

  let versteckt = 0;
  let ohneAusblendung = 0;
  const uebersprungen = [];

  for (const verzeichnis of ordner) {
    let result;
    try {
      result = await ensureHumanReelView(verzeichnis, { hideTechnicalInFinder: !showTechnical });
    } catch (error) {
      // Ein unvollständiger Ordner darf den Sammellauf nicht abbrechen.
      uebersprungen.push({ verzeichnis, grund: error.message });
      if (ordner.length > 1) console.log(`  ${path.basename(verzeichnis)} — übersprungen`);
      continue;
    }

    if (result.finder.applied) {
      versteckt += result.finder.hiddenCount;
    } else if (!showTechnical) {
      ohneAusblendung += 1;
      if (ordner.length === 1) console.log(`Finder-Ausblendung nicht angewendet: ${result.finder.reason}`);
    }
    if (ordner.length > 1) console.log(`  ${path.basename(verzeichnis)}`);
  }

  console.log('');
  const erledigt = ordner.length - uebersprungen.length;
  console.log(`Aufgeräumt: ${erledigt} Reel${erledigt === 1 ? '' : 's'}`);
  if (uebersprungen.length > 0) {
    console.log(`Übersprungen: ${uebersprungen.length} (unvollständig, z. B. ohne reel.json)`);
    for (const eintrag of uebersprungen.slice(0, 5)) {
      console.log(`  ${path.basename(eintrag.verzeichnis)}`);
    }
  }
  if (showTechnical) {
    console.log('Technische Root-Einträge sind nur für Debugging sichtbar.');
  } else {
    console.log(`Im Finder ausgeblendet: ${versteckt} interne Einträge`);
    if (ohneAusblendung > 0) console.log(`Ohne Finder-Ausblendung geblieben: ${ohneAusblendung}`);
  }
  console.log('');
  console.log('Sichtbar bleiben nur: 00-bildprompts, 01-voice-script, 02-audio, 03-export, 99-technik');
  console.log('Alles Interne ist gesammelt über 99-technik erreichbar.');
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
