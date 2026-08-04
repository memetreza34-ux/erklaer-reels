import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildSubtitleCuesFromCodexWords,
  chunkTimedWords,
  tokenizeScript,
  validateCodexWorkbench
} from '../src/core/codex-word-sync.js';

test('zerlegt den Sprechertext in eine Codex-Arbeitsliste', () => {
  const words = tokenizeScript('Warum dauert Warten so lange?');
  assert.equal(words.length, 5);
  assert.equal(words[0].text, 'Warum');
  assert.equal(words[4].text, 'lange?');
  assert.equal(words.every((word) => word.reviewed === false), true);
});

test('teilt bestätigte Wortzeiten in kurze Untertitelblöcke', () => {
  const words = Array.from({ length: 10 }, (_, index) => ({
    text: `Wort${index + 1}`,
    startSeconds: index * 0.3,
    endSeconds: index * 0.3 + 0.2,
    confidence: 0.95,
    reviewed: true
  }));

  const chunks = chunkTimedWords(words, { minWords: 3, maxWords: 6 });
  assert.equal(chunks.flat().length, 10);
  assert.equal(chunks.every((chunk) => chunk.length <= 6), true);
});

test('Legacy-Wort-Sync übernimmt die neue zentrale Untertitelposition und weiße Palette', () => {
  const words = [
    { text: 'Warum', startSeconds: 0.1, endSeconds: 0.4, confidence: 0.98, reviewed: true },
    { text: 'dauert', startSeconds: 0.45, endSeconds: 0.75, confidence: 0.97, reviewed: true },
    { text: 'Warten', startSeconds: 0.8, endSeconds: 1.2, confidence: 0.96, reviewed: true },
    { text: 'so', startSeconds: 1.25, endSeconds: 1.38, confidence: 0.99, reviewed: true },
    { text: 'lange?', startSeconds: 1.42, endSeconds: 1.8, confidence: 0.97, reviewed: true }
  ];
  const scenes = [{ sceneId: 'scene-01', startSeconds: 0, endSeconds: 3 }];

  const result = buildSubtitleCuesFromCodexWords(words, scenes);
  assert.equal(result.cues.length, 1);
  assert.equal(result.cues[0].text, 'Warum dauert Warten so lange?');
  assert.equal(result.cues[0].position, 'lower');
  assert.equal(result.cues[0].verticalPositionPercent, 76);
  assert.equal(result.cues[0].textColor, '#F5F7FA');
  assert.equal(result.cues[0].highlightColor, '#F5F7FA');
  assert.equal(result.cues[0].timingSource, 'codex-local-audio-review');
  assert.equal(result.cues[0].wordTimings.length, 5);
});

test('strenge Prüfung akzeptiert vollständig bestätigte Wortzeiten', () => {
  const words = tokenizeScript('Das ist ein Test.').map((word, index) => ({
    ...word,
    startSeconds: index * 0.35,
    endSeconds: index * 0.35 + 0.25,
    confidence: 0.95,
    reviewed: true
  }));
  const workbench = {
    audioDurationSeconds: 3,
    scriptTextHash: null,
    words
  };

  const result = validateCodexWorkbench(workbench, { strict: true });
  assert.equal(result.passed, true);
  assert.equal(result.coverage, 1);
});
