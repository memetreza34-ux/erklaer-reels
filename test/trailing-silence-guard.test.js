import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TRAILING_SILENCE_POLICY,
  parseTrailingSilence
} from '../src/core/trailing-silence-guard.js';

test('erkennt mehrsekündige Endstille am Dateiende', () => {
  const output = `
[silencedetect] silence_start: 55.857
[silencedetect] silence_end: 63.872 | silence_duration: 8.015
`;
  const trailing = parseTrailingSilence(output, 63.9);
  assert.ok(trailing > 8 && trailing < 8.1);
  assert.ok(trailing > TRAILING_SILENCE_POLICY.maximumTrailingSilenceSeconds);
});

test('ignoriert kurze Stille mitten im Voice-over', () => {
  const output = `
[silencedetect] silence_start: 20.100
[silencedetect] silence_end: 20.350 | silence_duration: 0.250
`;
  assert.equal(parseTrailingSilence(output, 58), 0);
});

test('akzeptiert Audio ohne erkannte Endstille', () => {
  assert.equal(parseTrailingSilence('', 57.4), 0);
});
