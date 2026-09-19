import test from 'node:test';
import assert from 'node:assert/strict';

import {
  toTopicSlug,
  toTopicSignature,
  topicSimilarity,
  findTopicConflicts,
  assertTopicIsUnique,
  auditTopicRegistry,
  loadTopicRegistry,
  SIMILARITY_WARNING_THRESHOLD
} from '../src/core/topic-registry.js';

test('Slugs sind stabil und umlautfest', () => {
  assert.equal(toTopicSlug('Warum ist Gähnen ansteckend?'), 'warum-ist-gaehnen-ansteckend');
  assert.equal(toTopicSlug('USA-China-Taiwan-Konflikt einfach erklärt'), 'usa-china-taiwan-konflikt-einfach-erklaert');
  assert.equal(toTopicSlug('Was ist Föderalismus?'), 'was-ist-foederalismus');
  assert.equal(toTopicSlug('  Doppelte   Leerzeichen  '), 'doppelte-leerzeichen');
});

test('die Signatur entfernt Frage- und Füllwörter', () => {
  assert.deepEqual(toTopicSignature('Was ist Sozialismus?'), ['sozialismus']);
  assert.deepEqual(toTopicSignature('Sozialismus einfach erklärt'), ['sozialismus']);
});

test('unterschiedliche Formulierung derselben Frage gilt als Duplikat', async () => {
  const registry = await loadTopicRegistry();

  // Beide Beispiele stehen als Duplikat-Regel in THEMEN_HISTORIE.md.
  assert.ok(topicSimilarity('Warum riecht Regen so besonders?', 'Warum riecht Regen gut?') >= SIMILARITY_WARNING_THRESHOLD);
  assert.ok(topicSimilarity('Warum sehen wir den Mond am Tag?', 'Wieso sieht man den Mond tagsüber?') >= SIMILARITY_WARNING_THRESHOLD);

  const regen = findTopicConflicts('Warum riecht Regen gut?', registry.topics);
  assert.ok(regen.blocking.length > 0 || regen.warnings.length > 0, 'Regen-Duplikat muss auffallen.');

  const mond = findTopicConflicts('Wieso sieht man den Mond tagsüber?', registry.topics);
  assert.ok(mond.blocking.length > 0 || mond.warnings.length > 0, 'Mond-Duplikat muss auffallen.');
});

test('inhaltlich verschiedene Themen kollidieren nicht', () => {
  assert.ok(topicSimilarity('Was ist Föderalismus?', 'Warum ist Gähnen ansteckend?') < SIMILARITY_WARNING_THRESHOLD);
  assert.ok(topicSimilarity('Warum haben Länder Grenzen?', 'Warum schließen Länder Bündnisse?') < SIMILARITY_WARNING_THRESHOLD);
});

test('ein bereits belegtes Thema wird hart abgewiesen', async () => {
  await assert.rejects(
    assertTopicIsUnique('Was ist Föderalismus?'),
    /bereits belegt/
  );
  // Andere Formulierung, gleiche Kernaussage.
  await assert.rejects(
    assertTopicIsUnique('Föderalismus einfach erklärt'),
    /bereits belegt/
  );
});

test('die Sperre gilt kanalübergreifend', async () => {
  const registry = await loadTopicRegistry();
  const youtubeTopic = registry.topics.find((topic) => topic.channel === 'youtube');
  assert.ok(youtubeTopic, 'Für diesen Test wird mindestens ein YouTube-Thema gebraucht.');

  // Dasselbe Thema darf nicht als Reel wiederholt werden.
  const conflicts = findTopicConflicts(youtubeTopic.title, registry.topics);
  assert.ok(conflicts.blocking.length > 0);
  assert.equal(conflicts.blocking[0].topic.channel, 'youtube');
});

test('ein freies Thema wird durchgelassen', async () => {
  const result = await assertTopicIsUnique('Wie entsteht ein Vulkanausbruch?');
  assert.equal(result.slug, 'wie-entsteht-ein-vulkanausbruch');
  assert.ok(Array.isArray(result.warnings));
});

test('die bestehende Registry enthält keine Duplikate', async () => {
  const registry = await loadTopicRegistry();
  const { blocking } = auditTopicRegistry(registry.topics);
  const details = blocking.map((entry) => `"${entry.topic.title}" <-> "${entry.conflictsWith.title}"`);
  assert.deepEqual(details, [], `Duplikate in config/topics.json: ${details.join(', ')}`);
});

test('jedes Registry-Thema hat Slug, Kanal und Status', async () => {
  const registry = await loadTopicRegistry();
  assert.ok(registry.topics.length > 0);

  for (const topic of registry.topics) {
    assert.equal(topic.slug, toTopicSlug(topic.title), `Slug von "${topic.title}" ist nicht aktuell.`);
    assert.ok(['reel', 'youtube'].includes(topic.channel), `Unbekannter Kanal bei "${topic.title}".`);
    assert.ok(['used', 'planned'].includes(topic.status), `Unbekannter Status bei "${topic.title}".`);
  }

  const slugs = registry.topics.map((topic) => topic.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'Doppelte Slugs in der Registry.');
});
