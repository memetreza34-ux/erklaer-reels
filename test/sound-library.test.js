import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { knownSoundTypes, loadSoundLibrary, reviewSoundDramaturgy, syncReelSounds } from '../src/core/sound-library.js';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));

async function makeReel(soundEffects) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'erklaer-sfx-'));
  await mkdir(path.join(root, 'effects'), { recursive: true });
  await writeFile(
    path.join(root, 'effects', 'effects-plan.json'),
    `${JSON.stringify({ scenes: [{ sceneId: 'scene-01', soundEffects }] }, null, 2)}\n`,
    'utf8'
  );
  return root;
}

async function readPlan(root) {
  return JSON.parse(await readFile(path.join(root, 'effects', 'effects-plan.json'), 'utf8'));
}

test('Bibliothek beschreibt jeden Typ vollständig', async () => {
  const library = await loadSoundLibrary();

  assert.ok(library.types.length >= 5);
  assert.equal(library.reelSoundDirectory, 'sfx');
  for (const entry of library.types) {
    assert.match(entry.type, /^[a-z0-9-]+$/, `${entry.type} muss ein einfacher Slug sein`);
    assert.ok(entry.file.endsWith('.mp3'), `${entry.type} braucht eine Datei`);
    // Ohne Verwendungszweck kann ein Agent den Typ nicht sinnvoll wählen.
    assert.ok(String(entry.purpose ?? '').length >= 10, `${entry.type} braucht purpose`);
    assert.ok(String(entry.useWhen ?? '').length >= 10, `${entry.type} braucht useWhen`);
    assert.ok(String(entry.avoidWhen ?? '').length >= 10, `${entry.type} braucht avoidWhen`);
  }

  const types = knownSoundTypes(library);
  assert.equal(new Set(types).size, types.length, 'Typen müssen eindeutig sein');
});

test('meldet einen unbekannten Typ, statt ihn stillschweigend zu übernehmen', async () => {
  const root = await makeReel([{ type: 'airhorn', atPercent: 0.5 }]);
  try {
    const result = await syncReelSounds(root);
    assert.equal(result.unknownTypes.length, 1);
    assert.equal(result.unknownTypes[0].type, 'airhorn');

    const plan = await readPlan(root);
    assert.equal(plan.scenes[0].soundEffects[0].file, undefined, 'Ein unbekannter Typ darf keine Datei bekommen');

    await assert.rejects(() => syncReelSounds(root, { strict: true }), /airhorn/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('meldet eine fehlende Datei, ohne den Lauf zu beschädigen', async () => {
  const library = await loadSoundLibrary();
  const known = library.types[0];
  const root = await makeReel([{ type: known.type, atPercent: 0.4 }]);
  try {
    const result = await syncReelSounds(root);
    const sourceExists = result.missingFiles.length === 0;

    if (!sourceExists) {
      // Normalfall im Repo: Die Audiodateien sind bewusst nicht eingecheckt.
      assert.equal(result.missingFiles[0].type, known.type);
      assert.match(result.missingFiles[0].expected, /assets\/sfx\//);
      const plan = await readPlan(root);
      assert.equal(plan.scenes[0].soundEffects[0].file, undefined);
      await assert.rejects(() => syncReelSounds(root, { strict: true }), /Soundbibliothek/);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('kopiert eine vorhandene Datei ins Reel und trägt Pfad und Lautstärke ein', async () => {
  const library = await loadSoundLibrary();
  const known = library.types.find((entry) => entry.type === 'pop') ?? library.types[0];
  const sourcePath = path.join(REPO_ROOT, library.libraryDirectory, known.file);

  let createdSource = false;
  try {
    await mkdir(path.dirname(sourcePath), { recursive: true });
    try {
      await readFile(sourcePath);
    } catch {
      await writeFile(sourcePath, 'fake-audio-for-test', 'utf8');
      createdSource = true;
    }

    const root = await makeReel([{ type: known.type, atPercent: 0.4 }]);
    try {
      const result = await syncReelSounds(root, { strict: true });
      assert.deepEqual(result.copied, [`sfx/${known.file}`]);

      const plan = await readPlan(root);
      const sound = plan.scenes[0].soundEffects[0];
      assert.equal(sound.file, `sfx/${known.file}`);
      assert.equal(sound.volume, known.volume ?? library.defaultVolume);

      // Der Renderer bündelt mit publicDir = Reel-Ordner, die Datei muss also darin liegen.
      await readFile(path.join(root, 'sfx', known.file));

      // Zweiter Lauf darf nicht erneut kopieren.
      const again = await syncReelSounds(root, { strict: true });
      assert.deepEqual(again.copied, []);
      assert.equal(again.changed, false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  } finally {
    if (createdSource) await rm(sourcePath, { force: true });
  }
});

test('lässt Szenen ohne geplante Sounds unangetastet', async () => {
  const root = await makeReel([]);
  try {
    const result = await syncReelSounds(root, { strict: true });
    assert.equal(result.changed, false);
    assert.deepEqual(result.copied, []);
    assert.deepEqual(result.missingFiles, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('meldet fehlende Sounds am Szenenwechsel und direkte Wiederholungen', async () => {
  const rules = JSON.parse(await readFile(path.join(REPO_ROOT, 'config', 'effects-rules.json'), 'utf8'));

  const gut = reviewSoundDramaturgy({
    scenes: [
      { sceneId: 'scene-01', soundEffects: [] },
      { sceneId: 'scene-02', soundEffects: [{ type: 'whoosh-up' }] },
      { sceneId: 'scene-03', soundEffects: [{ type: 'pop' }, { type: 'soft-swipe' }] },
      { sceneId: 'scene-04', soundEffects: [{ type: 'whoosh-down' }] }
    ]
  }, rules);
  assert.equal(gut.passed, true, JSON.stringify(gut.findings));

  const schlecht = reviewSoundDramaturgy({
    scenes: [
      { sceneId: 'scene-01', soundEffects: [] },
      { sceneId: 'scene-02', soundEffects: [{ type: 'soft-whoosh' }] },
      { sceneId: 'scene-03', soundEffects: [{ type: 'soft-whoosh' }] },
      { sceneId: 'scene-04', soundEffects: [] }
    ]
  }, rules);
  assert.equal(schlecht.passed, false);
  assert.ok(schlecht.findings.some((f) => f.issue === 'repeated-transition-sound' && f.sceneId === 'scene-03'));
  assert.ok(schlecht.findings.some((f) => f.issue === 'no-sound-on-scene-change' && f.sceneId === 'scene-04'));
});

test('alle Transition-Varianten der Effektregeln stehen in der Bibliothek', async () => {
  const rules = JSON.parse(await readFile(path.join(REPO_ROOT, 'config', 'effects-rules.json'), 'utf8'));
  const library = await loadSoundLibrary();
  const types = new Set(knownSoundTypes(library));

  const transitions = rules.soundEffects.transitionSoundTypes ?? [];
  assert.ok(transitions.length >= 3, 'Ohne mehrere Varianten klingt jeder Schnitt gleich');
  for (const type of transitions) {
    assert.ok(types.has(type), `Transition-Sound "${type}" fehlt in der Bibliothek`);
  }
});
