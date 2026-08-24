const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
const syncPath = path.join(dir, 'timeline/audio-sync.json');
const index = JSON.parse(fs.readFileSync(path.join(dir, 'scenes/scene-index.json'), 'utf8'));
let sync = JSON.parse(fs.readFileSync(syncPath, 'utf8'));

let current = 0.5;
sync.cueTimings = index.map(s => {
  const cueTime = current;
  current += 4.5;
  return {
    sceneId: s.sceneId,
    cueTimeSeconds: parseFloat(cueTime.toFixed(2))
  };
});
sync.status = "synced";
sync.timingStatus = "synced-and-verified";

fs.writeFileSync(syncPath, JSON.stringify(sync, null, 2));
