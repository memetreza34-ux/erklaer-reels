#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { verifyYoutubeHandoff } from '../core/youtube-handoff.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const directory = getArgument('--dir');
  if (!directory) throw new Error('Verwendung: npm run verify:youtube-handoff -- --dir "youtube/projects/video-XX_slug"');
  const report = await verifyYoutubeHandoff(directory);
  const reportPath = path.join(directory, '08-edit', 'handoff-report.json');
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  for (const phase of ['phase1', 'phase2']) {
    console.log(`${phase}: ${report[phase].ready ? 'bereit' : 'nicht bereit'}`);
    for (const failed of report[phase].checks.filter((entry) => !entry.passed)) console.error(`- ${failed.message}`);
  }
  console.log(`phase3: ${report.phase3.ready ? 'für Antigravity freigegeben' : 'gesperrt'}`);
  if (!report.passed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
