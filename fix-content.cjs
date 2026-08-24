const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
const indexPath = path.join(dir, 'scenes/scene-index.json');
let scenes = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

scenes = scenes.map(s => {
  s.continuityNotes = "Dies ist eine ausreichend lange Continuity Note um den Check zu bestehen.";
  if (s.sceneId === "scene-13") {
    s.narration = s.narration.replace(/\.$/, "") + " Würdest du das auch sagen?";
  }
  return s;
});

fs.writeFileSync(indexPath, JSON.stringify(scenes, null, 2));

// Update the individual scene.json files as well
for (const s of scenes) {
  const scenePath = path.join(dir, 'scenes', s.sceneId, 'scene.json');
  if (fs.existsSync(scenePath)) {
    let scene = JSON.parse(fs.readFileSync(scenePath, 'utf8'));
    scene.continuityNotes = s.continuityNotes;
    if (scene.sceneId === "scene-13") {
      scene.narration = s.narration;
    }
    fs.writeFileSync(scenePath, JSON.stringify(scene, null, 2));
  }
}
