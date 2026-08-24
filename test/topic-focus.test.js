import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function loadRules() {
  return JSON.parse(await readFile(new URL('../config/content-rules.json', import.meta.url), 'utf8'));
}

test('automatische Themenwahl verwendet ein offenes Themenuniversum statt drei harter Säulen', async () => {
  const rules = await loadRules();

  assert.equal(rules.topicFocus.openTopicUniverse, true);
  assert.equal(rules.topicFocus.autonomousSelectionLimitedToAllowedTopics, false);
  assert.equal(rules.topicFocus.allowedTopicsAreExamplesNotHardLimit, true);
  assert.equal(rules.allowedTopics.includes('Alltag und Gewohnheiten'), true);
  assert.equal(rules.allowedTopics.includes('Wissenschaft und Naturphänomene'), true);
  assert.equal(rules.allowedTopics.includes('Technik und digitale Welt'), true);
  assert.equal(rules.allowedTopics.includes('Gesundheit und Ernährung'), true);
  assert.equal(rules.allowedTopics.includes('Wirtschaft und Geldmechanismen'), true);
});

test('verhindert Themen-Bias nur auf Länder, Geschichte und Politik', async () => {
  const rules = await loadRules();

  assert.equal(rules.topicFocus.avoidRepeatedCountryHistoryBias, true);
  assert.ok(Array.isArray(rules.topicFocus.selectionCriteria));
  assert.ok(rules.topicFocus.selectionCriteria.length >= 5);
});

test('Bildwelt ist fest auf round-country-characters statt nach dem Script auswählbar', async () => {
  const rules = await loadRules();

  assert.equal(rules.visualRules.visualWorldMode, 'fixed');
  assert.equal(rules.visualRules.fixedVisualWorld, 'round-country-characters');
  assert.equal(rules.visualRules.selectVisualWorldAfterScript, false);
  assert.equal(rules.visualRules.creativeStyleBetweenReels, false);
});

test('nur Format-Risiken bleiben als autonome Ausschlüsse erhalten', async () => {
  const rules = await loadRules();

  assert.equal(rules.excludedTopics.includes('Körper und Biologie'), false);
  assert.equal(rules.excludedTopics.includes('Finanzen'), false);
  assert.equal(rules.excludedTopics.includes('Elektrotechnik'), false);
  assert.ok(rules.excludedTopics.some((value) => /Breaking-News/i.test(value)));
  assert.ok(rules.excludedTopics.some((value) => /Parteienwerbung|Propaganda/i.test(value)));
});
