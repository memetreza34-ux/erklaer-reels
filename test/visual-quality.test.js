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

test('prüft alle geplanten Bildphasen technisch mit Single-Pass-Fast-QC', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-visuals-'));
  const result = await createReelWorkspace({
    title: 'Was ist Föderalismus?',
    script: 'Dieses Rohscript dient nur dazu, die technische visuelle Prüfung aller geplanten Bildphasen zu testen.',
    date: new Date('2026-09-12T12:00:00'), sceneCount: 9, outputRoot
  });

  const manifestPath = path.join(result.reelDirectory, 'assets-manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  for (const visual of manifest.visuals) {
    await writeFile(path.join(result.reelDirectory, visual.expectedFile), fakePng(1080, 1920));
    visual.status = 'ready';
  }
  for (const scene of manifest.scenes) scene.status = 'ready';
  await writeJson(manifestPath, manifest);

  const report = await runVisualQualityCheck(result.reelDirectory, { strict: true });
  assert.equal(report.passed, true, JSON.stringify(report.checks.filter((check) => !check.passed && check.level === 'error'), null, 2));
  assert.equal(report.mode, 'single-pass-fast');
  assert.equal(report.summary.assetsChecked, manifest.visuals.length);
  assert.equal(report.summary.failedChecks, 0);
});

test('falsches Seitenverhältnis bleibt ein echter Hard Fail', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-visuals-ratio-'));
  const result = await createReelWorkspace({
    title: 'Was ist Föderalismus?',
    script: 'Dieses Rohscript dient nur dazu, ein falsches Bildseitenverhältnis im strengen QC zu erkennen.',
    date: new Date('2026-09-12T12:00:00'), sceneCount: 9, outputRoot
  });

  const manifestPath = path.join(result.reelDirectory, 'assets-manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  for (const visual of manifest.visuals) {
    await writeFile(path.join(result.reelDirectory, visual.expectedFile), fakePng(1080, 1920));
    visual.status = 'ready';
  }
  await writeFile(path.join(result.reelDirectory, manifest.visuals[0].expectedFile), fakePng(1080, 1080));
  await writeJson(manifestPath, manifest);

  const report = await runVisualQualityCheck(result.reelDirectory, { strict: true });
  assert.equal(report.passed, false);
  assert.ok(report.checks.some((check) => /aspect-ratio$/.test(check.id) && check.passed === false));
});
