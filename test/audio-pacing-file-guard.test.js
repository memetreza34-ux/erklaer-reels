import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { sha256File } from '../src/core/file-fingerprint.js';
import {
  stampAudioPacingFileBinding,
  verifyAudioPacingFileBinding
} from '../src/core/audio-pacing-file-guard.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'audio-pacing-file-guard-'));
  for (const directory of ['audio', 'review', 'render']) {
    await mkdir(path.join(root, directory), { recursive: true });
  }
  await writeFile(path.join(root, 'audio', 'voiceover-tight.m4a'), 'measured-audio-a', 'utf8');
  await writeJson(path.join(root, 'assets-manifest.json'), {
    audio: { expectedFile: 'audio/voiceover-tight.m4a', status: 'ready' }
  });
  await writeJson(path.join(root, 'review', 'audio-pacing-report.json'), {
    version: 5,
    passed: true,
    outputFile: 'audio/voiceover-tight.m4a',
    loudnessMeasured: true,
    loudnessMeasurement: {
      integratedLufs: -16.1,
      truePeakDbtp: -1.7,
      passed: true
    }
  });
  return root;
}

test('bindet den Audio-Pacing-Report per SHA-256 an die gemessene Datei', async () => {
  const root = await fixture();
  const stamped = await stampAudioPacingFileBinding(root);
  const report = await readJson(path.join(root, 'review', 'audio-pacing-report.json'));
  const manifest = await readJson(path.join(root, 'assets-manifest.json'));
  const fingerprint = await sha256File(path.join(root, 'audio', 'voiceover-tight.m4a'));

  assert.equal(report.version, 6);
  assert.equal(report.audioFingerprintSha256, fingerprint);
  assert.equal(report.audioBindingStatus, 'verified-after-measurement');
  assert.equal(manifest.audio.audioFingerprintSha256, fingerprint);
  assert.equal(stamped.audioFingerprintSha256, fingerprint);
});

test('unveränderte gemessene Datei besteht die Bindungsprüfung', async () => {
  const root = await fixture();
  await stampAudioPacingFileBinding(root);

  const verification = await verifyAudioPacingFileBinding(root);
  assert.equal(verification.required, true);
  assert.equal(verification.passed, true);
});

test('ersetzte Audiodatei macht alte Lautheitsmessung ungültig', async () => {
  const root = await fixture();
  await stampAudioPacingFileBinding(root);
  await writeFile(path.join(root, 'audio', 'voiceover-tight.m4a'), 'different-audio', 'utf8');

  const verification = await verifyAudioPacingFileBinding(root);
  assert.equal(verification.required, true);
  assert.equal(verification.passed, false);
});

test('Manifest- oder Render-Plan-Wechsel auf anderes Audio wird erkannt', async () => {
  const root = await fixture();
  await stampAudioPacingFileBinding(root);
  await writeFile(path.join(root, 'audio', 'replacement.m4a'), 'different-audio', 'utf8');
  await writeJson(path.join(root, 'assets-manifest.json'), {
    audio: { expectedFile: 'audio/replacement.m4a', status: 'ready' }
  });
  await writeJson(path.join(root, 'render', 'render-plan.json'), {
    voiceover: { file: 'audio/replacement.m4a' }
  });

  const verification = await verifyAudioPacingFileBinding(root);
  assert.equal(verification.required, true);
  assert.equal(verification.passed, false);
  assert.ok(verification.checkedAudioFiles.some((entry) => entry.audioFile === 'audio/replacement.m4a' && !entry.passed));
});

test('identische Kopie unter neuem Pfad bleibt messtechnisch gültig', async () => {
  const root = await fixture();
  await stampAudioPacingFileBinding(root);
  await writeFile(path.join(root, 'audio', 'copy.m4a'), 'measured-audio-a', 'utf8');
  await writeJson(path.join(root, 'assets-manifest.json'), {
    audio: { expectedFile: 'audio/copy.m4a', status: 'ready' }
  });
  await writeJson(path.join(root, 'render', 'render-plan.json'), {
    voiceover: { file: 'audio/copy.m4a' }
  });

  const verification = await verifyAudioPacingFileBinding(root);
  assert.equal(verification.required, true);
  assert.equal(verification.passed, true);
});

test('ältere Audio-Pacing-Reports ohne Fingerprint bleiben kompatibel', async () => {
  const root = await fixture();

  const verification = await verifyAudioPacingFileBinding(root);
  assert.equal(verification.required, false);
  assert.equal(verification.passed, true);
  assert.equal(verification.legacy, true);
});
