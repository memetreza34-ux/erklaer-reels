import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { compactReelLayout } from '../src/core/compact-reel-layout.js';

const reelPath = (root, name) =>
  path.join(root, 'reels', '2026-KW36_31-08_bis_06-09', 'montag', name);

async function buildReel(root, name) {
  const reelDirectory = reelPath(root, name);
  for (const directory of ['00-bildprompts', '01-voice-script', '02-audio', '03-export', 'inbox', 'scenes', 'script']) {
    await mkdir(path.join(reelDirectory, directory), { recursive: true });
  }
  await mkdir(path.join(reelDirectory, 'inbox', 'numbered-images'), { recursive: true });
  await writeFile(path.join(reelDirectory, 'reel.json'), '{"reelId":"test"}\n');
  await writeFile(path.join(reelDirectory, 'status.json'), '{}\n');
  await writeFile(path.join(reelDirectory, 'script', 'voice-script.txt'), 'Test\n');
  return reelDirectory;
}

/**
 * Auf APFS/HFS+/NTFS ist 99-technik/INBOX derselbe physische Ordner wie
 * 99-technik/inbox. Ohne Sonderbehandlung bricht compactReelLayout dort ab -
 * die Suite war auf macOS rot, in der Linux-CI aber grün.
 */
test('Legacy-Alias in anderer Schreibweise blockiert den Lauf nicht', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'case-collision-'));
  const reelDirectory = await buildReel(root, 'reel-01_test');

  await mkdir(path.join(reelDirectory, '99-technik', 'INBOX'), { recursive: true });
  await writeFile(path.join(reelDirectory, '99-technik', 'INBOX', 'user-original.zip'), 'keep-me');
  await writeFile(path.join(reelDirectory, 'inbox', 'neu.txt'), 'neu');

  const result = await compactReelLayout(reelDirectory);

  assert.equal(result.compact, true);

  // Nutzerinhalt im bestehenden Ordner bleibt unangetastet.
  const alias = path.join(reelDirectory, '99-technik', 'INBOX', 'user-original.zip');
  assert.equal(await readFile(alias, 'utf8'), 'keep-me');

  // Neuer Inhalt ist dazugekommen, nicht verloren gegangen.
  const merged = await readdir(path.join(reelDirectory, '99-technik', 'inbox'));
  assert.ok(merged.includes('neu.txt'), `Inhalt fehlt: ${merged.join(', ')}`);
  assert.ok(merged.includes('user-original.zip'));
});

test('beim Zusammenführen gewinnt der vorhandene Inhalt', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'case-collision-'));
  const reelDirectory = await buildReel(root, 'reel-02_test');

  // Legacy-Alias mit einer Datei, die es auch in der Quelle gibt.
  await mkdir(path.join(reelDirectory, '99-technik', 'INBOX'), { recursive: true });
  await writeFile(path.join(reelDirectory, '99-technik', 'INBOX', 'gleich.txt'), 'ziel');
  await writeFile(path.join(reelDirectory, 'inbox', 'gleich.txt'), 'quelle');

  const result = await compactReelLayout(reelDirectory);

  // Nichts wird überschrieben: der bestehende Stand bleibt.
  assert.equal(await readFile(path.join(reelDirectory, '99-technik', 'INBOX', 'gleich.txt'), 'utf8'), 'ziel');

  const merged = result.mergedEntries.find((entry) => entry.entry === 'inbox');
  assert.ok(merged, 'Der Merge muss gemeldet werden.');
  assert.ok(merged.conflicts.includes('gleich.txt'), `Konflikt fehlt: ${JSON.stringify(merged)}`);
});

test('ein echter gleichnamiger Zielordner bleibt ein Hard Blocker', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'case-collision-'));
  const reelDirectory = await buildReel(root, 'reel-03_test');

  // Exakt gleiche Schreibweise ist kein Legacy-Alias, sondern eine echte Kollision.
  await mkdir(path.join(reelDirectory, '99-technik', 'scenes'), { recursive: true });
  await writeFile(path.join(reelDirectory, '99-technik', 'scenes', 'vorhanden.txt'), 'ziel');
  await writeFile(path.join(reelDirectory, 'scenes', 'neu.txt'), 'quelle');

  await assert.rejects(
    compactReelLayout(reelDirectory),
    /nichts überschrieben oder gelöscht/
  );
});
