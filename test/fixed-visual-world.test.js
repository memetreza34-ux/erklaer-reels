import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  FIXED_VISUAL_STYLE_ID,
  FIXED_VISUAL_STYLE_REASON,
  FIXED_VISUAL_WORLD_LABEL,
  FIXED_VISUAL_WORLD_PROMPT
} from '../src/shared/fixed-visual-world.js';

test('Runtime, Config und Content-Regeln verwenden die neue feste Reel-Bildwelt', async () => {
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
  assert.equal(contentRules.visualRules.fixedVisualWorld, FIXED_VISUAL_STYLE_ID);
  assert.equal(contentRules.visualRules.youtubeVisualWorldInheritanceForbidden, true);
});

test('Style-Lock beschreibt die Serious-Minimal-Countryball-Welt', () => {
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /vertical 9:16/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Serious Minimal Countryball Explainer/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /round countryball/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /thick clean black outlines/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /one to three meaningful supporting elements|one to three relevant/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /not mandatory|optional/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /German only/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Do not borrow the separate YouTube visual world/i);
});

test('Style-Bibel dokumentiert die aktive Welt und YouTube-Trennung', async () => {
  const bible = await readFile(new URL('../knowledge/fixed-visual-world.md', import.meta.url), 'utf8');
  assert.match(bible, /serious-minimal-countryball-explainer/i);
  assert.match(bible, /Serious Minimal Countryball Explainer/i);
  assert.match(bible, /YouTube/i);
});
