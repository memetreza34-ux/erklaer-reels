#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function run(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${script} ist mit Exit-Code ${result.status} fehlgeschlagen.`);
}

async function main() {
  const dir = arg('--dir');
  if (!dir) throw new Error('Nutzung: npm run validate:youtube-phase1 -- --dir "youtube/<woche>/<thema>"');
  const common = ['--dir', dir];

  run('src/cli/validate-youtube-script-quality.js', common);
  run('src/cli/validate-youtube-phase1-policy.js', common);

  console.log('YouTube Phase 1: BESTANDEN — Skriptqualität und Produktionsregeln sind freigegeben.');
}

main().catch((error) => {
  console.error(`YouTube Phase 1: FEHLER — ${error.message}`);
  process.exitCode = 1;
});
