import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { verifyFutureEffectsCoverage } from '../src/core/effects-quality-file-guard.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

const transitionSound = {
  type: 'soft-whoosh',
  volume: 0.22,
  visualEvent: 'Szenenwechsel',
  reason: 'Kurzer Übergangsakzent.'
};

const internalSound = {
  type: 'click',
  targetId: 'scene-02-image-02',
  audioCue: 'zweiter Moment',
  volume: 0.2,
  visualEvent: 'Interner Bildwechsel',
  reason: 'Markiert den zweiten Bildmoment.'
};

async function withFixture(effects, callback, {
  scene1Motion = { type: 'subtle-push-in' },
  scene2Motion = { type: 'ken-burns' }
} = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'future-effects-'));
  try {
    await writeJson(path.join(root, 'reel.json'), { date: '2026-09-02' });
    await writeJson(path.join(root, 'scenes', 'scene-index.json'), [
      {
        sceneId: 'scene-01',
        order: 1,
        imagePhases: [{ phaseId: 'scene-01-image-01', order: 1, startPercent: 0 }]
      },
      {
        sceneId: 'scene-02',
        order: 2,
        imagePhases: [
          { phaseId: 'scene-02-image-01', order: 1, startPercent: 0 },
          { phaseId: 'scene-02-image-02', order: 2, startPercent: 0.5, audioCue: 'zweiter Moment' }
        ]
      }
    ]);
    await writeJson(path.join(root, 'effects', 'effects-plan.json'), {
      enabled: true,
      voiceoverPriority: true,
      backgroundMusic: { enabled: false },
      scenes: [
        { sceneId: 'scene-01', cameraMotion: scene1Motion, soundEffects: [] },
        { sceneId: 'scene-02', cameraMotion: scene2Motion, soundEffects: effects }
      ]
    });
    await callback(await verifyFutureEffectsCoverage(root));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('zukünftiges Reel besteht mit sichtbarer Motion sowie Szenen- und internem Bildwechsel-SFX', async () => {
  await withFixture([
    transitionSound,
    internalSound
  ], (result) => {
    assert.equal(result.required, true);
    assert.equal(result.passed, true);
    assert.deepEqual(result.findings, []);
  });
});

test('zukünftiges Reel wird ohne internen Bildwechsel-SFX blockiert', async () => {
  await withFixture([
    transitionSound
  ], (result) => {
    assert.equal(result.passed, false);
    assert.equal(result.findings.some((item) => item.issue === 'internal-image-change-sfx-missing'), true);
  });
});

test('unbekannte Motion-Namen dürfen nicht mehr still zu einem statischen Bild werden', async () => {
  await withFixture([
    transitionSound,
    internalSound
  ], (result) => {
    assert.equal(result.passed, false);
    assert.equal(result.findings.some((item) => item.issue === 'camera-motion-unknown'), true);
  }, { scene2Motion: { type: 'gentle-pan' } });
});

test('cameraMotion none wird für zukünftige Reels blockiert', async () => {
  await withFixture([
    transitionSound,
    internalSound
  ], (result) => {
    assert.equal(result.passed, false);
    assert.equal(result.findings.some((item) => item.issue === 'camera-motion-static'), true);
  }, { scene2Motion: { type: 'none' } });
});

test('unbekannte Soundtypen werden bereits vor Audio und Render blockiert', async () => {
  await withFixture([
    { ...transitionSound, type: 'whoosh-light' },
    internalSound
  ], (result) => {
    assert.equal(result.passed, false);
    assert.equal(result.findings.some((item) => item.issue === 'sound-type-unknown'), true);
    assert.equal(result.findings.some((item) => item.issue === 'scene-change-sfx-missing'), true);
  });
});
