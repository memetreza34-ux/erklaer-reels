import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const CURRENT_PROJECT = 'youtube/2026-KW39_21-09_bis_27-09/warum-ist-kaliningrad-von-russland-getrennt';
const TEMPLATE = 'youtube/templates/video-template';

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

test('neue YouTube-Projekte verwenden wieder die Serious-Minimal-Countryball-Bildwelt', async () => {
  const [policy, templatePrompt, projectPrompt, templateMeta, projectMeta] = await Promise.all([
    readJson('config/youtube-channel-policy.json'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${CURRENT_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${CURRENT_PROJECT}/99-technik/video.json`)
  ]);

  assert.equal(policy.visualPolicyVersion, 4);
  assert.equal(policy.visualStyleId, 'serious-minimal-countryball-explainer-youtube-16x9');
  assert.equal(policy.sourceVisualWorldId, 'serious-minimal-countryball-explainer');

  for (const meta of [templateMeta, projectMeta]) {
    assert.equal(meta.visualPolicyVersion, 4);
    assert.equal(meta.visualStyleId, policy.visualStyleId);
    assert.equal(meta.sourceVisualWorldId, policy.sourceVisualWorldId);
    assert.equal(meta.aspectRatio, '16:9');
    assert.equal(meta.visualWorldParityPolicy.mustMatchReelVisualDNA, true);
    assert.equal(meta.visualWorldParityPolicy.independentYoutubeStyle, false);
    assert.equal(meta.visualWorldParityPolicy.countryballVisualWorldRequired, true);
  }

  for (const prompt of [templatePrompt, projectPrompt]) {
    assert.match(prompt, /YOUTUBE_VISUAL_POLICY_VERSION: 4/);
    assert.match(prompt, /ACTIVE_STYLE_ID: serious-minimal-countryball-explainer-youtube-16x9/);
    assert.match(prompt, /SERIOUS MINIMAL COUNTRYBALL/i);
    assert.match(prompt, /16:9/);
  }
});

test('alte Bildwelt ist zurück, aber Bild-zu-Bild-Referenzen bleiben verboten', async () => {
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

test('Countryball-Akteure sind rund und normale Menschen bleiben verboten', async () => {
  const [policy, templatePrompt, projectPrompt, templateMeta, projectMeta] = await Promise.all([
    readJson('config/youtube-channel-policy.json'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${CURRENT_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
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

  for (const prompt of [templatePrompt, projectPrompt]) {
    assert.match(prompt, /perfectly round/i);
    assert.match(prompt, /no normal illustrated humans/i);
    assert.match(prompt, /no stick figures/i);
    assert.match(prompt, /thick clean black outline/i);
  }
});

test('minimal bleibt lebendig ohne in Premium-Editorial oder Realismus zu wechseln', async () => {
  const [policy, templatePrompt, projectPrompt, templateMeta, projectMeta] = await Promise.all([
    readJson('config/youtube-channel-policy.json'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${CURRENT_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${CURRENT_PROJECT}/99-technik/video.json`)
  ]);

  assert.equal(policy.qualityPolicy.lifelessStaticCompositionForbidden, true);
  assert.equal(policy.qualityPolicy.genericCenteredObjectOnBlankBackgroundForbiddenByDefault, true);
  assert.equal(policy.qualityPolicy.genericIconCollageForbidden, true);
  assert.equal(policy.qualityPolicy.childishCartoonLookForbidden, true);

  for (const meta of [templateMeta, projectMeta]) {
    assert.equal(meta.visualQualityPolicy.lifelessStaticCompositionForbidden, true);
    assert.equal(meta.visualQualityPolicy.genericCenteredObjectOnBlankBackgroundForbiddenByDefault, true);
    assert.equal(meta.visualQualityPolicy.childishCartoonLookForbidden, true);
  }

  for (const prompt of [templatePrompt, projectPrompt]) {
    assert.match(prompt, /ANTI-LIFELESS HARD LOCK/);
    assert.match(prompt, /Minimal does NOT mean lifeless/i);
    assert.doesNotMatch(prompt, /WRITTEN STYLE LOCK\s*[—-]\s*PREMIUM EDITORIAL/i);
    assert.match(prompt, /No photorealism|no photorealism/i);
  }
});

test('deutsche YouTube-Projekte erzwingen weiterhin deutschen sichtbaren Bildtext', async () => {
  const [templatePrompt, projectPrompt, templateMeta, projectMeta] = await Promise.all([
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${CURRENT_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${CURRENT_PROJECT}/99-technik/video.json`)
  ]);

  for (const prompt of [templatePrompt, projectPrompt]) {
    assert.match(prompt, /Every readable word.*German|Every readable.*German/i);
    assert.match(prompt, /HARD FAIL/i);
  }
  assert.equal(templateMeta.visibleTextPolicy.germanProjectRequiresGermanOnly, true);
  assert.equal(templateMeta.visibleTextPolicy.englishVisibleTextHardFail, true);
  assert.equal(projectMeta.visibleTextPolicy.germanProjectRequiresGermanOnly, true);
  assert.equal(projectMeta.visibleTextPolicy.englishVisibleTextHardFail, true);
});
