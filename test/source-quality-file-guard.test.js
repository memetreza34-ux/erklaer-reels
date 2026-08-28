import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { SOURCE_SCHEMA_MARKER, SOURCE_SCHEMA_V2_MARKER } from '../src/core/source-quality.js';
import { verifyRequiredSourceQuality } from '../src/core/source-quality-file-guard.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function fixture({ requiredSchemaVersion = 3, markerVersion = 3, includeMarker = true } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'source-quality-file-guard-'));
  await mkdir(path.join(root, 'sources'), { recursive: true });
  await writeJson(path.join(root, 'reel.json'), requiredSchemaVersion === null
    ? { reelId: 'legacy-reel' }
    : { reelId: 'new-reel', sourceQualitySchemaVersion: requiredSchemaVersion });

  const selectedMarker = markerVersion >= 3 ? SOURCE_SCHEMA_MARKER : SOURCE_SCHEMA_V2_MARKER;
  const marker = includeMarker ? `${selectedMarker}\n` : '';
  const types = markerVersion >= 3
    ? '- Quellentyp: Primär/Offiziell\n'
    : '';
  const secondType = markerVersion >= 3
    ? '- Quellentyp: Unabhängige Sekundärquelle\n'
    : '';

  await writeFile(path.join(root, 'sources', 'sources.md'), `# Quellen\n${marker}\n## Quelle 1\n- Titel/Institution: Deutscher Bundestag\n- URL: https://www.bundestag.de/parlament/aufgaben\n- Datum/Zugriff: 2026-08-24\n${types}- Belegt: Erklärt die Aufgaben des Parlaments.\n\n## Quelle 2\n- Titel/Institution: Bundeszentrale für politische Bildung\n- URL: https://www.bpb.de/themen/politisches-system/\n- Datum/Zugriff: 2026-08-24\n${secondType}- Belegt: Liefert unabhängigen Hintergrund.\n`, 'utf8');
  return root;
}

test('neues Reel mit Pflicht-Schema 3 und vollständigen Quellen besteht', async () => {
  const root = await fixture();
  const result = await verifyRequiredSourceQuality(root);

  assert.equal(result.required, true);
  assert.equal(result.requiredSchemaVersion, 3);
  assert.equal(result.markerPresent, true);
  assert.equal(result.passed, true);
  assert.equal(result.inspection.hasPrimaryOrOfficial, true);
  assert.equal(result.inspection.hasIndependentSecondary, true);
});

test('entfernter Schema-Marker kann ein neues Reel nicht auf Legacy zurückstufen', async () => {
  const root = await fixture({ includeMarker: false });
  const result = await verifyRequiredSourceQuality(root);

  assert.equal(result.required, true);
  assert.equal(result.markerPresent, false);
  assert.equal(result.passed, false);
  assert.match(result.reason, /Schema-Marker/);
});

test('Schema-3-Pflicht kann nicht durch einen älteren Schema-2-Marker umgangen werden', async () => {
  const root = await fixture({ requiredSchemaVersion: 3, markerVersion: 2 });
  const result = await verifyRequiredSourceQuality(root);

  assert.equal(result.required, true);
  assert.equal(result.requiredSchemaVersion, 3);
  assert.equal(result.inspection.schemaVersion, 2);
  assert.equal(result.markerPresent, false);
  assert.equal(result.passed, false);
});

test('Schema-2-Marker bleibt für bestehende Schema-2-Reels rückwärtskompatibel', async () => {
  const root = await fixture({ requiredSchemaVersion: 2, markerVersion: 2 });
  const result = await verifyRequiredSourceQuality(root);

  assert.equal(result.required, true);
  assert.equal(result.requiredSchemaVersion, 2);
  assert.equal(result.markerPresent, true);
  assert.equal(result.passed, true);
});

test('unvollständige Pflichtquellen bleiben blockiert', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'sources', 'sources.md'), `# Quellen\n${SOURCE_SCHEMA_MARKER}\n\n## Quelle 1\n- Titel/Institution: Nur eine Quelle\n- URL: https://www.bundestag.de/\n- Datum/Zugriff: 2026-08-24\n- Quellentyp: Primär/Offiziell\n- Belegt: Nur eine Aussage.\n`, 'utf8');

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
