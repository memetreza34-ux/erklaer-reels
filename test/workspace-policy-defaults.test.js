import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

async function text(file) { return readFile(path.resolve(file), 'utf8'); }
async function exists(file) {
  try { await access(path.resolve(file)); return true; } catch { return false; }
}

test('gefährliche Fake-QC- und Fake-Timing-Helfer sind aus dem aktiven Repo entfernt', async () => {
  const forbiddenRootHelpers = [
    'force-render-state.js', 'approve-visuals.js', 'confirm-assets.js', 'do-sync.js',
    'auto-sync.js', 'auto-cues.js', 'fill-codex.js', 'fix-content.js', 'fix-narration.js',
    'fix-reel.js', 'fill-ki-app-scenes.js'
  ];
  for (const file of forbiddenRootHelpers) assert.equal(await exists(file), false, `${file} darf nicht aktiv sein.`);
});

test('aktiver npm-Workflow bietet keinen normalen sync:words-Befehl an', async () => {
  const packageJson = JSON.parse(await text('package.json'));
  assert.equal(packageJson.scripts['sync:words'], undefined);
  assert.equal(packageJson.scripts['legacy:sync:words'], 'node src/cli/sync-words.js');
  assert.equal(packageJson.scripts['auto-align:reel'], 'node src/cli/auto-align-reel.js');
});

test('alte Visual-World-Policy und alter Countryball-Style-Master bleiben entfernt', async () => {
  assert.equal(await exists('VISUAL_WORLD_POLICY.md'), false);
  assert.equal(await exists('knowledge/countryball-style-master.md'), false);
  assert.equal(await exists('test/kugelwelt-geometry-lock.test.js'), false);
  assert.equal(await exists('knowledge/fixed-visual-world.md'), true);
});

test('README friert Themenfokus und neue feste Bildwelt ein', async () => {
  const readme = await text('README.md');
  assert.match(readme, /Politik, Geschichte, Geografie und Systeme/i);
  assert.match(readme, /feste Reel-Bildwelt/i);
  assert.match(readme, /serious-minimal-countryball-explainer/);
  assert.match(readme, /00-bildprompts\/99-alle-bildprompts\.txt/);
  assert.match(readme, /Simple Mode/i);
});

test('Content-Regeln und separate Fokusdatei besitzen die aktuelle Bildwelt/Themenregel', async () => {
  const rules = JSON.parse(await text('config/content-rules.json'));
  const focus = JSON.parse(await text('config/reel-topic-focus.json'));
  assert.equal(rules.visualRules.visualWorldMode, 'fixed');
  assert.equal(rules.visualRules.fixedVisualWorld, 'serious-minimal-countryball-explainer');
  assert.equal(focus.hardGateForAutonomousTopicSelection, true);
  assert.match(focus.channelPositioning, /Politik, Geschichte, Geografie und Systeme/);
  assert.ok(focus.pausedByDefault.some((value) => /Gesundheit|Medizin/i.test(value)));
});

test('Image-Style-Konfiguration enthält genau die aktive feste Bildwelt', async () => {
  const styles = JSON.parse(await text('config/image-styles.json'));
  assert.equal(styles.visualWorldMode, 'fixed');
  assert.equal(styles.fixedVisualWorld, 'serious-minimal-countryball-explainer');
  assert.deepEqual(styles.newReelAllowedStyleIds, ['serious-minimal-countryball-explainer']);
  assert.equal(styles.styles.length, 1);
  assert.equal(styles.styles[0].id, 'serious-minimal-countryball-explainer');
  assert.equal(styles.styles[0].promptLanguage, 'en');
  assert.equal(styles.styles[0].visibleTextLanguage, 'de');
  assert.equal(styles.styleBiblePath, 'knowledge/fixed-visual-world.md');
});

test('sichtbare Technikansicht bietet Untertitel nicht mehr als aktiven Arbeitsbereich an', async () => {
  const humanView = await text('src/core/human-reel-view.js');
  assert.doesNotMatch(humanView, /99-technik\/UNTERTITEL/);
  assert.match(humanView, /Untertitel sind für neue Reels deaktiviert/);
});

test('Quality Gates enthalten keine tote Untertitel-Timing-Regel und nutzen Fast-QC', async () => {
  const gates = JSON.parse(await text('config/production-quality-gates.json'));
  const visual = JSON.parse(await text('config/visual-quality-rules.json'));
  assert.equal(gates.sceneTiming.subtitlesEndWithVoiceover, undefined);
  assert.equal(gates.assetMatching.requireSecondPassConfirmation, false);
  assert.equal(visual.manualEvidence.requireSecondPassConfirmationForScenes, false);
});
