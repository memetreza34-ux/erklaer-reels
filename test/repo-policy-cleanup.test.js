import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

async function text(file) {
  return readFile(path.resolve(file), 'utf8');
}

async function exists(file) {
  try {
    await access(path.resolve(file));
    return true;
  } catch {
    return false;
  }
}

test('gefährliche Fake-QC- und Fake-Timing-Helfer sind aus dem aktiven Repo entfernt', async () => {
  const forbiddenRootHelpers = [
    'force-render-state.js',
    'approve-visuals.js',
    'confirm-assets.js',
    'do-sync.js',
    'auto-sync.js',
    'auto-cues.js',
    'fill-codex.js',
    'fix-content.js',
    'fix-narration.js',
    'fix-reel.js',
    'fill-ki-app-scenes.js'
  ];

  for (const file of forbiddenRootHelpers) {
    assert.equal(await exists(file), false, `${file} darf nicht wieder als aktiver Root-Helfer eingeführt werden.`);
  }
});

test('aktiver npm-Workflow bietet keinen normalen sync:words-Befehl mehr an', async () => {
  const packageJson = JSON.parse(await text('package.json'));

  assert.equal(packageJson.scripts['sync:words'], undefined);
  assert.equal(packageJson.scripts['legacy:sync:words'], 'node src/cli/sync-words.js');
});

test('alte Visual-World-Policy und Countryball-Style-Master sind entfernt', async () => {
  assert.equal(await exists('VISUAL_WORLD_POLICY.md'), false);
  assert.equal(await exists('knowledge/countryball-style-master.md'), false);
  assert.equal(await exists('test/kugelwelt-geometry-lock.test.js'), false);
});

test('README friert offene Themenwelt und unassigned Bildwelt ein', async () => {
  const readme = await text('README.md');

  assert.match(readme, /offenem Themenuniversum/i);
  assert.match(readme, /keine feste Bildwelt/i);
  assert.match(readme, /visualStyleId = null/);
  assert.match(readme, /00-bildprompts\/99-alle-bildprompts\.txt/);
});

test('Antigravity Policy enthält weder aktiven Word-Sync noch alten Flow-Einstieg', async () => {
  const policy = await text('ANTIGRAVITY_IMAGE_POLICY.md');

  assert.match(policy, /00-bildprompts\/99-alle-bildprompts\.txt/);
  assert.match(policy, /sync:words.*nicht erforderlich/is);
  assert.doesNotMatch(policy, /Untertitel-\/Word-Sync/);
});

test('Content-Regeln sind offen und besitzen keine feste Bildwelt', async () => {
  const rules = JSON.parse(await text('config/content-rules.json'));

  assert.equal(rules.topicFocus.openTopicUniverse, true);
  assert.equal(rules.topicFocus.autonomousSelectionLimitedToAllowedTopics, false);
  assert.equal(rules.visualRules.visualWorldMode, 'unassigned');
  assert.equal(rules.visualRules.fixedVisualWorld, null);
  assert.equal(rules.visualRules.selectVisualWorldAfterScript, false);
});

test('Image-Style-Konfiguration enthält keine aktive alte Stilwelt', async () => {
  const styles = JSON.parse(await text('config/image-styles.json'));

  assert.equal(styles.visualWorldMode, 'unassigned');
  assert.equal(styles.fixedVisualWorld, null);
  assert.deepEqual(styles.newReelAllowedStyleIds, []);
  assert.deepEqual(styles.styles, []);
  assert.deepEqual(styles.goldenReferencePaths, []);
});

test('sichtbare Technikansicht bietet Untertitel nicht mehr als aktiven Arbeitsbereich an', async () => {
  const humanView = await text('src/core/human-reel-view.js');

  assert.doesNotMatch(humanView, /99-technik\/UNTERTITEL/);
  assert.match(humanView, /Untertitel sind für neue Reels deaktiviert/);
});

test('Quality Gates enthalten keine tote Untertitel-Timing-Regel und keine Bildwelt-Sperre mehr', async () => {
  const gates = JSON.parse(await text('config/production-quality-gates.json'));

  assert.equal(gates.sceneTiming.subtitlesEndWithVoiceover, undefined);
  assert.equal(gates.visualContinuity.requireVisualWorldMatch, undefined);
  assert.equal(gates.visualContinuity.requireCharacterModelConsistency, undefined);
});
