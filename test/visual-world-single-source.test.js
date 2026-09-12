import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function loadJson(relative) {
  return JSON.parse(await readFile(new URL(`../${relative}`, import.meta.url), 'utf8'));
}

test('autonome Themenwahl ist auf Politik Geschichte Geografie und Systeme fokussiert', async () => {
  const focus = await loadJson('config/reel-topic-focus.json');
  assert.equal(focus.hardGateForAutonomousTopicSelection, true);
  assert.equal(focus.scope, 'new-reels-only');
  assert.match(focus.channelPositioning, /Politik, Geschichte, Geografie und Systeme/);
  assert.ok(focus.preferredCategories.some((value) => /Politik/i.test(value)));
  assert.ok(focus.preferredCategories.some((value) => /Geschichte/i.test(value)));
  assert.ok(focus.preferredCategories.some((value) => /Geografie/i.test(value)));
  assert.ok(focus.preferredCategories.some((value) => /Ideologien/i.test(value)));
});

test('Gesundheit Psychologie Alltag und Lifestyle sind standardmäßig pausiert', async () => {
  const focus = await loadJson('config/reel-topic-focus.json');
  assert.ok(focus.pausedByDefault.some((value) => /Gesundheit|Medizin/i.test(value)));
  assert.ok(focus.pausedByDefault.some((value) => /Psychologie/i.test(value)));
  assert.ok(focus.pausedByDefault.some((value) => /Alltags/i.test(value)));
  assert.ok(focus.pausedByDefault.some((value) => /Lifestyle/i.test(value)));
  assert.equal(focus.explicitUserOverrideAllowed, true);
});

test('Bildwelt ist fest und wird nicht nach dem Script neu ausgewählt', async () => {
  const rules = await loadJson('config/content-rules.json');
  assert.equal(rules.visualRules.visualWorldMode, 'fixed');
  assert.equal(rules.visualRules.fixedVisualWorld, 'serious-minimal-countryball-explainer');
  assert.equal(rules.visualRules.selectVisualWorldAfterScript, false);
  assert.equal(rules.visualRules.consistentStyleWithinReel, true);
  assert.equal(rules.visualRules.creativeStyleBetweenReels, false);
  assert.equal(rules.visualRules.styleBiblePath, 'knowledge/fixed-visual-world.md');
});

test('Themenfokus verlangt Duplikatprüfung und neutrale Politik-Erklärung', async () => {
  const focus = await loadJson('config/reel-topic-focus.json');
  assert.ok(focus.selectionRules.some((value) => /THEMEN_HISTORIE/i.test(value)));
  assert.ok(focus.selectionRules.some((value) => /neutral|Parteienwerbung/i.test(value)));
  assert.ok(focus.selectionRules.some((value) => /Countryball/i.test(value)));
});
