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
  assert.equal(contentRules.visualRules.sceneFirstCompositionRequired, true);
  assert.equal(contentRules.visualRules.genericIconBoardForbidden, true);
  assert.equal(contentRules.visualRules.genericFloatingCardsForbidden, true);
  assert.equal(contentRules.visualRules.youtubeVisualWorldInheritanceForbidden, true);
});

test('Style-Lock enthält die zentralen verbesserten Reel-Regeln', () => {
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /vertical 9:16/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /scene-first editorial countryball-inspired/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /hand-drawn 2D vector-cartoon hybrid/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /concrete mini-scene/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /round countryball-like character/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /thick slightly organic black outlines/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Avoid generic floating reaction cards/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Never use generic praise\/criticism cards as a default/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Never duplicate the same headline/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /German only/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /No English visible text/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Do not use realistic humans/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Do not borrow the separate YouTube visual world/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /no thin-line stick figures/i);
});

test('Style-Bibel dokumentiert Szenenlogik, Anti-Generic-Regeln und YouTube-Trennung', async () => {
  const bible = await readFile(new URL('../knowledge/fixed-visual-world.md', import.meta.url), 'utf8');

  assert.match(bible, /verbindliche globale Bildwelt/i);
  assert.match(bible, /unabhängig vom Thema/i);
  assert.match(bible, /Erst eine konkrete Szene bauen/i);
  assert.match(bible, /Szenen statt Icon-Karten/i);
  assert.match(bible, /Anti-Generic-Regeln/i);
  assert.match(bible, /Nicht automatisch eine leere beige Kugel/i);
  assert.match(bible, /YouTube-Langvideo-Bildwelt.*vollständig getrennt/i);
  assert.match(bible, /sichtbarer Bildtext ist immer Deutsch/i);
  assert.match(bible, /Prompts werden auf Englisch/i);
  assert.match(bible, /realistische Menschen/i);
});
