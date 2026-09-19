#!/usr/bin/env node

import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

import {
  compactReelLayout,
  getReelLayout,
  materializeLegacyTechnicalLinks
} from '../core/compact-reel-layout.js';

function runChild(targetScript, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [targetScript, ...args], {
      stdio: 'inherit'
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (signal) {
        resolve(1);
        return;
      }
      resolve(code ?? 1);
    });
  });
}

function argumentValue(args, name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

async function findReelDirectories(rootDirectory) {
  const found = [];
  let weeks = [];
  try {
    weeks = await readdir(rootDirectory, { withFileTypes: true });
  } catch {
    return found;
  }

  for (const week of weeks.filter((entry) => entry.isDirectory())) {
    const weekPath = path.join(rootDirectory, week.name);
    let days = [];
    try {
      days = await readdir(weekPath, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const day of days.filter((entry) => entry.isDirectory())) {
      const dayPath = path.join(weekPath, day.name);
      let reels = [];
      try {
        reels = await readdir(dayPath, { withFileTypes: true });
      } catch {
        continue;
      }

      for (const reel of reels.filter((entry) => entry.isDirectory() && entry.name.startsWith('reel-'))) {
        found.push(path.join(dayPath, reel.name));
      }
    }
  }

  return found;
}

async function prepareCompatibility(reelDirectories) {
  const prepared = [];

  for (const reelDirectory of reelDirectories) {
    let layout;
    try {
      layout = await getReelLayout(reelDirectory);
    } catch {
      continue;
    }
    if (!layout.compact) continue;

    const compatibility = await materializeLegacyTechnicalLinks(layout.outerDirectory);
    prepared.push({ layout, compatibility });
  }

  return prepared;
}

/**
 * Raeumt die temporaeren Kompatibilitaetslinks wieder ab.
 *
 * Das Aufraeumen darf den eigentlichen Lauf nie ueberschreiben: Wenn hier etwas
 * schiefgeht, waehrend zuvor schon der Zielbefehl fehlgeschlagen ist, muss der
 * urspruengliche Fehler sichtbar bleiben. Deshalb werden Aufraeumfehler
 * gesammelt und zurueckgegeben statt geworfen.
 *
 * @param {Array<{layout: object, compatibility: object}>} prepared
 * @returns {Promise<Error[]>} Aufgetretene Aufraeumfehler.
 */
async function cleanupCompatibility(prepared) {
  const failures = [];

  for (const { layout, compatibility } of prepared.reverse()) {
    try {
      await compatibility.cleanup();
      await compactReelLayout(layout.outerDirectory);
    } catch (error) {
      failures.push(
        new Error(`Aufraeumen fehlgeschlagen fuer ${layout.outerDirectory}: ${error.message}`, { cause: error })
      );
    }
  }

  return failures;
}

async function main() {
  const [targetScript, ...args] = process.argv.slice(2);
  if (!targetScript) throw new Error('Internes Wrapper-Skript benötigt ein Zielskript.');

  const requestedDirectory = argumentValue(args, '--dir');
  const allMode = args.includes('--all');

  let reelDirectories = [];
  if (requestedDirectory) {
    reelDirectories = [requestedDirectory];
  } else if (allMode) {
    reelDirectories = await findReelDirectories(argumentValue(args, '--root') ?? 'reels');
  }

  if (reelDirectories.length === 0) {
    process.exitCode = await runChild(targetScript, args);
    return;
  }

  const prepared = await prepareCompatibility(reelDirectories);
  if (prepared.length === 0) {
    process.exitCode = await runChild(targetScript, args);
    return;
  }

  let exitCode = 1;
  let runError = null;
  try {
    exitCode = await runChild(targetScript, args);
  } catch (error) {
    runError = error;
  }

  const cleanupFailures = await cleanupCompatibility(prepared);
  for (const failure of cleanupFailures) {
    console.error(`Warnung: ${failure.message}`);
  }

  // Der Fehler des eigentlichen Befehls hat immer Vorrang vor Aufraeumproblemen.
  if (runError) throw runError;
  if (exitCode === 0 && cleanupFailures.length > 0) {
    console.error('Der Lauf war erfolgreich, aber das Reel-Layout konnte nicht vollstaendig zurueckgesetzt werden.');
    console.error('Bitte "npm run compact:reel -- --dir <reel>" ausfuehren, bevor der naechste Schritt startet.');
    process.exitCode = 1;
    return;
  }

  process.exitCode = exitCode;
}

main().catch((error) => {
  console.error(`Fehler im Reel-Layout-Wrapper: ${error.message}`);
  process.exitCode = 1;
});
