#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

import { runPreflight } from './preflight.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function usage() {
  console.log(`
Antigravity Phase 3 — Simple Mode

Verwendung:
  npm run phase3:reel -- --dir "reels/.../reel-01_thema"
  npm run phase3:reel -- --dir "<reel>" --from "Timeline bauen"
  npm run phase3:reel -- --list-steps

Preflight und check:content --strict laufen bei jedem Start zuerst. --from überspringt
nur bereits erledigte Produktionsschritte nach diesen Pflicht-Gates.

Ein Auftrag reicht. Der Lauf ist nicht-interaktiv und arbeitet selbstständig
bis zum Render. Rückfragen sind nur bei echten Hard Blockern erlaubt, z. B.
fehlenden/doppelten Bildern, mehreren unklaren Audio-Dateien oder kaputten Assets.
`);
}

function runNpmStep({ label, script, args = [], resumable = true }, reelDirectory) {
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
    if (resumable) {
      console.error('Nur den konkreten Hard Blocker beheben. Danach genügt der Wiedereinstieg:');
      console.error(`  npm run phase3:reel -- --dir "${reelDirectory}" --from "${label}"`);
    } else {
      console.error('Den Hard Blocker beheben und denselben Phase-3-Befehl erneut starten.');
    }
    process.exit(result.status || 1);
  }

  console.log(`OK: ${label}`);
}

function printPreflightFailure(report) {
  console.error('\nBLOCKIERT vor Phase 3 — Preflight fehlgeschlagen.');
  for (const tool of report.tools.missing) console.error(`  - ${tool.command} fehlt — ${tool.purpose}`);
  for (const relativePath of report.repoFiles.missing) console.error(`  - Pflichtdatei fehlt: ${relativePath}`);
  console.error('Es wurden noch keine Assets organisiert und kein Audio verändert.');
}

async function main() {
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
    console.log('Pflicht vor jedem Start: Preflight + check:content --strict');
    for (const [index, step] of steps.entries()) console.log(`${index + 1}. ${step.label}`);
    return;
  }

  const reelDirectory = getArgument('--dir');
  if (!reelDirectory) {
    usage();
    process.exitCode = 1;
    return;
  }

  const preflight = await runPreflight();
  if (!preflight.passed) {
    printPreflightFailure(preflight);
    process.exitCode = 1;
    return;
  }

  console.log('ANTIGRAVITY PHASE 3 — SIMPLE MODE');
  console.log(`Reel: ${reelDirectory}`);
  console.log('Preflight: bestanden.');

  runNpmStep({
    label: 'Inhalt strikt vorprüfen',
    script: 'check:content',
    args: ['--strict'],
    resumable: false
  }, reelDirectory);

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
    console.log(`Wiedereinstieg ab Schritt ${startIndex + 1}: ${steps[startIndex].label}`);
  }

  console.log('Keine Zwischenfragen: chronologisches Routing, ein QC-Durchgang, automatisches Audio-Timing, SFX, Timeline und Render.');

  for (const step of steps.slice(startIndex)) runNpmStep(step, reelDirectory);

  console.log('\nPHASE 3 ABGESCHLOSSEN.');
  console.log('Export: 03-export/FERTIGES-REEL.mp4');
}

await main();
