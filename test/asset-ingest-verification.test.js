import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { applyAssetMap } from '../src/core/asset-ingest.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function createFixture({ twoImages = false } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'erklaer-assets-'));
  const scene = {
    sceneId: 'scene-01',
    order: 1,
    title: 'Natürliche Grenze',
    narration: 'Manche Grenzen folgen Flüssen, Gebirgen oder Küsten.',
    audioCue: 'Manche Grenzen',
    visualIdea: 'Ein Fluss trennt zwei Regionen und ein Gebirge führt die Linie weiter.',
    imageText: 'NATÜRLICHE GRENZE',
    expectedImageFileName: 'scene-01.png',
    ...(twoImages ? {
      imageCount: 2,
      imagePhases: [
        {
          phaseId: 'scene-01-image-01', order: 1, startPercent: 0,
          promptFileName: 'image-prompt.txt', expectedImageFileName: 'scene-01.png',
          visualIdea: 'Überblick über den Fluss und beide Regionen.', imageText: 'NATÜRLICHE GRENZE'
        },
        {
          phaseId: 'scene-01-image-02', order: 2, startPercent: 0.55,
          promptFileName: 'image-prompt-02.txt', expectedImageFileName: 'scene-01-image-02.png',
          visualIdea: 'Nahansicht des Gebirges, an dem die Grenze weiterläuft.', imageText: 'GEBIRGE'
        }
      ]
    } : {})
  };

  await writeJson(path.join(root, 'scenes', 'scene-index.json'), [scene]);
  await writeJson(path.join(root, 'scenes', 'scene-01', 'scene.json'), scene);
  await writeJson(path.join(root, 'assets-manifest.json'), {
    audio: {},
    visuals: [],
    scenes: [{ sceneId: 'scene-01', expectedFile: 'scenes/scene-01/scene-01.png', status: 'missing' }],
    cover: {}
  });
  await writeJson(path.join(root, 'status.json'), {});
  await mkdir(path.join(root, 'inbox', 'images'), { recursive: true });
  await writeFile(path.join(root, 'inbox', 'images', 'upload.png'), 'dummy image bytes');
  if (twoImages) await writeFile(path.join(root, 'inbox', 'images', 'upload2.png'), 'dummy image bytes 2');
  return root;
}

function validAssignment(overrides = {}) {
  return {
    source: 'images/upload.png',
    target: 'scene-01',
    confidence: 0.95,
    visualReviewed: true,
    secondPassConfirmed: true,
    sceneOrderConfirmed: true,
    confirmedTarget: 'scene-01',
    confirmedSceneOrder: 1,
    visibleSummary: 'Ein Fluss und ein Gebirge trennen zwei farbige Regionen.',
    reason: 'Fluss, Gebirge und Regionsaufteilung entsprechen exakt der Narration und der visuellen Idee.',
    comparedFields: ['narration', 'visualIdea', 'imageText', 'imagePrompt'],
    matchMethod: 'visual-text-and-content-review',
    ...overrides
  };
}

test('blockiert eine Bildzuordnung ohne zweite Prüfung', async () => {
  const root = await createFixture();
  await writeJson(path.join(root, 'inbox', 'asset-map.json'), {
    version: 4,
    assignments: [validAssignment({ secondPassConfirmed: false })],
    unmatched: []
  });

  const report = await applyAssetMap(root);
  assert.equal(report.applied.length, 0);
  assert.equal(report.skipped.length, 1);
  assert.match(report.skipped[0].reason, /zweite/i);
  assert.equal(report.summary.assignedImages, 0);
  assert.equal(report.summary.visualVerificationPassed, false);
});

test('blockiert eine widersprüchliche bestätigte Szenenreihenfolge', async () => {
  const root = await createFixture();
  await writeJson(path.join(root, 'inbox', 'asset-map.json'), {
    version: 4,
    assignments: [validAssignment({ confirmedSceneOrder: 2 })],
    unmatched: []
  });

  const report = await applyAssetMap(root);
  assert.equal(report.applied.length, 0);
  assert.match(report.skipped[0].reason, /confirmedSceneOrder/);
});

test('übernimmt eine vollständig visuell bestätigte primäre Bildphase', async () => {
  const root = await createFixture();
  await writeJson(path.join(root, 'inbox', 'asset-map.json'), {
    version: 4,
    assignments: [validAssignment()],
    unmatched: []
  });

  const report = await applyAssetMap(root);
  const scene = await readJson(path.join(root, 'scenes', 'scene-01', 'scene.json'));
  const verification = await readJson(path.join(root, 'review', 'scene-asset-verification.json'));
  const status = await readJson(path.join(root, 'status.json'));

  assert.equal(report.applied.length, 1);
  assert.equal(report.summary.assignedImages, 1);
  assert.equal(report.summary.totalImages, 1);
  assert.equal(report.summary.visualVerificationPassed, true);
  assert.equal(scene.assetVerification.confirmedTarget, 'scene-01');
  assert.equal(scene.imageCount, 1);
  assert.equal(verification.visuals[0].passed, true);
  assert.equal(verification.scenes[0].passed, true);
  assert.equal(status.assetMatching, 'verified');
});

test('eine Szene mit zwei Bildern ist erst nach beiden Bildphasen vollständig', async () => {
  const root = await createFixture({ twoImages: true });
  const extra = validAssignment({
    source: 'images/upload2.png',
    target: 'scene-01-image-02',
    confirmedTarget: 'scene-01-image-02',
    visibleSummary: 'Eine Nahansicht zeigt das Gebirge und die fortgesetzte Grenzlinie.',
    reason: 'Das Gebirge und die fortlaufende Grenzlinie entsprechen exakt der zweiten geplanten Bildphase.'
  });
  await writeJson(path.join(root, 'inbox', 'asset-map.json'), {
    version: 4,
    assignments: [validAssignment(), extra],
    unmatched: []
  });

  const report = await applyAssetMap(root);
  const scene = await readJson(path.join(root, 'scenes', 'scene-01', 'scene.json'));
  const verification = await readJson(path.join(root, 'review', 'scene-asset-verification.json'));

  assert.equal(report.summary.assignedImages, 2);
  assert.equal(report.summary.totalImages, 2);
  assert.equal(report.summary.visualVerificationPassed, true);
  assert.equal(scene.imageCount, 2);
  assert.equal(scene.imagePhases.every((phase) => phase.imageStatus === 'ready'), true);
  assert.equal(verification.visuals.length, 2);
  assert.equal(verification.scenes[0].passed, true);
});
