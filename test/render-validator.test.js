import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { validateRendererInput } from '../src/core/render-validator.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function createReadyFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'erklaer-renderer-'));
  await mkdir(path.join(root, 'audio'), { recursive: true });
  await mkdir(path.join(root, 'scenes', 'scene-01'), { recursive: true });
  await writeFile(path.join(root, 'audio', 'voiceover.mp3'), 'dummy audio');
  await writeFile(path.join(root, 'scenes', 'scene-01', 'scene-01.png'), 'dummy image');
  await writeJson(path.join(root, 'review', 'final-readiness-report.json'), {
    readyForRenderer: true
  });
  await writeJson(path.join(root, 'render', 'render-plan.json'), {
    version: 1,
    reelId: 'reel-01_test',
    status: 'ready-for-renderer',
    composition: {
      width: 1080,
      height: 1920,
      fps: 30,
      durationSeconds: 2,
      durationFrames: 60
    },
    voiceover: {
      file: 'audio/voiceover.mp3',
      volume: 1
    },
    scenes: [
      {
        sceneId: 'scene-01',
        imageFile: 'scenes/scene-01/scene-01.png',
        startFrame: 0,
        endFrame: 60,
        transitionIn: { type: 'none', durationSeconds: 0 },
        cameraMotion: {
          type: 'subtle-push-in',
          startScale: 1,
          endScale: 1.04,
          panXPercent: 0,
          panYPercent: 0
        },
        subtitles: [
          {
            id: 'subtitle-01',
            text: 'Ein kurzer Untertitel',
            startSeconds: 0.2,
            endSeconds: 1.8,
            position: 'lower-middle'
          }
        ],
        soundEffects: []
      }
    ]
  });
  return root;
}

test('akzeptiert einen vollständigen renderer-bereiten Plan', async () => {
  const root = await createReadyFixture();
  const report = await validateRendererInput(root);
  assert.equal(report.passed, true);
  assert.equal(report.summary.failedChecks, 0);
});

test('blockiert Pfade außerhalb des Reel-Ordners', async () => {
  const root = await createReadyFixture();
  await writeJson(path.join(root, 'render', 'render-plan.json'), {
    version: 1,
    reelId: 'reel-01_unsafe',
    status: 'ready-for-renderer',
    composition: {
      width: 1080,
      height: 1920,
      fps: 30,
      durationFrames: 60
    },
    voiceover: {
      file: '../voiceover.mp3',
      volume: 1
    },
    scenes: [
      {
        sceneId: 'scene-01',
        imageFile: '../scene.png',
        startFrame: 0,
        endFrame: 60,
        transitionIn: { type: 'none', durationSeconds: 0 },
        cameraMotion: { startScale: 1, endScale: 1, panXPercent: 0, panYPercent: 0 },
        subtitles: [],
        soundEffects: []
      }
    ]
  });

  const report = await validateRendererInput(root);
  assert.equal(report.passed, false);
  assert.ok(report.checks.some((check) => check.id === 'voiceover-safe-path' && check.passed === false));
  assert.ok(report.checks.some((check) => check.id === 'scene-01-image-safe-path' && check.passed === false));
});
