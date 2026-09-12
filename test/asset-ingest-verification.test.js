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
    sceneId: 'scene-01', order: 1, title: 'Föderalismus',
    narration: 'Bund und Länder teilen sich politische Aufgaben.',
    audioCue: 'Bund und Länder',
    visualIdea: 'Bund und Länder stehen als zwei politische Ebenen nebeneinander.',
    imageText: 'FÖDERALISMUS',
    expectedImageFileName: 'scene-01.png',
    ...(twoImages ? {
      imageCount: 2,
      imagePhases: [
        { phaseId: 'scene-01-image-01', order: 1, startPercent: 0, promptFileName: 'image-prompt.txt', expectedImageFileName: 'scene-01.png', visualIdea: 'Bund und Länder als zwei Ebenen.', imageText: 'FÖDERALISMUS' },
        { phaseId: 'scene-01-image-02', order: 2, startPercent: 0.55, promptFileName: 'image-prompt-02.txt', expectedImageFileName: 'scene-01-image-02.png', visualIdea: 'Mehrere Länder mit eigenen Aufgaben.', imageText: '' }
      ]
    } : {})
  };

  await writeJson(path.join(root, 'scenes', 'scene-index.json'), [scene]);
  await writeJson(path.join(root, 'scenes', 'scene-01', 'scene.json'), scene);
  await writeJson(path.join(root, 'assets-manifest.json'), {
    audio: {}, visuals: [], scenes: [{ sceneId: 'scene-01', expectedFile: 'scenes/scene-01/scene-01.png', status: 'missing' }]
  });
  await writeJson(path.join(root, 'status.json'), {});
  await mkdir(path.join(root, 'inbox', 'numbered-images'), { recursive: true });
  await writeFile(path.join(root, 'inbox', 'numbered-images', 'Bild 01.png'), 'dummy image bytes');
  if (twoImages) await writeFile(path.join(root, 'inbox', 'numbered-images', 'Bild 02.png'), 'dummy image bytes 2');
  return root;
}

function orderedAssignment({ source = 'numbered-images/Bild 01.png', target = 'scene-01', sceneOrder = 1, phaseOrder = 1 } = {}) {
  return {
    source,
    target,
    confidence: 1,
    visualReviewed: false,
    secondPassConfirmed: false,
    sceneOrderConfirmed: true,
    confirmedTarget: target,
    confirmedSceneOrder: sceneOrder,
    confirmedPhaseOrder: phaseOrder,
    visibleSummary: '',
    reason: '',
    comparedFields: [],
    matchMethod: 'numbered-global-image-order'
  };
}

test('Simple Mode übernimmt nummerierte Bilder ohne zweite Prüfung oder schriftliche Begründung', async () => {
  const root = await createFixture();
  await writeJson(path.join(root, 'inbox', 'asset-map.json'), {
    version: 5,
    assignments: [orderedAssignment()],
    unmatched: []
  });

  const report = await applyAssetMap(root);
  assert.equal(report.applied.length, 1);
  assert.equal(report.skipped.length, 0);
  assert.equal(report.summary.assignedImages, 1);
  assert.equal(report.summary.totalImages, 1);
  assert.equal(report.summary.visualVerificationPassed, true);
});

test('eine widersprüchliche bestätigte Zielreihenfolge bleibt blockiert', async () => {
  const root = await createFixture();
  await writeJson(path.join(root, 'inbox', 'asset-map.json'), {
    version: 5,
    assignments: [orderedAssignment({ sceneOrder: 2 })],
    unmatched: []
  });
  const report = await applyAssetMap(root);
  assert.equal(report.applied.length, 0);
  assert.equal(report.skipped.length, 1);
});

test('mehrere Bildphasen werden nach globaler Nummer vollständig übernommen', async () => {
  const root = await createFixture({ twoImages: true });
  await writeJson(path.join(root, 'inbox', 'asset-map.json'), {
    version: 5,
    assignments: [
      orderedAssignment(),
      orderedAssignment({ source: 'numbered-images/Bild 02.png', target: 'scene-01-image-02', phaseOrder: 2 })
    ],
    unmatched: []
  });

  const report = await applyAssetMap(root);
  const scene = await readJson(path.join(root, 'scenes', 'scene-01', 'scene.json'));
  assert.equal(report.summary.assignedImages, 2);
  assert.equal(report.summary.totalImages, 2);
  assert.equal(scene.imagePhases.every((phase) => phase.imageStatus === 'ready'), true);
});
