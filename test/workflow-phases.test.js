import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (relativePath) => readFile(path.join(REPO_ROOT, relativePath), 'utf8');

test('Phasenbeschreibung nennt ChatGPT, Arman und Antigravity', async () => {
  const doc = await read('WORKFLOW_PHASEN.md');
  assert.match(doc, /Phase 1 — ChatGPT/);
  assert.match(doc, /Phase 2 — Arman/);
  assert.match(doc, /Phase 3 — Antigravity/);
  assert.match(doc, /SIMPLE MODE/i);
  assert.match(doc, /Rückfragen nur bei echten Hard Blockern/i);
});

test('Phase 3 besitzt genau einen normalen Startbefehl', async () => {
  const doc = await read('WORKFLOW_PHASEN.md');
  const pkg = JSON.parse(await read('package.json'));
  assert.match(doc, /npm run phase3:reel/);
  assert.equal(pkg.scripts['phase3:reel'], 'node src/cli/phase3-reel.js');
});

test('Phase-1-Doku beschreibt Adaptive Dense V2 statt starrer 17 Bilder', async () => {
  const doc = await read('WORKFLOW_PHASEN.md');
  assert.match(doc, /adaptive-dense-v2/i);
  assert.match(doc, /9 Szenen: 20–22 Bilder/i);
  assert.doesNotMatch(doc, /9 Szenen\s*=\s*17 Bilder/i);
});

test('Simple Mode entfernt alte per-Bild-Freigabepflichten', async () => {
  const doc = await read('WORKFLOW_PHASEN.md');
  assert.match(doc, /nicht.*sichtbare Bildbeschreibung/is);
  assert.match(doc, /nicht.*Match-Begründung/is);
  assert.match(doc, /nicht.*zweite Zuordnungsprüfung/is);
  assert.match(doc, /keine Zwischenfragen/i);
});
