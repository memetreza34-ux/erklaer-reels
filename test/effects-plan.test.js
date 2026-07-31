import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createReelWorkspace } from '../src/core/workspace.js';

test('erstellt für jede Szene einen sicheren Bewegungs- und Soundplan', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-effects-'));
  const result = await createReelWorkspace({
    title: 'Warum fühlt sich Warten so lang an?',
    script: 'Beim Warten achten Menschen besonders stark auf die Zeit. Dadurch wirkt jeder einzelne Moment länger als in einer beschäftigten Situation.',
    date: new Date('2026-07-31T12:00:00'),
    sceneCount: 10,
    outputRoot
  });

  const effectPlanPath = path.join(result.reelDirectory, 'effects', 'effects-plan.json');
  const effectPlan = JSON.parse(await readFile(effectPlanPath, 'utf8'));

  assert.equal(effectPlan.enabled, true);
  assert.equal(effectPlan.voiceoverPriority, true);
  assert.equal(effectPlan.backgroundMusic.enabled, false);
  assert.equal(effectPlan.scenes.length, 10);
  assert.equal(effectPlan.scenes[0].sceneId, 'scene-01');
  assert.equal(effectPlan.scenes[0].transitionIn.type, 'none');
  assert.equal(effectPlan.scenes[0].cameraMotion.type, 'subtle-push-in');
  assert.equal(effectPlan.scenes[0].cameraMotion.endScale, 1.04);
  assert.deepEqual(effectPlan.scenes[1].soundEffects, []);
});
