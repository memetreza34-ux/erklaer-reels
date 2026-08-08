import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { SOURCE_SCHEMA_MARKER } from '../src/core/source-quality.js';
import { verifyRequiredSourceQuality } from '../src/core/source-quality-file-guard.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function fixture({ requiredSchemaVersion = 2, includeMarker = true } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'source-quality-file-guard-'));
  await mkdir(path.join(root, 'sources'), { recursive: true });
  await writeJson(path.join(root, 'reel.json'), requiredSchemaVersion === null
    ? { reelId: 'legacy-reel' }
    : { reelId: 'new-reel', sourceQualitySchemaVersion: requiredSchemaVersion });
  const marker = includeMarker ? `${SOURCE_SCHEMA_MARKER}\n` : '';
  await writeFile(path.join(root, 'sources', 'sources.md'), `# Quellen\n${marker}\n## Quelle 1\n- Titel/Institution: Deutscher Bundestag\n- URL: https://www.bundestag.de/parlament/aufgaben\n- Datum/Zugriff: 2026-08-08\n- Belegt: Erklärt die Aufgaben des Parlaments.\n\n## Quelle 2\n- Titel/Institution: Bundeszentrale für politische Bildung\n- URL: https://www.bpb.de/themen/politisches-system/\n- Datum/Zugriff: 2026-08-08\n- Belegt: Liefert unabhängigen Hintergrund.\n`, 'utf8');
  return root;
}

test('neues Reel mit Pflicht-Schema und vollständigen Quellen besteht', async () => {
  const root = await fixture();
  const result = await verifyRequiredSourceQuality(root);

  assert.equal(result.required, true);
  assert.equal(result.requiredSchemaVersion, 2);
  assert.equal(result.markerPresent, true);
  assert.equal(result.passed, true);
});

test('entfernter Schema-Marker kann ein neues Reel nicht auf Legacy zurückstufen', async () => {
  const root = await fixture({ includeMarker: false });
  const result = await verifyRequiredSourceQuality(root);

  assert.equal(result.required, true);
  assert.equal(result.markerPresent, false);
  assert.equal(result.passed, false);
  assert.match(result.reason, /Schema-Marker/);
});

test('Schema-2-Marker bleibt auch ohne Reel-Feld streng', async () => {
  const root = await fixture({ requiredSchemaVersion: null, includeMarker: true });
  const result = await verifyRequiredSourceQuality(root);

  assert.equal(result.required, true);
  assert.equal(result.requiredSchemaVersion, 2);
  assert.equal(result.markerPresent, true);
  assert.equal(result.passed, true);
});

test('unvollständige Pflichtquellen bleiben blockiert', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'sources', 'sources.md'), `# Quellen\n${SOURCE_SCHEMA_MARKER}\n\n## Quelle 1\n- Titel/Institution: Nur eine Quelle\n- URL: https://www.bundestag.de/\n- Datum/Zugriff: 2026-08-08\n- Belegt: Nur eine Aussage.\n`, 'utf8');

  const result = await verifyRequiredSourceQuality(root);
  assert.equal(result.required, true);
  assert.equal(result.markerPresent, true);
  assert.equal(result.passed, false);
});

test('altes Reel ohne Feld und ohne Schema-Marker bleibt rückwärtskompatibel', async () => {
  const root = await fixture({ requiredSchemaVersion: null, includeMarker: false });
  const result = await verifyRequiredSourceQuality(root);

  assert.equal(result.required, false);
  assert.equal(result.passed, true);
  assert.equal(result.legacy, true);
});
