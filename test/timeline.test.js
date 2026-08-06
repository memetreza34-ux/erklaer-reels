import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { buildMasterTimeline } from '../src/core/timeline.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

test('führt 14 Szenen, mittige Untertitel und einen ruhigen Schlussbild-Nachlauf zusammen', async () => {
  const reelDirectory = await mkdtemp(path.join(os.tmpdir(), 'erklaer-timeline-'));
  const scenes = Array.from({ length: 14 }, (_, index) => {
    const sceneId = `scene-${String(index + 1).padStart(2, '0')}`;
    return {
      sceneId,
      title: index === 0 ? 'Hook' : `Szene ${index + 1}`,
      narration: `Sprechertext für ${sceneId}`,
      audioCue: `Cue ${index + 1}`,
      leadInSeconds: 0.2,
      durationSeconds: 4,
      subtitleCues: [`Untertitel ${index + 1}`],
      expectedImageFileName: `${sceneId}.png`
    };
  });

  await writeJson(path.join(reelDirectory, 'reel.json'), { reelId: 'reel-01_test', targetDurationSeconds: 56 });
  await writeJson(path.join(reelDirectory, 'scenes', 'scene-index.json'), scenes);
  await writeJson(path.join(reelDirectory, 'subtitles', 'subtitle-plan.json'), { cues: [] });
  await writeJson(path.join(reelDirectory, 'effects', 'effects-plan.json'), {
    backgroundMusic: { enabled: false },
    scenes: scenes.map((scene, index) => ({
      sceneId: scene.sceneId,
      transitionIn: { type: index === 0 ? 'none' : 'cut', durationSeconds: 0 },
      cameraMotion: { type: 'none', startScale: 1, endScale: 1, panXPercent: 0, panYPercent: 0 },
      soundEffects: []
    }))
  });
  await writeJson(path.join(reelDirectory, 'timeline', 'audio-sync.json'), {
    version: 2,
    audioDurationSeconds: 56,
    cueTimings: scenes.map((scene, index) => ({
      sceneId: scene.sceneId,
      audioCue: scene.audioCue,
      cueTimeSeconds: index === 0 ? 0 : index * 4 + 0.2,
      leadInSeconds: 0.2,
      confidence: 1
    }))
  });
  await writeJson(path.join(reelDirectory, 'assets-manifest.json'), {
    audio: {},
    scenes: scenes.map((scene) => ({
      sceneId: scene.sceneId,
      expectedFile: `scenes/${scene.sceneId}/${scene.expectedImageFileName}`,
      status: 'ready'
    }))
  });
  await writeJson(path.join(reelDirectory, 'status.json'), {});

  const result = await buildMasterTimeline(reelDirectory, { probeAudio: false });

  assert.equal(result.timeline.timingStatus, 'audio-synced');
  assert.equal(result.timeline.scenes.length, 14);
  assert.equal(result.timeline.scenes[0].startSeconds, 0);
  assert.equal(result.timeline.audio.durationSeconds, 56);
  assert.equal(result.timeline.composition.endingHoldSeconds, 0.7);
  assert.equal(result.timeline.scenes.at(-1).endSeconds, 56.7);
  assert.equal(result.timeline.subtitles.cues.at(-1).endSeconds, 56);
  assert.equal(result.timeline.subtitles.cues.length, 14);
  assert.equal(result.renderPlan.composition.durationFrames, 1701);
  assert.equal(result.renderPlan.composition.audioDurationSeconds, 56);
  assert.equal(result.renderPlan.composition.endingHoldSeconds, 0.7);

  const firstSubtitle = result.timeline.subtitles.cues[0];
  assert.equal(firstSubtitle.position, 'center');
  assert.equal(firstSubtitle.verticalPositionPercent, 50);
  assert.equal(firstSubtitle.textColor, '#F5F7FA');
  assert.equal(firstSubtitle.highlightColor, '#F5F7FA');
  assert.equal(firstSubtitle.highlightCurrentWord, false);
  assert.equal(firstSubtitle.backgroundColor, 'transparent');

  const savedTimeline = JSON.parse(await readFile(path.join(reelDirectory, 'timeline', 'timeline-plan.json'), 'utf8'));
  const savedRenderPlan = JSON.parse(await readFile(path.join(reelDirectory, 'render', 'render-plan.json'), 'utf8'));
  const savedReport = JSON.parse(await readFile(path.join(reelDirectory, 'review', 'final-video-report.json'), 'utf8'));
  assert.equal(savedTimeline.scenes.length, 14);
  assert.equal(savedRenderPlan.scenes.length, 14);
  assert.equal(savedReport.stage, 'pre-render');
  assert.equal(savedReport.endingHoldSeconds, 0.7);
});
