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

async function createFixture(sceneCount = 3, { secondSceneHasTwoImages = false } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'numbered-image-import-'));
  const scenes = Array.from({ length: sceneCount }, (_, index) => ({
    sceneId: `scene-${String(index + 1).padStart(2, '0')}`,
    order: index + 1,
    ...(secondSceneHasTwoImages && index === 1 ? {
      imagePhases: [
        { phaseId: 'scene-02-image-01', order: 1, startPercent: 0, promptFileName: 'image-prompt.txt' },
        { phaseId: 'scene-02-image-02', order: 2, startPercent: 0.5, promptFileName: 'image-prompt-02.txt' }
      ]
    } : {})
  }));

  await writeJson(path.join(root, 'scenes', 'scene-index.json'), scenes);
  await writeJson(path.join(root, 'inbox', 'asset-map.json'), {
    version: 4,
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

test('routet vollständige Nummern automatisch nach globaler Bildreihenfolge', async () => {
  const root = await createFixture(3, { secondSceneHasTwoImages: true });
  const drop = path.join(root, 'inbox', 'numbered-images');
  await writeFile(path.join(drop, '01.png'), 'scene1');
  await writeFile(path.join(drop, 'Bild 02.webp'), 'scene2a');
  await writeFile(path.join(drop, '03-meine-szene.jpg'), 'scene2b');
  await writeFile(path.join(drop, '04.png'), 'scene3');

  const report = await prepareNumberedImageAssignments(root);
  const assetMap = await readJson(path.join(root, 'inbox', 'asset-map.json'));

  assert.equal(report.assignedCount, 4);
  assert.equal(report.plannedImageCount, 4);
  assert.equal(report.unmatchedCount, 0);
  assert.equal(assetMap.version, 5);
  assert.equal(assetMap.assignments[0].target, 'audio');
  const visuals = assetMap.assignments.slice(1);
  assert.deepEqual(
    visuals.map((assignment) => assignment.target),
    ['scene-01', 'scene-02', 'scene-02-image-02', 'scene-03']
  );
  for (const assignment of visuals) {
    assert.equal(assignment.confirmedTarget, assignment.target);
    assert.equal(assignment.matchMethod, 'numbered-global-image-order');
    assert.equal(assignment.confidence, 1);
    assert.equal(assignment.secondPassConfirmed, false);
  }
  assert.equal(visuals[2].confirmedPhaseOrder, 2);
});

test('doppelte Nummern sind echte Hard Blocker statt willkürlicher Auswahl', async () => {
  const root = await createFixture(2);
  const drop = path.join(root, 'inbox', 'numbered-images');
  await writeFile(path.join(drop, '01.png'), 'one');
  await writeFile(path.join(drop, 'bild-01.webp'), 'two');

  const report = await prepareNumberedImageAssignments(root);

  assert.equal(report.assignedCount, 0);
  assert.ok(report.unmatched.some((entry) => /Mehrere Dateien.*01/i.test(entry.reason)));
  assert.ok(report.hardBlockerCount >= 1);
});

test('Nummern außerhalb des Plans werden als Hard Blocker ausgewiesen', async () => {
  const root = await createFixture(2);
  const drop = path.join(root, 'inbox', 'numbered-images');
  await writeFile(path.join(drop, '13.png'), 'too-far');

  const report = await prepareNumberedImageAssignments(root);

  assert.equal(report.assignedCount, 0);
  assert.ok(report.unmatched.some((entry) => /keine geplante Bildphase/i.test(entry.reason)));
  assert.ok(report.unmatched.some((entry) => /Bild 01 fehlt|Bild 02 fehlt/i.test(entry.reason)));
});

test('überschreibt die Asset-Map nicht, wenn im Automatikmodus keine Bilder liegen', async () => {
  const root = await createFixture(2);
  const before = await readFile(path.join(root, 'inbox', 'asset-map.json'), 'utf8');

  const report = await prepareNumberedImageAssignments(root, { skipWhenEmpty: true });
  const after = await readFile(path.join(root, 'inbox', 'asset-map.json'), 'utf8');

  assert.equal(report, null);
  assert.equal(after, before);
});
