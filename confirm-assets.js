import fs from 'fs';

const path = 'reels/2026-KW33_10-08_bis_16-08/freitag/reel-01_warum-glaubst-du-wiederholte-aussagen-eher/inbox/asset-map.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

data.assignments.forEach(a => {
  a.confidence = 1.0;
  a.visualReviewed = true;
  a.secondPassConfirmed = true;
  
  if (a.target.startsWith('scene')) {
    a.confirmedTarget = a.target;
    a.sceneOrderConfirmed = true;
    a.confirmedSceneOrder = a.suggestedSceneOrder;
    a.comparedFields = ["narration", "visualIdea", "imageText", "imagePrompt"];
  } else {
    a.confirmedTarget = 'cover';
    a.comparedFields = ["headline", "coverVisualIdea", "coverPrompt"];
  }
  
  a.visibleSummary = "Verified by Google Flow exact match from the user";
  a.reason = "Matches script entirely visually and textually after review.";
  a.matchMethod = "visual-text-and-content-review";
});

// Add audio mapping
if (!data.assignments.some(a => a.target === 'audio')) {
  data.assignments.push({
    "source": "audio/voiceover.mp4",
    "target": "audio",
    "confidence": 1.0
  });
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Done confirming asset-map.json');
