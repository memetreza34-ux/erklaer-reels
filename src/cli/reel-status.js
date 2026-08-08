#!/usr/bin/env node

import { calculateReelProgress } from '../core/reel-progress.js';
import { verifyAppliedWordSyncAudioBinding } from '../core/word-sync-audio-guard.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function yesNo(value) {
  return value ? 'ja' : 'nein';
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function applyAudioBindingStatus(progress, audioBinding) {
  progress.details = {
    ...progress.details,
    wordSyncAudioBindingRequired: audioBinding.required,
    wordSyncAudioBindingPassed: audioBinding.required ? audioBinding.passed : null
  };

  if (!audioBinding.required || audioBinding.passed) return progress;

  progress.wordSync = 0;
  progress.productionReady = clamp(
    progress.preProduction * 0.4 +
    progress.assets * 0.2 +
    progress.audioPacing * 0.1 +
    progress.timeline * 0.12 +
    progress.wordSync * 0.08 +
    progress.visualQuality * 0.1
  );
  progress.rendering = 0;
  progress.overall = clamp(progress.productionReady * 0.9);
  progress.details.wordSyncPassed = false;
  progress.details.rendererValidated = false;
  progress.details.renderComplete = false;
  progress.nextStep = 'Voice-over wurde nach der bestätigten Wort-Synchronisierung verändert. Word-Sync mit dem aktuellen Audio erneut vorbereiten, akustisch prüfen und mit --apply --strict übernehmen.';
  return progress;
}

async function main() {
  const reelDirectory = getArgument('--dir');
  const asJson = process.argv.includes('--json');

  if (!reelDirectory) {
    console.log('Verwendung: npm run status:reel -- --dir "reels/.../reel-01_titel" [--json]');
    process.exitCode = 1;
    return;
  }

  const progress = await calculateReelProgress(reelDirectory);
  const audioBinding = await verifyAppliedWordSyncAudioBinding(reelDirectory);
  applyAudioBindingStatus(progress, audioBinding);

  if (asJson) {
    console.log(JSON.stringify(progress, null, 2));
    return;
  }

  console.log(`${progress.title || progress.reelId}`);
  console.log(`Vorproduktion: ${progress.preProduction}%`);
  console.log(`Externe Assets: ${progress.assets}%`);
  console.log(`Audio-Pacing: ${progress.audioPacing}%`);
  console.log(`Timeline und Audio-Sync: ${progress.timeline}%`);
  console.log(`Wort-Synchronisierung: ${progress.wordSync}%`);
  console.log(`Visuelle Qualität: ${progress.visualQuality}%`);
  console.log(`Produktionsfreigabe: ${progress.productionReady}%`);
  console.log(`Rendering: ${progress.rendering}%`);
  console.log(`Gesamtstand inklusive MP4: ${progress.overall}%`);
  console.log('');
  console.log(`Scripts fertig: ${yesNo(progress.details.scriptsReady)}`);
  console.log(`Bildwelt festgelegt: ${yesNo(progress.details.styleReady)}`);
  console.log(`Szenen geplant: ${progress.details.scenesReady}`);
  console.log(`Bildprompts fertig: ${progress.details.promptsReady}`);
  console.log(`Cover-Prompt fertig: ${yesNo(progress.details.coverPromptReady)}`);
  console.log(`Inhaltsprüfung bestanden: ${yesNo(progress.details.contentCheckReady)}`);
  console.log(`Szenenbilder übernommen: ${progress.details.sceneImagesReady}`);
  console.log(`Audio übernommen: ${yesNo(progress.details.audioReady)}`);
  console.log(`Cover übernommen: ${yesNo(progress.details.coverImageReady)}`);
  console.log(`Pausen und Tempo optimiert: ${yesNo(progress.details.audioPacingPassed)}`);
  console.log(`Voice-over-Tempo: ${Number(progress.details.audioPacingRate ?? 0).toFixed(2)}x`);
  console.log(`Audio exakt synchronisiert: ${yesNo(progress.details.audioSynced)}`);
  console.log(`Codex-Wortzeiten bestätigt: ${yesNo(progress.details.wordSyncPassed)}`);
  if (audioBinding.required) console.log(`Word-Sync-Audio unverändert: ${yesNo(audioBinding.passed)}`);
  console.log(`Wortzeit-Anbieter: ${progress.details.wordSyncProvider ?? 'noch keiner'}`);
  console.log(`Wortabdeckung: ${(Number(progress.details.wordCoverage ?? 0) * 100).toFixed(1)}%`);
  console.log(`Render-Plan bereit: ${yesNo(progress.details.renderReady)}`);
  console.log(`Bilder visuell geprüft: ${progress.details.visualAssetsReviewed}`);
  console.log(`Strenge Bildabnahme bestanden: ${yesNo(progress.details.visualStrictReady)}`);
  console.log(`Renderer-Eingabe validiert: ${yesNo(progress.details.rendererValidated)}`);
  console.log(`MP4 erfolgreich erzeugt: ${yesNo(progress.details.renderComplete)}`);
  console.log('');
  console.log(`Nächster Schritt: ${progress.nextStep}`);
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
