import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

import { SUBTITLE_STYLE } from '../shared/subtitle-style.js';
import { normalizeSceneImagePhases } from '../shared/visual-moments.js';

const execFileAsync = promisify(execFile);
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg']);

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function readJson(filePath, fallback = null) {
  return (await exists(filePath)) ? JSON.parse(await readFile(filePath, 'utf8')) : fallback;
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function readQualityGates() {
  return readJson(path.resolve('config', 'production-quality-gates.json'), {
    sceneTiming: {
      hookSeconds: { min: 4.2, max: 5.5 },
      standardSeconds: { min: 3.2, max: 5.5 },
      finalSceneSecondsIncludingHold: { min: 4, max: 6.5 },
      maximumAdjacentDifferenceSeconds: 2.5,
      postVoiceHoldSeconds: 0.7,
      postVoiceHoldRangeSeconds: { min: 0.6, max: 0.8 },
      subtitlesEndWithVoiceover: true,
      strictTimelineBalance: true
    }
  });
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function round(value, digits = 3) {
  const factor = 10 ** digits;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

async function findAudioPath(reelDirectory, manifest) {
  const listed = manifest?.audio?.expectedFile;
  if (listed && await exists(path.join(reelDirectory, listed))) return path.join(reelDirectory, listed);
  const directory = path.join(reelDirectory, 'audio');
  if (!(await exists(directory))) return null;
  const entries = await readdir(directory, { withFileTypes: true });
  const name = entries
    .filter((entry) => entry.isFile() && entry.name !== '.gitkeep')
    .map((entry) => entry.name)
    .filter((entry) => AUDIO_EXTENSIONS.has(path.extname(entry).toLowerCase()))
    .sort()[0];
  return name ? path.join(directory, name) : null;
}

export async function probeAudioDuration(audioPath) {
  if (!audioPath) return null;
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1', audioPath
    ]);
    const duration = Number(String(stdout).trim());
    return Number.isFinite(duration) && duration > 0 ? duration : null;
  } catch { return null; }
}

async function ensureAudioSync(reelDirectory, scenes) {
  const filePath = path.join(reelDirectory, 'timeline', 'audio-sync.json');
  if (!(await exists(filePath))) {
    await writeJson(filePath, {
      version: 2,
      audioDurationSeconds: null,
      audioFile: null,
      source: 'pending',
      timingStatus: 'waiting-for-audio',
      instructions: [
        'Trage die echte Audiodauer ein.',
        'cueTimeSeconds ist der Zeitpunkt, an dem audioCue gesprochen wird.',
        'Das erste Bild einer Szene beginnt normalerweise leadInSeconds vor cueTimeSeconds.',
        'Zusätzliche Bildphasen wechseln innerhalb der bestätigten Szenendauer anhand ihres geplanten startPercent.',
        'Prüfe jeden Szenenwechsel gegen den sichtbaren Bildinhalt.',
        'Nach dem letzten gesprochenen Wort bleibt das letzte Bild automatisch kurz stehen.'
      ],
      cueTimings: scenes.map((scene, index) => ({
        sceneId: scene.sceneId,
        audioCue: scene.audioCue ?? '',
        cueTimeSeconds: index === 0 ? 0 : null,
        leadInSeconds: numberOrNull(scene.leadInSeconds) ?? 0.2,
        confidence: index === 0 ? 1 : null
      }))
    });
  }
  return readJson(filePath, { cueTimings: [] });
}

