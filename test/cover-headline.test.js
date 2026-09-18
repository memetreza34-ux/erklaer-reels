import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { deriveCoverHeadline, coverHeadlineMatchesTopic } from '../src/shared/reel-hook-quality.js';

test('die Cover-Headline wird aus dem Reel-Titel abgeleitet', () => {
  assert.equal(deriveCoverHeadline('Was ist ein Vetorecht?'), 'WAS IST EIN VETORECHT?');
  assert.equal(deriveCoverHeadline('Warum haben Länder Grenzen?'), 'WARUM HABEN LÄNDER GRENZEN?');
  assert.equal(deriveCoverHeadline('Was ist Föderalismus?'), 'WAS IST FÖDERALISMUS?');
});

test('lange Titel werden auf den Kern gekürzt', () => {
  const headline = deriveCoverHeadline('Warum kann keine Weltkarte die Erde richtig zeigen?');
  const woerter = headline.replace('?', '').split(' ').filter(Boolean);
  assert.ok(woerter.length <= 5, `Headline zu lang: ${headline}`);
  assert.ok(headline.includes('WELTKARTE'), `Kernbegriff fehlt: ${headline}`);
});

test('eine Headline ohne Themenbezug wird abgewiesen', () => {
  assert.equal(coverHeadlineMatchesTopic('Was ist ein Vetorecht?', 'ENTSCHEIDET DIE MEHRHEIT?'), false);
  assert.equal(coverHeadlineMatchesTopic('Was ist ein Vetorecht?', 'STIMMT NICHT'), false);
});

test('eine Headline mit Themenbezug wird akzeptiert', () => {
  assert.ok(coverHeadlineMatchesTopic('Was ist ein Vetorecht?', 'WAS IST EIN VETORECHT?'));
  assert.ok(coverHeadlineMatchesTopic('Was ist ein Vetorecht?', 'VETORECHT ERKLÄRT'));
  // Beugung und Umlaute duerfen nicht stoeren.
  assert.ok(coverHeadlineMatchesTopic('Warum haben Länder Grenzen?', 'LÄNDER UND GRENZEN'));
});

test('die Regel steht in den Regeldateien', async () => {
  const rules = JSON.parse(await readFile('config/content-rules.json', 'utf8'));
  assert.equal(rules.scriptRules.coverImage.isFirstScene, true);
  assert.equal(rules.scriptRules.coverImage.headlineMustNameTopic, true);

  for (const datei of ['AGENTS.md', 'knowledge/production-rules.md']) {
    assert.match(await readFile(datei, 'utf8'), /Cover/, `${datei} muss die Cover-Regel nennen.`);
  }
});
