import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createReelWorkspace } from '../src/core/workspace.js';
import { EDIT_TIMING_STYLE } from '../src/shared/edit-timing-style.js';

test('erstellt für jede Szene einen lebendigen Bewegungs- und Soundplan', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-effects-'));
  try {
    const result = await createReelWorkspace({
      title: 'Warum fühlt sich Warten so lang an?',
      script: 'Beim Warten achten Menschen besonders stark auf die Zeit. Dadurch wirkt jeder einzelne Moment länger als in einer beschäftigten Situation.',
      date: new Date('2026-09-02T12:00:00'),
      sceneCount: 9,
      outputRoot
    });

    const effectPlanPath = path.join(result.reelDirectory, 'effects', 'effects-plan.json');
    const effectPlan = JSON.parse(await readFile(effectPlanPath, 'utf8'));

    assert.equal(effectPlan.enabled, true);
    assert.equal(effectPlan.voiceoverPriority, true);
    assert.equal(effectPlan.backgroundMusic.enabled, false);
    assert.equal(effectPlan.defaults.soundEffectVolume, 0.22);
    assert.equal(effectPlan.defaults.imageCueLeadSeconds, EDIT_TIMING_STYLE.imageCueLeadSeconds);
    assert.equal(effectPlan.defaults.sfxPreRollSeconds, EDIT_TIMING_STYLE.sfxPreRollSeconds);
    assert.equal(effectPlan.scenes.length, 9);
    assert.equal(effectPlan.scenes[0].sceneId, 'scene-01');
    assert.equal(effectPlan.scenes[0].transitionIn.type, 'none');
    assert.equal(effectPlan.scenes[0].cameraMotion.type, 'subtle-push-in');
    assert.equal(effectPlan.scenes[0].cameraMotion.endScale, 1.03);

    const secondScene = effectPlan.scenes[1];
    assert.equal(secondScene.transitionIn.type, 'cut');
    assert.notEqual(secondScene.cameraMotion.type, 'none');
    assert.equal(secondScene.soundEffects.length, 2);
    assert.equal(Boolean(secondScene.soundEffects[0].targetId), false);
    assert.equal(secondScene.soundEffects[1].targetId, 'scene-02-image-02');
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});
