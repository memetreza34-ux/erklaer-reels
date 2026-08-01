import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getActiveSubtitleWordIndex,
  getSubtitleVerticalPositionPercent,
  validateSubtitleWordTimings
} from '../src/core/subtitle-timing.js';

test('setzt Untertitel standardmäßig tief, aber innerhalb der sicheren Zone', () => {
  assert.equal(getSubtitleVerticalPositionPercent({}), 77);
  assert.equal(getSubtitleVerticalPositionPercent({ verticalPositionPercent: 70 }), 73);
  assert.equal(getSubtitleVerticalPositionPercent({ verticalPositionPercent: 83 }), 79);
  assert.equal(getSubtitleVerticalPositionPercent({ verticalPositionPercent: 76 }), 76);
});

test('markiert nur das Wort, dessen echter Startzeitpunkt bereits erreicht ist', () => {
  const cue = {
    text: 'Warum holen manche Menschen',
    startSeconds: 1,
    endSeconds: 2.8,
    wordTimings: [
      { text: 'Warum', startSeconds: 1.05, endSeconds: 1.35 },
      { text: 'holen', startSeconds: 1.42, endSeconds: 1.68 },
      { text: 'manche', startSeconds: 1.76, endSeconds: 2.08 },
      { text: 'Menschen', startSeconds: 2.16, endSeconds: 2.62 }
    ]
  };

  assert.equal(validateSubtitleWordTimings(cue).valid, true);
  assert.equal(getActiveSubtitleWordIndex(cue, 1), -1);
  assert.equal(getActiveSubtitleWordIndex(cue, 1.2), 0);
  assert.equal(getActiveSubtitleWordIndex(cue, 1.55), 1);
  assert.equal(getActiveSubtitleWordIndex(cue, 1.9), 2);
  assert.equal(getActiveSubtitleWordIndex(cue, 2.3), 3);
});

test('verhindert eine gelbe Markierung bei geschätzten oder fehlerhaften Zeiten', () => {
  const missing = {
    text: 'Nur geschätzter Text',
    startSeconds: 0,
    endSeconds: 2
  };
  assert.equal(validateSubtitleWordTimings(missing).valid, false);
  assert.equal(getActiveSubtitleWordIndex(missing, 1), -1);

  const mismatched = {
    text: 'Zwei richtige Wörter',
    startSeconds: 0,
    endSeconds: 2,
    wordTimings: [
      { text: 'Falscher', startSeconds: 0.1, endSeconds: 0.5 },
      { text: 'Text', startSeconds: 0.6, endSeconds: 1 }
    ]
  };
  assert.equal(validateSubtitleWordTimings(mismatched).valid, false);
});
