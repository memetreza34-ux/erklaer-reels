import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function loadFocus() {
  return JSON.parse(await readFile(new URL('../config/reel-topic-focus.json', import.meta.url), 'utf8'));
}

test('autonome Reel-Themenwahl priorisiert Politik, erlaubt Begriffe, Ideologien, Geografie und Ursprünge', async () => {
  const focus = await loadFocus();
  assert.equal(focus.hardGateForAutonomousTopicSelection, true);
  assert.match(focus.channelPositioning, /Politik im Mittelpunkt/);
  assert.ok(focus.preferredCategories.some((value) => /Politik und Staatssysteme/i.test(value)));
  assert.ok(focus.preferredCategories.some((value) => /politische Bildung/i.test(value)));
  assert.ok(focus.preferredCategories.some((value) => /Ideologien/i.test(value)));
  assert.ok(focus.preferredCategories.some((value) => /Geografie/i.test(value)));
  assert.ok(focus.preferredCategories.some((value) => /Geopolitik/i.test(value)));
  assert.ok(focus.preferredCategories.some((value) => /Historische Ursprünge/i.test(value)));
  assert.ok(focus.pausedByDefault.some((value) => /Chronologien/i.test(value)));
  assert.ok(focus.selectionRules.some((value) => /News-Anlass erforderlich/i.test(value)));
  assert.ok(focus.selectionRules.some((value) => /Quellen/i.test(value)));
  assert.ok(focus.selectionRules.some((value) => /virales Potenzial/i.test(value)));
});

test('Gesundheit Alltag und Psychologie sind autonom pausiert', async () => {
  const focus = await loadFocus();
  assert.ok(focus.pausedByDefault.some((value) => /Gesundheit|Medizin/i.test(value)));
  assert.ok(focus.pausedByDefault.some((value) => /Psychologie/i.test(value)));
  assert.ok(focus.pausedByDefault.some((value) => /Alltags/i.test(value)));
  assert.equal(focus.explicitUserOverrideAllowed, true);
});

test('Reel-Bildregeln bleiben technisch getrennt vom YouTube-Workflow', async () => {
  const focus = await loadFocus();
  assert.equal(focus.youtubeUnchanged, true);
});
