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
  const starts = [0, 5.5, 12, 18.5, 25, 31.5, 38, 44.5, 51];
  const scenes = starts.map((_, index) => {
    const sceneId = `scene-${String(index + 1).padStart(2, '0')}`;
    const base = {
      sceneId,
      order: index + 1,
      title: index === 0 ? 'Hook' : index === starts.length - 1 ? 'Abschluss' : `Szene ${index + 1}`,
      narration: `Sprechertext für ${sceneId}`,
      audioCue: `Cue ${index + 1}`,
      leadInSeconds: 0.2,
      durationSeconds: index === 0 ? 5.5 : index === starts.length - 1 ? 7 : 6.5,
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

test('zwei Bildphasen pro Szene sind der Normalfall und laufen sauber durch', async () => {
  // Zwei Bilder auf 6,5 Sekunden: rund 3,25 Sekunden je Bild.
  const root = await buildReel([0, 0.5]);
  const result = await buildMasterTimeline(root, { strict: false, probeAudio: false });

  const scene = result.timeline.scenes.find((entry) => entry.sceneId === 'scene-02');
  assert.equal(scene.imagePhases.length, 2);

  const check = result.qualityReport.checks.find((entry) => entry.id === 'scene-02-image-phase-duration');
  assert.ok(check, 'Die Phasendauer muss geprüft werden');
  assert.equal(check.passed, true, check?.message);
});

test('blockiert eine Bildphase, die zu kurz zum Erfassen ist', async () => {
  // Drei Phasen auf 6,5 Sekunden: gut zwei Sekunden je Bild, unter der Grenze von drei.
  const root = await buildReel([0, 0.34, 0.67]);
  const result = await buildMasterTimeline(root, { strict: false, probeAudio: false });

  const check = result.qualityReport.checks.find((entry) => entry.id === 'scene-02-image-phase-duration');
  assert.ok(check);
  assert.equal(check.passed, false);
  assert.equal(check.level, 'error');
  assert.match(check.message, /mindestens 3 Sekunden/);
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
  assert.ok(interval.max <= 4.5, 'Ein Bild darf nicht beliebig lange stehen bleiben');
});

test('reel.json nennt die tatsächliche Bildanzahl, nicht die Szenenzahl', async () => {
  const { createReelWorkspace } = await import('../src/core/workspace.js');
  const { mkdtemp, readFile, rm } = await import('node:fs/promises');
  const os = await import('node:os');

  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-count-'));
  try {
    const result = await createReelWorkspace({
      title: 'Warum haben manche Länder zwei Hauptstädte?',
      script: 'Dieses Rohscript wird später zu einem vollständigen Ein-Minuten-Reel erweitert und dient als Platzhalter.',
      date: new Date('2026-09-21T12:00:00'),
      outputRoot
    });

    const reel = JSON.parse(await readFile(path.join(result.reelDirectory, 'reel.json'), 'utf8'));
    const scenes = JSON.parse(await readFile(path.join(result.reelDirectory, 'scenes', 'scene-index.json'), 'utf8'));
    const tatsaechlich = scenes.reduce((summe, szene) => summe + szene.imagePhases.length, 0);

    // Vorher stand hier die Szenenzahl, obwohl doppelt so viele Bildphasen angelegt wurden.
    assert.equal(reel.plannedImageCount, tatsaechlich);
    assert.equal(reel.plannedImageCount, 1 + (reel.sceneCount - 1) * 2);
    assert.equal(reel.imageCountMode, 'one-hook-two-standard');

    const status = JSON.parse(await readFile(path.join(result.reelDirectory, 'status.json'), 'utf8'));
    assert.equal(status.plannedImageCount, tatsaechlich);
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});

test('neue Reels dürfen die Bildregel nicht unterlaufen', async () => {
  const { createReelWorkspace } = await import('../src/core/workspace.js');
  const { validateReelContent } = await import('../src/core/content-validator.js');
  const { mkdtemp, readFile, writeFile, rm } = await import('node:fs/promises');
  const os = await import('node:os');

  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-haertung-'));
  try {
    const result = await createReelWorkspace({
      title: 'Warum haben manche Länder zwei Hauptstädte?',
      script: 'Dieses Rohscript wird später zu einem vollständigen Ein-Minuten-Reel erweitert und dient als Platzhalter.',
      date: new Date('2026-10-05T12:00:00'),
      outputRoot
    });

    const indexPath = path.join(result.reelDirectory, 'scenes', 'scene-index.json');
    const scenes = JSON.parse(await readFile(indexPath, 'utf8'));

    // Eine dritte Bildphase und der alte Modus: früher hätte der Validator beides
    // durchgewinkt, weil er 1 bis 3 Phasen und individual-per-reel erlaubte.
    scenes[2].imagePhases.push({
      phaseId: `${scenes[2].sceneId}-image-03`,
      order: 3,
      startPercent: 0.75,
      promptFileName: 'image-prompt-03.txt',
      expectedImageFileName: `${scenes[2].sceneId}-3.png`,
      visualIdea: '', imageText: '', rationale: '', imageStatus: 'missing', assetVerification: null
    });
    scenes[2].imageCount = 3;
    await writeFile(indexPath, `${JSON.stringify(scenes, null, 2)}\n`, 'utf8');
    await writeFile(path.join(result.reelDirectory, 'scenes', scenes[2].sceneId, 'scene.json'),
      `${JSON.stringify(scenes[2], null, 2)}\n`, 'utf8');

    const reelPath = path.join(result.reelDirectory, 'reel.json');
    const reel = JSON.parse(await readFile(reelPath, 'utf8'));
    reel.imageCountMode = 'individual-per-reel';
    await writeFile(reelPath, `${JSON.stringify(reel, null, 2)}\n`, 'utf8');

    const bericht = await validateReelContent(result.reelDirectory);
    const fehler = bericht.checks.filter((check) => check.passed === false && check.level === 'error');
    const meldungen = fehler.map((check) => check.message).join(' ');

    assert.match(meldungen, /genau 2 Bildphasen/, 'Die dritte Bildphase muss auffallen');
    assert.match(meldungen, /one-hook-two-standard/, 'Der alte Modus muss abgelehnt werden');
    assert.match(meldungen, /17 Bilder vorgesehen/, 'Die Gesamtzahl muss geprüft werden');
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});

test('die Szenendauer-Erwartung stammt aus den Quality-Gates, nicht aus fest verdrahteten Zahlen', async () => {
  const { readFile } = await import('node:fs/promises');
  const validator = await readFile(path.join(REPO_ROOT, 'src', 'core', 'content-validator.js'), 'utf8');
  const gates = JSON.parse(await readFile(path.join(REPO_ROOT, 'config', 'production-quality-gates.json'), 'utf8'));

  assert.match(validator, /sceneTiming/, 'Der Validator muss die Quality-Gates lesen');
  // Die alte Pauschalspanne widersprach der Single Source of Truth.
  assert.ok(!/duration >= 3\.2 && duration <= 5\.5/.test(validator), 'Keine fest verdrahtete 3,2–5,5-Spanne mehr');
  assert.equal(gates.sceneTiming.standardSeconds.min, 6);
  assert.equal(gates.sceneTiming.hookSeconds.max, 6);
});

test('eine planmäßige Hook bekommt keine Warnung zu einem zweiten Bild', async () => {
  const { createReelWorkspace } = await import('../src/core/workspace.js');
  const { validateReelContent } = await import('../src/core/content-validator.js');
  const { mkdtemp, readFile, writeFile, rm } = await import('node:fs/promises');
  const os = await import('node:os');

  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-hook-'));
  try {
    const result = await createReelWorkspace({
      title: 'Warum haben manche Länder zwei Hauptstädte?',
      script: 'Dieses Rohscript wird später zu einem vollständigen Ein-Minuten-Reel erweitert und dient als Platzhalter.',
      date: new Date('2026-10-12T12:00:00'),
      outputRoot
    });

    const indexPath = path.join(result.reelDirectory, 'scenes', 'scene-index.json');
    const scenes = JSON.parse(await readFile(indexPath, 'utf8'));
    scenes.forEach((szene, i) => {
      szene.durationSeconds = i === 0 ? 5.5 : i === scenes.length - 1 ? 7 : 6.5;
    });
    await writeFile(indexPath, `${JSON.stringify(scenes, null, 2)}\n`, 'utf8');
    for (const szene of scenes) {
      await writeFile(path.join(result.reelDirectory, 'scenes', szene.sceneId, 'scene.json'),
        `${JSON.stringify(szene, null, 2)}\n`, 'utf8');
    }

    const bericht = await validateReelContent(result.reelDirectory);
    const hookWarnung = bericht.checks.find((check) => check.id === 'scene-01-long-static-review');

    // Die Hook hat planmäßig ein Bild bei 4,5 bis 6 Sekunden. Eine Warnung, die ein
    // zweites Bild anregt, widerspräche der Regel, die sie erfüllt.
    assert.ok(hookWarnung, 'Der Check muss weiterhin existieren');
    assert.equal(hookWarnung.passed, true, hookWarnung.message);
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});
