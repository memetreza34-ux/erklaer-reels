import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  FIXED_VISUAL_STYLE_ID,
  FIXED_VISUAL_STYLE_REASON,
  FIXED_VISUAL_WORLD_PROMPT
} from '../src/shared/fixed-visual-world.js';

test('feste Bildwelt ist in Runtime und Config identisch verdrahtet', async () => {
  const styles = JSON.parse(await readFile(new URL('../config/image-styles.json', import.meta.url), 'utf8'));
  const contentRules = JSON.parse(await readFile(new URL('../config/content-rules.json', import.meta.url), 'utf8'));

  assert.equal(FIXED_VISUAL_STYLE_ID, 'modern-countryball-explainer');
  assert.match(FIXED_VISUAL_STYLE_REASON, /Globale feste Bildwelt/);
  assert.equal(styles.visualWorldMode, 'fixed');
  assert.equal(styles.fixedVisualWorld, FIXED_VISUAL_STYLE_ID);
  assert.deepEqual(styles.newReelAllowedStyleIds, [FIXED_VISUAL_STYLE_ID]);
  assert.equal(contentRules.visualRules.visualWorldMode, 'fixed');
  assert.equal(contentRules.visualRules.fixedVisualWorld, FIXED_VISUAL_STYLE_ID);
  assert.equal(contentRules.visualRules.promptLanguage, 'en');
  assert.equal(contentRules.visualRules.visibleTextLanguage, 'de');
});

test('Style-Lock enthält die zentralen visuellen Regeln', () => {
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /vertical 9:16/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /countryball-inspired/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /round ball characters/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /thick clean black outlines/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /flat 2D vector-like rendering/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /German only/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /No English visible text/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Do not use realistic humans/i);
});

test('Style-Bibel dokumentiert Themenunabhängigkeit und deutsche Bildtexte', async () => {
  const bible = await readFile(new URL('../knowledge/fixed-visual-world.md', import.meta.url), 'utf8');

  assert.match(bible, /verbindliche globale Bildwelt/i);
  assert.match(bible, /unabhängig vom Thema/i);
  assert.match(bible, /sichtbarer Bildtext ist immer Deutsch/i);
  assert.match(bible, /Prompts werden auf Englisch/i);
  assert.match(bible, /keine realistischen Menschen/i);
});
