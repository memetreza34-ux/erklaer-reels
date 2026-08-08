#!/usr/bin/env node

import { verifyAudioPacingFileBinding } from '../core/audio-pacing-file-guard.js';
import { applyCodexWordSync, prepareCodexWordSync } from '../core/codex-word-sync.js';
import {
  invalidateStaleWordSyncWorkbench,
  stampAppliedWordSyncAudioBinding,
  stampPreparedWordSyncAudioBinding,
  verifyPreparedWordSyncAudioBinding
} from '../core/word-sync-audio-guard.js';
import { verifyWordSyncTimelineReadiness } from '../core/word-sync-timeline-guard.js';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function verifyPrerequisites(reelDirectory) {
  const pacingBinding = await verifyAudioPacingFileBinding(reelDirectory);
  if (pacingBinding.required && !pacingBinding.passed) {
    throw new Error(`${pacingBinding.reason} Führe trim:pauses mit dem aktuellen Voice-over erneut aus und baue anschließend die Timeline neu.`);
  }

  const timelineReadiness = await verifyWordSyncTimelineReadiness(reelDirectory);
  if (timelineReadiness.required && !timelineReadiness.passed) {
    throw new Error(`${timelineReadiness.reason} Führe build:timeline und sync:audio aus, bis die Timeline den Status "audio-synced" besitzt.`);
  }

  return { pacingBinding, timelineReadiness };
}

async function main() {
  const reelDirectory = argument('--dir');
  if (!reelDirectory) {
    console.log('Verwendung: npm run sync:words -- --dir "reels/.../reel-01_titel" [--apply] [--validate-only] [--strict]');
    process.exitCode = 1;
    return;
  }

  const strict = process.argv.includes('--strict');
  const apply = process.argv.includes('--apply');
  const validateOnly = process.argv.includes('--validate-only');
  const prerequisites = await verifyPrerequisites(reelDirectory);

  if (!apply && !validateOnly) {
    const invalidation = await invalidateStaleWordSyncWorkbench(reelDirectory);
    const result = await prepareCodexWordSync(reelDirectory);
    const binding = await stampPreparedWordSyncAudioBinding(reelDirectory);
    console.log('Codex-Wort-Synchronisierung vorbereitet.');
    console.log(`Arbeitsdatei: ${result.workbenchFile}`);
    console.log(`Codex-Auftrag: ${result.taskFile}`);
    console.log(`Wörter: ${binding.workbench.words.length}`);
    if (prerequisites.timelineReadiness.required) console.log('Timeline: audio-synced bestätigt.');
    if (prerequisites.pacingBinding.required) console.log('Audio-Pacing-Datei: Fingerprint unverändert.');
    console.log('Audio-Bindung: SHA-256-Fingerprint für die Wortprüfung gespeichert.');
    if (invalidation.changed) {
      console.log('Vorherige Wortzeiten wurden verworfen, weil sich der Audioinhalt geändert hat.');
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
  if (prerequisites.timelineReadiness.required) console.log('Timeline: audio-synced bestätigt.');
  if (prerequisites.pacingBinding.required) console.log('Audio-Pacing-Datei: Fingerprint unverändert.');
  if (binding.required) console.log('Word-Sync-Audio: Fingerprint unverändert bestätigt.');
  else console.log('Word-Sync-Audio: Legacy-Workbench ohne Fingerprint; bestehendes Verhalten bleibt kompatibel.');
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
