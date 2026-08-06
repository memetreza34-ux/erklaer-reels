import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createReelWorkspace } from '../src/core/workspace.js';
import { prepareReelProduction } from '../src/core/production-brief.js';

test('bevorzugt kurzen deutschen Bildtext in passenden Szenen', async () => {
  const rules = JSON.parse(await readFile(path.resolve('config', 'content-rules.json'), 'utf8'));
  const textRules = rules.visualRules.embeddedTextRules;

  assert.equal(rules.visualRules.selectVisualWorldAfterScript, true);
  assert.equal(rules.visualRules.integratedGermanTextPreferred, true);
  assert.equal(textRules.language, 'de');
  assert.deepEqual(textRules.preferredWordsPerScene, { min: 1, max: 5 });
  assert.deepEqual(textRules.preferredSceneCoveragePercent, { min: 55, max: 85 });
  assert.equal(textRules.mustAppearExactlyInPrompt, true);
  assert.equal(textRules.mustNotRepeatSubtitleVerbatim, true);
});

test('Codex-Auftrag berechnet einen sinnvollen Bildtext-Zielbereich', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-image-text-'));

  try {
    const { reelDirectory } = await createReelWorkspace({
      title: 'Warum entstehen Grenzen?',
      script: 'Warum entstehen Grenzen? Dieses ausreichend lange Rohscript dient nur dazu, einen vollständigen Produktionsauftrag mit dreizehn Szenen und den neuen Regeln für kurzen deutschen Bildtext zu erzeugen.',
      date: new Date('2026-08-06T12:00:00'),
      sceneCount: 13,
      outputRoot
    });

    const result = await prepareReelProduction(reelDirectory);
    const task = await readFile(result.taskFile, 'utf8');
    const checklist = JSON.parse(await readFile(result.checklistFile, 'utf8'));

    assert.match(task, /1–5 Wörter/);
    assert.match(task, /ungefähr 8–11 passenden Szenen/);
    assert.match(task, /exakten deutschen Text in Anführungszeichen/);
    assert.ok(checklist.tasks.some((entry) => entry.id === 'image-text-plan'));
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});
