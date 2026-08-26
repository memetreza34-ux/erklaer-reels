import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createReelWorkspace } from '../src/core/workspace.js';
import { prepareReelProduction } from '../src/core/production-brief.js';

test('bevorzugt kurzen deutschen Bildtext ohne automatische Bildwelt-Auswahl', async () => {
  const rules = JSON.parse(await readFile(path.resolve('config', 'content-rules.json'), 'utf8'));
  const textRules = rules.visualRules.embeddedTextRules;

  assert.equal(rules.visualRules.visualWorldMode, 'unassigned');
  assert.equal(rules.visualRules.fixedVisualWorld, null);
  assert.equal(rules.visualRules.selectVisualWorldAfterScript, false);
  assert.equal(rules.visualRules.integratedGermanTextPreferred, true);
  assert.equal(textRules.language, 'de');
  assert.deepEqual(textRules.preferredWordsPerScene, { min: 1, max: 5 });
  assert.deepEqual(textRules.preferredSceneCoveragePercent, { min: 55, max: 85 });
  assert.equal(textRules.mustAppearExactlyInPrompt, true);
});

test('Codex-Auftrag berechnet Bildtext-Zielbereich und verbietet alte Stil-Ableitung', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-image-text-'));

  try {
    const { reelDirectory } = await createReelWorkspace({
      title: 'Warum entstehen Grenzen?',
      script: 'Warum entstehen Grenzen? Dieses ausreichend lange Rohscript dient nur dazu, einen vollständigen Produktionsauftrag mit dreizehn Szenen und den neuen Regeln für kurzen deutschen Bildtext zu erzeugen.',
      date: new Date('2026-08-26T12:00:00'),
      sceneCount: 13,
      outputRoot
    });

    const result = await prepareReelProduction(reelDirectory);
    const task = await readFile(result.taskFile, 'utf8');
    const checklist = JSON.parse(await readFile(result.checklistFile, 'utf8'));

    assert.match(task, /keine feste Bildwelt definiert/i);
    assert.match(task, /Keine Bildwelt autonom auswählen/i);
    assert.match(task, /kurzen deutschen Bildtext/i);
    assert.match(task, /exakten deutschen Text/i);
    assert.ok(checklist.tasks.some((entry) => entry.id === 'image-text-plan'));
    assert.ok(checklist.tasks.some((entry) => entry.id === 'visual-world-unassigned'));
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});
