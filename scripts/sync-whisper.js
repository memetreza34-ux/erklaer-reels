import fs from 'fs';
import path from 'path';

if (process.argv.length < 4) {
  console.log('Usage: node sync-whisper.js <path_to_whisper_json> <path_to_reel_dir>');
  process.exit(1);
}

const whisperPath = process.argv[2];
const reelDir = process.argv[3];

const whisperWords = JSON.parse(fs.readFileSync(whisperPath, 'utf8'));
const codexPath = path.join(reelDir, 'subtitles/codex-word-sync.json');
const audioPath = path.join(reelDir, 'timeline/audio-sync.json');

const codex = JSON.parse(fs.readFileSync(codexPath, 'utf8'));
const audio = JSON.parse(fs.readFileSync(audioPath, 'utf8'));

const normalize = (text) => String(text || '')
  .toLocaleLowerCase('de-DE')
  .replace(/[^a-z0-9äöüß]/g, '');

const finite = (value) => Number.isFinite(Number(value)) ? Number(value) : null;

let wWords = [];
if (Array.isArray(whisperWords.words)) {
  wWords = whisperWords.words;
} else if (Array.isArray(whisperWords.segments)) {
  wWords = whisperWords.segments.flatMap((segment) => segment.words || []);
} else if (Array.isArray(whisperWords)) {
  wWords = whisperWords;
}

wWords = wWords
  .map((word) => ({
    text: String(word.word ?? word.text ?? ''),
    normalized: normalize(word.word ?? word.text),
    start: finite(word.start ?? word.startSeconds),
    end: finite(word.end ?? word.endSeconds)
  }))
  .filter((word) => word.normalized && word.start !== null && word.end !== null && word.end > word.start);

const distance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: b.length + 1 }, (_, index) => [index]);
  for (let index = 0; index <= a.length; index += 1) matrix[0][index] = index;
  for (let i = 1; i <= b.length; i += 1) {
    for (let j = 1; j <= a.length; j += 1) {
      matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
};

const fuzzyConfidence = (target, candidate) => {
  if (target === candidate) return 1;
  const dist = distance(target, candidate);
  const longest = Math.max(target.length, candidate.length, 1);
  const score = 1 - dist / longest;
  return score >= 0.85 ? Math.max(0.85, Math.min(0.99, score)) : 0;
};

for (const word of codex.words ?? []) {
  word.startSeconds = null;
  word.endSeconds = null;
  word.reviewed = false;
  word.confidence = null;
  word.note = 'Whisper candidate only; acoustic review still required.';
}

let wIdx = 0;
for (const cw of codex.words ?? []) {
  const target = normalize(cw.text);
  if (!target) continue;

  let match = null;

  // Prefer one real Whisper token near the current cursor.
  for (let lookahead = 0; lookahead < 8 && wIdx + lookahead < wWords.length; lookahead += 1) {
    const candidate = wWords[wIdx + lookahead];
    const confidence = fuzzyConfidence(target, candidate.normalized);
    if (confidence > 0) {
      match = {
        start: candidate.start,
        end: candidate.end,
        confidence,
        nextIndex: wIdx + lookahead + 1
      };
      break;
    }
  }

  // Whisper can split one written word into several acoustic tokens.
  if (!match) {
    for (let lookahead = 0; lookahead < 5 && wIdx + lookahead < wWords.length; lookahead += 1) {
      for (let count = 1; count <= 3 && wIdx + lookahead + count - 1 < wWords.length; count += 1) {
        const slice = wWords.slice(wIdx + lookahead, wIdx + lookahead + count);
        const combined = slice.map((word) => word.normalized).join('');
        const confidence = fuzzyConfidence(target, combined);
        if (confidence > 0) {
          match = {
            start: slice[0].start,
            end: slice.at(-1).end,
            confidence,
            nextIndex: wIdx + lookahead + count
          };
          break;
        }
      }
      if (match) break;
    }
  }

  if (match) {
    cw.startSeconds = match.start;
    cw.endSeconds = match.end;
    cw.confidence = match.confidence;
    cw.note = 'Whisper timestamp candidate; must be acoustically reviewed before strict apply.';
    wIdx = match.nextIndex;
  }
}

const codexWords = codex.words ?? [];
const findCueTime = (audioCue, startIndex = 0) => {
  const cueWords = String(audioCue ?? '').split(/\s+/).map(normalize).filter(Boolean);
  if (cueWords.length === 0) return null;

  for (let i = startIndex; i <= codexWords.length - cueWords.length; i += 1) {
    const matchesText = cueWords.every((word, offset) => normalize(codexWords[i + offset]?.text) === word);
    const allTimed = cueWords.every((_, offset) => finite(codexWords[i + offset]?.startSeconds) !== null);
    if (matchesText && allTimed) {
      return { time: Number(codexWords[i].startSeconds), nextIndex: i + cueWords.length };
    }
  }
  return null;
};

let currentIndex = 0;
for (const cue of audio.cueTimings ?? []) {
  const result = findCueTime(cue.audioCue, currentIndex);
  if (result) {
    // Keep the machine result separate from the verified scene anchor.
    // The timeline only uses cueTimeSeconds, so an unreviewed Whisper result can never silently mark scene sync as exact.
    cue.candidateCueTimeSeconds = result.time;
    cue.cueTimeSeconds = null;
    cue.reviewed = false;
    cue.confidence = null;
    cue.timingSource = 'whisper-candidate';
    currentIndex = result.nextIndex;
  } else {
    cue.candidateCueTimeSeconds = null;
    cue.cueTimeSeconds = null;
    cue.reviewed = false;
    cue.confidence = null;
    cue.timingSource = 'missing';
  }
}

fs.writeFileSync(codexPath, `${JSON.stringify(codex, null, 2)}\n`);
fs.writeFileSync(audioPath, `${JSON.stringify(audio, null, 2)}\n`);

const unresolvedWords = codexWords.filter((word) => finite(word.startSeconds) === null || finite(word.endSeconds) === null);
const missingCueCandidates = (audio.cueTimings ?? []).filter((cue) => finite(cue.candidateCueTimeSeconds) === null);

if (unresolvedWords.length || missingCueCandidates.length) {
  console.error(`Whisper alignment incomplete: ${unresolvedWords.length} word(s) and ${missingCueCandidates.length} scene cue candidate(s) unresolved. No synthetic timings were created.`);
  process.exitCode = 1;
} else {
  console.log('Whisper candidates came only from real timestamps. Word timings and scene anchors remain unreviewed until acoustic confirmation.');
}
