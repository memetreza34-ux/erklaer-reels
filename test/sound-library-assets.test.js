import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

test('jede konfigurierte SFX-Datei liegt zentral im Repo', async () => {
  const library = JSON.parse(await readFile('config/sound-library.json', 'utf8'));
  const seenTypes = new Set();
  const seenFiles = new Set();

  assert.ok(Array.isArray(library.types) && library.types.length >= 8);

  for (const entry of library.types) {
    assert.ok(entry.type, 'Sound-Typ fehlt');
    assert.ok(entry.file, `Datei fehlt für Sound-Typ ${entry.type}`);
    assert.equal(seenTypes.has(entry.type), false, `Doppelter Sound-Typ: ${entry.type}`);
    assert.equal(seenFiles.has(entry.file), false, `Doppelte Sound-Datei: ${entry.file}`);
    seenTypes.add(entry.type);
    seenFiles.add(entry.file);

    const filePath = path.join(library.libraryDirectory, entry.file);
    assert.equal(await exists(filePath), true, `Zentrale SFX-Datei fehlt: ${filePath}`);
  }
});

test('alle Transition-Sounds der Effektregeln existieren in der Soundbibliothek', async () => {
  const [library, rules] = await Promise.all([
    readFile('config/sound-library.json', 'utf8').then(JSON.parse),
    readFile('config/effects-rules.json', 'utf8').then(JSON.parse)
  ]);

  const known = new Set(library.types.map((entry) => entry.type));
  const transitions = rules.soundEffects?.transitionSoundTypes ?? [];

  assert.ok(transitions.length >= 3, 'Zu wenige wiederverwendbare Transition-Sounds');
  for (const type of transitions) {
    assert.equal(known.has(type), true, `Transition-Sound fehlt in Library: ${type}`);
  }
});
