import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const PROJECT = 'youtube/2026-KW39_21-09_bis_27-09/warum-ist-kaliningrad-von-russland-getrennt';

test('Asset Generation Policy V1 erzwingt 3x Cover und Single-Pass für alle anderen Bilder', async () => {
  const [policy, meta, workflow, templatePrompt, projectPrompt] = await Promise.all([
    readFile('config/youtube-channel-policy.json', 'utf8').then(JSON.parse),
    readFile(`${PROJECT}/99-technik/video.json`, 'utf8').then(JSON.parse),
    readFile('youtube/YOUTUBE_WORKFLOW.md', 'utf8'),
    readFile('youtube/templates/video-template/00-bildprompts/google-flow-prompt.txt', 'utf8'),
    readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8')
  ]);

  assert.equal(policy.assetGenerationPolicyVersion, 1);
  assert.equal(policy.assetGenerationPolicy.coverCandidateCount, 3);
  assert.equal(policy.assetGenerationPolicy.nonCoverGenerationCount, 1);
  assert.equal(policy.assetGenerationPolicy.nonCoverManualWaveReviewForbidden, true);
  assert.equal(policy.assetGenerationPolicy.renameEachFinalImageExactlyOnce, true);
  assert.equal(policy.assetGenerationPolicy.finalImagesFlatInSingleFolder, true);

  assert.equal(meta.schemaVersion, 9);
  assert.equal(meta.assetGenerationPolicyVersion, 1);
  assert.equal(meta.assetGenerationPolicy.coverCandidateCount, 3);
  assert.equal(meta.assetGenerationPolicy.nonCoverGenerationCount, 1);
  assert.equal(meta.assetGenerationPolicy.maxConcurrentGenerations, 5);
  assert.equal(meta.assetGenerationPolicy.finalImageDirectory, '00-bildprompts/images');

  for (const text of [workflow, templatePrompt, projectPrompt]) {
    assert.match(text, /COVER = 3 CANDIDATES HARD LOCK/);
    assert.match(text, /NON-COVER = SINGLE GENERATION HARD LOCK/);
    assert.match(text, /FINAL IMAGE FOLDER HARD LOCK/);
  }

  assert.doesNotMatch(templatePrompt, /Welle prüfen/i);
  assert.doesNotMatch(projectPrompt, /vollständig prüfen\. Erst danach/i);
  assert.doesNotMatch(projectPrompt, /Fehler nur im betroffenen Bild regenerieren/i);
});

test('Kaliningrad-Projekt besteht Phase-1-Gate mit Asset Generation Policy V1', () => {
  const result = spawnSync(process.execPath, [
    'src/cli/validate-youtube-phase1-policy.js',
    '--dir', PROJECT
  ], { encoding: 'utf8' });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Asset Generation Policy V1/);
});

test('Phase-2-Asset-Gate akzeptiert nur einen flachen finalen Bildsatz ohne Cover-Kandidaten', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'youtube-phase2-assets-'));
  try {
    const tech = path.join(temp, '99-technik');
    const images = path.join(temp, '00-bildprompts', 'images');
    await mkdir(tech, { recursive: true });
    await mkdir(images, { recursive: true });
    await writeFile(path.join(tech, 'video.json'), JSON.stringify({
      schemaVersion: 9,
      plannedImageCount: 3,
      assetGenerationPolicy: {
        finalImageDirectory: '00-bildprompts/images'
      }
    }), 'utf8');

    for (const name of ['Bild 01.png', 'Bild 02.png', 'Bild 03.png']) {
      await writeFile(path.join(images, name), 'x');
    }

    let result = spawnSync(process.execPath, ['src/cli/validate-youtube-phase2-assets.js', '--dir', temp], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /BESTANDEN/);

    await writeFile(path.join(images, 'Bild 01 - Version A.png'), 'x');
    result = spawnSync(process.execPath, ['src/cli/validate-youtube-phase2-assets.js', '--dir', temp], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, /Unerlaubte\/temporäre PNG-Datei/);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test('Normale Phase 3 führt das Phase-2-Asset-Gate vor Audio und Render aus', async () => {
  const phase3 = await readFile('src/cli/phase3-youtube.js', 'utf8');
  const phase1Index = phase3.indexOf("validate-youtube-phase1-policy.js");
  const phase2Index = phase3.indexOf("validate-youtube-phase2-assets.js");
  const alignIndex = phase3.indexOf("auto-align-youtube.js");
  assert.ok(phase1Index >= 0);
  assert.ok(phase2Index > phase1Index);
  assert.ok(alignIndex > phase2Index);
});
