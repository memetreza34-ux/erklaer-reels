import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createReelWorkspace } from '../src/core/workspace.js';
import { prepareReelProduction } from '../src/core/production-brief.js';

test('Bildtext unterstützt die Serious-Minimal-Bildwelt statt sie zu dominieren', async () => {
  const rules = JSON.parse(await readFile(path.resolve('config', 'content-rules.json'), 'utf8'));
  const textRules = rules.visualRules.embeddedTextRules;

  assert.equal(rules.visualRules.visualWorldMode, 'fixed');
  assert.equal(rules.visualRules.fixedVisualWorld, 'serious-minimal-countryball-explainer');
  assert.equal(rules.visualRules.selectVisualWorldAfterScript, false);
  assert.equal(rules.visualRules.promptLanguage, 'en');
  assert.equal(textRules.language, 'de');
  assert.equal(textRules.coverRequired, true);
  assert.equal(textRules.nonCoverOptional, true);
  assert.equal(textRules.imageMustWorkWithoutText, true);
  assert.deepEqual(textRules.preferredWordsPerScene, { min: 0, max: 4 });
  assert.deepEqual(textRules.preferredSceneCoveragePercent, { min: 35, max: 60 });
  assert.equal(textRules.mustAppearExactlyInPrompt, true);
  assert.equal(rules.visualRules.textDominantCompositionForbidden, true);
  assert.equal(rules.visualRules.varyShotTypeAcrossAdjacentImages, true);
  assert.deepEqual(rules.visualRules.allowedCompositionModes, ['minimal-symbolic', 'supported-explainer', 'simple-mini-scene']);
});

test('Produktionsauftrag verlangt Adaptive Dense V2, neue Bildwelt und optionalen Nicht-Cover-Text', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-image-text-'));
  try {
    const { reelDirectory } = await createReelWorkspace({
      title: 'Warum entstehen Grenzen?',
      script: 'Warum entstehen Grenzen? Dieses ausreichend lange Rohscript dient nur dazu, einen vollständigen Produktionsauftrag mit den aktuellen Regeln zu erzeugen.',
      date: new Date('2026-09-12T12:00:00'),
      sceneCount: 9,
      outputRoot
    });

    const result = await prepareReelProduction(reelDirectory);
    const task = await readFile(result.taskFile, 'utf8');
    const checklist = JSON.parse(await readFile(result.checklistFile, 'utf8'));

    assert.match(task, /Serious Minimal Countryball Explainer/i);
    assert.match(task, /serious-minimal-countryball-explainer/);
    assert.match(task, /Adaptive Dense V2/i);
    assert.match(task, /20–22 Bilder/);
    assert.match(task, /Bild 01.*Headline/is);
    assert.match(task, /spätere Bilder.*textfrei/is);
    assert.match(task, /max\. 4 Wörter/i);
    assert.match(task, /Prompts Englisch/i);
    assert.match(task, /sichtbarer Text Deutsch/i);
    assert.match(task, /Simple Mode/i);
    assert.ok(checklist.tasks.some((entry) => entry.id === 'image-text-plan'));
    assert.ok(checklist.tasks.some((entry) => entry.id === 'visual-world-fixed'));
    assert.ok(checklist.tasks.some((entry) => entry.id === 'image-density-plan'));
    assert.equal(checklist.visualStyleId, 'serious-minimal-countryball-explainer');
    assert.equal(checklist.imageCountMode, 'adaptive-dense-v2');
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});
