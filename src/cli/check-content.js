#!/usr/bin/env node

import { validateReelContent } from '../core/content-validator.js';
import { validateImagePromptBundle } from '../core/image-prompt-bundle.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const reelDirectory = getArgument('--dir');
  const strict = process.argv.includes('--strict');

  if (!reelDirectory) {
    console.log('Verwendung: npm run check:content -- --dir "content/.../reel-01_titel" [--strict]');
    process.exitCode = 1;
    return;
  }

  const report = await validateReelContent(reelDirectory, { strict });
  const promptBundle = await validateImagePromptBundle(reelDirectory);

  console.log(`Prüfungen bestanden: ${report.summary.passedChecks}/${report.summary.totalChecks}`);
  console.log(`Fehler: ${report.summary.failedChecks}`);
  console.log(`Warnungen: ${report.summary.warnings}`);

  for (const check of report.checks.filter((item) => !item.passed)) {
    const prefix = check.level === 'warning' ? 'WARNUNG' : 'FEHLER';
    console.log(`- ${prefix}: ${check.message}`);
  }

  if (!promptBundle.passed) {
    const prefix = strict ? 'FEHLER' : 'WARNUNG';
    console.log(`- ${prefix}: ${promptBundle.message}`);
    console.log(`  Erzeugen: npm run export:prompts -- --dir "${reelDirectory}" --strict`);
  } else {
    console.log(`Bildprompt-Sammeldatei vollständig: ${promptBundle.outputFile}`);
  }

  if (!report.passed || (strict && !promptBundle.passed)) process.exitCode = 1;
  else console.log('Inhaltspaket ist bereit für Audio- und Bilderstellung.');
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
