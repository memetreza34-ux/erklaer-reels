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

  assert.equal(FIXED_VISUAL_STYLE_ID, 'modern-countryball-explainer');
  assert.equal(FIXED_VISUAL_WORLD_LABEL, 'Human Editorial Explainer');
  assert.match(FIXED_VISUAL_STYLE_REASON, /Human Editorial Explainer/);
  assert.equal(styles.visualWorldMode, 'fixed');
  assert.equal(styles.fixedVisualWorld, FIXED_VISUAL_STYLE_ID);
  assert.deepEqual(styles.newReelAllowedStyleIds, [FIXED_VISUAL_STYLE_ID]);
  assert.equal(styles.styles[0].name, 'Human Editorial Explainer');
  assert.equal(styles.styles[0].characterSystem.recognizablyHumanRequiredWhenPersonAppears, true);
  assert.equal(styles.styles[0].characterSystem.countryballCharactersForbidden, true);
  assert.equal(styles.styles[0].composition.clarityFirst, true);
  assert.equal(styles.styles[0].topicAdaptation.topicMayChangeVisualWorld, false);
  assert.equal(styles.styles[0].topicAdaptation.technicalCutawayDefault, false);
  assert.equal(contentRules.visualRules.visualWorldMode, 'fixed');
  assert.equal(contentRules.visualRules.fixedVisualWorld, FIXED_VISUAL_STYLE_ID);
  assert.equal(contentRules.visualRules.fixedVisualWorldLabel, 'Human Editorial Explainer');
  assert.equal(contentRules.visualRules.recognizablyHumanRequiredWhenPersonAppears, true);
  assert.equal(contentRules.visualRules.countryballCharactersForbidden, true);
  assert.equal(contentRules.visualRules.youtubeVisualWorldInheritanceForbidden, true);
});

test('Style-Lock erzwingt Menschen statt Countryballs und bleibt scene-first', () => {
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /vertical 9:16/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Human Editorial Explainer/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /recognizably HUMAN/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /head, necks?, torsos?, arms?, hands? and legs?/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /head, portrait, upper body, hands or a full body/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /never as a ball, sphere, countryball or stick figure/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /A human is NOT mandatory in every image/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Do not use countryball characters/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /topic create a new visual world/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Technical cutaways.*not the default/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /German only/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /No English visible text/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Do not borrow the separate YouTube visual world/i);
});

test('Style-Bibel dokumentiert genau eine menschliche Reel-Welt und YouTube-Trennung', async () => {
  const bible = await readFile(new URL('../knowledge/fixed-visual-world.md', import.meta.url), 'utf8');

  assert.match(bible, /eine verbindliche globale Bildwelt/i);
  assert.match(bible, /Human Editorial Explainer/i);
  assert.match(bible, /vereinfachte echte Menschen/i);
  assert.match(bible, /Kopf oder ein Portrait/i);
  assert.match(bible, /Ganzkörperfigur/i);
  assert.match(bible, /gar keinen Menschen/i);
  assert.match(bible, /nicht als Kugeln, Countryballs, Ball-Maskottchen oder Stick-Figuren/i);
  assert.match(bible, /Das Thema ändert nie die Bildwelt/i);
  assert.match(bible, /technische Cutaways/i);
  assert.match(bible, /YouTube-Langvideo-Bildwelt.*vollständig getrennt/i);
});
