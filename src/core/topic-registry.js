/**
 * Themen-Eindeutigkeit über alle Kanäle hinweg.
 *
 * THEMEN_HISTORIE.md verlangt, dass ein Thema nie zweimal produziert wird - auch
 * nicht in anderer Formulierung und auch nicht kanalübergreifend. Diese Regel stand
 * bisher nur als Prosa in einer Markdown-Liste und wurde von nichts geprüft.
 *
 * Zwei Stufen, bewusst getrennt:
 *  - harte Sperre bei identischer Kernsignatur (deterministisch, keine Fehlalarme)
 *  - Warnung bei hoher Ähnlichkeit (Verdacht, den ein Mensch entscheidet)
 *
 * Eine vollautomatische semantische Duplikaterkennung für Deutsch ist ohne Sprachmodell
 * nicht zuverlässig. Deshalb blockiert Stufe 2 nicht, sondern meldet.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));

export const TOPIC_REGISTRY_PATH = 'config/topics.json';

/** Ähnlichkeit ab der ein Verdachtsfall gemeldet wird. */
export const SIMILARITY_WARNING_THRESHOLD = 0.5;

/** Frage-, Füll- und Funktionswörter ohne inhaltlichen Kern. */
const STOP_WORDS = new Set([
  'warum', 'wieso', 'weshalb', 'wozu', 'wie', 'was', 'wer', 'wann', 'wo', 'welche', 'welcher', 'welches',
  'ist', 'sind', 'war', 'waren', 'wird', 'werden', 'hat', 'haben', 'kann', 'koennen', 'muss', 'muessen',
  'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer', 'eines',
  'und', 'oder', 'aber', 'denn', 'doch', 'auch', 'noch', 'schon', 'nur', 'so', 'am', 'im', 'in', 'an',
  'auf', 'bei', 'mit', 'von', 'vor', 'zu', 'zum', 'zur', 'fuer', 'ueber', 'unter', 'nach', 'aus',
  'man', 'wir', 'du', 'ihr', 'sie', 'es', 'uns', 'dich', 'dir', 'sich', 'ich',
  'einfach', 'erklaert', 'erklaerung', 'eigentlich', 'wirklich', 'immer', 'nicht', 'kein', 'keine',
  'obwohl', 'wenn', 'dass', 'als', 'wie viel', 'gibt', 'geben'
]);

/** Häufige Flexionsendungen, die für den Kernvergleich abgeschnitten werden. */
const SUFFIXES = ['ungen', 'enden', 'ende', 'igen', 'lich', 'isch', 'ern', 'est', 'end', 'en', 'er', 'es', 'em', 'et', 'st', 'e', 'n', 's', 't'];

/**
 * Wandelt Umlaute um und entfernt alles, was kein Buchstabe, keine Ziffer und kein Leerzeichen ist.
 *
 * @param {string} value
 * @returns {string}
 */
export function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/[\s-]+/g, ' ')
    .trim();
}

/**
 * Erzeugt den URL-tauglichen Slug eines Themas.
 *
 * @param {string} title
 * @returns {string}
 */
export function toTopicSlug(title) {
  return normalizeText(title).replaceAll(' ', '-');
}

/**
 * Schneidet eine häufige Flexionsendung ab, solange der Wortstamm lang genug bleibt.
 *
 * @param {string} word
 * @returns {string}
 */
function stem(word) {
  if (word.length <= 4) return word;

  // Lateinische Endungen sind Wortbestandteil, keine Flexion:
  // "sozialismus" darf nicht zu "sozialismu" werden.
  if (/(us|is|os|as)$/.test(word)) return word;

  for (const suffix of SUFFIXES) {
    if (word.length - suffix.length >= 4 && word.endsWith(suffix)) {
      return word.slice(0, -suffix.length);
    }
  }
  return word;
}

/**
 * Reduziert einen Titel auf seine bedeutungstragenden Wortstämme.
 *
 * @param {string} title
 * @returns {string[]} Sortierte, eindeutige Stämme.
 */
export function toTopicSignature(title) {
  const words = normalizeText(title)
    .split(' ')
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word))
    .map(stem);
  return [...new Set(words)].sort();
}

/**
 * Prüft, ob zwei Stämme als dasselbe Konzept gelten.
 * Deckt zusammengesetzte Wörter ab, etwa "tag" in "tagsueber".
 *
 * @param {string} left
 * @param {string} right
 * @returns {boolean}
 */
function stemsMatch(left, right) {
  if (left === right) return true;
  const [shorter, longer] = left.length <= right.length ? [left, right] : [right, left];
  return shorter.length >= 3 && longer.startsWith(shorter);
}

