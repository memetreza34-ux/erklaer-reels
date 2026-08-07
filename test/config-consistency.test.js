import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { SUBTITLE_STYLE } from '../src/shared/subtitle-style.js';

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.resolve(relativePath), 'utf8'));
}

async function readText(relativePath) {
  return readFile(path.resolve(relativePath), 'utf8');
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

test('Untertitelregeln und Visual-QC entsprechen der technischen Quelle', async () => {
  const rules = await readJson('config/content-rules.json');
  const visualQuality = await readJson('config/visual-quality-rules.json');
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

  assert.equal(visualQuality.version, 7);
  assert.deepEqual(visualQuality.safeZones.subtitleVerticalPercent, {
    min: SUBTITLE_STYLE.safeVerticalRangePercent.min,
    max: SUBTITLE_STYLE.safeVerticalRangePercent.max,
    default: SUBTITLE_STYLE.verticalPositionPercent
  });
  assert.equal(visualQuality.subtitlePalette.textColor, SUBTITLE_STYLE.textColor);
  assert.equal(visualQuality.subtitlePalette.highlightColor, SUBTITLE_STYLE.highlightColor);
  assert.equal(visualQuality.subtitlePalette.backgroundColor, SUBTITLE_STYLE.backgroundColor);
});

test('Workspace kann den alten content-Ordner und Sandton nicht wieder einführen', async () => {
  const source = await readText('src/core/workspace.js');

  assert.match(source, /outputRoot = 'reels'/);
  assert.doesNotMatch(source, /outputRoot = 'content'/);
  assert.doesNotMatch(source, /Sandton|warmen hellen Sandton/i);
  assert.match(source, /weiches Weiß/);
  assert.match(source, /exactWordTimingsRequired: true/);
});

test('Kernmodule können keine veralteten Untertitelregeln oder falschen Word-Sync-Status zurückbringen', async () => {
  const productionBrief = await readText('src/core/production-brief.js');
  const visualQc = await readText('src/core/visual-qc.js');
  const renderValidator = await readText('src/core/render-validator.js');
  const audioTightener = await readText('src/core/audio-tightener.js');
  const buildTimeline = await readText('src/cli/build-timeline.js');

  for (const [file, text] of [
    ['src/core/production-brief.js', productionBrief],
    ['src/core/visual-qc.js', visualQc],
    ['src/core/render-validator.js', renderValidator]
  ]) {
    assert.doesNotMatch(text, /Sandton|warmen hellen Sandton|warme sandfarbene Untertitel/i, `${file} enthält noch den alten Sandton.`);
    assert.doesNotMatch(text, /exakt bei 50 Prozent Bildhöhe/i, `${file} enthält noch die alte 50-Prozent-Regel.`);
    assert.match(text, /weiches Weiß|weißen Untertitel|weiße Untertitel/i, `${file} nennt den weißen Standard nicht.`);
  }

  assert.match(visualQc, /SUBTITLE_STYLE\.verticalPositionPercent/);
  assert.match(visualQc, /subtitle-safe-zone-config/);
  assert.doesNotMatch(audioTightener, /not-required-for-current-subtitle-style/);
  assert.match(audioTightener, /needs-resync-after-audio-pacing/);
  assert.match(audioTightener, /invalidated-after-audio-pacing/);
  assert.match(audioTightener, /wordSyncInvalidated: true/);
  assert.match(buildTimeline, /reels\/\.\.\.\/reel-01_titel/);
  assert.doesNotMatch(buildTimeline, /content\/\.\.\.\/reel-01_titel/);
});

test('Gitignore schützt generierte Medien in aktuellen Produktionsordnern', async () => {
  const gitignore = await readText('.gitignore');

  assert.match(gitignore, /reels\/\*\*\/output\/\*\.mp4/);
  assert.match(gitignore, /reels\/\*\*\/audio\/\*\.m4a/);
  assert.match(gitignore, /reels\/\*\*\/scenes\/\*\*\/\*\.png/);
  assert.match(gitignore, /reels\/\*\*\/cover\/\*\.webp/);
  assert.match(gitignore, /youtube\/\*\*\/output\/\*\.mp4/);
  assert.match(gitignore, /youtube\/\*\*\/audio\/\*\.mp3/);
  assert.match(gitignore, /^\.env$/m);
});

test('Dokumentation bleibt beim weißen 58-Prozent-Untertiltelstandard', async () => {
  const documents = [
    'README.md',
    'CODEX_TASK.md',
    'knowledge/production-rules.md',
    'knowledge/subtitle-pacing-rules.md',
    'docs/codex-word-sync.md',
    'docs/remotion-renderer.md',
    'docs/autonomous-reel.md'
  ];

  for (const file of documents) {
    const text = await readText(file);
    assert.doesNotMatch(text, /#E7C39A|warmer heller Sandton|warme sandfarbene Untertitel|im Sandton/i, `${file} enthält noch den alten Sandton.`);
    assert.match(text, /58\s*%|58 Prozent/, `${file} nennt den verbindlichen 58-Prozent-Standard nicht.`);
  }

  for (const file of [
    'README.md',
    'CODEX_TASK.md',
    'knowledge/production-rules.md',
    'knowledge/subtitle-pacing-rules.md',
    'docs/codex-word-sync.md',
    'docs/remotion-renderer.md'
  ]) {
    const text = await readText(file);
    assert.match(text, /#F5F7FA|weiches Weiß|in Weiß/i, `${file} nennt den weißen Untertitelstandard nicht.`);
  }
});

test('abgeschlossene Testphase ist als Produktionsbaseline eingefroren', async () => {
  const status = await readText('PRODUCTION_STATUS.md');
  const autonomous = await readText('docs/autonomous-reel.md');

  assert.match(status, /Status:\s*PRODUKTIONSBEREIT/i);
  assert.match(status, /55–60 Sekunden/);
  assert.match(status, /12–14 Szenen/);
  assert.match(status, /58 % Bildhöhe/);
  assert.match(status, /#F5F7FA/);
  assert.match(status, /0,90 Konfidenz/);
  assert.match(status, /0,7 Sekunden/);
  assert.match(status, /reels\//);
  assert.match(status, /youtube\//);
  assert.match(status, /globale Produktionsregeln nicht nebenbei verändern/i);

  assert.match(autonomous, /PRODUCTION_STATUS\.md/);
  assert.match(autonomous, /keine globalen Produktionsregeln nebenbei verändern/i);
  assert.match(autonomous, /nur nach einer ausdrücklichen neuen Anweisung/i);
});
