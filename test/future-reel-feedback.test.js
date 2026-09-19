import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildAudioPacingFilter } from '../src/core/audio-tightener.js';
import { MOTION_ALIASES, canonicalMotionType, motionDirectionMismatch, phaseCameraMotion } from '../src/shared/camera-motion.js';
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
  assert.equal(MOTION_ALIASES['gentle-pan'], 'ken-burns');
  assert.equal(MOTION_ALIASES['medium-push-in'], 'slow-zoom-in');
  assert.equal(canonicalMotionType('pull-out'), 'subtle-pull-out');

  // Renderer, Effects-Guard und Timeline müssen dieselbe Tabelle benutzen, sonst
  // fällt eine Bewegung in der Prüfung durch und im Render wieder heraus.
  const renderer = await readFile(new URL('../src/renderer/ReelComposition.jsx', import.meta.url), 'utf8');
  assert.match(renderer, /from '\.\.\/shared\/camera-motion\.js'/);
  const guard = await readFile(new URL('../src/core/effects-quality-file-guard.js', import.meta.url), 'utf8');
  assert.match(guard, /from '\.\.\/shared\/camera-motion\.js'/);
  const timeline = await readFile(new URL('../src/core/timeline.js', import.meta.url), 'utf8');
  assert.match(timeline, /from '\.\.\/shared\/camera-motion\.js'/);
});

test('ein Bewegungstyp muss auch das tun, was sein Name verspricht', () => {
  // Genau dieser Fall stand im Vetorecht-Reel: zehn verschiedene Bewegungsnamen,
  // zehnmal derselbe 3-Prozent-Push-in.
  assert.ok(motionDirectionMismatch({ type: 'pan-left', startScale: 1, endScale: 1.03, panXPercent: 0, panYPercent: 0 }));
  assert.ok(motionDirectionMismatch({ type: 'slow-zoom-out', startScale: 1, endScale: 1.03, panXPercent: 0, panYPercent: 0 }));
  assert.ok(motionDirectionMismatch({ type: 'pan-up', startScale: 1, endScale: 1.03, panXPercent: 0, panYPercent: 0 }));
  assert.equal(motionDirectionMismatch({ type: 'pan-left', startScale: 1.04, endScale: 1.04, panXPercent: -2, panYPercent: 0 }), null);
  assert.equal(motionDirectionMismatch({ type: 'slow-zoom-out', startScale: 1.05, endScale: 1, panXPercent: 0, panYPercent: 0 }), null);
  assert.equal(motionDirectionMismatch({ type: 'subtle-push-in', startScale: 1, endScale: 1.04, panXPercent: 0, panYPercent: 0 }), null);
});

test('interne Bildphasen laufen gegen die Szenenbewegung statt statisch zu bleiben', () => {
  const scene = { type: 'subtle-push-in', startScale: 1, endScale: 1.04 };
  const second = phaseCameraMotion(scene, 1);
  assert.equal(second.type, 'subtle-pull-out');
  assert.equal(motionDirectionMismatch(second), null);
  assert.equal(phaseCameraMotion(scene, 2).type, 'subtle-push-in');
  assert.notEqual(second.type, 'none');
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
