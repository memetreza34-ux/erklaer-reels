import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

async function text(file) {
  return readFile(path.resolve(file), 'utf8');
}

test('Word-Sync-CLI bindet Vorbereitung und Anwendung an Audio-Fingerprints', async () => {
  const source = await text('src/cli/sync-words.js');
  assert.match(source, /invalidateStaleWordSyncWorkbench/);
  assert.match(source, /stampPreparedWordSyncAudioBinding/);
  assert.match(source, /verifyPreparedWordSyncAudioBinding/);
  assert.match(source, /stampAppliedWordSyncAudioBinding/);
});

test('Finalisierung und Renderer blockieren veraltete Word-Sync-Audiodateien', async () => {
  const finalizer = await text('src/cli/finalize-reel.js');
  const renderer = await text('src/cli/render-reel.js');

  assert.match(finalizer, /verifyAppliedWordSyncAudioBinding/);
  assert.match(renderer, /verifyAppliedWordSyncAudioBinding/);
  assert.match(renderer, /auch mit --force blockiert/);
});

test('aktuelle Produktions-CLI-Beispiele verwenden reels statt content', async () => {
  for (const file of [
    'src/cli/check-content.js',
    'src/cli/finalize-reel.js',
    'src/cli/render-reel.js'
  ]) {
    const source = await text(file);
    assert.match(source, /reels\/\.\.\.\/reel-01_titel/);
    assert.doesNotMatch(source, /content\/\.\.\.\/reel-01_titel/);
  }
});

test('strenges Content-Gate verwendet vollständiges Quellen-QC-Ergebnis', async () => {
  const source = await text('src/cli/check-content.js');
  assert.match(source, /inspectSourcesMarkdown/);
  assert.match(source, /strictSourceGatePassed/);
  assert.match(source, /sourceQuality\.passed === true/);
  assert.match(source, /hasMalformedUrlField/);
});

test('Fingerprint-Guard prüft Manifest und Render-Plan und hält Legacy kompatibel', async () => {
  const source = await text('src/core/word-sync-audio-guard.js');
  assert.match(source, /assets-manifest\.json/);
  assert.match(source, /render-plan\.json/);
  assert.match(source, /audioFingerprintSha256/);
  assert.match(source, /version = Math\.max\(4/);
  assert.match(source, /legacy: Boolean\(report\)/);
});
