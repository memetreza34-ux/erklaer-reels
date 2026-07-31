import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createReelWorkspace } from '../src/core/workspace.js';
import { runVisualQualityCheck } from '../src/core/visual-qc.js';

function fakePng(width, height) {
  const buffer = Buffer.alloc(24);
  Buffer.from('89504e470d0a1a0a', 'hex').copy(buffer, 0);
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

test('prüft 9:16-Bilder und verlangt im strengen Modus die visuelle Freigabe', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-visuals-'));
  const result = await createReelWorkspace({
    title: 'Warum wirkt Warten so lang?',
    script: 'Beim Warten richtet sich die Aufmerksamkeit stark auf die Zeit. Dadurch wirken einzelne Sekunden länger, obwohl die Uhr normal weiterläuft.',
    date: new Date('2026-07-31T12:00:00'),
    sceneCount: 8,
    outputRoot
  });

  const manifestPath = path.join(result.reelDirectory, 'assets-manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  for (const scene of manifest.scenes) {
    const imagePath = path.join(result.reelDirectory, scene.expectedFile);
    await writeFile(imagePath, fakePng(1080, 1920));
    scene.status = 'ready';
  }
  await writeFile(path.join(result.reelDirectory, manifest.cover.expectedFile), fakePng(1080, 1920));
  manifest.cover.status = 'ready';
  await writeJson(manifestPath, manifest);

  const firstReport = await runVisualQualityCheck(result.reelDirectory, { strict: false });
  assert.equal(firstReport.passed, true);
  assert.equal(firstReport.summary.assetsChecked, 9);
  assert.ok(firstReport.summary.warnings >= 9);

  const inspectionPath = path.join(result.reelDirectory, 'review', 'visual-inspection.json');
  const inspection = JSON.parse(await readFile(inspectionPath, 'utf8'));
  for (const asset of inspection.assets) {
    asset.reviewer = 'codex-vision';
    asset.reviewedAt = '2026-07-31T10:00:00.000Z';
    asset.status = 'passed';
    for (const key of Object.keys(asset.checks)) asset.checks[key] = true;
  }
  await writeJson(inspectionPath, inspection);

  const strictReport = await runVisualQualityCheck(result.reelDirectory, { strict: true });
  assert.equal(strictReport.passed, true);
  assert.equal(strictReport.summary.failedChecks, 0);
});

test('erkennt ein falsches Seitenverhältnis im strengen Modus', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-visuals-ratio-'));
  const result = await createReelWorkspace({
    title: 'Was ist Gruppendruck?',
    script: 'Gruppendruck entsteht, wenn Menschen ihr Verhalten an eine Gruppe anpassen, obwohl sie allein vielleicht anders entscheiden würden.',
    date: new Date('2026-07-31T12:00:00'),
    sceneCount: 8,
    outputRoot
  });

  const manifestPath = path.join(result.reelDirectory, 'assets-manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  for (const scene of manifest.scenes) {
    await writeFile(path.join(result.reelDirectory, scene.expectedFile), fakePng(1080, 1920));
    scene.status = 'ready';
  }
  await writeFile(path.join(result.reelDirectory, manifest.cover.expectedFile), fakePng(1080, 1080));
  manifest.cover.status = 'ready';
  await writeJson(manifestPath, manifest);

  const report = await runVisualQualityCheck(result.reelDirectory, { strict: true });
  assert.equal(report.passed, false);
  assert.ok(report.checks.some((check) => check.id === 'cover-aspect-ratio' && check.passed === false));
});
