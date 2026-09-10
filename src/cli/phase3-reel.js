#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function usage() {
  console.log(`
Autonomer technischer Fast-Path für Reel-Phase 3.

Verwendung:
  npm run phase3:reel -- --dir "reels/.../reel-01_thema"

Der Lauf ist nicht-interaktiv und stoppt nur bei einem echten fehlgeschlagenen
Hard Gate oder technischen Fehler. Bild↔Audio-Anker müssen vor dem Timeline-
Schritt inhaltlich korrekt am finalen Audio ausgerichtet sein.
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
      ANTIGRAVITY_AUTOPILOT: '1'
    }
  });

  if (result.error) {
    console.error(`\nBLOCKIERT bei „${label}“: ${result.error.message}`);
    process.exit(result.status || 1);
  }

  if (result.status !== 0) {
    console.error(`\nBLOCKIERT bei „${label}“ (Exit ${result.status}).`);
    console.error('Kein weiterer Phase-3-Schritt wurde gestartet. Ursache beheben und denselben Fast-Path erneut ausführen.');
    process.exit(result.status || 1);
  }

  console.log(`OK: ${label}`);
}

function main() {
  if (process.argv.includes('--help')) {
    usage();
    return;
  }

  const reelDirectory = getArgument('--dir');
  if (!reelDirectory) {
    usage();
    process.exitCode = 1;
    return;
  }

  const steps = [
    { label: 'Assets finden', script: 'discover:assets' },
    { label: 'Assets sicher organisieren', script: 'organize:assets', args: ['--apply'] },
    { label: 'Visuelle QC', script: 'check:visuals', args: ['--strict'] },
    { label: 'Voice-over optimieren', script: 'trim:pauses', args: ['--speed', '1.10'] },
    { label: 'Sounddateien binden', script: 'sync:sounds', args: ['--strict'] },
    { label: 'Timeline aus echten Cues bauen', script: 'build:timeline', args: ['--strict'] },
    { label: 'Reel finalisieren', script: 'finalize:reel', args: ['--strict'] },
    { label: 'Render validieren', script: 'validate:render' },
    { label: 'Finales Reel rendern', script: 'render:reel' }
  ];

  console.log('ANTIGRAVITY PHASE-3 FAST-PATH');
  console.log(`Reel: ${reelDirectory}`);
  console.log('Nicht-interaktiver Lauf: keine Zwischenfreigaben. Stop nur bei echtem Blocker.');

  for (const step of steps) runNpmStep(step, reelDirectory);

  console.log('\nPHASE 3 TECHNISCH ABGESCHLOSSEN.');
  console.log('Finalen Export und Definition-of-Done jetzt noch gegen CURRENT_WORKFLOW.md prüfen.');
}

main();
