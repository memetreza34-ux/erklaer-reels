import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildAudioPacingFilter,
  buildSilenceRemovalFilter
} from '../src/core/audio-tightener.js';

test('verwendet standardmäßig kurze Pausen und 1.05x Tempo', () => {
  const filter = buildAudioPacingFilter();

  assert.match(filter, /stop_duration=0\.24/);
  assert.match(filter, /stop_silence=0\.05/);
  assert.match(filter, /stop_threshold=-35dB/);
  assert.match(filter, /stop_periods=-1/);
  assert.match(filter, /atempo=1\.05/);
});

test('unterstützt benutzerdefinierte sichere Pacing-Werte', () => {
  const filter = buildSilenceRemovalFilter({
    thresholdDb: -32,
    minimumLongPauseSeconds: 0.3,
    retainedPauseSeconds: 0.08,
    playbackRate: 1.04
  });

  assert.match(filter, /stop_duration=0\.3/);
  assert.match(filter, /stop_silence=0\.08/);
  assert.match(filter, /stop_threshold=-32dB/);
  assert.match(filter, /atempo=1\.04/);
});

test('blockiert übertrieben schnelle Voice-over-Werte', () => {
  assert.throws(
    () => buildAudioPacingFilter({ playbackRate: 1.2 }),
    /zwischen 1,00 und 1,10/
  );
});
