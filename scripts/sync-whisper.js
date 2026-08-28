import fs from 'fs';
import path from 'path';

if (process.argv.length < 4) {
  console.log('Aufruf: node scripts/sync-whisper.js <whisper.json> <reel-verzeichnis>');
  process.exit(1);
}

const whisperPath = process.argv[2];
const reelDir = process.argv[3];
const codexPath = path.join(reelDir, 'subtitles/codex-word-sync.json');
const audioPath = path.join(reelDir, 'timeline/audio-sync.json');

const whisperRaw = JSON.parse(fs.readFileSync(whisperPath, 'utf8'));
const codex = JSON.parse(fs.readFileSync(codexPath, 'utf8'));
const audio = JSON.parse(fs.readFileSync(audioPath, 'utf8'));

const normalize = (text) => String(text || '')
  .toLocaleLowerCase('de-DE')
  .replace(/[^a-z0-9äöüß]/g, '');

// Number(null) und Number('') sind 0, nicht NaN. Ohne diese Vorprüfung würde ein
// fehlender Zeitstempel als gültige Sekunde 0 durchgehen und die Guards unten wirkungslos machen.
const finite = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

function whisperWordList(source) {
  if (Array.isArray(source)) return source;
  if (Array.isArray(source?.words)) return source.words;
  if (Array.isArray(source?.segments)) return source.segments.flatMap((segment) => segment.words ?? []);
  return [];
}

const spoken = whisperWordList(whisperRaw)
  .map((word) => ({
    normalized: normalize(word.word ?? word.text),
    start: finite(word.start ?? word.startSeconds),
    end: finite(word.end ?? word.endSeconds)
  }))
  .filter((word) => word.normalized && word.start !== null && word.end !== null && word.end > word.start);

const distance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let previous = Array.from({ length: a.length + 1 }, (_, index) => index);
  for (let i = 1; i <= b.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= a.length; j += 1) {
      current[j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? previous[j - 1]
        : Math.min(previous[j - 1] + 1, current[j - 1] + 1, previous[j] + 1);
    }
    previous = current;
  }
  return previous[a.length];
};

const fuzzyConfidence = (target, candidate) => {
  if (!target || !candidate) return 0;
  if (target === candidate) return 1;
  const dist = distance(target, candidate);
  const longest = Math.max(target.length, candidate.length, 1);
  const score = 1 - dist / longest;
  return score >= 0.85 ? Math.max(0.85, Math.min(0.99, score)) : 0;
};

// Längste gemeinsame Teilfolge als Gerüst. Anders als eine laufende Suche mit festem
// Vorgriff verkraftet sie zusätzliche oder fehlende Wörter im Transkript, ohne dass
// alle folgenden Zuordnungen verrutschen.
function longestCommonSubsequence(scriptTokens, spokenTokens) {
  const n = scriptTokens.length;
  const m = spokenTokens.length;
  const table = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      table[i][j] = scriptTokens[i] === spokenTokens[j]
        ? table[i + 1][j + 1] + 1
        : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const pairs = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (scriptTokens[i] === spokenTokens[j]) {
      pairs.push([i, j]);
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      i += 1;
    } else {
      j += 1;
    }
  }
  return pairs;
}

const codexWords = codex.words ?? [];

for (const word of codexWords) {
  word.startSeconds = null;
  word.endSeconds = null;
  word.reviewed = false;
  word.confidence = null;
  word.note = 'Whisper candidate only; acoustic review still required.';
}

// Ein Script-Wort kann sich über mehrere Transkript-Tokens erstrecken, weil die
// Spracherkennung deutsche Komposita häufig trennt ("Nullmeridian" wird zu "null
// meridian"). Start und Ende stammen dann weiterhin aus der Messung.
const MAXIMUM_TOKEN_SPAN = 3;

const scriptTokens = codexWords.map((word) => normalize(word.text));
const spokenTokens = spoken.map((word) => word.normalized);
const anchors = longestCommonSubsequence(scriptTokens, spokenTokens);

