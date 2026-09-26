import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const CURRENT_PROJECT = 'youtube/2026-KW39_21-09_bis_27-09/warum-ist-kaliningrad-von-russland-getrennt';
const LEGACY_V3_PROJECT = 'youtube/2026-KW39_21-09_bis_27-09/warum-gibt-es-zeitzonen';
const TEMPLATE = 'youtube/templates/video-template';

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function runPolicy(dir) {
  return spawnSync(process.execPath, ['src/cli/validate-youtube-phase1-policy.js', '--dir', dir], {
    cwd: process.cwd(),
    encoding: 'utf8'
  });
}

test('aktuelles Schema-9-Projekt bleibt als Countryball V4 reproduzierbar', () => {
  const result = runPolicy(CURRENT_PROJECT);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Serious-Minimal-Countryball V4 \(Legacy Schema 9\)/i);
});

test('älteres V3-Projekt bleibt reproduzierbar', () => {
  const result = runPolicy(LEGACY_V3_PROJECT);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Legacy Visual Policy V3/i);
});

test('Template trägt Schema 11, Countryball V5, Premium Design, Pacing V3 und Script Opening V1', async () => {
  const [templateMeta, projectMeta, templatePrompt, policy] = await Promise.all([
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${CURRENT_PROJECT}/99-technik/video.json`),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson('config/youtube-channel-policy.json')
  ]);

  assert.equal(policy.visualPolicyVersion, 5);
  assert.equal(policy.designQualityVersion, 1);
  assert.equal(policy.adaptivePacingVersion, 3);
  assert.equal(policy.scriptOpeningPolicyVersion, 1);
  assert.equal(policy.visualStyleId, 'serious-minimal-countryball-explainer-youtube-16x9');

  assert.equal(templateMeta.schemaVersion, 11);
  assert.equal(templateMeta.visualPolicyVersion, 5);
  assert.equal(templateMeta.designQualityVersion, 1);
  assert.equal(templateMeta.adaptivePacingVersion, 3);
  assert.equal(templateMeta.scriptOpeningPolicyVersion, 1);
  assert.equal(templateMeta.explicitScriptOpeningOverride, false);
  assert.equal(templateMeta.visualStyleId, policy.visualStyleId);
  assert.equal(templateMeta.sourceVisualWorldId, 'serious-minimal-countryball-explainer');
  assert.equal(templateMeta.visualWorldParityPolicy.mustMatchReelVisualDNA, true);
  assert.equal(templateMeta.visualWorldParityPolicy.independentYoutubeStyle, false);
  assert.equal(templateMeta.sessionPolicy.previousGeneratedImageAsReferenceForbidden, true);
  assert.equal(templateMeta.visualQualityPolicy.premiumCompositionRequired, true);
  assert.equal(templateMeta.imageDensityPolicy.allowMoreImagesWhenNarrativelyUseful, true);

  assert.equal(projectMeta.schemaVersion, 9);
  assert.equal(projectMeta.visualPolicyVersion, 4);

  assert.match(templatePrompt, /YOUTUBE_VISUAL_POLICY_VERSION: 5/);
  assert.match(templatePrompt, /DESIGN_QUALITY_VERSION: 1/);
  assert.match(templatePrompt, /ADAPTIVE_PACING_VERSION: 3/);
  assert.match(templatePrompt, /WRITTEN STYLE LOCK — SERIOUS MINIMAL COUNTRYBALL/);
  assert.match(templatePrompt, /PREMIUM DESIGN LAYER V1 — HARD LOCK/);
  assert.match(templatePrompt, /ADAPTIVE IMAGE DENSITY V3 — HARD LOCK/);
  assert.match(templatePrompt, /Do not use any previous generated image as a visual reference\./);
});

test('Kanalfokus ist für das Kaliningrad-Video explizit dokumentiert', async () => {
  const [meta, policy] = await Promise.all([
    readJson(`${CURRENT_PROJECT}/99-technik/video.json`),
    readJson('config/youtube-channel-policy.json')
  ]);
  assert.ok(policy.channelFocus.primaryTopics.includes(meta.topicCategory));
  assert.match(meta.topicCoreLink, /Geografie|Grenz|Nachkriegs|Sowjet/i);
  assert.equal(meta.explicitUserRequestedOutsideFocus, false);
});

test('alte Master-Reference-Regel bleibt bei V4 und V5 hart blockiert', async () => {
  const temp = await mkdtemp(path.join(tmpdir(), 'youtube-policy-reference-'));
  try {
    await mkdir(path.join(temp, '99-technik'), { recursive: true });
    await mkdir(path.join(temp, '00-bildprompts'), { recursive: true });
    const meta = await readFile(`${CURRENT_PROJECT}/99-technik/video.json`, 'utf8');
    const prompt = await readFile(`${CURRENT_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8');
    await writeFile(path.join(temp, '99-technik/video.json'), meta);
    await writeFile(
      path.join(temp, '00-bildprompts/google-flow-prompt.txt'),
      `${prompt}\nMASTER-REFERENCE-REGEL\nBild 01 als Master-Style-Referenz festlegen\n`
    );

    const result = runPolicy(temp);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /veraltete Bildwelt|Referenzregel|MASTER-REFERENCE/i);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test('Premium-Editorial-Stil wird weiterhin blockiert', async () => {
  const temp = await mkdtemp(path.join(tmpdir(), 'youtube-policy-v5-premium-editorial-'));
  try {
    await mkdir(path.join(temp, '99-technik'), { recursive: true });
    await mkdir(path.join(temp, '00-bildprompts'), { recursive: true });
    const meta = await readFile(`${TEMPLATE}/99-technik/video.json`, 'utf8');
    const prompt = await readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8');
    await writeFile(path.join(temp, '99-technik/video.json'), meta);
    await writeFile(
      path.join(temp, '00-bildprompts/google-flow-prompt.txt'),
      prompt.replace('ACTIVE_STYLE_ID: serious-minimal-countryball-explainer-youtube-16x9', 'ACTIVE_STYLE_ID: premium-editorial-explainer-illustration-youtube-16x9')
    );

    const result = runPolicy(temp);
    assert.notEqual(result.status, 0);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test('V5 blockiert fehlende Premium-Design- und Density-Regeln', async () => {
  const temp = await mkdtemp(path.join(tmpdir(), 'youtube-policy-v5-quality-'));
  try {
    await mkdir(path.join(temp, '99-technik'), { recursive: true });
    await mkdir(path.join(temp, '00-bildprompts'), { recursive: true });
    const meta = await readJson(`${TEMPLATE}/99-technik/video.json`);
    const candidateTitle = 'V5 Testthema Einzigartig 987654';
    meta.title = candidateTitle;
    meta.topic = candidateTitle;
    meta.topicCategory = 'Geschichte';
    meta.topicCoreLink = 'Technischer V5-Test für die YouTube-Qualitätspolicy.';
    meta.videoId = 'v5-testthema-einzigartig-987654';
    meta.topicEditor = {
      version: 1,
      decision: 'APPROVED_NEW',
      checkedBeforeProjectCreation: true,
      candidateTitle
    };
    meta.visualQualityPolicy.premiumCompositionRequired = false;
    meta.imageDensityPolicy.fixedImageCountForbidden = false;
    await writeFile(path.join(temp, '99-technik/video.json'), JSON.stringify(meta, null, 2));
    await writeFile(path.join(temp, '00-bildprompts/google-flow-prompt.txt'), await readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'));

    const result = runPolicy(temp);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /premiumCompositionRequired|fixedImageCountForbidden/i);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test('Phase 3 führt Visual-Policy-Gate vor Audio- und Renderarbeit aus', async () => {
  const source = await readFile('src/cli/phase3-youtube.js', 'utf8');
  const policyIndex = source.indexOf("run('src/cli/validate-youtube-phase1-policy.js'");
  const alignIndex = source.indexOf("run('src/cli/auto-align-youtube.js'");
  assert.ok(policyIndex >= 0);
  assert.ok(alignIndex > policyIndex);
});
