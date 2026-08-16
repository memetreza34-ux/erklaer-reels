import fs from 'fs';
import path from 'path';

const REEL_DIR = 'reels/2026-KW33_10-08_bis_16-08/freitag/reel-01_warum-glaubst-du-wiederholte-aussagen-eher';

function main() {
  // Fix scene-index.json
  const sceneIndexPath = path.join(REEL_DIR, 'scenes', 'scene-index.json');
  const scenes = JSON.parse(fs.readFileSync(sceneIndexPath, 'utf8'));
  
  for (const s of scenes) {
    s.continuityNotes = "Stilistisch passend zu Bild 00, gleiche Beleuchtung und Farbpalette, weicher Übergang der Szenerie.";
    s.expectedImageFileName = `${s.sceneId}.jpeg`;
    s.leadInSeconds = 0.2;
    s.subtitlePosition = "center";
    s.subtitleCues = []; // add empty array to fix warning
  }
  
  fs.writeFileSync(sceneIndexPath, JSON.stringify(scenes, null, 2), 'utf8');
  
  // Fix individual scene.json files and image-prompts
  for (const s of scenes) {
    const sceneDir = path.join(REEL_DIR, 'scenes', s.sceneId);
    
    // scene.json
    const sceneFile = path.join(sceneDir, 'scene.json');
    if (fs.existsSync(sceneFile)) {
      const sceneData = JSON.parse(fs.readFileSync(sceneFile, 'utf8'));
      sceneData.continuityNotes = s.continuityNotes;
      sceneData.expectedImageFileName = s.expectedImageFileName;
      sceneData.leadInSeconds = s.leadInSeconds;
      sceneData.subtitlePosition = s.subtitlePosition;
      sceneData.subtitleCues = s.subtitleCues;
      fs.writeFileSync(sceneFile, JSON.stringify(sceneData, null, 2), 'utf8');
    }
    
    // image-prompt.txt
    const promptFile = path.join(sceneDir, 'image-prompt.txt');
    if (fs.existsSync(promptFile)) {
      let promptText = fs.readFileSync(promptFile, 'utf8');
      if (!promptText.includes('9:16')) {
        promptText = promptText.trim() + ', 9:16 aspect ratio';
        fs.writeFileSync(promptFile, promptText, 'utf8');
      }
    }
  }
  
  // Fix effects-plan.json
  const effectsPlanPath = path.join(REEL_DIR, 'effects', 'effects-plan.json');
  const effectsPlan = JSON.parse(fs.readFileSync(effectsPlanPath, 'utf8'));
  effectsPlan.scenes = scenes.map(s => ({
    sceneId: s.sceneId,
    soundEffects: []
  }));
  fs.writeFileSync(effectsPlanPath, JSON.stringify(effectsPlan, null, 2), 'utf8');
  
  // Fix cover.json
  const coverPath = path.join(REEL_DIR, 'cover', 'cover.json');
  const cover = JSON.parse(fs.readFileSync(coverPath, 'utf8'));
  cover.headline = cover.hook; // copy hook to headline
  cover.visualIdea = "Person facing a curved echo trail of statement cards.";
  fs.writeFileSync(coverPath, JSON.stringify(cover, null, 2), 'utf8');

  console.log("Fixed all JSONs!");
}

main();
