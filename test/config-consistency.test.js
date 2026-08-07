import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { SUBTITLE_STYLE } from '../src/shared/subtitle-style.js';

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.resolve(relativePath), 'utf8'));
}

test('App- und Inhaltskonfiguration verwenden denselben Ein-Minuten-Standard', async () => {
  const app = await readJson('config/app.config.json');
  const rules = await readJson('config/content-rules.json');

  assert.deepEqual(app.targetDurationSeconds, { min: 55, preferred: 58, max: 60 });
  assert.deepEqual(app.sceneCount, { min: 12, preferred: 13, max: 14 });
  assert.deepEqual(app.visualChangeEverySeconds, { min: 3.5, max: 5 });
  assert.equal(app.outputRoot, 'reels');

  assert.deepEqual(rules.scriptRules.targetDurationSeconds, { min: 55, max: 60, preferred: 58 });
  assert.equal(rules.visualRules.minimumSceneCount, 12);
  assert.equal(rules.visualRules.maximumSceneCount, 14);
  assert.equal(rules.visualRules.defaultSceneCount, 13);
  assert.deepEqual(rules.visualRules.visualChangeIntervalSeconds, { min: 3.5, max: 5 });
  assert.equal(rules.scriptRules.audioPacing.rerunWordSyncAfterward, true);
});

test('Untertitelregeln entsprechen der technischen Quelle', async () => {
  const rules = await readJson('config/content-rules.json');
  const subtitleRules = rules.subtitleRules;

  assert.equal(SUBTITLE_STYLE.verticalPositionPercent, 58);
  assert.equal(SUBTITLE_STYLE.textColor, '#F5F7FA');
  assert.deepEqual(subtitleRules.verticalPositionPercent, { min: 58, max: 58, default: 58 });
  assert.equal(subtitleRules.fixedExactCenterPosition, false);
  assert.equal(subtitleRules.fixedVerticalPosition, true);
  assert.equal(subtitleRules.palette.textColor, SUBTITLE_STYLE.textColor);
  assert.equal(subtitleRules.palette.highlightColor, SUBTITLE_STYLE.highlightColor);
  assert.equal(subtitleRules.exactWordTimingsRequired, true);
  assert.equal(subtitleRules.wordTimingWorkflow.enabled, true);
  assert.equal(subtitleRules.wordTimingWorkflow.localAudioReviewRequired, true);
  assert.equal(subtitleRules.wordTimingWorkflow.estimatedDistributionForbidden, true);
  assert.equal(subtitleRules.fallbackWordTiming, 'blocked-until-codex-word-sync');
});

test('Workspace kann den alten content-Ordner und Sandton nicht wieder einführen', async () => {
  const source = await readFile(path.resolve('src/core/workspace.js'), 'utf8');

  assert.match(source, /outputRoot = 'reels'/);
  assert.doesNotMatch(source, /outputRoot = 'content'/);
  assert.doesNotMatch(source, /Sandton|warmen hellen Sandton/i);
  assert.match(source, /weiches Weiß/);
  assert.match(source, /exactWordTimingsRequired: true/);
});
