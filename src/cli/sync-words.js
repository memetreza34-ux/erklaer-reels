#!/usr/bin/env node

import { syncSubtitleWordsWithGemini } from '../core/gemini-word-sync.js';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const reelDirectory = argument('--dir');
  if (!reelDirectory) {
    console.log('Verwendung: npm run sync:words -- --dir "PFAD-ZUM-REEL" [--model gemini-3.6-flash] [--language de-DE] [--strict]');
    process.exitCode = 1;
    return;
  }

  const strict = process.argv.includes('--strict');
  const dryRun = process.argv.includes('--dry-run');
  const result = await syncSubtitleWordsWithGemini(reelDirectory, {
    apiKey: process.env.GEMINI_API_KEY,
    model: argument('--model') ?? 'gemini-3.6-flash',
    languageHint: argument('--language') ?? 'de-DE',
    transcriptJson: argument('--transcript-json') ?? null,
    dryRun,
    strict
  });

  const report = result.report;
  console.log(`Wort-Synchronisierung: ${report.passed ? 'bestanden' : 'Prüfung nötig'}`);
  console.log(`Anbieter: ${report.provider}${report.model ? ` (${report.model})` : ''}`);
  console.log(`Wörter: ${report.assignedWords}/${report.totalWords}`);
  console.log(`Abdeckung: ${(report.coverage * 100).toFixed(1)} %`);
  console.log(`Untertitel-Cues: ${report.cueCount}`);
  if (dryRun) console.log('Dry-Run: Es wurden keine Dateien geändert.');
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
