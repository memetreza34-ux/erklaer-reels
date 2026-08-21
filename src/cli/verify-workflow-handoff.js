#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { verifyWorkflowHandoff } from '../core/workflow-handoff.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const reelDirectory = getArgument('--dir');
  if (!reelDirectory) throw new Error('Verwendung: npm run verify:handoff -- --dir "PFAD-ZUM-REEL"');

  const report = await verifyWorkflowHandoff(reelDirectory);
  const reportDirectory = path.join(reelDirectory, 'review');
  await mkdir(reportDirectory, { recursive: true });
  await writeFile(path.join(reportDirectory, 'workflow-handoff-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  for (const phase of ['phase1', 'phase2']) {
    const result = report[phase];
    console.log(`${phase}: ${result.ready ? 'bereit' : 'nicht bereit'} (${result.owner})`);
    for (const entry of result.checks.filter((item) => !item.passed)) console.error(`- ${entry.message}`);
  }
  console.log(`phase3: ${report.phase3.ready ? 'für Antigravity freigegeben' : 'gesperrt'}`);
  if (!report.passed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
