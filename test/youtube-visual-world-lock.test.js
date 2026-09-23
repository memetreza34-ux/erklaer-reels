import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const ROM_PROJECT = 'youtube/2026-KW39_21-09_bis_27-09/warum-ging-das-roemische-reich-unter';
const TEMPLATE = 'youtube/templates/video-template';

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

test('YouTube verwendet verbindlich Universal Editorial Stickman World v1.2', async () => {
  const [visualWorld, workflow, templatePrompt, romanPrompt, templateMeta, romanMeta] = await Promise.all([
    readFile('youtube/YOUTUBE_VISUAL_WORLD.md', 'utf8'),
    readFile('youtube/YOUTUBE_WORKFLOW.md', 'utf8'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${ROM_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${ROM_PROJECT}/99-technik/video.json`)
  ]);

  for (const text of [visualWorld, workflow, templatePrompt, romanPrompt]) {
    assert.match(text, /universal-editorial-stickman-v1\.2|Universal Editorial Stickman World v1\.2/i);
  }
  assert.equal(templateMeta.visualStyleId, 'universal-editorial-stickman-v1.2');
  assert.equal(romanMeta.visualStyleId, 'universal-editorial-stickman-v1.2');
});

test('YouTube-Bildwelt blockiert beige Historien-Cartoon-Look und normale Cartoon-Menschen', async () => {
  const [visualWorld, templatePrompt, romanPrompt] = await Promise.all([
    readFile('youtube/YOUTUBE_VISUAL_WORLD.md', 'utf8'),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${ROM_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8')
  ]);

  for (const text of [visualWorld, templatePrompt, romanPrompt]) {
    assert.match(text, /beige\/sepia|beige.*sepia|sepia.*beige/i);
    assert.match(text, /no normal cartoon humans|normale.*Cartoon-Menschen/i);
    assert.match(text, /every visible human|jeder sichtbare Mensch/i);
    assert.match(text, /Stickman/i);
  }

  assert.doesNotMatch(templatePrompt, /warm slightly muted colors, subtle paper texture/i);
  assert.doesNotMatch(romanPrompt, /warm slightly muted colors, subtle paper texture/i);
});

test('Bild 01 ist Master-Style-Frame und wird für spätere Bilder als Referenz verwendet', async () => {
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
    assert.match(text, /Master-Style|Master-Referenz|Master reference|master-style/i);
    assert.match(text, /Referenz|reference/i);
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
    assert.match(text, /jeder.*sichtbar.*Text.*Deutsch|every readable word.*German|sichtbare.*Text.*Deutsch/i);
    assert.match(text, /Kartenlabel|map label/i);
    assert.match(text, /englisch|English/i);
    assert.match(text, /Hard Fail|HARD FAIL/i);
  }

  assert.equal(templateMeta.visibleTextPolicy.germanProjectRequiresGermanOnly, true);
  assert.equal(templateMeta.visibleTextPolicy.englishVisibleTextHardFail, true);
  assert.equal(romanMeta.visibleTextPolicy.germanProjectRequiresGermanOnly, true);
  assert.equal(romanMeta.visibleTextPolicy.englishVisibleTextHardFail, true);
});

test('Rom-Prompt nennt korrekte deutsche Kartenbegriffe statt englischer Standardlabels', async () => {
  const prompt = await readFile(`${ROM_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8');
  assert.match(prompt, /ATLANTISCHER OZEAN/);
  assert.match(prompt, /MITTELMEER/);
  assert.match(prompt, /SCHWARZES MEER/);
  assert.match(prompt, /RÖMISCHES REICH/);
  assert.match(prompt, /WEST \/ OST/);
  assert.match(prompt, /Do NOT automatically generate English map labels/i);
});
