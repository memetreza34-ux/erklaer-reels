import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { sha256, verifyProductionLock } from '../src/core/production-lock.js';

const requiredPaths = [
  '.github/workflows/node-ci.yml',
  'AGENTS.md',
  'CURRENT_WORKFLOW.md',
  'WORKFLOW_PHASES.md',
  'config/workflow-phases.json',
  'config/production-quality-gates.json',
  'config/youtube-production.json',
  'scripts/sync-whisper.js',
  'src/shared/subtitle-style.js',
  'src/shared/audio-pacing-style.js',
  'src/core/codex-word-sync.js',
  'src/core/timeline.js',
  'src/core/whisper-alignment.js',
  'src/core/workflow-handoff.js',
  'src/core/youtube-handoff.js',
  'src/core/youtube-render-validator.js',
  'src/core/youtube-output-validator.js',
  'youtube/YOUTUBE_WORKFLOW.md',
  'youtube/YOUTUBE_VISUAL_WORLD.md'
];

test('eingefrorene Produktionsbaseline ist vollständig und unverändert', async () => {
  const manifest = JSON.parse(await readFile(new URL('../config/locked-production-baseline.json', import.meta.url), 'utf8'));
  assert.deepEqual(manifest.files.map((entry) => entry.path).sort(), [...requiredPaths].sort());
  assert.equal(manifest.requiredEntryCount, requiredPaths.length);
  const report = await verifyProductionLock();
  assert.equal(report.passed, true, report.checks.filter((check) => !check.passed).map((check) => check.path).join(', '));
});

test('eine unbeabsichtigte Regeländerung wird sofort blockiert', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'production-lock-'));
  await mkdir(path.join(root, 'config'));
  await writeFile(path.join(root, 'rule.txt'), 'freigegebene-regel\n');
  const manifestPath = path.join(root, 'config', 'locked-production-baseline.json');
  await writeFile(manifestPath, JSON.stringify({
    schemaVersion: 1,
    requiredEntryCount: 1,
    files: [{ path: 'rule.txt', sha256: sha256('freigegebene-regel\n') }]
  }));

  assert.equal((await verifyProductionLock({ repositoryRoot: root, manifestPath })).passed, true);
  await writeFile(path.join(root, 'rule.txt'), 'versehentlich-verändert\n');
  const changed = await verifyProductionLock({ repositoryRoot: root, manifestPath });
  assert.equal(changed.passed, false);
  assert.equal(changed.checks[0].reason, 'hash-mismatch');
});
