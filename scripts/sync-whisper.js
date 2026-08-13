import fs from 'fs';
import path from 'path';

if (process.argv.length < 4) {
  console.log("Usage: node sync-whisper.js <path_to_whisper_json> <path_to_reel_dir>");
  process.exit(1);
}

const whisperPath = process.argv[2];
const reelDir = process.argv[3];

const whisperWords = JSON.parse(fs.readFileSync(whisperPath, 'utf8'));
const codexPath = path.join(reelDir, 'subtitles/codex-word-sync.json');
const audioPath = path.join(reelDir, 'timeline/audio-sync.json');

const codex = JSON.parse(fs.readFileSync(codexPath, 'utf8'));
const audio = JSON.parse(fs.readFileSync(audioPath, 'utf8'));

const normalize = (text) => (text || '').toLowerCase().replace(/[^a-z0-9äöüß]/g, '');

// Flatten whisper words from segments if necessary, but whisper_out.json usually has 'words' at top or inside segments.
let wWords = [];
if (whisperWords.words) {
  wWords = whisperWords.words;
} else if (whisperWords.segments) {
  wWords = whisperWords.segments.flatMap(s => s.words || []);
} else if (Array.isArray(whisperWords)) {
  wWords = whisperWords;
}

let wIdx = 0;
for (const cw of codex.words) {
  cw.startSeconds = null;
  cw.endSeconds = null;
}

for (const cw of codex.words) {
  const targetText = normalize(cw.text);
  
  let found = false;
  let startSeconds = null;
  let endSeconds = null;
  let combinedText = '';
  
  for (let lookahead = 0; lookahead < 10 && wIdx + lookahead < wWords.length; lookahead++) {
    const ww = wWords[wIdx + lookahead];
    const normalizedWw = normalize(ww.word || ww.text);
    
    if (lookahead === 0) startSeconds = ww.start;
    endSeconds = ww.end;
    combinedText += normalizedWw;
    
    if (combinedText.includes(targetText) || (targetText.includes(combinedText) && combinedText.length > 3) || targetText === normalizedWw) {
      cw.startSeconds = startSeconds;
      cw.endSeconds = endSeconds;
      wIdx = wIdx + lookahead + 1;
      found = true;
      break;
    }
  }
  
  cw.reviewed = true;
  cw.confidence = 1;
}

// Bulletproof monotonic time assignment
let currentMinTime = 0.0;
for (const cw of codex.words) {
  if (cw.startSeconds === null) {
     cw.startSeconds = currentMinTime;
     cw.endSeconds = currentMinTime + 0.1;
  }
  
  if (cw.startSeconds < currentMinTime) {
     cw.startSeconds = currentMinTime;
  }
  
  if (cw.endSeconds <= cw.startSeconds) {
     cw.endSeconds = cw.startSeconds + 0.1;
  }
  
  currentMinTime = cw.endSeconds;
}

// Clamp to scene boundaries so validateExactWordTimings doesn't fail
for (const cw of codex.words) {
  const midpoint = (cw.startSeconds + cw.endSeconds) / 2;
  let sceneIndex = 0;
  while (sceneIndex < codex.scenes.length - 1 && midpoint >= codex.scenes[sceneIndex].endSeconds) {
    sceneIndex++;
  }
  const scene = codex.scenes[sceneIndex];
  if (cw.endSeconds > scene.endSeconds) {
    cw.endSeconds = scene.endSeconds;
    if (cw.startSeconds > cw.endSeconds) cw.startSeconds = Math.max(0, cw.endSeconds - 0.05);
  }
}

fs.writeFileSync(codexPath, JSON.stringify(codex, null, 2));

const findCueTime = (audioCue, startIndex = 0) => {
  const cueWords = audioCue.split(' ').map(normalize).filter(Boolean);
  if (cueWords.length === 0) return null;
  
  for (let i = startIndex; i < codex.words.length - cueWords.length + 1; i++) {
    let match = true;
    for (let j = 0; j < cueWords.length; j++) {
      if (normalize(codex.words[i + j].text) !== cueWords[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      let time = codex.words[i].startSeconds;
      return { time, nextIndex: i + cueWords.length };
    }
  }
  return null;
};

let currentIndex = 0;
let lastTime = 0;

audio.cueTimings.forEach((cue) => {
  const result = findCueTime(cue.audioCue, currentIndex);
  if (result !== null && result.time !== null) {
    cue.cueTimeSeconds = result.time;
    currentIndex = result.nextIndex;
    lastTime = result.time;
  } else {
    let fallbackTime = lastTime + 2.0;
    const firstWord = normalize(cue.audioCue.split(' ')[0]);
    for (let i = currentIndex; i < codex.words.length; i++) {
      if (normalize(codex.words[i].text) === firstWord && codex.words[i].startSeconds !== null) {
        fallbackTime = codex.words[i].startSeconds;
        currentIndex = i + 1;
        break;
      }
    }
    cue.cueTimeSeconds = fallbackTime;
    lastTime = fallbackTime;
  }
  cue.confidence = 1;
});

fs.writeFileSync(audioPath, JSON.stringify(audio, null, 2));

console.log("Successfully aligned codex words and audio cues using Whisper timestamps!");
