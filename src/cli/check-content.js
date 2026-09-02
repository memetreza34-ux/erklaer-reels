#!/usr/bin/env node

import { validateReelContent } from '../core/content-validator.js';
import { validateImagePromptBundle } from '../core/image-prompt-bundle.js';
import { verifyRequiredSourceQuality } from '../core/source-quality-file-guard.js';
import { verifyFutureEffectsCoverage } from '../core/effects-quality-file-guard.js';

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
  const sourceGate = await verifyRequiredSourceQuality(reelDirectory);
  const effectsGate = await verifyFutureEffectsCoverage(reelDirectory);
  const strictSourceGatePassed = !strict || !sourceGate.required || sourceGate.passed === true;
  const strictEffectsGatePassed = !strict || !effectsGate.required || effectsGate.passed === true;
  const sourceQuality = sourceGate.inspection;

  console.log(`Prüfungen bestanden: ${report.summary.passedChecks}/${report.summary.totalChecks}`);
  console.log(`Fehler: ${report.summary.failedChecks}`);
  console.log(`Warnungen: ${report.summary.warnings}`);

  for (const check of report.checks.filter((item) => !item.passed)) {
    const prefix = check.level === 'warning' ? 'WARNUNG' : 'FEHLER';
    console.log(`- ${prefix}: ${check.message}`);
  }

  if (strict && sourceGate.required) {
    if (sourceGate.passed) {
      console.log(`Quellen-QC: bestanden (${sourceQuality.httpsUrlCount} HTTPS-Quellen, ${sourceQuality.distinctHostCount} Domains)`);
    } else {
      console.log(`- FEHLER: ${sourceGate.reason}`);
      if (sourceQuality?.hasMalformedUrlField) console.log('  - Mindestens ein URL-Feld ist ungültig.');
      if (sourceQuality?.hasInsecureHttp) console.log('  - Mindestens eine Quelle verwendet unsicheres HTTP statt HTTPS.');
      if (sourceQuality?.hasPlaceholder) console.log('  - Mindestens ein Quellenfeld enthält einen Dummy- oder Platzhalterwert.');
    }
  }

  if (strict && effectsGate.required) {
    if (effectsGate.passed) {
      console.log('SFX-Coverage: bestanden — jeder Szenen- und interne Bildwechsel ist akustisch geplant.');
    } else {
      console.log(`- FEHLER: ${effectsGate.reason}`);
      for (const finding of effectsGate.findings) {
        console.log(`  - ${finding.sceneId ?? 'Reel'}${finding.targetId ? ` / ${finding.targetId}` : ''}: ${finding.issue}`);
      }
    }
  }

  if (!promptBundle.passed) {
    const prefix = strict ? 'FEHLER' : 'WARNUNG';
    console.log(`- ${prefix}: ${promptBundle.message}`);
    console.log(`  Erzeugen: npm run export:prompts -- --dir "${reelDirectory}" --strict`);
  } else {
    console.log(`Bildprompt-Sammeldatei vollständig: ${promptBundle.outputFile}`);
  }

  if (!report.passed || !strictSourceGatePassed || !strictEffectsGatePassed || (strict && !promptBundle.passed)) process.exitCode = 1;
  else console.log('Inhaltspaket ist bereit für Audio- und Bilderstellung.');
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
