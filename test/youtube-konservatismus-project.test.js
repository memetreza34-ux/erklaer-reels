import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const PROJECT = 'youtube/2026-KW39_21-09_bis_27-09/konservatismus-bewahren-statt-radikal-veraendern';

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function runPhase1Gate() {
  return spawnSync(process.execPath, ['src/cli/validate-youtube-phase1-policy.js', '--dir', PROJECT], {
    cwd: process.cwd(),
    encoding: 'utf8'
  });
}

test('Konservatismus-Projekt nutzt Schema 12 und zielt auf zwei Minuten', async () => {
  const [meta, prompt, script] = await Promise.all([
    readJson(`${PROJECT}/99-technik/video.json`),
    readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${PROJECT}/01-voice-script/voice-script.txt`, 'utf8')
  ]);

  assert.equal(meta.schemaVersion, 12);
  assert.equal(meta.visualPolicyVersion, 5);
  assert.equal(meta.scriptOpeningPolicyVersion, 1);
  assert.equal(meta.sceneIllustrationPolicyVersion, 2);
  assert.equal(meta.topicVisualRelevancePolicyVersion, 1);
  assert.equal(meta.endHoldPolicyVersion, 1);
  assert.equal(meta.targetDurationSeconds, 120);
  assert.deepEqual(meta.targetDurationRangeSeconds, [114, 128]);
  assert.equal(meta.plannedImageCount, 26);
  assert.equal(meta.renderPolicy.endHoldSeconds, 1.3);
  assert.equal(meta.topicEditor.decision, 'APPROVED_NEW');
  assert.match(script, /^Was ist Konservatismus\? Denkst du dir gerade vielleicht\. Kurz gesagt:/);
  assert.match(prompt, /TOPIC_VISUAL_RELEVANCE_POLICY_VERSION: 1/);
  assert.match(prompt, /END_HOLD_POLICY_VERSION: 1/);
});

test('Konservatismus-Skript hat 365 Wörter und 26 monotone Audioanker', async () => {
  const [script, mapping] = await Promise.all([
    readFile(`${PROJECT}/01-voice-script/voice-script.txt`, 'utf8'),
    readJson(`${PROJECT}/99-technik/BILD_AUDIO_ZUORDNUNG.json`)
  ]);

  assert.equal(script.trim().split(/\s+/).length, 365);
  assert.equal(mapping.images.length, 26);
  assert.equal(mapping.videoFirstImageNumber, 1);
  assert.equal(mapping.videoLastImageNumber, 26);

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

test('alle 26 Bilder sind themenspezifisch geplant und Menschen bleiben verboten', async () => {
  const [meta, prompt] = await Promise.all([
    readJson(`${PROJECT}/99-technik/video.json`),
    readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8')
  ]);

  assert.equal(meta.visualWorldParityPolicy.normalIllustratedHumansForbidden, true);
  assert.equal(meta.visualWorldParityPolicy.humanSilhouettesForbidden, true);
  assert.equal(meta.visualWorldParityPolicy.humanHandsForbidden, true);
  assert.equal(meta.topicVisualRelevancePolicy.eachImageMustBeSpecificToVideoTopic, true);
  assert.equal(meta.topicVisualRelevancePolicy.arbitraryCountryOrFlagUseForbidden, true);

  const imageBlocks = [...prompt.matchAll(/^BILD\s+(\d{2})\s+·/gim)];
  const topicAnchors = [...prompt.matchAll(/^Topic Anchor:\s*.+$/gim)];
  assert.equal(imageBlocks.length, 26);
  assert.deepEqual(imageBlocks.map((match) => Number(match[1])), Array.from({ length: 26 }, (_, i) => i + 1));
  assert.equal(topicAnchors.length, 26);

  assert.match(prompt, /No normal illustrated humans/i);
  assert.match(prompt, /No human silhouettes/i);
  assert.match(prompt, /No realistic human hands/i);
  assert.match(prompt, /France may appear only in the French-Revolution context/i);
  assert.match(prompt, /Britain may appear only in the Edmund-Burke context/i);
  assert.match(prompt, /no random national Countryballs/i);
});

test('Konservatismus-Prompt nutzt konkrete Illustrationsszenen und korrekte Asset-Regeln', async () => {
  const [meta, prompt, status, qc] = await Promise.all([
    readJson(`${PROJECT}/99-technik/video.json`),
    readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${PROJECT}/99-technik/status.json`),
    readFile(`${PROJECT}/99-technik/PHASE1_QC.md`, 'utf8')
  ]);

  assert.equal(meta.sceneIllustrationPolicy.concreteIllustratedScenePreferred, true);
  assert.equal(meta.sceneIllustrationPolicy.abstractInfographicPosterForbiddenByDefault, true);
  assert.equal(meta.sceneIllustrationPolicy.multiPanelDashboardForbiddenByDefault, true);
  assert.equal(meta.assetGenerationPolicy.coverCandidateCount, 3);
  assert.equal(meta.assetGenerationPolicy.nonCoverGenerationCount, 1);
  assert.equal(status.phase2.expectedImageCount, 26);
  assert.equal(status.phase2.requiredVisualRevision, 'scene-illustration-v2-topic-relevance-v1');

  assert.match(prompt, /SERIES OF CLEAR ILLUSTRATED SCENES, NOT LIKE ABSTRACT INFOGRAPHIC POSTERS/i);
  assert.match(prompt, /Generate Bild 01 exactly THREE times/i);
  assert.match(prompt, /Bild 02 through Bild 26 is generated exactly ONCE/i);
  assert.match(prompt, /town hall/i);
  assert.match(prompt, /courthouse/i);
  assert.match(prompt, /regional train station/i);
  assert.match(prompt, /local commercial street/i);
  assert.match(qc, /Topic Visual Relevance Policy V1/);
});

test('Schlussbild fasst Konservatismus konkret zusammen und End-Hold ist 1,3 Sekunden', async () => {
  const [meta, prompt, mapping] = await Promise.all([
    readJson(`${PROJECT}/99-technik/video.json`),
    readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${PROJECT}/99-technik/BILD_AUDIO_ZUORDNUNG.json`)
  ]);

  assert.equal(meta.endHoldPolicy.targetSeconds, 1.3);
  assert.equal(meta.renderPolicy.endHoldSeconds, 1.3);
  assert.equal(mapping.images.at(-1).imageNumber, 26);
  assert.equal(mapping.images.at(-1).endAnchor, null);
  assert.match(prompt, /BEWAHREN \+ VERÄNDERN/);
  assert.match(prompt, /preservation plus measured reform/i);
});

test('Konservatismus-Projekt besteht das echte Phase-1-Policy-Gate', () => {
  const result = runPhase1Gate();
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /BESTANDEN/i);
});
