#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { createReelWorkspace } from '../core/workspace.js';
import { prepareReelProduction } from '../core/production-brief.js';
import { findNextFreeProductionSlot } from '../core/next-slot.js';
import { ensureImagePromptBundleDirectory } from '../core/image-prompt-bundle.js';
import { ensureHumanReelView } from '../core/human-reel-view.js';

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
  --scenes        Anzahl der Bildmomente: 12 bis 14 (optional, Standard: 13)
                  Ziel: 55–60 Sekunden bei ungefähr 1,10x
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
  const sceneCount = Number(getArgument('--scenes') ?? 13);
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
  const promptBundle = await ensureImagePromptBundleDirectory(result.reelDirectory);
  const production = await prepareReelProduction(result.reelDirectory);
  const humanView = await ensureHumanReelView(result.reelDirectory, { hideTechnicalInFinder: true });

  if (selectedSlot) {
    console.log(`Automatisch gewählter Termin: ${selectedSlot.weekday}, ${selectedSlot.dateValue}`);
  }
  console.log(`Reel-Arbeitsordner erstellt: ${result.reelDirectory}`);
  console.log(`Szenen: ${result.reel.sceneCount}`);
  console.log(`Zieldauer: ${result.reel.targetDurationSeconds} Sekunden`);
  console.log(`Codex-Auftrag: ${production.taskFile}`);
  console.log(`Chronologische Bildprompt-Datei: ${promptBundle.file}`);
  console.log(`Übersichtliche Ordner: ${humanView.visibleFolders.join(', ')}`);
  if (humanView.finder.applied) console.log('Technische Ordner wurden im macOS Finder ausgeblendet.');
  console.log('Nach Fertigstellung aller Bildprompts verpflichtend export:prompts --strict ausführen.');
  console.log('Pflicht: production/agent-task.md jetzt vollständig bearbeiten und check:content --strict ausführen. Nicht nach der Ordnererstellung stoppen.');
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
