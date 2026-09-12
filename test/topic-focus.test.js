import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function loadFocus() {
  return JSON.parse(await readFile(new URL('../config/reel-topic-focus.json', import.meta.url), 'utf8'));
}

test('autonome Themenwahl ist auf Politik Geschichte Geografie und Systeme fokussiert', async () => {
  const focus = await loadFocus();
  assert.equal(focus.hardGateForAutonomousTopicSelection, true);
  assert.match(focus.channelPositioning, /Politik, Geschichte, Geografie und Systeme/i);
  assert.ok(focus.preferredCategories.some((value) => /Politik/i.test(value)));
  assert.ok(focus.preferredCategories.some((value) => /Geschichte/i.test(value)));
  assert.ok(focus.preferredCategories.some((value) => /Geografie/i.test(value)));
  assert.ok(focus.preferredCategories.some((value) => /Ideologien/i.test(value)));
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
