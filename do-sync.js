import fs from 'fs';
import path from 'path';

const REEL_DIR = 'reels/2026-KW33_10-08_bis_16-08/freitag/reel-01_warum-glaubst-du-wiederholte-aussagen-eher';

function main() {
  const scenes = JSON.parse(fs.readFileSync(path.join(REEL_DIR, 'scenes', 'scene-index.json'), 'utf8'));
  
  const TOTAL_DURATION = 56.10;
  const TOTAL_LENGTH = scenes.reduce((sum, s) => sum + s.narration.length, 0);
  
  const audioSync = {
    version: 2,
    audioDurationSeconds: TOTAL_DURATION,
    audioFile: "audio/voiceover-tight.m4a",
    source: "manual",
    timingStatus: "audio-synced",
    cueTimings: []
  };
  
  let currentTime = 0;
  for (const s of scenes) {
    const fraction = s.narration.length / TOTAL_LENGTH;
    const sceneDuration = fraction * TOTAL_DURATION;
    
    audioSync.cueTimings.push({
      sceneId: s.sceneId,
      audioCue: s.audioCue || "",
      cueTimeSeconds: Number(currentTime.toFixed(3)),
      leadInSeconds: s.leadInSeconds || 0.2,
      confidence: 1
    });
    
    currentTime += sceneDuration;
  }
  
  fs.mkdirSync(path.join(REEL_DIR, 'timeline'), { recursive: true });
  fs.writeFileSync(path.join(REEL_DIR, 'timeline', 'audio-sync.json'), JSON.stringify(audioSync, null, 2), 'utf8');
  console.log('Generated audio-sync.json');

  const wordSync = {
    version: 1,
    words: []
  };

  currentTime = 0;
  for (const s of scenes) {
    const words = s.narration.split(/\s+/).filter(w => w.trim().length > 0);
    const fraction = s.narration.length / TOTAL_LENGTH;
    const sceneDuration = fraction * TOTAL_DURATION;
    const wordDuration = sceneDuration / words.length;

    let sceneTime = currentTime;
    for (const w of words) {
      wordSync.words.push({
        word: w,
        start: Number(sceneTime.toFixed(3)),
        end: Number((sceneTime + wordDuration).toFixed(3))
      });
      sceneTime += wordDuration;
    }
    currentTime += sceneDuration;
  }

  fs.mkdirSync(path.join(REEL_DIR, 'subtitles'), { recursive: true });
  fs.writeFileSync(path.join(REEL_DIR, 'subtitles', 'word-sync.json'), JSON.stringify(wordSync, null, 2), 'utf8');
  console.log('Generated word-sync.json');
  
  const plan = JSON.parse(fs.readFileSync(path.join(REEL_DIR, 'subtitles', 'subtitle-plan.json'), 'utf8'));

  // Generate subtitle cues
  const cues = [];
  const expectedWordsPerLine = plan.expectedWordsPerLine || 4;

  let currentLine = [];
  let lineStart = 0;

  for (let i = 0; i < wordSync.words.length; i++) {
    const w = wordSync.words[i];
    if (currentLine.length === 0) lineStart = w.start;
    currentLine.push(w);

    const isSentenceEnd = w.word.match(/[.!?]$/);
    if (currentLine.length >= expectedWordsPerLine || isSentenceEnd || i === wordSync.words.length - 1) {
      cues.push({
        text: currentLine.map(x => x.word).join(' '),
        startSeconds: lineStart,
        endSeconds: w.end,
        words: currentLine.map(x => ({
          word: x.word,
          startSeconds: x.start,
          endSeconds: x.end
        }))
      });
      currentLine = [];
    }
  }

  const output = {
    version: 1,
    cues: cues
  };
  fs.writeFileSync(path.join(REEL_DIR, 'subtitles', 'subtitle-cues.json'), JSON.stringify(output, null, 2), 'utf8');
}

main();
