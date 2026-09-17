import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, writeFile, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { compactReelLayout } from '../src/core/compact-reel-layout.js';

const reelPath = (root, name) =>
  path.join(root, 'reels', '2026-KW36_31-08_bis_06-09', 'montag', name);

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ermittelt zur Laufzeit, ob das Dateisystem Groß-/Kleinschreibung unterscheidet.
 * macOS (APFS) und Windows tun es nicht, die Linux-CI schon - und genau diese
 * Differenz hat die Suite vorher auf einer der beiden Seiten rot gemacht.
 */
async function isCaseInsensitiveFilesystem() {
  const probe = await mkdtemp(path.join(os.tmpdir(), 'case-probe-'));
  await mkdir(path.join(probe, 'PROBE'));
  return exists(path.join(probe, 'probe'));
}

const CASE_INSENSITIVE = await isCaseInsensitiveFilesystem();

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
 * Sammelt alle Dateinamen unterhalb eines Verzeichnisses, unabhängig davon,
 * unter welchem Ordnernamen sie am Ende liegen.
 */
async function collectFileNames(directory) {
  const names = [];
  const entries = await readdir(directory, { withFileTypes: true, recursive: true }).catch(() => []);
  for (const entry of entries) {
    if (entry.isFile()) names.push(entry.name);
  }
  return names;
}

test('ein Legacy-Alias in anderer Schreibweise kostet keinen Nutzerinhalt', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'case-collision-'));
  const reelDirectory = await buildReel(root, 'reel-01_test');

  await mkdir(path.join(reelDirectory, '99-technik', 'INBOX'), { recursive: true });
  await writeFile(path.join(reelDirectory, '99-technik', 'INBOX', 'user-original.zip'), 'keep-me');
  await writeFile(path.join(reelDirectory, 'inbox', 'neu.txt'), 'neu');

  // Der Lauf darf auf keiner Plattform abbrechen.
  const result = await compactReelLayout(reelDirectory);
  assert.equal(result.compact, true);

  // Zusicherung auf beiden Dateisystemen: nichts geht verloren.
  const technicalDirectory = path.join(reelDirectory, '99-technik');
  const names = await collectFileNames(technicalDirectory);
  assert.ok(names.includes('user-original.zip'), `Nutzerdatei verloren: ${names.join(', ')}`);
  assert.ok(names.includes('neu.txt'), `Neue Datei verloren: ${names.join(', ')}`);

  if (CASE_INSENSITIVE) {
    // INBOX und inbox sind derselbe Ordner - der Inhalt wird zusammengeführt.
    const merged = await readdir(path.join(technicalDirectory, 'inbox'));
    assert.ok(merged.includes('neu.txt'));
    assert.ok(merged.includes('user-original.zip'));
    assert.ok(result.mergedEntries.some((entry) => entry.entry === 'inbox'));
  } else {
    // Getrennte Ordner: inbox wird normal verschoben, INBOX bleibt als Alias stehen.
    assert.ok(await exists(path.join(technicalDirectory, 'INBOX', 'user-original.zip')));
    assert.ok(await exists(path.join(technicalDirectory, 'inbox', 'neu.txt')));
  }
});

test('beim Zusammenführen gewinnt der vorhandene Inhalt', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'case-collision-'));
  const reelDirectory = await buildReel(root, 'reel-02_test');

  await mkdir(path.join(reelDirectory, '99-technik', 'INBOX'), { recursive: true });
  await writeFile(path.join(reelDirectory, '99-technik', 'INBOX', 'gleich.txt'), 'ziel');
  await writeFile(path.join(reelDirectory, 'inbox', 'gleich.txt'), 'quelle');

  const result = await compactReelLayout(reelDirectory);

  // Auf beiden Dateisystemen gilt: der bestehende Stand wird nie überschrieben.
  assert.equal(await readFile(path.join(reelDirectory, '99-technik', 'INBOX', 'gleich.txt'), 'utf8'), 'ziel');

  if (!CASE_INSENSITIVE) return;

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
