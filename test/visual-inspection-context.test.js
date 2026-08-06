import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { runVisualQualityCheck } from '../src/core/visual-qc.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

test('visuelle Prüfung zeigt für jedes Bild die erwartete Szenenbedeutung und Reihenfolge', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'erklaer-visual-context-'));
  const scene = {
    sceneId: 'scene-01',
    order: 1,
    title: 'Natürliche Grenze',
    narration: 'Manche Grenzen folgen Flüssen und Gebirgen.',
    audioCue: 'folgen Flüssen',
    visualIdea: 'Ein Fluss und ein Gebirge bilden eine natürliche Grenzlinie.',
    imageText: 'NATÜRLICHE GRENZE',
    expectedImageFileName: 'scene-01.png'
  };

  await writeJson(path.join(root, 'reel.json'), {
    reelId: 'reel-01_test',
    title: 'Warum haben Länder Grenzen?',
    visualStyleId: 'round-country-characters',
    visualStyleReason: 'Runde Länderfiguren und Karten erklären Staaten und Grenzen besonders klar.'
  });
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), [scene]);
  await mkdir(path.join(root, 'scenes', 'scene-01'), { recursive: true });
  await writeFile(path.join(root, 'scenes', 'scene-01', 'image-prompt.txt'), 'Vertical 9:16 scene with the exact German text "NATÜRLICHE GRENZE".', 'utf8');
  await writeJson(path.join(root, 'assets-manifest.json'), {
    scenes: [{ sceneId: 'scene-01', expectedFile: 'scenes/scene-01/scene-01.png', status: 'missing' }],
    cover: { expectedFile: 'cover/cover.png', status: 'missing' }
  });
  await writeJson(path.join(root, 'effects', 'effects-plan.json'), { scenes: [] });
  await writeJson(path.join(root, 'subtitles', 'subtitle-plan.json'), {
    verticalPositionPercent: 50,
    textColor: '#F5F7FA',
    highlightColor: '#F5F7FA',
    highlightCurrentWord: false,
    backgroundColor: 'transparent'
  });
  await writeJson(path.join(root, 'cover', 'cover.json'), {
    headline: 'LÄNDERGRENZEN',
    visualIdea: 'Zwei Länderfiguren stehen an einer Grenzlinie.'
  });
  await writeFile(path.join(root, 'cover', 'cover-prompt.txt'), 'Vertical 9:16 cover with the exact German headline "LÄNDERGRENZEN".', 'utf8');
  await writeJson(path.join(root, 'status.json'), {});
  await mkdir(path.join(root, 'review'), { recursive: true });

  await runVisualQualityCheck(root, { strict: false });
  const inspection = await readJson(path.join(root, 'review', 'visual-inspection.json'));
  const sceneEntry = inspection.assets.find((entry) => entry.assetId === 'scene-01');

  assert.equal(inspection.version, 5);
  assert.equal(inspection.visualStyleId, 'round-country-characters');
  assert.equal(sceneEntry.expected.narration, scene.narration);
  assert.equal(sceneEntry.expected.audioCue, scene.audioCue);
  assert.equal(sceneEntry.expected.visualIdea, scene.visualIdea);
  assert.equal(sceneEntry.expected.imageText, scene.imageText);
  assert.equal(sceneEntry.comparedAssetId, 'scene-01');
  assert.equal(sceneEntry.secondPassConfirmed, false);
  assert.ok(Object.hasOwn(sceneEntry.checks, 'sceneMeaningMatchesNarration'));
  assert.ok(Object.hasOwn(sceneEntry.checks, 'sceneOrderConfirmed'));
  assert.ok(Object.hasOwn(sceneEntry.checks, 'visualWorldMatch'));
  assert.ok(Object.hasOwn(sceneEntry.checks, 'plannedGermanTextExact'));
});
