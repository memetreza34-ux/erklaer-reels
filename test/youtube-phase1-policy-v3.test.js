import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const PROJECT = 'youtube/2026-KW39_21-09_bis_27-09/warum-gibt-es-zeitzonen';
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

test('aktuelle YouTube-Produktion besteht Visual Policy V3', () => {
  const result = runPolicy(PROJECT);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Visual Policy V3/i);
});

test('Template und aktuelles Video tragen Anti-Lifeless- und Session-Schutz maschinenlesbar', async () => {
  const [templateMeta, projectMeta, templatePrompt, projectPrompt, policy] = await Promise.all([
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readJson(`${PROJECT}/99-technik/video.json`),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson('config/youtube-channel-policy.json')
  ]);

  for (const meta of [templateMeta, projectMeta]) {
    assert.equal(meta.visualPolicyVersion, 3);
    assert.equal(meta.visualStyleId, policy.visualStyleId);
    assert.equal(meta.sessionPolicy.freshFlowSessionRequiredWhenVisualPolicyChanges, true);
    assert.equal(meta.sessionPolicy.continueSessionContainingLegacyStyleInstructionsForbidden, true);
    assert.equal(meta.visualQualityPolicy.visualStorytellingRequired, true);
    assert.equal(meta.visualQualityPolicy.lifelessStaticCompositionForbidden, true);
    assert.equal(meta.visualQualityPolicy.genericCenteredObjectOnBlankBackgroundForbiddenByDefault, true);
    assert.equal(meta.visualQualityPolicy.sceneSpecificArtDirectionRequired, true);
    assert.equal(meta.visualQualityPolicy.controlledDepthRequired, true);
  }

  for (const prompt of [templatePrompt, projectPrompt]) {
    assert.match(prompt, /YOUTUBE_VISUAL_POLICY_VERSION: 3/);
    assert.match(prompt, /SESSION RESET HARD LOCK/);
    assert.match(prompt, /VISUAL STORYTELLING HARD LOCK/);
    assert.match(prompt, /ANTI-LIFELESS HARD LOCK/);
    assert.match(prompt, /Do not use any previous generated image as a visual reference\./);
    assert.match(prompt, /Clean does NOT mean empty|Clean ≠ leer/i);
  }
});

test('Kanalfokus ist für das Zeitzonen-Video explizit dokumentiert', async () => {
  const [meta, policy] = await Promise.all([
    readJson(`${PROJECT}/99-technik/video.json`),
    readJson('config/youtube-channel-policy.json')
  ]);
  assert.ok(policy.channelFocus.primaryTopics.includes(meta.topicCategory));
  assert.match(meta.topicCoreLink, /Geografie|Geschichte/i);
  assert.equal(meta.explicitUserRequestedOutsideFocus, false);
});

test('veralteter Countryball-/Master-Reference-Prompt wird hart blockiert', async () => {
  const temp = await mkdtemp(path.join(tmpdir(), 'youtube-policy-v3-'));
  try {
    await mkdir(path.join(temp, '99-technik'), { recursive: true });
    await mkdir(path.join(temp, '00-bildprompts'), { recursive: true });
    const meta = await readFile(`${PROJECT}/99-technik/video.json`, 'utf8');
    const prompt = await readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8');
    await writeFile(path.join(temp, '99-technik/video.json'), meta);
    await writeFile(
      path.join(temp, '00-bildprompts/google-flow-prompt.txt'),
      `${prompt}\nMASTER-REFERENCE-REGEL\nserious-minimal-countryball-explainer-youtube-16x9\nBild 01 als Master-Style-Referenz festlegen\n`
    );

    const result = runPolicy(temp);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /veraltete Bildwelt|Referenzregel|MASTER-REFERENCE/i);
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
