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

async function withFixture(effects, callback) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'future-effects-'));
  try {
    await writeJson(path.join(root, 'reel.json'), { date: '2026-09-02' });
    await writeJson(path.join(root, 'scenes', 'scene-index.json'), [
      {
        sceneId: 'scene-01',
        order: 1,
        imagePhases: [{ phaseId: 'scene-01-image-01', startPercent: 0 }]
      },
      {
        sceneId: 'scene-02',
        order: 2,
        imagePhases: [
          { phaseId: 'scene-02-image-01', startPercent: 0 },
          { phaseId: 'scene-02-image-02', startPercent: 0.5 }
        ]
      }
    ]);
    await writeJson(path.join(root, 'effects', 'effects-plan.json'), {
      scenes: [
        { sceneId: 'scene-01', soundEffects: [] },
        { sceneId: 'scene-02', soundEffects: effects }
      ]
    });
    await callback(await verifyFutureEffectsCoverage(root));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('zukünftiges Reel besteht mit Szenen- und internem Bildwechsel-SFX', async () => {
  await withFixture([
    { type: 'soft-whoosh' },
    { type: 'click', targetId: 'scene-02-image-02' }
  ], (result) => {
    assert.equal(result.required, true);
    assert.equal(result.passed, true);
    assert.deepEqual(result.findings, []);
  });
});

test('zukünftiges Reel wird ohne internen Bildwechsel-SFX blockiert', async () => {
  await withFixture([
    { type: 'soft-whoosh' }
  ], (result) => {
    assert.equal(result.passed, false);
    assert.equal(result.findings.some((item) => item.issue === 'internal-image-change-sfx-missing'), true);
  });
});
