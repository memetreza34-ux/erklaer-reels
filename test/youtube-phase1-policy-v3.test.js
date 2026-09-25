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

test('aktuelle YouTube-Produktion besteht restaurierte Countryball Visual Policy V4', () => {
  const result = runPolicy(CURRENT_PROJECT);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Serious-Minimal-Countryball V4/i);
});

test('älteres V3-Projekt bleibt reproduzierbar statt durch V4 zwangsweise migriert zu werden', () => {
  const result = runPolicy(LEGACY_V3_PROJECT);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Legacy Visual Policy V3/i);
});

test('Template und aktuelles Projekt tragen Countryball V4 und Session-Schutz maschinenlesbar', async () => {
  const [templateMeta, projectMeta, templatePrompt, projectPrompt, policy] = await Promise.all([
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${CURRENT_PROJECT}/99-technik/video.json`),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${CURRENT_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson('config/youtube-channel-policy.json')
  ]);

  assert.equal(policy.visualPolicyVersion, 4);
  assert.equal(policy.visualStyleId, 'serious-minimal-countryball-explainer-youtube-16x9');

  for (const meta of [templateMeta, projectMeta]) {
    assert.equal(meta.visualPolicyVersion, 4);
    assert.equal(meta.visualStyleId, policy.visualStyleId);
    assert.equal(meta.sourceVisualWorldId, 'serious-minimal-countryball-explainer');
    assert.equal(meta.visualWorldParityPolicy.mustMatchReelVisualDNA, true);
    assert.equal(meta.visualWorldParityPolicy.independentYoutubeStyle, false);
    assert.equal(meta.visualWorldParityPolicy.countryballVisualWorldRequired, true);
    assert.equal(meta.sessionPolicy.freshFlowSessionRequiredWhenVisualPolicyChanges, true);
    assert.equal(meta.sessionPolicy.previousGeneratedImageAsReferenceForbidden, true);
    assert.equal(meta.visualQualityPolicy.seriousMinimalCountryballWorldRequired, true);
    assert.equal(meta.visualQualityPolicy.perfectlyRoundCountryballActorsRequired, true);
    assert.equal(meta.visualQualityPolicy.normalIllustratedHumansForbidden, true);
  }

  for (const prompt of [templatePrompt, projectPrompt]) {
    assert.match(prompt, /YOUTUBE_VISUAL_POLICY_VERSION: 4/);
    assert.match(prompt, /ACTIVE_STYLE_ID: serious-minimal-countryball-explainer-youtube-16x9/);
    assert.match(prompt, /WRITTEN STYLE LOCK — SERIOUS MINIMAL COUNTRYBALL/);
    assert.match(prompt, /SESSION RESET HARD LOCK/);
    assert.match(prompt, /Do not use any previous generated image as a visual reference\./);
    assert.match(prompt, /Clean does NOT mean empty|Clean ≠ leer/i);
  }
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

test('alte Master-Reference-Regel bleibt trotz restaurierter Bildwelt hart blockiert', async () => {
  const temp = await mkdtemp(path.join(tmpdir(), 'youtube-policy-v4-'));
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

test('Premium-Editorial-V3 wird für neue Schema-9-Projekte blockiert', async () => {
  const temp = await mkdtemp(path.join(tmpdir(), 'youtube-policy-v4-premium-'));
  try {
    await mkdir(path.join(temp, '99-technik'), { recursive: true });
    await mkdir(path.join(temp, '00-bildprompts'), { recursive: true });
    const meta = await readFile(`${CURRENT_PROJECT}/99-technik/video.json`, 'utf8');
    const prompt = await readFile(`${CURRENT_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8');
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

test('Phase 3 führt Visual-Policy-Gate vor Audio- und Renderarbeit aus', async () => {
  const source = await readFile('src/cli/phase3-youtube.js', 'utf8');
  const policyIndex = source.indexOf("run('src/cli/validate-youtube-phase1-policy.js'");
  const alignIndex = source.indexOf("run('src/cli/auto-align-youtube.js'");
  assert.ok(policyIndex >= 0);
  assert.ok(alignIndex > policyIndex);
});
