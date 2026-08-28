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

  assert.equal(FIXED_VISUAL_STYLE_ID, 'human-head-editorial-reel');
  assert.equal(FIXED_VISUAL_WORLD_LABEL, 'Human Head Editorial Reel');
  assert.match(FIXED_VISUAL_STYLE_REASON, /Human Head Editorial Reel/);
  assert.equal(styles.visualWorldMode, 'fixed');
  assert.equal(styles.fixedVisualWorld, FIXED_VISUAL_STYLE_ID);
  assert.deepEqual(styles.newReelAllowedStyleIds, [FIXED_VISUAL_STYLE_ID]);
  assert.equal(styles.styles.length, 1);
  assert.equal(styles.styles[0].id, FIXED_VISUAL_STYLE_ID);
  assert.equal(styles.styles[0].name, FIXED_VISUAL_WORLD_LABEL);
  assert.equal(styles.styles[0].characterSystem.recognizablyHumanRequiredWhenPersonAppears, true);
  assert.equal(styles.styles[0].characterSystem.humanNotMandatoryWhenObjectIsClearer, true);
  assert.equal(styles.styles[0].characterSystem.doNotForceDecorativeHuman, true);
  assert.equal(styles.styles[0].characterSystem.countryballCharactersForbidden, true);
  assert.equal(styles.styles[0].composition.clarityFirst, true);
  assert.equal(styles.styles[0].topicAdaptation.topicMayChangeVisualWorld, false);
  assert.equal(styles.styles[0].topicAdaptation.topicSpecificSubWorldsForbidden, true);
  assert.equal(styles.styles[0].topicAdaptation.technicalCutawayDefault, false);
  assert.equal(contentRules.visualRules.visualWorldMode, 'fixed');
  assert.equal(contentRules.visualRules.fixedVisualWorld, FIXED_VISUAL_STYLE_ID);
  assert.equal(contentRules.visualRules.fixedVisualWorldLabel, FIXED_VISUAL_WORLD_LABEL);
  assert.equal(contentRules.visualRules.recognizablyHumanRequiredWhenPersonAppears, true);
  assert.equal(contentRules.visualRules.humanNotRequiredWhenObjectOrMechanismIsClearer, true);
  assert.equal(contentRules.visualRules.doNotForceDecorativeHuman, true);
  assert.equal(contentRules.visualRules.countryballCharactersForbidden, true);
  assert.equal(contentRules.visualRules.topicSpecificSubVisualWorldsForbidden, true);
  assert.equal(contentRules.visualRules.youtubeVisualWorldInheritanceForbidden, true);
});

test('Style-Lock erzwingt Köpfe-/Menschenwelt ohne Menschenpflicht in jedem Bild', () => {
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /vertical 9:16/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /exactly ONE fixed Reel visual world/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Human Head Editorial Reel/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /recognizably human illustrated person/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /human head/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /head, a portrait, head and upper body, hands, or a full human body/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /A human is NOT mandatory in every image/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Do not add a decorative human/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Never use countryballs/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /topic changes only the subject matter, never the visual world/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Technical cutaways.*not the default/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /German only/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /No English visible text/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Do not borrow the separate YouTube visual world/i);
});

test('Style-Bibel dokumentiert genau eine Köpfe-/Menschen-Reel-Welt und YouTube-Trennung', async () => {
  const bible = await readFile(new URL('../knowledge/fixed-visual-world.md', import.meta.url), 'utf8');

  assert.match(bible, /eine und einzige verbindliche Reel-Bildwelt/i);
  assert.match(bible, /human-head-editorial-reel/i);
  assert.match(bible, /Human Head Editorial Reel/i);
  assert.match(bible, /menschliche Kopf- und Gesichtslogik/i);
  assert.match(bible, /Kopf \/ Close-up/i);
  assert.match(bible, /Ganzkörperfigur/i);
  assert.match(bible, /keinen Menschen/i);
  assert.match(bible, /Keinen Menschen dekorativ erzwingen/i);
  assert.match(bible, /Das Thema ändert nie die Bildwelt/i);
  assert.match(bible, /themenspezifische Unter-Bildwelten/i);
  assert.match(bible, /YouTube-Langvideo-Bildwelt.*vollständig getrennt/i);
});
