import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createReelWorkspace } from '../src/core/workspace.js';
import { calculateReelProgress } from '../src/core/reel-progress.js';

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

test('zeigt getrennten Fortschritt für Vorproduktion und externe Assets', async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-progress-'));
  const result = await createReelWorkspace({
    title: 'Was ist Gruppendruck?',
    script: 'Gruppendruck beschreibt den Einfluss einer Gruppe auf das Verhalten einzelner Personen. Menschen passen ihre Meinung manchmal an, weil sie dazugehören möchten oder Ablehnung vermeiden wollen. Dieses längere Rohscript sorgt dafür, dass die beiden Scriptdateien im Test als vorhanden gelten.',
    date: new Date('2026-07-30T12:00:00'),
    sceneCount: 12,
    outputRoot: temporaryRoot
  });

  const initial = await calculateReelProgress(result.reelDirectory);
  assert.equal(initial.assets, 0);
  assert.equal(initial.details.sceneImagesReady, '0/12');
  assert.match(initial.nextStep, /Phase 1.*ChatGPT/);

  const manifestPath = path.join(result.reelDirectory, 'assets-manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifest.audio.status = 'ready';
  manifest.cover.status = 'ready';
  for (const scene of manifest.scenes) scene.status = 'ready';
  await writeJson(manifestPath, manifest);
  await writeJson(path.join(result.reelDirectory, 'review', 'asset-matching-report.json'), {
    summary: { assignedScenes: 12, totalScenes: 12, audioReady: true, coverReady: true }
  });

  const withAssets = await calculateReelProgress(result.reelDirectory);
  assert.equal(withAssets.assets, 100);
  assert.equal(withAssets.details.sceneImagesReady, '12/12');
  assert.equal(withAssets.details.audioReady, true);
  assert.equal(withAssets.details.coverImageReady, true);
});
