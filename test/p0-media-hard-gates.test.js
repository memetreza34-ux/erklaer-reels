import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { evaluateImageTextFindings } from '../src/core/image-text-guard.js';
import { normalizeImageText } from '../src/core/image-text-ocr.js';
import { buildAudioPacingFilter } from '../src/core/audio-tightener.js';
import { AUDIO_PACING_STYLE } from '../src/shared/audio-pacing-style.js';

test('Vetorecht-Fehlermuster wird am tatsächlich erkannten Bildtext blockiert', () => {
  const root = '/tmp/reel';
  const imageFile = 'images/Bild 01.png';
  const shots = [{ sceneId: 'cover', imageFile, imageText: 'WAS IST EIN VETORECHT?' }];
  const recognized = new Map([
    [path.resolve(root, imageFile), { lines: ['ENTSCHEIDET DIE MEHRHEIT?'], text: normalizeImageText('ENTSCHEIDET DIE MEHRHEIT?') }]
  ]);
  const findings = evaluateImageTextFindings(shots, recognized, root);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].issue, 'planned-image-text-missing');
  assert.equal(findings[0].planned, 'WAS IST EIN VETORECHT?');
});

test('Exakter geplanter deutscher Bildtext besteht auch mit anderer Zeichensetzung', () => {
  const root = '/tmp/reel';
  const imageFile = 'images/Bild 01.png';
  const shots = [{ sceneId: 'cover', imageFile, imageText: 'WAS IST EIN VETORECHT?' }];
  const recognized = new Map([
    [path.resolve(root, imageFile), { lines: ['Was ist ein Vetorecht?'], text: normalizeImageText('Was ist ein Vetorecht?') }]
  ]);
  assert.deepEqual(evaluateImageTextFindings(shots, recognized, root), []);
});

test('Unerwarteter lesbarer Text in einer textfrei geplanten Bildphase wird blockiert', () => {
  const root = '/tmp/reel';
  const imageFile = 'images/Bild 07.png';
  const shots = [{ sceneId: 'scene-4b', imageFile, imageText: '' }];
  const recognized = new Map([
    [path.resolve(root, imageFile), { lines: ['GLOBAL POWER'], text: normalizeImageText('GLOBAL POWER') }]
  ]);
  const findings = evaluateImageTextFindings(shots, recognized, root);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].issue, 'unexpected-readable-text');
});

test('Reel-Render verdrahtet echten Bildtext als nicht umgehbaren Hard-Gate', async () => {
  const [renderer, rules] = await Promise.all([
    readFile('src/cli/render-reel.js', 'utf8'),
    readFile('config/visual-quality-rules.json', 'utf8').then(JSON.parse)
  ]);
  assert.match(renderer, /verifyRenderedImageText/);
  assert.match(renderer, /auch mit --force nicht umgangen/);
  assert.equal(rules.renderedImageText.verifyPlannedTextIsVisible, true);
  assert.equal(rules.renderedImageText.rejectUnexpectedReadableTextWhenPlanIsEmpty, true);
  assert.equal(rules.renderedImageText.forceCannotBypass, true);
});

test('YouTube-Audio nutzt denselben 1,10x-Pausenfilter wie Reel-Audio', () => {
  assert.equal(AUDIO_PACING_STYLE.playbackRate, 1.1);
  assert.equal(AUDIO_PACING_STYLE.preservePitch, true);
  const filter = buildAudioPacingFilter({ playbackRate: AUDIO_PACING_STYLE.playbackRate });
  assert.match(filter, /silenceremove=/);
  assert.match(filter, /atempo=1\.1/);
  assert.match(filter, /areverse/);
  assert.match(filter, /loudnorm=I=-16:TP=-1\.5/);
});

test('YouTube optimiert Audio vor Whisper-Alignment und prüft es vor der Timeline', async () => {
  const [autoAlign, phase3, workflow] = await Promise.all([
    readFile('src/cli/auto-align-youtube.js', 'utf8'),
    readFile('src/cli/phase3-youtube.js', 'utf8'),
    readFile('youtube/YOUTUBE_WORKFLOW.md', 'utf8')
  ]);
  const optimizeAt = autoAlign.indexOf('await optimizeYoutubeVoiceover');
  const alignAt = autoAlign.indexOf('await alignYoutubeProject');
  assert.ok(optimizeAt >= 0 && alignAt > optimizeAt, 'YouTube-Audio muss vor Whisper-Alignment optimiert werden.');

  const policyAt = phase3.indexOf('validate-youtube-phase1-policy.js');
  const alignStepAt = phase3.indexOf('auto-align-youtube.js');
  const audioGateAt = phase3.indexOf('validate-youtube-audio.js');
  const timelineAt = phase3.indexOf('build-youtube-timeline.js');
  assert.ok(policyAt >= 0 && alignStepAt > policyAt, 'Visual-Policy-Gate muss vor Audioarbeit laufen.');
  assert.ok(audioGateAt > alignStepAt && timelineAt > audioGateAt, 'Audio-Hard-Gate muss nach Alignment und vor Timeline-Bau laufen.');

  assert.match(workflow, /1,10x/i);
  assert.match(workflow, /überlange Sprechpausen automatisch kürzen/i);
  assert.match(workflow, /Endstille entfernen/i);
  assert.match(workflow, /Whisper.*optimiert|erst danach.*Whisper/i);
});

test('Neue P0-Kernskripte sind syntaktisch gültig', () => {
  for (const file of [
    'src/core/image-text-ocr.js',
    'src/core/image-text-guard.js',
    'src/core/youtube-audio-optimizer.js',
    'src/cli/validate-youtube-audio.js',
    'src/cli/validate-youtube-phase1-policy.js',
    'src/cli/auto-align-youtube.js',
    'src/cli/phase3-youtube.js',
    'src/cli/render-reel.js'
  ]) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    assert.equal(result.status, 0, `${file}: ${result.stderr || result.stdout}`);
  }
});
