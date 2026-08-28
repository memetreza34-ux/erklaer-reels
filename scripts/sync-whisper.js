// Überträgt echte Wortzeitstempel aus einem Whisper-Lauf in die Word-Sync-Arbeitsdatei
// und leitet daraus die Szenen-Cues ab.
//
// Grundregeln:
//   - Es werden ausschließlich gemessene Zeiten übernommen. Wörter ohne sichere
//     Zuordnung bleiben null und gelten als nicht bestätigt; sie werden gemeldet,
//     nicht geraten.
//   - Wortzeiten werden nicht an Szenengrenzen beschnitten. Die Szenengrenzen
//     folgen den Wortzeiten, nicht umgekehrt.

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

const codex = JSON.parse(fs.readFileSync(codexPath, 'utf8'));
const audio = JSON.parse(fs.readFileSync(audioPath, 'utf8'));
const whisperRaw = JSON.parse(fs.readFileSync(whisperPath, 'utf8'));

const normalize = (text) => String(text ?? '').toLowerCase().replace(/[^a-z0-9äöüß]/g, '');

function whisperWords(source) {
  if (Array.isArray(source)) return source;
  if (Array.isArray(source?.words)) return source.words;
  if (Array.isArray(source?.segments)) return source.segments.flatMap((segment) => segment.words ?? []);
  return [];
}

const spoken = whisperWords(whisperRaw)
  .map((word) => ({
    text: normalize(word.word ?? word.text),
    startSeconds: Number(word.start ?? word.startSeconds),
    endSeconds: Number(word.end ?? word.endSeconds)
  }))
  .filter((word) => word.text && Number.isFinite(word.startSeconds) && Number.isFinite(word.endSeconds));

if (!spoken.length) {
  console.error('Die Whisper-Datei enthält keine verwertbaren Wortzeitstempel.');
  process.exit(1);
}

function levenshtein(a, b) {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let previous = Array.from({ length: a.length + 1 }, (_, index) => index);
  for (let i = 1; i <= b.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= a.length; j += 1) {
      current[j] = b[i - 1] === a[j - 1]
        ? previous[j - 1]
        : Math.min(previous[j - 1] + 1, current[j - 1] + 1, previous[j] + 1);
    }
    previous = current;
  }
  return previous[a.length];
}

const isFuzzyMatch = (a, b) => {
  if (!a || !b) return false;
  if (a === b) return true;
  const distance = levenshtein(a, b);
  return distance <= 1 || (a.length > 5 && distance <= 2) || (a.length > 8 && distance <= 3);
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
    if (scriptTokens[i] === spokenTokens[j]) { pairs.push([i, j]); i += 1; j += 1; }
    else if (table[i + 1][j] >= table[i][j + 1]) i += 1;
    else j += 1;
  }
  return pairs;
}

const scriptTokens = codex.words.map((word) => normalize(word.text));
const spokenTokens = spoken.map((word) => word.text);
const anchors = longestCommonSubsequence(scriptTokens, spokenTokens);

for (const word of codex.words) {
  word.startSeconds = null;
  word.endSeconds = null;
  word.confidence = null;
  word.reviewed = false;
}

// Ein Script-Wort kann sich über mehrere Transkript-Tokens erstrecken, weil die
// Spracherkennung deutsche Komposita häufig trennt ("Nullmeridian" wird zu "null
// meridian"). Start und Ende stammen dann weiterhin aus der Messung.
const MAXIMUM_TOKEN_SPAN = 3;

const assign = (scriptIndex, fromSpokenIndex, toSpokenIndex = fromSpokenIndex) => {
  const target = codex.words[scriptIndex];
  target.startSeconds = spoken[fromSpokenIndex].startSeconds;
  target.endSeconds = spoken[toSpokenIndex].endSeconds;
  target.confidence = 1;
  target.reviewed = true;
};

for (const [scriptIndex, spokenIndex] of anchors) assign(scriptIndex, spokenIndex);

// Lücken zwischen zwei Ankern nur dann füllen, wenn sich ein Wort eindeutig
// wiedererkennen lässt. Übrige Wörter bleiben ohne Zeit und damit unbestätigt.
const boundaries = [[-1, -1], ...anchors, [codex.words.length, spoken.length]];
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
        if (isFuzzyMatch(scriptTokens[scriptIndex], combined)) {
          assign(scriptIndex, start, start + span);
          cursorSpoken = start + span + 1;
          matched = true;
          break;
        }
      }
    }
  }
}

