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
  assert.equal(FIXED_VISUAL_WORLD_LABEL, 'Modern Countryball Explainer');
  assert.match(FIXED_VISUAL_STYLE_REASON, /Modern Countryball Explainer/);
  assert.equal(styles.visualWorldMode, 'fixed');
  assert.equal(styles.fixedVisualWorld, FIXED_VISUAL_STYLE_ID);
  assert.deepEqual(styles.newReelAllowedStyleIds, [FIXED_VISUAL_STYLE_ID]);
  assert.equal(styles.styles.length, 1);
  assert.equal(styles.styles[0].id, FIXED_VISUAL_STYLE_ID);
  assert.equal(styles.styles[0].name, FIXED_VISUAL_WORLD_LABEL);
  assert.equal(styles.styles[0].characterSystem.roundBallGeometryRequiredWhenActorAppears, true);
  assert.equal(styles.styles[0].characterSystem.separateHeadForbidden, true);
  assert.equal(styles.styles[0].characterSystem.actorNotMandatoryWhenObjectIsClearer, true);
  assert.equal(styles.styles[0].characterSystem.doNotForceDecorativeActor, true);
  assert.equal(styles.styles[0].characterSystem.humanHeadCharactersForbidden, true);
  assert.equal(styles.styles[0].characterSystem.ovalOrBeanShapedBodiesForbidden, true);
  assert.equal(styles.styles[0].characterSystem.flagsOnlyWhenGeographicallyRelevant, true);
  assert.equal(styles.styles[0].composition.clarityFirst, true);
  assert.equal(styles.styles[0].topicAdaptation.topicMayChangeVisualWorld, false);
  assert.equal(styles.styles[0].topicAdaptation.topicSpecificSubWorldsForbidden, true);
  assert.equal(styles.styles[0].topicAdaptation.technicalCutawayDefault, false);
  assert.equal(contentRules.visualRules.visualWorldMode, 'fixed');
  assert.equal(contentRules.visualRules.fixedVisualWorld, FIXED_VISUAL_STYLE_ID);
  assert.equal(contentRules.visualRules.fixedVisualWorldLabel, FIXED_VISUAL_WORLD_LABEL);
  assert.equal(contentRules.visualRules.roundBallGeometryRequiredWhenActorAppears, true);
  assert.equal(contentRules.visualRules.actorNotRequiredWhenObjectOrMechanismIsClearer, true);
  assert.equal(contentRules.visualRules.doNotForceDecorativeActor, true);
  assert.equal(contentRules.visualRules.humanHeadCharactersForbidden, true);
  assert.equal(contentRules.visualRules.ovalOrBeanShapedBodiesForbidden, true);
  assert.equal(contentRules.visualRules.topicSpecificSubVisualWorldsForbidden, true);
  assert.equal(contentRules.visualRules.youtubeVisualWorldInheritanceForbidden, true);
});

test('Style-Lock erzwingt Kugelwelt ohne Kugelpflicht in jedem Bild', () => {
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /vertical 9:16/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /exactly ONE fixed Reel visual world/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Modern Countryball Explainer/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /round countryball-style character/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /no separate head/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /simple expressive white eyes/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /never bean-shaped, oval, egg-shaped, human-headed or humanoid/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /only when geographic identity actually matters/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /An actor is NOT mandatory in every image/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Do not add a decorative ball/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /thick confident black outlines/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /topic changes only the subject matter, never the visual world/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Technical cutaways.*not the default/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /German only/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /No English visible text/i);
  assert.match(FIXED_VISUAL_WORLD_PROMPT, /Do not borrow the separate YouTube visual world/i);
});

test('Style-Bibel dokumentiert genau eine Kugel-Reel-Welt und YouTube-Trennung', async () => {
  const bible = await readFile(new URL('../knowledge/fixed-visual-world.md', import.meta.url), 'utf8');

  assert.match(bible, /eine und einzige verbindliche Reel-Bildwelt/i);
  assert.match(bible, /modern-countryball-explainer/i);
  assert.match(bible, /Modern Countryball Explainer/i);
  assert.match(bible, /Kugelgeometrie ist der wichtigste Figurenanker/i);
  assert.match(bible, /kein separater Kopf/i);
  assert.match(bible, /neutrale einfarbige Kugeln/i);
  assert.match(bible, /keinen Akteur/i);
  assert.match(bible, /Keine Kugelfigur dekorativ erzwingen/i);
  assert.match(bible, /Das Thema ändert nie die Bildwelt/i);
  assert.match(bible, /themenspezifische Unter-Bildwelten/i);
  assert.match(bible, /YouTube-Langvideo-Bildwelt.*vollständig getrennt/i);
});
