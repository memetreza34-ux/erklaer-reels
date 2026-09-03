#!/usr/bin/env node

import path from 'node:path';

import { verifyAudioPacingFileBinding } from '../core/audio-pacing-file-guard.js';
import { verifyFutureEffectsCoverage } from '../core/effects-quality-file-guard.js';
import { renderReel } from '../core/remotion-renderer.js';
import { validateRendererInput } from '../core/render-validator.js';
import { syncReelSounds } from '../core/sound-library.js';
import { verifyRequiredSourceQuality } from '../core/source-quality-file-guard.js';
import { verifyTrailingVoiceoverSilence } from '../core/trailing-silence-guard.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function showUsage() {
  console.log(`
Erzeugt aus render/render-plan.json eine fertige MP4-Datei mit Remotion – ohne Untertitel.
Der sichtbare Standard-Export liegt direkt im Reel-Ordner unter 03-export mit fertiger MP4 und universeller Caption.

Rendern:
  npm run render:reel -- --dir "reels/.../reel-01_titel"

Nur prüfen:
  npm run validate:render -- --dir "reels/.../reel-01_titel"

Optionen:
  --dir          Reel-Ordner
  --output       Optionaler zusätzlicher Ausgabepfad der MP4-Datei; der kanonische Export wird trotzdem unter export/FERTIGES-REEL.mp4 abgelegt
  --codec        Remotion-Codec, Standard: h264
  --crf          Qualitätswert, Standard: 18
  --concurrency  Anzahl paralleler Renderprozesse
  --force        Renderer trotz fehlender finaler Freigabe starten; Quellen-, Motion/SFX-, Audio-Datei- und Endstille-Hard-Gates bleiben trotzdem aktiv
  --validate-only Nur Render-Plan und Assets prüfen
`);
}

function printValidation(report) {
  console.log(`Renderer-Prüfung: ${report.passed ? 'bestanden' : 'fehlgeschlagen'}`);
  console.log(`Bestanden: ${report.summary.passedChecks}/${report.summary.totalChecks}`);
  console.log(`Fehler: ${report.summary.failedChecks}`);
  console.log(`Warnungen: ${report.summary.warnings}`);
  for (const check of report.checks.filter((item) => !item.passed)) {
    console.log(`- ${check.level.toUpperCase()}: ${check.message}`);
  }
}

async function main() {
  if (process.argv.includes('--help')) {
    showUsage();
    return;
  }

  const reelDirectory = getArgument('--dir');
  if (!reelDirectory) {
    showUsage();
    process.exitCode = 1;
    return;
  }

  const force = process.argv.includes('--force');
  const validateOnly = process.argv.includes('--validate-only');

  const sourceGate = await verifyRequiredSourceQuality(reelDirectory);
  if (sourceGate.required && !sourceGate.passed) {
    throw new Error(`${sourceGate.reason} Rendern mit unvollständiger verpflichtender Quellen-QC ist auch mit --force blockiert.`);
  }

  const effectsGate = await verifyFutureEffectsCoverage(reelDirectory);
  if (effectsGate.required && !effectsGate.passed) {
    const details = effectsGate.findings.map((finding) => `${finding.sceneId ?? 'Reel'}${finding.targetId ? `/${finding.targetId}` : ''}: ${finding.issue}`).join(', ');
    throw new Error(`${effectsGate.reason} Rendern mit statischen Bildmomenten oder stummen/ungültigen Wechsel-SFX ist auch mit --force blockiert. ${details}`);
  }

  // Vor jeder Validierung und jedem Render werden Soundtypen erneut strikt gegen
  // die Library aufgelöst und die echten Dateien in den Reel-Ordner kopiert.
  await syncReelSounds(reelDirectory, { strict: true });

  const pacingBinding = await verifyAudioPacingFileBinding(reelDirectory);
  if (pacingBinding.required && !pacingBinding.passed) {
    throw new Error(`${pacingBinding.reason} Rendern mit veralteten Lautheitswerten ist auch mit --force blockiert.`);
  }

  const trailingSilence = await verifyTrailingVoiceoverSilence(reelDirectory);
  if (trailingSilence.required && !trailingSilence.passed) {
    throw new Error(`${trailingSilence.reason} Rendern mit langem stillem Audio-Ende ist auch mit --force blockiert.`);
  }

  if (validateOnly) {
    const report = await validateRendererInput(reelDirectory, {
      requireFinalReadiness: !force
    });
    printValidation(report);
    if (sourceGate.required) console.log('Quellen-QC: verpflichtendes Schema bestanden');
    if (effectsGate.required) console.log('Motion/SFX-Hard-Gate: bestanden');
    if (pacingBinding.required) console.log('Audio-Pacing-Datei: Fingerprint unverändert');
    if (trailingSilence.required) console.log(`Voice-over-Endstille: ${trailingSilence.trailingSilenceSeconds.toFixed(2)} s`);
    console.log('Untertitel: deaktiviert');
    if (!report.passed) process.exitCode = 1;
    return;
  }

  let lastPercent = -1;
  const report = await renderReel(reelDirectory, {
    output: getArgument('--output'),
    codec: getArgument('--codec') ?? 'h264',
    crf: Number(getArgument('--crf') ?? 18),
    concurrency: getArgument('--concurrency') ?? null,
    force,
    onProgress: ({ stage, progress }) => {
      const percent = Math.floor(Number(progress ?? 0) * 100);
      if (percent !== lastPercent && (percent % 5 === 0 || percent === 100)) {
        console.log(`${stage === 'bundle' ? 'Bundle' : 'Render'}: ${percent}%`);
        lastPercent = percent;
      }
    }
  });

  console.log('MP4 erfolgreich ohne Untertitel erzeugt.');
  if (sourceGate.required) console.log('Quellen-QC: verpflichtendes Schema bestanden');
  if (effectsGate.required) console.log('Motion/SFX-Hard-Gate: bestanden');
  if (pacingBinding.required) console.log('Audio-Pacing-Datei: Fingerprint unverändert');
  if (trailingSilence.required) console.log(`Voice-over-Endstille: ${trailingSilence.trailingSilenceSeconds.toFixed(2)} s`);
  console.log(`Export-Video: ${path.resolve(report.exportVideoFile ?? report.outputFile)}`);
  console.log(`Universal-Caption: ${path.resolve(report.exportCaptionFile)}`);
  console.log('Sichtbarer Upload-Bereich: 03-export/');
  console.log(`Größe: ${(report.outputBytes / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
