#!/usr/bin/env node

import { validateYoutubeAudioPacing } from '../core/youtube-audio-optimizer.js';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const dir = arg('--dir');
  if (!dir) throw new Error('Nutzung: node src/cli/validate-youtube-audio.js --dir "youtube/<woche>/<thema>"');

  const result = await validateYoutubeAudioPacing(dir);
  if (!result.passed) {
    console.error(`YouTube Audio-Pacing-Hard-Gate: FEHLGESCHLAGEN (${result.errors.length} Blocker)`);
    for (const error of result.errors) console.error(`  - ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log('YouTube Audio-Pacing-Hard-Gate: BESTANDEN');
  console.log(`Geschwindigkeit: ${Number(result.report.playbackRate).toFixed(2)}x, Tonhöhe erhalten`);
  console.log('Überlange Pausen und Endstille werden im internen Master gekürzt; Nutzeroriginal bleibt unverändert.');
}

main().catch((error) => {
  console.error(`YouTube Audio-Pacing-Hard-Gate: FEHLER — ${error.message}`);
  process.exitCode = 1;
});
