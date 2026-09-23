import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const ROM_PROJECT = 'youtube/2026-KW39_21-09_bis_27-09/warum-ging-das-roemische-reich-unter';
const TEMPLATE = 'youtube/templates/video-template';

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

test('YouTube übernimmt dieselbe Serious-Minimal-Countryball-Welt wie die Reels', async () => {
  const [reelStyles, visualWorld, workflow, templatePrompt, romanPrompt, templateMeta, romanMeta] = await Promise.all([
    readJson('config/image-styles.json'),
    readFile('youtube/YOUTUBE_VISUAL_WORLD.md', 'utf8'),
    readFile('youtube/YOUTUBE_WORKFLOW.md', 'utf8'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${ROM_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${ROM_PROJECT}/99-technik/video.json`)
  ]);

  assert.equal(reelStyles.fixedVisualWorld, 'serious-minimal-countryball-explainer');
  for (const text of [visualWorld, workflow, templatePrompt, romanPrompt]) {
    assert.match(text, /serious-minimal-countryball-explainer|Serious Minimal Countryball/i);
  }
  assert.equal(templateMeta.sourceVisualWorldId, 'serious-minimal-countryball-explainer');
  assert.equal(romanMeta.sourceVisualWorldId, 'serious-minimal-countryball-explainer');
  assert.equal(templateMeta.visualStyleId, 'serious-minimal-countryball-explainer-youtube-16x9');
  assert.equal(romanMeta.visualStyleId, 'serious-minimal-countryball-explainer-youtube-16x9');
});

test('YouTube ändert an der Reel-Welt nur das Seitenverhältnis auf 16:9', async () => {
  const [visualWorld, templateMeta, romanMeta] = await Promise.all([
    readFile('youtube/YOUTUBE_VISUAL_WORLD.md', 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${ROM_PROJECT}/99-technik/video.json`)
  ]);

  assert.match(visualWorld, /einzige.*Formatabweichung|einzige Formatänderung/i);
  assert.match(visualWorld, /16:9/);
  assert.match(visualWorld, /9:16/);
  assert.equal(templateMeta.aspectRatio, '16:9');
  assert.equal(romanMeta.aspectRatio, '16:9');
  assert.equal(templateMeta.visualWorldParityPolicy.mustMatchReelVisualDNA, true);
  assert.equal(romanMeta.visualWorldParityPolicy.mustMatchReelVisualDNA, true);
  assert.equal(templateMeta.visualWorldParityPolicy.onlyAllowedFormatDifference, '16:9-horizontal-instead-of-9:16-vertical');
  assert.equal(romanMeta.visualWorldParityPolicy.onlyAllowedFormatDifference, '16:9-horizontal-instead-of-9:16-vertical');
});

test('YouTube-Countryball-Welt erzwingt runde Kugeln und verbietet Stickfiguren', async () => {
  const [visualWorld, templatePrompt, romanPrompt, templateMeta, romanMeta] = await Promise.all([
    readFile('youtube/YOUTUBE_VISUAL_WORLD.md', 'utf8'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${ROM_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${ROM_PROJECT}/99-technik/video.json`)
  ]);

  for (const text of [visualWorld, templatePrompt, romanPrompt]) {
    assert.match(text, /Countryball/i);
    assert.match(text, /perfekt runder|perfectly round/i);
    assert.match(text, /weiße Augen|white eyes/i);
    assert.match(text, /schwarze Konturen|black outlines/i);
    assert.match(text, /Stickfiguren|stick figures/i);
  }

  assert.equal(templateMeta.visualWorldParityPolicy.stickFiguresForbidden, true);
  assert.equal(romanMeta.visualWorldParityPolicy.stickFiguresForbidden, true);
  assert.equal(templateMeta.visualWorldParityPolicy.roundCountryballGeometryRequiredWhenActorAppears, true);
  assert.equal(romanMeta.visualWorldParityPolicy.roundCountryballGeometryRequiredWhenActorAppears, true);
});

test('YouTube-Countryball-Welt behält Reel-Kompositionslogik mit maximal drei typischen Props', async () => {
  const [visualWorld, templatePrompt, romanPrompt, templateMeta, romanMeta] = await Promise.all([
    readFile('youtube/YOUTUBE_VISUAL_WORLD.md', 'utf8'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${ROM_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${ROM_PROJECT}/99-technik/video.json`)
  ]);

  for (const text of [visualWorld, templatePrompt, romanPrompt]) {
    assert.match(text, /0–3|zero to three/i);
    assert.match(text, /dominant/i);
    assert.match(text, /Minimal Symbolic/i);
    assert.match(text, /Supported Explainer/i);
    assert.match(text, /Simple Mini Scene/i);
  }
  assert.equal(templateMeta.visualWorldParityPolicy.maxSupportingPropsTypical, 3);
  assert.equal(romanMeta.visualWorldParityPolicy.maxSupportingPropsTypical, 3);
});

test('Bild 01 bleibt Master-Style-Frame für alle folgenden Bilder', async () => {
  const [visualWorld, workflow, templatePrompt, romanPrompt, templateMeta, romanMeta] = await Promise.all([
    readFile('youtube/YOUTUBE_VISUAL_WORLD.md', 'utf8'),
    readFile('youtube/YOUTUBE_WORKFLOW.md', 'utf8'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${ROM_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${ROM_PROJECT}/99-technik/video.json`)
  ]);

  for (const text of [visualWorld, workflow, templatePrompt, romanPrompt]) {
    assert.match(text, /Bild 01/i);
    assert.match(text, /Master-Style|Master-Referenz|master reference|Master-Style-Frame/i);
  }
  assert.equal(templateMeta.masterReferencePolicy.masterImageNumber, 1);
  assert.equal(templateMeta.masterReferencePolicy.attachMasterToAllLaterImages, true);
  assert.equal(romanMeta.masterReferencePolicy.masterImageNumber, 1);
  assert.equal(romanMeta.masterReferencePolicy.attachMasterToAllLaterImages, true);
});

test('Deutsche YouTube-Projekte erzwingen deutschen sichtbaren Bildtext', async () => {
  const [visualWorld, workflow, templatePrompt, romanPrompt, templateMeta, romanMeta] = await Promise.all([
    readFile('youtube/YOUTUBE_VISUAL_WORLD.md', 'utf8'),
    readFile('youtube/YOUTUBE_WORKFLOW.md', 'utf8'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${ROM_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${ROM_PROJECT}/99-technik/video.json`)
  ]);

  for (const text of [visualWorld, workflow, templatePrompt, romanPrompt]) {
    assert.match(text, /sichtbar.*Text.*Deutsch|readable word.*German/i);
    assert.match(text, /Kartenlabel|map labels/i);
    assert.match(text, /Hard Fail|HARD FAIL/i);
  }
  assert.equal(templateMeta.visibleTextPolicy.germanProjectRequiresGermanOnly, true);
  assert.equal(templateMeta.visibleTextPolicy.englishVisibleTextHardFail, true);
  assert.equal(romanMeta.visibleTextPolicy.germanProjectRequiresGermanOnly, true);
  assert.equal(romanMeta.visibleTextPolicy.englishVisibleTextHardFail, true);
});

test('Rom-Prompt enthält keinen aktiven Stickman-Stil mehr', async () => {
  const prompt = await readFile(`${ROM_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8');
  assert.doesNotMatch(prompt, /Universal Editorial Stickman World/i);
  assert.doesNotMatch(prompt, /minimalist stickman Roman|stickman citizens|stickman soldiers/i);
  assert.match(prompt, /no stick figures/i);
  assert.match(prompt, /Countryball/i);
  assert.match(prompt, /ATLANTISCHER OZEAN/);
  assert.match(prompt, /MITTELMEER/);
  assert.match(prompt, /SCHWARZES MEER/);
  assert.match(prompt, /RÖMISCHES REICH/);
  assert.match(prompt, /WEST \/ OST/);
});
