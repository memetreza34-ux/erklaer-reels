import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const script = path.resolve('YOUTUBE-ANSICHT.command');

test('Finder-Vorschau zeigt nur youtube und Wochen; keine Videos oder technischen Inhalte werden verändert', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'weltlogik-finder-view-'));
  try {
    for (const directory of [
      'youtube/2026-KW42_12-10_bis_18-10',
      'youtube/2027-KW03_18-01_bis_24-01',
      'youtube/templates', 'youtube/projects', 'scripts', 'reels', 'src'
    ]) {
      await mkdir(path.join(root, directory), { recursive: true });
    }
    const keep = path.join(root, 'youtube/2026-KW42_12-10_bis_18-10/MEIN-VIDEO.txt');
    await writeFile(keep, 'Original bleibt unverändert');
    await writeFile(path.join(root,'AGENTS.md'), 'wichtige technische Regeln');
    await writeFile(path.join(root,'youtube/YOUTUBE_WORKFLOW.md'), 'bitte nicht verschieben');

    const proc = spawnSync('bash', [script, '--dry-run'], {
      encoding: 'utf8',
      env: { ...process.env, YOUTUBE_VIEW_TEST_ROOT: root }
    });
    assert.equal(proc.status, 0, proc.stderr);
    assert.match(proc.stdout, /SICHTBAR: youtube\//);
    assert.match(proc.stdout, /SICHTBAR: youtube\/2026-KW42_12-10_bis_18-10\//);
    assert.match(proc.stdout, /SICHTBAR: youtube\/2027-KW03_18-01_bis_24-01\//);
    for (const hidden of [
      'AGENTS.md', 'reels', 'scripts', 'src',
      'youtube/templates', 'youtube/projects', 'youtube/YOUTUBE_WORKFLOW.md'
    ]) {
      assert.ok(proc.stdout.includes('AUSBLENDEN: ' + hidden), hidden);
    }
    assert.doesNotMatch(proc.stdout, /AUSBLENDEN: youtube\/2026-KW42/);
    assert.doesNotMatch(proc.stdout, /AUSBLENDEN: youtube\/2027-KW03/);
    assert.equal(await readFile(keep, 'utf8'), 'Original bleibt unverändert');
    assert.equal(await readFile(path.join(root,'AGENTS.md'), 'utf8'), 'wichtige technische Regeln');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('Finder-Ansicht unterstützt Rückgängig, unbekannte Optionen blockiert und Nicht-Mac-Schreibzugriffe verweigert', async () => {
  const content = await readFile(script, 'utf8');
  assert.match(content, /chflags hidden/);
  assert.match(content, /chflags nohidden/);
  assert.match(content, /--show\|--restore\|--rueckgaengig/);
  assert.match(content, /stat -f '%Sf'/);
  assert.match(content, /state_file=/);
  assert.match(content, /Darwin/);
  assert.match(content, /--dry-run/);

  const invalid = spawnSync('bash', [script, '--not-a-real-option'], { encoding: 'utf8' });
  assert.equal(invalid.status, 2);

  if (process.platform !== 'darwin') {
    const rejected = spawnSync('bash', [script, '--hide'], { encoding: 'utf8' });
    assert.equal(rejected.status, 2);
    assert.match(rejected.stderr, /nur auf macOS/);
  }
});
