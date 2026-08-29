import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { inspectReelHook } from '../src/shared/reel-hook-quality.js';
import { findNarrationCueStartPercent } from '../src/shared/image-phase-cue.js';
import { buildMasterTimeline } from '../src/core/timeline.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

test('Hook-Gate akzeptiert Neugier und blockiert generische Einleitung', () => {
  assert.equal(inspectReelHook({
    narration: 'Südafrika hat nicht nur eine Hauptstadt. Tatsächlich verteilt das Land seine wichtigsten Staatsaufgaben auf drei verschiedene Städte.',
    imageText: 'WARUM DREI HAUPTSTÄDTE?'
  }).passed, true);
  assert.equal(inspectReelHook({
    narration: 'In diesem Video schauen wir uns heute ein interessantes Thema aus der Geografie einmal genauer an.',
    imageText: 'DAS THEMA'
  }).passed, false);
});

test('Planungswert einer Bildphase stammt aus ihrem gesprochenen Cue', () => {
  const narration = 'Pretoria wurde zum Verwaltungszentrum. Dort sitzen heute die nationale Regierung, viele Ministerien und die Präsidentschaft in den Union Buildings.';
  const value = findNarrationCueStartPercent(narration, 'Regierung, viele');
  assert.ok(value > 0.4 && value < 0.55);
  assert.equal(findNarrationCueStartPercent(narration, 'nicht gesprochen'), null);
});

async function buildAudioSyncedFixture(withExactPhaseCue) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'erklaer-phase-audio-'));
  const durations = [5.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 7];
  const starts = [];
  let cursor = 0;
  for (const duration of durations) { starts.push(cursor); cursor += duration; }
  const scenes = durations.map((duration, index) => {
    const sceneId = `scene-${String(index + 1).padStart(2, '0')}`;
    const scene = {
      sceneId,
      order: index + 1,
      title: index === 0 ? 'Hook' : `Szene ${index + 1}`,
      narration: index === 1
        ? 'Erster Teil erklärt die Ausgangslage. Zweiter Moment zeigt den wichtigen Wechsel klar.'
        : `Sprechertext für ${sceneId} mit genügend Wörtern für diesen Testlauf.`,
      audioCue: index === 0 ? 'Sprechertext für' : index === 1 ? 'Erster Teil' : `Sprechertext für`,
      leadInSeconds: 0.2,
      durationSeconds: duration,
      subtitleCues: [],
      expectedImageFileName: `${sceneId}.png`,
      imageStatus: 'ready'
    };
    if (index === 1) {
      scene.imagePhases = [
        {
          phaseId: 'scene-02-image-01', order: 1, startPercent: 0,
          expectedImageFileName: 'scene-02.png', imageStatus: 'ready', audioCue: 'Erster Teil', timingBasis: 'scene-start'
        },
        {
          phaseId: 'scene-02-image-02', order: 2, startPercent: 0.5,
          expectedImageFileName: 'scene-02-2.png', imageStatus: 'ready', audioCue: 'Zweiter Moment', timingBasis: 'narration-audio-cue'
        }
      ];
    }
    return scene;
  });

  await mkdir(path.join(root, 'audio'), { recursive: true });
  await writeFile(path.join(root, 'audio', 'voiceover.wav'), 'dummy');
  await writeJson(path.join(root, 'reel.json'), { reelId: 'reel-01_test', targetDurationSeconds: 58, subtitlesEnabled: false, imageCountMode: 'one-hook-two-standard' });
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), scenes);
  await writeJson(path.join(root, 'subtitles', 'subtitle-plan.json'), { enabled: false, cues: [] });
  await writeJson(path.join(root, 'effects', 'effects-plan.json'), { scenes: [] });
  await writeJson(path.join(root, 'assets-manifest.json'), {
    audio: { expectedFile: 'audio/voiceover.wav', status: 'ready' },
    scenes: scenes.map((scene) => ({ sceneId: scene.sceneId, expectedFile: `scenes/${scene.sceneId}/${scene.expectedImageFileName}`, status: 'ready' })),
    visuals: [
      { targetId: 'scene-02', expectedFile: 'scenes/scene-02/scene-02.png', status: 'ready' },
      { targetId: 'scene-02-image-02', expectedFile: 'scenes/scene-02/scene-02-2.png', status: 'ready' }
    ]
  });
  await writeJson(path.join(root, 'status.json'), {});
  await writeJson(path.join(root, 'timeline', 'audio-sync.json'), {
    version: 3,
    audioDurationSeconds: 58,
    cueTimings: scenes.map((scene, index) => ({
      sceneId: scene.sceneId,
      audioCue: scene.audioCue,
      cueTimeSeconds: index === 0 ? 0 : starts[index] + 0.2,
      leadInSeconds: 0.2,
      confidence: 1
    })),
    phaseCueTimings: withExactPhaseCue ? [{
      targetId: 'scene-02-image-02', sceneId: 'scene-02', phaseId: 'scene-02-image-02',
      audioCue: 'Zweiter Moment', cueTimeSeconds: 8.8, confidence: 1
    }] : []
  });
  return root;
}

test('finaler interner Bildschnitt nutzt den echten Audio-Zeitpunkt', async () => {
  const root = await buildAudioSyncedFixture(true);
  const result = await buildMasterTimeline(root, { probeAudio: false });
  const phase = result.timeline.scenes[1].imagePhases[1];
  assert.equal(phase.startSeconds, 8.8);
  assert.equal(phase.timingStatus, 'exact-audio-cue');
  assert.equal(result.timeline.timingStatus, 'audio-synced');
  assert.equal(result.timeline.imageCountMode, 'one-hook-two-standard');
  const saved = JSON.parse(await readFile(path.join(root, 'timeline', 'audio-sync.json'), 'utf8'));
  assert.equal(saved.version, 3);
  assert.equal(saved.phaseCueTimings[0].audioCue, 'Zweiter Moment');
});

test('fehlender echter Bildphasen-Zeitpunkt verhindert audio-synced', async () => {
  const root = await buildAudioSyncedFixture(false);
  const result = await buildMasterTimeline(root, { probeAudio: false });
  const phase = result.timeline.scenes[1].imagePhases[1];
  assert.equal(phase.timingStatus, 'planned-cue-fallback');
  assert.equal(result.timeline.timingStatus, 'audio-duration-synced');
  const check = result.qualityReport.checks.find((entry) => entry.id === 'exact-image-phase-audio-sync');
  assert.equal(check.passed, false);
});
