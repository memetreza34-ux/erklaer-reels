import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSilenceRemovalFilter } from '../src/core/audio-tightener.js';

test('behält kurze natürliche Satzpausen und entfernt nur längere Pausen', () => {
  const filter = buildSilenceRemovalFilter({
    thresholdDb: -35,
    minimumLongPauseSeconds: 0.25,
    retainedPauseSeconds: 0.12
  });

  assert.match(filter, /stop_duration=0\.25/);
  assert.match(filter, /stop_silence=0\.12/);
  assert.match(filter, /stop_threshold=-35dB/);
  assert.match(filter, /stop_periods=-1/);
});
