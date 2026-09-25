#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { runPreflight } from './preflight.js';

export const WHISPER_CANDIDATES = Object.freeze([
  { command: 'whisper', args: ['--help'], label: 'whisper' },
  { command: 'python3', args: ['-m', 'whisper', '--help'], label: 'python3 -m whisper' },
  { command: 'python', args: ['-m', 'whisper', '--help'], label: 'python -m whisper' }
]);

export function checkWhisperAvailability(spawn = spawnSync) {
  for (const candidate of WHISPER_CANDIDATES) {
    const result = spawn(candidate.command, candidate.args, { stdio: 'ignore' });
    if (!result?.error && result?.status === 0) {
      return { passed: true, command: candidate.label };
    }
  }
  return { passed: false, command: null };
}

export async function runYoutubePreflight({ spawn = spawnSync } = {}) {
  const base = await runPreflight();
  const whisper = checkWhisperAvailability(spawn);
  return {
    passed: base.passed && whisper.passed,
    base,
    whisper
  };
}

async function main() {
  const report = await runYoutubePreflight();

  for (const command of report.base.tools.found) console.log(`OK: ${command}`);
  if (report.whisper.passed) console.log(`OK: Whisper (${report.whisper.command})`);

  if (report.passed) {
    console.log('\nYouTube-Preflight bestanden: FFmpeg/FFprobe, Repo-Pflichtdateien und Whisper sind verfügbar.');
    return;
  }

  if (report.base.tools.missing.length) {
    console.error('\nFehlende externe Werkzeuge:');
    for (const tool of report.base.tools.missing) console.error(`  - ${tool.command} — ${tool.purpose}`);
  }

  if (report.base.repoFiles.missing.length) {
    console.error('\nFehlende Pflichtdateien:');
    for (const relativePath of report.base.repoFiles.missing) console.error(`  - ${relativePath}`);
  }

  if (!report.whisper.passed) {
    console.error('\nWhisper fehlt. Phase 3 benötigt vor dem Audio-Alignment eine dieser Varianten:');
    console.error('  - whisper');
    console.error('  - python3 -m whisper');
    console.error('  - python -m whisper');
    console.error('Installation z. B.: pip install -U openai-whisper');
  }

  console.error('\nYouTube Phase 3 wurde vor jeder Audioänderung gestoppt.');
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
