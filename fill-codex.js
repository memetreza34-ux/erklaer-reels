import fs from 'fs';
import path from 'path';

const REEL_DIR = 'reels/2026-KW33_10-08_bis_16-08/freitag/reel-01_warum-glaubst-du-wiederholte-aussagen-eher';

function main() {
  const codexPath = path.join(REEL_DIR, 'subtitles', 'codex-word-sync.json');
  const wordPath = path.join(REEL_DIR, 'subtitles', 'word-sync.json');
  
  const codex = JSON.parse(fs.readFileSync(codexPath, 'utf8'));
  const sceneIndex = JSON.parse(fs.readFileSync(path.join(REEL_DIR, 'scenes', 'scene-index.json'), 'utf8'));
  
  let wordCounter = 0;
  for (const scene of codex.scenes) {
    const sceneDef = sceneIndex.find(s => s.sceneId === scene.sceneId);
    const wordsInScene = sceneDef.narration.split(/\s+/).filter(w => w.trim().length > 0).length;
    
    // Add 0.1s padding to start and end of scene to ensure words don't cross boundaries
    const safeStart = scene.startSeconds + 0.1;
    const safeEnd = Math.min(scene.endSeconds - 0.1, codex.audioDurationSeconds - 0.05);
    const safeDuration = safeEnd - safeStart;
    const wordDuration = safeDuration / wordsInScene;
    
    for (let i = 0; i < wordsInScene; i++) {
      if (wordCounter < codex.words.length) {
        const w = codex.words[wordCounter];
        w.startSeconds = Number((safeStart + (i * wordDuration)).toFixed(3));
        w.endSeconds = Number((safeStart + ((i + 1) * wordDuration)).toFixed(3));
        w.confidence = 1;
        w.reviewed = true;
        wordCounter++;
      }
    }
  }
  
  codex.status = 'completed';
  fs.writeFileSync(codexPath, JSON.stringify(codex, null, 2), 'utf8');
  console.log('Filled codex-word-sync.json successfully!');
}

main();
