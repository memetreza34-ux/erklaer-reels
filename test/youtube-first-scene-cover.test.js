import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const CURRENT = 'youtube/2026-KW39_21-09_bis_27-09/warum-gibt-es-zeitzonen';
const TEMPLATE = 'youtube/templates/video-template';

async function json(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

test('Cover Policy V1 macht Bild 01 verbindlich zu Cover, erster Szene und Thumbnail-Quelle', async () => {
  const policy = await json('config/youtube-channel-policy.json');
  assert.equal(policy.coverPolicyVersion, 1);
  assert.equal(policy.coverPolicy.firstSceneIsCover, true);
  assert.equal(policy.coverPolicy.coverImageNumber, 1);
  assert.equal(policy.coverPolicy.coverMustBeFirstTimelineImage, true);
  assert.equal(policy.coverPolicy.coverMustAlsoBeThumbnailSource, true);
  assert.equal(policy.coverPolicy.separateThumbnailImageForbidden, true);
  assert.equal(policy.coverPolicy.image00ForbiddenForNewProjects, true);
});

test('Template und aktuelles Zeitzonen-Video verwenden ausschließlich Option A', async () => {
  for (const dir of [TEMPLATE, CURRENT]) {
    const [meta, mapping, prompt] = await Promise.all([
      json(`${dir}/99-technik/video.json`),
      json(`${dir}/99-technik/BILD_AUDIO_ZUORDNUNG.json`),
      readFile(`${dir}/00-bildprompts/google-flow-prompt.txt`, 'utf8')
    ]);

    assert.ok(meta.schemaVersion >= 7);
    assert.equal(meta.coverPolicyVersion, 1);
    assert.equal(meta.coverPolicy.firstSceneIsCover, true);
    assert.equal(meta.coverPolicy.coverImageNumber, 1);
    assert.equal(meta.coverPolicy.coverMustAlsoBeThumbnailSource, true);
    assert.equal(meta.coverPolicy.separateThumbnailImageForbidden, true);
    assert.equal(meta.coverPolicy.image00Forbidden, true);

    assert.equal(mapping.coverImageNumber, 1);
    assert.equal(mapping.thumbnailImageNumber, 1);
    assert.equal(mapping.videoFirstImageNumber, 1);
    assert.equal(mapping.rules.firstSceneIsCover, true);
    assert.equal(mapping.rules.coverMustBeFirstTimelineImage, true);
    assert.equal(mapping.rules.coverAlsoUsedAsThumbnail, true);
    assert.equal(mapping.rules.separateThumbnailImageForbidden, true);

    assert.match(prompt, /COVER_POLICY_VERSION: 1/);
    assert.match(prompt, /FIRST SCENE = COVER HARD LOCK/);
    assert.match(prompt, /Bild 01 is the cover AND the first video scene/);
    assert.doesNotMatch(prompt, /BILD 00\s*[—-]\s*THUMBNAIL/i);
    assert.doesNotMatch(prompt, /Bild 00 separat/i);
  }
});

test('Zeitzonen Bild 01 ist direkt als Cover-Hook geplant', async () => {
  const [mapping, prompt] = await Promise.all([
    json(`${CURRENT}/99-technik/BILD_AUDIO_ZUORDNUNG.json`),
    readFile(`${CURRENT}/00-bildprompts/google-flow-prompt.txt`, 'utf8')
  ]);
  const first = mapping.images[0];
  assert.equal(first.imageNumber, 1);
  assert.match(first.startAnchor, /Stell dir vor: In Berlin ist Mittag/);
  assert.match(first.visualPurpose, /Cover \+ Hook/i);
  assert.match(prompt, /WARUM ZEITZONEN\?/);
  assert.match(prompt, /opening narration/i);
});

test('Export und Phase-3-Gate erzwingen Bild 01 auch technisch', async () => {
  const [finalizer, phase3] = await Promise.all([
    readFile('src/cli/finalize-youtube-export.js', 'utf8'),
    readFile('src/cli/validate-youtube-phase3.js', 'utf8')
  ]);
  assert.match(finalizer, /coverImageNumberForMeta/);
  assert.match(finalizer, /Bild 01 als Cover, erste Videoszene und Thumbnail-Quelle/);
  assert.match(phase3, /Cover Policy V1: Bild 01 muss Cover, Thumbnail-Quelle und erstes Videobild sein/);
  assert.match(phase3, /FINAL_TIMELINE muss mit Bild 01 bei 0,0 s beginnen/);
  assert.match(phase3, /THUMBNAIL\.png muss byte-identisch aus Bild 01\.png stammen/);
});

test('aktuelles Zeitzonen-Projekt besteht das Phase-1-Cover-Gate', () => {
  const result = spawnSync(process.execPath, [
    'src/cli/validate-youtube-phase1-policy.js',
    '--dir', CURRENT
  ], { encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /Cover Policy V1/);
});
