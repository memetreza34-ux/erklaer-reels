#!/usr/bin/env node

import { applyCodexWordSync, prepareCodexWordSync } from '../core/codex-word-sync.js';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const reelDirectory = argument('--dir');
  if (!reelDirectory) {
    console.log('Verwendung: npm run sync:words -- --dir "PFAD-ZUM-REEL" [--apply] [--validate-only] [--strict]');
    process.exitCode = 1;
    return;
  }

  const strict = process.argv.includes('--strict');
  const apply = process.argv.includes('--apply');
  const validateOnly = process.argv.includes('--validate-only');

  if (!apply && !validateOnly) {
    const result = await prepareCodexWordSync(reelDirectory);
    console.log('Codex-Wort-Synchronisierung vorbereitet.');
    console.log(`Arbeitsdatei: ${result.workbenchFile}`);
    console.log(`Codex-Auftrag: ${result.taskFile}`);
    console.log(`Wörter: ${result.workbench.words.length}`);
    console.log('Nächster Schritt: Codex hört das lokale Voice-over ab, füllt die Wortzeiten und führt sync:words mit --apply --strict erneut aus.');
    return;
  }

  const result = await applyCodexWordSync(reelDirectory, { strict, validateOnly });
  const report = result.report;
  console.log(`Codex-Wort-Synchronisierung: ${report.passed ? 'bestanden' : 'Prüfung nötig'}`);
  console.log(`Wörter mit Zeiten: ${report.timedWords}/${report.totalWords}`);
  console.log(`Abdeckung: ${(report.coverage * 100).toFixed(1)} %`);
  console.log(`Untertitel-Cues: ${report.cueCount}`);
  console.log('Externer Upload: nein');
  console.log('API-Key erforderlich: nein');
  if (validateOnly) console.log('Validierung: Es wurden keine Untertiteldateien geändert.');
  else console.log('Aktualisiert: subtitles/subtitle-plan.json, Timeline, Render-Plan und review/word-sync-report.json');

  if (!report.passed) {
    for (const check of report.checks.filter((item) => !item.passed)) {
      console.log(`- ${check.level.toUpperCase()}: ${check.message}`);
    }
    if (strict) process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
