import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  FIXED_VISUAL_STYLE_ID,
  FIXED_VISUAL_STYLE_REASON,
  FIXED_VISUAL_WORLD_LABEL,
  FIXED_VISUAL_WORLD_PROMPT
} from '../src/shared/fixed-visual-world.js';

test('feste Bildwelt ist in Runtime und Config identisch verdrahtet', async () => {
  const styles = JSON.parse(await readFile(new URL('../config/image-styles.json', import.meta.url), 'utf8'));
  const contentRules = JSON.parse(await readFile(new URL('../config/content-rules.json', import.meta.url), 'utf8'));

  assert.equal(FIXED_VISUAL_STYLE_ID, 'serious-minimal-countryball-explainer');
  assert.equal(FIXED_VISUAL_WORLD_LABEL, 'Serious Minimal Countryball Explainer');
  assert.match(FIXED_VISUAL_STYLE_REASON, /Serious|seriöse/i);
  assert.equal(styles.visualWorldMode, 'fixed');
  assert.equal(styles.fixedVisualWorld, FIXED_VISUAL_STYLE_ID);
  assert.deepEqual(styles.newReelAllowedStyleIds, [FIXED_VISUAL_STYLE_ID]);
  assert.equal(styles.styles.length, 1);
  assert.equal(styles.styles[0].id, FIXED_VISUAL_STYLE_ID);
  assert.equal(styles.styles[0].name, FIXED_VISUAL_WORLD_LABEL);
  assert.equal(styles.styles[0].characterSystem.roundBallGeometryRequiredWhenActorAppears, true);
  assert.equal(styles.styles[0].characterSystem.separateHeadForbidden, true);
  assert.equal(styles.styles[0].characterSystem.actorNotMandatoryWhenObjectOrSymbolIsClearer, true);
  assert.equal(styles.styles[0].characterSystem.tinyDecorativeBallForbidden, true);
  assert.equal(styles.styles[0].characterSystem.flagsOnlyWhenGeographicallyRelevant, true);
  assert.equal(styles.styles[0].composition.oneDominantFocalSubject, true);
  assert.deepEqual(styles.styles[0].composition.compositionModes, ['minimal-symbolic', 'supported-explainer', 'simple-mini-scene']);
  assert.equal(styles.styles[0].topicAdaptation.topicMayChangeVisualWorld, false);
  assert.equal(contentRules.visualRules.visualWorldMode, 'fixed');
  assert.equal(contentRules.visualRules.fixedVisualWorld, FIXED_VISUAL_STYLE_ID);
  assert.equal(contentRules.visualRules.fixedVisualWorldLabel, FIXED_VISUAL_WORLD_LABEL);
});

test('Style-Lock beschreibt die Serious-Minimal-Countryball-Welt eindeutig', () => {
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /vertical 9:16/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /exactly ONE fixed Reel visual world/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Serious Minimal Countryball Explainer/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /perfectly round countryball-like character/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /no separate human head/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /simple white eyes/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /only when geography, politics, nationality or cultural identity actually matters/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /A ball character is optional/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /tiny decorative ball/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /thick clean black outlines/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /minimal-symbolic/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /supported-explainer/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /simple-mini-scene/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Visible text must be German only/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Do not borrow the separate YouTube visual world/i);
});

test('Style-Bibel dokumentiert neue feste Reel-Welt und YouTube-Trennung', async () => {
  const bible = await readFile(new URL('../knowledge/fixed-visual-world.md', import.meta.url), 'utf8');
  assert.match(bible, /Serious Minimal Countryball Explainer/i);
  assert.match(bible, /serious-minimal-countryball-explainer/i);
  assert.match(bible, /perfekt rund|runde Kugel/i);
  assert.match(bible, /Mini-Kugeln|Deko/i);
  assert.match(bible, /YouTube/i);
});
