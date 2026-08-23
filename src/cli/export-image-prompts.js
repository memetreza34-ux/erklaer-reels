#!/usr/bin/env node

import { buildImagePromptBundle } from '../core/image-prompt-bundle.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const reelDirectory = getArgument('--dir');
  const strict = process.argv.includes('--strict');

  if (!reelDirectory) {
    console.log('Verwendung: npm run export:prompts -- --dir "content/.../reel-01_titel" [--strict]');
    process.exitCode = 1;
    return;
  }

  const result = await buildImagePromptBundle(reelDirectory, { strict });
  console.log(`Bildprompt-Manifest erstellt: ${result.outputFile}`);
  console.log(`Google-Flow-Controller erstellt: ${result.controllerFile}`);
  console.log(`Einzelprompt-Ordner: ${result.promptDirectory}`);
  console.log(`Einzelprompts insgesamt: ${result.totalPromptCount} (inklusive Cover)`);
  console.log(`Narrative Szenen: ${result.sceneCount}`);

  if (result.missingSceneIds.length > 0 || result.missingPromptIds.length > 0) {
    console.log(`Fehlende Bildprompts: ${result.missingPromptIds.join(', ')}`);
    if (strict) process.exitCode = 1;
  } else {
    console.log('Alle Bildprompts sind als einzelne Dateien exportiert. Google Flow darf immer nur eine Datei gleichzeitig erhalten.');
  }
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
