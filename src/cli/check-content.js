#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { validateReelContent } from '../core/content-validator.js';
import { validateImagePromptBundle } from '../core/image-prompt-bundle.js';
import { inspectSourcesMarkdown } from '../core/source-quality.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const reelDirectory = getArgument('--dir');
  const strict = process.argv.includes('--strict');

  if (!reelDirectory) {
    console.log('Verwendung: npm run check:content -- --dir "reels/.../reel-01_titel" [--strict]');
    process.exitCode = 1;
    return;
  }

  const report = await validateReelContent(reelDirectory, { strict });
  const promptBundle = await validateImagePromptBundle(reelDirectory);
  const sourcesPath = path.join(reelDirectory, 'sources', 'sources.md');
  let sourceQuality = { schemaVersion: 1, passed: true };
  try {
    sourceQuality = inspectSourcesMarkdown(await readFile(sourcesPath, 'utf8'));
  } catch {
    sourceQuality = { schemaVersion: 1, passed: true };
  }
  const strictSourceGatePassed = !strict || sourceQuality.schemaVersion < 2 || sourceQuality.passed === true;

  console.log(`Prüfungen bestanden: ${report.summary.passedChecks}/${report.summary.totalChecks}`);
  console.log(`Fehler: ${report.summary.failedChecks}`);
  console.log(`Warnungen: ${report.summary.warnings}`);

  for (const check of report.checks.filter((item) => !item.passed)) {
    const prefix = check.level === 'warning' ? 'WARNUNG' : 'FEHLER';
    console.log(`- ${prefix}: ${check.message}`);
  }

  if (strict && sourceQuality.schemaVersion >= 2) {
    if (sourceQuality.passed) {
      console.log(`Quellen-QC: bestanden (${sourceQuality.httpsUrlCount} HTTPS-Quellen, ${sourceQuality.distinctHostCount} Domains)`);
    } else {
      console.log('- FEHLER: Quellen-QC v2 ist nicht vollständig bestanden. Prüfe alle strukturierten Quellenfelder.');
      if (sourceQuality.hasMalformedUrlField) console.log('  - Mindestens ein URL-Feld ist ungültig.');
      if (sourceQuality.hasInsecureHttp) console.log('  - Mindestens eine Quelle verwendet unsicheres HTTP statt HTTPS.');
      if (sourceQuality.hasPlaceholder) console.log('  - Mindestens ein Quellenfeld enthält einen Dummy- oder Platzhalterwert.');
    }
  }

  if (!promptBundle.passed) {
    const prefix = strict ? 'FEHLER' : 'WARNUNG';
    console.log(`- ${prefix}: ${promptBundle.message}`);
    console.log(`  Erzeugen: npm run export:prompts -- --dir "${reelDirectory}" --strict`);
  } else {
    console.log(`Bildprompt-Sammeldatei vollständig: ${promptBundle.outputFile}`);
  }

  if (!report.passed || !strictSourceGatePassed || (strict && !promptBundle.passed)) process.exitCode = 1;
  else console.log('Inhaltspaket ist bereit für Audio- und Bilderstellung.');
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
