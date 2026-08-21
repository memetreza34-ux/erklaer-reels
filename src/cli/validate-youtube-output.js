#!/usr/bin/env node

import { validateYoutubeOutput } from '../core/youtube-output-validator.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const directory = getArgument('--dir');
  if (!directory) throw new Error('Verwendung: npm run validate:youtube-output -- --dir "youtube/projects/video-XX_slug"');
  const report = await validateYoutubeOutput(directory);
  console.log(`Finale YouTube-Prüfung: ${report.passed ? 'bestanden' : 'fehlgeschlagen'}`);
  for (const failed of report.checks.filter((entry) => !entry.passed)) console.error(`- ${failed.message}`);
  if (!report.passed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
