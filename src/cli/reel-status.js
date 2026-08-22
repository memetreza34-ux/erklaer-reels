#!/usr/bin/env node

import { verifyAudioPacingFileBinding } from '../core/audio-pacing-file-guard.js';
import { calculateReelProgress } from '../core/reel-progress.js';
import { verifyRequiredSourceQuality } from '../core/source-quality-file-guard.js';

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

function recalculateProductionReady(progress) {
  progress.productionReady = clamp(
    progress.preProduction * 0.4 +
    progress.assets * 0.2 +
    progress.audioPacing * 0.1 +
    progress.timeline * 0.2 +
    progress.visualQuality * 0.1
  );
  progress.overall = clamp(progress.productionReady * 0.9 + progress.rendering * 0.1);
}

function applyGateStatus(progress, sourceGate, pacingBinding) {
  progress.details = {
    ...progress.details,
    sourceQualitySchemaRequired: sourceGate.required ? sourceGate.requiredSchemaVersion : null,
    sourceQualityGatePassed: sourceGate.required ? sourceGate.passed : null,
    audioPacingFileBindingRequired: pacingBinding.required,
    audioPacingFileBindingPassed: pacingBinding.required ? pacingBinding.passed : null,
    subtitlesEnabled: false,
    wordSyncRequired: false
  };

  if (sourceGate.required && !sourceGate.passed) {
    const deduction = (progress.details.sourcesReady ? 5 : 0) + (progress.details.contentCheckReady ? 5 : 0);
    progress.preProduction = clamp(progress.preProduction - deduction);
    progress.rendering = 0;
    progress.details.sourcesReady = false;
    progress.details.contentCheckReady = false;
    progress.details.rendererValidated = false;
    progress.details.renderComplete = false;
    recalculateProductionReady(progress);
    progress.nextStep = `${sourceGate.reason} sources/sources.md im verpflichtenden Schema vollständig ausfüllen und check:content --strict erneut ausführen.`;
    return progress;
  }

  if (pacingBinding.required && !pacingBinding.passed) {
    progress.audioPacing = 0;
    progress.timeline = 0;
    progress.rendering = 0;
    progress.details.audioPacingPassed = false;
    progress.details.audioSynced = false;
    progress.details.renderReady = false;
    progress.details.timelineCheckReady = false;
    progress.details.rendererValidated = false;
    progress.details.renderComplete = false;
    recalculateProductionReady(progress);
    progress.nextStep = 'Die aktuelle Voice-over-Datei stimmt nicht mehr mit der gemessenen Audio-Pacing-Datei überein. trim:pauses erneut ausführen und danach die Timeline neu erstellen.';
  }

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
  const sourceGate = await verifyRequiredSourceQuality(reelDirectory);
  const pacingBinding = await verifyAudioPacingFileBinding(reelDirectory);
  applyGateStatus(progress, sourceGate, pacingBinding);

  if (asJson) {
    console.log(JSON.stringify(progress, null, 2));
    return;
  }

  console.log(`${progress.title || progress.reelId}`);
  console.log(`Vorproduktion: ${progress.preProduction}%`);
  console.log(`Externe Assets: ${progress.assets}%`);
  console.log(`Audio-Pacing: ${progress.audioPacing}%`);
  console.log(`Timeline und Audio-Sync: ${progress.timeline}%`);
  console.log('Untertitel: deaktiviert');
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
  if (sourceGate.required) console.log(`Pflicht-Quellen-QC bestanden: ${yesNo(sourceGate.passed)}`);
  console.log(`Szenenbilder übernommen: ${progress.details.sceneImagesReady}`);
  console.log(`Audio übernommen: ${yesNo(progress.details.audioReady)}`);
  console.log(`Cover übernommen: ${yesNo(progress.details.coverImageReady)}`);
  console.log(`Pausen und Tempo optimiert: ${yesNo(progress.details.audioPacingPassed)}`);
  console.log(`Voice-over-Tempo: ${Number(progress.details.audioPacingRate ?? 0).toFixed(2)}x`);
  if (pacingBinding.required) console.log(`Gemessene Audio-Datei unverändert: ${yesNo(pacingBinding.passed)}`);
  console.log(`Audio exakt synchronisiert: ${yesNo(progress.details.audioSynced)}`);
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
