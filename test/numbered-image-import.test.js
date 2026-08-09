import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  parseNumberedImageFileName,
  prepareNumberedImageAssignments
} from '../src/core/numbered-image-import.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function createFixture(sceneCount = 3) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'numbered-image-import-'));
  const scenes = Array.from({ length: sceneCount }, (_, index) => ({
    sceneId: `scene-${String(index + 1).padStart(2, '0')}`,
    order: index + 1
  }));

  await writeJson(path.join(root, 'scenes', 'scene-index.json'), scenes);
  await writeJson(path.join(root, 'inbox', 'asset-map.json'), {
    version: 2,
    assignments: [{ source: 'audio/voice.wav', target: 'audio', confidence: 1 }],
    unmatched: []
  });
  await mkdir(path.join(root, 'inbox', 'numbered-images'), { recursive: true });
  return root;
}

test('erkennt die vereinbarten Dateinamen', () => {
  assert.equal(parseNumberedImageFileName('00.png').number, 0);
  assert.equal(parseNumberedImageFileName('bild-01.png').number, 1);
  assert.equal(parseNumberedImageFileName('Bild 02.webp').number, 2);
  assert.equal(parseNumberedImageFileName('03-meine-szene.jpg').number, 3);
  assert.equal(parseNumberedImageFileName('cover.png'), null);
  assert.equal(parseNumberedImageFileName('01.txt'), null);
});

test('ordnet 00 dem Cover und die weiteren Nummern den Szenen vor', async () => {
  const root = await createFixture(3);
  const drop = path.join(root, 'inbox', 'numbered-images');
  await writeFile(path.join(drop, 'bild-00.png'), 'cover');
  await writeFile(path.join(drop, '01.png'), 'scene1');
  await writeFile(path.join(drop, 'Bild 02.webp'), 'scene2');
  await writeFile(path.join(drop, '03-meine-szene.jpg'), 'scene3');

  const report = await prepareNumberedImageAssignments(root);
  const assetMap = await readJson(path.join(root, 'inbox', 'asset-map.json'));

  assert.equal(report.assignedCount, 4);
  assert.equal(report.unmatchedCount, 0);
  assert.equal(assetMap.version, 3);
  assert.equal(assetMap.assignments[0].target, 'audio');
  assert.deepEqual(
    assetMap.assignments.slice(1).map((assignment) => assignment.target),
    ['cover', 'scene-01', 'scene-02', 'scene-03']
  );
  assert.deepEqual(
    assetMap.assignments.slice(1).map((assignment) => assignment.source),
    ['numbered-images/bild-00.png', 'numbered-images/01.png', 'numbered-images/Bild 02.webp', 'numbered-images/03-meine-szene.jpg']
  );
  assert.equal(assetMap.assignments[1].visualReviewed, false);
  assert.equal(assetMap.assignments[2].suggestedSceneOrder, 1);
  assert.equal(assetMap.assignments[2].confirmedSceneOrder, null);
  assert.equal(assetMap.assignments[2].matchMethod, '');
});

test('blockiert doppelte Nummern statt willkürlich eine Datei zu wählen', async () => {
  const root = await createFixture(2);
  const drop = path.join(root, 'inbox', 'numbered-images');
  await writeFile(path.join(drop, '01.png'), 'one');
  await writeFile(path.join(drop, 'bild-01.webp'), 'two');

  const report = await prepareNumberedImageAssignments(root);

  assert.equal(report.assignedCount, 0);
  assert.equal(report.unmatchedCount, 2);
  assert.match(report.unmatched[0].reason, /dieselbe Nummer 01/);
});

test('weist Nummern außerhalb der vorhandenen Szenen als unmatched aus', async () => {
  const root = await createFixture(2);
  const drop = path.join(root, 'inbox', 'numbered-images');
  await writeFile(path.join(drop, '13.png'), 'too-far');

  const report = await prepareNumberedImageAssignments(root);

  assert.equal(report.assignedCount, 0);
  assert.equal(report.unmatchedCount, 1);
  assert.match(report.unmatched[0].reason, /keine Szene/);
});

test('überschreibt die Asset-Map nicht, wenn im Automatikmodus keine Dateien liegen', async () => {
  const root = await createFixture(2);
  const before = await readFile(path.join(root, 'inbox', 'asset-map.json'), 'utf8');

  const report = await prepareNumberedImageAssignments(root, { skipWhenEmpty: true });
  const after = await readFile(path.join(root, 'inbox', 'asset-map.json'), 'utf8');

  assert.equal(report, null);
  assert.equal(after, before);
});
