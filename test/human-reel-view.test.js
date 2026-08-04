import test from 'node:test';
import assert from 'node:assert/strict';
import { lstat, mkdir, mkdtemp, readFile, readlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { ensureHumanReelView, HUMAN_REEL_FOLDERS } from '../src/core/human-reel-view.js';

async function createMinimalReel() {
  const reelDirectory = await mkdtemp(path.join(os.tmpdir(), 'human-reel-view-'));
  const directories = [
    'all-image-prompts',
    'audio',
    'caption',
    'cover',
    'inbox/audio',
    'inbox/images',
    'review',
    'scenes',
    'script',
    'sources'
  ];
  await Promise.all(directories.map((directory) => mkdir(path.join(reelDirectory, directory), { recursive: true })));

  await writeFile(path.join(reelDirectory, 'reel.json'), '{"reelId":"test-reel"}\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'cover', 'cover-prompt.txt'), 'Cover prompt\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'script', 'voice-script.txt'), 'Voice script\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'all-image-prompts', 'all-image-prompts.txt'), 'Prompts\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'caption', 'caption.txt'), 'Caption\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'sources', 'sources.md'), '# Quellen\n', 'utf8');

  return reelDirectory;
}

test('erstellt sieben klar nummerierte Benutzerordner', async () => {
  const reelDirectory = await createMinimalReel();
  const result = await ensureHumanReelView(reelDirectory);

  assert.deepEqual(result.visibleFolders, HUMAN_REEL_FOLDERS);
  for (const folder of HUMAN_REEL_FOLDERS) {
    assert.equal((await lstat(path.join(reelDirectory, folder))).isDirectory(), true);
  }
});

test('verknüpft sichtbare Dateien mit der bestehenden technischen Struktur', async () => {
  const reelDirectory = await createMinimalReel();
  await ensureHumanReelView(reelDirectory);
  await ensureHumanReelView(reelDirectory);

  assert.equal(await readlink(path.join(reelDirectory, '00-cover', 'cover-prompt.txt')), '../cover/cover-prompt.txt');
  assert.equal(await readlink(path.join(reelDirectory, '01-voice-script', 'voice-script.txt')), '../script/voice-script.txt');
  assert.equal(await readlink(path.join(reelDirectory, '02-audio', 'AUDIO-HIER-EINFUEGEN')), '../inbox/audio');
  assert.equal(await readlink(path.join(reelDirectory, '03-szenen', 'alle-bildprompts.txt')), '../all-image-prompts/all-image-prompts.txt');
  assert.equal(await readlink(path.join(reelDirectory, '03-szenen', 'BILDER-HIER-EINFUEGEN')), '../inbox/images');
  assert.equal(await readlink(path.join(reelDirectory, '04-caption', 'caption.txt')), '../caption/caption.txt');
  assert.equal(await readlink(path.join(reelDirectory, '05-review', 'quellen.md')), '../sources/sources.md');
  assert.equal(await readlink(path.join(reelDirectory, '06-video', 'FERTIGES-VIDEO')), '../output');

  const outputReadme = await readFile(path.join(reelDirectory, 'output', 'README.md'), 'utf8');
  assert.match(outputReadme, /finale MP4/);
});
