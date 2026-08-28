import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSubtitleCuesFromCodexWords } from '../src/core/codex-word-sync.js';
import { validateExactWordTimings } from '../src/renderer/subtitle-timing.js';

// Ein Satz, der über einen Bildwechsel hinweg gesprochen wird. Der Schnitt liegt
// mitten im Satz, zwischen "Raster" und "aus?".
const SATZ = [
  ['Warum', 0.0, 0.32], ['sehen', 0.32, 0.62], ['die', 0.62, 0.78], ['Grenzen', 0.78, 1.24],
  ['nicht', 1.24, 1.5], ['wie', 1.5, 1.68], ['ein', 1.68, 1.84], ['sauberes', 1.84, 2.34],
  ['Raster', 2.34, 2.78], ['aus?', 2.78, 3.1],
  ['Weil', 3.4, 3.66], ['Zeit', 3.66, 3.94], ['nicht', 3.94, 4.16], ['nur', 4.16, 4.34],
  ['gemessen,', 4.34, 4.86], ['sondern', 5.1, 5.5], ['organisiert', 5.5, 6.12], ['wird.', 6.12, 6.5]
].map(([text, startSeconds, endSeconds]) => ({ text, startSeconds, endSeconds, confidence: 1, reviewed: true }));

const SZENEN = [
  { sceneId: 'scene-01', startSeconds: 0, endSeconds: 3.0 },
  { sceneId: 'scene-02', startSeconds: 3.0, endSeconds: 7.0 }
];

test('ein Satz über einen Bildwechsel bleibt ein Untertitel', () => {
  const { cues } = buildSubtitleCuesFromCodexWords(SATZ, SZENEN);
  const mitAus = cues.filter((cue) => cue.text.includes('aus?'));
  assert.equal(mitAus.length, 1);
  assert.ok(
    mitAus[0].text.includes('Raster') && mitAus[0].text.includes('aus?'),
    `"Raster" und "aus?" gehören in denselben Untertitel, erhalten: "${mitAus[0].text}"`
  );
});

test('der Bildwechsel erzeugt keine Ein-Wort-Reste', () => {
  const { cues } = buildSubtitleCuesFromCodexWords(SATZ, SZENEN);
  const reste = cues.filter((cue) => cue.wordTimings.length <= 1);
  assert.deepEqual(reste.map((cue) => cue.text), []);
});

test('Untertitelzeiten werden nicht auf Szenengrenzen beschnitten', () => {
  const { cues } = buildSubtitleCuesFromCodexWords(SATZ, SZENEN);
  for (const cue of cues) {
    const erstes = cue.wordTimings[0];
    assert.ok(
      cue.startSeconds <= erstes.startSeconds + 1e-9,
      `${cue.id} blendet nach dem ersten Wort ein`
    );
  }
});

test('jeder erzeugte Untertitel besteht die Wortzeitprüfung des Renderers', () => {
  const { cues } = buildSubtitleCuesFromCodexWords(SATZ, SZENEN);
  for (const cue of cues) {
    const ergebnis = validateExactWordTimings(cue);
    assert.equal(ergebnis.valid, true, `${cue.id}: ${ergebnis.issues.join(' ')}`);
  }
});

test('Untertitel überlappen einander nicht', () => {
  const { cues } = buildSubtitleCuesFromCodexWords(SATZ, SZENEN);
  for (let index = 1; index < cues.length; index += 1) {
    assert.ok(
      cues[index].startSeconds >= cues[index - 1].endSeconds - 1e-9,
      `${cues[index].id} überlappt ${cues[index - 1].id}`
    );
  }
});

test('der gesprochene Wortlaut bleibt vollständig und in Reihenfolge erhalten', () => {
  const { cues } = buildSubtitleCuesFromCodexWords(SATZ, SZENEN);
  assert.deepEqual(
    cues.flatMap((cue) => cue.wordTimings.map((wort) => wort.text)),
    SATZ.map((wort) => wort.text)
  );
});

test('Untertitel ragen nicht in den Nachlauf des Schlussbildes', () => {
  const { cues } = buildSubtitleCuesFromCodexWords(SATZ, SZENEN, { maximumEndSeconds: 6.6 });
  assert.ok(cues.at(-1).endSeconds <= 6.6 + 1e-9, `letzter Untertitel endet bei ${cues.at(-1).endSeconds}`);
});

test('jeder Untertitel gehört zu der Szene, in der er überwiegend gesprochen wird', () => {
  const { cues, sceneSummary } = buildSubtitleCuesFromCodexWords(SATZ, SZENEN);
  for (const cue of cues) assert.ok(SZENEN.some((szene) => szene.sceneId === cue.sceneId));
  assert.equal(
    sceneSummary.reduce((summe, szene) => summe + szene.cueCount, 0),
    cues.length,
    'die Szenenübersicht muss alle Untertitel zählen'
  );
});
