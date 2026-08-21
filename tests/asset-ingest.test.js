import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createReelWorkspace } from '../src/core/workspace.js';
import { buildAssetInventory, applyAssetMap } from '../src/core/asset-ingest.js';

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

test('übernimmt unsortierte Bilder, Cover und Audio anhand der Asset-Map', async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-assets-'));
  const result = await createReelWorkspace({
    title: 'Warum entstehen Grenzen?',
    script: 'Grenzen entstehen durch politische Entscheidungen, Konflikte, Verträge und historische Entwicklungen. Dieses Script dient nur als Test.',
    date: new Date('2026-07-30T12:00:00'),
    sceneCount: 12,
    outputRoot: temporaryRoot
  });

  const imagesDirectory = path.join(result.reelDirectory, 'inbox', 'images');
  const audioDirectory = path.join(result.reelDirectory, 'inbox', 'audio');
  await writeFile(path.join(imagesDirectory, 'zufall-a.png'), 'dummy scene image');
  await writeFile(path.join(imagesDirectory, 'thumbnail-final.webp'), 'dummy cover image');
  await writeFile(path.join(audioDirectory, 'sprecher-neu.mp3'), 'dummy audio');

  const inventory = await buildAssetInventory(result.reelDirectory);
  assert.equal(inventory.candidates.images.length, 2);
  assert.equal(inventory.candidates.audio.length, 1);

  const assetMap = {
    version: 1,
    generatedBy: 'test-vision-agent',
    assignments: [
      {
        source: 'images/zufall-a.png',
        target: 'scene-01',
        confidence: 0.97,
        visualReviewed: true,
        secondPassConfirmed: true,
        sceneOrderConfirmed: true,
        confirmedTarget: 'scene-01',
        confirmedSceneOrder: 1,
        visibleSummary: 'Eine klare Szene zeigt den visuellen Hook des Test-Reels.',
        reason: 'Der sichtbare Bildinhalt entspricht dem Sprechertext und dem geplanten Hook.',
        comparedFields: ['narration', 'visualIdea', 'imageText', 'imagePrompt'],
        matchMethod: 'visual-content-review'
      },
      {
        source: 'images/thumbnail-final.webp',
        target: 'cover',
        confidence: 0.94,
        visualReviewed: true,
        secondPassConfirmed: true,
        visibleSummary: 'Ein klar gestaltetes Titelbild fasst das Thema visuell zusammen.',
        reason: 'Die sichtbare Titelkomposition entspricht Headline, Cover-Idee und Cover-Prompt.',
        comparedFields: ['headline', 'coverVisualIdea', 'coverPrompt'],
        matchMethod: 'visual-content-review'
      },
      {
        source: 'audio/sprecher-neu.mp3',
        target: 'audio',
        confidence: 1,
        reason: 'Einzige Audiodatei.'
      }
    ],
    unmatched: []
  };
  await writeFile(
    path.join(result.reelDirectory, 'inbox', 'asset-map.json'),
    `${JSON.stringify(assetMap, null, 2)}\n`,
    'utf8'
  );

  const report = await applyAssetMap(result.reelDirectory);
  assert.equal(report.summary.assignedScenes, 1);
  assert.equal(report.summary.audioReady, true);
  assert.equal(report.summary.coverReady, true);
  assert.equal(report.skipped.length, 0);

  assert.equal(await exists(path.join(result.reelDirectory, 'scenes', 'scene-01', 'scene-01.png')), true);
  assert.equal(await exists(path.join(result.reelDirectory, 'cover', 'cover.webp')), true);
  assert.equal(await exists(path.join(result.reelDirectory, 'audio', 'voiceover.mp3')), true);

  const status = JSON.parse(await readFile(path.join(result.reelDirectory, 'status.json'), 'utf8'));
  assert.equal(status.audio, 'ready');
  assert.equal(status.cover, 'ready');
  assert.equal(status.images, 'partial');
});

test('lehnt unsichere oder doppelte Zuweisungen ab', async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-assets-safe-'));
  const result = await createReelWorkspace({
    title: 'Was ist Gruppendruck?',
    script: 'Gruppendruck beschreibt den Einfluss einer Gruppe auf Entscheidungen und Verhalten einzelner Personen.',
    date: new Date('2026-07-30T12:00:00'),
    sceneCount: 12,
    outputRoot: temporaryRoot
  });

  const imagesDirectory = path.join(result.reelDirectory, 'inbox', 'images');
  await writeFile(path.join(imagesDirectory, 'unklar.png'), 'dummy');

  await writeFile(
    path.join(result.reelDirectory, 'inbox', 'asset-map.json'),
    `${JSON.stringify({
      version: 1,
      generatedBy: 'test',
      assignments: [
        {
          source: 'images/unklar.png',
          target: 'scene-01',
          confidence: 0.5,
          reason: 'Zu unsicher.'
        }
      ],
      unmatched: ['images/unklar.png']
    }, null, 2)}\n`,
    'utf8'
  );

  const report = await applyAssetMap(result.reelDirectory);
  assert.equal(report.applied.length, 0);
  assert.equal(report.skipped.length, 1);
  assert.match(report.skipped[0].reason, /Konfidenz/);
});
