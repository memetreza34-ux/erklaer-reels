#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { createReelWorkspace } from '../core/workspace.js';
import { prepareReelProduction } from '../core/production-brief.js';
import { findNextFreeProductionSlot } from '../core/next-slot.js';
import { ensureImagePromptBundleDirectory } from '../core/image-prompt-bundle.js';
import { ensureHumanReelView } from '../core/human-reel-view.js';
import { compactReelLayout } from '../core/compact-reel-layout.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function showUsage() {
  console.log(`
Erstellt einen neuen Reel-Arbeitsordner und den dazugehörigen Produktionsauftrag.

Beispiel mit festem Datum:
  npm run create:reel -- --title "Was bedeutet links und rechts?" --script-file input/script.txt --date 2026-08-03

Beispiel mit automatisch nächstem freien Wochentag:
  npm run create:reel -- --title "Was bedeutet links und rechts?" --script-file input/script.txt --next-free

Optionen:
  --title         Titel des Reels
  --script-file   Pfad zum deutschen Sprechertext
  --date          Produktionsdatum im Format YYYY-MM-DD
  --next-free     Chronologisch nächsten freien Tag der neuesten Woche verwenden
  --scenes        Anzahl narrativer Szenen: 8 bis 10 (optional, Standard: 9)
                  Bildanzahl ist fest: Hook 1 Bild, jede weitere Szene 2 Bilder.
                  8 Szenen = 15 Bilder, 9 = 17, 10 = 19.
                  Ziel: 55–60 Sekunden bei ungefähr 1,10x
  --output        Ausgabeordner (optional, Standard: reels)
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
  const sceneCount = Number(getArgument('--scenes') ?? 9);
  const outputRoot = getArgument('--output') ?? 'reels';

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
  const humanView = await ensureHumanReelView(result.reelDirectory, { hideTechnicalInFinder: false });
  const compactLayout = await compactReelLayout(result.reelDirectory);

  if (selectedSlot) {
    console.log(`Automatisch gewählter Termin: ${selectedSlot.weekday}, ${selectedSlot.dateValue}`);
  }
  console.log(`Reel-Arbeitsordner erstellt: ${result.reelDirectory}`);
  console.log(`Narrative Szenen: ${result.reel.sceneCount}`);
  console.log(`Geplante Bilder: ${result.reel.plannedImageCount} (Hook 1, danach je 2)`);
  console.log(`Zieldauer: ${result.reel.targetDurationSeconds} Sekunden`);
  console.log(`Schluss-Hold: ${result.reel.endingHoldSeconds} Sekunden`);
  console.log(`Bildwelt: ${result.reel.visualStyleId}`);
  console.log('Schnitt/SFX: Bildwechsel minimal vor Sprach-Cue; jeder relevante Wechsel mit kurzem SFX.');
  console.log(`Quellen-QC: Schema ${result.reel.sourceQualitySchemaVersion} ist für dieses neue Reel verpflichtend.`);
  console.log(`Produktionsauftrag vorbereitet: ${production.taskFile}`);
  console.log(`Google-Flow-Nutzerdatei: ${promptBundle.userFile}`);
  console.log(`Technische Prompt-Spiegeldatei: ${promptBundle.file}`);
  console.log(`Übersichtliche Ordner: ${humanView.visibleFolders.join(', ')}`);
  console.log(`Technik physisch gesammelt unter: ${compactLayout.technicalDirectory}`);
  console.log('Nach Fertigstellung aller Bildprompts verpflichtend export:prompts --strict ausführen.');
  console.log('Pflicht: 99-technik/production/agent-task.md jetzt vollständig bearbeiten und check:content --strict ausführen. Nicht nach der Ordnererstellung stoppen.');
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
