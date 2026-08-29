import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { buildMasterTimeline } from '../src/core/timeline.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

test('blockiert im strengen Lauf eine nur zwei Sekunden lange Erklärungsszene', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'erklaer-timing-gates-'));
  const starts = [0, 5, 7, 12, 17, 22, 27, 32, 37, 42, 47, 51];
  const scenes = starts.map((_, index) => {
    const sceneId = `scene-${String(index + 1).padStart(2, '0')}`;
    return {
      sceneId,
      order: index + 1,
      title: index === 0 ? 'Hook' : index === starts.length - 1 ? 'Abschluss' : `Szene ${index + 1}`,
      narration: `Sprechertext für ${sceneId}`,
      audioCue: `Cue ${index + 1}`,
      leadInSeconds: 0.2,
      durationSeconds: index === 1 ? 2 : 5,
      subtitleCues: [{ text: `Untertitel ${index + 1}` }],
      expectedImageFileName: `${sceneId}.png`
    };
  });

  await mkdir(path.join(root, 'audio'), { recursive: true });
  await writeFile(path.join(root, 'audio', 'voiceover.wav'), 'dummy audio');
  await writeJson(path.join(root, 'reel.json'), { reelId: 'reel-01_test', targetDurationSeconds: 55 });
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), scenes);
  await writeJson(path.join(root, 'subtitles', 'subtitle-plan.json'), { cues: [] });
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
    audioDurationSeconds: 55,
    cueTimings: scenes.map((scene, index) => ({
      sceneId: scene.sceneId,
      audioCue: scene.audioCue,
      cueTimeSeconds: index === 0 ? 0 : starts[index] + 0.2,
      leadInSeconds: 0.2,
      confidence: 1
    }))
  });
  await writeJson(path.join(root, 'assets-manifest.json'), {
    audio: { expectedFile: 'audio/voiceover.wav', status: 'ready' },
    scenes: scenes.map((scene) => ({
      sceneId: scene.sceneId,
      expectedFile: `scenes/${scene.sceneId}/${scene.expectedImageFileName}`,
      status: 'ready'
    }))
  });
  await writeJson(path.join(root, 'status.json'), {});

  const result = await buildMasterTimeline(root, { strict: true, probeAudio: false });
  const shortSceneCheck = result.qualityReport.checks.find(
    (check) => check.id === 'scene-02-balanced-duration'
  );

  assert.equal(result.qualityReport.passed, false);
  assert.ok(shortSceneCheck);
  assert.equal(shortSceneCheck.passed, false);
  assert.equal(shortSceneCheck.level, 'error');
  assert.match(shortSceneCheck.message, /6–7\.5 Sekunden/);
});
