const fs = require('fs');
const path = require('path');

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

// Sync codex words
let wIdx = 0;
for (const cw of codex.words) {
  const targetText = normalize(cw.text);
  
  let combinedText = '';
  let startSeconds = null;
  let endSeconds = null;
  
  while (wIdx < whisperWords.length) {
    const ww = whisperWords[wIdx];
    const normalizedWw = normalize(ww.word || ww.text);
    
    if (startSeconds === null) startSeconds = ww.start;
    endSeconds = ww.end;
    
    combinedText += normalizedWw;
    wIdx++;
    
    if (combinedText.length >= targetText.length - 2) {
       break;
    }
  }
  
  cw.startSeconds = startSeconds !== null ? startSeconds : cw.startSeconds;
  cw.endSeconds = endSeconds !== null ? endSeconds : cw.endSeconds;
  cw.confirmed = true;
}

fs.writeFileSync(codexPath, JSON.stringify(codex, null, 2));

// Sync audio cues (multi-word match)
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
      return { time: codex.words[i].startSeconds, nextIndex: i + cueWords.length };
    }
  }
  return null;
};

let currentIndex = 0;
let lastTime = 0;

audio.cueTimings.forEach((cue) => {
  const result = findCueTime(cue.audioCue, currentIndex);
  if (result !== null) {
    cue.cueTimeSeconds = result.time;
    currentIndex = result.nextIndex;
    lastTime = result.time;
  } else {
    let fallbackTime = lastTime + 2.0;
    const firstWord = normalize(cue.audioCue.split(' ')[0]);
    for (let i = currentIndex; i < codex.words.length; i++) {
      if (normalize(codex.words[i].text) === firstWord) {
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
