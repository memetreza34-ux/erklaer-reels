import test from 'node:test';
import assert from 'node:assert/strict';

import {
  activeWordIndex,
  buildWordTimings,
  validateExactWordTimings
} from '../src/renderer/subtitle-timing.js';

test('verwendet exakte Wortzeiten relativ zum Untertitel-Cue', () => {
  const cue = {
    text: 'Das ist wichtig',
    startSeconds: 10,
    endSeconds: 12,
    wordTimings: [
      { text: 'Das', startSeconds: 10, endSeconds: 10.4 },
      { text: 'ist', startSeconds: 10.4, endSeconds: 10.8 },
      { text: 'wichtig', startSeconds: 10.8, endSeconds: 12 }
    ]
  };
  const words = buildWordTimings(cue);

  assert.equal(validateExactWordTimings(cue).valid, true);
  assert.ok(Math.abs(words[1].startSeconds - 0.4) < 1e-9);
  assert.equal(words[1].timingStatus, 'exact');
  assert.equal(activeWordIndex(words, 0.55), 1);
});

test('entfernt die Wortmarkierung während einer echten Sprechpause', () => {
  const cue = {
    text: 'Hallo Welt',
    startSeconds: 5,
    endSeconds: 7,
    wordTimings: [
      { text: 'Hallo', startSeconds: 5.0, endSeconds: 5.35 },
      { text: 'Welt', startSeconds: 5.9, endSeconds: 6.25 }
    ]
  };
  const words = buildWordTimings(cue);

  assert.equal(activeWordIndex(words, 0.2), 0);
  assert.equal(activeWordIndex(words, 0.55), -1);
  assert.equal(activeWordIndex(words, 1.0), 1);
  assert.equal(activeWordIndex(words, 1.4), -1);
});

test('zeigt ohne exakte Wortzeiten keine geschätzte Wortmarkierung', () => {
  const words = buildWordTimings({
    text: 'Kurze Wörter dauern weniger',
    startSeconds: 0,
    endSeconds: 2
  });

  assert.equal(words.length, 4);
  assert.equal(words.every((word) => word.timingStatus === 'missing'), true);
  assert.equal(activeWordIndex(words, 0.8), -1);
});

test('lehnt falsch sortierte oder unvollständige Wortzeiten ab', () => {
  const result = validateExactWordTimings({
    text: 'Braun folgt Stimme',
    startSeconds: 2,
    endSeconds: 4,
    words: [
      { text: 'Braun', startSeconds: 2.1, endSeconds: 2.5 },
      { text: 'folgt', startSeconds: 2.4, endSeconds: 2.8 },
      { text: 'falsch', startSeconds: 2.9, endSeconds: 3.3 }
    ]
  });

  assert.equal(result.valid, false);
  assert.ok(result.issues.length >= 2);
});
