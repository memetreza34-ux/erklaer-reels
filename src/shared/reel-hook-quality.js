const GENERIC_INTRO = /\b(in diesem (video|reel)|heute (erkläre|zeigen|schauen)|willkommen|wir schauen uns|in diesem beitrag)\b/i;

/** Fragewörter, mit denen eine Erklärfrage beginnen darf. */
const QUESTION_WORDS = /^(was|warum|wieso|weshalb|wie|wer|wen|wem|wessen|wo|wohin|woher|wann|welche[rsnm]?|wodurch|wofür|womit|worin|worum|kann|darf|muss|gibt|ist|sind|hat|haben|können|dürfen)\b/i;

/** Ein Reel-Schluss braucht diese Bestandteile, damit die Erzählung rund wird. */
export const REEL_STRUCTURE = Object.freeze({
  hook: 'Frage, die das Thema benennt',
  einleitung: 'Worum es geht und wo es passiert',
  hauptteil: 'Wie es funktioniert',
  schluss: 'Warum das zählt, mit einem Satz, der bleibt'
});

function words(value) {
  return String(value ?? '').trim().match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? [];
}

/**
 * Trennt den ersten Satz ab, damit geprüft werden kann, ob das Reel mit einer
 * Frage öffnet - und nicht erst irgendwo später eine stellt.
 *
 * @param {string} text
 * @returns {string}
 */
function firstSentence(text) {
  const match = String(text ?? '').trim().match(/^[^.!?]*[.!?]/);
  return (match ? match[0] : String(text ?? '')).trim();
}

/**
 * Prüft, ob der Hook mit einer echten Frage beginnt.
 *
 * Verbindliche Kanalregel: Jedes Reel startet mit der Frage, die es beantwortet
 * ("Was ist ein Vetorecht?"). Eine Frage irgendwo mitten im Hook reicht nicht -
 * der Zuschauer muss im ersten Satz wissen, worum es geht.
 *
 * @param {string} narration
 * @returns {boolean}
 */
export function opensWithQuestion(narration) {
  const first = firstSentence(narration);
  if (!first.endsWith('?')) return false;
  return QUESTION_WORDS.test(first);
}

export function inspectReelHook({ narration = '', imageText = '' } = {}) {
  const text = String(narration ?? '').trim();
  const issues = [];
  const count = words(text).length;

  if (count < 8 || count > 28) {
    issues.push(`Hook-Narration braucht 8–28 Wörter, hat aber ${count}.`);
  }
  if (GENERIC_INTRO.test(text)) {
    issues.push('Hook startet mit einer generischen Video-Einleitung statt mit der Sache selbst.');
  }
  if (!opensWithQuestion(text)) {
    issues.push(
      'Hook muss mit einer Frage beginnen, die das Thema benennt, zum Beispiel "Was ist ein Vetorecht?". ' +
      'Der erste Satz muss mit einem Fragewort starten und mit einem Fragezeichen enden.'
    );
  }

  const headlineWords = words(imageText).length;
  if (headlineWords < 2 || headlineWords > 5) {
    issues.push(`Titelbild-Headline braucht 2–5 Wörter, hat aber ${headlineWords}.`);
  }

  return { passed: issues.length === 0, issues, wordCount: count };
}
