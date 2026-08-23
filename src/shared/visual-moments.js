function pad(value) {
  return String(value).padStart(2, '0');
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function defaultStartPercent(index, count) {
  if (index === 0) return 0;
  return index / count;
}

export function normalizeSceneImagePhases(scene) {
  const rawPhases = Array.isArray(scene?.imagePhases) && scene.imagePhases.length > 0
    ? scene.imagePhases
    : [{}];
  const count = rawPhases.length;

  const phases = rawPhases.map((rawPhase, index) => {
    const phaseOrder = index + 1;
    const primary = index === 0;
    const phaseId = String(rawPhase?.phaseId ?? `${scene.sceneId}-image-${pad(phaseOrder)}`).trim();
    let startPercent = finiteNumber(rawPhase?.startPercent);
    if (startPercent === null || startPercent < 0 || startPercent >= 1) {
      startPercent = defaultStartPercent(index, count);
    }
    if (primary) startPercent = 0;

    return {
      phaseId,
      targetId: primary ? scene.sceneId : phaseId,
      phaseOrder,
      primary,
      startPercent,
      promptFileName: String(
        rawPhase?.promptFileName ?? (primary ? 'image-prompt.txt' : `image-prompt-${pad(phaseOrder)}.txt`)
      ).trim(),
      expectedImageFileName: String(
        rawPhase?.expectedImageFileName ?? (
          primary
            ? scene.expectedImageFileName ?? `${scene.sceneId}.png`
            : `${scene.sceneId}-image-${pad(phaseOrder)}.png`
        )
      ).trim(),
      visualIdea: String(rawPhase?.visualIdea ?? (primary ? scene.visualIdea ?? '' : '')).trim(),
      imageText: String(rawPhase?.imageText ?? (primary ? scene.imageText ?? '' : '')).trim(),
      rationale: String(rawPhase?.rationale ?? '').trim(),
      imageStatus: String(rawPhase?.imageStatus ?? (primary ? scene.imageStatus ?? 'missing' : 'missing')).trim() || 'missing',
      assetVerification: rawPhase?.assetVerification ?? (primary ? scene.assetVerification ?? null : null)
    };
  });

  let previous = 0;
  for (let index = 0; index < phases.length; index += 1) {
    if (index === 0) {
      phases[index].startPercent = 0;
      previous = 0;
      continue;
    }

    const fallback = defaultStartPercent(index, phases.length);
    const value = phases[index].startPercent;
    const normalized = value > previous && value < 1 ? value : fallback;
    phases[index].startPercent = normalized > previous ? normalized : Math.min(0.99, previous + 0.01);
    previous = phases[index].startPercent;
  }

  return phases.map((phase, index) => ({
    ...phase,
    endPercent: index === phases.length - 1 ? 1 : phases[index + 1].startPercent
  }));
}

export function flattenSceneImagePhases(scenes) {
  const output = [];
  let globalOrder = 1;
  const orderedScenes = [...(scenes ?? [])].sort((left, right) => Number(left.order) - Number(right.order));

  for (const scene of orderedScenes) {
    const phases = normalizeSceneImagePhases(scene);
    for (const phase of phases) {
      output.push({
        ...phase,
        globalOrder,
        sceneId: scene.sceneId,
        sceneOrder: Number(scene.order),
        sceneTitle: scene.title ?? '',
        narration: scene.narration ?? '',
        audioCue: scene.audioCue ?? '',
        sceneVisualIdea: scene.visualIdea ?? '',
        sceneImageText: scene.imageText ?? ''
      });
      globalOrder += 1;
    }
  }

  return output;
}

export function plannedImageCount(scenes) {
  return flattenSceneImagePhases(scenes).length;
}

export function visualTargetMap(scenes) {
  return new Map(flattenSceneImagePhases(scenes).map((phase) => [phase.targetId, phase]));
}

export function syncSceneImagePhases(scene, phases) {
  const normalized = phases.map((phase, index) => ({
    phaseId: phase.phaseId ?? `${scene.sceneId}-image-${pad(index + 1)}`,
    order: index + 1,
    startPercent: Number(phase.startPercent ?? (index === 0 ? 0 : index / phases.length)),
    promptFileName: phase.promptFileName ?? (index === 0 ? 'image-prompt.txt' : `image-prompt-${pad(index + 1)}.txt`),
    expectedImageFileName: phase.expectedImageFileName ?? (index === 0 ? scene.expectedImageFileName ?? `${scene.sceneId}.png` : `${scene.sceneId}-image-${pad(index + 1)}.png`),
    visualIdea: phase.visualIdea ?? (index === 0 ? scene.visualIdea ?? '' : ''),
    imageText: phase.imageText ?? (index === 0 ? scene.imageText ?? '' : ''),
    rationale: phase.rationale ?? '',
    imageStatus: phase.imageStatus ?? 'missing',
    assetVerification: phase.assetVerification ?? null
  }));

  scene.imagePhases = normalized;
  scene.imageCount = normalized.length;
  if (normalized[0]) {
    scene.expectedImageFileName = normalized[0].expectedImageFileName;
    scene.imageStatus = normalized.every((phase) => phase.imageStatus === 'ready') ? 'ready' : 'missing';
    scene.assetVerification = normalized[0].assetVerification ?? null;
  }
  return scene;
}
