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

async function createFixture() {
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
    subtitlesEnabled: false,
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
  await writeJson(path.join(root, 'cover', 'cover.json'), {
    headline: 'LÄNDERGRENZEN',
    visualIdea: 'Zwei Länderfiguren stehen an einer Grenzlinie.'
  });
  await writeFile(path.join(root, 'cover', 'cover-prompt.txt'), 'Vertical 9:16 cover with the exact German headline "LÄNDERGRENZEN".', 'utf8');
  await writeJson(path.join(root, 'status.json'), {});
  await mkdir(path.join(root, 'review'), { recursive: true });
  return { root, scene };
}

test('visuelle Prüfung zeigt Szenenbedeutung und verlangt keine Untertitelzone', async () => {
  const { root, scene } = await createFixture();

  await runVisualQualityCheck(root, { strict: false });
  const inspection = await readJson(path.join(root, 'review', 'visual-inspection.json'));
  const sceneEntry = inspection.assets.find((entry) => entry.assetId === 'scene-01');

  assert.equal(inspection.version, 8);
  assert.equal(inspection.subtitlesEnabled, false);
  assert.equal(inspection.visualStyleId, 'round-country-characters');
  assert.ok(inspection.instructions.some((instruction) => /ohne künstlich freigehaltene Untertitelzone/i.test(instruction)));
  assert.equal(Object.hasOwn(inspection.safeZones, 'subtitleVerticalPercent'), false);
  assert.equal(sceneEntry.expected.narration, scene.narration);
  assert.equal(sceneEntry.expected.audioCue, scene.audioCue);
  assert.equal(sceneEntry.expected.visualIdea, scene.visualIdea);
  assert.equal(sceneEntry.expected.imageText, scene.imageText);
  assert.equal(sceneEntry.comparedAssetId, 'scene-01');
  assert.equal(sceneEntry.secondPassConfirmed, false);
  assert.equal(typeof sceneEntry.reviewFingerprint, 'string');
  assert.equal(sceneEntry.reviewFingerprint.length, 64);
  assert.ok(Object.hasOwn(sceneEntry.checks, 'sceneMeaningMatchesNarration'));
  assert.ok(Object.hasOwn(sceneEntry.checks, 'sceneOrderConfirmed'));
  assert.ok(Object.hasOwn(sceneEntry.checks, 'visualWorldMatch'));
  assert.ok(Object.hasOwn(sceneEntry.checks, 'plannedGermanTextExact'));
  assert.equal(Object.hasOwn(sceneEntry.checks, 'subtitleCollisionFree'), false);
});

test('setzt eine alte Freigabe zurück, sobald sich die Szenenbedeutung ändert', async () => {
  const { root, scene } = await createFixture();
  await runVisualQualityCheck(root, { strict: false });

  const inspectionPath = path.join(root, 'review', 'visual-inspection.json');
  const firstInspection = await readJson(inspectionPath);
  const firstSceneEntry = firstInspection.assets.find((entry) => entry.assetId === 'scene-01');
  firstSceneEntry.status = 'passed';
  firstSceneEntry.visibleSummary = 'Ein Fluss und ein Gebirge trennen zwei farbige Regionen sichtbar voneinander.';
  firstSceneEntry.matchReason = 'Die sichtbaren Landschaftselemente entsprechen exakt der geplanten natürlichen Grenzlinie.';
  firstSceneEntry.secondPassConfirmed = true;
  firstSceneEntry.checks = Object.fromEntries(
    Object.keys(firstSceneEntry.checks).map((key) => [key, true])
  );
  await writeJson(inspectionPath, firstInspection);

  const changedScene = {
    ...scene,
    narration: 'Andere Grenzen wurden durch Verträge und politische Entscheidungen festgelegt.',
    visualIdea: 'Mehrere runde Länderfiguren unterschreiben gemeinsam einen Grenzvertrag.'
  };
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), [changedScene]);

  await runVisualQualityCheck(root, { strict: false });
  const secondInspection = await readJson(inspectionPath);
  const secondSceneEntry = secondInspection.assets.find((entry) => entry.assetId === 'scene-01');

  assert.notEqual(secondSceneEntry.reviewFingerprint, firstSceneEntry.reviewFingerprint);
  assert.equal(secondSceneEntry.expected.narration, changedScene.narration);
  assert.equal(secondSceneEntry.status, 'pending');
  assert.equal(secondSceneEntry.visibleSummary, '');
  assert.equal(secondSceneEntry.matchReason, '');
  assert.equal(secondSceneEntry.secondPassConfirmed, false);
  assert.equal(Object.values(secondSceneEntry.checks).every((value) => value === null), true);
});