// Zeiten stammen immer aus echten Whisper-Messungen, gelten aber nie als bestätigt.
// Die Timeline liest ausschließlich verifizierte Werte, daher bleibt reviewed false.
const assign = (scriptIndex, fromSpokenIndex, toSpokenIndex, confidence) => {
  const target = codexWords[scriptIndex];
  target.startSeconds = spoken[fromSpokenIndex].start;
  target.endSeconds = spoken[toSpokenIndex].end;
  target.confidence = confidence;
  target.reviewed = false;
  target.note = 'Whisper timestamp candidate; must be acoustically reviewed before strict apply.';
};

for (const [scriptIndex, spokenIndex] of anchors) assign(scriptIndex, spokenIndex, spokenIndex, 1);

// Lücken zwischen zwei Ankern nur dann füllen, wenn sich ein Wort eindeutig
// wiedererkennen lässt. Übrige Wörter bleiben ohne Zeit und damit unbestätigt.
const boundaries = [[-1, -1], ...anchors, [codexWords.length, spoken.length]];
for (let index = 1; index < boundaries.length; index += 1) {
  const [previousScript, previousSpoken] = boundaries[index - 1];
  const [nextScript, nextSpoken] = boundaries[index];
  let cursorSpoken = previousSpoken + 1;

  for (let scriptIndex = previousScript + 1; scriptIndex < nextScript; scriptIndex += 1) {
    let matched = false;
    for (let start = cursorSpoken; start < nextSpoken && !matched; start += 1) {
      let combined = '';
      for (let span = 0; span < MAXIMUM_TOKEN_SPAN && start + span < nextSpoken; span += 1) {
        combined += spokenTokens[start + span];
        const confidence = fuzzyConfidence(scriptTokens[scriptIndex], combined);
        if (confidence > 0) {
          assign(scriptIndex, start, start + span, confidence);
          cursorSpoken = start + span + 1;
          matched = true;
          break;
        }
      }
    }
  }
}

// Reihenfolge prüfen, statt sie durch Verschieben zu erzwingen. Überlappungen weisen
// auf eine falsche Zuordnung hin und müssen sichtbar bleiben.
const outOfOrder = [];
let previousEnd = -Infinity;
for (const word of codexWords) {
  const start = finite(word.startSeconds);
  const end = finite(word.endSeconds);
  if (start === null || end === null) continue;
  if (start < previousEnd - 0.03) outOfOrder.push(word);
  previousEnd = end;
}

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

const unresolvedWords = codexWords.filter((word) => finite(word.startSeconds) === null || finite(word.endSeconds) === null);
const missingCueCandidates = (audio.cueTimings ?? []).filter((cue) => finite(cue.candidateCueTimeSeconds) === null);

codex.status = 'pending-acoustic-review';
codex.updatedAt = new Date().toISOString();
codex.timingSource = 'whisper-word-timestamps';
codex.notes = [
  ...(Array.isArray(codex.notes) ? codex.notes : []),
  `${new Date().toISOString()}: ${codexWords.length - unresolvedWords.length}/${codexWords.length} Wörter als Whisper-Kandidaten übernommen.`
];

fs.writeFileSync(codexPath, `${JSON.stringify(codex, null, 2)}\n`);
fs.writeFileSync(audioPath, `${JSON.stringify(audio, null, 2)}\n`);

if (unresolvedWords.length || missingCueCandidates.length || outOfOrder.length) {
  console.error(`Whisper alignment incomplete: ${unresolvedWords.length} word(s), ${missingCueCandidates.length} scene cue candidate(s) unresolved, ${outOfOrder.length} word(s) out of order. No synthetic timings were created.`);
  process.exitCode = 1;
} else {
  console.log('Whisper candidates came only from real timestamps. Word timings and scene anchors remain unreviewed until acoustic confirmation.');
}
