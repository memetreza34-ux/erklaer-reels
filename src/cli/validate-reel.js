#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const reelDirectory = getArgument('--dir');
  if (!reelDirectory) {
    console.log('Verwendung: npm run validate:reel -- --dir "content/.../reel-01_titel"');
    process.exitCode = 1;
    return;
  }

  const requiredFiles = [
    'reel.json',
    'status.json',
    'assets-manifest.json',
    'script/raw-script.txt',
    'script/final-script.txt',
    'script/voice-script.txt',
    'scenes/scene-index.json',
    'cover/cover-prompt.txt',
    'caption/caption.txt',
    'sources/sources.md',
    'review/quality-report.json'
  ];

  const missing = [];
  for (const relativePath of requiredFiles) {
    if (!(await exists(path.join(reelDirectory, relativePath)))) missing.push(relativePath);
  }

  const reelPath = path.join(reelDirectory, 'reel.json');
  let reel;
  if (await exists(reelPath)) {
    reel = JSON.parse(await readFile(reelPath, 'utf8'));
  }

  if (reel && (reel.sceneCount < 8 || reel.sceneCount > 10)) {
    missing.push('reel.json: sceneCount muss zwischen 8 und 10 liegen');
  }

  if (missing.length > 0) {
    console.error('Validierung fehlgeschlagen:');
    for (const item of missing) console.error(`- ${item}`);
    process.exitCode = 1;
    return;
  }

  console.log('Grundstruktur ist vollständig.');
  console.log(`Reel: ${reel.title}`);
  console.log(`Szenen: ${reel.sceneCount}`);
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
