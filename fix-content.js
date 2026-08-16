import fs from 'fs';
import path from 'path';

const reelDir = 'reels/2026-KW33_10-08_bis_16-08/mittwoch/reel-02_warum-denkst-du-dass-alle-deinen-fehler-bemerken';

const sceneIndexFile = path.join(reelDir, 'scenes/scene-index.json');
let sceneIndex = null;
if (fs.existsSync(sceneIndexFile)) {
  sceneIndex = JSON.parse(fs.readFileSync(sceneIndexFile, 'utf8'));
}

for (let i = 1; i <= 13; i++) {
  const sceneNum = i.toString().padStart(2, '0');
  const scenePath = path.join(reelDir, `scenes/scene-${sceneNum}/scene.json`);
  if (fs.existsSync(scenePath)) {
    const scene = JSON.parse(fs.readFileSync(scenePath, 'utf8'));
    scene.continuityNotes = "Stilistisch konsistent mit den vorherigen Szenen, Fokus auf das Hauptthema.";
    if (i === 6) {
       scene.durationSeconds = 4.0;
    }
    fs.writeFileSync(scenePath, JSON.stringify(scene, null, 2));
    
    if (sceneIndex) {
       const idx = sceneIndex.findIndex(s => s.sceneId === scene.sceneId);
       if (idx !== -1) {
           sceneIndex[idx] = scene;
       }
    }
  }
}

if (sceneIndex) {
    fs.writeFileSync(sceneIndexFile, JSON.stringify(sceneIndex, null, 2));
}

const coverPath = path.join(reelDir, 'cover/cover.json');
if (fs.existsSync(coverPath)) {
  const cover = JSON.parse(fs.readFileSync(coverPath, 'utf8'));
  cover.visualIdea = "Ein markantes Cover-Bild passend zum Spotlight-Effekt.";
  fs.writeFileSync(coverPath, JSON.stringify(cover, null, 2));
}

console.log("Fixed content errors!");
