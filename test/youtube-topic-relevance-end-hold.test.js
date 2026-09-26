import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const TEMPLATE = 'youtube/templates/video-template';
const LIBERALISMUS = 'youtube/2026-KW39_21-09_bis_27-09/liberalismus-freiheit-rechte-und-staat';

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

async function makeTimelineFixture(endHoldSeconds) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'youtube-end-hold-'));
  const tech = path.join(root, '99-technik');
  await mkdir(tech, { recursive: true });
  await writeFile(path.join(tech, 'video.json'), JSON.stringify({
    schemaVersion: 12,
    endHoldPolicyVersion: 1,
    endHoldPolicy: {
      lastImageMustRemainVisibleAfterLastWord: true,
      minimumSeconds: 1.2,
      targetSeconds: 1.3,
      maximumSeconds: 1.5,
      audioSilenceMustNotBeUsedAsSubstitute: true
    },
    renderPolicy: { endHoldSeconds }
  }), 'utf8');
  await writeFile(path.join(tech, 'BILD_AUDIO_ZUORDNUNG.json'), JSON.stringify({
    cutLeadSecondsDefault: 0.08,
    audioMasterFile: '02-audio/voiceover-optimized.wav',
    alignmentEvidenceFile: '99-technik/YOUTUBE_WORD_TIMINGS.json',
    autoAlignment: { totalDurationSeconds: 10 },
    images: [
      { imageNumber: 1, actualStartSeconds: 0, alignmentConfidence: 0.99 },
      { imageNumber: 2, actualStartSeconds: 5, alignmentConfidence: 0.99 }
    ]
  }), 'utf8');
  return root;
}

test('zukünftiges YouTube-Template verlangt Topic Anchor und konkrete Themenbindung', async () => {
  const [policy, meta, prompt, visualWorld] = await Promise.all([
    readJson('config/youtube-channel-policy.json'),
    readJson(`${TEMPLATE}/99-technik/video.json`),
    readFile(`${TEMPLATE}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile('youtube/YOUTUBE_VISUAL_WORLD.md', 'utf8')
  ]);

  assert.equal(meta.schemaVersion, 12);
  assert.equal(meta.sceneIllustrationPolicyVersion, 2);
  assert.equal(meta.topicVisualRelevancePolicyVersion, 1);
  assert.equal(meta.endHoldPolicyVersion, 1);
  assert.equal(policy.topicVisualRelevancePolicy.topicAnchorRequiredPerImagePlan, true);
  assert.equal(policy.topicVisualRelevancePolicy.arbitraryCountryOrFlagUseForbidden, true);
  assert.equal(policy.topicVisualRelevancePolicy.finalImageMustSummarizeCoreTopicNotGenericMoral, true);
  assert.match(prompt, /Topic Anchor:/);
  assert.match(prompt, /Could this exact image be dropped into a different explainer/i);
  assert.match(prompt, /arbitrary countries, flags or national Countryballs are forbidden/i);
  assert.match(visualWorld, /Könnte dieses Bild fast unverändert in einem anderen Erklärvideo vorkommen/i);
  assert.match(visualWorld, /letzte Bild.*konkreten Themenkern/is);
});

test('Timeline nutzt bei Schema 12 den konfigurierten 1,3-Sekunden-Schluss-Hold', async () => {
  const project = await makeTimelineFixture(1.3);
  const result = spawnSync(process.execPath, ['src/cli/build-youtube-timeline.js', '--dir', project], {
    cwd: process.cwd(),
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const timeline = await readJson(path.join(project, '99-technik/FINAL_TIMELINE.json'));
  assert.equal(timeline.endHoldSeconds, 1.3);
  assert.equal(timeline.audioDurationSeconds, 10);
  assert.equal(timeline.images.at(-1).endSeconds, 11.3);
});

test('Timeline blockiert für Schema 12 einen zu kurzen Schluss-Hold', async () => {
  const project = await makeTimelineFixture(0.6);
  const result = spawnSync(process.execPath, ['src/cli/build-youtube-timeline.js', '--dir', project], {
    cwd: process.cwd(),
    encoding: 'utf8'
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /zwischen 1\.2 und 1\.5/);
});

test('aktuelles Liberalismus-Projekt rendert künftig mit 1,3 Sekunden Schlussbild', async () => {
  const meta = await readJson(`${LIBERALISMUS}/99-technik/video.json`);
  assert.equal(meta.endHoldPolicyVersion, 1);
  assert.equal(meta.endHoldPolicy.lastImageMustRemainVisibleAfterLastWord, true);
  assert.equal(meta.renderPolicy.endHoldSeconds, 1.3);
});
