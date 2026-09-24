import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const TIMEZONE_PROJECT = 'youtube/2026-KW39_21-09_bis_27-09/warum-gibt-es-zeitzonen';
const TEMPLATE = 'youtube/templates/video-template';

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

test('neue YouTube-Projekte verwenden die eigene Premium-Editorial-Bildwelt', async () => {
  const [policy, templatePrompt, timezonePrompt, templateMeta, timezoneMeta] = await Promise.all([
    readJson('config/youtube-channel-policy.json'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${TIMEZONE_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${TIMEZONE_PROJECT}/99-technik/video.json`)
  ]);

  assert.equal(policy.visualPolicyVersion, 3);
  assert.equal(policy.visualStyleId, 'premium-editorial-explainer-illustration-youtube-16x9');
  for (const meta of [templateMeta, timezoneMeta]) {
    assert.equal(meta.visualPolicyVersion, policy.visualPolicyVersion);
    assert.equal(meta.visualStyleId, policy.visualStyleId);
    assert.equal(meta.aspectRatio, '16:9');
    assert.equal(meta.visualWorldParityPolicy.mustMatchReelVisualDNA, false);
  }
  for (const prompt of [templatePrompt, timezonePrompt]) {
    assert.match(prompt, /YOUTUBE_VISUAL_POLICY_VERSION: 3/);
    assert.match(prompt, /ACTIVE_STYLE_ID: premium-editorial-explainer-illustration-youtube-16x9/);
    assert.match(prompt, /16:9/);
  }
});

test('neue YouTube-Bilder dürfen keine vorherigen Bilder als Referenz verwenden', async () => {
  const [policy, templatePrompt, timezonePrompt, templateMeta, timezoneMeta] = await Promise.all([
    readJson('config/youtube-channel-policy.json'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${TIMEZONE_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${TIMEZONE_PROJECT}/99-technik/video.json`)
  ]);

  assert.equal(policy.sessionPolicy.previousGeneratedImageAsReferenceForbidden, true);
  for (const meta of [templateMeta, timezoneMeta]) {
    assert.equal(meta.masterReferencePolicy.masterImageNumber, null);
    assert.equal(meta.masterReferencePolicy.attachMasterToAllLaterImages, false);
    assert.equal(meta.independentImagePolicy.eachImageGeneratedFromOwnTextPrompt, true);
    assert.equal(meta.independentImagePolicy.previousGeneratedImageAsReferenceForbidden, true);
  }
  for (const prompt of [templatePrompt, timezonePrompt]) {
    assert.match(prompt, /Do not use any previous generated image as a visual reference\./);
    assert.match(prompt, /SESSION RESET HARD LOCK/);
  }
});

test('jedes neue YouTube-Bild braucht eine eigenständige Komposition und echte Art Direction', async () => {
  const [policy, templatePrompt, timezonePrompt, templateMeta, timezoneMeta] = await Promise.all([
    readJson('config/youtube-channel-policy.json'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${TIMEZONE_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${TIMEZONE_PROJECT}/99-technik/video.json`)
  ]);

  assert.equal(policy.qualityPolicy.sceneSpecificArtDirectionRequired, true);
  assert.equal(policy.qualityPolicy.repeatedLayoutForbiddenWithoutNarrativeReason, true);
  for (const meta of [templateMeta, timezoneMeta]) {
    assert.equal(meta.independentImagePolicy.freshCompositionRequired, true);
    assert.equal(meta.independentImagePolicy.repeatLayoutWithoutNarrativeReasonForbidden, true);
    assert.equal(meta.independentImagePolicy.varyPerspectiveLayoutAndBackgroundWhenUseful, true);
    assert.equal(meta.visualQualityPolicy.sceneSpecificArtDirectionRequired, true);
  }
  for (const prompt of [templatePrompt, timezonePrompt]) {
    assert.match(prompt, /INDIVIDUALITY HARD LOCK/);
    assert.match(prompt, /fresh composition/i);
    assert.match(prompt, /perspective/i);
    assert.match(prompt, /layout/i);
    assert.match(prompt, /background/i);
  }
});

test('leblose, kindische und generische YouTube-Optik ist maschinenlesbar verboten', async () => {
  const [policy, templatePrompt, timezonePrompt, templateMeta, timezoneMeta] = await Promise.all([
    readJson('config/youtube-channel-policy.json'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${TIMEZONE_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${TIMEZONE_PROJECT}/99-technik/video.json`)
  ]);

  assert.equal(policy.qualityPolicy.lifelessStaticCompositionForbidden, true);
  assert.equal(policy.qualityPolicy.genericCenteredObjectOnBlankBackgroundForbiddenByDefault, true);
  assert.equal(policy.qualityPolicy.genericIconCollageForbidden, true);
  assert.equal(policy.qualityPolicy.childishCartoonLookForbidden, true);
  assert.equal(policy.qualityPolicy.stickFiguresForbidden, true);

  for (const meta of [templateMeta, timezoneMeta]) {
    assert.equal(meta.visualWorldParityPolicy.stickFiguresForbidden, true);
    assert.equal(meta.visualWorldParityPolicy.genericTemplateCompositionForbidden, true);
    assert.equal(meta.visualQualityPolicy.lifelessStaticCompositionForbidden, true);
    assert.equal(meta.visualQualityPolicy.genericCenteredObjectOnBlankBackgroundForbiddenByDefault, true);
    assert.equal(meta.visualQualityPolicy.childishCartoonLookForbidden, true);
  }

  for (const prompt of [templatePrompt, timezonePrompt]) {
    assert.match(prompt, /ANTI-LIFELESS HARD LOCK/);
    assert.match(prompt, /centered object/i);
    assert.match(prompt, /generic.*template/i);
    assert.match(prompt, /childish/i);
    assert.match(prompt, /stick/i);
  }
});

test('Countryballs sind bei neuen YouTube-Videos kein Standardcharakter mehr', async () => {
  const [policy, templateMeta, timezoneMeta] = await Promise.all([
    readJson('config/youtube-channel-policy.json'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${TIMEZONE_PROJECT}/99-technik/video.json`)
  ]);

  assert.equal(policy.qualityPolicy.countryballAsDefaultForbidden, true);
  assert.equal(templateMeta.visualWorldParityPolicy.countryballAsDefaultForbidden, true);
  assert.equal(timezoneMeta.visualWorldParityPolicy.countryballAsDefaultForbidden, true);
});

test('deutsche YouTube-Projekte erzwingen weiterhin deutschen sichtbaren Bildtext', async () => {
  const [templatePrompt, timezonePrompt, templateMeta, timezoneMeta] = await Promise.all([
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${TIMEZONE_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${TIMEZONE_PROJECT}/99-technik/video.json`)
  ]);

  for (const prompt of [templatePrompt, timezonePrompt]) {
    assert.match(prompt, /Every readable word.*German|Every readable.*German/i);
    assert.match(prompt, /HARD FAIL/i);
  }
  assert.equal(templateMeta.visibleTextPolicy.germanProjectRequiresGermanOnly, true);
  assert.equal(templateMeta.visibleTextPolicy.englishVisibleTextHardFail, true);
  assert.equal(timezoneMeta.visibleTextPolicy.germanProjectRequiresGermanOnly, true);
  assert.equal(timezoneMeta.visibleTextPolicy.englishVisibleTextHardFail, true);
});
