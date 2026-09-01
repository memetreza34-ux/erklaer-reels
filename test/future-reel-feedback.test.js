import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildAudioPacingFilter } from '../src/core/audio-tightener.js';

test('Voice-Pacing entfernt Endstille vor dem festen Schluss-Hold', () => {
  const filter = buildAudioPacingFilter();
  assert.equal((filter.match(/areverse/g) ?? []).length, 2);
  assert.match(filter, /start_silence=0\.05/);
});

test('interne Bildwechsel-SFX können am echten Bildphasen-Audio-Cue hängen', async () => {
  const timeline = await readFile(new URL('../src/core/timeline.js', import.meta.url), 'utf8');
  assert.match(timeline, /phaseCueByTarget/);
  assert.match(timeline, /exact-image-audio-cue/);
  assert.match(timeline, /soundTimeline\(effect, item, audioSync\)/);
});
