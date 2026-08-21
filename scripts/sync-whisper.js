#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { buildMasterTimeline } from '../src/core/timeline.js';
import {
  alignAudioCueTimings,
  alignWhisperWords
} from '../src/core/whisper-alignment.js';
import { verifyPreparedWordSyncAudioBinding } from '../src/core/word-sync-audio-guard.js';

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function markBlocked(reelDirectory) {
  const statusPath = path.join(reelDirectory, 'status.json');
  const timelinePath = path.join(reelDirectory, 'timeline', 'timeline-plan.json');
  const renderPlanPath = path.join(reelDirectory, 'render', 'render-plan.json');
  const status = await exists(statusPath) ? await readJson(statusPath) : {};
  status.wordSync = 'needs-review';
  status.timeline = 'needs-review';
  status.render = 'blocked-subtitle-sync';
  const writes = [writeJson(statusPath, status)];
  if (await exists(timelinePath)) {
    const timeline = await readJson(timelinePath);
    timeline.timingStatus = 'needs-review';
    writes.push(writeJson(timelinePath, timeline));
  }
  if (await exists(renderPlanPath)) {
    const renderPlan = await readJson(renderPlanPath);
    renderPlan.status = 'blocked-subtitle-sync';
    writes.push(writeJson(renderPlanPath, renderPlan));
  }
  await Promise.all(writes);
}

function verifyWhisperDuration(wordReport, expectedAudioDurationSeconds) {
  const expected = Number(expectedAudioDurationSeconds);
  const lastWordEnd = Number(wordReport.whisperEndSeconds);
  if (!Number.isFinite(expected) || expected <= 0 || !Number.isFinite(lastWordEnd)) {
    return { passed: false, expectedAudioDurationSeconds: expected || null, lastWhisperWordEndSeconds: null, trailingSilenceSeconds: null };
  }
  const trailingSilenceSeconds = expected - lastWordEnd;
  return {
    passed: trailingSilenceSeconds >= -0.08 && trailingSilenceSeconds <= 1,
    expectedAudioDurationSeconds: expected,
    lastWhisperWordEndSeconds: lastWordEnd,
    trailingSilenceSeconds: Math.round(trailingSilenceSeconds * 1000) / 1000
  };
}

function failureMessage(wordReport, cueReport, durationReport) {
  const issues = [];
  if (wordReport.unmatchedScriptWords.length) {
    issues.push(`Scriptwörter ohne Whisper-Treffer: ${wordReport.unmatchedScriptWords.join(', ')}`);
  }
  if (wordReport.fuzzyScriptWords.length) {
    issues.push(`unsichere Worttreffer: ${wordReport.fuzzyScriptWords.join(', ')}`);
  }
  if (wordReport.extraWhisperWords.length) {
    issues.push(`zusätzliche gesprochene Wörter: ${wordReport.extraWhisperWords.join(', ')}`);
  }
  if (cueReport.unmatchedCues.length) {
    issues.push(`Bild-Cues ohne exakten Treffer: ${cueReport.unmatchedCues.join(', ')}`);
  }
  if (!durationReport.passed) {
    issues.push(`Whisper-Zeitachse endet bei ${durationReport.lastWhisperWordEndSeconds ?? 'unbekannt'} s, finales Audio bei ${durationReport.expectedAudioDurationSeconds ?? 'unbekannt'} s`);
  }
  return issues.join('; ');
}

