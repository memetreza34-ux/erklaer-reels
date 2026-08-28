import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

async function text(file) {
  return readFile(path.resolve(file), 'utf8');
}

test('Neue Reels verankern Quellen-Schema und feste Bildwelt direkt im Workspace-Core', async () => {
  const workspace = await text('src/core/workspace.js');
  const creator = await text('src/cli/create-reel.js');
  const fixedWorld = await text('src/shared/fixed-visual-world.js');

  assert.match(workspace, /FIXED_VISUAL_STYLE_ID/);
  assert.match(workspace, /visualStyleId:\s*FIXED_VISUAL_STYLE_ID/);
  assert.match(workspace, /visualStyleReason:\s*FIXED_VISUAL_STYLE_REASON/);
  assert.match(fixedWorld, /modern-countryball-explainer/);
  assert.match(fixedWorld, /modern minimalist countryball-inspired style/i);
  assert.match(workspace, /sourceQualitySchemaVersion:\s*3/);
  assert.match(workspace, /buildSourcesTemplate/);

  assert.doesNotMatch(creator, /sourceQualitySchemaVersion\s*=\s*3/);
  assert.doesNotMatch(creator, /buildSourcesTemplate/);
});

test('Audio-Pacing-CLI bindet die echte Lautheitsmessung an die Ausgabedatei', async () => {
  const source = await text('src/cli/trim-pauses.js');
  assert.match(source, /stampAudioPacingFileBinding/);
  assert.match(source, /Gemessen:/);
  assert.match(source, /SHA-256-Fingerprint/);
});

test('Finalisierung und Renderer prüfen Quellen und Audio, aber keinen Word-Sync', async () => {
  const cliFinalizer = await text('src/cli/finalize-reel.js');
  const renderer = await text('src/cli/render-reel.js');
  const coreRenderer = await text('src/core/remotion-renderer.js');
  const finalizer = await text('src/core/finalize-reel.js');

  for (const source of [cliFinalizer, renderer, coreRenderer, finalizer]) {
    assert.match(source, /verifyRequiredSourceQuality/);
    assert.match(source, /verifyAudioPacingFileBinding/);
    assert.doesNotMatch(source, /verifyAppliedWordSyncAudioBinding/);
  }
  assert.match(renderer, /auch mit --force blockiert/);
  assert.match(coreRenderer, /veralteten Lautheitsmesswerte/);
  assert.match(finalizer, /wordSyncRequired:\s*false/);
});

test('Statusanzeige berücksichtigt Quellen- und Pacing-Gates und markiert Untertitel deaktiviert', async () => {
  const status = await text('src/cli/reel-status.js');
  assert.match(status, /verifyRequiredSourceQuality/);
  assert.match(status, /verifyAudioPacingFileBinding/);
  assert.doesNotMatch(status, /verifyAppliedWordSyncAudioBinding/);
  assert.match(status, /subtitlesEnabled:\s*false/);
  assert.match(status, /wordSyncRequired:\s*false/);
});

test('aktuelle Produktions-CLI-Beispiele verwenden reels statt content', async () => {
  for (const file of [
    'src/cli/check-content.js',
    'src/cli/finalize-reel.js',
    'src/cli/render-reel.js',
    'src/cli/reel-status.js',
    'src/cli/trim-pauses.js'
  ]) {
    const source = await text(file);
    assert.match(source, /reels\/\.\.\.\/reel-01_titel/);
    assert.doesNotMatch(source, /content\/\.\.\.\/reel-01_titel/);
  }
});

test('strenges Content-Gate verwendet das verpflichtende Quellen-Schema', async () => {
  const source = await text('src/cli/check-content.js');
  assert.match(source, /verifyRequiredSourceQuality/);
  assert.match(source, /strictSourceGatePassed/);
  assert.match(source, /sourceGate\.passed === true/);
  assert.match(source, /hasMalformedUrlField/);
});

test('Legacy-Word-Sync-Hilfen dürfen bestehen, sind aber nicht Teil des normalen Renderpfads', async () => {
  const wordSyncGuard = await text('src/core/word-sync-audio-guard.js');
  const wordSyncCli = await text('src/cli/sync-words.js');
  const renderCli = await text('src/cli/render-reel.js');
  const finalizer = await text('src/core/finalize-reel.js');
  const packageJson = JSON.parse(await text('package.json'));

  assert.match(wordSyncGuard, /audioFingerprintSha256/);
  assert.match(wordSyncCli, /verifyWordSyncTimelineReadiness/);
  assert.doesNotMatch(renderCli, /sync:words|Word-Sync-Audio|Wortzeiten/);
  assert.doesNotMatch(finalizer, /sync:words|wordSyncAudioBinding/);
  assert.equal(packageJson.scripts['sync:words'], undefined);
  assert.equal(packageJson.scripts['legacy:sync:words'], 'node src/cli/sync-words.js');
});