const timed = codex.words.filter((word) => word.startSeconds !== null);
const untimed = codex.words.filter((word) => word.startSeconds === null);

// Reihenfolge prüfen, statt sie durch Verschieben zu erzwingen. Überlappungen weisen
// auf eine falsche Zuordnung hin und müssen sichtbar bleiben.
const outOfOrder = [];
let previousEnd = -Infinity;
for (const word of timed) {
  if (word.startSeconds < previousEnd - 0.03) outOfOrder.push(word);
  previousEnd = word.endSeconds;
}

codex.status = untimed.length === 0 ? 'reviewed' : 'pending-codex-audio-review';
codex.updatedAt = new Date().toISOString();
codex.timingSource = 'whisper-word-timestamps';
codex.notes = [
  ...(Array.isArray(codex.notes) ? codex.notes : []),
  `${new Date().toISOString()}: ${timed.length}/${codex.words.length} Wörter aus Whisper übernommen.`
];
fs.writeFileSync(codexPath, `${JSON.stringify(codex, null, 2)}\n`, 'utf8');

// Szenen-Cues aus den gemessenen Wortzeiten ableiten. Findet sich der Einsatztext
// einer Szene nicht wieder, bleibt der Zeitpunkt leer und die Timeline meldet die
// Szene als noch nicht synchronisiert.
const findCueTime = (audioCue, startIndex) => {
  const cueTokens = String(audioCue ?? '').split(/\s+/).map(normalize).filter(Boolean);
  if (!cueTokens.length) return null;
  for (let index = startIndex; index <= codex.words.length - cueTokens.length; index += 1) {
    let matched = true;
    for (let offset = 0; offset < cueTokens.length; offset += 1) {
      if (normalize(codex.words[index + offset].text) !== cueTokens[offset]) { matched = false; break; }
    }
    if (matched && codex.words[index].startSeconds !== null) {
      return { time: codex.words[index].startSeconds, nextIndex: index + cueTokens.length };
    }
  }
  return null;
};

let cursor = 0;
const unresolvedCues = [];
audio.cueTimings = (audio.cueTimings ?? []).map((cue, index) => {
  if (index === 0) return { ...cue, cueTimeSeconds: 0, confidence: 1 };
  const found = findCueTime(cue.audioCue, cursor);
  if (!found) {
    unresolvedCues.push(cue.sceneId);
    return { ...cue, cueTimeSeconds: null, confidence: null };
  }
  cursor = found.nextIndex;
  return { ...cue, cueTimeSeconds: Number(found.time.toFixed(3)), confidence: 1 };
});

const lastTimed = timed.at(-1);
if (lastTimed) audio.audioDurationSeconds = Math.max(Number(audio.audioDurationSeconds ?? 0), lastTimed.endSeconds);
audio.audioFile = codex.audioFile ?? audio.audioFile;
audio.source = 'whisper-word-timestamps';
audio.timingStatus = untimed.length === 0 && unresolvedCues.length === 0 ? 'audio-synced' : 'requires-new-cue-sync';
fs.writeFileSync(audioPath, `${JSON.stringify(audio, null, 2)}\n`, 'utf8');

console.log(`Wortzeiten übernommen: ${timed.length}/${codex.words.length}`);
if (untimed.length) {
  console.log(`Ohne gemessene Zeit (${untimed.length}): ${untimed.map((word) => word.text).join(' ')}`);
  console.log('Diese Wörter gelten als unbestätigt. Der strenge Lauf bleibt blockiert, bis sie zugeordnet sind.');
}
if (outOfOrder.length) {
  console.log(`Zeitlich überlappende Zuordnungen (${outOfOrder.length}): ${outOfOrder.map((word) => word.text).join(' ')}`);
}
if (unresolvedCues.length) {
  console.log(`Szenen ohne wiedergefundenen Einsatztext: ${unresolvedCues.join(', ')}`);
}

const exitCode = untimed.length || unresolvedCues.length || outOfOrder.length ? 1 : 0;
if (exitCode === 0) console.log('Alle Wörter und Szeneneinsätze sind an gemessenen Zeiten verankert.');
process.exit(exitCode);
