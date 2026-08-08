#!/usr/bin/env node

import { applyCodexWordSync, prepareCodexWordSync } from '../core/codex-word-sync.js';
import {
  invalidateStaleWordSyncWorkbench,
  stampAppliedWordSyncAudioBinding,
  stampPreparedWordSyncAudioBinding,
  verifyPreparedWordSyncAudioBinding
} from '../core/word-sync-audio-guard.js';

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
    const invalidation = await invalidateStaleWordSyncWorkbench(reelDirectory);
    const result = await prepareCodexWordSync(reelDirectory);
    const binding = await stampPreparedWordSyncAudioBinding(reelDirectory);
    console.log('Codex-Wort-Synchronisierung vorbereitet.');
    console.log(`Arbeitsdatei: ${result.workbenchFile}`);
    console.log(`Codex-Auftrag: ${result.taskFile}`);
    console.log(`Wörter: ${binding.workbench.words.length}`);
    console.log('Audio-Bindung: SHA-256-Fingerprint gespeichert.');
    if (invalidation.changed) {
      console.log('Vorherige Wortzeiten wurden verworfen, weil sich die Voice-over-Datei geändert hat.');
    }
    console.log('Nächster Schritt: Codex hört das lokale Voice-over ab, füllt die Wortzeiten und führt sync:words mit --apply --strict erneut aus.');
    return;
  }

  const binding = await verifyPreparedWordSyncAudioBinding(reelDirectory);
  if (binding.required && !binding.passed) {
    throw new Error('Die Voice-over-Datei wurde seit der Word-Sync-Vorbereitung geändert. Führe sync:words erneut ohne --apply aus und bestätige die Wortzeiten neu.');
  }

  const result = await applyCodexWordSync(reelDirectory, { strict, validateOnly });
  const report = result.report;

  if (!validateOnly && report.passed) {
    await stampAppliedWordSyncAudioBinding(reelDirectory, binding.audioFingerprintSha256 ?? null);
  }

  console.log(`Codex-Wort-Synchronisierung: ${report.passed ? 'bestanden' : 'Prüfung nötig'}`);
  console.log(`Wörter mit Zeiten: ${report.timedWords}/${report.totalWords}`);
  console.log(`Abdeckung: ${(report.coverage * 100).toFixed(1)} %`);
  console.log(`Untertitel-Cues: ${report.cueCount}`);
  if (binding.required) console.log('Audio-Bindung: Fingerprint unverändert bestätigt.');
  else console.log('Audio-Bindung: Legacy-Workbench ohne Fingerprint; bestehendes Verhalten bleibt kompatibel.');
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
