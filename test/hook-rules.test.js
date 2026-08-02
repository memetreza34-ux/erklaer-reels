import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function loadRules() {
  return JSON.parse(await readFile(new URL('../config/content-rules.json', import.meta.url), 'utf8'));
}

test('bevorzugt direkte verständliche Erklär-Hooks', async () => {
  const rules = await loadRules();

  assert.equal(rules.hookRules.preferredPattern, 'THEMA einfach erklärt:');
  assert.equal(rules.hookRules.firstSeconds.topicNamedImmediately, true);
  assert.equal(rules.hookRules.firstSeconds.plainLanguageRequired, true);
  assert.equal(rules.hookRules.firstSeconds.answerBeginsImmediately, true);
});

test('vermeidet lange Einleitungen und leeren Clickbait', async () => {
  const rules = await loadRules();
  const avoided = rules.hookRules.avoid.join(' ');

  assert.match(avoided, /Heute erkläre ich dir/);
  assert.match(avoided, /Hast du dich schon einmal gefragt/);
  assert.match(avoided, /Clickbait/);
});
