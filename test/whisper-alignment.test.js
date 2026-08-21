import test from 'node:test';
import assert from 'node:assert/strict';

import {
  alignAudioCueTimings,
  alignWhisperWords,
  extractWhisperWords
} from '../src/core/whisper-alignment.js';

function scriptWords(...texts) {
  return texts.map((text, index) => ({
    index: index + 1,
    text,
    startSeconds: null,
    endSeconds: null,
    confidence: null,
    reviewed: false
  }));
}

test('übernimmt nur echte monotone Whisper-Zeiten ohne Szenen-Clamping', () => {
  const result = alignWhisperWords(
    scriptWords('Das', 'stimmt.'),
    [
      { word: 'Das', start: 4.8, end: 5.05 },
      { word: 'stimmt.', start: 5.08, end: 5.42 }
    ]
  );

  assert.equal(result.passed, true);
  assert.equal(result.words[0].startSeconds, 4.8);
  assert.equal(result.words[1].endSeconds, 5.42);
  assert.equal(result.words.every((word) => word.reviewed === true), true);
  assert.equal(result.report.fallbackCount, 0);
});

test('akzeptiert exakt passende Whisper-Teilstücke eines Scriptworts', () => {
  const result = alignWhisperWords(
    scriptWords('Bundesverfassungsgericht'),
    [
      { word: 'Bundesverfassungs', start: 1.2, end: 1.7 },
      { word: 'gericht', start: 1.7, end: 2.05 }
    ]
  );

  assert.equal(result.passed, true);
  assert.equal(result.words[0].startSeconds, 1.2);
  assert.equal(result.words[0].endSeconds, 2.05);
  assert.equal(result.words[0].alignmentMethod, 'whisper-exact-group');
});

test('erfindet für fehlende Wörter keine Zeit oder Konfidenz', () => {
  const result = alignWhisperWords(
    scriptWords('Das', 'fehlt'),
    [{ word: 'Das', start: 0, end: 0.2 }]
  );

  assert.equal(result.passed, false);
  assert.equal(result.words[1].startSeconds, null);
  assert.equal(result.words[1].endSeconds, null);
  assert.equal(result.words[1].confidence, null);
  assert.equal(result.words[1].reviewed, false);
  assert.deepEqual(result.report.unmatchedScriptWords, ['fehlt']);
  assert.equal(result.report.fallbackCount, 0);
});

test('blockiert zusätzliche gesprochene Wörter statt sie zu überspringen', () => {
  const result = alignWhisperWords(
    scriptWords('Das', 'stimmt'),
    [
      { word: 'Das', start: 0, end: 0.2 },
      { word: 'wirklich', start: 0.21, end: 0.5 },
      { word: 'stimmt', start: 0.51, end: 0.8 }
    ]
  );

  assert.equal(result.passed, false);
  assert.deepEqual(result.report.extraWhisperWords, ['wirklich']);
  assert.equal(result.words[1].startSeconds, 0.51);
});

test('erfindet für nicht gefundene Bild-Cues keinen Zwei-Sekunden-Fallback', () => {
  const words = alignWhisperWords(
    scriptWords('Das', 'ist', 'der', 'Anfang.'),
    [
      { word: 'Das', start: 0, end: 0.2 },
      { word: 'ist', start: 0.21, end: 0.35 },
      { word: 'der', start: 0.36, end: 0.48 },
      { word: 'Anfang.', start: 0.49, end: 0.8 }
    ]
  ).words;
  const result = alignAudioCueTimings([
    { sceneId: 'scene-01', audioCue: 'Das ist' },
    { sceneId: 'scene-02', audioCue: 'nicht gesprochen' }
  ], words);

  assert.equal(result.passed, false);
  assert.equal(result.cueTimings[0].cueTimeSeconds, 0);
  assert.equal(result.cueTimings[0].matchMethod, 'whisper-word-alignment');
  assert.equal(result.cueTimings[1].cueTimeSeconds, null);
  assert.equal(result.cueTimings[1].confidence, null);
  assert.equal(result.cueTimings[1].matchMethod, 'unmatched');
  assert.deepEqual(result.report.unmatchedCues, ['scene-02']);
  assert.equal(result.report.fallbackCount, 0);
});

test('liest Whisper-Wörter aus Segmenten und verwirft ungültige Zeiten', () => {
  const words = extractWhisperWords({
    segments: [{ words: [
      { word: 'gültig', start: 0.1, end: 0.4 },
      { word: 'kaputt', start: 0.5, end: 0.3 },
      { word: 'ohne-start', start: null, end: 0.8 }
    ] }]
  });

  assert.deepEqual(words.map((word) => word.text), ['gültig']);
});
