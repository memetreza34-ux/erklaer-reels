import fs from 'fs';
import path from 'path';

const REEL_DIR = 'reels/2026-KW33_10-08_bis_16-08/dienstag/reel-01_wie-baue-ich-einen-ki-app-prototyp';

function main() {
  const wordSync = JSON.parse(fs.readFileSync(path.join(REEL_DIR, 'subtitles', 'word-sync.json'), 'utf8'));
  const plan = JSON.parse(fs.readFileSync(path.join(REEL_DIR, 'subtitles', 'subtitle-plan.json'), 'utf8'));
  
  const cues = [];
  const expectedWordsPerLine = plan.expectedWordsPerLine || 5;

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
  console.log('Generated subtitle-cues.json');
}

main();
