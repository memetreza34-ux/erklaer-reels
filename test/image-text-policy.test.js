import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createReelWorkspace } from '../src/core/workspace.js';
import { prepareReelProduction } from '../src/core/production-brief.js';

test('Bildtext unterstützt die Serious-Minimal-Welt statt sie zu dominieren', async () => {
  const rules = JSON.parse(await readFile(path.resolve('config', 'content-rules.json'), 'utf8'));
  const textRules = rules.visualRules.embeddedTextRules;
  assert.equal(rules.visualRules.fixedVisualWorld, 'serious-minimal-countryball-explainer');
  assert.equal(rules.visualRules.visualWorldMode, 'fixed');
  assert.equal(rules.visualRules.promptLanguage, 'en');
  assert.equal(textRules.language, 'de');
  assert.equal(textRules.coverRequired, true);
  assert.equal(textRules.nonCoverOptional, true);
  assert.equal(textRules.imageMustWorkWithoutText, true);
  assert.deepEqual(textRules.preferredWordsPerScene, { min: 0, max: 4 });
  assert.equal(rules.visualRules.globalWorldLockRequiredBeforeImage01, true);
  assert.equal(rules.visualRules.youtubeVisualWorldInheritanceForbidden, true);
});

test('Produktionsauftrag übernimmt die aktive feste Reel-Bildwelt', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-image-text-'));
  try {
    const { reelDirectory } = await createReelWorkspace({
      title: 'Was ist Föderalismus?',
      script: 'Dieses ausreichend lange Rohscript dient nur dazu, einen Produktionsauftrag mit der aktuellen festen Reel-Bildwelt zu erzeugen und die Textregeln zu prüfen.',
      date: new Date('2026-09-12T12:00:00'),
      sceneCount: 9,
      outputRoot
    });
    const result = await prepareReelProduction(reelDirectory);
    const task = await readFile(result.taskFile, 'utf8');
    assert.match(task, /Serious Minimal Countryball Explainer/i);
    assert.match(task, /serious-minimal-countryball-explainer/i);
    assert.match(task, /Nur Bild 01 braucht zwingend imageText/i);
    assert.match(task, /[01]–4 deutsche Wörter/i);
    assert.match(task, /Bildprompts: \*\*Englisch\*\*/i);
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});
