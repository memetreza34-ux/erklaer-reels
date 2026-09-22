#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function run(script, args = []) {
  console.log(`\n=== ${script} ===`);
  const result = spawnSync(process.execPath, [script, ...args], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${script} ist mit Exit-Code ${result.status} fehlgeschlagen.`);
}

async function main() {
  const dir = arg('--dir');
  if (!dir) throw new Error('Nutzung: npm run phase3:youtube -- --dir "youtube/<woche>/<thema>" [--prepare-only]');
  const common = ['--dir', dir];
  const model = arg('--model');
  const audio = arg('--audio');
  const alignArgs = [...common];
  if (model) alignArgs.push('--model', model);
  if (audio) alignArgs.push('--audio', audio);
  if (process.argv.includes('--refresh')) alignArgs.push('--refresh');

  run('src/cli/auto-align-youtube.js', alignArgs);
  run('src/cli/build-youtube-timeline.js', common);
  run('src/cli/validate-youtube-adaptive-pacing.js', common);
  run('src/cli/validate-youtube-phase3.js', common);

  if (process.argv.includes('--prepare-only')) {
    console.log('\nYouTube Phase 3 vorbereitet: echtes Audio-Alignment, FINAL_TIMELINE und alle Pre-Render-Gates bestanden.');
    return;
  }

  run('src/cli/render-youtube.js', common);
  run('src/cli/validate-youtube-phase3.js', [...common, '--post-render']);
  console.log('\nYouTube Phase 3: BESTANDEN — Render und Post-Render-QC abgeschlossen.');
}

main().catch((error) => {
  console.error(`YouTube Phase 3: FEHLER — ${error.message}`);
  process.exitCode = 1;
});
