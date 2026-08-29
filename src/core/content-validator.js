import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { FIXED_VISUAL_STYLE_ID } from '../shared/fixed-visual-world.js';

import { inspectSourcesMarkdown } from './source-quality.js';
import { normalizeSceneImagePhases, plannedImageCount } from '../shared/visual-moments.js';

// Reels vor diesem Datum stammen aus der Zeit, in der die Bildwelt bewusst
// unbesetzt war oder noch eine der alten IDs trug. Ab hier gilt die eine feste Welt.
const FIXED_VISUAL_WORLD_SINCE = '2026-08-28';

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readText(filePath) {
  return (await readFile(filePath, 'utf8')).trim();
}

async function readJson(filePath, fallback = null) {
  if (!(await exists(filePath))) return fallback;
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function addCheck(checks, id, passed, message, level = 'error') {
  checks.push({ id, passed, level, message });
}

function wordCount(value) {
  return String(value ?? '').trim().split(/\s+/).filter(Boolean).length;
}

function comparableScene(scene) {
  return {
    sceneId: scene.sceneId,
    order: scene.order,
    title: String(scene.title ?? '').trim(),
    narration: String(scene.narration ?? '').trim(),
    imageText: String(scene.imageText ?? '').trim(),
    visualIdea: String(scene.visualIdea ?? '').trim(),
    continuityNotes: String(scene.continuityNotes ?? '').trim(),
    audioCue: String(scene.audioCue ?? '').trim(),
    leadInSeconds: Number(scene.leadInSeconds ?? 0),
    durationSeconds: Number(scene.durationSeconds ?? 0),
    expectedImageFileName: String(scene.expectedImageFileName ?? '').trim(),
    imageCount: scene.imageCount ?? null,
    imagePhases: Array.isArray(scene.imagePhases) ? scene.imagePhases : null
  };
}

function phasePromptPath(sceneDirectory, phase) {
  return path.join(sceneDirectory, phase.promptFileName);
}

function usesFixedVisualWorld(reel) {
  const date = String(reel?.date ?? '').trim();
  return Boolean(date) && date >= FIXED_VISUAL_WORLD_SINCE;
}

export async function validateReelContent(reelDirectory, { strict = false } = {}) {
  const checks = [];
  const reelPath = path.join(reelDirectory, 'reel.json');
  const sceneIndexPath = path.join(reelDirectory, 'scenes', 'scene-index.json');
  const effectsRulesPath = path.resolve('config', 'effects-rules.json');
  const subtitlePlanPath = path.join(reelDirectory, 'subtitles', 'subtitle-plan.json');
  const effectsPlanPath = path.join(reelDirectory, 'effects', 'effects-plan.json');

  if (!(await exists(reelPath))) {
    addCheck(checks, 'reel-json', false, 'reel.json fehlt.');
    return finalize(reelDirectory, checks);
  }
  if (!(await exists(sceneIndexPath))) {
    addCheck(checks, 'scene-index', false, 'scenes/scene-index.json fehlt.');
    return finalize(reelDirectory, checks);
  }

  const reel = await readJson(reelPath);
  const sceneIndex = await readJson(sceneIndexPath, []);
  const effectsRules = await readJson(effectsRulesPath, {});
  const totalPlannedImages = plannedImageCount(sceneIndex);
  const fixedVisualWorldRequired = usesFixedVisualWorld(reel);
  const styleId = String(reel.visualStyleId ?? '').trim();
  const styleReason = String(reel.visualStyleReason ?? '').trim();

  addCheck(checks, 'scene-count-range', Number.isInteger(reel.sceneCount) && reel.sceneCount >= 8 && reel.sceneCount <= 10,
    'Die narrative Szenenanzahl muss zwischen 8 und 10 liegen.');
  addCheck(checks, 'scene-count-match', sceneIndex.length === reel.sceneCount,
    `scene-index.json enthält ${sceneIndex.length} statt ${reel.sceneCount} narrativen Szenen.`);
  addCheck(checks, 'topic-area', String(reel.topicArea ?? '').trim().length >= 5,
    'reel.json.topicArea fehlt.');

  if (fixedVisualWorldRequired) {
    addCheck(checks, 'visual-world-fixed', styleId === FIXED_VISUAL_STYLE_ID,
      `Neue Reels müssen die eine feste Bildwelt tragen: visualStyleId muss "${FIXED_VISUAL_STYLE_ID}" sein.`);
    addCheck(checks, 'visual-world-reason-present', styleReason.length >= 20,
      'reel.json.visualStyleReason muss die feste Bildwelt kurz begründen.');
  } else {
    addCheck(checks, 'legacy-visual-world-nonblocking', true,
      'Historische Reels dürfen ihre alten Stilfelder als Archivdaten behalten.', 'warning');
  }

  addCheck(checks, 'subtitles-disabled', reel.subtitlesEnabled === false,
    'Untertitel müssen für dieses Format deaktiviert sein.');
  addCheck(checks, 'image-count-mode', !reel.imageCountMode || reel.imageCountMode === 'individual-per-reel',
    'imageCountMode darf nur individual-per-reel oder bei alten Reels leer sein.');
  addCheck(checks, 'image-count-range', totalPlannedImages >= sceneIndex.length && totalPlannedImages <= sceneIndex.length * 3,
    `Geplant sind ${totalPlannedImages} Bilder für ${sceneIndex.length} Szenen; erlaubt sind ein bis drei Bildphasen pro Szene.`);
  addCheck(checks, 'planned-image-count-match', reel.plannedImageCount == null || Number(reel.plannedImageCount) === totalPlannedImages,
    `reel.json.plannedImageCount stimmt nicht mit den ${totalPlannedImages} geplanten Bildphasen überein.`, reel.plannedImageCount == null ? 'warning' : 'error');
  addCheck(checks, 'motion-effects-enabled', reel.motionEffectsEnabled !== false,
    'Die Bewegungsplanung sollte standardmäßig aktiviert sein.', 'warning');
  addCheck(checks, 'sound-effects-enabled', reel.soundEffectsEnabled !== false,
    'Die Soundeffektplanung sollte standardmäßig aktiviert sein.', 'warning');
  addCheck(checks, 'background-music-disabled', reel.backgroundMusicEnabled !== true,
    'Hintergrundmusik sollte standardmäßig ausgeschaltet bleiben.', 'warning');

  const scriptContents = {};
  for (const scriptName of ['final-script.txt', 'voice-script.txt']) {
    const scriptPath = path.join(reelDirectory, 'script', scriptName);
    const present = await exists(scriptPath);
    const content = present ? await readText(scriptPath) : '';
    const words = wordCount(content);
    scriptContents[scriptName] = content;
    addCheck(checks, `script-${scriptName}`, present && content.length >= 120,
      `${scriptName} fehlt oder ist zu kurz.`);
    addCheck(checks, `script-${scriptName}-word-count`, words >= 155 && words <= 175,
      `${scriptName} enthält ${words} Wörter; Ziel sind 155–175 Wörter für ungefähr eine Minute bei 1,10x.`);
  }
  addCheck(checks, 'scripts-identical', scriptContents['final-script.txt'] === scriptContents['voice-script.txt'],
    'final-script.txt und voice-script.txt müssen denselben finalen Sprechertext enthalten.', 'warning');

  let totalDuration = 0;
  let validatedPromptCount = 0;
  const usedImageTexts = new Map();

  for (let index = 0; index < sceneIndex.length; index += 1) {
    const indexedScene = sceneIndex[index];
    const expectedId = `scene-${String(index + 1).padStart(2, '0')}`;
    addCheck(checks, `${expectedId}-stable-id`, indexedScene.sceneId === expectedId,
      `Erwartet wurde ${expectedId}, gefunden wurde ${indexedScene.sceneId ?? 'keine ID'}.`);

    const sceneDirectory = path.join(reelDirectory, 'scenes', expectedId);
    const scenePath = path.join(sceneDirectory, 'scene.json');

    if (!(await exists(scenePath))) {
      addCheck(checks, `${expectedId}-json`, false, `${expectedId}/scene.json fehlt.`);
      continue;
    }

    const scene = await readJson(scenePath, {});
    const duration = Number(scene.durationSeconds ?? 0);
    const leadInSeconds = Number(scene.leadInSeconds ?? 0);
    totalDuration += Number.isFinite(duration) ? duration : 0;

    addCheck(checks, `${expectedId}-index-sync`,
      JSON.stringify(comparableScene(indexedScene)) === JSON.stringify(comparableScene(scene)),
      `${expectedId}: scene-index.json und scene.json enthalten unterschiedliche Szenendaten.`);
    addCheck(checks, `${expectedId}-title`, String(scene.title ?? '').trim().length >= 3,
      `${expectedId}: title fehlt.`);
    addCheck(checks, `${expectedId}-narration`, String(scene.narration ?? '').trim().length >= 10,
      `${expectedId}: narration fehlt oder ist zu kurz.`);
    addCheck(checks, `${expectedId}-visual-idea`, String(scene.visualIdea ?? '').trim().length >= 20,
      `${expectedId}: visualIdea fehlt oder ist zu kurz.`);
    addCheck(checks, `${expectedId}-continuity`, String(scene.continuityNotes ?? '').trim().length >= 10,
      `${expectedId}: continuityNotes fehlen oder sind zu kurz.`);
    addCheck(checks, `${expectedId}-audio-cue`, String(scene.audioCue ?? '').trim().length >= 2,
      `${expectedId}: audioCue fehlt. Der Szenenwechsel kann dadurch nicht sauber am Sprechertext ausgerichtet werden.`, 'warning');
    addCheck(checks, `${expectedId}-lead-in`, Number.isFinite(leadInSeconds) && leadInSeconds >= 0.1 && leadInSeconds <= 0.3,
      `${expectedId}: leadInSeconds sollte zwischen 0,1 und 0,3 liegen.`, 'warning');
    addCheck(checks, `${expectedId}-duration`, Number.isFinite(duration) && duration >= 2.5 && duration <= 8,
      `${expectedId}: durationSeconds muss zwischen 2,5 und 8 liegen.`);
    addCheck(checks, `${expectedId}-preferred-duration`, Number.isFinite(duration) && duration >= 3.2 && duration <= 5.5,
      `${expectedId}: Für den gewünschten Rhythmus sind ungefähr 3,2–5,5 Sekunden empfehlenswert.`, 'warning');

    const phases = normalizeSceneImagePhases(scene);
    addCheck(checks, `${expectedId}-image-phase-count`, phases.length >= 1 && phases.length <= 3,
      `${expectedId}: Eine Szene darf ein bis drei Bildphasen besitzen.`);
    addCheck(checks, `${expectedId}-image-count-field`, scene.imageCount == null || Number(scene.imageCount) === phases.length,
      `${expectedId}: imageCount stimmt nicht mit imagePhases überein.`, scene.imageCount == null ? 'warning' : 'error');
    addCheck(checks, `${expectedId}-first-phase-at-zero`, phases[0]?.startPercent === 0,
      `${expectedId}: Die erste Bildphase muss bei startPercent 0 beginnen.`);

    for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex += 1) {
      const phase = phases[phaseIndex];
      const phaseLabel = `${expectedId}-image-${String(phaseIndex + 1).padStart(2, '0')}`;
      const promptPath = phasePromptPath(sceneDirectory, phase);
      const prompt = (await exists(promptPath)) ? await readText(promptPath) : '';
      const previousStart = phaseIndex === 0 ? -1 : phases[phaseIndex - 1].startPercent;

      addCheck(checks, `${phaseLabel}-start-percent`, phase.startPercent >= 0 && phase.startPercent < 1 && phase.startPercent > previousStart,
        `${phaseLabel}: startPercent muss innerhalb der Szene streng ansteigen.`);
      addCheck(checks, `${phaseLabel}-prompt`, prompt.length >= 180,
        `${phaseLabel}: ${phase.promptFileName} fehlt oder ist nicht detailliert genug.`);
      addCheck(checks, `${phaseLabel}-prompt-format`, /vertical\s+9:16|9:16/i.test(prompt),
        `${phaseLabel}: Der Bildprompt sollte das Format 9:16 ausdrücklich nennen.`, 'warning');
      addCheck(checks, `${phaseLabel}-visual-idea`, String(phase.visualIdea || scene.visualIdea || '').trim().length >= 20,
        `${phaseLabel}: visualIdea fehlt oder ist zu kurz.`);
      addCheck(checks, `${phaseLabel}-expected-file`, String(phase.expectedImageFileName ?? '').length >= 5,
        `${phaseLabel}: expectedImageFileName fehlt.`);
      if (prompt.length >= 180) validatedPromptCount += 1;

      const imageText = String(phase.imageText || '').trim().toUpperCase();
      if (imageText) {
        const previousVisual = usedImageTexts.get(imageText);
        addCheck(checks, `${phaseLabel}-image-text-unique`, !previousVisual,
          `${phaseLabel}: Der sichtbare Bildtext wurde bereits in ${previousVisual ?? 'keinem Bild'} verwendet.`, 'warning');
        usedImageTexts.set(imageText, phaseLabel);
        addCheck(checks, `${phaseLabel}-image-text-prompt`, prompt.toUpperCase().includes(imageText),
          `${phaseLabel}: imageText steht nicht exakt im Bildprompt.`, 'warning');
      }
    }

    addCheck(checks, `${expectedId}-long-static-review`, !(duration >= 4 && phases.length === 1),
      `${expectedId}: Das einzige Bild würde ungefähr ${duration.toFixed(1)} Sekunden stehen. Prüfe aktiv, ob eine zweite Bildphase Verständnis oder Rhythmus verbessert.`, 'warning');
  }

  addCheck(checks, 'total-duration', totalDuration >= 55 && totalDuration <= 60,
    `Die geschätzte Gesamtdauer beträgt ${totalDuration.toFixed(1)} Sekunden; Ziel sind 55–60 Sekunden.`);
  addCheck(checks, 'all-image-prompts-covered', validatedPromptCount === totalPlannedImages,
    `Es sind ${validatedPromptCount} von ${totalPlannedImages} geplanten Bildprompts ausreichend ausgearbeitet.`);

  const endingScenes = sceneIndex.slice(-2);
  const endingNarration = endingScenes.map((scene) => String(scene.narration ?? '').trim()).join(' ');
  const finalNarration = String(sceneIndex.at(-1)?.narration ?? '').trim();
  const reflectionPattern = /\?|würdest|frag|prüf|entscheide|entscheidung/i;
  addCheck(checks, 'ending-two-scenes', endingScenes.length === 2,
    'Das Ende benötigt zwei getrennte Szenen für Erkenntnis und Auflösung.');
  addCheck(checks, 'ending-reflection', reflectionPattern.test(endingNarration),
    'Die letzten zwei Szenen benötigen eine klare Prüf-, Erkenntnis- oder Entscheidungsfrage.');
  addCheck(checks, 'ending-final-line', wordCount(finalNarration) >= 5 && wordCount(finalNarration) <= 45,
    'Der letzte Sprecherabschnitt sollte mit einem kurzen, einprägsamen Abschlusssatz enden.');
  addCheck(checks, 'ending-visuals-separated',
    endingScenes.length === 2 && String(endingScenes[0]?.visualIdea ?? '') !== String(endingScenes[1]?.visualIdea ?? ''),
    'Prüffrage und endgültige Entscheidung brauchen zwei unterschiedliche klare Bildmomente.');

  const subtitlePlan = await readJson(subtitlePlanPath, null);
  addCheck(checks, 'subtitle-plan-present', Boolean(subtitlePlan),
    'subtitles/subtitle-plan.json fehlt.', strict ? 'error' : 'warning');
  if (subtitlePlan) {
    addCheck(checks, 'subtitle-plan-disabled', subtitlePlan.enabled === false,
      'Der Untertitelplan muss deaktiviert sein.');
    addCheck(checks, 'subtitle-plan-empty', Array.isArray(subtitlePlan.cues) && subtitlePlan.cues.length === 0,
      'Der deaktivierte Untertitelplan darf keine Cues enthalten.');
  }

  const effectsPlan = await readJson(effectsPlanPath, null);
  addCheck(checks, 'effects-plan-present', Boolean(effectsPlan),
    'effects/effects-plan.json fehlt.', strict ? 'error' : 'warning');

  if (effectsPlan) {
    const effectScenes = Array.isArray(effectsPlan.scenes) ? effectsPlan.scenes : [];
    const allowedMotions = new Set(effectsRules.motionEffects?.allowedTypes ?? []);
    const allowedTransitions = new Set(effectsRules.transitions?.allowedTypes ?? []);
    const minScale = Number(effectsRules.motionEffects?.zoomScale?.min ?? 0.92);
    const maxScale = Number(effectsRules.motionEffects?.zoomScale?.max ?? 1.08);
    const maxPan = Number(effectsRules.motionEffects?.maximumPanPercent ?? 4);
    const maxSounds = Number(effectsRules.soundEffects?.maximumPerScene ?? 2);
    const minVolume = Number(effectsRules.soundEffects?.recommendedVolume?.min ?? 0.12);
    const maxVolume = Number(effectsRules.soundEffects?.recommendedVolume?.max ?? 0.3);

    addCheck(checks, 'effects-plan-enabled', effectsPlan.enabled !== false,
      'Der Effektplan sollte standardmäßig aktiviert sein.', 'warning');
    addCheck(checks, 'effects-voiceover-priority', effectsPlan.voiceoverPriority === true,
      'Der Effektplan muss dem Voice-over Priorität geben.', 'warning');
    addCheck(checks, 'effects-background-music-disabled', effectsPlan.backgroundMusic?.enabled !== true,
      'Hintergrundmusik sollte standardmäßig ausgeschaltet sein.', 'warning');
    addCheck(checks, 'effects-scene-count', effectScenes.length === sceneIndex.length,
      `effects-plan.json enthält ${effectScenes.length} statt ${sceneIndex.length} narrativen Szeneneinträge.`, strict ? 'error' : 'warning');

    let movingScenes = 0;
    for (let index = 0; index < sceneIndex.length; index += 1) {
      const sceneId = sceneIndex[index].sceneId;
      const effect = effectScenes.find((item) => item.sceneId === sceneId);
      addCheck(checks, `${sceneId}-effect-entry`, Boolean(effect),
        `${sceneId}: Im Effektplan fehlt ein Eintrag.`, strict ? 'error' : 'warning');
      if (!effect) continue;

      const transitionType = String(effect.transitionIn?.type ?? '');
      const cameraType = String(effect.cameraMotion?.type ?? '');
      const startScale = Number(effect.cameraMotion?.startScale ?? 1);
      const endScale = Number(effect.cameraMotion?.endScale ?? 1);
      const panX = Number(effect.cameraMotion?.panXPercent ?? 0);
      const panY = Number(effect.cameraMotion?.panYPercent ?? 0);
      const soundEffects = Array.isArray(effect.soundEffects) ? effect.soundEffects : [];

      addCheck(checks, `${sceneId}-transition-type`, allowedTransitions.size === 0 || allowedTransitions.has(transitionType),
        `${sceneId}: Unbekannter Übergangstyp ${transitionType || '(leer)'}.`, 'warning');
      addCheck(checks, `${sceneId}-camera-type`, allowedMotions.size === 0 || allowedMotions.has(cameraType),
        `${sceneId}: Unbekannter Kamerabewegungstyp ${cameraType || '(leer)'}.`, 'warning');
      addCheck(checks, `${sceneId}-zoom-range`, Number.isFinite(startScale) && Number.isFinite(endScale) && startScale >= minScale && startScale <= maxScale && endScale >= minScale && endScale <= maxScale,
        `${sceneId}: Zoom-Skalierung muss zwischen ${minScale} und ${maxScale} liegen.`, 'warning');
      addCheck(checks, `${sceneId}-pan-range`, Number.isFinite(panX) && Number.isFinite(panY) && Math.abs(panX) <= maxPan && Math.abs(panY) <= maxPan,
        `${sceneId}: Schwenk darf höchstens ${maxPan} Prozent betragen.`, 'warning');
      addCheck(checks, `${sceneId}-sound-count`, soundEffects.length <= maxSounds,
        `${sceneId}: Höchstens ${maxSounds} Soundeffekte pro Szene verwenden.`, 'warning');

      if (cameraType && cameraType !== 'none') movingScenes += 1;
      for (let soundIndex = 0; soundIndex < soundEffects.length; soundIndex += 1) {
        const volume = Number(soundEffects[soundIndex]?.volume ?? 0.2);
        addCheck(checks, `${sceneId}-sound-${soundIndex + 1}-volume`, Number.isFinite(volume) && volume >= minVolume && volume <= maxVolume,
          `${sceneId}: Soundeffekt-Lautstärke sollte zwischen ${minVolume} und ${maxVolume} liegen.`, 'warning');
      }
    }

    addCheck(checks, 'effects-not-every-scene-moving', sceneIndex.length === 0 || movingScenes < sceneIndex.length,
      'Nicht jede Szene sollte automatisch einen Zoom oder Schwenk erhalten.', 'warning');
    addCheck(checks, 'hook-no-transition', effectScenes[0]?.transitionIn?.type === 'none',
      'Die Hook sollte ab Sekunde 0 ohne Übergang starten.', 'warning');
  }

  // Es gibt kein separates Cover: Szene 1 ist zugleich das Titelbild und trägt
  // deshalb dieselben Anforderungen, die früher am Cover hingen.
  const titleScene = sceneIndex.find((scene) => Number(scene.order) === 1) ?? sceneIndex[0] ?? {};
  const titleSceneId = String(titleScene.sceneId ?? 'scene-01');
  const titlePromptPath = path.join(reelDirectory, 'scenes', titleSceneId, 'image-prompt.txt');
  const titlePrompt = (await exists(titlePromptPath)) ? await readText(titlePromptPath) : '';
  const headline = String(titleScene.imageText ?? '').trim();
  addCheck(checks, 'title-image-prompt', titlePrompt.length >= 180,
    `scenes/${titleSceneId}/image-prompt.txt fehlt oder ist nicht detailliert genug. Szene 1 ist zugleich das Titelbild.`);
  addCheck(checks, 'title-image-text', headline.length >= 5,
    `scenes/${titleSceneId}/scene.json benötigt einen imageText als sichtbaren Hook.`);
  addCheck(checks, 'title-image-text-in-prompt', !headline || titlePrompt.toUpperCase().includes(headline.toUpperCase()),
    'Der Hook-Text von Szene 1 steht nicht exakt im Bildprompt.', 'warning');
  addCheck(checks, 'title-image-visual-idea', String(titleScene.visualIdea ?? '').trim().length >= 20,
    `scenes/${titleSceneId}/scene.json benötigt eine visualIdea.`);

  let sourceQuality = null;
  if (strict) {
    const captionPath = path.join(reelDirectory, 'caption', 'caption.txt');
    const sourcesPath = path.join(reelDirectory, 'sources', 'sources.md');
    const caption = (await exists(captionPath)) ? await readText(captionPath) : '';
    const sources = (await exists(sourcesPath)) ? await readText(sourcesPath) : '';
    addCheck(checks, 'caption', caption.length >= 80, 'caption/caption.txt fehlt oder ist zu kurz.');
    addCheck(checks, 'sources', sources.length >= 40 && sources !== '# Quellen',
      'sources/sources.md enthält noch keine verwertbaren Quellen oder Hinweise.');

    sourceQuality = inspectSourcesMarkdown(sources);
    if (sourceQuality.schemaVersion >= 2) {
      addCheck(checks, 'sources-v2-https-count', sourceQuality.httpsUrlCount >= 2,
        'Neue Reels benötigen mindestens zwei echte HTTPS-Quellen.');
      addCheck(checks, 'sources-v2-independent-hosts', sourceQuality.distinctHostCount >= 2,
        'Neue Reels benötigen mindestens zwei voneinander unabhängige Quell-Domains.');
      addCheck(checks, 'sources-v2-titles', sourceQuality.titleCount >= 2,
        'Für mindestens zwei Quellen muss Titel oder Institution eingetragen sein.');
      addCheck(checks, 'sources-v2-dates', sourceQuality.dateCount >= 2,
        'Für mindestens zwei Quellen muss Datum oder Zugriffsdatum eingetragen sein.');
      addCheck(checks, 'sources-v2-evidence', sourceQuality.evidenceCount >= 2,
        'Für mindestens zwei Quellen muss kurz dokumentiert sein, welche Aussage sie belegt.');
      addCheck(checks, 'sources-v2-no-placeholders', sourceQuality.hasPlaceholder === false,
        'Quellen dürfen keine TODO-, Platzhalter- oder example.com-Einträge enthalten.');
      addCheck(checks, 'sources-v2-https-only', sourceQuality.hasInsecureHttp === false,
        'Neue Quellen sollen ausschließlich HTTPS-URLs verwenden.');
    }
  }

  return finalize(reelDirectory, checks, { totalDuration, totalPlannedImages, strict, sourceQuality });
}

