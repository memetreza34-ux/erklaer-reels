import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

async function text(file) {
  return readFile(path.resolve(file), 'utf8');
}

test('Neue Reels verankern das verpflichtende Quellen-Schema außerhalb von sources.md', async () => {
  const creator = await text('src/cli/create-reel.js');
  assert.match(creator, /sourceQualitySchemaVersion = 2/);
  assert.match(creator, /buildSourcesTemplate/);
});

test('Word-Sync-CLI bindet Vorbereitung und Anwendung an Audio-Fingerprints', async () => {
  const source = await text('src/cli/sync-words.js');
  assert.match(source, /invalidateStaleWordSyncWorkbench/);
  assert.match(source, /stampPreparedWordSyncAudioBinding/);
  assert.match(source, /verifyPreparedWordSyncAudioBinding/);
  assert.match(source, /stampAppliedWordSyncAudioBinding/);
});

test('Audio-Pacing-CLI bindet die echte Lautheitsmessung an die Ausgabedatei', async () => {
  const source = await text('src/cli/trim-pauses.js');
  assert.match(source, /stampAudioPacingFileBinding/);
  assert.match(source, /Gemessen:/);
  assert.match(source, /SHA-256-Fingerprint/);
});

test('Finalisierung, Render-CLI und Core-Renderer prüfen alle verpflichtenden Gates', async () => {
  const finalizer = await text('src/cli/finalize-reel.js');
  const renderer = await text('src/cli/render-reel.js');
  const coreRenderer = await text('src/core/remotion-renderer.js');

  for (const source of [finalizer, renderer, coreRenderer]) {
    assert.match(source, /verifyRequiredSourceQuality/);
    assert.match(source, /verifyAudioPacingFileBinding/);
    assert.match(source, /verifyAppliedWordSyncAudioBinding/);
  }
  assert.match(renderer, /auch mit --force blockiert/);
  assert.match(coreRenderer, /veralteten Lautheitsmesswerte/);
  assert.match(coreRenderer, /veralteten Wortzeiten/);
});

test('Statusanzeige berücksichtigt Quellen-, Pacing- und Word-Sync-Gates', async () => {
  const status = await text('src/cli/reel-status.js');
  assert.match(status, /verifyRequiredSourceQuality/);
  assert.match(status, /verifyAudioPacingFileBinding/);
  assert.match(status, /verifyAppliedWordSyncAudioBinding/);
  assert.match(status, /sourceQualityGatePassed/);
  assert.match(status, /audioPacingFileBindingPassed/);
  assert.match(status, /wordSyncAudioBindingPassed/);
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

test('Fingerprint-Guards prüfen Manifest und Render-Plan und halten Legacy kompatibel', async () => {
  const wordSyncGuard = await text('src/core/word-sync-audio-guard.js');
  const pacingGuard = await text('src/core/audio-pacing-file-guard.js');

  for (const source of [wordSyncGuard, pacingGuard]) {
    assert.match(source, /assets-manifest\.json/);
    assert.match(source, /render-plan\.json/);
    assert.match(source, /audioFingerprintSha256/);
  }
  assert.match(wordSyncGuard, /version = Math\.max\(4/);
  assert.match(wordSyncGuard, /legacy: Boolean\(report\)/);
  assert.match(pacingGuard, /version = Math\.max\(6/);
  assert.match(pacingGuard, /legacy: Boolean\(report\)/);
});
