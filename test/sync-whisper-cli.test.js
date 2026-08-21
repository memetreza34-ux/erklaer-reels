import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { stampPreparedWordSyncAudioBinding } from '../src/core/word-sync-audio-guard.js';

const execFileAsync = promisify(execFile);
const repositoryRoot = path.resolve('.');

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function fixture(whisperWords) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sync-whisper-cli-'));
  for (const directory of ['audio', 'effects', 'render', 'review', 'scenes', 'subtitles', 'timeline']) {
    await mkdir(path.join(root, directory), { recursive: true });
  }
  await writeFile(path.join(root, 'audio', 'voiceover-tight.m4a'), 'final-audio-bytes', 'utf8');
  await writeJson(path.join(root, 'reel.json'), {
    reelId: 'reel-01_sync-test',
    targetDurationSeconds: 2,
    endingHoldSeconds: 0.7
  });
  const scenes = [
    {
      sceneId: 'scene-01', order: 1, title: 'Hook', audioCue: 'Hallo', leadInSeconds: 0,
      expectedImageFileName: 'scene-01.png', subtitleCues: []
    },
    {
      sceneId: 'scene-02', order: 2, title: 'Ende', audioCue: 'Welt', leadInSeconds: 0.1,
      expectedImageFileName: 'scene-02.png', subtitleCues: []
    }
  ];
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), scenes);
  await writeJson(path.join(root, 'subtitles', 'subtitle-plan.json'), { cues: [] });
  await writeJson(path.join(root, 'effects', 'effects-plan.json'), {
    backgroundMusic: { enabled: false },
    scenes: scenes.map((scene, index) => ({
      sceneId: scene.sceneId,
      transitionIn: { type: index === 0 ? 'none' : 'cut', durationSeconds: 0 },
      cameraMotion: { type: 'none', startScale: 1, endScale: 1, panXPercent: 0, panYPercent: 0 },
      soundEffects: []
    }))
  });
  await writeJson(path.join(root, 'assets-manifest.json'), {
    audio: { expectedFile: 'audio/voiceover-tight.m4a', status: 'ready' },
    scenes: scenes.map((scene) => ({
      sceneId: scene.sceneId,
      expectedFile: `scenes/${scene.sceneId}/${scene.expectedImageFileName}`,
      status: 'ready'
    }))
  });
  await writeJson(path.join(root, 'timeline', 'audio-sync.json'), {
    version: 2,
    audioDurationSeconds: 2,
    cueTimings: scenes.map((scene, index) => ({
      sceneId: scene.sceneId,
      audioCue: scene.audioCue,
      cueTimeSeconds: index === 0 ? 0 : 1,
      leadInSeconds: scene.leadInSeconds,
      confidence: 1
    }))
  });
  await writeJson(path.join(root, 'timeline', 'timeline-plan.json'), {
    timingStatus: 'audio-synced',
    audio: { file: 'audio/voiceover-tight.m4a', durationSeconds: 2 },
    scenes: [
      { sceneId: 'scene-01', startSeconds: 0, endSeconds: 0.9, audioCue: 'Hallo' },
      { sceneId: 'scene-02', startSeconds: 0.9, endSeconds: 2.7, audioCue: 'Welt' }
    ]
  });
  await writeJson(path.join(root, 'subtitles', 'codex-word-sync.json'), {
    version: 2,
    status: 'pending-codex-audio-review',
    audioFile: 'audio/voiceover-tight.m4a',
    audioDurationSeconds: 2,
    words: [
      { index: 1, text: 'Hallo', startSeconds: null, endSeconds: null, confidence: null, reviewed: false },
      { index: 2, text: 'Welt', startSeconds: null, endSeconds: null, confidence: null, reviewed: false }
    ],
    scenes: []
  });
  await writeJson(path.join(root, 'status.json'), { timeline: 'audio-synced' });
  await stampPreparedWordSyncAudioBinding(root);
  const whisperPath = path.join(root, 'whisper.json');
  await writeJson(whisperPath, whisperWords);
  return { root, whisperPath };
}

test('CLI baut Wort- und Bildzeiten ausschließlich aus exakten Whisper-Treffern neu', async () => {
  const { root, whisperPath } = await fixture([
    { word: 'Hallo', start: 0.1, end: 0.45 },
    { word: 'Welt', start: 1.2, end: 1.55 }
  ]);

  const { stdout } = await execFileAsync(process.execPath, [
    path.join(repositoryRoot, 'scripts', 'sync-whisper.js'), whisperPath, root
  ], { cwd: repositoryRoot });
  const codex = await readJson(path.join(root, 'subtitles', 'codex-word-sync.json'));
  const audioSync = await readJson(path.join(root, 'timeline', 'audio-sync.json'));
  const report = await readJson(path.join(root, 'review', 'whisper-sync-report.json'));
  const status = await readJson(path.join(root, 'status.json'));

  assert.match(stdout, /Fallbacks: 0/);
  assert.equal(codex.words[1].startSeconds, 1.2);
  assert.equal(codex.words[1].reviewed, true);
  assert.equal(audioSync.cueTimings[1].cueTimeSeconds, 1.2);
  assert.equal(audioSync.cueTimings[1].matchMethod, 'whisper-word-alignment');
  assert.equal(report.passed, true);
  assert.equal(report.fallbackCount, 0);
  assert.equal(status.render, 'blocked-until-strict-word-sync');
});

test('CLI blockiert fehlende Wörter und Bild-Cues ohne Zeit-Fallback', async () => {
  const { root, whisperPath } = await fixture([
    { word: 'Hallo', start: 0.1, end: 0.45 }
  ]);

  await assert.rejects(
    execFileAsync(process.execPath, [
      path.join(repositoryRoot, 'scripts', 'sync-whisper.js'), whisperPath, root
    ], { cwd: repositoryRoot }),
    /Whisper-Synchronisierung blockiert/
  );
  const codex = await readJson(path.join(root, 'subtitles', 'codex-word-sync.json'));
  const audioSync = await readJson(path.join(root, 'timeline', 'audio-sync.json'));
  const status = await readJson(path.join(root, 'status.json'));
  const timeline = await readJson(path.join(root, 'timeline', 'timeline-plan.json'));

  assert.equal(codex.words[1].startSeconds, null);
  assert.equal(codex.words[1].reviewed, false);
  assert.equal(audioSync.cueTimings[1].cueTimeSeconds, null);
  assert.equal(audioSync.cueTimings[1].confidence, null);
  assert.equal(status.render, 'blocked-subtitle-sync');
  assert.equal(timeline.timingStatus, 'needs-review');
});

test('CLI blockiert Whisper-Zeiten von einer anders langen Audiodatei', async () => {
  const { root, whisperPath } = await fixture([
    { word: 'Hallo', start: 0.2, end: 0.8 },
    { word: 'Welt', start: 2.5, end: 2.8 }
  ]);

  await assert.rejects(
    execFileAsync(process.execPath, [
      path.join(repositoryRoot, 'scripts', 'sync-whisper.js'), whisperPath, root
    ], { cwd: repositoryRoot }),
    /Whisper-Zeitachse endet bei 2\.8 s, finales Audio bei 2 s/
  );
  const report = await readJson(path.join(root, 'review', 'whisper-sync-report.json'));

  assert.equal(report.words.passed, true);
  assert.equal(report.imageCues.passed, true);
  assert.equal(report.durationAlignment.passed, false);
  assert.equal(report.passed, false);
});
