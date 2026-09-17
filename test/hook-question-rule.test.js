import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { opensWithQuestion, inspectReelHook } from '../src/shared/reel-hook-quality.js';

test('ein Hook muss mit einer Frage öffnen', () => {
  assert.ok(opensWithQuestion('Was ist ein Vetorecht? Ein Land sagt Nein.'));
  assert.ok(opensWithQuestion('Warum haben Länder Grenzen? Sie wirken selbstverständlich.'));
  assert.ok(opensWithQuestion('Wie entsteht ein Gesetz? Am Anfang steht ein Entwurf.'));
  assert.ok(opensWithQuestion('Kann ein Land alleine alles blockieren? Ja, im Sicherheitsrat.'));
});

test('eine Aussage als Einstieg wird abgewiesen', () => {
  assert.equal(opensWithQuestion('Ein einziges Land sagt Nein — und niemand kann es überstimmen.'), false);
  assert.equal(opensWithQuestion('Das Vetorecht ist ein Sonderrecht.'), false);
});

test('eine Frage erst später im Hook reicht nicht', () => {
  assert.equal(opensWithQuestion('Das ist erstaunlich. Aber was ist ein Vetorecht?'), false);
});

test('ein Fragewort ohne Fragezeichen reicht nicht', () => {
  assert.equal(opensWithQuestion('Was ein Vetorecht ist, weiß kaum jemand.'), false);
});

test('inspectReelHook meldet den fehlenden Frage-Einstieg konkret', () => {
  const ergebnis = inspectReelHook({
    narration: 'Ein einziges Land sagt Nein und niemand kann es überstimmen heute.',
    imageText: 'DAS VETORECHT'
  });
  assert.equal(ergebnis.passed, false);
  assert.ok(ergebnis.issues.some((issue) => /mit einer Frage beginnen/.test(issue)),
    `Erwartete Frage-Meldung fehlt: ${ergebnis.issues.join(' | ')}`);
});

test('ein korrekter Hook besteht die Prüfung', () => {
  const ergebnis = inspectReelHook({
    narration: 'Was ist ein Vetorecht? Ein einziges Land sagt Nein und niemand kann es überstimmen.',
    imageText: 'DAS VETORECHT'
  });
  assert.deepEqual(ergebnis.issues, []);
  assert.equal(ergebnis.passed, true);
});

test('die Regel steht in den Regeldateien, nicht nur im Code', async () => {
  const rules = JSON.parse(await readFile('config/content-rules.json', 'utf8'));
  assert.equal(rules.scriptRules.hookMustOpenWithQuestion, true);
  assert.equal(rules.scriptRules.narrativeStructure.required, true);

  const teile = rules.scriptRules.narrativeStructure.parts.map((p) => p.part);
  assert.deepEqual(teile, ['hook', 'einleitung', 'hauptteil', 'schluss']);

  for (const datei of ['AGENTS.md', 'knowledge/production-rules.md', 'WORKFLOW_PHASEN.md']) {
    const inhalt = await readFile(datei, 'utf8');
    assert.match(inhalt, /Frage/, `${datei} muss die Frage-Regel nennen.`);
  }
});
