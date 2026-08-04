import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildAudioPacingFilter,
  buildSilenceRemovalFilter
} from '../src/core/audio-tightener.js';
import {
  AUDIO_PACING_STYLE,
  isTargetPlaybackRate
} from '../src/shared/audio-pacing-style.js';

test('verwendet standardmäßig kurze Pausen, 1.10x, Social-Media-Lautheit und 48 kHz', () => {
  const filter = buildAudioPacingFilter();

  assert.match(filter, /stop_duration=0\.24/);
  assert.match(filter, /stop_silence=0\.05/);
  assert.match(filter, /stop_threshold=-35dB/);
  assert.match(filter, /stop_periods=-1/);
  assert.match(filter, /atempo=1\.1/);
  assert.match(filter, /loudnorm=I=-16:TP=-1\.5:LRA=11/);
  assert.match(filter, /aresample=48000/);
});

test('unterstützt benutzerdefinierte sichere Pacing-, Lautheits- und Sample-Rate-Werte', () => {
  const filter = buildSilenceRemovalFilter({
    thresholdDb: -32,
    minimumLongPauseSeconds: 0.3,
    retainedPauseSeconds: 0.08,
    playbackRate: 1.04,
    loudnessTargetLufs: -15,
    truePeakDbtp: -1,
    loudnessRangeLra: 9,
    outputSampleRateHz: 44100
  });

  assert.match(filter, /stop_duration=0\.3/);
  assert.match(filter, /stop_silence=0\.08/);
  assert.match(filter, /stop_threshold=-32dB/);
  assert.match(filter, /atempo=1\.04/);
  assert.match(filter, /loudnorm=I=-15:TP=-1:LRA=9/);
  assert.match(filter, /aresample=44100/);
});

test('erkennt ausschließlich das feste Produktionsziel von 1.10x', () => {
  assert.equal(isTargetPlaybackRate(1.1), true);
  assert.equal(isTargetPlaybackRate(1.1005), true);
  assert.equal(isTargetPlaybackRate(1.05), false);
  assert.equal(AUDIO_PACING_STYLE.playbackRate, 1.1);
  assert.equal(AUDIO_PACING_STYLE.outputSampleRateHz, 48000);
});

test('blockiert übertrieben schnelle Voice-over-Werte', () => {
  assert.throws(
    () => buildAudioPacingFilter({ playbackRate: 1.2 }),
    /zwischen 1,00 und 1,10/
  );
});
