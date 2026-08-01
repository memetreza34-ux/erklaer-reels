import test from 'node:test';
import assert from 'node:assert/strict';

import { activeWordIndex, buildWordTimings } from '../src/renderer/subtitle-timing.js';

test('verwendet exakte Wortzeiten relativ zum Untertitel-Cue', () => {
  const words = buildWordTimings({
    text: 'Das ist wichtig',
    startSeconds: 10,
    endSeconds: 12,
    words: [
      { text: 'Das', startSeconds: 10, endSeconds: 10.4 },
      { text: 'ist', startSeconds: 10.4, endSeconds: 10.8 },
      { text: 'wichtig', startSeconds: 10.8, endSeconds: 12 }
    ]
  });

  assert.ok(Math.abs(words[1].startSeconds - 0.4) < 1e-9);
  assert.equal(words[1].timingStatus, 'exact');
  assert.equal(activeWordIndex(words, 0.55), 1);
});

test('erstellt eine gewichtete Schätzung, wenn Wortzeiten fehlen', () => {
  const words = buildWordTimings({
    text: 'Kurze Wörter dauern weniger',
    startSeconds: 0,
    endSeconds: 2
  });

  assert.equal(words.length, 4);
  assert.equal(words[0].startSeconds, 0);
  assert.equal(words.at(-1).endSeconds, 2);
  assert.equal(words.every((word) => word.timingStatus === 'estimated'), true);
});
