import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { checkYoutubeTopic } from '../src/core/youtube-topic-editor.js';

const PROJECT = 'youtube/2026-KW39_21-09_bis_27-09/warum-ist-kaliningrad-von-russland-getrennt';
const VIDEO_ID = '2026-KW39_warum-ist-kaliningrad-von-russland-getrennt';

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

test('Themen-Editor blockiert ein bereits vorhandenes Zeitzonen-Thema', async () => {
  const result = await checkYoutubeTopic({ candidateTitle: 'Warum gibt es Zeitzonen?' });
  assert.equal(result.decision, 'BLOCKED_DUPLICATE');
  assert.equal(result.isNew, false);
});

test('Themen-Editor blockiert auch eine bekannte Korea-Umformulierung', async () => {
  const result = await checkYoutubeTopic({ candidateTitle: 'Wie wurde Korea geteilt?' });
  assert.equal(result.decision, 'BLOCKED_DUPLICATE');
});

test('Kaliningrad bleibt nach eigener Reservierung als eigenständiges Thema freigegeben', async () => {
  const result = await checkYoutubeTopic({
    candidateTitle: 'Warum ist Kaliningrad von Russland getrennt?',
    selfVideoId: VIDEO_ID,
    excludeProjectDir: PROJECT
  });
  assert.equal(result.decision, 'APPROVED_NEW', JSON.stringify(result));
  assert.equal(result.isNew, true);
});

test('Kaliningrad-Projekt hat 2,5-Minuten-Ziel, Themen-Proof, Asset Policy und 24 Bildanker', async () => {
  const [meta, script, mapping] = await Promise.all([
    readFile(`${PROJECT}/99-technik/video.json`, 'utf8').then(JSON.parse),
    readFile(`${PROJECT}/01-voice-script/voice-script.txt`, 'utf8'),
    readFile(`${PROJECT}/99-technik/BILD_AUDIO_ZUORDNUNG.json`, 'utf8').then(JSON.parse)
  ]);

  assert.equal(meta.schemaVersion, 9);
  assert.equal(meta.visualPolicyVersion, 4);
  assert.equal(meta.visualStyleId, 'serious-minimal-countryball-explainer-youtube-16x9');
  assert.equal(meta.sourceVisualWorldId, 'serious-minimal-countryball-explainer');
  assert.equal(meta.assetGenerationPolicyVersion, 1);
  assert.equal(meta.assetGenerationPolicy.coverCandidateCount, 3);
  assert.equal(meta.assetGenerationPolicy.nonCoverGenerationCount, 1);
  assert.equal(meta.assetGenerationPolicy.nonCoverManualWaveReviewForbidden, true);
  assert.equal(meta.topicEditor.decision, 'APPROVED_NEW');
  assert.equal(meta.topicEditor.checkedBeforeProjectCreation, true);
  assert.equal(meta.targetDurationSeconds, 150);
  assert.deepEqual(meta.targetDurationRangeSeconds, [142, 158]);
  assert.equal(meta.scriptWordCount, 442);
  assert.equal(wordCount(script), 442);
  assert.equal(meta.plannedImageCount, 24);
  assert.equal(mapping.images.length, 24);
  assert.equal(mapping.coverImageNumber, 1);
  assert.equal(mapping.thumbnailImageNumber, 1);

  let last = -1;
  for (let index = 0; index < mapping.images.length; index += 1) {
    const item = mapping.images[index];
    assert.equal(item.imageNumber, index + 1);
    const pos = script.indexOf(item.startAnchor);
    assert.ok(pos >= 0, `Startanker fehlt: ${item.startAnchor}`);
    assert.ok(pos > last, `Startanker nicht monoton bei Bild ${item.imageNumber}`);
    last = pos;
    if (index < mapping.images.length - 1) assert.equal(item.endAnchor, mapping.images[index + 1].startAnchor);
    else assert.equal(item.endAnchor, null);
  }
});

test('Flow-Prompt enthält alle 24 unabhängigen Bildprompts, Countryball V4 und Cover Policy', async () => {
  const prompt = await readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8');
  assert.match(prompt, /YOUTUBE_VISUAL_POLICY_VERSION: 4/);
  assert.match(prompt, /ACTIVE_STYLE_ID: serious-minimal-countryball-explainer-youtube-16x9/);
  assert.match(prompt, /WRITTEN STYLE LOCK — SERIOUS MINIMAL COUNTRYBALL/);
  assert.match(prompt, /COVER_POLICY_VERSION: 1/);
  assert.match(prompt, /ASSET_GENERATION_POLICY_VERSION: 1/);
  assert.match(prompt, /FIRST SCENE = COVER HARD LOCK/);
  assert.match(prompt, /COVER = 3 CANDIDATES HARD LOCK/);
  assert.match(prompt, /NON-COVER = SINGLE GENERATION HARD LOCK/);
  assert.match(prompt, /Bild 01 is the cover AND the first video scene/);
  assert.match(prompt, /Do not use any previous generated image as a visual reference\./);
  assert.match(prompt, /ANTI-LIFELESS HARD LOCK/);
  assert.doesNotMatch(prompt, /BILD 00\s*[—-]\s*THUMBNAIL/i);
  for (let number = 1; number <= 24; number += 1) {
    assert.match(prompt, new RegExp(`Bild ${String(number).padStart(2, '0')}`, 'i'));
  }
});

test('Kaliningrad-Projekt besteht das echte Phase-1-Gate inklusive Themen-Editor', () => {
  const result = spawnSync(process.execPath, [
    'src/cli/validate-youtube-phase1-policy.js',
    '--dir', PROJECT
  ], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Serious-Minimal-Countryball V4/);
  assert.match(result.stdout, /Themen-Editor FREI/);
  assert.match(result.stdout, /Asset Generation Policy V1/);
});

test('CLI sagt bei reserviertem eigenen Kaliningrad-Projekt ausdrücklich FREI', () => {
  const result = spawnSync(process.execPath, [
    'src/cli/check-youtube-topic.js',
    '--topic', 'Warum ist Kaliningrad von Russland getrennt?',
    '--self-video-id', VIDEO_ID,
    '--exclude-dir', PROJECT
  ], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /THEMEN-EDITOR: FREI/);
});
