const WORD_PATTERN = /\S+/g;

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeText(value) {
  return String(value ?? '')
    .toLocaleLowerCase('de-DE')
    .replace(/[„“”"'’`´.,!?;:()[\]{}…—–-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function suppliedWords(cue = {}) {
  if (Array.isArray(cue.wordTimings)) return cue.wordTimings;
  if (Array.isArray(cue.words)) return cue.words;
  return [];
}

export function validateExactWordTimings(cue = {}) {
  const cueStart = finite(cue.startSeconds);
  const cueEnd = finite(cue.endSeconds);
  const supplied = suppliedWords(cue);
  const issues = [];

  if (supplied.length === 0) {
    return { valid: false, issues: ['Keine exakten Wortzeiten vorhanden.'], words: [] };
  }

  const words = supplied.map((word, index) => {
    const text = String(word?.text ?? word?.word ?? '').trim();
    const absoluteStart = finite(word?.startSeconds);
    const absoluteEnd = finite(word?.endSeconds);
    const offsetStart = finite(word?.offsetStartSeconds);
    const offsetEnd = finite(word?.offsetEndSeconds);
    const startSeconds = absoluteStart !== null && cueStart !== null
      ? absoluteStart - cueStart
      : offsetStart;
    const endSeconds = absoluteEnd !== null && cueStart !== null
      ? absoluteEnd - cueStart
      : offsetEnd;

    return { index, text, startSeconds, endSeconds };
  });

  let previousEnd = -Infinity;
  const cueDuration = cueStart !== null && cueEnd !== null ? cueEnd - cueStart : null;

  for (const word of words) {
    if (!word.text) issues.push(`Wort ${word.index + 1} enthält keinen Text.`);
    if (word.startSeconds === null || word.endSeconds === null) {
      issues.push(`Wort ${word.index + 1} besitzt keine gültige Start- und Endzeit.`);
      continue;
    }
    if (word.endSeconds <= word.startSeconds) {
      issues.push(`Wort ${word.index + 1} endet nicht nach seinem Start.`);
    }
    if (word.startSeconds < previousEnd - 0.03) {
      issues.push(`Wort ${word.index + 1} überlappt oder ist falsch sortiert.`);
    }
    if (word.startSeconds < -0.08) {
      issues.push(`Wort ${word.index + 1} beginnt vor dem Untertitel-Cue.`);
    }
    if (cueDuration !== null && word.endSeconds > cueDuration + 0.08) {
      issues.push(`Wort ${word.index + 1} endet nach dem Untertitel-Cue.`);
    }
    previousEnd = word.endSeconds;
  }

  const cueText = normalizeText(cue.text);
  const timedText = normalizeText(words.map((word) => word.text).join(' '));
  if (cueText && timedText !== cueText) {
    issues.push('Die Wortliste stimmt nicht vollständig mit dem sichtbaren Untertiteltext überein.');
  }

  return {
    valid: issues.length === 0,
    issues,
    words: words.map((word) => ({
      text: word.text,
      startSeconds: word.startSeconds,
      endSeconds: word.endSeconds,
      timingStatus: 'exact'
    }))
  };
}

export function buildWordTimings(cue = {}) {
  const exact = validateExactWordTimings(cue);
  if (exact.valid) return exact.words;

  const tokens = String(cue.text ?? '').match(WORD_PATTERN) ?? [];
  return tokens.map((token) => ({
    text: token,
    startSeconds: null,
    endSeconds: null,
    timingStatus: 'missing'
  }));
}

export function activeWordIndex(words, elapsedSeconds) {
  if (!Array.isArray(words) || words.length === 0) return -1;
  if (!words.every((word) => word.timingStatus === 'exact' && Number.isFinite(word.startSeconds) && Number.isFinite(word.endSeconds))) {
    return -1;
  }

  const elapsed = Number(elapsedSeconds);
  if (!Number.isFinite(elapsed)) return -1;

  let active = -1;
  for (let index = 0; index < words.length; index += 1) {
    if (elapsed + 0.015 >= words[index].startSeconds) active = index;
    else break;
  }
  if (active < 0) return -1;

  const nextStart = words[active + 1]?.startSeconds;
  const highlightUntil = Number.isFinite(nextStart)
    ? nextStart
    : words[active].endSeconds + 0.1;
  return elapsed <= highlightUntil + 0.015 ? active : -1;
}
