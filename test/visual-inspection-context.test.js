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
    sceneId: 'scene-01', order: 1, title: 'Föderalismus',
    narration: 'Bund und Länder teilen sich politische Aufgaben.',
    audioCue: 'Bund und Länder',
    visualIdea: 'Bund und Länder als zwei politische Ebenen.',
    imageText: 'FÖDERALISMUS',
    imageCount: 1,
    imagePhases: [{
      phaseId: 'scene-01-image-01', order: 1, startPercent: 0,
      promptFileName: 'image-prompt.txt', expectedImageFileName: 'scene-01.png',
      visualIdea: 'Bund und Länder als zwei politische Ebenen.', imageText: 'FÖDERALISMUS'
    }]
  };
  await writeJson(path.join(root, 'reel.json'), {
    reelId: 'reel-01_test', title: 'Was ist Föderalismus?', subtitlesEnabled: false,
    imageCountMode: 'adaptive-dense-v2', plannedImageCount: 1,
    visualStyleId: 'serious-minimal-countryball-explainer'
  });
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), [scene]);
  await mkdir(path.join(root, 'scenes', 'scene-01'), { recursive: true });
  await writeFile(path.join(root, 'scenes', 'scene-01', 'image-prompt.txt'), 'Vertical 9:16 serious minimal countryball scene with exact German text "FÖDERALISMUS".', 'utf8');
  await writeJson(path.join(root, 'assets-manifest.json'), {
    visuals: [{ targetId: 'scene-01', expectedFile: 'scenes/scene-01/scene-01.png', status: 'missing' }],
    scenes: [{ sceneId: 'scene-01', expectedFile: 'scenes/scene-01/scene-01.png', status: 'missing' }]
  });
  await writeJson(path.join(root, 'effects', 'effects-plan.json'), { scenes: [] });
  await writeJson(path.join(root, 'status.json'), {});
  await mkdir(path.join(root, 'review'), { recursive: true });
  return root;
}

test('visuelle Prüfung erzeugt Single-Pass-Fast-QC ohne zweite Prüfpflicht', async () => {
  const root = await createFixture();
  await runVisualQualityCheck(root, { strict: false });
  const inspection = await readJson(path.join(root, 'review', 'visual-inspection.json'));
  assert.equal(inspection.version, 12);
  assert.equal(inspection.mode, 'single-pass-fast');
  assert.equal(inspection.subtitlesEnabled, false);
  assert.ok(inspection.instructions.some((entry) => /keine schriftliche Bildbeschreibung/i.test(entry)));
  assert.ok(inspection.instructions.some((entry) => /kein zweiter Prüfpass/i.test(entry)));
  assert.equal(inspection.assets.length, 1);
  assert.equal(Object.hasOwn(inspection.assets[0], 'secondPassConfirmed'), false);
});

test('geänderte Szenenbedeutung erzeugt einen neuen Review-Fingerprint', async () => {
  const root = await createFixture();
  await runVisualQualityCheck(root, { strict: false });
  const inspectionPath = path.join(root, 'review', 'visual-inspection.json');
  const first = await readJson(inspectionPath);
  const firstFingerprint = first.assets[0].reviewFingerprint;

  const scenesPath = path.join(root, 'scenes', 'scene-index.json');
  const scenes = await readJson(scenesPath);
  scenes[0].narration = 'Die Länder haben in einigen Bereichen eigene Zuständigkeiten.';
  scenes[0].visualIdea = 'Mehrere Länder mit eigenen Zuständigkeitskarten.';
  await writeJson(scenesPath, scenes);

  await runVisualQualityCheck(root, { strict: false });
  const second = await readJson(inspectionPath);
  assert.notEqual(second.assets[0].reviewFingerprint, firstFingerprint);
  assert.equal(second.assets[0].status, 'pending');
});
