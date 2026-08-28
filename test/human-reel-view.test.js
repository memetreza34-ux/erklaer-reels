import test from 'node:test';
import assert from 'node:assert/strict';
import { access, lstat, mkdir, mkdtemp, readFile, readlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { ensureHumanReelView, HUMAN_REEL_FOLDERS } from '../src/core/human-reel-view.js';

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function createMinimalReel() {
  const reelDirectory = await mkdtemp(path.join(os.tmpdir(), 'human-reel-view-'));
  const directories = [
    '00-bildprompts',
    'all-image-prompts',
    'audio',
    'caption',
    'cover',
    'effects',
    'export',
    'inbox/audio',
    'inbox/images',
    'production',
    'review',
    'scenes/scene-01',
    'scenes/scene-02',
    'script',
    'sources',
    'subtitles'
  ];
  await Promise.all(directories.map((directory) => mkdir(path.join(reelDirectory, directory), { recursive: true })));

  await writeFile(path.join(reelDirectory, 'reel.json'), '{"reelId":"test-reel"}\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'status.json'), '{}\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'assets-manifest.json'), '{}\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'cover', 'cover-prompt.txt'), 'Cover prompt\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'cover', 'cover.json'), '{}\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'script', 'voice-script.txt'), 'Voice script\n', 'utf8');
  await writeFile(path.join(reelDirectory, '00-bildprompts', '99-alle-bildprompts.txt'), 'Prompts\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'all-image-prompts', 'all-image-prompts.txt'), 'Legacy copy\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'caption', 'caption.txt'), 'Caption\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'sources', 'sources.md'), '# Quellen\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'scenes', 'scene-01', 'image-prompt.txt'), 'Prompt 1\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'scenes', 'scene-01', 'scene.json'), '{}\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'scenes', 'scene-02', 'image-prompt.txt'), 'Prompt 2\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'scenes', 'scene-02', 'scene.json'), '{}\n', 'utf8');

  return reelDirectory;
}

test('erstellt fünf klare sichtbare Benutzerordner', async () => {
  const reelDirectory = await createMinimalReel();
  const result = await ensureHumanReelView(reelDirectory);

  assert.deepEqual(HUMAN_REEL_FOLDERS, [
    '00-bildprompts',
    '01-voice-script',
    '02-audio',
    '03-export',
    '99-technik'
  ]);
  assert.deepEqual(result.visibleFolders, HUMAN_REEL_FOLDERS);
  for (const folder of HUMAN_REEL_FOLDERS) {
    assert.equal((await lstat(path.join(reelDirectory, folder))).isDirectory(), true);
  }
});

test('behält genau einen echten Google-Flow-Masterprompt und entfernt die Legacy-Kopie', async () => {
  const reelDirectory = await createMinimalReel();
  await ensureHumanReelView(reelDirectory);

  assert.equal(await readFile(path.join(reelDirectory, '00-bildprompts', '99-alle-bildprompts.txt'), 'utf8'), 'Prompts\n');
  assert.equal((await lstat(path.join(reelDirectory, '00-bildprompts', '99-alle-bildprompts.txt'))).isSymbolicLink(), false);
  assert.equal(await exists(path.join(reelDirectory, 'all-image-prompts')), false);

  assert.equal(await readlink(path.join(reelDirectory, '00-bildprompts', '00-cover')), '../cover');
  assert.equal(await readlink(path.join(reelDirectory, '00-bildprompts', '01-scene-01')), '../scenes/scene-01');
  assert.equal(await readlink(path.join(reelDirectory, '00-bildprompts', '02-scene-02')), '../scenes/scene-02');
});

test('stellt Sammelordner für nummerierte Flow-Bilder bereit', async () => {
  const reelDirectory = await createMinimalReel();
  await ensureHumanReelView(reelDirectory);

  assert.equal(
    await readlink(path.join(reelDirectory, '00-bildprompts', '00-ALLE-BILDER-HIER-REIN')),
    '../inbox/numbered-images'
  );
});

test('sammelt fertiges Reel und Universal-Caption nur im sichtbaren Exportbereich', async () => {
  const reelDirectory = await createMinimalReel();
  await ensureHumanReelView(reelDirectory);

  assert.equal(await readlink(path.join(reelDirectory, '01-voice-script', 'voice-script.txt')), '../script/voice-script.txt');
  assert.equal(await readlink(path.join(reelDirectory, '02-audio', 'AUDIO-HIER-EINFUEGEN')), '../inbox/audio');
  assert.equal(await readlink(path.join(reelDirectory, '03-export', 'FERTIGES-REEL.mp4')), '../export/FERTIGES-REEL.mp4');
  assert.equal(await readlink(path.join(reelDirectory, '03-export', 'UNIVERSELLE-CAPTION.txt')), '../export/UNIVERSELLE-CAPTION.txt');
  await assert.rejects(lstat(path.join(reelDirectory, '03-caption')), { code: 'ENOENT' });
  await assert.rejects(lstat(path.join(reelDirectory, '04-video')), { code: 'ENOENT' });
});

test('sammelt Technik ohne aktiven Untertitel-Arbeitsbereich', async () => {
  const reelDirectory = await createMinimalReel();
  await ensureHumanReelView(reelDirectory);

  assert.equal(await readlink(path.join(reelDirectory, '99-technik', 'QUELLEN.md')), '../sources/sources.md');
  await assert.rejects(readlink(path.join(reelDirectory, '99-technik', 'UNTERTITEL')), { code: 'ENOENT' });
  assert.equal(await readlink(path.join(reelDirectory, '99-technik', 'EFFEKTE')), '../effects');
});

test('entfernt alte sichtbare Ordner und den all-image-prompts-Doppelordner', async () => {
  const reelDirectory = await createMinimalReel();
  const oldFolders = ['00-cover', '03-szenen', '04-caption', '05-review', '06-video', '03-caption', '04-video', '05-export'];
  for (const folder of oldFolders) {
    await mkdir(path.join(reelDirectory, folder), { recursive: true });
    await writeFile(path.join(reelDirectory, folder, 'alte-ansicht.txt'), 'alt\n', 'utf8');
  }

  const result = await ensureHumanReelView(reelDirectory);
  for (const folder of oldFolders) assert.equal(await exists(path.join(reelDirectory, folder)), false);
  assert.equal(await exists(path.join(reelDirectory, 'all-image-prompts')), false);
  assert.ok(result.removedLegacyFolders.includes('all-image-prompts'));
  assert.equal((await lstat(path.join(reelDirectory, '03-export'))).isDirectory(), true);
});
