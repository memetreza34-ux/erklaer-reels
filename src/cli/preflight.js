#!/usr/bin/env node

/**
 * Prüft vor einem Produktionslauf, ob die externen Werkzeuge vorhanden sind.
 *
 * Ohne diesen Check fällt ein fehlendes ffprobe erst in Schritt 6 von 10 auf -
 * nachdem trim:pauses das Audio bereits neu geschrieben hat.
 */

import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const REQUIRED_TOOLS = [
  { command: 'ffmpeg', args: ['-version'], purpose: 'Audio schneiden, normalisieren und rendern' },
  { command: 'ffprobe', args: ['-version'], purpose: 'Audiodauer und Cue-Zeiten bestimmen' },
  { command: 'unzip', args: ['-v'], purpose: 'Bild-Archive aus Google Flow entpacken' }
];

/**
 * @returns {{missing: Array<{command: string, purpose: string}>, found: string[]}}
 */
export function checkExternalTools(tools = REQUIRED_TOOLS) {
  const missing = [];
  const found = [];

  for (const tool of tools) {
    const result = spawnSync(tool.command, tool.args, { stdio: 'ignore' });
    if (result.error || result.status !== 0) {
      missing.push(tool);
    } else {
      found.push(tool.command);
    }
  }

  return { missing, found };
}

function main() {
  const { missing, found } = checkExternalTools();

  for (const command of found) console.log(`OK: ${command}`);

  if (missing.length === 0) {
    console.log('\nAlle externen Werkzeuge vorhanden.');
    return;
  }

  console.error('\nFehlende Werkzeuge:');
  for (const tool of missing) {
    console.error(`  - ${tool.command} — ${tool.purpose}`);
  }
  console.error('\nAuf macOS: brew install ffmpeg');
  process.exitCode = 1;
}

// pathToFileURL loest beides: relative argv-Pfade und Sonderzeichen im Pfad.
// Ein direkter Stringvergleich scheitert z. B. bei Umlauten, weil import.meta.url
// sie prozentkodiert (Erkl%C3%A4r-Reels), process.argv[1] aber nicht.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
