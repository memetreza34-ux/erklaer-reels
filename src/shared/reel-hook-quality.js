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

/**
 * Leitet die Headline des Titelbilds aus dem Reel-Titel ab.
 *
 * Bild 01 ist zugleich das Cover: Es ist der erste Frame im Feed und muss ohne Ton
 * sagen, worum es geht. Deshalb traegt es das Thema, nicht eine Zwischenaussage aus
 * dem Hook.
 *
 * @param {string} title Reel-Titel, z. B. "Was ist ein Vetorecht?"
 * @returns {string} Headline in Grossbuchstaben, z. B. "WAS IST EIN VETORECHT?"
 */
export function deriveCoverHeadline(title) {
  const text = String(title ?? '').trim();
  if (!text) return '';

  const frage = text.endsWith('?');
  const woerter = words(text);
  if (woerter.length === 0) return '';

  // Bis zu fuenf Woerter passen als Headline; laengere Titel werden auf den Kern gekuerzt.
  if (woerter.length <= 5) {
    return (woerter.join(' ') + (frage ? '?' : '')).toLocaleUpperCase('de-DE');
  }

  const fuellwoerter = new Set(['der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen',
    'einem', 'einer', 'und', 'oder', 'so', 'auch', 'noch', 'nur', 'im', 'in', 'am', 'an', 'zu',
    'von', 'mit', 'fuer', 'für', 'bei', 'aus', 'wir', 'du', 'man', 'sie', 'es', 'sich',
    'haben', 'hat', 'ist', 'sind', 'wird', 'werden', 'kann', 'können']);
  const kern = woerter.filter((wort) => !fuellwoerter.has(wort.toLocaleLowerCase('de-DE')));
  if (kern.length <= 5) {
    return (kern.join(' ') + (frage ? '?' : '')).toLocaleUpperCase('de-DE');
  }

  // Im Deutschen steht das inhaltstragende Wort oft am Satzende ("… zwei HAUPTSTÄDTE?").
  // Ein simples Abschneiden nach vorn würde genau dieses Wort verlieren. Deshalb: Fragewort
  // behalten und aus dem Rest die längsten Wörter wählen, danach wieder in Satzreihenfolge.
  const [erstes, ...rest] = kern;
  const behalten = new Set(
    [...rest].sort((links, rechts) => rechts.length - links.length).slice(0, 4)
  );
  const auswahl = [erstes, ...rest.filter((wort) => behalten.has(wort))];
  return (auswahl.join(' ') + (frage ? '?' : '')).toLocaleUpperCase('de-DE');
}

/**
 * Prüft, ob die Cover-Headline das Thema des Reels benennt.
 * Verlangt keine wörtliche Gleichheit, aber ein gemeinsames inhaltstragendes Wort.
 *
 * @param {string} title
 * @param {string} coverHeadline
 * @returns {boolean}
 */
export function coverHeadlineMatchesTopic(title, coverHeadline) {
  const normalisieren = (value) => words(value)
    .map((wort) => wort.toLocaleLowerCase('de-DE')
      .replaceAll('ä', 'ae').replaceAll('ö', 'oe').replaceAll('ü', 'ue').replaceAll('ß', 'ss'))
    .filter((wort) => wort.length > 3);

  const ausTitel = normalisieren(title);
  const ausHeadline = new Set(normalisieren(coverHeadline));
  if (ausTitel.length === 0) return true;

  return ausTitel.some((wort) => {
    for (const kandidat of ausHeadline) {
      const [kurz, lang] = wort.length <= kandidat.length ? [wort, kandidat] : [kandidat, wort];
      if (lang.startsWith(kurz)) return true;
    }
    return false;
  });
}
