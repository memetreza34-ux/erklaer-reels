import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildTimedTranscriptText,
  buildUploadOverview,
  collectMeasuredWords
} from '../src/cli/finalize-youtube-export.js';

test('YouTube-Upload-Sammeldatei enthält Titel, Fließtext-Beschreibung, Kapitel und Tags', () => {
  const text = buildUploadOverview({
    title: 'Wie begann der Kalte Krieg?',
    description: 'Aus Verbündeten wurden Rivalen. Dieses Video erklärt warum.',
    chapters: '00:00 Der Anfang\n01:20 Die Blockbildung',
    tags: 'Kalter Krieg, Geschichte, USA, Sowjetunion'
  });

  assert.match(text, /^YOUTUBE-UPLOAD/m);
  assert.match(text, /TITEL\nWie begann der Kalte Krieg\?/);
  assert.match(text, /BESCHREIBUNG\nAus Verbündeten wurden Rivalen\./);
  assert.match(text, /KAPITEL\n00:00 Der Anfang/);
  assert.match(text, /TAGS\nKalter Krieg, Geschichte/);
});

test('Wortzeiten aus mehreren Audio-Parts werden absolut und chronologisch gesammelt', () => {
  const words = collectMeasuredWords({
    parts: [
      {
        absoluteOffsetSeconds: 0,
        words: [
          { word: 'Hallo', start: 0.2, end: 0.5 },
          { word: 'Welt.', start: 0.6, end: 0.9 }
        ]
      },
      {
        absoluteOffsetSeconds: 10,
        words: [
          { word: 'Weiter', start: 0.1, end: 0.5 }
        ]
      }
    ]
  });

  assert.equal(words.length, 3);
  assert.equal(words[0].start, 0.2);
  assert.equal(words[2].start, 10.1);
});

test('Zeitabschnitt-Untertitel werden in gut lesbare 10-Sekunden-Blöcke exportiert', () => {
  const text = buildTimedTranscriptText({
    masterDurationSeconds: 18,
    parts: [
      {
        absoluteOffsetSeconds: 0,
        words: [
          { word: 'Wie', start: 0.1, end: 0.3 },
          { word: 'begann', start: 0.35, end: 0.7 },
          { word: 'der', start: 0.75, end: 0.9 },
          { word: 'Kalte', start: 0.95, end: 1.2 },
          { word: 'Krieg?', start: 1.25, end: 1.6 },
          { word: 'Nach', start: 10.2, end: 10.4 },
          { word: '1945', start: 10.45, end: 10.8 },
          { word: 'änderte', start: 10.85, end: 11.2 },
          { word: 'sich', start: 11.25, end: 11.4 },
          { word: 'alles.', start: 11.45, end: 11.8 }
        ]
      }
    ]
  });

  assert.match(text, /00:00–00:10 Wie begann der Kalte Krieg\?/);
  assert.match(text, /00:10–00:18 Nach 1945 änderte sich alles\./);
  assert.doesNotMatch(text, /Krieg \?/);
});
