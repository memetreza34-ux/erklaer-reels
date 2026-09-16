#!/usr/bin/env node

/**
 * Prüft vor einem Produktionslauf, ob die externen Werkzeuge vorhanden sind.
 *
 * Ohne diesen Check fällt ein fehlendes ffprobe erst in Schritt 6 von 10 auf -
 * nachdem trim:pauses das Audio bereits neu geschrieben hat.
 */

import { spawnSync } from 'node:child_process';

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

if (import.meta.url === `file://${process.argv[1]}`) main();