async function finalize(reelDirectory, checks, metadata = {}) {
  const errors = checks.filter((check) => !check.passed && check.level === 'error');
  const warnings = checks.filter((check) => !check.passed && check.level === 'warning');
  const passed = errors.length === 0;
  const report = {
    createdAt: new Date().toISOString(),
    passed,
    summary: {
      passedChecks: checks.filter((check) => check.passed).length,
      failedChecks: errors.length,
      warnings: warnings.length,
      totalChecks: checks.length
    },
    metadata,
    checks
  };

  const reportPath = path.join(reelDirectory, 'review', 'content-readiness.json');
  await writeJson(reportPath, report);

  const statusPath = path.join(reelDirectory, 'status.json');
  const status = await readJson(statusPath, {});
  status.content = passed ? 'ready' : 'needs-review';
  status.imagePrompts = passed ? 'ready' : 'needs-review';
  status.imageDensity = passed ? 'planned' : (status.imageDensity ?? 'needs-review');
  status.plannedImageCount = metadata.totalPlannedImages ?? status.plannedImageCount;
  status.subtitles = 'disabled';
  status.wordSync = 'not-required';
  status.effects = passed ? 'planned' : (status.effects ?? 'needs-review');
  status.qualityControl = passed ? 'content-passed' : 'content-failed';
  await writeJson(statusPath, status);

  const reelPath = path.join(reelDirectory, 'reel.json');
  const reel = await readJson(reelPath, null);
  if (reel) {
    reel.imageCountMode = 'individual-per-reel';
    reel.plannedImageCount = metadata.totalPlannedImages ?? reel.plannedImageCount;
    reel.status = passed ? 'content-ready' : 'content-needs-review';
    await writeJson(reelPath, reel);
  }

  return report;
}
