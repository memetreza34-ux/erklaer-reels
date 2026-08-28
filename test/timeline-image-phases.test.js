import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { buildMasterTimeline } from '../src/core/timeline.js';
import { flattenSceneImagePhases } from '../src/shared/visual-moments.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

test('behält narrative Szenen bei und erzeugt zusätzliche Render-Shots für Bildphasen', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'timeline-image-phases-'));
  const scenes = Array.from({ length: 12 }, (_, index) => {
    const sceneId = `scene-${String(index + 1).padStart(2, '0')}`;
    return {
      sceneId,
      order: index + 1,
      title: index === 0 ? 'Hook' : `Szene ${index + 1}`,
      narration: `Sprechertext für ${sceneId}`,
      audioCue: `Cue ${index + 1}`,
      leadInSeconds: 0.2,
      durationSeconds: 4.5,
      expectedImageFileName: `${sceneId}.png`,
      ...(index === 3 ? {
        imageCount: 2,
        imagePhases: [
          {
            phaseId: `${sceneId}-image-01`, order: 1, startPercent: 0,
            promptFileName: 'image-prompt.txt', expectedImageFileName: `${sceneId}.png`
          },
          {
            phaseId: `${sceneId}-image-02`, order: 2, startPercent: 0.5,
            promptFileName: 'image-prompt-02.txt', expectedImageFileName: `${sceneId}-image-02.png`
          }
        ]
      } : {})
    };
  });

  const duration = 54;
  const phases = flattenSceneImagePhases(scenes);
  await writeJson(path.join(root, 'reel.json'), {
    reelId: 'reel-01_dynamic', targetDurationSeconds: duration,
    imageCountMode: 'individual-per-reel', plannedImageCount: phases.length,
    subtitlesEnabled: false
  });
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), scenes);
  await writeJson(path.join(root, 'subtitles', 'subtitle-plan.json'), { enabled: false, cues: [] });
  await writeJson(path.join(root, 'effects', 'effects-plan.json'), {
    backgroundMusic: { enabled: false },
    scenes: scenes.map((scene, index) => ({
      sceneId: scene.sceneId,
      transitionIn: { type: index === 0 ? 'none' : 'cut', durationSeconds: 0 },
      cameraMotion: { type: 'none', startScale: 1, endScale: 1, panXPercent: 0, panYPercent: 0 },
      soundEffects: []
    }))
  });
  await writeJson(path.join(root, 'timeline', 'audio-sync.json'), {
    version: 2,
    audioDurationSeconds: duration,
    cueTimings: scenes.map((scene, index) => ({
      sceneId: scene.sceneId,
      audioCue: scene.audioCue,
      cueTimeSeconds: index === 0 ? 0 : index * 4.5 + 0.2,
      leadInSeconds: 0.2,
      confidence: 1
    }))
  });
  await writeJson(path.join(root, 'assets-manifest.json'), {
    audio: { expectedFile: 'audio/voiceover.mp3', status: 'ready' },
    visuals: phases.map((phase) => ({
      targetId: phase.targetId,
      sceneId: phase.sceneId,
      phaseId: phase.phaseId,
      phaseOrder: phase.phaseOrder,
      expectedFile: `scenes/${phase.sceneId}/${phase.expectedImageFileName}`,
      status: 'ready'
    })),
    scenes: scenes.map((scene) => ({
      sceneId: scene.sceneId,
      expectedFile: `scenes/${scene.sceneId}/${scene.expectedImageFileName}`,
      status: 'ready'
    }))
  });
  await writeJson(path.join(root, 'status.json'), {});

  const result = await buildMasterTimeline(root, { probeAudio: false });

  assert.equal(result.timeline.scenes.length, 12);
  assert.equal(result.timeline.plannedImageCount, 13);
  assert.equal(result.timeline.scenes[3].imagePhases.length, 2);
  assert.equal(result.renderPlan.scenes.length, 13);
  assert.equal(result.renderPlan.plannedImageCount, 13);

  const shots = result.renderPlan.scenes.filter((shot) => shot.parentSceneId === 'scene-04');
  assert.equal(shots.length, 2);
  assert.equal(shots[0].sceneId, 'scene-04');
  assert.equal(shots[1].sceneId, 'scene-04-image-02');
  assert.equal(shots[0].endFrame, shots[1].startFrame);
  assert.equal(shots[1].transitionIn.type, 'cut');
});
