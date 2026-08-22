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
  assert.equal(rules.scriptRules.audioPacing.rerunWordSyncAfterward, false);
});

test('Untertitel sind in Shared-Config und Inhaltsregeln global deaktiviert', async () => {
  const rules = await readJson('config/content-rules.json');

  assert.equal(SUBTITLE_STYLE.enabled, false);
  assert.equal(rules.subtitleRules.defaultEnabled, false);
  assert.equal(rules.subtitleRules.globallyDisabled, true);
  assert.equal(rules.subtitleRules.renderSubtitles, false);
  assert.equal(rules.subtitleRules.generateSubtitleCues, false);
  assert.equal(rules.subtitleRules.wordTimingWorkflowRequired, false);
  assert.equal(rules.visualRules.reserveSubtitleSafeZone, false);
  assert.equal(rules.visualRules.useFullFrameComposition, true);
});

test('Workspace erzeugt keine aktiven Untertitel', async () => {
  const source = await readText('src/core/workspace.js');

  assert.match(source, /subtitlesEnabled:\s*false/);
  assert.match(source, /subtitles:\s*'disabled'/);
  assert.match(source, /wordSync:\s*'not-required'/);
  assert.match(source, /enabled:\s*false/);
  assert.doesNotMatch(source, /exactWordTimingsRequired:\s*true/);
});

test('Timeline und Renderer erzwingen leere Untertitelspuren', async () => {
  const timeline = await readText('src/core/timeline.js');
  const renderer = await readText('src/renderer/ReelComposition.jsx');
  const renderValidator = await readText('src/core/render-validator.js');

  assert.match(timeline, /subtitlesEnabled:\s*false/);
  assert.match(timeline, /subtitles:\s*\[\]/);
  assert.match(renderValidator, /no-subtitles-in-render-plan/);
  assert.match(renderValidator, /subtitles-disabled-in-reel/);
  assert.doesNotMatch(renderer, /Subtitle/);
  assert.doesNotMatch(renderer, /wordTimings|activeWordIndex/);
});

test('Finalizer und Renderpfad benötigen keinen Word-Sync mehr', async () => {
  const finalizer = await readText('src/core/finalize-reel.js');
  const cliFinalizer = await readText('src/cli/finalize-reel.js');
  const renderCli = await readText('src/cli/render-reel.js');
  const coreRenderer = await readText('src/core/remotion-renderer.js');

  for (const source of [finalizer, cliFinalizer, renderCli, coreRenderer]) {
    assert.doesNotMatch(source, /verifyAppliedWordSyncAudioBinding/);
  }
  assert.match(finalizer, /wordSyncRequired:\s*false/);
  assert.match(finalizer, /subtitlesEnabled:\s*false/);
});

test('Finalizer und Renderer behalten echte Audio-Messbelege bei', async () => {
  const finalizer = await readText('src/core/finalize-reel.js');
  const renderValidator = await readText('src/core/render-validator.js');

  for (const [file, text] of [
    ['src/core/finalize-reel.js', finalizer],
    ['src/core/render-validator.js', renderValidator]
  ]) {
    assert.match(text, /version \?\? 0\) >= 5|version \?\? 0\).*>= 5/, `${file} erkennt Audio-Pacing-Reports ab Version 5 nicht.`);
    assert.match(text, /loudnessMeasured/);
    assert.match(text, /measurement\.passed === true/);
    assert.match(text, /integratedLufs/);
    assert.match(text, /truePeakDbtp/);
    assert.match(text, /isMeasuredLoudnessWithinTolerance/);
  }
});

test('Dokumentation friert den Untertitel-freien Standard ein', async () => {
  const workflow = await readText('CURRENT_WORKFLOW.md');
  const agents = await readText('AGENTS.md');

  assert.match(workflow, /keine Untertitel/i);
  assert.match(workflow, /keinen Untertitel- oder Word-Sync-Schritt/i);
  assert.match(workflow, /Untertitel wieder aktivieren.*verboten|Untertitel wieder aktivieren/i);
  assert.match(agents, /keine Untertitel/i);
  assert.match(agents, /sync:words.*nicht erforderlich/i);
});

test('Gitignore schützt generierte Medien in aktuellen Produktionsordnern', async () => {
  const gitignore = await readText('.gitignore');

  assert.match(gitignore, /reels\/\*\*\/output\/\*\.mp4/);
  assert.match(gitignore, /reels\/\*\*\/audio\/\*\.m4a/);
  assert.match(gitignore, /reels\/\*\*\/scenes\/\*\*\/\*\.png/);
  assert.match(gitignore, /reels\/\*\*\/cover\/\*\.webp/);
  assert.match(gitignore, /^\.env$/m);
});
