import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));

/**
 * Der Einstiegspunkt darf nicht davon abhaengen, wie das Skript aufgerufen wird
 * oder ob der Projektpfad Sonderzeichen enthaelt. Ein direkter Stringvergleich
 * von import.meta.url mit process.argv[1] scheitert bei relativen Pfaden und bei
 * Umlauten, weil nur import.meta.url prozentkodiert ist.
 */
test('preflight laeuft bei relativem und absolutem Aufruf', async () => {
  const relativ = await execFileAsync(process.execPath, ['src/cli/preflight.js'], { cwd: REPO_ROOT });
  assert.match(relativ.stdout, /ffmpeg|Fehlende Werkzeuge/, 'Relativer Aufruf erzeugt keine Ausgabe.');

  const absolut = await execFileAsync(process.execPath, [path.join(REPO_ROOT, 'src/cli/preflight.js')], { cwd: REPO_ROOT });
  assert.match(absolut.stdout, /ffmpeg|Fehlende Werkzeuge/, 'Absoluter Aufruf erzeugt keine Ausgabe.');
});

test('checkExternalTools meldet fehlende Werkzeuge', async () => {
  const { checkExternalTools } = await import('../src/cli/preflight.js');
  const { missing, found } = checkExternalTools([
    { command: 'definitiv-nicht-vorhanden-xyz', args: ['--version'], purpose: 'Test' }
  ]);
  assert.equal(found.length, 0);
  assert.equal(missing.length, 1);
  assert.equal(missing[0].command, 'definitiv-nicht-vorhanden-xyz');
});
