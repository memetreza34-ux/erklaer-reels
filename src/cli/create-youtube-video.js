#!/usr/bin/env node

import { createYoutubeWorkspace } from '../core/youtube-workspace.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const title = getArgument('--title');
  if (!title || process.argv.includes('--help')) {
    console.log('Verwendung: npm run create:youtube -- --title "TITEL" [--topic "THEMA"] [--minutes 10] [--scenes 72]');
    if (!title) process.exitCode = 1;
    return;
  }
  const result = await createYoutubeWorkspace({
    title,
    topic: getArgument('--topic') ?? '',
    targetDurationMinutes: getArgument('--minutes') ?? null,
    sceneCount: getArgument('--scenes') ?? null
  });
  console.log(`YouTube-Projekt erstellt: ${result.projectDirectory}`);
  console.log(`Zieldauer: ${result.video.targetDurationMinutes.target} Minuten`);
  console.log(`Bildszenen: ${result.video.sceneCount}`);
  console.log('Phase 1 wird mit normalem ChatGPT fertiggestellt. Antigravity startet erst nach der Medienübergabe.');
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
