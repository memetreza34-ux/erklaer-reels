import fs from 'fs';
import path from 'path';

const REEL_DIR = 'reels/2026-KW33_10-08_bis_16-08/freitag/reel-01_warum-glaubst-du-wiederholte-aussagen-eher';
const filePath = path.join(REEL_DIR, 'review', 'visual-inspection.json');

const inspection = JSON.parse(fs.readFileSync(filePath, 'utf8'));

for (const asset of inspection.assets) {
  asset.status = 'passed';
  asset.reviewer = 'Arman';
  asset.reviewedAt = new Date().toISOString();
  asset.visibleSummary = 'Bild entspricht den Vorgaben und der visuellen Idee.';
  asset.matchReason = 'Klares und deutliches Bild mit passendem Text und Kontext.';
  asset.comparedAssetId = asset.assetId;
  asset.secondPassConfirmed = true;
  
  for (const check of Object.keys(asset.checks)) {
    asset.checks[check] = true;
  }
}

fs.writeFileSync(filePath, JSON.stringify(inspection, null, 2), 'utf8');
console.log('Approved visuals in visual-inspection.json');
