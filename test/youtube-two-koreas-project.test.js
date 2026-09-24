import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const PROJECT = 'youtube/2026-KW39_21-09_bis_27-09/warum-gibt-es-zwei-koreas';

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

test('Zwei-Koreas-Projekt liegt im Kanalfokus und zielt auf ca. 2,5 Minuten', async () => {
  const [meta, script] = await Promise.all([
    readFile(`${PROJECT}/99-technik/video.json`, 'utf8').then(JSON.parse),
    readFile(`${PROJECT}/01-voice-script/voice-script.txt`, 'utf8')
  ]);

  assert.equal(meta.topicCategory, 'internationale Beziehungen und Geopolitik');
  assert.equal(meta.targetDurationSeconds, 150);
  assert.deepEqual(meta.targetDurationRangeSeconds, [142, 158]);
  assert.equal(meta.scriptWordCount, 445);
  assert.equal(wordCount(script), 445);
  assert.equal(meta.plannedImageCount, 24);
});

test('Bild 01 ist Cover, erste Szene und Thumbnail-Quelle', async () => {
  const [meta, mapping, prompt] = await Promise.all([
    readFile(`${PROJECT}/99-technik/video.json`, 'utf8').then(JSON.parse),
    readFile(`${PROJECT}/99-technik/BILD_AUDIO_ZUORDNUNG.json`, 'utf8').then(JSON.parse),
    readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8')
  ]);

  assert.equal(meta.coverPolicyVersion, 1);
  assert.equal(meta.coverPolicy.firstSceneIsCover, true);
  assert.equal(meta.coverPolicy.coverImageNumber, 1);
  assert.equal(mapping.coverImageNumber, 1);
  assert.equal(mapping.thumbnailImageNumber, 1);
  assert.equal(mapping.videoFirstImageNumber, 1);
  assert.equal(mapping.images[0].imageNumber, 1);
  assert.match(prompt, /FIRST SCENE = COVER HARD LOCK/);
  assert.match(prompt, /Bild 01 is the cover AND the first video scene/);
  assert.doesNotMatch(prompt, /BILD 00\s*[—-]\s*THUMBNAIL/i);
});

test('24 Bildanker liegen exakt und monoton im Sprechertext', async () => {
  const [script, mapping] = await Promise.all([
    readFile(`${PROJECT}/01-voice-script/voice-script.txt`, 'utf8'),
    readFile(`${PROJECT}/99-technik/BILD_AUDIO_ZUORDNUNG.json`, 'utf8').then(JSON.parse)
  ]);

  assert.equal(mapping.images.length, 24);
  let lastPosition = -1;
  for (let index = 0; index < mapping.images.length; index += 1) {
    const image = mapping.images[index];
    assert.equal(image.imageNumber, index + 1);
    const position = script.indexOf(image.startAnchor);
    assert.ok(position >= 0, `Startanker fehlt im Skript: ${image.startAnchor}`);
    assert.ok(position > lastPosition, `Startanker nicht monoton: Bild ${image.imageNumber}`);
    lastPosition = position;
    if (index < mapping.images.length - 1) {
      assert.equal(image.endAnchor, mapping.images[index + 1].startAnchor);
    } else {
      assert.equal(image.endAnchor, null);
    }
  }
});

test('Google-Flow-Prompt enthält alle 24 Bildprompts und die aktive Visual Policy', async () => {
  const prompt = await readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8');
  assert.match(prompt, /YOUTUBE_VISUAL_POLICY_VERSION: 3/);
  assert.match(prompt, /COVER_POLICY_VERSION: 1/);
  assert.match(prompt, /ACTIVE_STYLE_ID: premium-editorial-explainer-illustration-youtube-16x9/);
  assert.match(prompt, /SESSION RESET HARD LOCK/);
  assert.match(prompt, /VISUAL STORYTELLING HARD LOCK/);
  assert.match(prompt, /ANTI-LIFELESS HARD LOCK/);
  assert.match(prompt, /Do not use any previous generated image as a visual reference\./);
  for (let number = 1; number <= 24; number += 1) {
    assert.match(prompt, new RegExp(`BILD ${String(number).padStart(2, '0')}`, 'i'));
  }
});

test('Zwei-Koreas-Projekt besteht das echte YouTube-Phase-1-Policy-Gate', () => {
  const result = spawnSync(process.execPath, [
    'src/cli/validate-youtube-phase1-policy.js',
    '--dir', PROJECT
  ], { encoding: 'utf8' });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /BESTANDEN/);
});
