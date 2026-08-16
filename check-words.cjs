const fs = require('fs');
const path = require('path');
const REEL_DIR = 'reels/2026-KW33_10-08_bis_16-08/freitag/reel-01_warum-glaubst-du-wiederholte-aussagen-eher';
const codex = JSON.parse(fs.readFileSync(path.join(REEL_DIR, 'subtitles', 'codex-word-sync.json'), 'utf8'));
const sceneIndex = JSON.parse(fs.readFileSync(path.join(REEL_DIR, 'scenes', 'scene-index.json'), 'utf8'));
for (const scene of codex.scenes) {
  const sceneDef = sceneIndex.find(s => s.sceneId === scene.sceneId);
  const wordsInScene = sceneDef.narration.split(/\s+/).filter(w => w.trim().length > 0).length;
  console.log(scene.sceneId, wordsInScene);
}
console.log('Total codex words:', codex.words.length);
