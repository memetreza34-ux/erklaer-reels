/**
 * Findet einen geplanten Sprach-Cue im tatsächlich gesprochenen Wortstrom.
 *
 * Das ist schwieriger als ein Textvergleich, weil Plan und Transkript dieselbe
 * Stelle unterschiedlich schreiben:
 *   Plan "Vierzehn Länder stimmen dafür"   Transkript "14 Länder stimmen dafür"
 *   Plan "Was ist ein Vetorecht"           Transkript "Das ist ein Veto -Recht."
 *   Plan "Ja-Stimmen von fünfzehn"         Transkript "Jahrstimmen von 15"
 *
 * Deshalb wird beides auf einen Zeichenstrom ohne Trennzeichen normalisiert,
 * Zahlwörter werden zu Ziffern vereinheitlicht, und gesucht wird zuerst exakt,
 * danach unscharf mit Ähnlichkeitsschwelle.
 */

const ONES = Object.freeze({
  null: 0, eins: 1, ein: 1, eine: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, funf: 5,
  sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, elf: 11, zwölf: 12, zwolf: 12,
  dreizehn: 13, vierzehn: 14, fünfzehn: 15, funfzehn: 15, sechzehn: 16, siebzehn: 17,
  achtzehn: 18, neunzehn: 19
});

const TENS = Object.freeze({
  zwanzig: 20, dreißig: 30, dreissig: 30, vierzig: 40, fünfzig: 50, funfzig: 50,
  sechzig: 60, siebzig: 70, achtzig: 80, neunzig: 90
});

const HUNDREDS = Object.freeze({
  hundert: 100, einhundert: 100, zweihundert: 200, dreihundert: 300, vierhundert: 400,
  fünfhundert: 500, funfhundert: 500, sechshundert: 600, siebenhundert: 700,
  achthundert: 800, neunhundert: 900, tausend: 1000, eintausend: 1000
});

const NUMBER_WORDS = Object.freeze({ ...ONES, ...TENS, ...HUNDREDS });

// "einundzwanzig", "vierundsechzig"
const COMPOSED = /^([a-zäöüß]+)und([a-zäöüß]+)$/;

/**
 * Wandelt ein deutsches Zahlwort in seine Ziffernform. Gibt null zurück, wenn es
 * keines ist.
 */
export function germanNumberWordToDigits(word) {
  const value = String(word ?? '').toLowerCase();
  if (!value) return null;
  if (Object.hasOwn(NUMBER_WORDS, value)) return String(NUMBER_WORDS[value]);

  const composed = value.match(COMPOSED);
  if (composed) {
    const ones = ONES[composed[1]];
    const tens = TENS[composed[2]];
    if (Number.isFinite(ones) && Number.isFinite(tens)) return String(tens + ones);
  }
  return null;
}

/**
 * Vereinheitlicht ein einzelnes Token: Kleinschreibung, keine Satz- und
 * Trennzeichen, Zahlwörter als Ziffern.
 */
export function normalizeSpokenToken(token) {
  const bare = String(token ?? '')
    .toLocaleLowerCase('de-DE')
    .replace(/[^0-9a-zäöüß]/g, '');
  if (!bare) return '';
  return germanNumberWordToDigits(bare) ?? bare;
}

/**
 * Baut aus Wort-Objekten einen fortlaufenden Zeichenstrom und merkt sich für
 * jede Zeichenposition, zu welchem Wort sie gehört. Dadurch findet die Suche
 * auch dann die richtige Stelle, wenn Plan und Transkript anders trennen.
 */
export function buildSpokenStream(words) {
  let text = '';
  const wordIndexByChar = [];
  for (const [index, entry] of words.entries()) {
    const normalized = normalizeSpokenToken(entry.word ?? entry.text ?? entry);
    for (let position = 0; position < normalized.length; position += 1) wordIndexByChar.push(index);
    text += normalized;
  }
  return { text, wordIndexByChar };
}

export function normalizeSpokenPhrase(phrase) {
  return String(phrase ?? '')
    .split(/\s+/)
    .map((token) => normalizeSpokenToken(token))
    .join('');
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    previous = current;
  }
  return previous[b.length];
}

const similarity = (a, b) => (a.length === 0 ? 0 : 1 - levenshtein(a, b) / Math.max(a.length, b.length));

/**
 * Sucht den Cue im Wortstrom ab `fromWordIndex`. Die Suche ist monoton: Ein
 * späterer Cue darf nie vor einem früheren liegen, sonst würde eine im Script
 * wiederholte Formulierung den Bildschnitt an die falsche Stelle ziehen.
 *
 * @returns {{wordIndex: number, startSeconds: number, confidence: number, method: string}|null}
 */
export function findSpokenCue(cue, words, { fromWordIndex = 0, minimumConfidence = 0.72 } = {}) {
  const needle = normalizeSpokenPhrase(cue);
  if (needle.length < 3 || words.length === 0) return null;

  const remaining = words.slice(fromWordIndex);
  const { text, wordIndexByChar } = buildSpokenStream(remaining);
  if (!text) return null;

  const at = (charIndex, confidence, method) => {
    const wordIndex = fromWordIndex + wordIndexByChar[charIndex];
    return { wordIndex, startSeconds: Number(words[wordIndex].start), confidence, method };
  };

  const exact = text.indexOf(needle);
  if (exact !== -1) return at(exact, 1, 'exact');

  let best = { score: 0, index: -1 };
  const window = needle.length;
  const limit = Math.max(0, text.length - Math.floor(window * 0.6));
  for (let index = 0; index <= limit; index += 1) {
    // Nur an Wortanfängen ansetzen: Ein Bildschnitt beginnt nie mitten im Wort.
    if (index > 0 && wordIndexByChar[index] === wordIndexByChar[index - 1]) continue;
    for (const span of [window, window - 2, window + 2]) {
      if (span < 3) continue;
      const score = similarity(needle, text.slice(index, index + span));
      if (score > best.score) best = { score, index };
    }
  }

  if (best.index !== -1 && best.score >= minimumConfidence) {
    return at(best.index, Number(best.score.toFixed(3)), 'fuzzy');
  }
  return null;
}
