#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { verifyAudioPacingFileBinding } from '../core/audio-pacing-file-guard.js';
import { applyCodexWordSync, prepareCodexWordSync } from '../core/codex-word-sync.js';
import { buildMasterTimeline } from '../core/timeline.js';
import {
  invalidateStaleWordSyncWorkbench,
  stampAppliedWordSyncAudioBinding,
  stampPreparedWordSyncAudioBinding,
  verifyPreparedWordSyncAudioBinding
} from '../core/word-sync-audio-guard.js';
import { verifyWordSyncTimelineReadiness } from '../core/word-sync-timeline-guard.js';
import { SUBTITLE_STYLE } from '../shared/subtitle-style.js';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function hasCompleteSubtitleCoverage(report) {
  return report?.passed === true
    && Number(report?.coverage) === 1
    && Number(report?.timedWords) === Number(report?.totalWords)
    && (report?.unassignedWords?.length ?? 0) === 0
    && (report?.invalidCues?.length ?? 0) === 0;
}

async function enforceSpeakerSyncedHighlight(reelDirectory) {
  const subtitlePlanPath = path.join(reelDirectory, 'subtitles', 'subtitle-plan.json');
  const plan = await readJson(subtitlePlanPath, null);
  if (!plan) throw new Error('subtitles/subtitle-plan.json fehlt nach der Wort-Synchronisierung.');

  const cues = Array.isArray(plan.cues)
    ? plan.cues.map((cue) => ({
      ...cue,
      highlightCurrentWord: true,
      highlightColor: SUBTITLE_STYLE.highlightColor
    }))
    : [];

  await writeJson(subtitlePlanPath, {
    ...plan,
    textColor: SUBTITLE_STYLE.textColor,
    highlightCurrentWord: true,
    highlightColor: SUBTITLE_STYLE.highlightColor,
    wordByWordKaraoke: true,
    speakerSyncedWordHighlight: true,
    exactWordTimingsRequired: true,
    completeSpokenTextCoverageRequired: true,
    cues
  });
}

async function markWordSyncNeedsReview(reelDirectory) {
  const statusPath = path.join(reelDirectory, 'status.json');
  const status = await readJson(statusPath, {});
  status.wordSync = 'needs-review';
  status.render = 'blocked-subtitle-sync';
  await writeJson(statusPath, status);
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
    console.log('Antigravity-Wort-Synchronisierung vorbereitet.');
    console.log(`Arbeitsdatei: ${result.workbenchFile}`);
    console.log(`Antigravity-Auftrag: ${result.taskFile}`);
    console.log(`Wörter: ${binding.workbench.words.length}`);
    if (prerequisites.timelineReadiness.required) console.log('Timeline: audio-synced bestätigt.');
    if (prerequisites.pacingBinding.required) console.log('Audio-Pacing-Datei: Fingerprint unverändert.');
    console.log('Audio-Bindung: SHA-256-Fingerprint für die Wortprüfung gespeichert.');
    if (invalidation.changed) {
      console.log('Vorherige Wortzeiten wurden verworfen, weil sich der Audioinhalt geändert hat.');
    }
    console.log('Nächster Schritt: Antigravity hört das lokale Voice-over vollständig ab, bestätigt ausnahmslos jedes gesprochene Wort und führt sync:words mit --apply --strict erneut aus.');
    return;
  }

  const binding = await verifyPreparedWordSyncAudioBinding(reelDirectory);
  if (binding.required && !binding.passed) {
    throw new Error('Die Voice-over-Datei wurde seit der Word-Sync-Vorbereitung geändert. Führe sync:words erneut ohne --apply aus und bestätige die Wortzeiten neu.');
  }

  const result = await applyCodexWordSync(reelDirectory, { strict, validateOnly });
  const report = result.report;
  const completeCoverage = hasCompleteSubtitleCoverage(report);

  if (!validateOnly && !completeCoverage) {
    await markWordSyncNeedsReview(reelDirectory);
  }

  if (!validateOnly && completeCoverage) {
    await enforceSpeakerSyncedHighlight(reelDirectory);
    await buildMasterTimeline(reelDirectory, { strict: false });
    await stampAppliedWordSyncAudioBinding(reelDirectory, binding.audioFingerprintSha256 ?? null);
  }

  console.log(`Antigravity-Wort-Synchronisierung: ${completeCoverage ? 'vollständig bestanden' : 'Prüfung nötig'}`);
  console.log(`Wörter mit Zeiten: ${report.timedWords}/${report.totalWords}`);
  console.log(`Abdeckung: ${(report.coverage * 100).toFixed(1)} %`);
  console.log(`Nicht zugeordnete Wörter: ${report.unassignedWords?.length ?? 0}`);
  console.log(`Untertitel-Cues: ${report.cueCount}`);
  console.log(`Sprecher-Markierung: ${SUBTITLE_STYLE.highlightColor} auf dem aktuell gesprochenen Wort`);
  if (prerequisites.timelineReadiness.required) console.log('Timeline: audio-synced bestätigt.');
  if (prerequisites.pacingBinding.required) console.log('Audio-Pacing-Datei: Fingerprint unverändert.');
  if (binding.required) console.log('Word-Sync-Audio: Fingerprint unverändert bestätigt.');
  else console.log('Word-Sync-Audio: Legacy-Workbench ohne Fingerprint; bestehendes Verhalten bleibt kompatibel.');
  console.log('Externer Upload: nein');
  console.log('API-Key erforderlich: nein');
  if (validateOnly) console.log('Validierung: Es wurden keine Untertiteldateien geändert.');
  else console.log('Aktualisiert: subtitles/subtitle-plan.json, Timeline, Render-Plan und review/word-sync-report.json');

  if (!completeCoverage) {
    for (const check of report.checks.filter((item) => !item.passed)) {
      console.log(`- ${check.level.toUpperCase()}: ${check.message}`);
    }
    if ((report.unassignedWords?.length ?? 0) > 0) {
      console.log('- ERROR: Mindestens ein gesprochenes Wort liegt außerhalb der Untertitel-Cues. Timeline/Szenengrenzen müssen korrigiert und erneut akustisch geprüft werden.');
    }
    if (strict) process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
