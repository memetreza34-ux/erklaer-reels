import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createReelWorkspace } from '../src/core/workspace.js';
import { prepareReelProduction } from '../src/core/production-brief.js';

test('Bildtext unterstützt die Szene statt sie zu dominieren', async () => {
  const rules = JSON.parse(await readFile(path.resolve('config', 'content-rules.json'), 'utf8'));
  const textRules = rules.visualRules.embeddedTextRules;

  assert.equal(rules.visualRules.visualWorldMode, 'fixed');
  assert.equal(rules.visualRules.fixedVisualWorld, 'modern-countryball-explainer');
  assert.equal(rules.visualRules.selectVisualWorldAfterScript, false);
  assert.equal(rules.visualRules.promptLanguage, 'en');
  assert.equal(rules.visualRules.integratedGermanTextPreferred, false);
  assert.equal(textRules.language, 'de');
  assert.equal(textRules.coverRequired, true);
  assert.equal(textRules.nonCoverOptional, true);
  assert.equal(textRules.imageMustWorkWithoutText, true);
  assert.deepEqual(textRules.preferredWordsPerScene, { min: 0, max: 4 });
  assert.deepEqual(textRules.preferredSceneCoveragePercent, { min: 35, max: 60 });
  assert.equal(textRules.mustAppearExactlyInPrompt, true);
  assert.equal(rules.visualRules.posterCardLayoutForbiddenAsDefault, true);
  assert.equal(rules.visualRules.textDominantCompositionForbidden, true);
  assert.equal(rules.visualRules.varyShotTypeAcrossAdjacentImages, true);
});

test('Codex-Auftrag erzwingt visual-first Bildwelt mit optionalem Nicht-Cover-Text', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-image-text-'));

  try {
    const { reelDirectory } = await createReelWorkspace({
      title: 'Warum entstehen Grenzen?',
      script: 'Warum entstehen Grenzen? Dieses ausreichend lange Rohscript dient nur dazu, einen vollständigen Produktionsauftrag mit neun Szenen und den neuen Regeln für visuelles Storytelling zu erzeugen.',
      date: new Date('2026-09-02T12:00:00'),
      sceneCount: 9,
      outputRoot
    });

    const result = await prepareReelProduction(reelDirectory);
    const task = await readFile(result.taskFile, 'utf8');
    const checklist = JSON.parse(await readFile(result.checklistFile, 'utf8'));

    assert.match(task, /Verbindliche Reel-Bildwelt: Modern Countryball Explainer/i);
    assert.match(task, /modern-countryball-explainer/);
    assert.match(task, /keine Stilrotation/i);
    assert.match(task, /konkrete visuelle Mini-Szene/i);
    assert.match(task, /generischen schwebenden Karten/i);
    assert.match(task, /keine YouTube-Stick-Figuren/i);
    assert.match(task, /Nur Bild 01 braucht zwingend imageText/i);
    assert.match(task, /spätere Bildphasen.*optional/is);
    assert.match(task, /0–4 deutsche Wörter/i);
    assert.match(task, /35–60 %/i);
    assert.match(task, /Bild 01 ist Cover.*starke deutsche Überschrift/is);
    assert.match(task, /Bildprompts: \*\*Englisch\*\*/i);
    assert.match(task, /sichtbarer Bildtext: \*\*Deutsch/i);
    assert.ok(checklist.tasks.some((entry) => entry.id === 'image-text-plan'));
    assert.ok(checklist.tasks.some((entry) => entry.id === 'visual-world-fixed'));
    assert.ok(checklist.tasks.some((entry) => entry.id === 'visual-world-separated'));
    assert.ok(checklist.tasks.some((entry) => entry.id === 'scene-first-visuals'));
    assert.ok(checklist.tasks.some((entry) => entry.id === 'visual-depth-variety'));
    assert.equal(checklist.visualStyleId, 'modern-countryball-explainer');
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});
