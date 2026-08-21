#!/usr/bin/env node

import { prepareReelProduction } from '../core/production-brief.js';
import { ensureImagePromptBundleDirectory } from '../core/image-prompt-bundle.js';

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

  const promptBundle = await ensureImagePromptBundleDirectory(reelDirectory);
  const result = await prepareReelProduction(reelDirectory);
  console.log(`Produktionsauftrag erstellt: ${result.taskFile}`);
  console.log(`Geplante Bildmomente: ${result.sceneCount}`);
  console.log(`Chronologische Bildprompt-Datei: ${promptBundle.file}`);
  console.log('Nach Fertigstellung aller Szenenprompts: npm run export:prompts -- --dir "PFAD-ZUM-REEL" --strict');
  console.log('Nächster Schritt in Phase 1: production/agent-task.md mit normalem ChatGPT vollständig abarbeiten. Antigravity startet erst nach der Medienübergabe.');
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
