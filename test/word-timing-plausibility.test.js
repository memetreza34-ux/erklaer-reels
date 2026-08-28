import test from 'node:test';
import assert from 'node:assert/strict';

import { analyzeWordTimingPlausibility } from '../src/core/word-timing-plausibility.js';
import { validateCodexWorkbench } from '../src/core/codex-word-sync.js';

const SATZ = ('Warum gibt es Zeitzonen einfach erklärt früher stellte jede Stadt ihre Uhr nach der Sonne '
  + 'stand sie am höchsten war dort ungefähr Mittag schon weiter westlich oder östlich zeigte eine andere '
  + 'Uhr deshalb eine andere Zeit solange Menschen langsam reisten war das kaum ein Problem').split(' ');

// Gleichmäßig verteilte Zeiten, wie sie beim Hochrechnen aus der Szenendauer entstehen.
function gleichverteilt(woerter, gesamtdauer = 20) {
  const dauer = gesamtdauer / woerter.length;
  return woerter.map((text, index) => ({
    text,
    startSeconds: Number((index * dauer).toFixed(3)),
    endSeconds: Number(((index + 1) * dauer).toFixed(3))
  }));
}

// Am Audio gemessene Zeiten schwanken mit der Wortlänge und kennen Sprechpausen.
function gemessen(woerter) {
  let zeit = 0;
  return woerter.map((text, index) => {
    const dauer = 0.06 + text.length * 0.045;
    const start = zeit;
    zeit += dauer + (index % 7 === 6 ? 0.22 : 0);
    return {
      text,
      startSeconds: Number(start.toFixed(3)),
      endSeconds: Number((start + dauer).toFixed(3))
    };
  });
}

test('erkennt gleichmäßig über die Szenendauer verteilte Wortzeiten', () => {
  const ergebnis = analyzeWordTimingPlausibility(gleichverteilt(SATZ));
  assert.equal(ergebnis.evaluated, true);
  assert.equal(ergebnis.suspicious, true);
  assert.ok(ergebnis.triggered.length >= 2, 'mindestens zwei Merkmale müssen anschlagen');
});

test('akzeptiert am Audio gemessene Wortzeiten', () => {
  const ergebnis = analyzeWordTimingPlausibility(gemessen(SATZ));
  assert.equal(ergebnis.evaluated, true);
  assert.equal(ergebnis.suspicious, false);
  assert.ok(ergebnis.lengthDurationCorrelation > 0.25);
  assert.ok(ergebnis.durationVariationCoefficient > 0.2);
});

test('urteilt nicht bei zu wenigen Wörtern', () => {
  const ergebnis = analyzeWordTimingPlausibility(gleichverteilt(SATZ.slice(0, 8)));
  assert.equal(ergebnis.evaluated, false);
  assert.equal(ergebnis.suspicious, false);
});

test('ignoriert Wörter ohne gültige Zeit', () => {
  const woerter = [...gemessen(SATZ), { text: 'offen', startSeconds: null, endSeconds: null }];
  const ergebnis = analyzeWordTimingPlausibility(woerter);
  assert.equal(ergebnis.wordCount, SATZ.length);
});

test('die Arbeitsdatei fällt durch, wenn Wortzeiten hochgerechnet statt gemessen sind', () => {
  const bauWorkbench = (woerter) => ({
    words: woerter.map((wort, index) => ({
      index: index + 1,
      text: wort.text,
      startSeconds: wort.startSeconds,
      endSeconds: wort.endSeconds,
      confidence: 1,
      reviewed: true
    }))
  });

  const erfunden = validateCodexWorkbench(bauWorkbench(gleichverteilt(SATZ)), { strict: false });
  const pruefung = erfunden.checks.find((check) => check.id === 'word-timings-not-evenly-distributed');
  assert.equal(pruefung.passed, false, 'selbst gesetztes reviewed und confidence dürfen nicht genügen');
  assert.equal(erfunden.passed, false);

  const echt = validateCodexWorkbench(bauWorkbench(gemessen(SATZ)), { strict: false });
  assert.equal(echt.checks.find((check) => check.id === 'word-timings-not-evenly-distributed').passed, true);
});
