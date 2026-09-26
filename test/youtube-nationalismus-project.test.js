import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const PROJECT = 'youtube/2026-KW39_21-09_bis_27-09/was-ist-nationalismus';

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function runPhase1Gate() {
  return spawnSync(process.execPath, ['src/cli/validate-youtube-phase1-policy.js', '--dir', PROJECT], {
    cwd: process.cwd(),
    encoding: 'utf8'
  });
}

test('Nationalismus-Projekt nutzt V5 Premium Countryball und Adaptive Pacing V3', async () => {
  const [meta, prompt] = await Promise.all([
    readJson(`${PROJECT}/99-technik/video.json`),
    readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8')
  ]);

  assert.equal(meta.schemaVersion, 10);
  assert.equal(meta.visualPolicyVersion, 5);
  assert.equal(meta.designQualityVersion, 1);
  assert.equal(meta.adaptivePacingVersion, 3);
  assert.equal(meta.visualStyleId, 'serious-minimal-countryball-explainer-youtube-16x9');
  assert.equal(meta.sourceVisualWorldId, 'serious-minimal-countryball-explainer');
  assert.equal(meta.topicCategory, 'Ideologien und Gesellschaftssysteme');
  assert.equal(meta.topicEditor.decision, 'APPROVED_NEW');
  assert.equal(meta.plannedImageCount, 28);
  assert.equal(meta.imageDensityPolicy.fixedImageCountForbidden, true);
  assert.equal(meta.imageDensityPolicy.allowMoreImagesWhenNarrativelyUseful, true);

  assert.match(prompt, /YOUTUBE_VISUAL_POLICY_VERSION: 5/);
  assert.match(prompt, /PREMIUM DESIGN LAYER V1 — HARD LOCK/);
  assert.match(prompt, /ADAPTIVE IMAGE DENSITY V3 — HARD LOCK/);
  assert.match(prompt, /Bild 28/);
  assert.doesNotMatch(prompt, /Bild 29/);
});

test('Skript hat 438 Wörter und alle 28 Bildanker liegen exakt monoton darin', async () => {
  const [script, mapping] = await Promise.all([
    readFile(`${PROJECT}/01-voice-script/voice-script.txt`, 'utf8'),
    readJson(`${PROJECT}/99-technik/BILD_AUDIO_ZUORDNUNG.json`)
  ]);

  assert.equal(script.trim().split(/\s+/).length, 438);
  assert.equal(mapping.images.length, 28);
  assert.equal(mapping.videoFirstImageNumber, 1);
  assert.equal(mapping.videoLastImageNumber, 28);

  let lastIndex = -1;
  for (let index = 0; index < mapping.images.length; index += 1) {
    const image = mapping.images[index];
    assert.equal(image.imageNumber, index + 1);
    const startIndex = script.indexOf(image.startAnchor);
    assert.ok(startIndex >= 0, `Startanker fehlt bei Bild ${image.imageNumber}: ${image.startAnchor}`);
    assert.ok(startIndex > lastIndex, `Startanker nicht monoton bei Bild ${image.imageNumber}`);
    lastIndex = startIndex;

    const next = mapping.images[index + 1];
    if (next) assert.equal(image.endAnchor, next.startAnchor, `Endanker von Bild ${image.imageNumber} muss dem nächsten Startanker entsprechen.`);
    else assert.equal(image.endAnchor, null);

    assert.ok(image.plannedHoldSeconds >= 2.5 && image.plannedHoldSeconds <= 9, `Unplausibler V3-Hold bei Bild ${image.imageNumber}`);
  }
});

test('Cover- und Single-Pass-Regeln sind für 28 Bilder fest verankert', async () => {
  const [meta, prompt, status] = await Promise.all([
    readJson(`${PROJECT}/99-technik/video.json`),
    readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${PROJECT}/99-technik/status.json`)
  ]);

  assert.equal(meta.coverPolicy.coverImageNumber, 1);
  assert.equal(meta.assetGenerationPolicy.coverCandidateCount, 3);
  assert.equal(meta.assetGenerationPolicy.nonCoverGenerationCount, 1);
  assert.equal(meta.assetGenerationPolicy.maxConcurrentGenerations, 5);
  assert.equal(meta.assetGenerationPolicy.finalImageDirectory, '00-bildprompts/images');
  assert.equal(status.phase2.coverCandidateCount, 3);
  assert.equal(status.phase2.nonCoverGenerationCount, 1);
  assert.equal(status.phase2.manualWaveReview, false);

  assert.match(prompt, /Generate Bild 01 exactly THREE times/i);
  assert.match(prompt, /Bild 02 through Bild 28 are each generated exactly ONCE/i);
  assert.match(prompt, /Do not use any previous generated image as a visual reference\./);
});

test('Nationalismus-Projekt besteht das echte Phase-1-Policy-Gate', () => {
  const result = runPhase1Gate();
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /BESTANDEN/i);
  assert.match(result.stdout, /Premium Countryball V5/i);
});
