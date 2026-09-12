#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function usage() {
  console.log(`
Autonomer vereinfachter Fast-Path für Reel-Phase 3.

Verwendung:
  npm run phase3:reel -- --dir "reels/.../reel-01_thema"

Ein Auftrag reicht. Der Lauf ist nicht-interaktiv und arbeitet bis zum Render,
sofern kein echter Blocker vorliegt. Einzelne Bildanker werden nicht mehr
interaktiv bestätigt; nach dem finalen Audio wird automatisch eine monotone
Bild↔Audio-Grundausrichtung erzeugt.
`);
}

function runNpmStep({ label, script, args = [] }, reelDirectory) {
  console.log(`\n=== ${label} ===`);
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const commandArgs = ['run', script, '--', '--dir', reelDirectory, ...args];

  const result = spawnSync(npmCommand, commandArgs, {
    stdio: 'inherit',
    env: {
      ...process.env,
      CI: process.env.CI || '1',
      NONINTERACTIVE: '1',
      ANTIGRAVITY_AUTOPILOT: '1',
      ANTIGRAVITY_FAST_QC: '1'
    }
  });

  if (result.error) {
    console.error(`\nBLOCKIERT bei „${label}“: ${result.error.message}`);
    process.exit(result.status || 1);
  }

  if (result.status !== 0) {
    console.error(`\nBLOCKIERT bei „${label}“ (Exit ${result.status}).`);
    console.error('Nur echten Blocker beheben und denselben Fast-Path erneut starten. Keine Zwischenfreigabe nötig.');
    process.exit(result.status || 1);
  }

  console.log(`OK: ${label}`);
}

function main() {
  if (process.argv.includes('--help')) return usage();

  const reelDirectory = getArgument('--dir');
  if (!reelDirectory) {
    usage();
    process.exitCode = 1;
    return;
  }

  const steps = [
    { label: 'Assets finden', script: 'discover:assets' },
    { label: 'Assets sicher organisieren', script: 'organize:assets', args: ['--apply'] },
    { label: 'Schnelle visuelle QC', script: 'check:visuals', args: ['--strict'] },
    { label: 'Voice-over optimieren', script: 'trim:pauses', args: ['--speed', '1.10'] },
    { label: 'Bild↔Audio automatisch ausrichten', script: 'auto-align:reel' },
    { label: 'Timeline und Sounds bauen', script: 'build:timeline', args: ['--strict'] },
    { label: 'Reel finalisieren', script: 'finalize:reel', args: ['--strict'] },
    { label: 'Finales Reel rendern', script: 'render:reel' }
  ];

  console.log('ANTIGRAVITY PHASE-3 FAST-PATH — SIMPLE MODE');
  console.log(`Reel: ${reelDirectory}`);
  console.log('Keine Zwischenfragen. Schnelle Einmal-QC, automatisches Bild↔Audio-Grundtiming, dann Render.');

  for (const step of steps) runNpmStep(step, reelDirectory);

  console.log('\nPHASE 3 ABGESCHLOSSEN.');
  console.log('Nur den finalen Export kurz ansehen. Wenn kein sichtbarer Timing-/Inhaltsfehler auffällt, ist das Reel fertig.');
}

main();
