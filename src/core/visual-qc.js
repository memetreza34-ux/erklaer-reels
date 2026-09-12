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
async function readJson(filePath) { return JSON.parse(await readFile(filePath, 'utf8')); }

async function createFixture({ twoImages = false } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'erklaer-visual-context-'));
  const scene = {
    sceneId: 'scene-01', order: 1, title: 'Natürliche Grenze',
    narration: 'Manche Grenzen folgen Flüssen und Gebirgen.',
    audioCue: 'Manche Grenzen', visualIdea: 'Fluss und Gebirge bilden eine Grenze.', imageText: 'NATÜRLICHE GRENZE',
    expectedImageFileName: 'scene-01.png',
    ...(twoImages ? {
      imageCount: 2,
      imagePhases: [
        { phaseId: 'scene-01-image-01', order: 1, startPercent: 0, promptFileName: 'image-prompt.txt', expectedImageFileName: 'scene-01.png', visualIdea: 'Fluss', imageText: 'NATÜRLICHE GRENZE' },
        { phaseId: 'scene-01-image-02', order: 2, startPercent: 0.55, promptFileName: 'image-prompt-02.txt', expectedImageFileName: 'scene-01-image-02.png', visualIdea: 'Gebirge', imageText: 'GEBIRGE', audioCue: 'Gebirgen' }
      ]
    } : {})
  };

  await writeJson(path.join(root, 'reel.json'), {
    reelId: 'reel-01_test', title: 'Warum haben Länder Grenzen?', date: '2026-09-12',
    subtitlesEnabled: false, imageCountMode: 'adaptive-dense-v2', plannedImageCount: twoImages ? 2 : 1,
    visualStyleId: 'serious-minimal-countryball-explainer'
  });
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), [scene]);
  await mkdir(path.join(root, 'scenes', 'scene-01'), { recursive: true });
  await writeFile(path.join(root, 'scenes', 'scene-01', 'image-prompt.txt'), 'Vertical 9:16 Serious Minimal Countryball Explainer with exact text "NATÜRLICHE GRENZE".', 'utf8');
  if (twoImages) await writeFile(path.join(root, 'scenes', 'scene-01', 'image-prompt-02.txt'), 'Vertical 9:16 Serious Minimal Countryball Explainer with exact text "GEBIRGE".', 'utf8');
  await writeJson(path.join(root, 'assets-manifest.json'), {
    visuals: twoImages ? [
      { targetId: 'scene-01', expectedFile: 'scenes/scene-01/scene-01.png', status: 'missing' },
      { targetId: 'scene-01-image-02', expectedFile: 'scenes/scene-01/scene-01-image-02.png', status: 'missing' }
    ] : [],
    scenes: [{ sceneId: 'scene-01', expectedFile: 'scenes/scene-01/scene-01.png', status: 'missing' }]
  });
  await writeJson(path.join(root, 'effects', 'effects-plan.json'), { scenes: [] });
  await writeJson(path.join(root, 'status.json'), {});
  await mkdir(path.join(root, 'review'), { recursive: true });
  return { root, scene };
}

test('visuelle Prüfung erzeugt nur schnellen Einmal-Check ohne schriftliche Evidenz', async () => {
  const { root, scene } = await createFixture();
  await runVisualQualityCheck(root, { strict: false });
  const inspection = await readJson(path.join(root, 'review', 'visual-inspection.json'));
  const entry = inspection.assets.find((asset) => asset.assetId === 'scene-01');

  assert.equal(inspection.version, 12);
  assert.equal(inspection.mode, 'single-pass-fast');
  assert.equal(inspection.subtitlesEnabled, false);
  assert.equal(inspection.plannedImageCount, 1);
  assert.ok(inspection.instructions.some((instruction) => /keine schriftliche Bildbeschreibung/i.test(instruction)));
  assert.ok(inspection.instructions.some((instruction) => /Serious-Minimal-Countryball/i.test(instruction)));
  assert.equal(entry.expected.narration, scene.narration);
  assert.equal(entry.expected.visualIdea, scene.visualIdea);
  assert.equal(Object.hasOwn(entry, 'visibleSummary'), false);
  assert.equal(Object.hasOwn(entry, 'matchReason'), false);
  assert.equal(Object.hasOwn(entry, 'secondPassConfirmed'), false);
  assert.ok(Object.hasOwn(entry.checks, 'sceneMeaningMatchesNarration'));
  assert.ok(Object.hasOwn(entry.checks, 'visualWorldConsistent'));
});

test('legt bei zwei Bildphasen weiterhin zwei getrennte Prüfobjekte an', async () => {
  const { root } = await createFixture({ twoImages: true });
  await runVisualQualityCheck(root, { strict: false });
  const inspection = await readJson(path.join(root, 'review', 'visual-inspection.json'));
  assert.equal(inspection.plannedImageCount, 2);
  assert.ok(inspection.assets.some((entry) => entry.assetId === 'scene-01'));
  const second = inspection.assets.find((entry) => entry.assetId === 'scene-01-image-02');
  assert.ok(second);
  assert.equal(second.expected.phaseOrder, 2);
  assert.equal(second.expected.previousTargetId, 'scene-01');
});

test('setzt explizite alte Freigabe zurück wenn sich Inhalt oder Prompt ändert', async () => {
  const { root, scene } = await createFixture();
  await runVisualQualityCheck(root, { strict: false });
  const inspectionPath = path.join(root, 'review', 'visual-inspection.json');
  const first = await readJson(inspectionPath);
  const entry = first.assets[0];
  entry.status = 'passed';
  for (const key of Object.keys(entry.checks)) entry.checks[key] = true;
  await writeJson(inspectionPath, first);

  await writeJson(path.join(root, 'scenes', 'scene-index.json'), [{ ...scene, narration: 'Andere Grenzen entstehen durch Verträge.' }]);
  await runVisualQualityCheck(root, { strict: false });
  const second = await readJson(inspectionPath);
  assert.notEqual(second.assets[0].reviewFingerprint, entry.reviewFingerprint);
  assert.equal(second.assets[0].status, 'pending');
  assert.equal(Object.values(second.assets[0].checks).every((value) => value === null), true);
});
