import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function makeFixture({ whisper, words, cues }) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'erklaer-sync-whisper-'));
  const reel = path.join(root, 'reel');
  const whisperPath = path.join(root, 'whisper.json');
  await writeJson(whisperPath, whisper);
  await writeJson(path.join(reel, 'subtitles', 'codex-word-sync.json'), {
    words: words.map((text, index) => ({ index: index + 1, text, startSeconds: null, endSeconds: null, reviewed: false, confidence: null }))
  });
  await writeJson(path.join(reel, 'timeline', 'audio-sync.json'), {
    cueTimings: cues.map((audioCue, index) => ({ sceneId: `scene-${String(index + 1).padStart(2, '0')}`, audioCue, cueTimeSeconds: null }))
  });
  return { root, reel, whisperPath };
}

test('übernimmt nur reale Whisper-Zeitstempel als unbestätigte Kandidaten', async () => {
  const fixture = await makeFixture({
    whisper: {
      words: [
        { word: 'Hallo', start: 0.12, end: 0.42 },
        { word: 'Welt', start: 0.55, end: 0.88 }
      ]
    },
    words: ['Hallo', 'Welt'],
    cues: ['Hallo Welt']
  });

  try {
    await execFileAsync(process.execPath, ['scripts/sync-whisper.js', fixture.whisperPath, fixture.reel], { cwd: process.cwd() });
    const codex = await readJson(path.join(fixture.reel, 'subtitles', 'codex-word-sync.json'));
    const audio = await readJson(path.join(fixture.reel, 'timeline', 'audio-sync.json'));

    assert.equal(codex.words[0].startSeconds, 0.12);
    assert.equal(codex.words[0].endSeconds, 0.42);
    assert.equal(codex.words[1].startSeconds, 0.55);
    assert.equal(codex.words[1].endSeconds, 0.88);
    assert.equal(codex.words.every((word) => word.reviewed === false), true);
    assert.equal(audio.cueTimings[0].candidateCueTimeSeconds, 0.12);
    assert.equal(audio.cueTimings[0].cueTimeSeconds, null);
    assert.equal(audio.cueTimings[0].reviewed, false);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('erfindet für nicht erkannte Wörter oder Szenenanker keine Zeiten', async () => {
  const fixture = await makeFixture({
    whisper: { words: [{ word: 'Hallo', start: 0.1, end: 0.4 }] },
    words: ['Hallo', 'unbekannt'],
    cues: ['unbekannt']
  });

  try {
    await assert.rejects(
      execFileAsync(process.execPath, ['scripts/sync-whisper.js', fixture.whisperPath, fixture.reel], { cwd: process.cwd() })
    );
    const codex = await readJson(path.join(fixture.reel, 'subtitles', 'codex-word-sync.json'));
    const audio = await readJson(path.join(fixture.reel, 'timeline', 'audio-sync.json'));

    assert.equal(codex.words[1].startSeconds, null);
    assert.equal(codex.words[1].endSeconds, null);
    assert.equal(codex.words[1].reviewed, false);
    assert.equal(audio.cueTimings[0].candidateCueTimeSeconds, null);
    assert.equal(audio.cueTimings[0].cueTimeSeconds, null);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});
