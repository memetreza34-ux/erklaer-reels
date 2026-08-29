import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildMasterTimeline } from '../src/core/timeline.js';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

// Baut ein vollständiges Reel, bei dem eine Szene die angegebenen Bildphasen trägt.
async function buildReel(phaseStarts) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'erklaer-density-'));
  const starts = [0, 5, 10, 15, 20, 25, 30, 35, 40, 44, 48, 52];
  const scenes = starts.map((_, index) => {
    const sceneId = `scene-${String(index + 1).padStart(2, '0')}`;
    const base = {
      sceneId,
      order: index + 1,
      title: index === 0 ? 'Hook' : index === starts.length - 1 ? 'Abschluss' : `Szene ${index + 1}`,
      narration: `Sprechertext für ${sceneId}`,
      audioCue: `Cue ${index + 1}`,
      leadInSeconds: 0.2,
      durationSeconds: index === starts.length - 1 ? 5 : 4.4,
      subtitleCues: [],
      expectedImageFileName: `${sceneId}.png`
    };
    // Nur Szene 2 bekommt die zu prüfende Phasenaufteilung.
    if (index === 1) {
      base.imagePhases = phaseStarts.map((startPercent, phaseIndex) => ({
        phaseId: `${sceneId}-image-${String(phaseIndex + 1).padStart(2, '0')}`,
        order: phaseIndex + 1,
        startPercent,
        promptFileName: phaseIndex === 0 ? 'image-prompt.txt' : `image-prompt-0${phaseIndex + 1}.txt`,
        expectedImageFileName: `${sceneId}-${phaseIndex + 1}.png`
      }));
    }
    return base;
  });

  await mkdir(path.join(root, 'audio'), { recursive: true });
  await writeFile(path.join(root, 'audio', 'voiceover.wav'), 'dummy');
  await writeJson(path.join(root, 'reel.json'), { reelId: 'reel-01_test', targetDurationSeconds: 55 });
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), scenes);
  await writeJson(path.join(root, 'subtitles', 'subtitle-plan.json'), { cues: [] });
  await writeJson(path.join(root, 'effects', 'effects-plan.json'), {
    backgroundMusic: { enabled: false },
    scenes: scenes.map((scene, index) => ({
      sceneId: scene.sceneId,
      transitionIn: { type: index === 0 ? 'none' : 'cut', durationSeconds: 0 },
      cameraMotion: { type: 'none' },
      soundEffects: []
    }))
  });
  await writeJson(path.join(root, 'timeline', 'audio-sync.json'), {
    version: 2,
    audioDurationSeconds: 55,
    cueTimings: scenes.map((scene, index) => ({
      sceneId: scene.sceneId,
      audioCue: scene.audioCue,
      cueTimeSeconds: index === 0 ? 0 : starts[index] + 0.2,
      leadInSeconds: 0.2,
      confidence: 1
    }))
  });
  await writeJson(path.join(root, 'assets-manifest.json'), {
    audio: { expectedFile: 'audio/voiceover.wav', status: 'ready' },
    scenes: scenes.map((scene) => ({
      sceneId: scene.sceneId,
      expectedFile: `scenes/${scene.sceneId}/${scene.expectedImageFileName}`,
      status: 'ready'
    }))
  });
  await writeJson(path.join(root, 'status.json'), {});
  return root;
}

test('mehrere Bildphasen pro Szene sind der Normalfall und laufen sauber durch', async () => {
  // Drei Bilder auf 4,4 Sekunden: rund 1,5 Sekunden je Bild.
  const root = await buildReel([0, 0.34, 0.67]);
  const result = await buildMasterTimeline(root, { strict: false, probeAudio: false });

  const scene = result.timeline.scenes.find((entry) => entry.sceneId === 'scene-02');
  assert.equal(scene.imagePhases.length, 3);

  const check = result.qualityReport.checks.find((entry) => entry.id === 'scene-02-image-phase-duration');
  assert.ok(check, 'Die Phasendauer muss geprüft werden');
  assert.equal(check.passed, true, check?.message);
});

test('blockiert eine Bildphase, die zu kurz zum Erfassen ist', async () => {
  // Vier Phasen dicht gedrängt: die letzte bleibt weit unter einer Sekunde stehen.
  const root = await buildReel([0, 0.9, 0.94, 0.98]);
  const result = await buildMasterTimeline(root, { strict: false, probeAudio: false });

  const check = result.qualityReport.checks.find((entry) => entry.id === 'scene-02-image-phase-duration');
  assert.ok(check);
  assert.equal(check.passed, false);
  assert.equal(check.level, 'error');
  assert.match(check.message, /mindestens 1\.2 Sekunden/);
});

test('Regelwerk und Gate beschreiben dieselbe Untergrenze', async () => {
  const gates = JSON.parse(await readFile(path.join(REPO_ROOT, 'config', 'production-quality-gates.json'), 'utf8'));
  const rules = JSON.parse(await readFile(path.join(REPO_ROOT, 'config', 'content-rules.json'), 'utf8'));

  const minimum = gates.sceneTiming.minimumImagePhaseSeconds;
  const interval = rules.visualRules.visualChangeIntervalSeconds;

  assert.ok(minimum > 0);
  assert.ok(interval.min >= minimum, 'Das empfohlene Minimum darf nicht unter der harten Grenze liegen');
  assert.ok(interval.recommended >= interval.min && interval.recommended <= interval.max);
  // Ohne schnellen Wechsel bekäme jede Szene wieder nur ein Bild.
  assert.ok(interval.max <= 3.5, 'Der Wechsel muss schnell genug für mehrere Bilder pro Szene bleiben');
});
