import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createReelWorkspace } from '../src/core/workspace.js';
import { verifyRequiredSourceQuality } from '../src/core/source-quality-file-guard.js';

test('createReelWorkspace startet mit fester Bildwelt und Quellen-Schema 3', async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-workspace-policy-'));
  const result = await createReelWorkspace({
    title: 'Warum vergessen wir Namen so schnell?',
    script: 'Dieses Rohscript dient nur dazu, die zentralen Workspace-Standards unabhängig von der CLI zu prüfen.',
    date: new Date('2026-08-26T12:00:00'),
    outputRoot: temporaryRoot
  });

  const reel = JSON.parse(await readFile(path.join(result.reelDirectory, 'reel.json'), 'utf8'));
  const status = JSON.parse(await readFile(path.join(result.reelDirectory, 'status.json'), 'utf8'));
  const sources = await readFile(path.join(result.reelDirectory, 'sources', 'sources.md'), 'utf8');

  assert.equal(reel.visualStyleId, 'modern-countryball-explainer');
  assert.match(reel.visualStyleReason, /Globale feste Bildwelt/);
  assert.equal(status.visualWorld, 'fixed-modern-countryball-explainer');
  assert.equal(reel.sourceQualitySchemaVersion, 3);
  assert.equal(reel.subtitlesEnabled, false);
  assert.match(sources, /<!-- sources-schema:3 -->/);
  assert.match(sources, /Quellentyp:/);

  const sourceGuard = await verifyRequiredSourceQuality(result.reelDirectory);
  assert.equal(sourceGuard.required, true);
  assert.equal(sourceGuard.requiredSchemaVersion, 3);
  assert.equal(sourceGuard.passed, false, 'Leere Schema-3-Vorlage darf nicht versehentlich als Quellen-QC bestehen.');
});
