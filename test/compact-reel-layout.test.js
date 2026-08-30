import test from 'node:test';
import assert from 'node:assert/strict';
import { lstat, mkdir, mkdtemp, readFile, readdir, readlink, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  compactReelLayout,
  getReelLayout,
  materializeLegacyTechnicalLinks
} from '../src/core/compact-reel-layout.js';

async function createLegacyReel() {
  const reelDirectory = await mkdtemp(path.join(os.tmpdir(), 'compact-reel-layout-'));
  const directories = [
    '00-bildprompts',
    '01-voice-script',
    '02-audio',
    '03-export',
    '99-technik',
    'audio',
    'caption',
    'effects',
    'export',
    'inbox/audio',
    'inbox/numbered-images',
    'output',
    'review',
    'scenes/scene-01',
    'script',
    'sources',
    'subtitles'
  ];
  await Promise.all(directories.map((directory) => mkdir(path.join(reelDirectory, directory), { recursive: true })));

  await writeFile(path.join(reelDirectory, 'reel.json'), '{"reelId":"compact-test"}\n');
  await writeFile(path.join(reelDirectory, 'status.json'), '{}\n');
  await writeFile(path.join(reelDirectory, 'assets-manifest.json'), '{}\n');
  await writeFile(path.join(reelDirectory, 'script', 'voice-script.txt'), 'Test\n');
  await writeFile(path.join(reelDirectory, 'scenes', 'scene-01', 'scene.json'), '{}\n');
  await writeFile(path.join(reelDirectory, 'sources', 'sources.md'), '# Quellen\n');
  await writeFile(path.join(reelDirectory, 'caption', 'caption.txt'), 'Caption\n');

  return reelDirectory;
}

test('verdichtet ein Reel physisch auf genau fünf Root-Ordner', async () => {
  const reelDirectory = await createLegacyReel();

  const result = await compactReelLayout(reelDirectory);
  const rootEntries = (await readdir(reelDirectory)).sort();

  assert.deepEqual(rootEntries, [
    '00-bildprompts',
    '01-voice-script',
    '02-audio',
    '03-export',
    '99-technik'
  ]);
  assert.equal(result.compact, true);
  assert.equal((await getReelLayout(reelDirectory)).technicalDirectory, path.join(reelDirectory, '99-technik'));
  assert.equal(JSON.parse(await readFile(path.join(reelDirectory, '99-technik', 'reel.json'), 'utf8')).reelId, 'compact-test');
  assert.equal((await lstat(path.join(reelDirectory, '99-technik', 'scenes'))).isDirectory(), true);
  assert.equal(await readlink(path.join(reelDirectory, '01-voice-script', 'voice-script.txt')), '../99-technik/script/voice-script.txt');
  assert.equal(await readlink(path.join(reelDirectory, '00-bildprompts', '01-scene-01')), '../99-technik/scenes/scene-01');

  await rm(reelDirectory, { recursive: true, force: true });
});

test('stellt technische Root-Pfade nur während eines Pipeline-Laufs temporär bereit', async () => {
  const reelDirectory = await createLegacyReel();
  await compactReelLayout(reelDirectory);

  const compatibility = await materializeLegacyTechnicalLinks(reelDirectory);
  assert.ok(compatibility.createdLinks.includes('reel.json'));
  assert.equal((await lstat(path.join(reelDirectory, 'reel.json'))).isSymbolicLink(), true);

  await compatibility.cleanup();

  const rootEntries = (await readdir(reelDirectory)).sort();
  assert.deepEqual(rootEntries, [
    '00-bildprompts',
    '01-voice-script',
    '02-audio',
    '03-export',
    '99-technik'
  ]);

  await rm(reelDirectory, { recursive: true, force: true });
});
