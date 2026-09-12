import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { buildSequentialAudioSync } from '../src/core/reel-image-audio-mapping.js';

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.resolve(relativePath), 'utf8'));
}

async function readText(relativePath) {
  return readFile(path.resolve(relativePath), 'utf8');
}

test('Auto-Alignment erzeugt monotone Audio-Cues ohne Einzelbestätigung', () => {
  const input = {
    version: 2,
    mappings: [
      { globalImageNumber: 1, sceneId: 'scene-01', phaseId: 'scene-01-image-01', timingRole: 'scene-start', spokenText: 'Erster kurzer Satz.' },
      { globalImageNumber: 2, sceneId: 'scene-01', phaseId: 'scene-01-image-02', timingRole: 'internal-image-cut', spokenText: 'Dieser Abschnitt ist etwas länger und erklärt mehr.' },
      { globalImageNumber: 3, sceneId: 'scene-02', phaseId: 'scene-02-image-01', timingRole: 'scene-start', spokenText: 'Zum Schluss folgt die zweite Szene.' }
    ]
  };

  const result = buildSequentialAudioSync(input, 30, 'audio/final.m4a');
  assert.equal(result.audioSync.timingStatus, 'audio-synced');
  assert.equal(result.audioSync.source, 'sequential-spoken-text-weight-v1');
  assert.equal(result.mapping.mappings[0].actualStartSeconds, 0);
  assert.equal(result.mapping.mappings.at(-1).actualEndSeconds, 30);
  assert.ok(result.mapping.mappings[1].actualStartSeconds > result.mapping.mappings[0].actualStartSeconds);
  assert.ok(result.mapping.mappings[2].actualStartSeconds > result.mapping.mappings[1].actualStartSeconds);
  assert.equal(result.audioSync.cueTimings.length, 2);
  assert.equal(result.audioSync.phaseCueTimings.length, 1);
});

test('Phase 3 ist auf einen nicht-interaktiven Simple-Mode reduziert', async () => {
  const visualRules = await readJson('config/visual-quality-rules.json');
  const qualityGates = await readJson('config/production-quality-gates.json');
  const phase3 = await readText('src/cli/phase3-reel.js');
  const pkg = await readJson('package.json');

  assert.equal(visualRules.manualEvidence.requireVisibleSummary, false);
  assert.equal(visualRules.manualEvidence.requireMatchReason, false);
  assert.equal(visualRules.manualEvidence.requireSecondPassConfirmationForScenes, false);
  assert.equal(visualRules.strictMode.requireManualReviewPassed, false);
  assert.equal(visualRules.strictMode.requireSemanticSceneVerification, false);
  assert.equal(qualityGates.assetMatching.requireSecondPassConfirmation, false);
  assert.equal(qualityGates.assetMatching.requireMatchReason, false);
  assert.equal(qualityGates.assetMatching.askUserOnlyOnHardBlocker, true);
  assert.equal(pkg.scripts['auto-align:reel'], 'node src/cli/auto-align-reel.js');
  assert.equal(pkg.scripts['phase3:reel'], 'node src/cli/phase3-reel.js');

  assert.match(phase3, /organize:assets/);
  assert.match(phase3, /--numbered/);
  assert.match(phase3, /check:visuals/);
  assert.match(phase3, /auto-align:reel/);
  assert.match(phase3, /script: 'sync:sounds'/);
  assert.match(phase3, /NONINTERACTIVE/);
  assert.doesNotMatch(phase3, /sync:words/);
});
