import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createReelWorkspace } from '../src/core/workspace.js';
import { prepareReelProduction } from '../src/core/production-brief.js';

test('bevorzugt kurzen deutschen Bildtext innerhalb der festen Bildwelt', async () => {
  const rules = JSON.parse(await readFile(path.resolve('config', 'content-rules.json'), 'utf8'));
  const textRules = rules.visualRules.embeddedTextRules;

  assert.equal(rules.visualRules.visualWorldMode, 'fixed');
  assert.equal(rules.visualRules.fixedVisualWorld, 'modern-countryball-explainer');
  assert.equal(rules.visualRules.selectVisualWorldAfterScript, false);
  assert.equal(rules.visualRules.promptLanguage, 'en');
  assert.equal(rules.visualRules.integratedGermanTextPreferred, true);
  assert.equal(textRules.language, 'de');
  assert.deepEqual(textRules.preferredWordsPerScene, { min: 1, max: 5 });
  assert.deepEqual(textRules.preferredSceneCoveragePercent, { min: 55, max: 85 });
  assert.equal(textRules.mustAppearExactlyInPrompt, true);
});

test('Codex-Auftrag berechnet Bildtext-Zielbereich und erzwingt die getrennte scene-first Reel-Bildwelt', async () => {
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

    assert.match(task, /Verbindliche Reel-Bildwelt: Modern Countryball Explainer/i);
    assert.match(task, /modern-countryball-explainer/);
    assert.match(task, /Keine Bildwelt auswählen oder rotieren/i);
    assert.match(task, /konkreten physischen Bildmoment/i);
    assert.match(task, /generischen schwebenden Karten/i);
    assert.match(task, /keine YouTube-Stick-Figuren/i);
    assert.match(task, /exakten deutschen Text/i);
    assert.match(task, /Bildprompts: \*\*Englisch\*\*/i);
    assert.match(task, /sichtbarer Bildtext: \*\*Deutsch\*\*/i);
    assert.ok(checklist.tasks.some((entry) => entry.id === 'image-text-plan'));
    assert.ok(checklist.tasks.some((entry) => entry.id === 'visual-world-fixed'));
    assert.ok(checklist.tasks.some((entry) => entry.id === 'visual-world-separated'));
    assert.ok(checklist.tasks.some((entry) => entry.id === 'scene-first-visuals'));
    assert.equal(checklist.visualStyleId, 'modern-countryball-explainer');
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});
