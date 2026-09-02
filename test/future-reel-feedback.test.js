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

test('Cut- und SFX-Timing nutzt den neuen Vorlauf', async () => {
  assert.equal(EDIT_TIMING_STYLE.sceneCueLeadSeconds, 0.1);
  assert.equal(EDIT_TIMING_STYLE.imageCueLeadSeconds, 0.08);
  assert.equal(EDIT_TIMING_STYLE.sfxPreRollSeconds, 0.04);

  const renderer = await readFile(new URL('../src/renderer/ReelComposition.jsx', import.meta.url), 'utf8');
  assert.match(renderer, /cutLeadFramesFor/);
  assert.match(renderer, /renderStartFrame/);
  assert.match(renderer, /target\.renderStartFrame - preRollFrames/);
});

test('zweite Bildphasen bekommen automatisch dezente Bewegung', async () => {
  const renderer = await readFile(new URL('../src/renderer/ReelComposition.jsx', import.meta.url), 'utf8');
  assert.match(renderer, /automaticSecondaryMotion/);
  assert.match(renderer, /subtle-push-in/);
  assert.match(renderer, /subtle-pull-out/);
});

test('Qualitätskonfiguration passt zum Renderer-Timing', async () => {
  const raw = await readFile(new URL('../config/production-quality-gates.json', import.meta.url), 'utf8');
  const gates = JSON.parse(raw);
  assert.equal(gates.editTiming.sceneCueLeadSeconds, EDIT_TIMING_STYLE.sceneCueLeadSeconds);
  assert.equal(gates.editTiming.imageCueLeadSeconds, EDIT_TIMING_STYLE.imageCueLeadSeconds);
  assert.equal(gates.editTiming.sfxPreRollSeconds, EDIT_TIMING_STYLE.sfxPreRollSeconds);
  assert.equal(gates.sceneTiming.postVoiceHoldSeconds, 0.6);
});
