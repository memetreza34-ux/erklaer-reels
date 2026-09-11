import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildAudioPacingFilter } from '../src/core/audio-tightener.js';
import { EDIT_TIMING_STYLE } from '../src/shared/edit-timing-style.js';

test('Voice-Pacing entfernt Endstille vor dem festen Schluss-Hold', () => {
  const filter = buildAudioPacingFilter();
  assert.equal((filter.match(/areverse/g) ?? []).length, 2);
  assert.match(filter, /start_silence=0\.05/);
});

test('Cut- und SFX-Timing nutzt den Vorlauf vor dem Cue-Wort', async () => {
  assert.equal(EDIT_TIMING_STYLE.sceneCueLeadSeconds, 0.1);
  assert.equal(EDIT_TIMING_STYLE.imageCueLeadSeconds, 0.08);
  assert.equal(EDIT_TIMING_STYLE.sfxPreRollSeconds, 0.04);

  const renderer = await readFile(new URL('../src/renderer/ReelComposition.jsx', import.meta.url), 'utf8');
  assert.match(renderer, /cutLeadFramesFor/);
  assert.match(renderer, /renderStartFrame/);
  assert.match(renderer, /target\.renderStartFrame - preRollFrames/);
});

test('jeder Bildmoment bekommt selbst bei unvollständigem Plan einen Motion-Fallback', async () => {
  const renderer = await readFile(new URL('../src/renderer/ReelComposition.jsx', import.meta.url), 'utf8');
  assert.match(renderer, /automaticMotion/);
  assert.match(renderer, /subtle-push-in/);
  assert.match(renderer, /subtle-pull-out/);
  assert.match(renderer, /cameraMotion.*none|type.*none/s);
});

test('bekannte alte Motion-Aliasnamen werden nicht mehr versehentlich statisch gerendert', async () => {
  const renderer = await readFile(new URL('../src/renderer/ReelComposition.jsx', import.meta.url), 'utf8');
  assert.match(renderer, /gentle-pan.*ken-burns/s);
  assert.match(renderer, /medium-push-in.*slow-zoom-in/s);
});

test('Renderer kann einen aufgelösten SFX notfalls auch aus seinem zentral geprüften Typ ableiten', async () => {
  const renderer = await readFile(new URL('../src/renderer/ReelComposition.jsx', import.meta.url), 'utf8');
  assert.match(renderer, /SOUND_FILES_BY_TYPE/);
  assert.match(renderer, /resolveSoundFile/);
  assert.match(renderer, /sfx\//);
});

test('Qualitätskonfiguration verlangt Bewegung auf jedem neuen Bildmoment', async () => {
  const raw = await readFile(new URL('../config/effects-rules.json', import.meta.url), 'utf8');
  const rules = JSON.parse(raw);
  assert.equal(rules.motionEffects.motionOnEveryNarrativeSceneRequired, true);
  assert.equal(rules.motionEffects.motionOnEveryImagePhaseByDefault, true);
  assert.deepEqual(rules.motionEffects.staticSceneShare, { min: 0, max: 0 });
  assert.equal(rules.soundEffects.soundOnEverySceneChange, true);
  assert.equal(rules.soundEffects.soundOnEveryInternalImageChange, true);
});

test('Qualitätskonfiguration passt zum Renderer-Timing und dichterem Bildrhythmus', async () => {
  const raw = await readFile(new URL('../config/production-quality-gates.json', import.meta.url), 'utf8');
  const gates = JSON.parse(raw);
  assert.equal(gates.editTiming.sceneCueLeadSeconds, EDIT_TIMING_STYLE.sceneCueLeadSeconds);
  assert.equal(gates.editTiming.imageCueLeadSeconds, EDIT_TIMING_STYLE.imageCueLeadSeconds);
  assert.equal(gates.editTiming.sfxPreRollSeconds, EDIT_TIMING_STYLE.sfxPreRollSeconds);
  assert.equal(gates.sceneTiming.postVoiceHoldSeconds, 0.6);
  assert.equal(gates.sceneTiming.minimumImagePhaseSeconds, 2.2);
  assert.deepEqual(gates.sceneTiming.recommendedImagePhaseSeconds, { min: 2.5, max: 3.8 });
  assert.equal(gates.sceneTiming.splitReviewThresholdSeconds, 4.8);
});

test('Adaptive Dense V2 plant für neue Reels mehr Bilder ohne starre Gleichverteilung', async () => {
  const raw = await readFile(new URL('../config/content-rules.json', import.meta.url), 'utf8');
  const rules = JSON.parse(raw).visualRules;
  assert.equal(rules.imageCountMode, 'adaptive-dense-v2');
  assert.equal(rules.visualDensityVersion, 2);
  assert.equal(rules.effectiveSince, '2026-09-11');
  assert.deepEqual(rules.adaptiveImageTargets['8'], { min: 19, max: 21 });
  assert.deepEqual(rules.adaptiveImageTargets['9'], { min: 20, max: 22 });
  assert.deepEqual(rules.adaptiveImageTargets['10'], { min: 21, max: 24 });
  assert.equal(rules.hookImagePhases, 2);
  assert.deepEqual(rules.standardSceneImagePhases, { min: 2, max: 3 });
  assert.equal(rules.imageMomentPerSpokenIdea, true);
  assert.equal(rules.globalWorldLockRequiredBeforeImage01, true);
  assert.equal(rules.forbidTinyDecorativeBallActor, true);
  assert.equal(rules.ballActorMustHaveNarrativeFunction, true);
});
