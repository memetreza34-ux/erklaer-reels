#!/usr/bin/env node

import { tightenVoiceover } from '../core/audio-tightener.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const reelDirectory = getArgument('--dir');
  if (!reelDirectory) {
    console.log('Verwendung: npm run trim:pauses -- --dir "content/.../reel-01_titel" [--speed 1.05]');
    process.exitCode = 1;
    return;
  }

  const report = await tightenVoiceover(reelDirectory, {
    thresholdDb: Number(getArgument('--threshold-db') ?? -35),
    minimumLongPauseSeconds: Number(getArgument('--minimum-pause') ?? 0.24),
    retainedPauseSeconds: Number(getArgument('--keep-pause') ?? 0.05),
    playbackRate: Number(getArgument('--speed') ?? 1.05)
  });

  console.log('Voice-over-Pacing wurde optimiert.');
  console.log(`Vorher: ${report.beforeSeconds?.toFixed(2) ?? 'unbekannt'} s`);
  console.log(`Nachher: ${report.afterSeconds?.toFixed(2) ?? 'unbekannt'} s`);
  console.log(`Entfernt: ${report.removedSeconds?.toFixed(2) ?? 'unbekannt'} s`);
  console.log(`Tempo: ${report.playbackRate?.toFixed(2) ?? '1.05'}x bei erhaltener Tonhöhe`);
  console.log(`Neue Audiodatei: ${report.outputFile}`);
  console.log('Timeline, Audio-Cues und Codex-Wortzeiten müssen jetzt erneut synchronisiert werden.');
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
