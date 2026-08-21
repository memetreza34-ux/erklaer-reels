function normalizeToken(value) {
  return String(value ?? '')
    .toLocaleLowerCase('de-DE')
    .replace(/[^a-z0-9äöüß]/g, '');
}

function finiteNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function rawWhisperWords(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.words)) return payload.words;
  if (Array.isArray(payload?.segments)) {
    return payload.segments.flatMap((segment) => Array.isArray(segment?.words) ? segment.words : []);
  }
  return [];
}

export function extractWhisperWords(payload) {
  return rawWhisperWords(payload)
    .map((word, index) => {
      const text = String(word?.word ?? word?.text ?? '').trim();
      const startSeconds = finiteNumber(word?.start ?? word?.startSeconds);
      const endSeconds = finiteNumber(word?.end ?? word?.endSeconds);
      const confidence = finiteNumber(word?.probability ?? word?.confidence ?? word?.score);
      return {
        index,
        text,
        normalizedText: normalizeToken(text),
        startSeconds,
        endSeconds,
        confidence
      };
    })
    .filter((word) => word.normalizedText && word.startSeconds !== null && word.endSeconds > word.startSeconds);
}

function distance(left, right) {
  const a = String(left);
  const b = String(right);
  const rows = Array.from({ length: b.length + 1 }, (_, index) => [index]);
  for (let column = 0; column <= a.length; column += 1) rows[0][column] = column;
  for (let row = 1; row <= b.length; row += 1) {
    for (let column = 1; column <= a.length; column += 1) {
      rows[row][column] = b[row - 1] === a[column - 1]
        ? rows[row - 1][column - 1]
        : Math.min(rows[row - 1][column - 1], rows[row][column - 1], rows[row - 1][column]) + 1;
    }
  }
  return rows[b.length][a.length];
}

function similarity(left, right) {
  const longest = Math.max(left.length, right.length);
  return longest ? 1 - distance(left, right) / longest : 1;
}

function groupAt(words, start, length) {
  const entries = words.slice(start, start + length);
  if (entries.length !== length) return null;
  return {
    entries,
    normalizedText: entries.map((word) => word.normalizedText).join(''),
    text: entries.map((word) => word.text).join(' '),
    startSeconds: entries[0].startSeconds,
    endSeconds: entries.at(-1).endSeconds
  };
}

function bestCandidate(target, whisperWords, cursor, {
  maxGroupWords,
  lookaheadWords,
  minimumFuzzySimilarity,
  previousEndSeconds
}) {
  let fuzzy = null;
  for (let offset = 0; offset <= lookaheadWords; offset += 1) {
    const start = cursor + offset;
    for (let length = 1; length <= maxGroupWords; length += 1) {
      const group = groupAt(whisperWords, start, length);
      if (!group || group.startSeconds < previousEndSeconds - 0.03) continue;
      if (group.normalizedText === target) return { ...group, start, length, offset, exact: true, similarity: 1 };
      const score = similarity(target, group.normalizedText);
      if (score >= minimumFuzzySimilarity && (!fuzzy || score > fuzzy.similarity)) {
        fuzzy = { ...group, start, length, offset, exact: false, similarity: score };
      }
    }
  }
  return fuzzy;
}

function alignmentConfidence(candidate) {
  const acoustic = candidate.entries
    .map((word) => word.confidence)
    .filter((value) => value !== null);
  const acousticMinimum = acoustic.length ? Math.min(...acoustic) : 0.99;
  return Math.round(Math.min(acousticMinimum, candidate.similarity) * 1000) / 1000;
}

