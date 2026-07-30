#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { createReelWorkspace } from '../core/workspace.js';
import { prepareReelProduction } from '../core/production-brief.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function showUsage() {
  console.log(`
Erstellt einen neuen Reel-Arbeitsordner und den dazugehörigen Codex-Produktionsauftrag.

Beispiel:
  npm run create:reel -- --title "Was bedeutet links und rechts?" --script-file input/script.txt

Optionen:
  --title         Titel des Reels
  --script-file   Pfad zum deutschen Sprechertext
  --date          Produktionsdatum im Format YYYY-MM-DD (optional)
  --scenes        Anzahl der Bildmomente: 8, 9 oder 10 (optional, Standard: 9)
  --output        Ausgabeordner (optional, Standard: content)
`);
}

async function main() {
  if (process.argv.includes('--help')) {
    showUsage();
    return;
  }

  const title = getArgument('--title');
  const scriptFile = getArgument('--script-file');
  const dateValue = getArgument('--date');
  const sceneCount = Number(getArgument('--scenes') ?? 9);
  const outputRoot = getArgument('--output') ?? 'content';

  if (!title || !scriptFile) {
    showUsage();
    process.exitCode = 1;
    return;
  }

  const script = await readFile(scriptFile, 'utf8');
  const date = dateValue ? new Date(`${dateValue}T12:00:00`) : new Date();
  const result = await createReelWorkspace({ title, script, date, sceneCount, outputRoot });
  const production = await prepareReelProduction(result.reelDirectory);

  console.log(`Reel-Arbeitsordner erstellt: ${result.reelDirectory}`);
  console.log(`Szenen: ${result.reel.sceneCount}`);
  console.log(`Codex-Auftrag: ${production.taskFile}`);
  console.log('Nächster Schritt: production/agent-task.md vollständig durch Codex bearbeiten lassen.');
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
