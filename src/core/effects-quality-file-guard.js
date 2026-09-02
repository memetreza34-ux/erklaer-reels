import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

import { normalizeSceneImagePhases } from '../shared/visual-moments.js';

const SFX_COVERAGE_SINCE = '2026-09-02';

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

export async function verifyFutureEffectsCoverage(reelDirectory) {
  const reel = await readJson(path.join(reelDirectory, 'reel.json'), {});
  const date = String(reel?.date ?? '');
  const required = date >= SFX_COVERAGE_SINCE;
  if (!required) {
    return { required: false, passed: true, findings: [], reason: 'Archiv-Reel vor der neuen SFX-Coverage-Regel.' };
  }

  const scenes = await readJson(path.join(reelDirectory, 'scenes', 'scene-index.json'), []);
  const effectsPlan = await readJson(path.join(reelDirectory, 'effects', 'effects-plan.json'), null);
  const findings = [];

  if (!effectsPlan) {
    return {
      required: true,
      passed: false,
      findings: [{ issue: 'effects-plan-missing' }],
      reason: 'effects/effects-plan.json fehlt.'
    };
  }

  const effectByScene = new Map((effectsPlan.scenes ?? []).map((scene) => [scene.sceneId, scene]));

  scenes.forEach((scene, index) => {
    const effect = effectByScene.get(scene.sceneId);
    if (!effect) {
      findings.push({ sceneId: scene.sceneId, issue: 'effect-entry-missing' });
      return;
    }

    const sounds = Array.isArray(effect.soundEffects) ? effect.soundEffects : [];

    if (index > 0) {
      const hasSceneChangeSound = sounds.some((sound) => !String(sound.targetId ?? '').trim());
      if (!hasSceneChangeSound) findings.push({ sceneId: scene.sceneId, issue: 'scene-change-sfx-missing' });
    }

    const internalPhases = normalizeSceneImagePhases(scene).filter((phase) => Number(phase.phaseOrder) > 1);
    for (const phase of internalPhases) {
      const hasTargetSound = sounds.some((sound) => String(sound.targetId ?? '').trim() === String(phase.targetId));
      if (!hasTargetSound) {
        findings.push({ sceneId: scene.sceneId, targetId: phase.targetId, issue: 'internal-image-change-sfx-missing' });
      }
    }
  });

  return {
    required: true,
    passed: findings.length === 0,
    findings,
    reason: findings.length === 0
      ? 'Jeder Szenenwechsel und jeder interne Bildwechsel besitzt einen geplanten SFX.'
      : `${findings.length} Wechsel besitzen noch keinen verpflichtenden SFX.`
  };
}
