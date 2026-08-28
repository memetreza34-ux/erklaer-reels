import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createReelWorkspace } from '../src/core/workspace.js';
import { SUBTITLE_STYLE } from '../src/shared/subtitle-style.js';

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

test('neue Arbeitsordner deaktivieren Untertitel und Word-Sync global', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-reels-no-subtitles-'));

  try {
    const { reelDirectory } = await createReelWorkspace({
      title: 'Ohne Untertitel',
      script: 'Dieses Rohscript wird zu einem vollständigen Ein-Minuten-Reel ohne eingeblendete Untertitel ausgebaut.',
      date: new Date('2026-08-03T12:00:00'),
      sceneCount: 13,
      outputRoot
    });

    const reel = await readJson(path.join(reelDirectory, 'reel.json'));
    const status = await readJson(path.join(reelDirectory, 'status.json'));
    const plan = await readJson(path.join(reelDirectory, 'subtitles', 'subtitle-plan.json'));
    const scene = await readJson(path.join(reelDirectory, 'scenes', 'scene-01', 'scene.json'));

    assert.equal(SUBTITLE_STYLE.enabled, false);
    assert.equal(reel.subtitlesEnabled, false);
    assert.equal(status.subtitles, 'disabled');
    assert.equal(status.wordSync, 'not-required');
    assert.equal(plan.enabled, false);
    assert.deepEqual(plan.cues, []);
    assert.deepEqual(scene.subtitleCues, []);
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});

test('deaktivierter Plan bleibt nur als rückwärtskompatible Metadatei vorhanden', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-reels-no-subtitle-plan-'));

  try {
    const { reelDirectory } = await createReelWorkspace({
      title: 'Kompatibilitätsplan',
      script: 'Dieses Rohscript prüft ausschließlich die deaktivierte Kompatibilitätsdatei für Untertitel im neuen Workflow.',
      date: new Date('2026-08-04T12:00:00'),
      sceneCount: 13,
      outputRoot
    });

    const plan = await readJson(path.join(reelDirectory, 'subtitles', 'subtitle-plan.json'));
    assert.equal(plan.enabled, false);
    assert.match(plan.reason, /ohne Untertitel/i);
    assert.equal(plan.cues.length, 0);
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});
