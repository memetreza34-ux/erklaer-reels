import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { sha256File } from '../src/core/file-fingerprint.js';
import {
  invalidateStaleWordSyncWorkbench,
  stampAppliedWordSyncAudioBinding,
  stampPreparedWordSyncAudioBinding,
  verifyAppliedWordSyncAudioBinding,
  verifyPreparedWordSyncAudioBinding
} from '../src/core/word-sync-audio-guard.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'word-sync-audio-guard-'));
  for (const directory of ['audio', 'subtitles', 'review', 'render']) {
    await mkdir(path.join(root, directory), { recursive: true });
  }
  await writeFile(path.join(root, 'audio', 'voiceover-tight.m4a'), 'audio-version-a', 'utf8');
  await writeJson(path.join(root, 'assets-manifest.json'), {
    audio: { expectedFile: 'audio/voiceover-tight.m4a', status: 'ready' }
  });
  await writeJson(path.join(root, 'status.json'), { wordSync: 'pending-codex-audio-review' });
  await writeJson(path.join(root, 'subtitles', 'subtitle-plan.json'), {
    timingStatus: 'waiting-for-codex-word-sync',
    cues: []
  });
  await writeJson(path.join(root, 'subtitles', 'codex-word-sync.json'), {
    version: 1,
    audioFile: 'audio/voiceover-tight.m4a',
    status: 'pending-codex-audio-review',
    words: [{
      index: 1,
      text: 'Test',
      startSeconds: null,
      endSeconds: null,
      confidence: null,
      reviewed: false,
      note: ''
    }]
  });
  await writeJson(path.join(root, 'review', 'word-sync-report.json'), {
    version: 2,
    passed: false,
    audioFile: 'audio/voiceover-tight.m4a'
  });
  return root;
}

test('Vorbereitung bindet den Word-Sync per SHA-256 an das aktuelle Audio', async () => {
  const root = await fixture();
  const stamped = await stampPreparedWordSyncAudioBinding(root);
  const workbench = await readJson(path.join(root, 'subtitles', 'codex-word-sync.json'));

  assert.equal(workbench.version, 2);
  assert.equal(workbench.audioBindingStatus, 'fingerprinted-for-review');
  assert.equal(workbench.audioFingerprintSha256, await sha256File(path.join(root, 'audio', 'voiceover-tight.m4a')));
  assert.equal(stamped.audioFingerprintSha256, workbench.audioFingerprintSha256);

  const verification = await verifyPreparedWordSyncAudioBinding(root);
  assert.equal(verification.required, true);
  assert.equal(verification.passed, true);
});

test('Audioänderung nach Vorbereitung wird vor apply erkannt', async () => {
  const root = await fixture();
  await stampPreparedWordSyncAudioBinding(root);
  await writeFile(path.join(root, 'audio', 'voiceover-tight.m4a'), 'audio-version-b', 'utf8');

  const verification = await verifyPreparedWordSyncAudioBinding(root);
  assert.equal(verification.required, true);
  assert.equal(verification.passed, false);
});

test('erneute Vorbereitung verwirft bestätigte Zeiten bei geänderter Audiodatei', async () => {
  const root = await fixture();
  await stampPreparedWordSyncAudioBinding(root);
  const workbenchPath = path.join(root, 'subtitles', 'codex-word-sync.json');
  const workbench = await readJson(workbenchPath);
  workbench.words[0] = {
    ...workbench.words[0],
    startSeconds: 0.1,
    endSeconds: 0.4,
    confidence: 0.98,
    reviewed: true
  };
  await writeJson(workbenchPath, workbench);
  await writeJson(path.join(root, 'review', 'word-sync-report.json'), {
    version: 4,
    passed: true,
    audioFile: 'audio/voiceover-tight.m4a',
    audioFingerprintSha256: workbench.audioFingerprintSha256
  });
  await writeJson(path.join(root, 'subtitles', 'subtitle-plan.json'), {
    timingStatus: 'codex-word-synced',
    cues: [{ timingStatus: 'codex-word-synced', timingSource: 'codex-local-audio-review' }]
  });
  await writeFile(path.join(root, 'audio', 'voiceover-tight.m4a'), 'audio-version-b', 'utf8');

  const result = await invalidateStaleWordSyncWorkbench(root);
  const updated = await readJson(workbenchPath);
  const report = await readJson(path.join(root, 'review', 'word-sync-report.json'));
  const subtitlePlan = await readJson(path.join(root, 'subtitles', 'subtitle-plan.json'));

  assert.equal(result.changed, true);
  assert.equal(updated.words[0].reviewed, false);
  assert.equal(updated.words[0].startSeconds, null);
  assert.equal(updated.words[0].endSeconds, null);
  assert.equal(report.passed, false);
  assert.equal(subtitlePlan.timingStatus, 'invalidated-audio-fingerprint-changed');
});

test('angewendeter Word-Sync bleibt nur für dieselbe Produktionsdatei gültig', async () => {
  const root = await fixture();
  const prepared = await stampPreparedWordSyncAudioBinding(root);
  await writeJson(path.join(root, 'review', 'word-sync-report.json'), {
    version: 3,
    passed: true,
    audioFile: 'audio/voiceover-tight.m4a'
  });
  await writeJson(path.join(root, 'review', 'codex-word-sync-report.json'), {
    version: 3,
    passed: true,
    audioFile: 'audio/voiceover-tight.m4a'
  });
  await stampAppliedWordSyncAudioBinding(root, prepared.audioFingerprintSha256);

  let verification = await verifyAppliedWordSyncAudioBinding(root);
  assert.equal(verification.required, true);
  assert.equal(verification.passed, true);

  await writeFile(path.join(root, 'audio', 'replacement.m4a'), 'completely-new-audio', 'utf8');
  await writeJson(path.join(root, 'assets-manifest.json'), {
    audio: { expectedFile: 'audio/replacement.m4a', status: 'ready' }
  });
  await writeJson(path.join(root, 'render', 'render-plan.json'), {
    voiceover: { file: 'audio/replacement.m4a' }
  });

  verification = await verifyAppliedWordSyncAudioBinding(root);
  assert.equal(verification.required, true);
  assert.equal(verification.passed, false);
  assert.ok(verification.checkedAudioFiles.some((entry) => entry.audioFile === 'audio/replacement.m4a' && !entry.passed));
});

test('alte Word-Sync-Berichte ohne Fingerprint bleiben kompatibel', async () => {
  const root = await fixture();
  await writeJson(path.join(root, 'review', 'word-sync-report.json'), {
    version: 3,
    passed: true,
    audioFile: 'audio/voiceover-tight.m4a'
  });

  const verification = await verifyAppliedWordSyncAudioBinding(root);
  assert.equal(verification.required, false);
  assert.equal(verification.passed, true);
  assert.equal(verification.legacy, true);
});
