const DEFAULT_VERTICAL_POSITION_PERCENT = 77;
const MIN_VERTICAL_POSITION_PERCENT = 73;
const MAX_VERTICAL_POSITION_PERCENT = 79;

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function normalizeSubtitleText(value) {
  return String(value ?? '')
    .toLocaleLowerCase('de-DE')
    .replace(/[„“”"'’`´.,!?;:()[\]{}…—–-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getSubtitleVerticalPositionPercent(cue = {}) {
  const requested = finiteNumber(cue.verticalPositionPercent);
  const fallback = requested ?? DEFAULT_VERTICAL_POSITION_PERCENT;
  return Math.min(
    MAX_VERTICAL_POSITION_PERCENT,
    Math.max(MIN_VERTICAL_POSITION_PERCENT, fallback)
  );
}

export function getSubtitleWordTimings(cue = {}) {
  const source = Array.isArray(cue.wordTimings)
    ? cue.wordTimings
    : Array.isArray(cue.words)
      ? cue.words
      : [];

  return source
    .map((word, index) => ({
      index,
      text: String(word?.text ?? word?.word ?? '').trim(),
      startSeconds: finiteNumber(word?.startSeconds),
      endSeconds: finiteNumber(word?.endSeconds)
    }))
    .filter((word) => word.text.length > 0);
}

export function validateSubtitleWordTimings(cue = {}) {
  const words = getSubtitleWordTimings(cue);
  const cueStart = finiteNumber(cue.startSeconds);
  const cueEnd = finiteNumber(cue.endSeconds);
  const issues = [];

  if (words.length === 0) {
    issues.push('Keine exakten Wortzeitpunkte vorhanden.');
    return { valid: false, words, issues };
  }

  let previousStart = -Infinity;
  let previousEnd = -Infinity;
  for (const word of words) {
    if (word.startSeconds === null || word.endSeconds === null) {
      issues.push(`Wort ${word.index + 1} hat keine gültige Start- und Endzeit.`);
      continue;
    }
    if (word.endSeconds <= word.startSeconds) {
      issues.push(`Wort ${word.index + 1} endet nicht nach seinem Start.`);
    }
    if (word.startSeconds < previousStart || word.startSeconds < previousEnd - 0.03) {
      issues.push(`Wort ${word.index + 1} ist zeitlich nicht sauber sortiert.`);
    }
    if (cueStart !== null && word.startSeconds < cueStart - 0.08) {
      issues.push(`Wort ${word.index + 1} beginnt vor dem Untertitel-Cue.`);
    }
    if (cueEnd !== null && word.endSeconds > cueEnd + 0.08) {
      issues.push(`Wort ${word.index + 1} endet nach dem Untertitel-Cue.`);
    }
    previousStart = word.startSeconds;
    previousEnd = word.endSeconds;
  }

  const expectedText = normalizeSubtitleText(cue.text);
  const timedText = normalizeSubtitleText(words.map((word) => word.text).join(' '));
  if (expectedText && timedText !== expectedText) {
    issues.push('Die Wörter der Synchronisierung stimmen nicht vollständig mit dem Untertiteltext überein.');
  }

  return { valid: issues.length === 0, words, issues };
}

export function getActiveSubtitleWordIndex(cue = {}, currentSeconds) {
  const { valid, words } = validateSubtitleWordTimings(cue);
  if (!valid || !Number.isFinite(Number(currentSeconds))) return -1;

  const current = Number(currentSeconds);
  let activeIndex = -1;
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    if (current + 0.015 >= word.startSeconds) activeIndex = index;
    else break;
  }

  if (activeIndex < 0) return -1;
  const active = words[activeIndex];
  const next = words[activeIndex + 1];
  const highlightUntil = next?.startSeconds ?? active.endSeconds + 0.12;
  return current <= highlightUntil + 0.015 ? activeIndex : -1;
}

export const subtitleTimingDefaults = Object.freeze({
  verticalPositionPercent: DEFAULT_VERTICAL_POSITION_PERCENT,
  minimumVerticalPositionPercent: MIN_VERTICAL_POSITION_PERCENT,
  maximumVerticalPositionPercent: MAX_VERTICAL_POSITION_PERCENT,
  highlightColor: '#FFD84D'
});
