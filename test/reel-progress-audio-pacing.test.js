import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { calculateReelProgress } from '../src/core/reel-progress.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function createFixture(playbackRate, loudnessNormalized = true) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'erklaer-audio-progress-'));
  await writeJson(path.join(root, 'reel.json'), {
    reelId: 'reel-01_audio-test',
    title: 'Audio Test',
    visualStyleId: 'human-editorial-cartoon',
    visualStyleReason: 'Ein konsistenter Editorial-Stil für den Test.'
  });
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), []);
  await writeJson(path.join(root, 'assets-manifest.json'), { audio: {}, scenes: [], cover: {} });
  await writeJson(path.join(root, 'subtitles', 'subtitle-plan.json'), { highlightCurrentWord: false });
  await writeJson(path.join(root, 'review', 'audio-pacing-report.json'), {
    createdAt: new Date().toISOString(),
    passed: true,
    beforeSeconds: 50,
    afterSeconds: 42,
    playbackRate,
    loudnessNormalized,
    loudnessSettings: {
      loudnessTargetLufs: -16,
      truePeakDbtp: -1.5,
      loudnessRangeLra: 11
    }
  });
  return root;
}

test('wertet 1.10x mit -16 LUFS als vollständiges Audio-Pacing', async () => {
  const root = await createFixture(1.1);
  const progress = await calculateReelProgress(root);

  assert.equal(progress.audioPacing, 100);
  assert.equal(progress.details.audioPacingPassed, true);
  assert.equal(progress.details.audioPacingRateSafe, true);
  assert.equal(progress.details.audioLoudnessNormalized, true);
  assert.equal(progress.details.audioLoudnessTargetSafe, true);
  assert.equal(progress.details.audioTruePeakSafe, true);
});

test('wertet altes 1.05x nicht mehr als produktionsbereit', async () => {
  const root = await createFixture(1.05);
  const progress = await calculateReelProgress(root);

  assert.equal(progress.details.audioPacingPassed, false);
  assert.equal(progress.details.audioPacingRateSafe, false);
  assert.ok(progress.audioPacing < 100);
});
