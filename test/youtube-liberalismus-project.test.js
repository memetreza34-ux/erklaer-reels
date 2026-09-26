import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const PROJECT = 'youtube/2026-KW39_21-09_bis_27-09/liberalismus-freiheit-rechte-und-staat';

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function runPhase1Gate() {
  return spawnSync(process.execPath, ['src/cli/validate-youtube-phase1-policy.js', '--dir', PROJECT], {
    cwd: process.cwd(),
    encoding: 'utf8'
  });
}

test('Liberalismus-Projekt nutzt Schema 11, Script Opening V1 und Premium Countryball V5', async () => {
  const [meta, prompt, script] = await Promise.all([
    readJson(`${PROJECT}/99-technik/video.json`),
    readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${PROJECT}/01-voice-script/voice-script.txt`, 'utf8')
  ]);

  assert.equal(meta.schemaVersion, 11);
  assert.equal(meta.visualPolicyVersion, 5);
  assert.equal(meta.scriptOpeningPolicyVersion, 1);
  assert.equal(meta.explicitScriptOpeningOverride, false);
  assert.equal(meta.visualStyleId, 'serious-minimal-countryball-explainer-youtube-16x9');
  assert.equal(meta.sourceVisualWorldId, 'serious-minimal-countryball-explainer');
  assert.equal(meta.topicEditor.decision, 'APPROVED_NEW');
  assert.equal(meta.plannedImageCount, 32);
  assert.match(script, /^Was ist Liberalismus\? Denkst du dir gerade vielleicht\. Kurz gesagt:/);
  assert.match(prompt, /SCRIPT_OPENING_POLICY_VERSION: 1/);
  assert.match(prompt, /Bild 32/);
  assert.doesNotMatch(prompt, /Bild 33/);
});

test('Liberalismus-Skript hat 427 Wörter und 32 monotone Audioanker', async () => {
  const [script, mapping] = await Promise.all([
    readFile(`${PROJECT}/01-voice-script/voice-script.txt`, 'utf8'),
    readJson(`${PROJECT}/99-technik/BILD_AUDIO_ZUORDNUNG.json`)
  ]);

  assert.equal(script.trim().split(/\s+/).length, 427);
  assert.equal(mapping.images.length, 32);
  assert.equal(mapping.videoFirstImageNumber, 1);
  assert.equal(mapping.videoLastImageNumber, 32);

  let lastIndex = -1;
  for (let index = 0; index < mapping.images.length; index += 1) {
    const image = mapping.images[index];
    assert.equal(image.imageNumber, index + 1);
    const startIndex = script.indexOf(image.startAnchor);
    assert.ok(startIndex >= 0, `Startanker fehlt bei Bild ${image.imageNumber}: ${image.startAnchor}`);
    assert.ok(startIndex > lastIndex, `Startanker nicht monoton bei Bild ${image.imageNumber}`);
    lastIndex = startIndex;

    const next = mapping.images[index + 1];
    if (next) assert.equal(image.endAnchor, next.startAnchor);
    else assert.equal(image.endAnchor, null);
  }
});

test('Liberalismus-Prompt verbietet Menschen und erzwingt die Asset-Regeln', async () => {
  const [meta, prompt] = await Promise.all([
    readJson(`${PROJECT}/99-technik/video.json`),
    readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8')
  ]);

  assert.equal(meta.visualWorldParityPolicy.normalIllustratedHumansForbidden, true);
  assert.equal(meta.visualWorldParityPolicy.humanSilhouettesForbidden, true);
  assert.equal(meta.visualWorldParityPolicy.humanHandsForbidden, true);
  assert.equal(meta.assetGenerationPolicy.coverCandidateCount, 3);
  assert.equal(meta.assetGenerationPolicy.nonCoverGenerationCount, 1);
  assert.match(prompt, /ONLY Countryball-style figures may act as people or groups/i);
  assert.match(prompt, /NO human silhouettes/i);
  assert.match(prompt, /NO human hands/i);
  assert.match(prompt, /Generate Bild 01 exactly THREE times/i);
  assert.match(prompt, /Bild 02 through Bild 32 are each generated exactly ONCE/i);
});

test('Liberalismus-Projekt besteht das echte Phase-1-Policy-Gate', () => {
  const result = runPhase1Gate();
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /BESTANDEN/i);
});
