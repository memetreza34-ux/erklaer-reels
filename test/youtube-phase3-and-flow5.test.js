import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { findAnchorInWords } from '../src/core/youtube-audio-alignment.js';

test('YouTube-Anchor wird monoton an echten Wortzeiten gefunden', () => {
  const words = [
    { word: 'Hallo', start: 0.1, end: 0.3 },
    { word: 'Welt', start: 0.31, end: 0.5 },
    { word: 'Doch', start: 1.2, end: 1.4 },
    { word: 'je', start: 1.41, end: 1.5 },
    { word: 'komplexer', start: 1.51, end: 1.9 },
    { word: 'Gesellschaften', start: 1.91, end: 2.4 }
  ];
  const hit = findAnchorInWords('Doch je komplexer Gesellschaften', words, 2);
  assert.equal(hit.wordIndex, 2);
  assert.equal(hit.startSeconds, 1.2);
  assert.equal(hit.confidence, 1);
  assert.equal(findAnchorInWords('Doch je komplexer Gesellschaften', words, 3), null);
});

test('YouTube-Dokumentation erzwingt 5er-Wellen statt 10er-Parallelgenerierung', async () => {
  const [readme, workflow, pacing] = await Promise.all([
    readFile('youtube/README.md', 'utf8'),
    readFile('youtube/YOUTUBE_WORKFLOW.md', 'utf8'),
    readFile('youtube/ADAPTIVE_PACING_V2.md', 'utf8')
  ]);
  for (const text of [readme, workflow, pacing]) {
    assert.match(text, /5 Bilder gleichzeitig|5er-Wellen|5er-Parallelregel/);
    assert.match(text, /maximal|höchstens|mehr als fünf/);
  }
  assert.doesNotMatch(readme, /immer nur \*\*eine aktive Bildgenerierung\*\*/i);
});
