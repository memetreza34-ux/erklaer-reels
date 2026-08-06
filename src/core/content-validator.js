import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { SUBTITLE_STYLE } from '../shared/subtitle-style.js';

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
    subtitleCues: Array.isArray(scene.subtitleCues) ? scene.subtitleCues : [],
    subtitlePosition: String(scene.subtitlePosition ?? '').trim(),
    durationSeconds: Number(scene.durationSeconds ?? 0),
    expectedImageFileName: String(scene.expectedImageFileName ?? '').trim()
  };
}

export async function validateReelContent(reelDirectory, { strict = false } = {}) {
  const checks = [];
  const reelPath = path.join(reelDirectory, 'reel.json');
  const sceneIndexPath = path.join(reelDirectory, 'scenes', 'scene-index.json');
  const stylesPath = path.resolve('config', 'image-styles.json');
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
  const styleConfig = await readJson(stylesPath, { styles: [] });
  const effectsRules = await readJson(effectsRulesPath, {});
  const validStyleIds = new Set(styleConfig.styles.map((style) => style.id));

  addCheck(checks, 'scene-count-range', Number.isInteger(reel.sceneCount) && reel.sceneCount >= 12 && reel.sceneCount <= 14,
    'Die Szenenanzahl muss zwischen 12 und 14 liegen.');
  addCheck(checks, 'scene-count-match', sceneIndex.length === reel.sceneCount,
    `scene-index.json enthält ${sceneIndex.length} statt ${reel.sceneCount} Szenen.`);
  addCheck(checks, 'topic-area', String(reel.topicArea ?? '').trim().length >= 5,
    'reel.json.topicArea fehlt.');
  addCheck(checks, 'visual-style', Boolean(reel.visualStyleId) && validStyleIds.has(reel.visualStyleId),
    'reel.json.visualStyleId fehlt oder ist nicht in config/image-styles.json definiert.');
  addCheck(checks, 'visual-style-reason', String(reel.visualStyleReason ?? '').trim().length >= 20,
    'reel.json.visualStyleReason sollte die Stilentscheidung kurz begründen.');
  addCheck(checks, 'subtitles-enabled', reel.subtitlesEnabled !== false,
    'Untertitel sollten für dieses Format standardmäßig aktiviert sein.', 'warning');
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
  const usedImageTexts = new Map();

  for (let index = 0; index < sceneIndex.length; index += 1) {
    const indexedScene = sceneIndex[index];
    const expectedId = `scene-${String(index + 1).padStart(2, '0')}`;
    addCheck(checks, `${expectedId}-stable-id`, indexedScene.sceneId === expectedId,
      `Erwartet wurde ${expectedId}, gefunden wurde ${indexedScene.sceneId ?? 'keine ID'}.`);

    const sceneDirectory = path.join(reelDirectory, 'scenes', expectedId);
    const scenePath = path.join(sceneDirectory, 'scene.json');
    const promptPath = path.join(sceneDirectory, 'image-prompt.txt');

    if (!(await exists(scenePath))) {
      addCheck(checks, `${expectedId}-json`, false, `${expectedId}/scene.json fehlt.`);
      continue;
    }

    const scene = await readJson(scenePath, {});
    const prompt = (await exists(promptPath)) ? await readText(promptPath) : '';
    const duration = Number(scene.durationSeconds ?? 0);
    const leadInSeconds = Number(scene.leadInSeconds ?? 0);
    const subtitleCues = Array.isArray(scene.subtitleCues) ? scene.subtitleCues : [];
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
      `${expectedId}: audioCue fehlt. Der Bildwechsel kann dadurch nicht sauber am Sprechertext ausgerichtet werden.`, 'warning');
    addCheck(checks, `${expectedId}-lead-in`, Number.isFinite(leadInSeconds) && leadInSeconds >= 0.1 && leadInSeconds <= 0.3,
      `${expectedId}: leadInSeconds sollte zwischen 0,1 und 0,3 liegen.`, 'warning');
    addCheck(checks, `${expectedId}-subtitle-cues`, subtitleCues.length > 0,
      `${expectedId}: subtitleCues fehlen.`, 'warning');
    addCheck(checks, `${expectedId}-subtitle-position`, String(scene.subtitlePosition ?? '') === SUBTITLE_STYLE.position,
      `${expectedId}: subtitlePosition muss ${SUBTITLE_STYLE.position} sein.`, strict ? 'error' : 'warning');
    addCheck(checks, `${expectedId}-duration`, Number.isFinite(duration) && duration >= 2.5 && duration <= 8,
      `${expectedId}: durationSeconds muss zwischen 2,5 und 8 liegen.`);
    addCheck(checks, `${expectedId}-preferred-duration`, Number.isFinite(duration) && duration >= 3.5 && duration <= 5.5,
      `${expectedId}: Für den gewünschten Rhythmus sind ungefähr 3,5–5,5 Sekunden empfehlenswert.`, 'warning');
    addCheck(checks, `${expectedId}-prompt`, prompt.length >= 180,
      `${expectedId}: image-prompt.txt fehlt oder ist nicht detailliert genug.`);
    addCheck(checks, `${expectedId}-prompt-format`, /vertical\s+9:16|9:16/i.test(prompt),
      `${expectedId}: Der Bildprompt sollte das Format 9:16 ausdrücklich nennen.`, 'warning');
    addCheck(checks, `${expectedId}-expected-file`, String(scene.expectedImageFileName ?? '').startsWith(expectedId),
      `${expectedId}: expectedImageFileName muss mit der Szenen-ID beginnen.`);

    const imageText = String(scene.imageText ?? '').trim().toUpperCase();
    if (imageText) {
      const previousScene = usedImageTexts.get(imageText);
      addCheck(checks, `${expectedId}-image-text-unique`, !previousScene,
        `${expectedId}: Der sichtbare Bildtext wurde bereits in ${previousScene ?? 'keiner Szene'} verwendet.`, 'warning');
      usedImageTexts.set(imageText, expectedId);
      addCheck(checks, `${expectedId}-image-text-prompt`, prompt.toUpperCase().includes(imageText),
        `${expectedId}: imageText steht nicht exakt im Bildprompt.`, 'warning');
      const subtitleText = subtitleCues.map((cue) => String(cue?.text ?? cue ?? '')).join(' ').toUpperCase();
      addCheck(checks, `${expectedId}-subtitle-does-not-repeat-image-text`, !subtitleText.includes(imageText),
        `${expectedId}: Untertitel sollten den integrierten Bildtext nicht wortgleich wiederholen.`, 'warning');
    }
  }

  addCheck(checks, 'total-duration', totalDuration >= 55 && totalDuration <= 60,
    `Die geschätzte Gesamtdauer beträgt ${totalDuration.toFixed(1)} Sekunden; Ziel sind 55–60 Sekunden.`);
  addCheck(checks, 'one-minute-scene-density', sceneIndex.length >= 12 && sceneIndex.length <= 14,
    'Ein-Minuten-Reels benötigen normalerweise 12–14 klare visuelle Momente.');

  const endingScenes = sceneIndex.slice(-2);
  const endingNarration = endingScenes.map((scene) => String(scene.narration ?? '').trim()).join(' ');
  const finalNarration = String(sceneIndex.at(-1)?.narration ?? '').trim();
  const reflectionPattern = /\?|würdest|frag|prüf|entscheide|entscheidung/i;
  addCheck(checks, 'ending-two-scenes', endingScenes.length === 2,
    'Das Ende benötigt mindestens zwei getrennte Szenen für Erkenntnis und Auflösung.');
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
    const subtitleLevel = strict ? 'error' : 'warning';
    addCheck(checks, 'subtitle-plan-enabled', subtitlePlan.enabled !== false,
      'Der Untertitelplan sollte standardmäßig aktiviert sein.', 'warning');
    addCheck(checks, 'subtitle-plan-position', subtitlePlan.position === SUBTITLE_STYLE.position,
      `Der Untertitelplan muss die Position ${SUBTITLE_STYLE.position} verwenden.`, subtitleLevel);
    addCheck(checks, 'subtitle-plan-vertical-position', Number(subtitlePlan.verticalPositionPercent) === SUBTITLE_STYLE.verticalPositionPercent,
      `Die Untertitelposition muss exakt ${SUBTITLE_STYLE.verticalPositionPercent} Prozent der Bildhöhe betragen.`, subtitleLevel);
    addCheck(checks, 'subtitle-plan-safe-range-min', Number(subtitlePlan.safeVerticalRangePercent?.min) === SUBTITLE_STYLE.safeVerticalRangePercent.min,
      `Die minimale Untertitelhöhe muss exakt ${SUBTITLE_STYLE.safeVerticalRangePercent.min} Prozent betragen.`, subtitleLevel);
    addCheck(checks, 'subtitle-plan-safe-range-max', Number(subtitlePlan.safeVerticalRangePercent?.max) === SUBTITLE_STYLE.safeVerticalRangePercent.max,
      `Die maximale Untertitelhöhe muss exakt ${SUBTITLE_STYLE.safeVerticalRangePercent.max} Prozent betragen.`, subtitleLevel);
    addCheck(checks, 'subtitle-plan-text-color', String(subtitlePlan.textColor ?? '').toUpperCase() === SUBTITLE_STYLE.textColor,
      `Die normale Untertitelfarbe muss ${SUBTITLE_STYLE.textColor} sein.`, subtitleLevel);
    addCheck(checks, 'subtitle-plan-highlight-color', String(subtitlePlan.highlightColor ?? '').toUpperCase() === SUBTITLE_STYLE.highlightColor,
      `Die Synchronfarbe muss ${SUBTITLE_STYLE.highlightColor} sein.`, subtitleLevel);
    addCheck(checks, 'subtitle-plan-background-color', subtitlePlan.backgroundColor === SUBTITLE_STYLE.backgroundColor,
      `Der Untertitelhintergrund muss ${SUBTITLE_STYLE.backgroundColor} verwenden.`, subtitleLevel);
    addCheck(checks, 'subtitle-plan-max-lines', Number(subtitlePlan.maxLines) <= SUBTITLE_STYLE.maxLines,
      `Untertitel sollten höchstens ${SUBTITLE_STYLE.maxLines} Zeilen verwenden.`, 'warning');
    addCheck(checks, 'subtitle-plan-cues', Array.isArray(subtitlePlan.cues) && subtitlePlan.cues.length > 0,
      'Der Untertitelplan enthält noch keine Cues.', 'warning');
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
      `effects-plan.json enthält ${effectScenes.length} statt ${sceneIndex.length} Szeneneinträge.`, strict ? 'error' : 'warning');

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

  const coverPromptPath = path.join(reelDirectory, 'cover', 'cover-prompt.txt');
  const coverJsonPath = path.join(reelDirectory, 'cover', 'cover.json');
  const coverPrompt = (await exists(coverPromptPath)) ? await readText(coverPromptPath) : '';
  const cover = await readJson(coverJsonPath, {});
  const headline = String(cover.headline ?? cover.title ?? '').trim();
  addCheck(checks, 'cover-prompt', coverPrompt.length >= 180, 'cover/cover-prompt.txt fehlt oder ist nicht detailliert genug.');
  addCheck(checks, 'cover-headline', headline.length >= 5,
    'cover/cover.json benötigt eine klare headline.');
  addCheck(checks, 'cover-headline-prompt', !headline || coverPrompt.toUpperCase().includes(headline.toUpperCase()),
    'Die Cover-Headline steht nicht exakt im Cover-Prompt.', 'warning');
  addCheck(checks, 'cover-visual-idea', String(cover.visualIdea ?? '').trim().length >= 20,
    'cover/cover.json benötigt eine visualIdea.');

  if (strict) {
    const captionPath = path.join(reelDirectory, 'caption', 'caption.txt');
    const sourcesPath = path.join(reelDirectory, 'sources', 'sources.md');
    const caption = (await exists(captionPath)) ? await readText(captionPath) : '';
    const sources = (await exists(sourcesPath)) ? await readText(sourcesPath) : '';
    addCheck(checks, 'caption', caption.length >= 80, 'caption/caption.txt fehlt oder ist zu kurz.');
    addCheck(checks, 'sources', sources.length >= 40 && sources !== '# Quellen',
      'sources/sources.md enthält noch keine verwertbaren Quellen oder Hinweise.');
  }

  return finalize(reelDirectory, checks, { totalDuration, strict });
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
  status.subtitles = passed ? 'planned' : (status.subtitles ?? 'needs-review');
  status.effects = passed ? 'planned' : (status.effects ?? 'needs-review');
  status.cover = passed ? 'prompt-ready' : (status.cover ?? 'missing');
  status.qualityControl = passed ? 'content-passed' : 'content-failed';
  await writeJson(statusPath, status);

  const reelPath = path.join(reelDirectory, 'reel.json');
  const reel = await readJson(reelPath, null);
  if (reel) {
    reel.status = passed ? 'content-ready' : 'content-needs-review';
    await writeJson(reelPath, reel);
  }

  return report;
}
