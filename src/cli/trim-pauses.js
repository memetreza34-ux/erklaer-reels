#!/usr/bin/env node

import { tightenVoiceover } from '../core/audio-tightener.js';
import { AUDIO_PACING_STYLE } from '../shared/audio-pacing-style.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const reelDirectory = getArgument('--dir');
  if (!reelDirectory) {
    console.log('Verwendung: npm run trim:pauses -- --dir "content/.../reel-01_titel" [--speed 1.10]');
    process.exitCode = 1;
    return;
  }

  const report = await tightenVoiceover(reelDirectory, {
    thresholdDb: Number(getArgument('--threshold-db') ?? AUDIO_PACING_STYLE.thresholdDb),
    minimumLongPauseSeconds: Number(getArgument('--minimum-pause') ?? AUDIO_PACING_STYLE.minimumLongPauseSeconds),
    retainedPauseSeconds: Number(getArgument('--keep-pause') ?? AUDIO_PACING_STYLE.retainedPauseSeconds),
    playbackRate: Number(getArgument('--speed') ?? AUDIO_PACING_STYLE.playbackRate),
    loudnessTargetLufs: Number(getArgument('--lufs') ?? AUDIO_PACING_STYLE.loudnessTargetLufs),
    truePeakDbtp: Number(getArgument('--true-peak') ?? AUDIO_PACING_STYLE.truePeakDbtp),
    loudnessRangeLra: Number(getArgument('--lra') ?? AUDIO_PACING_STYLE.loudnessRangeLra)
  });

  console.log('Voice-over-Pacing wurde optimiert.');
  console.log(`Vorher: ${report.beforeSeconds?.toFixed(2) ?? 'unbekannt'} s`);
  console.log(`Nachher: ${report.afterSeconds?.toFixed(2) ?? 'unbekannt'} s`);
  console.log(`Entfernt: ${report.removedSeconds?.toFixed(2) ?? 'unbekannt'} s`);
  console.log(`Tempo: ${report.playbackRate?.toFixed(2) ?? AUDIO_PACING_STYLE.playbackRate.toFixed(2)}x bei erhaltener Tonhöhe`);
  console.log(`Lautheit: ${report.loudnessSettings?.loudnessTargetLufs ?? AUDIO_PACING_STYLE.loudnessTargetLufs} LUFS, True Peak ${report.loudnessSettings?.truePeakDbtp ?? AUDIO_PACING_STYLE.truePeakDbtp} dBTP`);
  console.log(`Neue Audiodatei: ${report.outputFile}`);
  console.log('Timeline, Szenen-Cues und Untertitel-Cues müssen jetzt erneut synchronisiert werden.');
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
