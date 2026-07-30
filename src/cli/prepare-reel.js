#!/usr/bin/env node

import { prepareReelProduction } from '../core/production-brief.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const reelDirectory = getArgument('--dir');

  if (!reelDirectory) {
    console.log('Verwendung: npm run prepare:reel -- --dir "content/.../reel-01_titel"');
    process.exitCode = 1;
    return;
  }

  const result = await prepareReelProduction(reelDirectory);
  console.log(`Produktionsauftrag erstellt: ${result.taskFile}`);
  console.log(`Geplante Bildmomente: ${result.sceneCount}`);
  console.log('Nächster Schritt für Codex: production/agent-task.md vollständig abarbeiten.');
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
