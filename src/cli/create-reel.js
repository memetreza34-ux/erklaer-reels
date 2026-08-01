#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { createReelWorkspace } from '../core/workspace.js';
import { prepareReelProduction } from '../core/production-brief.js';
import { findNextFreeProductionSlot } from '../core/next-slot.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function showUsage() {
  console.log(`
Erstellt einen neuen Reel-Arbeitsordner und den dazugehörigen Codex-Produktionsauftrag.

Beispiel mit festem Datum:
  npm run create:reel -- --title "Was bedeutet links und rechts?" --script-file input/script.txt --date 2026-08-03

Beispiel mit automatisch nächstem freien Wochentag:
  npm run create:reel -- --title "Was bedeutet links und rechts?" --script-file input/script.txt --next-free

Optionen:
  --title         Titel des Reels
  --script-file   Pfad zum deutschen Sprechertext
  --date          Produktionsdatum im Format YYYY-MM-DD
  --next-free     Chronologisch nächsten freien Tag der neuesten Woche verwenden
  --scenes        Anzahl der Bildmomente: 8 bis 12 (optional, Standard: 10)
                  35–44 Sekunden: meist 8–10
                  45–55 Sekunden: meist 10–12
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
  const useNextFree = process.argv.includes('--next-free');
  const sceneCount = Number(getArgument('--scenes') ?? 10);
  const outputRoot = getArgument('--output') ?? 'content';

  if (!title || !scriptFile) {
    showUsage();
    process.exitCode = 1;
    return;
  }
  if (dateValue && useNextFree) {
    throw new Error('Verwende entweder --date oder --next-free, nicht beides.');
  }

  const script = await readFile(scriptFile, 'utf8');
  let date;
  let selectedSlot = null;

  if (useNextFree) {
    selectedSlot = await findNextFreeProductionSlot({ outputRoot });
    date = selectedSlot.date;
  } else {
    date = dateValue ? new Date(`${dateValue}T12:00:00`) : new Date();
  }

  const result = await createReelWorkspace({ title, script, date, sceneCount, outputRoot });
  const production = await prepareReelProduction(result.reelDirectory);

  if (selectedSlot) {
    console.log(`Automatisch gewählter Termin: ${selectedSlot.weekday}, ${selectedSlot.dateValue}`);
  }
  console.log(`Reel-Arbeitsordner erstellt: ${result.reelDirectory}`);
  console.log(`Szenen: ${result.reel.sceneCount}`);
  console.log(`Codex-Auftrag: ${production.taskFile}`);
  console.log('Pflicht: production/agent-task.md jetzt vollständig bearbeiten und check:content --strict ausführen. Nicht nach der Ordnererstellung stoppen.');
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