function createTimings(scenes, totalDuration, audioSync) {
  const fallback = totalDuration / scenes.length;
  const weights = scenes.map((scene) => {
    const duration = numberOrNull(scene.durationSeconds);
    return duration && duration > 0 ? duration : fallback;
  });
  const cueByScene = new Map((audioSync.cueTimings ?? []).map((cue) => [cue.sceneId, cue]));
  const anchors = new Map([[0, 0], [scenes.length, totalDuration]]);
  let exactCueCount = 0;

  scenes.forEach((scene, index) => {
    if (index === 0) return;
    const cue = cueByScene.get(scene.sceneId);
    const cueTime = numberOrNull(cue?.cueTimeSeconds);
    if (cueTime === null) return;
    const lead = numberOrNull(cue?.leadInSeconds) ?? numberOrNull(scene.leadInSeconds) ?? 0.2;
    anchors.set(index, Math.max(0, Math.min(totalDuration, cueTime - lead)));
    exactCueCount += 1;
  });

  const sorted = [...anchors.entries()].sort((a, b) => a[0] - b[0]);
  const valid = [sorted[0]];
  for (const anchor of sorted.slice(1)) {
    const previous = valid.at(-1);
    if (anchor[0] > previous[0] && anchor[1] > previous[1]) valid.push(anchor);
  }
  if (valid.at(-1)[0] !== scenes.length) valid.push([scenes.length, totalDuration]);

  const starts = Array(scenes.length).fill(0);
  for (let group = 0; group < valid.length - 1; group += 1) {
    const [startIndex, startTime] = valid[group];
    const [endIndex, endTime] = valid[group + 1];
    const sum = weights.slice(startIndex, endIndex).reduce((a, b) => a + b, 0) || 1;
    let cursor = startTime;
    for (let index = startIndex; index < endIndex; index += 1) {
      starts[index] = cursor;
      cursor += (endTime - startTime) * (weights[index] / sum);
    }
  }

  return {
    exactCueCount,
    totalCueCount: Math.max(0, scenes.length - 1),
    scenes: scenes.map((scene, index) => {
      const cue = cueByScene.get(scene.sceneId);
      const start = index === 0 ? 0 : starts[index];
      const end = index === scenes.length - 1 ? totalDuration : starts[index + 1];
      return {
        sceneId: scene.sceneId,
        startSeconds: round(start),
        endSeconds: round(end),
        durationSeconds: round(Math.max(0, end - start)),
        audioCue: scene.audioCue ?? cue?.audioCue ?? '',
        cueTimeSeconds: numberOrNull(cue?.cueTimeSeconds),
        leadInSeconds: numberOrNull(cue?.leadInSeconds) ?? numberOrNull(scene.leadInSeconds) ?? 0.2,
        cueConfidence: numberOrNull(cue?.confidence)
      };
    })
  };
}

function addEndingHold(timingScenes, endingHoldSeconds) {
  return timingScenes.map((scene, index) => {
    if (index !== timingScenes.length - 1) return { ...scene };
    const endSeconds = round(scene.endSeconds + endingHoldSeconds);
    return {
      ...scene,
      endSeconds,
      durationSeconds: round(endSeconds - scene.startSeconds),
      postVoiceHoldSeconds: round(endingHoldSeconds)
    };
  });
}

function planCuesForScene(subtitlePlan, scene) {
  const global = Array.isArray(subtitlePlan?.cues) ? subtitlePlan.cues : [];
  const localEntries = global.filter((cue) => cue.sceneId === scene.sceneId);
  const expanded = localEntries.flatMap((cue) => {
    if (Array.isArray(cue.texts)) return cue.texts.map((text) => ({ text }));
    return [cue];
  });
  return expanded.length ? expanded : (Array.isArray(scene.subtitleCues) ? scene.subtitleCues : []);
}

function applySubtitleStyle(cue) {
  return {
    ...cue,
    position: SUBTITLE_STYLE.position,
    verticalPositionPercent: SUBTITLE_STYLE.verticalPositionPercent,
    textColor: SUBTITLE_STYLE.textColor,
    highlightCurrentWord: SUBTITLE_STYLE.highlightCurrentWord,
    highlightColor: SUBTITLE_STYLE.highlightColor,
    backgroundColor: SUBTITLE_STYLE.backgroundColor
  };
}

