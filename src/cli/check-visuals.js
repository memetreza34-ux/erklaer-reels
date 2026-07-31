#!/usr/bin/env node

import { runVisualQualityCheck } from '../core/visual-qc.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const reelDirectory = getArgument('--dir');
  const strict = process.argv.includes('--strict');
  const asJson = process.argv.includes('--json');

  if (!reelDirectory) {
    console.log('Verwendung: npm run check:visuals -- --dir "content/.../reel-01_titel" [--strict] [--json]');
    process.exitCode = 1;
    return;
  }

  const report = await runVisualQualityCheck(reelDirectory, { strict });
  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Bilder geprüft: ${report.summary.assetsChecked}`);
    console.log(`Fehler: ${report.summary.failedChecks}`);
    console.log(`Warnungen: ${report.summary.warnings}`);
    console.log(`Ergebnis: ${report.passed ? 'bestanden' : 'nicht bestanden'}`);
    console.log('Bericht: review/visual-quality-report.json');
    console.log('Manuelle Prüfliste: review/visual-inspection.json');
  }

  if (!report.passed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
