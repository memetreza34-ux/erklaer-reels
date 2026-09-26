import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const CURRENT_PROJECT = 'youtube/2026-KW39_21-09_bis_27-09/warum-ist-kaliningrad-von-russland-getrennt';
const TEMPLATE = 'youtube/templates/video-template';

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

test('neue YouTube-Projekte verwenden Premium Countryball V5 ohne Stilwechsel', async () => {
  const [policy, templatePrompt, templateMeta, projectMeta] = await Promise.all([
    readJson('config/youtube-channel-policy.json'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${CURRENT_PROJECT}/99-technik/video.json`)
  ]);

  assert.equal(policy.visualPolicyVersion, 5);
  assert.equal(policy.designQualityVersion, 1);
  assert.equal(policy.adaptivePacingVersion, 3);
  assert.equal(policy.visualStyleId, 'serious-minimal-countryball-explainer-youtube-16x9');
  assert.equal(policy.sourceVisualWorldId, 'serious-minimal-countryball-explainer');

  assert.equal(templateMeta.schemaVersion, 10);
  assert.equal(templateMeta.visualPolicyVersion, 5);
  assert.equal(templateMeta.designQualityVersion, 1);
  assert.equal(templateMeta.adaptivePacingVersion, 3);
  assert.equal(templateMeta.visualStyleId, policy.visualStyleId);
  assert.equal(templateMeta.sourceVisualWorldId, policy.sourceVisualWorldId);
  assert.equal(templateMeta.aspectRatio, '16:9');
  assert.equal(templateMeta.visualWorldParityPolicy.mustMatchReelVisualDNA, true);
  assert.equal(templateMeta.visualWorldParityPolicy.independentYoutubeStyle, false);

  // Existing Schema-9 project remains reproducible as V4.
  assert.equal(projectMeta.schemaVersion, 9);
  assert.equal(projectMeta.visualPolicyVersion, 4);
  assert.equal(projectMeta.visualStyleId, policy.visualStyleId);
  assert.equal(projectMeta.sourceVisualWorldId, policy.sourceVisualWorldId);

  assert.match(templatePrompt, /YOUTUBE_VISUAL_POLICY_VERSION: 5/);
  assert.match(templatePrompt, /DESIGN_QUALITY_VERSION: 1/);
  assert.match(templatePrompt, /ADAPTIVE_PACING_VERSION: 3/);
  assert.match(templatePrompt, /ACTIVE_STYLE_ID: serious-minimal-countryball-explainer-youtube-16x9/);
  assert.match(templatePrompt, /PREMIUM DESIGN LAYER V1/i);
  assert.match(templatePrompt, /Premium does NOT mean realistic/i);
});

test('Bild-zu-Bild-Referenzen bleiben auch in V5 verboten', async () => {
  const [policy, templatePrompt, projectPrompt, templateMeta, projectMeta] = await Promise.all([
    readJson('config/youtube-channel-policy.json'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${CURRENT_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${CURRENT_PROJECT}/99-technik/video.json`)
  ]);

  assert.equal(policy.sessionPolicy.previousGeneratedImageAsReferenceForbidden, true);
  for (const meta of [templateMeta, projectMeta]) {
    assert.equal(meta.masterReferencePolicy.masterImageNumber, null);
    assert.equal(meta.masterReferencePolicy.attachMasterToAllLaterImages, false);
    assert.equal(meta.independentImagePolicy.eachImageGeneratedFromOwnTextPrompt, true);
    assert.equal(meta.independentImagePolicy.previousGeneratedImageAsReferenceForbidden, true);
  }
  for (const prompt of [templatePrompt, projectPrompt]) {
    assert.match(prompt, /Do not use any previous generated image as a visual reference\./);
    assert.match(prompt, /SESSION RESET HARD LOCK/);
  }
});

