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
    sceneId: 'scene-01', order: 1, title: 'Natürliche Grenze',
    narration: 'Manche Grenzen folgen Flüssen, Gebirgen oder Küsten.',
    audioCue: 'Manche Grenzen', visualIdea: 'Fluss und Gebirge als Grenze.', imageText: 'NATÜRLICHE GRENZE',
    expectedImageFileName: 'scene-01.png',
    ...(twoImages ? {
      imageCount: 2,
      imagePhases: [
        { phaseId: 'scene-01-image-01', order: 1, startPercent: 0, promptFileName: 'image-prompt.txt', expectedImageFileName: 'scene-01.png', visualIdea: 'Fluss', imageText: 'NATÜRLICHE GRENZE' },
        { phaseId: 'scene-01-image-02', order: 2, startPercent: 0.55, promptFileName: 'image-prompt-02.txt', expectedImageFileName: 'scene-01-image-02.png', visualIdea: 'Gebirge', imageText: 'GEBIRGE', audioCue: 'Gebirgen' }
      ]
    } : {})
  };

  await writeJson(path.join(root, 'scenes', 'scene-index.json'), [scene]);
  await writeJson(path.join(root, 'scenes', 'scene-01', 'scene.json'), scene);
  await writeJson(path.join(root, 'assets-manifest.json'), { audio: {}, visuals: [], scenes: [{ sceneId: 'scene-01', expectedFile: 'scenes/scene-01/scene-01.png', status: 'missing' }] });
  await writeJson(path.join(root, 'status.json'), {});
  await mkdir(path.join(root, 'inbox', 'images'), { recursive: true });
  await writeFile(path.join(root, 'inbox', 'images', 'upload.png'), 'dummy image bytes');
  if (twoImages) await writeFile(path.join(root, 'inbox', 'images', 'upload2.png'), 'dummy image bytes 2');
  return root;
}

function assignment(source, target, confidence = 1) {
  return { source, target, confidence, matchMethod: 'numbered-global-image-order' };
}

test('Simple Mode übernimmt eindeutige nummerierte Zuordnung ohne zweite Prüfung oder Textbegründung', async () => {
  const root = await createFixture();
  await writeJson(path.join(root, 'inbox', 'asset-map.json'), {
    version: 5,
    assignments: [assignment('images/upload.png', 'scene-01')],
    unmatched: []
  });

  const report = await applyAssetMap(root);
  const status = await readJson(path.join(root, 'status.json'));
  const verification = await readJson(path.join(root, 'review', 'scene-asset-verification.json'));

  assert.equal(report.applied.length, 1);
  assert.equal(report.skipped.length, 0);
  assert.equal(report.summary.assignedImages, 1);
  assert.equal(report.summary.visualVerificationPassed, true);
  assert.equal(verification.visuals[0].passed, true);
  assert.equal(status.images, 'ready');
  assert.equal(status.assetMatching, 'numbered-routing-complete');
});

test('doppelte Verwendung desselben Ziels bleibt ein echter Blocker', async () => {
  const root = await createFixture();
  await writeFile(path.join(root, 'inbox', 'images', 'upload2.png'), 'other');
  await writeJson(path.join(root, 'inbox', 'asset-map.json'), {
    version: 5,
    assignments: [
      assignment('images/upload.png', 'scene-01'),
      assignment('images/upload2.png', 'scene-01')
    ],
    unmatched: []
  });

  const report = await applyAssetMap(root);
  assert.equal(report.applied.length, 1);
  assert.equal(report.skipped.length, 1);
  assert.match(report.skipped[0].reason, /doppelt/);
});

test('eine Szene mit zwei Bildphasen ist vollständig, sobald beide nummerierten Assets geroutet wurden', async () => {
  const root = await createFixture({ twoImages: true });
  await writeJson(path.join(root, 'inbox', 'asset-map.json'), {
    version: 5,
    assignments: [
      assignment('images/upload.png', 'scene-01'),
      assignment('images/upload2.png', 'scene-01-image-02')
    ],
    unmatched: []
  });

  const report = await applyAssetMap(root);
  const scene = await readJson(path.join(root, 'scenes', 'scene-01', 'scene.json'));
  assert.equal(report.summary.assignedImages, 2);
  assert.equal(report.summary.totalImages, 2);
  assert.equal(scene.imagePhases.every((phase) => phase.imageStatus === 'ready'), true);
});
