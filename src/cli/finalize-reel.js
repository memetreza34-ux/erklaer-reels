#!/usr/bin/env node

import { finalizeReel } from '../core/finalize-reel.js';
import { verifyAppliedWordSyncAudioBinding } from '../core/word-sync-audio-guard.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const reelDirectory = getArgument('--dir');
  const strict = process.argv.includes('--strict');
  const asJson = process.argv.includes('--json');
  const durationValue = getArgument('--audio-duration');
  const audioDurationSeconds = durationValue === undefined ? null : Number(durationValue);

  if (!reelDirectory) {
    console.log('Verwendung: npm run finalize:reel -- --dir "reels/.../reel-01_titel" [--audio-duration 48.7] [--strict] [--json]');
    process.exitCode = 1;
    return;
  }

  if (durationValue !== undefined && (!Number.isFinite(audioDurationSeconds) || audioDurationSeconds <= 0)) {
    throw new Error('--audio-duration muss eine positive Zahl sein.');
  }

  const audioBinding = await verifyAppliedWordSyncAudioBinding(reelDirectory);
  if (audioBinding.required && !audioBinding.passed) {
    throw new Error(`${audioBinding.reason} Führe die Word-Synchronisierung mit dem aktuellen Voice-over erneut aus.`);
  }

  const report = await finalizeReel(reelDirectory, {
    strict,
    audioDurationSeconds
  });

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Inhalt: ${report.stages.content?.passed ? 'bestanden' : 'nicht bestanden'}`);
    console.log(`Timeline: ${report.stages.timeline?.passed ? 'bestanden' : 'nicht bestanden'}`);
    console.log(`Visuelle Qualität: ${report.stages.visualQuality?.passed ? 'bestanden' : 'nicht bestanden'}`);
    if (audioBinding.required) console.log('Word-Sync-Audio: Fingerprint unverändert');
    console.log(`Gesamtstand: ${report.progress.overall}%`);
    console.log(`Renderer-bereit: ${report.readyForRenderer ? 'ja' : 'nein'}`);
    console.log(`Nächster Schritt: ${report.nextStep}`);
    console.log('Bericht: review/final-readiness-report.json');
  }

  if (strict && !report.readyForRenderer) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