/**
 * Ähnlichkeit zweier Titel zwischen 0 und 1 (Jaccard über Wortstämme).
 *
 * @param {string} leftTitle
 * @param {string} rightTitle
 * @returns {number}
 */
export function topicSimilarity(leftTitle, rightTitle) {
  const left = toTopicSignature(leftTitle);
  const right = toTopicSignature(rightTitle);
  if (left.length === 0 || right.length === 0) return 0;

  const matchedRight = new Set();
  let shared = 0;
  for (const leftStem of left) {
    const hit = right.find((rightStem) => !matchedRight.has(rightStem) && stemsMatch(leftStem, rightStem));
    if (hit) {
      matchedRight.add(hit);
      shared += 1;
    }
  }

  return shared / (left.length + right.length - shared);
}

/**
 * Lädt die Themen-Registry.
 *
 * @param {string} [repoRoot]
 * @returns {Promise<{topics: Array<object>}>}
 */
export async function loadTopicRegistry(repoRoot = REPO_ROOT) {
  const raw = await readFile(path.join(repoRoot, TOPIC_REGISTRY_PATH), 'utf8');
  return JSON.parse(raw);
}

/**
 * Sucht Konflikte eines Titels gegen die bestehende Registry.
 *
 * @param {string} title Geplanter Themen-Titel.
 * @param {Array<object>} topics Bestehende Themen.
 * @param {{ignoreSlug?: string}} [options]
 * @returns {{blocking: Array<object>, warnings: Array<object>}}
 */
export function findTopicConflicts(title, topics, { ignoreSlug } = {}) {
  const slug = toTopicSlug(title);
  const signature = toTopicSignature(title).join(' ');
  const blocking = [];
  const warnings = [];

  for (const topic of topics) {
    if (ignoreSlug && topic.slug === ignoreSlug) continue;

    const candidates = [topic.title, ...(topic.aliases ?? [])];

    if (topic.slug === slug || candidates.some((candidate) => toTopicSlug(candidate) === slug)) {
      blocking.push({ topic, reason: 'identischer Slug', similarity: 1 });
      continue;
    }

    if (candidates.some((candidate) => toTopicSignature(candidate).join(' ') === signature)) {
      blocking.push({ topic, reason: 'identische Kernaussage', similarity: 1 });
      continue;
    }

    const similarity = Math.max(...candidates.map((candidate) => topicSimilarity(title, candidate)));
    if (similarity >= SIMILARITY_WARNING_THRESHOLD) {
      warnings.push({ topic, reason: 'sehr ähnliche Kernaussage', similarity: Number(similarity.toFixed(2)) });
    }
  }

  warnings.sort((left, right) => right.similarity - left.similarity);
  return { blocking, warnings };
}

/**
 * Wirft, wenn ein Thema bereits belegt ist. Verdachtsfälle werden zurückgegeben.
 *
 * @param {string} title
 * @param {{repoRoot?: string, ignoreSlug?: string}} [options]
 * @returns {Promise<{slug: string, signature: string[], warnings: Array<object>}>}
 */
export async function assertTopicIsUnique(title, { repoRoot = REPO_ROOT, ignoreSlug } = {}) {
  const registry = await loadTopicRegistry(repoRoot);
  const { blocking, warnings } = findTopicConflicts(title, registry.topics, { ignoreSlug });

  if (blocking.length > 0) {
    const details = blocking
      .map(({ topic, reason }) => `  - "${topic.title}" (${topic.channel}, ${topic.status}) — ${reason}`)
      .join('\n');
    throw new Error(`Thema "${title}" ist bereits belegt:\n${details}\n\nRegistry: ${TOPIC_REGISTRY_PATH}`);
  }

  return { slug: toTopicSlug(title), signature: toTopicSignature(title), warnings };
}

/**
 * Findet alle Duplikate innerhalb der Registry selbst.
 *
 * @param {Array<object>} topics
 * @returns {{blocking: Array<object>, warnings: Array<object>}}
 */
export function auditTopicRegistry(topics) {
  const blocking = [];
  const warnings = [];

  for (let index = 0; index < topics.length; index += 1) {
    const current = topics[index];
    const earlier = topics.slice(0, index);
    const conflicts = findTopicConflicts(current.title, earlier);
    for (const conflict of conflicts.blocking) blocking.push({ topic: current, conflictsWith: conflict.topic, reason: conflict.reason });
    for (const conflict of conflicts.warnings) warnings.push({ topic: current, conflictsWith: conflict.topic, similarity: conflict.similarity });
  }

  return { blocking, warnings };
}