async function main() {
  const whisperPath = process.argv[2];
  const reelDirectory = process.argv[3];
  if (!whisperPath || !reelDirectory) {
    throw new Error('Verwendung: node scripts/sync-whisper.js <whisper_out.json> <reel-ordner>');
  }

  const codexPath = path.join(reelDirectory, 'subtitles', 'codex-word-sync.json');
  const audioSyncPath = path.join(reelDirectory, 'timeline', 'audio-sync.json');
  for (const requiredPath of [whisperPath, codexPath, audioSyncPath]) {
    if (!(await exists(requiredPath))) throw new Error(`Pflichtdatei fehlt: ${requiredPath}`);
  }

  const binding = await verifyPreparedWordSyncAudioBinding(reelDirectory);
  if (!binding.required) {
    throw new Error('Der Word-Sync besitzt noch keinen Audio-Fingerprint. Führe zuerst npm run sync:words -- --dir "<reel-ordner>" aus.');
  }
  if (!binding.passed) {
    throw new Error('Die Audiodatei wurde nach der Word-Sync-Vorbereitung verändert. Erzeuge Whisper-Zeiten erneut aus dem finalen Audio.');
  }

  const [whisperPayload, codex, audioSync] = await Promise.all([
    readJson(whisperPath),
    readJson(codexPath),
    readJson(audioSyncPath)
  ]);
  const wordAlignment = alignWhisperWords(codex.words, whisperPayload);
  const cueAlignment = alignAudioCueTimings(audioSync.cueTimings, wordAlignment.words);
  const durationAlignment = verifyWhisperDuration(
    wordAlignment.report,
    codex.audioDurationSeconds ?? audioSync.audioDurationSeconds
  );
  const passed = wordAlignment.passed && cueAlignment.passed && durationAlignment.passed;
  const createdAt = new Date().toISOString();
  const report = {
    version: 1,
    createdAt,
    passed,
    source: 'whisper-final-audio',
    whisperFile: path.basename(whisperPath),
    audioFile: codex.audioFile,
    audioFingerprintSha256: binding.audioFingerprintSha256,
    fallbackCount: 0,
    words: wordAlignment.report,
    imageCues: cueAlignment.report,
    durationAlignment,
    checks: [
      {
        id: 'audio-fingerprint-current',
        passed: true,
        level: 'error',
        message: 'Whisper-Abgleich ist an die unveränderte vorbereitete Produktionsdatei gebunden.'
      },
      {
        id: 'all-script-words-exact',
        passed: wordAlignment.passed,
        level: 'error',
        message: 'Jedes Scriptwort muss exakt und ohne zusätzliche gesprochene Wörter aus Whisper ausgerichtet sein.'
      },
      {
        id: 'all-image-cues-exact',
        passed: cueAlignment.passed,
        level: 'error',
        message: 'Jeder Bildwechsel benötigt einen exakten Treffer in den ausgerichteten Wörtern.'
      },
      {
        id: 'whisper-duration-matches-final-audio',
        passed: durationAlignment.passed,
        level: 'error',
        message: 'Die Whisper-Zeitachse muss zur Dauer des final verarbeiteten Audios passen.'
      },
      {
        id: 'no-timing-fallbacks',
        passed: true,
        level: 'error',
        message: 'Es wurden keine Zeitwerte geschätzt oder erfunden.'
      }
    ]
  };

  codex.words = wordAlignment.words;
  codex.status = passed ? 'whisper-aligned' : 'needs-review';
  codex.updatedAt = createdAt;
  codex.whisperAlignment = {
    status: passed ? 'passed' : 'needs-review',
    reportFile: 'review/whisper-sync-report.json',
    audioFingerprintSha256: binding.audioFingerprintSha256,
    fallbackCount: 0,
    unmatchedScriptWords: wordAlignment.report.unmatchedScriptWords,
    fuzzyScriptWords: wordAlignment.report.fuzzyScriptWords,
    extraWhisperWords: wordAlignment.report.extraWhisperWords,
    unmatchedCues: cueAlignment.report.unmatchedCues
  };
  audioSync.cueTimings = cueAlignment.cueTimings;
  audioSync.timingStatus = passed ? 'whisper-aligned' : 'needs-review';
  audioSync.timingSource = 'whisper-final-audio';
  audioSync.audioFingerprintSha256 = binding.audioFingerprintSha256;

  await Promise.all([
    writeJson(codexPath, codex),
    writeJson(audioSyncPath, audioSync),
    writeJson(path.join(reelDirectory, 'review', 'whisper-sync-report.json'), report)
  ]);

  if (!passed) {
    await markBlocked(reelDirectory);
    throw new Error(`Whisper-Synchronisierung blockiert: ${failureMessage(wordAlignment.report, cueAlignment.report, durationAlignment)}`);
  }

  const timelineResult = await buildMasterTimeline(reelDirectory, { strict: false });
  codex.scenes = timelineResult.timeline.scenes.map((scene) => ({
    sceneId: scene.sceneId,
    startSeconds: scene.startSeconds,
    endSeconds: scene.endSeconds,
    audioCue: scene.audioCue ?? ''
  }));
  await writeJson(codexPath, codex);

  const statusPath = path.join(reelDirectory, 'status.json');
  const status = await exists(statusPath) ? await readJson(statusPath) : {};
  status.wordSync = 'whisper-aligned-needs-strict-apply';
  status.timeline = timelineResult.timeline.timingStatus;
  status.render = 'blocked-until-strict-word-sync';
  await writeJson(statusPath, status);

  console.log(`Whisper-Synchronisierung bestanden: ${wordAlignment.report.exactlyAlignedWords}/${wordAlignment.report.scriptWordCount} Wörter.`);
  console.log(`Bild-Cues: ${cueAlignment.report.matchedCueCount}/${cueAlignment.report.cueCount}.`);
  console.log('Fallbacks: 0. Timeline wurde aus den echten Cue-Zeiten neu aufgebaut.');
  console.log(`Nächster Schritt: npm run sync:words -- --dir "${reelDirectory}" --apply --strict`);
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
