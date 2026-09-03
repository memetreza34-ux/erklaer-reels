import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

import { normalizeSceneImagePhases } from '../shared/visual-moments.js';
import { loadSoundLibrary } from './sound-library.js';

const EFFECTS_HARD_GATE_SINCE = '2026-09-02';

const MOTION_ALIASES = Object.freeze({
  'gentle-pan': 'ken-burns',
  'gentle-push-in': 'subtle-push-in',
  'medium-push-in': 'slow-zoom-in',
  'close-up-push-in': 'subtle-push-in',
  'slow-push-in': 'slow-zoom-in',
  'push-in': 'subtle-push-in',
  'pull-out': 'subtle-pull-out'
});

const MOTION_DEFAULTS = {
  none: { startScale: 1, endScale: 1, panXPercent: 0, panYPercent: 0 },
  'subtle-push-in': { startScale: 1, endScale: 1.04, panXPercent: 0, panYPercent: 0 },
  'subtle-pull-out': { startScale: 1.04, endScale: 1, panXPercent: 0, panYPercent: 0 },
  'slow-zoom-in': { startScale: 1, endScale: 1.05, panXPercent: 0, panYPercent: 0 },
  'slow-zoom-out': { startScale: 1.05, endScale: 1, panXPercent: 0, panYPercent: 0 },
  'pan-left': { startScale: 1.04, endScale: 1.04, panXPercent: -2, panYPercent: 0 },
  'pan-right': { startScale: 1.04, endScale: 1.04, panXPercent: 2, panYPercent: 0 },
  'pan-up': { startScale: 1.04, endScale: 1.04, panXPercent: 0, panYPercent: -2 },
  'pan-down': { startScale: 1.04, endScale: 1.04, panXPercent: 0, panYPercent: 2 },
  'ken-burns': { startScale: 1.02, endScale: 1.06, panXPercent: 1.5, panYPercent: 0 }
};

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath, fallback = null) {
  if (!(await exists(filePath))) return fallback;
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function numberOr(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function canonicalMotionType(value) {
  const raw = String(value ?? '').trim();
  return MOTION_ALIASES[raw] ?? raw;
}

function effectiveMotion(motion = {}) {
  const requestedType = String(motion.type ?? '').trim();
  const type = canonicalMotionType(requestedType);
  const defaults = MOTION_DEFAULTS[type] ?? MOTION_DEFAULTS.none;
  const startScale = numberOr(motion.startScale, defaults.startScale);
  const endScale = numberOr(motion.endScale, defaults.endScale);
  const panXPercent = numberOr(motion.panXPercent, defaults.panXPercent);
  const panYPercent = numberOr(motion.panYPercent, defaults.panYPercent);
  const scaleDelta = Math.abs(endScale - startScale);
  const panDelta = Math.max(Math.abs(panXPercent), Math.abs(panYPercent));
  return {
    requestedType,
    type,
    aliased: requestedType !== type,
    startScale,
    endScale,
    panXPercent,
    panYPercent,
    scaleDelta,
    panDelta,
    visiblyMoving: type !== 'none' && (scaleDelta >= 0.015 || panDelta >= 0.5)
  };
}

export async function verifyFutureEffectsCoverage(reelDirectory) {
  const reel = await readJson(path.join(reelDirectory, 'reel.json'), {});
  const date = String(reel?.date ?? '');
  const required = date >= EFFECTS_HARD_GATE_SINCE;
  if (!required) {
    return { required: false, passed: true, findings: [], reason: 'Archiv-Reel vor der verpflichtenden Motion-/SFX-Regel.' };
  }

  const scenes = await readJson(path.join(reelDirectory, 'scenes', 'scene-index.json'), []);
  const effectsPlan = await readJson(path.join(reelDirectory, 'effects', 'effects-plan.json'), null);
  const effectsRules = await readJson(path.resolve('config', 'effects-rules.json'), {});
  const soundLibrary = await loadSoundLibrary();
  const findings = [];

  if (!effectsPlan) {
    return {
      required: true,
      passed: false,
      findings: [{ issue: 'effects-plan-missing' }],
      reason: 'effects/effects-plan.json fehlt.'
    };
  }

  if (effectsPlan.enabled === false) findings.push({ issue: 'effects-plan-disabled' });
  if (effectsPlan.voiceoverPriority !== true) findings.push({ issue: 'voiceover-priority-missing' });
  if (effectsPlan.backgroundMusic?.enabled === true) findings.push({ issue: 'background-music-enabled' });

  const allowedMotions = new Set(effectsRules.motionEffects?.allowedTypes ?? Object.keys(MOTION_DEFAULTS));
  const knownSoundTypes = new Set((soundLibrary.types ?? []).map((entry) => String(entry.type)));
  const minScale = Number(effectsRules.motionEffects?.zoomScale?.min ?? 0.94);
  const maxScale = Number(effectsRules.motionEffects?.zoomScale?.max ?? 1.06);
  const maxPan = Number(effectsRules.motionEffects?.maximumPanPercent ?? 3);
  const minVolume = Number(effectsRules.soundEffects?.recommendedVolume?.min ?? 0.18);
  const maxVolume = Number(effectsRules.soundEffects?.recommendedVolume?.max ?? 0.3);
  const maxSounds = Number(effectsRules.soundEffects?.maximumPerScene ?? 3);
  const effectByScene = new Map((effectsPlan.scenes ?? []).map((scene) => [scene.sceneId, scene]));

  if ((effectsPlan.scenes ?? []).length !== scenes.length) {
    findings.push({ issue: 'effects-scene-count-mismatch', expected: scenes.length, actual: (effectsPlan.scenes ?? []).length });
  }

  scenes.forEach((scene, index) => {
    const effect = effectByScene.get(scene.sceneId);
    if (!effect) {
      findings.push({ sceneId: scene.sceneId, issue: 'effect-entry-missing' });
      return;
    }

    const motion = effectiveMotion(effect.cameraMotion);
    if (!allowedMotions.has(motion.type)) {
      findings.push({ sceneId: scene.sceneId, issue: 'camera-motion-unknown', type: motion.requestedType || '(leer)' });
    } else if (!motion.visiblyMoving) {
      findings.push({ sceneId: scene.sceneId, issue: 'camera-motion-static', type: motion.type || '(leer)' });
    }
    if (motion.startScale < minScale || motion.startScale > maxScale || motion.endScale < minScale || motion.endScale > maxScale) {
      findings.push({ sceneId: scene.sceneId, issue: 'camera-motion-zoom-out-of-range', startScale: motion.startScale, endScale: motion.endScale });
    }
    if (Math.abs(motion.panXPercent) > maxPan || Math.abs(motion.panYPercent) > maxPan) {
      findings.push({ sceneId: scene.sceneId, issue: 'camera-motion-pan-out-of-range', panXPercent: motion.panXPercent, panYPercent: motion.panYPercent });
    }

    const sounds = Array.isArray(effect.soundEffects) ? effect.soundEffects : [];
    if (sounds.length > maxSounds) {
      findings.push({ sceneId: scene.sceneId, issue: 'too-many-sound-effects', actual: sounds.length, maximum: maxSounds });
    }

    for (const [soundIndex, sound] of sounds.entries()) {
      const type = String(sound.type ?? '').trim();
      const volume = numberOr(sound.volume, soundLibrary.byType?.get(type)?.volume ?? soundLibrary.defaultVolume ?? 0.22);
      if (!knownSoundTypes.has(type)) {
        findings.push({ sceneId: scene.sceneId, soundIndex: soundIndex + 1, issue: 'sound-type-unknown', type: type || '(leer)' });
      }
      if (volume < minVolume || volume > maxVolume) {
        findings.push({ sceneId: scene.sceneId, soundIndex: soundIndex + 1, issue: 'sound-volume-out-of-range', volume });
      }
      if (String(sound.visualEvent ?? '').trim().length < 4) {
        findings.push({ sceneId: scene.sceneId, soundIndex: soundIndex + 1, issue: 'sound-visual-event-missing' });
      }
      if (String(sound.reason ?? '').trim().length < 4) {
        findings.push({ sceneId: scene.sceneId, soundIndex: soundIndex + 1, issue: 'sound-reason-missing' });
      }
    }

    if (index > 0) {
      const hasSceneChangeSound = sounds.some((sound) => {
        const targetId = String(sound.targetId ?? '').trim();
        const type = String(sound.type ?? '').trim();
        return !targetId && knownSoundTypes.has(type);
      });
      if (!hasSceneChangeSound) findings.push({ sceneId: scene.sceneId, issue: 'scene-change-sfx-missing' });
    }

    const internalPhases = normalizeSceneImagePhases(scene).filter((phase) => Number(phase.phaseOrder) > 1);
    for (const phase of internalPhases) {
      const targetSound = sounds.find((sound) => String(sound.targetId ?? '').trim() === String(phase.targetId));
      if (!targetSound) {
        findings.push({ sceneId: scene.sceneId, targetId: phase.targetId, issue: 'internal-image-change-sfx-missing' });
        continue;
      }
      const type = String(targetSound.type ?? '').trim();
      if (!knownSoundTypes.has(type)) {
        findings.push({ sceneId: scene.sceneId, targetId: phase.targetId, issue: 'internal-image-change-sfx-unknown', type });
      }
      const phaseCue = String(phase.audioCue ?? '').trim();
      const soundCue = String(targetSound.audioCue ?? '').trim();
      if (phaseCue && soundCue && phaseCue !== soundCue) {
        findings.push({ sceneId: scene.sceneId, targetId: phase.targetId, issue: 'internal-image-change-sfx-cue-mismatch', expected: phaseCue, actual: soundCue });
      }
    }
  });

  return {
    required: true,
    passed: findings.length === 0,
    findings,
    reason: findings.length === 0
      ? 'Jede narrative Szene besitzt sichtbare Kamerabewegung; bekannte Motion-Aliase werden kanonisch aufgelöst; jeder Szenenwechsel und jeder interne Bildwechsel besitzt einen gültigen SFX aus der zentralen Bibliothek.'
      : `${findings.length} verpflichtende Motion-/SFX-Prüfung(en) sind noch nicht erfüllt.`
  };
}