function subtitleTimeline(scenes, timings, subtitlePlan) {
  if (SUBTITLE_STYLE.enabled === false || subtitlePlan?.enabled === false) return [];

  const output = [];
  scenes.forEach((scene, sceneIndex) => {
    const timing = timings[sceneIndex];
    const source = planCuesForScene(subtitlePlan, scene);
    const cues = source.map((cue, index) => typeof cue === 'string'
      ? { id: `${scene.sceneId}-subtitle-${index + 1}`, sceneId: scene.sceneId, text: cue }
      : { ...cue, id: cue.id ?? `${scene.sceneId}-subtitle-${index + 1}`, sceneId: cue.sceneId ?? scene.sceneId })
      .filter((cue) => String(cue.text ?? '').trim())
      .map(applySubtitleStyle);
    if (!cues.length) return;

    const exact = cues.every((cue) => numberOrNull(cue.startSeconds) !== null && numberOrNull(cue.endSeconds) > numberOrNull(cue.startSeconds));
    if (exact) {
      output.push(...cues.map((cue) => ({
        ...cue,
        startSeconds: round(cue.startSeconds),
        endSeconds: round(cue.endSeconds),
        timingStatus: cue.timingStatus ?? 'exact-cue-timing'
      })));
      return;
    }

    const weights = cues.map((cue) => Math.max(1, String(cue.text).trim().split(/\s+/).length));
    const sum = weights.reduce((a, b) => a + b, 0) || 1;
    let cursor = timing.startSeconds;
    cues.forEach((cue, index) => {
      const end = index === cues.length - 1 ? timing.endSeconds : cursor + timing.durationSeconds * (weights[index] / sum);
      output.push({
        ...cue,
        startSeconds: round(cursor),
        endSeconds: round(end),
        timingStatus: 'estimated-within-scene'
      });
      cursor = end;
    });
  });
  return output.sort((a, b) => a.startSeconds - b.startSeconds);
}

function soundTimeline(effectScene, timing) {
  return (effectScene?.soundEffects ?? []).map((sound, index) => {
    let time = numberOrNull(sound.timeSeconds);
    if (time === null && numberOrNull(sound.offsetSeconds) !== null) time = timing.startSeconds + Number(sound.offsetSeconds);
    if (time === null && numberOrNull(sound.atPercent) !== null) time = timing.startSeconds + timing.durationSeconds * Number(sound.atPercent);
    if (time === null) time = timing.startSeconds + Math.min(0.25, timing.durationSeconds * 0.1);
    return {
      id: sound.id ?? `${timing.sceneId}-sfx-${index + 1}`,
      type: sound.type ?? 'unspecified',
      timeSeconds: round(Math.max(timing.startSeconds, Math.min(timing.endSeconds, time))),
      volume: numberOrNull(sound.volume) ?? 0.2,
      audioCue: sound.audioCue ?? '',
      visualEvent: sound.visualEvent ?? '',
      reason: sound.reason ?? ''
    };
  });
}

function timingRangeForScene(index, sceneCount, rules) {
  if (index === 0) return { ...rules.hookSeconds, label: 'Hook' };
  if (index === sceneCount - 1) return { ...rules.finalSceneSecondsIncludingHold, label: 'Schlussszene inklusive Nachlauf' };
  return { ...rules.standardSeconds, label: 'Standardszene' };
}

function visualPhasesForScene(scene, baseTiming, extendedTiming, manifest, legacyAsset) {
  const manifestByTarget = new Map((manifest.visuals ?? []).map((entry) => [entry.targetId, entry]));
  const definitions = normalizeSceneImagePhases(scene);

  return definitions.map((phase, index) => {
    const asset = manifestByTarget.get(phase.targetId) ?? (phase.primary ? legacyAsset : null) ?? {};
    const startSeconds = round(baseTiming.startSeconds + baseTiming.durationSeconds * phase.startPercent);
    const next = definitions[index + 1];
    const endSeconds = next
      ? round(baseTiming.startSeconds + baseTiming.durationSeconds * next.startPercent)
      : round(extendedTiming.endSeconds);
    return {
      targetId: phase.targetId,
      phaseId: phase.phaseId,
      phaseOrder: phase.phaseOrder,
      startPercent: phase.startPercent,
      startSeconds,
      endSeconds,
      durationSeconds: round(Math.max(0, endSeconds - startSeconds)),
      imageFile: asset.expectedFile ?? `scenes/${scene.sceneId}/${phase.expectedImageFileName}`,
      imageStatus: asset.status ?? phase.imageStatus ?? 'missing',
      assetVerification: asset.verification ?? phase.assetVerification ?? null,
      visualIdea: phase.visualIdea || scene.visualIdea || '',
      imageText: phase.imageText || scene.imageText || ''
    };
  });
}

