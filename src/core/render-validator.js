import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

import { validateExactWordTimings } from '../renderer/subtitle-timing.js';
import { analyzeWordTimingPlausibility } from './word-timing-plausibility.js';
import { SUBTITLE_STYLE, isHexColor } from '../shared/subtitle-style.js';
import {
  AUDIO_PACING_STYLE,
  isMeasuredLoudnessWithinTolerance,
  isTargetPlaybackRate,
  toFiniteNumberOrNull
} from '../shared/audio-pacing-style.js';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg']);
const TRANSITIONS = new Set(['none', 'cut']);

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

function resolveInside(root, relativePath) {
  const rootPath = path.resolve(root);
  const resolved = path.resolve(rootPath, String(relativePath ?? ''));
  const relative = path.relative(rootPath, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Pfad verlässt den Reel-Ordner: ${relativePath}`);
  }
  return resolved;
}

function push(checks, id, passed, message, level = 'error') {
  checks.push({ id, passed, message, level });
}

function normalizeSubtitleToken(value) {
  return String(value ?? '')
    .toLocaleLowerCase('de-DE')
    .replace(/[„“”"'’`´.,!?;:()[\]{}…—–-]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

function tokensFromText(value) {
  return String(value ?? '')
    .trim()
    .split(/\s+/)
    .map(normalizeSubtitleToken)
    .filter(Boolean);
}

function sameTokenSequence(expected, actual) {
  return expected.length === actual.length
    && expected.every((token, index) => token === actual[index]);
}

function mergeSoundEffects(renderSounds, effectSounds) {
  return (renderSounds ?? []).map((sound, index) => {
    const matching = (effectSounds ?? []).find((candidate) =>
      sound.id && candidate.id === sound.id
    ) ?? effectSounds?.[index] ?? {};
    return {
      ...matching,
      ...sound,
      file: sound.file ?? matching.file ?? null
    };
  });
}

export async function validateRendererInput(reelDirectory, {
  requireFinalReadiness = true
} = {}) {
  const checks = [];
  const renderPlanPath = path.join(reelDirectory, 'render', 'render-plan.json');
  const readinessPath = path.join(reelDirectory, 'review', 'final-readiness-report.json');
  const effectsPath = path.join(reelDirectory, 'effects', 'effects-plan.json');
  const audioPacingPath = path.join(reelDirectory, 'review', 'audio-pacing-report.json');
  const voiceScriptPath = path.join(reelDirectory, 'script', 'voice-script.txt');
  const plan = await readJson(renderPlanPath, null);
  const readiness = await readJson(readinessPath, null);
  const effectsPlan = await readJson(effectsPath, { scenes: [] });
  const audioPacing = await readJson(audioPacingPath, null);
  const voiceScript = await exists(voiceScriptPath) ? await readFile(voiceScriptPath, 'utf8') : '';
  const expectedSubtitleTokens = tokensFromText(voiceScript);
  const renderedSubtitleTokens = [];
  const renderedWordTimings = [];
  const effectsByScene = new Map((effectsPlan.scenes ?? []).map((scene) => [scene.sceneId, scene]));

  push(checks, 'render-plan-present', Boolean(plan), 'render/render-plan.json fehlt.');
  if (!plan) return finalize(checks, null, readiness);

  push(checks, 'subtitle-source-script-present', expectedSubtitleTokens.length > 0,
    'script/voice-script.txt fehlt oder enthält keinen Sprechertext.');

  const pacingRate = toFiniteNumberOrNull(audioPacing?.playbackRate);
  const loudnessTarget = toFiniteNumberOrNull(audioPacing?.loudnessSettings?.loudnessTargetLufs);
  const truePeak = toFiniteNumberOrNull(audioPacing?.loudnessSettings?.truePeakDbtp);
  const measuredAudioRequired = Number(audioPacing?.version ?? 0) >= 5;
  push(checks, 'audio-pacing-report', audioPacing?.passed === true,
    'review/audio-pacing-report.json fehlt oder das Voice-over-Pacing wurde nicht erfolgreich optimiert.',
    requireFinalReadiness ? 'error' : 'warning');
  push(checks, 'audio-playback-rate', isTargetPlaybackRate(pacingRate),
    `Das finale Voice-over muss mit exakt ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}x verarbeitet sein.`,
    requireFinalReadiness ? 'error' : 'warning');
  push(checks, 'audio-loudness-normalized', audioPacing?.loudnessNormalized === true,
    'Das finale Voice-over muss lautheitsnormalisiert sein.',
    requireFinalReadiness ? 'error' : 'warning');
  push(checks, 'audio-lufs-target', loudnessTarget === AUDIO_PACING_STYLE.loudnessTargetLufs,
    `Die Ziellautheit muss ${AUDIO_PACING_STYLE.loudnessTargetLufs} LUFS betragen.`,
    requireFinalReadiness ? 'error' : 'warning');
  push(checks, 'audio-true-peak-target', truePeak === AUDIO_PACING_STYLE.truePeakDbtp,
    `Der True-Peak-Zielwert muss ${AUDIO_PACING_STYLE.truePeakDbtp} dBTP betragen.`,
    requireFinalReadiness ? 'error' : 'warning');

  if (measuredAudioRequired) {
    const measurement = audioPacing?.loudnessMeasurement ?? {};
    const measuredLufs = toFiniteNumberOrNull(measurement.integratedLufs);
    const measuredTruePeak = toFiniteNumberOrNull(measurement.truePeakDbtp);
    const measurementValuesPass = isMeasuredLoudnessWithinTolerance(
      { integratedLufs: measuredLufs, truePeakDbtp: measuredTruePeak },
      { loudnessTargetLufs: loudnessTarget, truePeakTargetDbtp: truePeak }
    );
    push(checks, 'audio-loudness-measured', audioPacing?.loudnessMeasured === true,
      'Audio-Pacing-Reports ab Version 5 müssen eine echte Lautheitsnachmessung enthalten.',
      requireFinalReadiness ? 'error' : 'warning');
    push(checks, 'audio-loudness-measurement-passed', measurement.passed === true,
      'Die nachgelagerte LUFS-/True-Peak-Messung muss bestanden sein.',
      requireFinalReadiness ? 'error' : 'warning');
    push(checks, 'audio-measured-lufs-present', measuredLufs !== null,
      'Im Audio-Pacing-Report fehlt der tatsächlich gemessene Integrated-LUFS-Wert.',
      requireFinalReadiness ? 'error' : 'warning');
    push(checks, 'audio-measured-true-peak-present', measuredTruePeak !== null,
      'Im Audio-Pacing-Report fehlt der tatsächlich gemessene True-Peak-Wert.',
      requireFinalReadiness ? 'error' : 'warning');
    push(checks, 'audio-measured-values-within-tolerance', measurementValuesPass,
      'Die gespeicherten LUFS-/True-Peak-Messwerte liegen außerhalb der zentralen Produktionstoleranz.',
      requireFinalReadiness ? 'error' : 'warning');
  }

  const composition = plan.composition ?? {};
  push(checks, 'composition-width', Number(composition.width) === 1080,
    'Der Renderer erwartet 1080 Pixel Breite.');
  push(checks, 'composition-height', Number(composition.height) === 1920,
    'Der Renderer erwartet 1920 Pixel Höhe.');
  push(checks, 'composition-fps', Number(composition.fps) === 30,
    'Der Renderer erwartet 30 FPS.');
  push(checks, 'composition-duration', Number.isInteger(Number(composition.durationFrames)) && Number(composition.durationFrames) > 0,
    'composition.durationFrames muss eine positive Ganzzahl sein.');

  const scenes = Array.isArray(plan.scenes) ? plan.scenes : [];
  push(checks, 'scenes-present', scenes.length > 0, 'Der Render-Plan enthält keine Szenen.');
  push(checks, 'render-status', plan.status === 'ready-for-renderer',
    'render-plan.json besitzt noch nicht den Status ready-for-renderer.', requireFinalReadiness ? 'error' : 'warning');
  push(checks, 'final-readiness', readiness?.readyForRenderer === true,
    'review/final-readiness-report.json gibt das Reel noch nicht für den Renderer frei.', requireFinalReadiness ? 'error' : 'warning');

  const voiceoverFile = plan.voiceover?.file;
  push(checks, 'voiceover-file', Boolean(voiceoverFile), 'Im Render-Plan fehlt die Voice-over-Datei.');
  if (voiceoverFile) {
    try {
      const resolved = resolveInside(reelDirectory, voiceoverFile);
      const extension = path.extname(resolved).toLowerCase();
      push(checks, 'voiceover-format', AUDIO_EXTENSIONS.has(extension),
        `Nicht unterstütztes Voice-over-Format: ${extension || 'ohne Endung'}.`);
      push(checks, 'voiceover-present', await exists(resolved),
        `Voice-over-Datei wurde nicht gefunden: ${voiceoverFile}.`);
    } catch (error) {
      push(checks, 'voiceover-safe-path', false, error.message);
    }
  }

  let previousEnd = 0;
  for (let index = 0; index < scenes.length; index += 1) {
    const scene = scenes[index];
    const id = scene.sceneId ?? `scene-${index + 1}`;
    const start = Number(scene.startFrame);
    const end = Number(scene.endFrame);

    push(checks, `${id}-frame-range`, Number.isInteger(start) && Number.isInteger(end) && end > start,
      `${id}: startFrame und endFrame sind ungültig.`);
    push(checks, `${id}-continuous`, index === 0 ? start === 0 : start === previousEnd,
      `${id}: Es gibt eine Lücke oder Überlappung im Render-Plan.`);
    previousEnd = end;

    const imageFile = scene.imageFile;
    push(checks, `${id}-image-file`, Boolean(imageFile), `${id}: imageFile fehlt.`);
    if (imageFile) {
      try {
        const resolved = resolveInside(reelDirectory, imageFile);
        const extension = path.extname(resolved).toLowerCase();
        push(checks, `${id}-image-format`, IMAGE_EXTENSIONS.has(extension),
          `${id}: Nicht unterstütztes Bildformat ${extension || 'ohne Endung'}.`);
        push(checks, `${id}-image-present`, await exists(resolved),
          `${id}: Bilddatei wurde nicht gefunden: ${imageFile}.`);
      } catch (error) {
        push(checks, `${id}-image-safe-path`, false, error.message);
      }
    }

    const transition = scene.transitionIn ?? { type: index === 0 ? 'none' : 'cut' };
    const expectedTransition = index === 0 ? 'none' : 'cut';
    push(checks, `${id}-transition`, TRANSITIONS.has(transition.type),
      `${id}: Nur none für die Hook und cut für alle weiteren Szenen sind erlaubt.`);
    push(checks, `${id}-direct-cut`, transition.type === expectedTransition,
      `${id}: Erwartet wird transitionIn.type = "${expectedTransition}" ohne Fade oder Schwarzbild.`);
    push(checks, `${id}-transition-duration`, Number(transition.durationSeconds ?? 0) === 0,
      `${id}: Direkte Schnitte müssen durationSeconds: 0 besitzen.`);

    const motion = scene.cameraMotion ?? {};
    const startScale = Number(motion.startScale ?? 1);
    const endScale = Number(motion.endScale ?? 1);
    const panX = Number(motion.panXPercent ?? 0);
    const panY = Number(motion.panYPercent ?? 0);
    push(checks, `${id}-scale-safe`, startScale >= 0.92 && startScale <= 1.08 && endScale >= 0.92 && endScale <= 1.08,
      `${id}: Zoom liegt außerhalb des sicheren Bereichs von 0,92 bis 1,08.`);
    push(checks, `${id}-pan-safe`, Math.abs(panX) <= 4 && Math.abs(panY) <= 4,
      `${id}: Schwenk darf höchstens 4 Prozent betragen.`);

    for (const [subtitleIndex, cue] of (scene.subtitles ?? []).entries()) {
      const cueId = cue.id ?? `${id}-subtitle-${subtitleIndex + 1}`;
      const startSeconds = Number(cue.startSeconds);
      const endSeconds = Number(cue.endSeconds);
      push(checks, `${cueId}-time`, Number.isFinite(startSeconds) && Number.isFinite(endSeconds) && endSeconds > startSeconds,
        `${cueId}: Untertitelzeit ist ungültig.`);
      push(checks, `${cueId}-text`, String(cue.text ?? '').trim().length > 0,
        `${cueId}: Untertiteltext fehlt.`);

      const vertical = Number(cue.verticalPositionPercent ?? SUBTITLE_STYLE.verticalPositionPercent);
      const { min, max } = SUBTITLE_STYLE.safeVerticalRangePercent;
      push(checks, `${cueId}-vertical-position`, Number.isFinite(vertical) && vertical >= min && vertical <= max,
        `${cueId}: Untertitel müssen bei exakt ${SUBTITLE_STYLE.verticalPositionPercent} Prozent der Bildhöhe liegen.`);

      const textColor = cue.textColor ?? SUBTITLE_STYLE.textColor;
      const highlightColor = cue.highlightColor ?? SUBTITLE_STYLE.highlightColor;
      push(checks, `${cueId}-text-color`, isHexColor(textColor) && String(textColor).toUpperCase() === SUBTITLE_STYLE.textColor,
        `${cueId}: Untertiteltext muss weiches Weiß ${SUBTITLE_STYLE.textColor} verwenden.`);
      push(checks, `${cueId}-highlight-color`, isHexColor(highlightColor) && String(highlightColor).toUpperCase() === SUBTITLE_STYLE.highlightColor,
        `${cueId}: Das aktuell gesprochene Wort muss Braun ${SUBTITLE_STYLE.highlightColor} verwenden.`);
      push(checks, `${cueId}-speaker-highlight-enabled`, SUBTITLE_STYLE.highlightCurrentWord === true,
        `${cueId}: Die sprecher-synchrone Wortmarkierung muss global aktiviert sein.`);
      push(checks, `${cueId}-background-transparent`, String(cue.backgroundColor ?? SUBTITLE_STYLE.backgroundColor) === SUBTITLE_STYLE.backgroundColor,
        `${cueId}: Der Untertitelhintergrund muss transparent sein.`);

      const exact = validateExactWordTimings(cue);
      push(checks, `${cueId}-exact-word-timing`, exact.valid,
        `${cueId}: Exakte, akustisch bestätigte Wortzeiten fehlen. ${exact.issues.join(' ')}`,
        requireFinalReadiness ? 'error' : 'warning');
      if (exact.valid) {
        renderedSubtitleTokens.push(...exact.words.map((word) => normalizeSubtitleToken(word.text)).filter(Boolean));
      }
      // Für die planweite Plausibilitätsprüfung werden die absoluten Wortzeiten benötigt,
      // nicht die auf den Cue-Start bezogenen aus validateExactWordTimings.
      for (const word of cue.wordTimings ?? cue.words ?? []) {
        renderedWordTimings.push(word);
      }
      push(checks, `${cueId}-timing-status`, cue.timingStatus === 'codex-word-synced',
        `${cueId}: timingStatus muss "codex-word-synced" sein.`,
        requireFinalReadiness ? 'error' : 'warning');
      push(checks, `${cueId}-timing-source`, cue.timingSource === 'codex-local-audio-review',
        `${cueId}: timingSource muss "codex-local-audio-review" sein.`,
        requireFinalReadiness ? 'error' : 'warning');
    }

    const effectScene = effectsByScene.get(id) ?? {};
    scene.soundEffects = mergeSoundEffects(scene.soundEffects, effectScene.soundEffects);
    for (const [soundIndex, sound] of scene.soundEffects.entries()) {
      const soundId = sound.id ?? `${id}-sfx-${soundIndex + 1}`;
      push(checks, `${soundId}-time`, Number.isFinite(Number(sound.timeSeconds)),
        `${soundId}: timeSeconds fehlt oder ist ungültig.`, 'warning');
      push(checks, `${soundId}-volume`, Number(sound.volume ?? 0.2) >= 0 && Number(sound.volume ?? 0.2) <= 0.5,
        `${soundId}: Lautstärke sollte zwischen 0 und 0,5 liegen.`, 'warning');
      if (!sound.file) {
        push(checks, `${soundId}-file`, false,
          `${soundId}: Kein Sound-Dateipfad vorhanden; der Renderer überspringt diesen Effekt.`, 'warning');
        continue;
      }
      try {
        const resolved = resolveInside(reelDirectory, sound.file);
        const extension = path.extname(resolved).toLowerCase();
        push(checks, `${soundId}-format`, AUDIO_EXTENSIONS.has(extension),
          `${soundId}: Nicht unterstütztes Audioformat ${extension || 'ohne Endung'}.`);
        push(checks, `${soundId}-present`, await exists(resolved),
          `${soundId}: Sounddatei wurde nicht gefunden: ${sound.file}.`);
      } catch (error) {
        push(checks, `${soundId}-safe-path`, false, error.message);
      }
    }
  }

  push(checks, 'subtitle-full-spoken-text-coverage',
    expectedSubtitleTokens.length > 0 && sameTokenSequence(expectedSubtitleTokens, renderedSubtitleTokens),
    `Die gerenderten Untertitel müssen 100 % des Voice-Scripts in exakt derselben Wortreihenfolge enthalten. Erwartet: ${expectedSubtitleTokens.length} Wörter, gerendert: ${renderedSubtitleTokens.length}.`);

  // Letzte Verteidigungslinie vor dem Render: gleichmäßig verteilte Wortzeiten tragen
  // dieselben Labels wie echte und würden alle bisherigen Prüfungen bestehen.
  const wordTimingPlausibility = analyzeWordTimingPlausibility(renderedWordTimings);
  push(checks, 'subtitle-word-timings-measured',
    !wordTimingPlausibility.suspicious,
    `Die Untertitel-Wortzeiten wirken gleichmäßig verteilt statt am Audio gemessen und können deshalb nicht synchron sein: ${wordTimingPlausibility.triggered.join(' ')}`,
    requireFinalReadiness ? 'error' : 'warning');

  push(checks, 'last-frame', scenes.length === 0 || previousEnd === Number(composition.durationFrames),
    'Die letzte Szene endet nicht exakt am letzten Kompositionsframe.');

  return finalize(checks, plan, readiness);
}

function finalize(checks, plan, readiness) {
  const errors = checks.filter((check) => !check.passed && check.level === 'error');
  const warnings = checks.filter((check) => !check.passed && check.level === 'warning');
  return {
    createdAt: new Date().toISOString(),
    passed: errors.length === 0,
    summary: {
      passedChecks: checks.filter((check) => check.passed).length,
      failedChecks: errors.length,
      warnings: warnings.length,
      totalChecks: checks.length
    },
    plan,
    readiness,
    checks
  };
}