export function alignWhisperWords(scriptWords, whisperPayload, options = {}) {
  const settings = {
    maxGroupWords: Number(options.maxGroupWords ?? 4),
    lookaheadWords: Number(options.lookaheadWords ?? 3),
    minimumFuzzySimilarity: Number(options.minimumFuzzySimilarity ?? 0.84)
  };
  const whisperWords = extractWhisperWords(whisperPayload);
  const words = [];
  const unmatchedScriptWords = [];
  const fuzzyScriptWords = [];
  const extraWhisperEntries = [];
  let cursor = 0;
  let previousEndSeconds = 0;

  for (const original of Array.isArray(scriptWords) ? scriptWords : []) {
    const target = normalizeToken(original?.text);
    const candidate = target
      ? bestCandidate(target, whisperWords, cursor, { ...settings, previousEndSeconds })
      : null;

    if (!candidate) {
      unmatchedScriptWords.push(String(original?.text ?? ''));
      words.push({
        ...original,
        startSeconds: null,
        endSeconds: null,
        confidence: null,
        reviewed: false,
        alignmentMethod: 'unmatched',
        alignmentSource: 'whisper-final-audio'
      });
      continue;
    }

    if (candidate.offset > 0) {
      extraWhisperEntries.push(...whisperWords.slice(cursor, candidate.start));
    }
    const confidence = alignmentConfidence(candidate);
    const reviewed = candidate.exact;
    if (!candidate.exact) fuzzyScriptWords.push(String(original?.text ?? ''));

    words.push({
      ...original,
      startSeconds: candidate.startSeconds,
      endSeconds: candidate.endSeconds,
      confidence,
      reviewed,
      alignmentMethod: candidate.exact
        ? candidate.length === 1 ? 'whisper-exact' : 'whisper-exact-group'
        : 'whisper-fuzzy-needs-review',
      alignmentSource: 'whisper-final-audio',
      confidenceSource: candidate.entries.some((word) => word.confidence !== null)
        ? 'whisper-acoustic-and-text-alignment'
        : 'exact-text-and-timing-alignment',
      alignedWhisperText: candidate.text
    });
    previousEndSeconds = candidate.endSeconds;
    cursor = candidate.start + candidate.length;
  }

  extraWhisperEntries.push(...whisperWords.slice(cursor));
  const extraWhisperWords = extraWhisperEntries.map((word) => word.text);
  const passed = words.length > 0
    && whisperWords.length > 0
    && unmatchedScriptWords.length === 0
    && fuzzyScriptWords.length === 0
    && extraWhisperWords.length === 0;

  return {
    passed,
    words,
    report: {
      passed,
      scriptWordCount: words.length,
      whisperWordCount: whisperWords.length,
      whisperStartSeconds: whisperWords[0]?.startSeconds ?? null,
      whisperEndSeconds: whisperWords.at(-1)?.endSeconds ?? null,
      exactlyAlignedWords: words.filter((word) => word.reviewed === true).length,
      unmatchedScriptWords,
      fuzzyScriptWords,
      extraWhisperWords,
      fallbackCount: 0
    }
  };
}

function findCue(words, cueTokens, startIndex) {
  for (let index = startIndex; index <= words.length - cueTokens.length; index += 1) {
    const candidates = words.slice(index, index + cueTokens.length);
    const valid = candidates.every((word, tokenIndex) =>
      normalizeToken(word?.text) === cueTokens[tokenIndex]
      && word?.reviewed === true
      && finiteNumber(word?.startSeconds) !== null
      && finiteNumber(word?.endSeconds) > finiteNumber(word?.startSeconds));
    if (valid) return { index, words: candidates };
  }
  return null;
}

export function alignAudioCueTimings(cueTimings, alignedWords) {
  const words = Array.isArray(alignedWords) ? alignedWords : [];
  const unmatchedCues = [];
  const output = [];
  let cursor = 0;

  for (const original of Array.isArray(cueTimings) ? cueTimings : []) {
    const cueTokens = String(original?.audioCue ?? '')
      .split(/\s+/)
      .map(normalizeToken)
      .filter(Boolean);
    const match = cueTokens.length ? findCue(words, cueTokens, cursor) : null;

    if (!match) {
      unmatchedCues.push(String(original?.sceneId ?? original?.audioCue ?? 'unbekannt'));
      output.push({
        ...original,
        cueTimeSeconds: null,
        confidence: null,
        matchMethod: 'unmatched'
      });
      continue;
    }

    const confidenceValues = match.words
      .map((word) => finiteNumber(word.confidence))
      .filter((value) => value !== null);
    output.push({
      ...original,
      cueTimeSeconds: finiteNumber(match.words[0].startSeconds),
      confidence: confidenceValues.length ? Math.min(...confidenceValues) : null,
      matchMethod: 'whisper-word-alignment'
    });
    cursor = match.index + match.words.length;
  }

  const passed = output.length > 0 && unmatchedCues.length === 0;
  return {
    passed,
    cueTimings: output,
    report: {
      passed,
      cueCount: output.length,
      matchedCueCount: output.length - unmatchedCues.length,
      unmatchedCues,
      fallbackCount: 0
    }
  };
}
