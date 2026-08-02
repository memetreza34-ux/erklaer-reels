import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function loadRules() {
  return JSON.parse(await readFile(new URL('../config/content-rules.json', import.meta.url), 'utf8'));
}

test('begrenzt die automatische Themenwahl auf drei Content-Säulen', async () => {
  const rules = await loadRules();

  assert.deepEqual(rules.allowedTopics, [
    'Politik und Gesellschaft',
    'Länder, Geografie und Geschichte',
    'Psychologie und menschliches Verhalten'
  ]);
  assert.equal(rules.topicFocus.autonomousSelectionLimitedToAllowedTopics, true);
});

test('schließt Körper und Biologie als Content-Säule aus', async () => {
  const rules = await loadRules();

  assert.equal(rules.allowedTopics.includes('Körper und Biologie'), false);
  assert.equal(rules.excludedTopics.includes('Körper und Biologie'), true);
  assert.equal(rules.topicFocus.bodyAndBiologyExcludedAsContentPillar, true);
});
