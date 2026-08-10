import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { discoverExternalAssets } from '../src/core/external-asset-discovery.js';

const execFileAsync = promisify(execFile);

async function createMinimalReel(sceneCount = 2) {
  const reelDirectory = await mkdtemp(path.join(os.tmpdir(), 'asset-discovery-reel-'));
  await mkdir(path.join(reelDirectory, 'scenes'), { recursive: true });
  await mkdir(path.join(reelDirectory, 'inbox', 'numbered-images'), { recursive: true });
  await mkdir(path.join(reelDirectory, 'inbox', 'audio'), { recursive: true });
  await mkdir(path.join(reelDirectory, 'audio'), { recursive: true });

  const scenes = Array.from({ length: sceneCount }, (_, index) => ({
    sceneId: `scene-${String(index + 1).padStart(2, '0')}`,
    order: index + 1
  }));
  await writeFile(
    path.join(reelDirectory, 'scenes', 'scene-index.json'),
    `${JSON.stringify(scenes, null, 2)}\n`,
    'utf8'
  );
  return reelDirectory;
}

async function commandAvailable(command) {
  try {
    await execFileAsync(command, ['--help']);
    return true;
  } catch (error) {
    return error?.code !== 'ENOENT';
  }
}

test('findet eine vollständige lose Bild-XX-Serie und legt sie nummeriert ab', async () => {
  const reelDirectory = await createMinimalReel(2);
  const downloads = await mkdtemp(path.join(os.tmpdir(), 'asset-discovery-downloads-'));

  for (const number of [0, 1, 2]) {
    await writeFile(path.join(downloads, `Bild ${String(number).padStart(2, '0')}.png`), `bild-${number}`, 'utf8');
  }

  const report = await discoverExternalAssets(reelDirectory, {
    searchRoots: [downloads],
    maxDepth: 0
  });

  assert.equal(report.imageDiscovery.importedFrom?.type, 'loose-numbered-files');
  assert.equal(report.imageDiscovery.copiedFiles.length, 3);
  for (const number of [0, 1, 2]) {
    await access(path.join(reelDirectory, 'inbox', 'numbered-images', `Bild ${String(number).padStart(2, '0')}.png`));
  }
});

test('überschreibt keine bereits vorhandene Bildnummer beim Nachimport', async () => {
  const reelDirectory = await createMinimalReel(2);
  const downloads = await mkdtemp(path.join(os.tmpdir(), 'asset-discovery-downloads-'));
  await writeFile(path.join(reelDirectory, 'inbox', 'numbered-images', '00.png'), 'bereits-da', 'utf8');

  for (const number of [0, 1, 2]) {
    await writeFile(path.join(downloads, `Bild ${String(number).padStart(2, '0')}.png`), `neu-${number}`, 'utf8');
  }

  const report = await discoverExternalAssets(reelDirectory, {
    searchRoots: [downloads],
    maxDepth: 0
  });

  assert.equal(report.imageDiscovery.copiedFiles.length, 2);
  await assert.rejects(access(path.join(reelDirectory, 'inbox', 'numbered-images', 'Bild 00.png')));
  await access(path.join(reelDirectory, 'inbox', 'numbered-images', 'Bild 01.png'));
  await access(path.join(reelDirectory, 'inbox', 'numbered-images', 'Bild 02.png'));
});

test('findet eine vollständige nummerierte ZIP, entpackt sie und standardisiert die Dateinamen', async (t) => {
  if (!(await commandAvailable('zip')) || !(await commandAvailable('unzip'))) {
    t.skip('zip/unzip ist in dieser Umgebung nicht verfügbar');
    return;
  }

  const reelDirectory = await createMinimalReel(2);
  const source = await mkdtemp(path.join(os.tmpdir(), 'asset-discovery-zip-source-'));
  const downloads = await mkdtemp(path.join(os.tmpdir(), 'asset-discovery-zip-downloads-'));

  for (const number of [0, 1, 2]) {
    await writeFile(path.join(source, `Bild ${String(number).padStart(2, '0')}.png`), `zip-bild-${number}`, 'utf8');
  }

  const archive = path.join(downloads, 'flow-bilder.zip');
  await execFileAsync('zip', [
    '-q',
    archive,
    'Bild 00.png',
    'Bild 01.png',
    'Bild 02.png'
  ], { cwd: source });

  const report = await discoverExternalAssets(reelDirectory, {
    searchRoots: [downloads],
    maxDepth: 0
  });

  assert.equal(report.imageDiscovery.importedFrom?.type, 'zip');
  assert.equal(report.imageDiscovery.importedFrom?.path, archive);
  assert.equal(report.imageDiscovery.copiedFiles.length, 3);
  for (const number of [0, 1, 2]) {
    await access(path.join(reelDirectory, 'inbox', 'numbered-images', `Bild ${String(number).padStart(2, '0')}.png`));
  }
});

test('legt genau einen eindeutig benannten aktuellen Voice-over-Kandidaten in die Audio-Inbox', async () => {
  const reelDirectory = await createMinimalReel(1);
  const downloads = await mkdtemp(path.join(os.tmpdir(), 'asset-discovery-audio-'));
  const voiceFile = path.join(downloads, 'voiceover-final.mp3');
  await writeFile(voiceFile, 'audio', 'utf8');

  const report = await discoverExternalAssets(reelDirectory, {
    searchRoots: [downloads],
    maxDepth: 0
  });

  assert.equal(report.audioDiscovery.staged?.source, voiceFile);
  await access(path.join(reelDirectory, 'inbox', 'audio', 'voiceover-final.mp3'));
});
