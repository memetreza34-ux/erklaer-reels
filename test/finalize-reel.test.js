import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createReelWorkspace } from '../src/core/workspace.js';
import { finalizeReel } from '../src/core/finalize-reel.js';

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

test('erzeugt einen vollständigen Abschlussbericht und nennt den nächsten Schritt', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-finalize-'));
  const result = await createReelWorkspace({
    title: 'Warum fühlt sich Warten so lang an?',
    script: 'Beim Warten konzentrieren Menschen ihre Aufmerksamkeit stark auf die Zeit. Dadurch wirken einzelne Sekunden länger, obwohl die Uhr normal weiterläuft.',
    date: new Date('2026-07-31T12:00:00'),
    sceneCount: 12,
    outputRoot
  });

  const report = await finalizeReel(result.reelDirectory, {
    strict: false,
    audioDurationSeconds: 55,
    probeAudio: false
  });

  assert.equal(report.readyForRenderer, false);
  assert.equal(report.stages.content.passed, false);
  assert.equal(typeof report.progress.overall, 'number');
  assert.ok(report.nextStep.length > 10);

  const reportPath = path.join(result.reelDirectory, 'review', 'final-readiness-report.json');
  assert.equal(await exists(reportPath), true);
  const saved = JSON.parse(await readFile(reportPath, 'utf8'));
  assert.equal(saved.readyForRenderer, false);
  assert.ok(Array.isArray(saved.blockingIssues));
});
