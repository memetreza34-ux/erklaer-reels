import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildSubtitleCuesFromWords,
  chunkTranscriptWords,
  extractGeminiWordInfo,
  parseOffsetSeconds
} from '../src/core/gemini-word-sync.js';

test('liest Gemini-Zeitoffsets in Sekunden, Millisekunden und ISO-Dauer', () => {
  assert.equal(parseOffsetSeconds('1.25s'), 1.25);
  assert.equal(parseOffsetSeconds('850ms'), 0.85);
  assert.equal(parseOffsetSeconds('PT1M2.5S'), 62.5);
});

test('findet WordInfo rekursiv und entfernt Duplikate', () => {
  const response = {
    steps: [{
      content: [{
        type: 'text',
        annotations: [
          { type: 'word_info', text: 'Warum', start_offset: '0.10s', end_offset: '0.42s' },
          { type: 'word_info', text: 'Warum', start_offset: '0.10s', end_offset: '0.42s' },
          { type: 'word_info', text: 'warten', start_offset: '0.48s', end_offset: '0.90s' }
        ]
      }]
    }]
  };

  const words = extractGeminiWordInfo(response);
  assert.equal(words.length, 2);
  assert.deepEqual(words[0], {
    text: 'Warum',
    startSeconds: 0.1,
    endSeconds: 0.42,
    speaker: null
  });
});

test('teilt Transkript in kurze Untertitelblöcke', () => {
  const words = Array.from({ length: 10 }, (_, index) => ({
    text: `Wort${index + 1}`,
    startSeconds: index * 0.3,
    endSeconds: index * 0.3 + 0.2
  }));

  const chunks = chunkTranscriptWords(words, { minWords: 3, maxWords: 6 });
  assert.equal(chunks.flat().length, 10);
  assert.equal(chunks.every((chunk) => chunk.length <= 6), true);
});

test('erzeugt exakte Cues mit tiefer Position und Wortzeiten', () => {
  const words = [
    { text: 'Warum', startSeconds: 0.1, endSeconds: 0.4 },
    { text: 'dauert', startSeconds: 0.45, endSeconds: 0.75 },
    { text: 'Warten', startSeconds: 0.8, endSeconds: 1.2 },
    { text: 'so', startSeconds: 1.25, endSeconds: 1.38 },
    { text: 'lange?', startSeconds: 1.42, endSeconds: 1.8 }
  ];
  const scenes = [{ sceneId: 'scene-01', startSeconds: 0, endSeconds: 3 }];

  const result = buildSubtitleCuesFromWords(words, scenes);
  assert.equal(result.cues.length, 1);
  assert.equal(result.cues[0].text, 'Warum dauert Warten so lange?');
  assert.equal(result.cues[0].verticalPositionPercent, 79.5);
  assert.equal(result.cues[0].wordTimings.length, 5);
  assert.equal(result.cues[0].timingStatus, 'gemini-word-synced');
  assert.ok(result.cues[0].startSeconds <= words[0].startSeconds);
  assert.ok(result.cues[0].endSeconds >= words.at(-1).endSeconds);
});
