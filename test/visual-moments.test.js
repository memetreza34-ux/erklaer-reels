import test from 'node:test';
import assert from 'node:assert/strict';

import {
  flattenSceneImagePhases,
  normalizeSceneImagePhases,
  plannedImageCount,
  visualTargetMap
} from '../src/shared/visual-moments.js';

test('legacy Szene bleibt automatisch eine Bildphase', () => {
  const scene = {
    sceneId: 'scene-01',
    order: 1,
    visualIdea: 'Ein Land auf einer Karte.',
    imageText: 'LAND',
    expectedImageFileName: 'scene-01.png'
  };

  const phases = normalizeSceneImagePhases(scene);
  assert.equal(phases.length, 1);
  assert.equal(phases[0].targetId, 'scene-01');
  assert.equal(phases[0].startPercent, 0);
  assert.equal(phases[0].promptFileName, 'image-prompt.txt');
  assert.equal(phases[0].expectedImageFileName, 'scene-01.png');
});

test('mehrere Bildphasen werden in globaler Bildreihenfolge sortiert', () => {
  const scenes = [
    { sceneId: 'scene-02', order: 2, imagePhases: [
      { phaseId: 'scene-02-image-01', startPercent: 0 },
      { phaseId: 'scene-02-image-02', startPercent: 0.6 }
    ] },
    { sceneId: 'scene-01', order: 1 },
    { sceneId: 'scene-03', order: 3 }
  ];

  const phases = flattenSceneImagePhases(scenes);
  assert.deepEqual(phases.map((phase) => phase.targetId), [
    'scene-01',
    'scene-02',
    'scene-02-image-02',
    'scene-03'
  ]);
  assert.deepEqual(phases.map((phase) => phase.globalOrder), [1, 2, 3, 4]);
  assert.equal(plannedImageCount(scenes), 4);
  assert.equal(visualTargetMap(scenes).get('scene-02-image-02').sceneOrder, 2);
  assert.equal(visualTargetMap(scenes).get('scene-02-image-02').phaseOrder, 2);
});

test('ungültige interne Startwerte werden sicher normalisiert', () => {
  const phases = normalizeSceneImagePhases({
    sceneId: 'scene-01',
    order: 1,
    imagePhases: [
      { phaseId: 'scene-01-image-01', startPercent: 0.4 },
      { phaseId: 'scene-01-image-02', startPercent: 0 },
      { phaseId: 'scene-01-image-03', startPercent: 2 }
    ]
  });

  assert.equal(phases[0].startPercent, 0);
  assert.ok(phases[1].startPercent > phases[0].startPercent);
  assert.ok(phases[2].startPercent > phases[1].startPercent);
  assert.equal(phases.at(-1).endPercent, 1);
});
