#!/usr/bin/env node

import { verifyAudioPacingFileBinding } from '../core/audio-pacing-file-guard.js';
import { verifyFutureEffectsCoverage } from '../core/effects-quality-file-guard.js';
import { finalizeReel } from '../core/finalize-reel.js';
import { syncReelSounds } from '../core/sound-library.js';
import { verifyRequiredSourceQuality } from '../core/source-quality-file-guard.js';
import { verifyTrailingVoiceoverSilence } from '../core/trailing-silence-guard.js';

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

  const sourceGate = await verifyRequiredSourceQuality(reelDirectory);
  if (sourceGate.required && !sourceGate.passed) {
    throw new Error(`${sourceGate.reason} Führe check:content --strict aus und korrigiere sources/sources.md.`);
  }

  const effectsGate = await verifyFutureEffectsCoverage(reelDirectory);
  if (effectsGate.required && !effectsGate.passed) {
    const details = effectsGate.findings.map((finding) => `${finding.sceneId ?? 'Reel'}${finding.targetId ? `/${finding.targetId}` : ''}: ${finding.issue}`).join(', ');
    throw new Error(`${effectsGate.reason} Finalisierung blockiert. ${details}`);
  }

  // Finalisieren darf nie mit bloß geplanten, aber nicht aufgelösten Sounds erfolgen.
  // Die zentrale Bibliothek wird deshalb hier noch einmal strikt gebunden.
  await syncReelSounds(reelDirectory, { strict: true });

  const pacingBinding = await verifyAudioPacingFileBinding(reelDirectory);
  if (pacingBinding.required && !pacingBinding.passed) {
    throw new Error(`${pacingBinding.reason} Führe trim:pauses mit dem aktuellen Voice-over erneut aus oder aktualisiere danach die Timeline.`);
  }

  const trailingSilence = await verifyTrailingVoiceoverSilence(reelDirectory);
  if (trailingSilence.required && !trailingSilence.passed) {
    throw new Error(`${trailingSilence.reason} Führe trim:pauses erneut aus; mehrsekündige Endstille darf nicht in die Videodauer eingehen.`);
  }

  const report = await finalizeReel(reelDirectory, {
    strict,
    audioDurationSeconds
  });

  if (asJson) {
    console.log(JSON.stringify({ ...report, effectsHardGate: effectsGate, trailingSilence }, null, 2));
  } else {
    console.log(`Inhalt: ${report.stages.content?.passed ? 'bestanden' : 'nicht bestanden'}`);
    console.log(`Timeline: ${report.stages.timeline?.passed ? 'bestanden' : 'nicht bestanden'}`);
    console.log('Untertitel: deaktiviert');
    console.log(`Visuelle Qualität: ${report.stages.visualQuality?.passed ? 'bestanden' : 'nicht bestanden'}`);
    if (sourceGate.required) console.log('Quellen-QC: verpflichtendes Schema bestanden');
    if (effectsGate.required) console.log('Motion/SFX-Hard-Gate: bestanden');
    if (pacingBinding.required) console.log('Audio-Pacing-Datei: Fingerprint unverändert');
    if (trailingSilence.required) console.log(`Endstille: ${trailingSilence.trailingSilenceSeconds.toFixed(2)} s — bestanden`);
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