function qualityReport(
  reelDirectory,
  scenes,
  timelineScenes,
  subtitles,
  audioPath,
  durationKnown,
  timingStatus,
  strict,
  sceneTimingRules,
  endingHoldSeconds,
  audioDurationSeconds
) {
  // Im strengen Lauf blockieren Szenenlängen außerhalb der Regelspanne, wie bei den
  // übrigen Gates auch. Ohne strict bleibt es eine Warnung.
  const balanceLevel = strict ? 'error' : 'warning';
  const holdRange = sceneTimingRules.postVoiceHoldRangeSeconds ?? { min: 0.6, max: 0.8 };
  const checks = [
    ['hook-starts-at-zero', timelineScenes[0]?.startSeconds === 0, 'Das Hook-Bild muss bei Sekunde 0 beginnen.', 'error'],
    ['scene-count-match', timelineScenes.length === scenes.length, 'Die Timeline benötigt genau einen narrativen Eintrag pro Szene.', 'error'],
    ['audio-present', Boolean(audioPath), 'Die Voice-over-Datei fehlt.', strict ? 'error' : 'warning'],
    ['audio-duration-known', durationKnown, 'Die Audiodauer ist noch nicht exakt bekannt.', strict ? 'error' : 'warning'],
    ['exact-audio-sync', timingStatus === 'audio-synced', 'Nicht alle Audio-Cues besitzen verifizierte Zeitstempel.', strict ? 'error' : 'warning'],
    ['all-scene-images-ready', timelineScenes.every((scene) => scene.imageStatus === 'ready'), 'Noch nicht alle geplanten Bildphasen sind bereit.', strict ? 'error' : 'warning'],
    ['ending-hold-range', endingHoldSeconds >= holdRange.min && endingHoldSeconds <= holdRange.max,
      `Das Schlussbild muss nach dem letzten gesprochenen Wort ${holdRange.min}–${holdRange.max} Sekunden stehen bleiben.`, balanceLevel],
    ['subtitles-disabled', subtitles.length === 0,
      'Für dieses Format dürfen keine Untertitel in der Timeline vorhanden sein.', 'error']
  ].map(([id, passed, message, level]) => ({ id, passed, message, level }));

  timelineScenes.forEach((scene, index) => {
    const range = timingRangeForScene(index, timelineScenes.length, sceneTimingRules);
    checks.push({
      id: `${scene.sceneId}-positive-duration`,
      passed: scene.durationSeconds > 0,
      level: 'error',
      message: `${scene.sceneId} benötigt eine positive Dauer.`
    });
    checks.push({
      id: `${scene.sceneId}-balanced-duration`,
      passed: scene.durationSeconds >= Number(range.min) && scene.durationSeconds <= Number(range.max),
      level: balanceLevel,
      message: `${scene.sceneId}: ${range.label} dauert ${scene.durationSeconds.toFixed(2)} Sekunden; erlaubt sind ${range.min}–${range.max} Sekunden.`
    });
    checks.push({
      id: `${scene.sceneId}-visual-phases-present`,
      passed: Array.isArray(scene.imagePhases) && scene.imagePhases.length >= 1 && scene.imagePhases.length <= 3,
      level: 'error',
      message: `${scene.sceneId}: Jede Szene benötigt ein bis drei individuell geplante Bildphasen.`
    });
    if (index) {
      const previous = timelineScenes[index - 1];
      checks.push({
        id: `${scene.sceneId}-continuous`,
        passed: Math.abs(previous.endSeconds - scene.startSeconds) <= 0.01,
        level: 'error',
        message: `${scene.sceneId} erzeugt eine Lücke oder Überlappung.`
      });
      checks.push({
        id: `${scene.sceneId}-adjacent-duration-balance`,
        passed: Math.abs(previous.durationSeconds - scene.durationSeconds) <= Number(sceneTimingRules.maximumAdjacentDifferenceSeconds ?? 2.5),
        level: balanceLevel,
        message: `${scene.sceneId}: Der Dauersprung zur vorherigen Szene ist zu groß.`
      });
    }
  });

  const errors = checks.filter((check) => !check.passed && check.level === 'error');
  const warnings = checks.filter((check) => !check.passed && check.level === 'warning');
  return {
    createdAt: new Date().toISOString(),
    reelDirectory: reelDirectory.split(path.sep).join('/'),
    stage: 'pre-render',
    passed: errors.length === 0,
    audioDurationSeconds: round(audioDurationSeconds),
    endingHoldSeconds: round(endingHoldSeconds),
    compositionDurationSeconds: round(audioDurationSeconds + endingHoldSeconds),
    timingRules: sceneTimingRules,
    summary: {
      passedChecks: checks.filter((check) => check.passed).length,
      failedChecks: errors.length,
      warnings: warnings.length,
      totalChecks: checks.length
    },
    checks
  };
}

