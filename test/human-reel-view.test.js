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
    'effects',
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
  await writeFile(path.join(reelDirectory, 'all-image-prompts', 'all-image-prompts.txt'), 'Prompts\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'caption', 'caption.txt'), 'Caption\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'sources', 'sources.md'), '# Quellen\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'scenes', 'scene-01', 'image-prompt.txt'), 'Prompt 1\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'scenes', 'scene-01', 'scene.json'), '{}\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'scenes', 'scene-02', 'image-prompt.txt'), 'Prompt 2\n', 'utf8');
  await writeFile(path.join(reelDirectory, 'scenes', 'scene-02', 'scene.json'), '{}\n', 'utf8');

  return reelDirectory;
}

test('erstellt sechs klar nummerierte Benutzerordner', async () => {
  const reelDirectory = await createMinimalReel();
  const result = await ensureHumanReelView(reelDirectory);

  assert.deepEqual(result.visibleFolders, HUMAN_REEL_FOLDERS);
  for (const folder of HUMAN_REEL_FOLDERS) {
    assert.equal((await lstat(path.join(reelDirectory, folder))).isDirectory(), true);
  }
});

test('ordnet Cover und jedes Szenenbild direkt dem passenden Ordner zu', async () => {
  const reelDirectory = await createMinimalReel();
  await ensureHumanReelView(reelDirectory);
  await ensureHumanReelView(reelDirectory);

  assert.equal(await readlink(path.join(reelDirectory, '00-bildprompts', '00-cover')), '../cover');
  assert.equal(await readlink(path.join(reelDirectory, '00-bildprompts', '01-scene-01')), '../scenes/scene-01');
  assert.equal(await readlink(path.join(reelDirectory, '00-bildprompts', '02-scene-02')), '../scenes/scene-02');
  assert.equal(await readlink(path.join(reelDirectory, '00-bildprompts', '99-alle-bildprompts.txt')), '../all-image-prompts/all-image-prompts.txt');

  await writeFile(path.join(reelDirectory, '00-bildprompts', '01-scene-01', 'scene-01.png'), 'bild-1', 'utf8');
  assert.equal(await readFile(path.join(reelDirectory, 'scenes', 'scene-01', 'scene-01.png'), 'utf8'), 'bild-1');
});

test('stellt einen sichtbaren Sammelordner mit aktuellem Bild-XX-Standard bereit', async () => {
  const reelDirectory = await createMinimalReel();
  await ensureHumanReelView(reelDirectory);

  assert.equal(
    await readlink(path.join(reelDirectory, '00-bildprompts', '00-ALLE-BILDER-HIER-REIN')),
    '../inbox/numbered-images'
  );

  const readme = await readFile(path.join(reelDirectory, 'inbox', 'numbered-images', 'README.md'), 'utf8');
  assert.match(readme, /`Bild 00\.png` = Cover/);
  assert.match(readme, /`Bild 01\.png` = Szene 1/);
  assert.match(readme, /erst verwendet, wenn die komplette Bildreihe fertig erzeugt/);

  const promptReadme = await readFile(path.join(reelDirectory, '00-bildprompts', 'README.md'), 'utf8');
  assert.match(promptReadme, /Google Flow erzeugt die Bilder streng einzeln/);
  assert.match(promptReadme, /ohne weiteres Go automatisch/);
  assert.match(promptReadme, /`Bild 00\.png` ist Cover und Style-Master/);
});

test('sammelt unwichtige Dateien im Technikordner', async () => {
  const reelDirectory = await createMinimalReel();
  await ensureHumanReelView(reelDirectory);

  assert.equal(await readlink(path.join(reelDirectory, '01-voice-script', 'voice-script.txt')), '../script/voice-script.txt');
  assert.equal(await readlink(path.join(reelDirectory, '02-audio', 'AUDIO-HIER-EINFUEGEN')), '../inbox/audio');
  assert.equal(await readlink(path.join(reelDirectory, '03-caption', 'caption.txt')), '../caption/caption.txt');
  assert.equal(await readlink(path.join(reelDirectory, '04-video', 'FERTIGES-VIDEO')), '../output');
  assert.equal(await readlink(path.join(reelDirectory, '99-technik', 'QUELLEN.md')), '../sources/sources.md');
  assert.equal(await readlink(path.join(reelDirectory, '99-technik', 'UNTERTITEL')), '../subtitles');
  assert.equal(await readlink(path.join(reelDirectory, '99-technik', 'EFFEKTE')), '../effects');

  const outputReadme = await readFile(path.join(reelDirectory, 'output', 'README.md'), 'utf8');
  assert.match(outputReadme, /finale MP4/);
});

test('entfernt die alte sichtbare Ordneransicht', async () => {
  const reelDirectory = await createMinimalReel();
  for (const folder of ['00-cover', '03-szenen', '04-caption', '05-review', '06-video']) {
    await mkdir(path.join(reelDirectory, folder), { recursive: true });
    await writeFile(path.join(reelDirectory, folder, 'alte-ansicht.txt'), 'alt\n', 'utf8');
  }

  const result = await ensureHumanReelView(reelDirectory);
  assert.deepEqual(result.removedLegacyFolders.sort(), ['00-cover', '03-szenen', '04-caption', '05-review', '06-video']);

  for (const folder of result.removedLegacyFolders) {
    await assert.rejects(lstat(path.join(reelDirectory, folder)), { code: 'ENOENT' });
  }
});
