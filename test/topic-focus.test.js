import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function loadFocus() {
  return JSON.parse(await readFile(new URL('../config/reel-topic-focus.json', import.meta.url), 'utf8'));
}

test('autonome Reel-Themenwahl umfasst nur Politik, Geografie und aktuelle Geopolitik', async () => {
  const focus = await loadFocus();
  assert.equal(focus.hardGateForAutonomousTopicSelection, true);
  assert.match(focus.channelPositioning, /Aktuelle Politik, Geografie/i);
  assert.ok(focus.preferredCategories.some((value) => /Politik/i.test(value)));
  assert.ok(focus.preferredCategories.some((value) => /Geografie/i.test(value)));
  assert.ok(focus.preferredCategories.some((value) => /Geopolitik/i.test(value)));
  assert.ok(focus.preferredCategories.every((value) => !/Geschichte|historisch|Ideologie/i.test(value)));
  assert.ok(focus.pausedByDefault.some((value) => /Geschichte/i.test(value)));
  assert.ok(focus.selectionRules.some((value) => /Quellen/i.test(value)));
  assert.ok(focus.selectionRules.some((value) => /Viralität/i.test(value)));
});

test('Gesundheit Alltag und Psychologie sind autonom pausiert', async () => {
  const focus = await loadFocus();
  assert.ok(focus.pausedByDefault.some((value) => /Gesundheit|Medizin/i.test(value)));
  assert.ok(focus.pausedByDefault.some((value) => /Psychologie/i.test(value)));
  assert.ok(focus.pausedByDefault.some((value) => /Alltags/i.test(value)));
  assert.equal(focus.explicitUserOverrideAllowed, true);
});

test('YouTube bleibt von Reel-Themenfokus unverändert', async () => {
  const focus = await loadFocus();
  assert.equal(focus.youtubeUnchanged, true);
});
