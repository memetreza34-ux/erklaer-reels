import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const TIMEZONE_PROJECT = 'youtube/2026-KW39_21-09_bis_27-09/warum-gibt-es-zeitzonen';
const TEMPLATE = 'youtube/templates/video-template';

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

test('neue YouTube-Projekte verwenden die eigene Premium-Editorial-Bildwelt', async () => {
  const [visualWorld, workflow, templatePrompt, timezonePrompt, templateMeta, timezoneMeta] = await Promise.all([
    readFile('youtube/YOUTUBE_VISUAL_WORLD.md', 'utf8'),
    readFile('youtube/YOUTUBE_WORKFLOW.md', 'utf8'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${TIMEZONE_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${TIMEZONE_PROJECT}/99-technik/video.json`)
  ]);

  for (const text of [visualWorld, workflow, templatePrompt, timezonePrompt]) {
    assert.match(text, /premium editorial|Premium Editorial|Editorial-Erklärillustration|Editorial-Illustration/i);
    assert.match(text, /16:9/);
  }

  assert.equal(templateMeta.visualStyleId, 'premium-editorial-explainer-illustration-youtube-16x9');
  assert.equal(timezoneMeta.visualStyleId, 'premium-editorial-explainer-illustration-youtube-16x9');
  assert.equal(templateMeta.visualWorldParityPolicy.mustMatchReelVisualDNA, false);
  assert.equal(timezoneMeta.visualWorldParityPolicy.mustMatchReelVisualDNA, false);
});

test('neue YouTube-Bilder dürfen keine vorherigen Bilder als Referenz verwenden', async () => {
  const [visualWorld, workflow, templatePrompt, timezonePrompt, templateMeta, timezoneMeta] = await Promise.all([
    readFile('youtube/YOUTUBE_VISUAL_WORLD.md', 'utf8'),
    readFile('youtube/YOUTUBE_WORKFLOW.md', 'utf8'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${TIMEZONE_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${TIMEZONE_PROJECT}/99-technik/video.json`)
  ]);

  for (const text of [visualWorld, workflow, templatePrompt, timezonePrompt]) {
    assert.match(text, /kein.*Bild.*Referenz|no previous generated image as a visual reference|KEIN vorheriges Bild/i);
  }

  assert.equal(templateMeta.masterReferencePolicy.masterImageNumber, null);
  assert.equal(templateMeta.masterReferencePolicy.attachMasterToAllLaterImages, false);
  assert.equal(templateMeta.independentImagePolicy.eachImageGeneratedFromOwnTextPrompt, true);
  assert.equal(templateMeta.independentImagePolicy.previousGeneratedImageAsReferenceForbidden, true);

  assert.equal(timezoneMeta.masterReferencePolicy.masterImageNumber, null);
  assert.equal(timezoneMeta.masterReferencePolicy.attachMasterToAllLaterImages, false);
  assert.equal(timezoneMeta.independentImagePolicy.eachImageGeneratedFromOwnTextPrompt, true);
  assert.equal(timezoneMeta.independentImagePolicy.previousGeneratedImageAsReferenceForbidden, true);
});

test('jedes neue YouTube-Bild braucht eine eigenständige Komposition', async () => {
  const [visualWorld, templatePrompt, timezonePrompt, templateMeta, timezoneMeta] = await Promise.all([
    readFile('youtube/YOUTUBE_VISUAL_WORLD.md', 'utf8'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${TIMEZONE_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${TIMEZONE_PROJECT}/99-technik/video.json`)
  ]);

  for (const text of [visualWorld, templatePrompt, timezonePrompt]) {
    assert.match(text, /fresh composition|eigenständige.*Komposition|individuell/i);
    assert.match(text, /Perspektive|perspective/i);
    assert.match(text, /Layout|layout/i);
    assert.match(text, /Hintergrund|background/i);
  }

  assert.equal(templateMeta.independentImagePolicy.freshCompositionRequired, true);
  assert.equal(templateMeta.independentImagePolicy.repeatLayoutWithoutNarrativeReasonForbidden, true);
  assert.equal(timezoneMeta.independentImagePolicy.freshCompositionRequired, true);
  assert.equal(timezoneMeta.independentImagePolicy.repeatLayoutWithoutNarrativeReasonForbidden, true);
});

test('YouTube-Illustrationen verbieten billige Template- und Stickman-Optik', async () => {
  const [visualWorld, templatePrompt, timezonePrompt, templateMeta, timezoneMeta] = await Promise.all([
    readFile('youtube/YOUTUBE_VISUAL_WORLD.md', 'utf8'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${TIMEZONE_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${TIMEZONE_PROJECT}/99-technik/video.json`)
  ]);

  for (const text of [visualWorld, templatePrompt, timezonePrompt]) {
    assert.match(text, /Stickfigur|stick-figure/i);
    assert.match(text, /generic.*template|generische.*Schablone|generisches KI-Template|generic AI template/i);
    assert.match(text, /nicht kindisch|not childish/i);
  }

  assert.equal(templateMeta.visualWorldParityPolicy.stickFiguresForbidden, true);
  assert.equal(templateMeta.visualWorldParityPolicy.genericTemplateCompositionForbidden, true);
  assert.equal(timezoneMeta.visualWorldParityPolicy.stickFiguresForbidden, true);
  assert.equal(timezoneMeta.visualWorldParityPolicy.genericTemplateCompositionForbidden, true);
});

test('Countryballs sind bei neuen YouTube-Videos kein Standardcharakter mehr', async () => {
  const [visualWorld, workflow, timezonePrompt, templateMeta, timezoneMeta] = await Promise.all([
    readFile('youtube/YOUTUBE_VISUAL_WORLD.md', 'utf8'),
    readFile('youtube/YOUTUBE_WORKFLOW.md', 'utf8'),
    readFile(`${TIMEZONE_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${TIMEZONE_PROJECT}/99-technik/video.json`)
  ]);

  for (const text of [visualWorld, workflow, timezonePrompt]) {
    assert.match(text, /Countryball.*kein|kein Countryball|no mandatory countryball|Countryballs.*kein/i);
  }
  assert.equal(templateMeta.visualWorldParityPolicy.countryballAsDefaultForbidden, true);
  assert.equal(timezoneMeta.visualWorldParityPolicy.countryballAsDefaultForbidden, true);
});

test('deutsche YouTube-Projekte erzwingen weiterhin deutschen sichtbaren Bildtext', async () => {
  const [visualWorld, workflow, templatePrompt, timezonePrompt, templateMeta, timezoneMeta] = await Promise.all([
    readFile('youtube/YOUTUBE_VISUAL_WORLD.md', 'utf8'),
    readFile('youtube/YOUTUBE_WORKFLOW.md', 'utf8'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${TIMEZONE_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${TIMEZONE_PROJECT}/99-technik/video.json`)
  ]);

  for (const text of [visualWorld, workflow, templatePrompt, timezonePrompt]) {
    assert.match(text, /sichtbar.*Text.*Deutsch|readable word.*German|every readable.*German/i);
    assert.match(text, /Hard Fail|HARD FAIL/i);
  }
  assert.equal(templateMeta.visibleTextPolicy.germanProjectRequiresGermanOnly, true);
  assert.equal(templateMeta.visibleTextPolicy.englishVisibleTextHardFail, true);
  assert.equal(timezoneMeta.visibleTextPolicy.germanProjectRequiresGermanOnly, true);
  assert.equal(timezoneMeta.visibleTextPolicy.englishVisibleTextHardFail, true);
});
