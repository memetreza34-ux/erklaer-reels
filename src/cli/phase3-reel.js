#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

import { checkExternalTools } from './preflight.js';
import { getArgument } from '../shared/cli-args.js';

function usage() {
  console.log(`
Antigravity Phase 3 — Simple Mode

Verwendung:
  npm run phase3:reel -- --dir "reels/.../reel-01_thema"
  npm run phase3:reel -- --dir "<reel>" --from "Timeline bauen"
  npm run phase3:reel -- --list-steps

Ein Auftrag reicht. Der Lauf ist nicht-interaktiv und arbeitet selbstständig
bis zum Render. Rückfragen sind nur bei echten Hard Blockern erlaubt, z. B.
fehlenden/doppelten Bildern, mehreren unklaren Audio-Dateien oder kaputten Assets.
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
    console.error('Nur den konkreten Hard Blocker beheben. Danach genügt der Wiedereinstieg:');
    console.error(`  npm run phase3:reel -- --dir "${reelDirectory}" --from "${label}"`);
    process.exit(result.status || 1);
  }

  console.log(`OK: ${label}`);
}

function main() {
  if (process.argv.includes('--help')) return usage();

  const steps = [
    { label: 'Assets finden', script: 'discover:assets' },
    { label: 'Bildnummern und Voice-over automatisch routen', script: 'organize:assets', args: ['--numbered'] },
    { label: 'Assets sicher übernehmen', script: 'organize:assets', args: ['--apply'] },
    { label: 'Einmalige schnelle visuelle QC', script: 'check:visuals', args: ['--strict'] },
    { label: 'Voice-over optimieren', script: 'trim:pauses', args: ['--speed', '1.10'] },
    { label: 'Bild↔Audio automatisch ausrichten', script: 'auto-align:reel' },
    { label: 'SFX-Dateien automatisch binden', script: 'sync:sounds', args: ['--strict'] },
    { label: 'Timeline bauen', script: 'build:timeline', args: ['--strict'] },
    { label: 'Reel finalisieren', script: 'finalize:reel', args: ['--strict'] },
    { label: 'Finales Reel rendern', script: 'render:reel' }
  ];

  if (process.argv.includes('--list-steps')) {
    for (const [index, step] of steps.entries()) console.log(`${index + 1}. ${step.label}`);
    return;
  }

  const reelDirectory = getArgument('--dir');
  if (!reelDirectory) {
    usage();
    process.exitCode = 1;
    return;
  }

  // Fehlende externe Werkzeuge sofort melden, nicht erst mitten im Lauf,
  // nachdem trim:pauses das Audio bereits neu geschrieben hat.
  const { missing } = checkExternalTools();
  if (missing.length > 0) {
    console.error('BLOCKIERT vor dem Start — fehlende externe Werkzeuge:');
    for (const tool of missing) console.error(`  - ${tool.command} — ${tool.purpose}`);
    console.error('\nAuf macOS: brew install ffmpeg');
    process.exitCode = 1;
    return;
  }

  // Wiedereinstieg nach einem Hard Blocker, ohne die teuren Audioschritte zu wiederholen.
  const resumeFrom = getArgument('--from');
  let startIndex = 0;
  if (resumeFrom) {
    startIndex = steps.findIndex((step) => step.label.toLowerCase().includes(resumeFrom.toLowerCase()));
    if (startIndex < 0) {
      console.error(`Unbekannter Schritt "${resumeFrom}". Verfügbare Schritte:`);
      for (const [index, step] of steps.entries()) console.error(`  ${index + 1}. ${step.label}`);
      process.exitCode = 1;
      return;
    }
  }

  const plannedSteps = steps.slice(startIndex);

  console.log('ANTIGRAVITY PHASE 3 — SIMPLE MODE');
  console.log(`Reel: ${reelDirectory}`);
  if (startIndex > 0) console.log(`Wiedereinstieg ab Schritt ${startIndex + 1}: ${steps[startIndex].label}`);
  console.log('Keine Zwischenfragen: chronologisches Routing, ein QC-Durchgang, automatisches Audio-Timing, SFX, Timeline und Render.');

  for (const step of plannedSteps) runNpmStep(step, reelDirectory);

  console.log('\nPHASE 3 ABGESCHLOSSEN.');
  console.log('Export: 03-export/FERTIGES-REEL.mp4');
}

main();
