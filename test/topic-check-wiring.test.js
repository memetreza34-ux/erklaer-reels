import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, writeFile, readdir } from 'node:fs/promises';
import { promisify } from 'node:util';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));

const SCRIPT = [
  'Warum ist der Himmel blau? Sonnenlicht sieht weiss aus, besteht aber aus allen Farben.',
  'In der Luft treffen diese Farben auf winzige Gasteilchen. Blaues Licht hat kurze Wellen.',
  'Kurze Wellen werden von den Teilchen viel staerker in alle Richtungen gestreut.',
  'Rotes Licht hat lange Wellen und zieht fast ungehindert durch die Luft.',
  'Deshalb kommt blaues Licht aus dem ganzen Himmel zu deinem Auge.',
  'Du siehst also nicht die Sonne direkt, sondern gestreutes blaues Licht.',
  'Am Abend steht die Sonne tief und das Licht nimmt einen viel laengeren Weg.',
  'Auf diesem langen Weg wird das Blau fast vollstaendig herausgestreut.',
  'Uebrig bleibt das Rot, und genau deshalb wird der Himmel abends rot.'
].join('\n');

async function runCreateReel(title) {
  const workdir = await mkdtemp(path.join(os.tmpdir(), 'topic-wiring-'));
  const scriptFile = path.join(workdir, 'script.txt');
  await writeFile(scriptFile, SCRIPT);
  const output = path.join(workdir, 'out');

  try {
    await execFileAsync(
      process.execPath,
      ['src/cli/create-reel.js', '--title', title, '--script-file', scriptFile, '--date', '2026-09-21', '--output', output],
      { cwd: REPO_ROOT }
    );
    return { code: 0, output, out: '' };
  } catch (error) {
    // Die Fehlermeldung geht nach stderr; beide Stroeme zusammen pruefen.
    return { code: error.code ?? 1, out: `${error.stdout ?? ''}${error.stderr ?? ''}`, output };
  }
}

test('create:reel weist ein belegtes Thema ab, bevor Ordner entstehen', async () => {
  const result = await runCreateReel('Was ist Föderalismus?');

  assert.equal(result.code, 1, 'Der Exit-Code muss 1 sein, sonst merkt ein Agent den Abbruch nicht.');
  assert.match(result.out, /bereits belegt/);

  const created = await readdir(result.output).catch(() => []);
  assert.deepEqual(created, [], 'Bei einem Duplikat darf kein Reel-Ordner entstehen.');
});

test('create:reel erkennt auch eine andere Formulierung desselben Themas', async () => {
  const result = await runCreateReel('Föderalismus einfach erklärt');
  assert.equal(result.code, 1);
  assert.match(result.out, /identische Kernaussage/);
});

test('create:reel laesst ein freies Thema durch', async () => {
  const result = await runCreateReel('Wie entsteht ein Vulkanausbruch?');
  assert.equal(result.code, 0, 'Ein freies Thema darf nicht blockiert werden.');

  const created = await readdir(result.output).catch(() => []);
  assert.ok(created.length > 0, 'Das Reel muss angelegt werden.');
});