export async function buildMasterTimeline(reelDirectory, { audioDurationSeconds = null, strict = false, probeAudio = true } = {}) {
  const reel = await readJson(path.join(reelDirectory, 'reel.json'));
  const scenes = await readJson(path.join(reelDirectory, 'scenes', 'scene-index.json'), []);
  if (!reel) throw new Error('reel.json wurde nicht gefunden.');
  if (!scenes.length) throw new Error('scenes/scene-index.json enthält keine Szenen.');

  const qualityGates = await readQualityGates();
  const sceneTimingRules = qualityGates.sceneTiming ?? {};
  const endingHoldSeconds = Number(sceneTimingRules.postVoiceHoldSeconds ?? 0.7);
  const subtitlesPlan = await readJson(path.join(reelDirectory, 'subtitles', 'subtitle-plan.json'), { enabled: false, cues: [] });
  const effectsPlan = await readJson(path.join(reelDirectory, 'effects', 'effects-plan.json'), { scenes: [] });
  const manifest = await readJson(path.join(reelDirectory, 'assets-manifest.json'), { audio: {}, visuals: [], scenes: [] });
  const status = await readJson(path.join(reelDirectory, 'status.json'), {});
  const audioSync = await ensureAudioSync(reelDirectory, scenes);
  const audioPath = await findAudioPath(reelDirectory, manifest);

  const explicit = numberOrNull(audioDurationSeconds) ?? numberOrNull(audioSync.audioDurationSeconds);
  const probed = explicit === null && probeAudio ? await probeAudioDuration(audioPath) : null;
  const planned = scenes.reduce((sum, scene) => sum + Math.max(0, numberOrNull(scene.durationSeconds) ?? 0), 0);
  const voiceDuration = explicit ?? probed ?? (planned > 0 ? planned : numberOrNull(reel.targetDurationSeconds) ?? 58);
  const compositionDuration = voiceDuration + endingHoldSeconds;
  const durationKnown = explicit !== null || probed !== null;
  const baseTiming = createTimings(scenes, voiceDuration, audioSync);
  const extendedTimingScenes = addEndingHold(baseTiming.scenes, endingHoldSeconds);
  const effectByScene = new Map((effectsPlan.scenes ?? []).map((scene) => [scene.sceneId, scene]));
  const manifestByScene = new Map((manifest.scenes ?? []).map((scene) => [scene.sceneId, scene]));
  const subtitles = subtitleTimeline(scenes, baseTiming.scenes, subtitlesPlan);

  const timelineScenes = extendedTimingScenes.map((item, index) => {
    const scene = scenes[index];
    const effect = effectByScene.get(scene.sceneId) ?? {};
    const legacyAsset = manifestByScene.get(scene.sceneId) ?? {};
    const imagePhases = visualPhasesForScene(scene, baseTiming.scenes[index], item, manifest, legacyAsset);
    return {
      ...item,
      title: scene.title ?? '',
      narration: scene.narration ?? '',
      imageText: scene.imageText ?? '',
      imageCount: imagePhases.length,
      imagePhases,
      imageFile: imagePhases[0]?.imageFile ?? legacyAsset.expectedFile ?? `scenes/${scene.sceneId}/${scene.expectedImageFileName ?? `${scene.sceneId}.png`}`,
      imageStatus: imagePhases.every((phase) => phase.imageStatus === 'ready') ? 'ready' : 'missing',
      assetVerification: imagePhases[0]?.assetVerification ?? legacyAsset.verification ?? scene.assetVerification ?? null,
      subtitleCueIds: [],
      transitionIn: effect.transitionIn ?? { type: index ? 'cut' : 'none', durationSeconds: 0 },
      cameraMotion: effect.cameraMotion ?? { type: 'none', startScale: 1, endScale: 1, panXPercent: 0, panYPercent: 0 },
      soundEffects: soundTimeline(effect, item)
    };
  });

  const allCuesExact = baseTiming.totalCueCount === 0 || baseTiming.exactCueCount === baseTiming.totalCueCount;
  const timingStatus = durationKnown && allCuesExact ? 'audio-synced' : durationKnown ? 'audio-duration-synced' : 'estimated';
  const relativeAudio = audioPath ? path.relative(reelDirectory, audioPath).split(path.sep).join('/') : null;
  const timeline = {
    version: 5,
    reelId: reel.reelId,
    createdAt: new Date().toISOString(),
    timingStatus,
    audio: {
      file: relativeAudio,
      durationSeconds: round(voiceDuration),
      durationSource: explicit !== null ? 'audio-sync-or-cli' : probed !== null ? 'ffprobe' : 'planned-scenes',
      exactDurationKnown: durationKnown
    },
    composition: {
      width: 1080,
      height: 1920,
      fps: 30,
      durationSeconds: round(compositionDuration),
      endingHoldSeconds: round(endingHoldSeconds)
    },
    imageCountMode: 'individual-per-reel',
    plannedImageCount: timelineScenes.reduce((sum, scene) => sum + scene.imagePhases.length, 0),
    subtitles: {
      enabled: false,
      cues: []
    },
    effectsPlanFile: 'effects/effects-plan.json',
    scenes: timelineScenes
  };

  const shots = [];
  for (let sceneIndex = 0; sceneIndex < timelineScenes.length; sceneIndex += 1) {
    const scene = timelineScenes[sceneIndex];
    for (let phaseIndex = 0; phaseIndex < scene.imagePhases.length; phaseIndex += 1) {
      const phase = scene.imagePhases[phaseIndex];
      const firstShot = shots.length === 0;
      shots.push({
        sceneId: phase.targetId,
        shotId: phase.targetId,
        parentSceneId: scene.sceneId,
        parentSceneOrder: sceneIndex + 1,
        phaseId: phase.phaseId,
        phaseOrder: phase.phaseOrder,
        imageFile: phase.imageFile,
        imageStatus: phase.imageStatus,
        assetVerification: phase.assetVerification,
        startSeconds: phase.startSeconds,
        endSeconds: phase.endSeconds,
        startFrame: Math.round(phase.startSeconds * 30),
        endFrame: Math.round(phase.endSeconds * 30),
        transitionIn: { type: firstShot ? 'none' : 'cut', durationSeconds: 0 },
        cameraMotion: phaseIndex === 0
          ? scene.cameraMotion
          : { type: 'none', startScale: 1, endScale: 1, panXPercent: 0, panYPercent: 0 },
        subtitles: [],
        soundEffects: phaseIndex === 0 ? scene.soundEffects : []
      });
    }
  }

  const renderPlan = {
    version: 5,
    reelId: reel.reelId,
    status: shots.every((shot) => shot.imageStatus === 'ready') && relativeAudio ? 'ready-for-renderer' : 'waiting-for-assets',
    imageCountMode: 'individual-per-reel',
    plannedImageCount: shots.length,
    composition: {
      width: 1080,
      height: 1920,
      fps: 30,
      durationSeconds: round(compositionDuration),
      durationFrames: Math.round(round(compositionDuration) * 30),
      audioDurationSeconds: round(voiceDuration),
      endingHoldSeconds: round(endingHoldSeconds)
    },
    voiceover: { file: relativeAudio, volume: 1 },
    backgroundMusic: effectsPlan.backgroundMusic ?? { enabled: false },
    subtitlesEnabled: false,
    scenes: shots
  };

  const report = qualityReport(
    reelDirectory,
    scenes,
    timelineScenes,
    subtitles,
    audioPath,
    durationKnown,
    timingStatus,
    strict,
    sceneTimingRules,
    endingHoldSeconds,
    voiceDuration
  );

  await writeJson(path.join(reelDirectory, 'timeline', 'timeline-plan.json'), timeline);
  await writeJson(path.join(reelDirectory, 'render', 'render-plan.json'), renderPlan);
  await writeJson(path.join(reelDirectory, 'review', 'final-video-report.json'), report);
  status.timeline = report.passed ? timingStatus : 'needs-review';
  status.subtitles = 'disabled';
  status.wordSync = 'not-required';
  status.plannedImageCount = shots.length;
  status.endingHold = report.checks.find((check) => check.id === 'ending-hold-range')?.passed ? 'ready' : 'needs-review';
  status.render = renderPlan.status;
  status.qualityControl = report.passed ? 'timeline-passed' : 'timeline-failed';
  await writeJson(path.join(reelDirectory, 'status.json'), status);
  return { timeline, renderPlan, qualityReport: report };
}
