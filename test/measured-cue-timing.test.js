// Priorität: Das Bild muss zu dem Satz laufen, der gerade gesprochen wird.
//
// Vorher hat `buildSequentialAudioSync` die Gesamtdauer nach Wortgewicht
// verteilt und das Ergebnis trotzdem "audio-synced" genannt. Am Vetorecht-Reel
// gegen eine echte Wortmessung geprüft: mittlere Abweichung 1,44 s, größte
// 2,94 s, 15 von 16 Schnitten über 0,25 s daneben — und zwar durchgehend ZU
// FRÜH, sodass man über weite Strecken schon das nächste Bild zum vorherigen
// Satz sah.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { MEASURED_ALIGNMENT_METHOD } from '../src/core/measured-cue-alignment.js';
import { verifyMeasuredCueTiming } from '../src/core/measured-timing-guard.js';
import { WORD_TIMINGS_FILE } from '../src/core/voice-word-timings.js';
import {
  findSpokenCue,
  germanNumberWordToDigits,
  normalizeSpokenPhrase,
  normalizeSpokenToken
} from '../src/shared/spoken-text-match.js';

// Ein kurzer Ausschnitt aus dem echten Vetorecht-Transkript.
const WORDS = [
  ['Damit', 33.20], ['etwas', 33.62], ['durchgeht,', 33.94], ['braucht', 34.32], ['es', 34.54],
  ['neun', 34.70], ['Jahrstimmen', 35.06], ['von', 35.62], ['15.', 35.78],
  ['Klingt', 36.40], ['nach', 36.70], ['einer', 36.88], ['ganz', 37.10], ['normalen', 37.34], ['Abstimmung.', 37.80]
].map(([word, start], index, all) => ({ word, start, end: all[index + 1]?.[1] ?? start + 0.3 }));

test('deutsche Zahlwörter und Ziffern gelten als dasselbe Wort', () => {
  assert.equal(germanNumberWordToDigits('vierzehn'), '14');
  assert.equal(germanNumberWordToDigits('fünfzehn'), '15');
  assert.equal(germanNumberWordToDigits('dreihundert'), '300');
  assert.equal(germanNumberWordToDigits('einundzwanzig'), '21');
  assert.equal(germanNumberWordToDigits('Sicherheitsrat'), null);

  // Plan schreibt "fünfzehn", Whisper schreibt "15." — ohne diese Angleichung
  // findet der Abgleich den Cue nicht und der Schnitt bleibt geschätzt.
  assert.equal(normalizeSpokenToken('fünfzehn'), normalizeSpokenToken('15.'));
  assert.equal(normalizeSpokenPhrase('von fünfzehn'), normalizeSpokenPhrase('von 15.'));
});

test('findet den Cue am gesprochenen Wort, auch bei abweichender Schreibweise', () => {
  const exact = findSpokenCue('Damit etwas durchgeht', WORDS);
  assert.equal(exact.startSeconds, 33.20);
  assert.equal(exact.method, 'exact');

  // Plan "Ja-Stimmen von fünfzehn" gegen Transkript "Jahrstimmen von 15."
  const fuzzy = findSpokenCue('Ja-Stimmen von fünfzehn', WORDS);
  assert.ok(fuzzy, 'unscharfer Treffer erwartet');
  assert.equal(fuzzy.startSeconds, 35.06);
  assert.ok(fuzzy.confidence >= 0.72);
});

test('die Suche läuft monoton und springt nicht zurück', () => {
  const later = findSpokenCue('Damit etwas durchgeht', WORDS, { fromWordIndex: 5 });
  assert.equal(later, null, 'ein späterer Bildmoment darf nicht vor einem früheren liegen');
});

test('ein unsinniger Cue wird nicht erzwungen', () => {
  assert.equal(findSpokenCue('völlig anderer Satz über Kartoffeln', WORDS), null);
});

async function createReel({ source, cueSeconds }) {
  const directory = await mkdtemp(path.join(tmpdir(), 'reel-timing-'));
  await mkdir(path.join(directory, 'timeline'), { recursive: true });
  await writeFile(path.join(directory, 'reel.json'), JSON.stringify({ date: '2026-10-01' }), 'utf8');
  await writeFile(path.join(directory, 'timeline', 'audio-sync.json'), JSON.stringify({
    audioFile: 'audio/voiceover-tight.m4a',
    source,
    cueTimings: [
      { sceneId: 'scene-01', audioCue: 'Damit etwas durchgeht', cueTimeSeconds: 0 },
      { sceneId: 'scene-02', audioCue: 'Klingt nach einer ganz normalen', cueTimeSeconds: cueSeconds }
    ],
    phaseCueTimings: []
  }), 'utf8');
  await writeFile(path.join(directory, WORD_TIMINGS_FILE), JSON.stringify({
    audioFingerprintSha256: 'egal-solange-kein-audio-daneben-liegt',
    words: WORDS
  }), 'utf8');
  return directory;
}

test('geschätzte Zeitpunkte gelten nicht mehr als audio-synchron', async () => {
  const directory = await createReel({ source: 'sequential-spoken-text-weight-v1', cueSeconds: 36.40 });
  const result = await verifyMeasuredCueTiming(directory);

  assert.equal(result.required, true);
  assert.equal(result.passed, false);
  assert.equal(result.findings[0].issue, 'timing-not-measured');
  await rm(directory, { recursive: true, force: true });
});

test('ein gemessener Zeitpunkt am richtigen Wort besteht', async () => {
  const directory = await createReel({ source: MEASURED_ALIGNMENT_METHOD, cueSeconds: 36.40 });
  const result = await verifyMeasuredCueTiming(directory);

  assert.equal(result.passed, true, JSON.stringify(result.findings));
  assert.equal(result.statistics.maximumDeviationSeconds, 0);
  await rm(directory, { recursive: true, force: true });
});

test('ein Bildwechsel, der dem Wort vorausläuft, blockiert', async () => {
  // 1,4 s zu früh — genau die mittlere Abweichung des Vetorecht-Reels.
  const directory = await createReel({ source: MEASURED_ALIGNMENT_METHOD, cueSeconds: 35.00 });
  const result = await verifyMeasuredCueTiming(directory);

  assert.equal(result.passed, false);
  const drift = result.findings.find((finding) => finding.issue === 'cue-time-drift');
  assert.ok(drift);
  assert.equal(drift.spokenSeconds, 36.40);
  assert.ok(Math.abs(drift.deviationSeconds + 1.4) < 0.01);
  await rm(directory, { recursive: true, force: true });
});

test('der kleine Vorlauf vor dem Cue-Wort bleibt erlaubt', async () => {
  // Der Renderer schneidet bewusst 0,08–0,10 s vor das Wort.
  const directory = await createReel({ source: MEASURED_ALIGNMENT_METHOD, cueSeconds: 36.30 });
  const result = await verifyMeasuredCueTiming(directory);

  assert.equal(result.passed, true, JSON.stringify(result.findings));
  await rm(directory, { recursive: true, force: true });
});
