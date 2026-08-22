import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { validateRendererInput } from '../src/core/render-validator.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function createReadyFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'erklaer-renderer-'));
  await mkdir(path.join(root, 'audio'), { recursive: true });
  await mkdir(path.join(root, 'scenes', 'scene-01'), { recursive: true });
  await writeFile(path.join(root, 'audio', 'voiceover-tight.m4a'), 'dummy audio');
  await writeFile(path.join(root, 'scenes', 'scene-01', 'scene-01.png'), 'dummy image');
  await writeJson(path.join(root, 'reel.json'), {
    reelId: 'reel-01_test',
    subtitlesEnabled: false
  });
  await writeJson(path.join(root, 'review', 'audio-pacing-report.json'), {
    version: 3,
    createdAt: new Date().toISOString(),
    passed: true,
    beforeSeconds: 2.4,
    afterSeconds: 2,
    playbackRate: 1.1,
    loudnessNormalized: true,
    loudnessSettings: { loudnessTargetLufs: -16, truePeakDbtp: -1.5, loudnessRangeLra: 11 }
  });
  await writeJson(path.join(root, 'review', 'final-readiness-report.json'), { readyForRenderer: true });
  await writeJson(path.join(root, 'render', 'render-plan.json'), {
    version: 4,
    reelId: 'reel-01_test',
    status: 'ready-for-renderer',
    subtitlesEnabled: false,
    composition: { width: 1080, height: 1920, fps: 30, durationSeconds: 2, durationFrames: 60 },
    voiceover: { file: 'audio/voiceover-tight.m4a', volume: 1 },
    scenes: [{
      sceneId: 'scene-01',
      imageFile: 'scenes/scene-01/scene-01.png',
      startFrame: 0,
      endFrame: 60,
      transitionIn: { type: 'none', durationSeconds: 0 },
      cameraMotion: { type: 'subtle-push-in', startScale: 1, endScale: 1.04, panXPercent: 0, panYPercent: 0 },
      subtitles: [],
      soundEffects: []
    }]
  });
  return root;
}

test('akzeptiert einen vollständigen Render-Plan ohne Untertitel', async () => {
  const report = await validateRendererInput(await createReadyFixture());
  assert.equal(report.passed, true, JSON.stringify(report.checks.filter((check) => !check.passed), null, 2));
  assert.ok(report.checks.some((check) => check.id === 'subtitles-disabled-in-reel' && check.passed));
  assert.ok(report.checks.some((check) => check.id === 'no-subtitles-in-render-plan' && check.passed));
});

test('blockiert jeden Untertitel-Cue im Render-Plan', async () => {
  const root = await createReadyFixture();
  const planPath = path.join(root, 'render', 'render-plan.json');
  const plan = await readJson(planPath);
  plan.scenes[0].subtitles = [{ id: 'subtitle-01', text: 'Darf nicht gerendert werden' }];
  await writeJson(planPath, plan);

  const report = await validateRendererInput(root);
  assert.equal(report.passed, false);
  assert.ok(report.checks.some((check) => check.id === 'no-subtitles-in-render-plan' && !check.passed));
  assert.ok(report.checks.some((check) => check.id === 'scene-01-no-subtitles' && !check.passed));
});

test('blockiert ein Reel, das Untertitel wieder aktiviert', async () => {
  const root = await createReadyFixture();
  await writeJson(path.join(root, 'reel.json'), { reelId: 'reel-01_test', subtitlesEnabled: true });
  const report = await validateRendererInput(root);
  assert.equal(report.passed, false);
  assert.ok(report.checks.some((check) => check.id === 'subtitles-disabled-in-reel' && !check.passed));
});

test('alte Audio-Pacing-Reports bleiben rückwärtskompatibel', async () => {
  const root = await createReadyFixture();
  const report = await validateRendererInput(root);
  assert.equal(report.passed, true);
  assert.equal(report.checks.some((check) => check.id === 'audio-loudness-measured'), false);
});

test('akzeptiert Version 5 nur mit bestandener echter Lautheitsmessung', async () => {
  const root = await createReadyFixture();
  const reportPath = path.join(root, 'review', 'audio-pacing-report.json');
  const pacing = await readJson(reportPath);
  Object.assign(pacing, {
    version: 5,
    loudnessMeasured: true,
    loudnessMeasurement: {
      measured: true,
      integratedLufs: -16.1,
      truePeakDbtp: -1.7,
      passed: true
    }
  });
  await writeJson(reportPath, pacing);

  const report = await validateRendererInput(root);
  assert.equal(report.passed, true, JSON.stringify(report.checks.filter((check) => !check.passed), null, 2));
});

test('blockiert Version 5 ohne bestandene Lautheitsnachmessung', async () => {
  const root = await createReadyFixture();
  const reportPath = path.join(root, 'review', 'audio-pacing-report.json');
  const pacing = await readJson(reportPath);
  Object.assign(pacing, {
    version: 5,
    loudnessMeasured: false,
    loudnessMeasurement: {
      measured: false,
      integratedLufs: null,
      truePeakDbtp: null,
      passed: false
    }
  });
  await writeJson(reportPath, pacing);

  const report = await validateRendererInput(root);
  assert.equal(report.passed, false);
  assert.ok(report.checks.some((check) => check.id === 'audio-loudness-measured' && !check.passed));
});

test('blockiert altes 1.05x-Pacing oder fehlende Lautheitsnormalisierung', async () => {
  const root = await createReadyFixture();
  const reportPath = path.join(root, 'review', 'audio-pacing-report.json');
  const pacing = await readJson(reportPath);
  pacing.playbackRate = 1.05;
  pacing.loudnessNormalized = false;
  await writeJson(reportPath, pacing);
  const report = await validateRendererInput(root);
  assert.equal(report.passed, false);
  assert.ok(report.checks.some((check) => check.id === 'audio-playback-rate' && !check.passed));
});

test('blockiert Fade- und Crossfade-Übergänge', async () => {
  const root = await createReadyFixture();
  const planPath = path.join(root, 'render', 'render-plan.json');
  const plan = await readJson(planPath);
  plan.scenes[0].transitionIn = { type: 'crossfade', durationSeconds: 0.2 };
  await writeJson(planPath, plan);
  const report = await validateRendererInput(root);
  assert.equal(report.passed, false);
});

test('blockiert eine finale Freigabe ohne Audio-Pacing-Bericht', async () => {
  const root = await createReadyFixture();
  await writeJson(path.join(root, 'review', 'audio-pacing-report.json'), {});
  const report = await validateRendererInput(root);
  assert.equal(report.passed, false);
});

test('blockiert Pfade außerhalb des Reel-Ordners', async () => {
  const root = await createReadyFixture();
  const plan = await readJson(path.join(root, 'render', 'render-plan.json'));
  plan.voiceover.file = '../voiceover.mp3';
  plan.scenes[0].imageFile = '../scene.png';
  await writeJson(path.join(root, 'render', 'render-plan.json'), plan);
  const report = await validateRendererInput(root);
  assert.equal(report.passed, false);
  assert.ok(report.checks.some((check) => check.id === 'voiceover-safe-path' && !check.passed));
  assert.ok(report.checks.some((check) => check.id === 'scene-01-image-safe-path' && !check.passed));
});
