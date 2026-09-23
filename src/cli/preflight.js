#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REQUIRED_TOOLS = [
  { command: 'ffmpeg', args: ['-version'], purpose: 'Audio schneiden, normalisieren und rendern' },
  { command: 'ffprobe', args: ['-version'], purpose: 'Audiodauer und Cue-Zeiten bestimmen' },
  { command: 'unzip', args: ['-v'], purpose: 'Bild-Archive aus Google Flow entpacken' }
];

const REQUIRED_REPO_FILES = [
  'config/content-rules.json',
  'config/effects-rules.json',
  'config/production-quality-gates.json',
  'config/sound-library.json',
  'config/visual-quality-rules.json'
];

export function checkExternalTools(tools = REQUIRED_TOOLS) {
  const missing = [];
  const found = [];

  for (const tool of tools) {
    const result = spawnSync(tool.command, tool.args, { stdio: 'ignore' });
    if (result.error || result.status !== 0) missing.push(tool);
    else found.push(tool.command);
  }

  return { missing, found };
}

export async function checkRequiredRepoFiles(files = REQUIRED_REPO_FILES) {
  const missing = [];
  for (const relativePath of files) {
    try {
      await access(path.resolve(relativePath));
    } catch {
      missing.push(relativePath);
    }
  }
  return { missing };
}

export async function runPreflight() {
  const tools = checkExternalTools();
  const repoFiles = await checkRequiredRepoFiles();
  const passed = tools.missing.length === 0 && repoFiles.missing.length === 0;
  return { passed, tools, repoFiles };
}

async function main() {
  const report = await runPreflight();

  for (const command of report.tools.found) console.log(`OK: ${command}`);
  for (const relativePath of REQUIRED_REPO_FILES.filter((file) => !report.repoFiles.missing.includes(file))) {
    console.log(`OK: ${relativePath}`);
  }

  if (report.passed) {
    console.log('\nPreflight bestanden.');
    return;
  }

  if (report.tools.missing.length > 0) {
    console.error('\nFehlende externe Werkzeuge:');
    for (const tool of report.tools.missing) console.error(`  - ${tool.command} — ${tool.purpose}`);
  }

  if (report.repoFiles.missing.length > 0) {
    console.error('\nFehlende Pflichtdateien:');
    for (const relativePath of report.repoFiles.missing) console.error(`  - ${relativePath}`);
  }

  console.error('\nPhase 3 wurde vor jeder Asset- oder Audioänderung gestoppt.');
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
