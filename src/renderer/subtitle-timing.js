const WORD_PATTERN = /\S+/g;

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function tokenWeight(text) {
  const clean = String(text).replace(/[^\p{L}\p{N}]/gu, '');
  return Math.max(1, clean.length * 0.85 + 1);
}

export function buildWordTimings(cue = {}) {
  const cueStart = finite(cue.startSeconds) ?? 0;
  const cueEnd = finite(cue.endSeconds) ?? cueStart;
  const duration = Math.max(0.05, cueEnd - cueStart);
  const supplied = Array.isArray(cue.words) ? cue.words : [];

  const exact = supplied
    .map((word) => {
      const text = String(word.text ?? '').trim();
      const absoluteStart = finite(word.startSeconds);
      const absoluteEnd = finite(word.endSeconds);
      const offsetStart = finite(word.offsetStartSeconds);
      const offsetEnd = finite(word.offsetEndSeconds);
      const start = absoluteStart !== null ? absoluteStart - cueStart : offsetStart;
      const end = absoluteEnd !== null ? absoluteEnd - cueStart : offsetEnd;
      return { text, startSeconds: start, endSeconds: end };
    })
    .filter((word) => word.text && word.startSeconds !== null && word.endSeconds !== null && word.endSeconds > word.startSeconds);

  if (exact.length > 0 && exact.length === supplied.length) {
    return exact.map((word) => ({
      ...word,
      startSeconds: Math.max(0, word.startSeconds),
      endSeconds: Math.min(duration, word.endSeconds),
      timingStatus: 'exact'
    }));
  }

  const text = String(cue.text ?? '');
  const tokens = text.match(WORD_PATTERN) ?? [];
  if (tokens.length === 0) return [];

  const weights = tokens.map(tokenWeight);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  let cursor = 0;
  return tokens.map((token, index) => {
    const startSeconds = cursor;
    const endSeconds = index === tokens.length - 1
      ? duration
      : cursor + duration * (weights[index] / totalWeight);
    cursor = endSeconds;
    return {
      text: token,
      startSeconds,
      endSeconds,
      timingStatus: 'estimated'
    };
  });
}

export function activeWordIndex(words, elapsedSeconds) {
  if (!Array.isArray(words) || words.length === 0) return -1;
  const elapsed = Math.max(0, Number(elapsedSeconds) || 0);
  const exact = words.findIndex((word) => elapsed >= word.startSeconds && elapsed < word.endSeconds);
  if (exact >= 0) return exact;
  if (elapsed >= words.at(-1).endSeconds) return words.length - 1;
  const next = words.findIndex((word) => elapsed < word.startSeconds);
  return next <= 0 ? 0 : next - 1;
}
