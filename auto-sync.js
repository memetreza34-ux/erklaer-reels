import fs from 'fs';
import path from 'path';

const REEL_DIR = 'reels/2026-KW33_10-08_bis_16-08/dienstag/reel-01_wie-baue-ich-einen-ki-app-prototyp';

function main() {
  const scenes = JSON.parse(fs.readFileSync(path.join(REEL_DIR, 'scenes', 'scene-index.json'), 'utf8'));
  
  // Total duration based on trim:pauses is 50.5s
  const TOTAL_DURATION = 50.5;
  const TOTAL_LENGTH = scenes.reduce((sum, s) => sum + s.narration.length, 0);
  
  const audioSync = {
    version: 1,
    audioDuration: TOTAL_DURATION,
    cues: []
  };
  
  let currentTime = 0;
  for (const s of scenes) {
    const fraction = s.narration.length / TOTAL_LENGTH;
    const sceneDuration = fraction * TOTAL_DURATION;
    
    audioSync.cues.push({
      sceneId: s.sceneId,
      cueStartSeconds: Number(currentTime.toFixed(3)),
      cueEndSeconds: Number((currentTime + sceneDuration).toFixed(3))
    });
    
    currentTime += sceneDuration;
  }
  
  fs.writeFileSync(path.join(REEL_DIR, 'timeline', 'audio-sync.json'), JSON.stringify(audioSync, null, 2), 'utf8');
  console.log('Generated audio-sync.json');

  // Now words
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

  fs.writeFileSync(path.join(REEL_DIR, 'subtitles', 'word-sync.json'), JSON.stringify(wordSync, null, 2), 'utf8');
  console.log('Generated word-sync.json');
}

main();
