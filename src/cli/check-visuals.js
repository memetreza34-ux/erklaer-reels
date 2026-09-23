#!/usr/bin/env node

import { verifySemanticVisualReview } from '../core/semantic-visual-review-guard.js';
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
    console.log('Verwendung: npm run check:visuals -- --dir "reels/.../reel-01_titel" [--strict] [--json]');
    process.exitCode = 1;
    return;
  }

  // Erzeugt/aktualisiert zuerst visual-inspection.json mit Fingerprints der
  // AKTUELLEN Bilddateien und der AKTUELLEN geplanten Szenenbedeutung.
  const report = await runVisualQualityCheck(reelDirectory, { strict });
  const semantic = strict ? await verifySemanticVisualReview(reelDirectory) : { required: false, passed: true, findings: [], checkedAssets: 0 };
  const passed = report.passed && (!semantic.required || semantic.passed);

  if (asJson) {
    console.log(JSON.stringify({ ...report, passed, semanticReview: semantic }, null, 2));
  } else {
    console.log(`Bilder technisch geprüft: ${report.summary.assetsChecked}`);
    console.log(`Fehler: ${report.summary.failedChecks}`);
    console.log(`Warnungen: ${report.summary.warnings}`);
    if (semantic.required) {
      console.log(`Semantisch geprüft: ${semantic.passed ? 'bestanden' : 'noch nicht bestätigt'} (${semantic.checkedAssets} Bilder)`);
      if (!semantic.passed) {
        console.log('Aktion für Antigravity: review/visual-inspection.json öffnen, jedes aktuelle Bild EINMAL wirklich ansehen und nur bestätigte Checks auf true/status passed setzen. Danach denselben QC-Schritt erneut starten.');
        for (const finding of semantic.findings.slice(0, 12)) {
          console.log(`- ${finding.assetId ?? 'Reel'}: ${finding.issue}${finding.check ? ` (${finding.check})` : ''}`);
        }
      }
    }
    console.log(`Ergebnis: ${passed ? 'bestanden' : 'nicht bestanden'}`);
    console.log('QC-Modus: single-pass-fast + fingerprint-bound-semantic-review');
    console.log('Bericht: review/visual-quality-report.json');
    console.log('Sichtprüfung: review/visual-inspection.json');
  }

  if (!passed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