test('Countryball-Akteure bleiben rund und normale Menschen verboten', async () => {
  const [policy, templatePrompt, templateMeta, projectMeta] = await Promise.all([
    readJson('config/youtube-channel-policy.json'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${CURRENT_PROJECT}/99-technik/video.json`)
  ]);

  assert.equal(policy.qualityPolicy.countryballVisualWorldRequired, true);
  assert.equal(policy.qualityPolicy.perfectlyRoundCountryballActorsRequired, true);
  assert.equal(policy.qualityPolicy.normalIllustratedHumansForbidden, true);
  assert.equal(policy.qualityPolicy.stickFiguresForbidden, true);

  for (const meta of [templateMeta, projectMeta]) {
    assert.equal(meta.visualQualityPolicy.seriousMinimalCountryballWorldRequired, true);
    assert.equal(meta.visualQualityPolicy.perfectlyRoundCountryballActorsRequired, true);
    assert.equal(meta.visualQualityPolicy.normalIllustratedHumansForbidden, true);
    assert.equal(meta.visualWorldParityPolicy.stickFiguresForbidden, true);
  }

  assert.match(templatePrompt, /perfectly round/i);
  assert.match(templatePrompt, /No normal illustrated humans/i);
  assert.match(templatePrompt, /No stick figures/i);
  assert.match(templatePrompt, /thick clean black outline/i);
});

test('V5 erzwingt hochwertigere Gestaltung innerhalb derselben Bildwelt', async () => {
  const [policy, templatePrompt, templateMeta] = await Promise.all([
    readJson('config/youtube-channel-policy.json'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`)
  ]);

  for (const key of [
    'premiumCompositionRequired',
    'intentionalPaletteRequired',
    'typographyHierarchyRequiredWhenTextPresent',
    'balancedNegativeSpaceRequired',
    'mapLegibilityRequired',
    'visualRelationshipOverIconListingRequired',
    'premiumDoesNotAuthorizeStyleChange'
  ]) {
    assert.equal(policy.qualityPolicy[key], true, `Policy fehlt ${key}`);
    assert.equal(templateMeta.visualQualityPolicy[key], true, `Template fehlt ${key}`);
  }

  assert.match(templatePrompt, /clear visual hierarchy/i);
  assert.match(templatePrompt, /one coherent main palette/i);
  assert.match(templatePrompt, /foreground \/ midground \/ background/i);
  assert.match(templatePrompt, /Premium does NOT mean realistic/i);
  assert.doesNotMatch(templatePrompt, /WRITTEN STYLE LOCK\s*[—-]\s*PREMIUM EDITORIAL/i);
});

test('V5 erlaubt mehr Bilder bei dichterem Inhalt statt starrer Bildzahl', async () => {
  const [policy, templatePrompt, templateMeta, pacing] = await Promise.all([
    readJson('config/youtube-channel-policy.json'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readFile('youtube/ADAPTIVE_PACING_V3.md', 'utf8')
  ]);

  assert.equal(policy.imageDensityPolicy.fixedImageCountForbidden, true);
  assert.equal(policy.imageDensityPolicy.allowMoreImagesWhenNarrativelyUseful, true);
  assert.equal(policy.imageDensityPolicy.doNotAddFillerImages, true);
  assert.equal(templateMeta.imageCountMethod, 'adaptive-density-v3-content-derived');
  assert.equal(templateMeta.imageDensityPolicy.fixedImageCountForbidden, true);
  assert.deepEqual(templateMeta.imageDensityPolicy.targetAverageHoldSeconds, [4.5, 7.5]);
  assert.equal(templateMeta.imageDensityPolicy.strongSplitReviewAboveSeconds, 11);
  assert.equal(templateMeta.imageDensityPolicy.globalHardMaximumSeconds, 16);

  assert.match(templatePrompt, /There is NO fixed target image count/i);
  assert.match(templatePrompt, /Complex information should be split across multiple elegant images/i);
  assert.match(pacing, /Mehr Bilder sind ausdrücklich erwünscht/i);
  assert.match(pacing, /keine feste Bildzahl/i);
});

test('deutsche YouTube-Projekte erzwingen weiterhin deutschen sichtbaren Bildtext', async () => {
  const [templatePrompt, templateMeta, projectMeta] = await Promise.all([
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${CURRENT_PROJECT}/99-technik/video.json`)
  ]);

  assert.match(templatePrompt, /Every readable word must be German/i);
  assert.match(templatePrompt, /HARD FAIL/i);
  assert.equal(templateMeta.visibleTextPolicy.germanProjectRequiresGermanOnly, true);
  assert.equal(templateMeta.visibleTextPolicy.englishVisibleTextHardFail, true);
  assert.equal(projectMeta.visibleTextPolicy.germanProjectRequiresGermanOnly, true);
  assert.equal(projectMeta.visibleTextPolicy.englishVisibleTextHardFail, true);
});
