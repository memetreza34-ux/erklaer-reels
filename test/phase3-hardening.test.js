import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { checkExternalTools, checkRequiredRepoFiles } from '../src/cli/preflight.js';

test('Preflight erkennt vorhandene und fehlende externe Werkzeuge', () => {
  const found = checkExternalTools([
    { command: process.execPath, args: ['--version'], purpose: 'Node-Test' }
  ]);
  assert.deepEqual(found.missing, []);
  assert.deepEqual(found.found, [process.execPath]);

  const missing = checkExternalTools([
    { command: '__erklaer_reels_tool_das_nicht_existiert__', args: [], purpose: 'Negativtest' }
  ]);
  assert.equal(missing.missing.length, 1);
  assert.deepEqual(missing.found, []);
});

test('Preflight prüft zentrale Repo-Dateien', async () => {
  const result = await checkRequiredRepoFiles([
    'config/content-rules.json',
    'config/effects-rules.json',
    'config/production-quality-gates.json',
    'config/sound-library.json',
    'config/visual-quality-rules.json'
  ]);
  assert.deepEqual(result.missing, []);
});

test('Phase 3 führt Preflight und strenge Inhaltsprüfung vor Produktionsschritten aus', async () => {
  const source = await readFile('src/cli/phase3-reel.js', 'utf8');

  assert.match(source, /await runPreflight\(\)/);
  assert.match(source, /label:\s*'Inhalt strikt vorprüfen'/);
  assert.match(source, /script:\s*'check:content'/);
  assert.match(source, /args:\s*\['--strict'\]/);

  const contentGate = source.indexOf("label: 'Inhalt strikt vorprüfen'");
  const productionLoop = source.indexOf('for (const step of steps.slice(startIndex))');
  assert.ok(contentGate >= 0 && productionLoop > contentGate, 'Content-Gate muss vor dem Produktionsloop liegen.');
});

test('Phase 3 unterstützt kontrollierten Wiedereinstieg ohne Pflicht-Gates zu überspringen', async () => {
  const source = await readFile('src/cli/phase3-reel.js', 'utf8');

  assert.match(source, /getArgument\('--from'\)/);
  assert.match(source, /--list-steps/);
  assert.match(source, /steps\.slice\(startIndex\)/);
  assert.match(source, /Preflight \+ check:content --strict/);
});

test('Package verlangt dieselbe Node-Hauptversion wie die CI', async () => {
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  const workflow = await readFile('.github/workflows/node-ci.yml', 'utf8');

  assert.equal(pkg.engines.node, '>=24');
  assert.match(workflow, /node-version:\s*24/);
  assert.equal(pkg.scripts['preflight:reel'], 'node src/cli/preflight.js');
});
