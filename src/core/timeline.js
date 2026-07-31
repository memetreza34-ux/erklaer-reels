import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

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
      version: 1,
      audioDurationSeconds: null,
      audioFile: null,
      source: 'pending',
      timingStatus: 'waiting-for-audio',
      instructions: [
        'Trage die echte Audiodauer ein.',
        'cueTimeSeconds ist der Zeitpunkt, an dem audioCue gesprochen wird.',
        'Das Bild beginnt normalerweise leadInSeconds vor cueTimeSeconds.'
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

function subtitleTimeline(scenes, timings, subtitlePlan) {
  const global = Array.isArray(subtitlePlan?.cues) ? subtitlePlan.cues : [];
  const output = [];
  scenes.forEach((scene, sceneIndex) => {
    const timing = timings[sceneIndex];
    const local = global.filter((cue) => cue.sceneId === scene.sceneId);
    const source = local.length ? local : (Array.isArray(scene.subtitleCues) ? scene.subtitleCues : []);
    const cues = source.map((cue, index) => typeof cue === 'string'
      ? { id: `${scene.sceneId}-subtitle-${index + 1}`, sceneId: scene.sceneId, text: cue }
      : { ...cue, id: cue.id ?? `${scene.sceneId}-subtitle-${index + 1}`, sceneId: cue.sceneId ?? scene.sceneId })
      .filter((cue) => String(cue.text ?? '').trim());
    if (!cues.length) return;

    const exact = cues.every((cue) => numberOrNull(cue.startSeconds) !== null && numberOrNull(cue.endSeconds) > numberOrNull(cue.startSeconds));
    if (exact) {
      output.push(...cues.map((cue) => ({ ...cue, startSeconds: round(cue.startSeconds), endSeconds: round(cue.endSeconds) })));
      return;
    }

    const weights = cues.map((cue) => Math.max(1, String(cue.text).trim().split(/\s+/).length));
    const sum = weights.reduce((a, b) => a + b, 0) || 1;
    let cursor = timing.startSeconds;
    cues.forEach((cue, index) => {
      const end = index === cues.length - 1 ? timing.endSeconds : cursor + timing.durationSeconds * (weights[index] / sum);
      output.push({ ...cue, startSeconds: round(cursor), endSeconds: round(end), position: cue.position ?? 'lower-middle', timingStatus: 'estimated-within-scene' });
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

function qualityReport(reelDirectory, scenes, timelineScenes, subtitles, audioPath, durationKnown, timingStatus, strict) {
  const checks = [
    ['hook-starts-at-zero', timelineScenes[0]?.startSeconds === 0, 'Das Hook-Bild muss bei Sekunde 0 beginnen.', 'error'],
    ['scene-count-match', timelineScenes.length === scenes.length, 'Die Timeline benötigt genau einen Eintrag pro Szene.', 'error'],
    ['audio-present', Boolean(audioPath), 'Die Voice-over-Datei fehlt.', strict ? 'error' : 'warning'],
    ['audio-duration-known', durationKnown, 'Die Audiodauer ist noch nicht exakt bekannt.', strict ? 'error' : 'warning'],
    ['exact-audio-sync', timingStatus === 'audio-synced', 'Nicht alle Audio-Cues besitzen verifizierte Zeitstempel.', 'warning'],
    ['all-scene-images-ready', timelineScenes.every((scene) => scene.imageStatus === 'ready'), 'Noch nicht alle Szenenbilder sind bereit.', strict ? 'error' : 'warning']
  ].map(([id, passed, message, level]) => ({ id, passed, message, level }));

  timelineScenes.forEach((scene, index) => {
    checks.push({ id: `${scene.sceneId}-positive-duration`, passed: scene.durationSeconds > 0, level: 'error', message: `${scene.sceneId} benötigt eine positive Dauer.` });
    if (index) {
      const previous = timelineScenes[index - 1];
      checks.push({ id: `${scene.sceneId}-continuous`, passed: Math.abs(previous.endSeconds - scene.startSeconds) <= 0.01, level: 'error', message: `${scene.sceneId} erzeugt eine Lücke oder Überlappung.` });
    }
  });
  subtitles.slice(1).forEach((cue, index) => {
    const previous = subtitles[index];
    checks.push({ id: `${cue.id}-no-overlap`, passed: cue.startSeconds >= previous.endSeconds - 0.01, level: 'warning', message: `${cue.id} überlappt mit ${previous.id}.` });
  });

  const errors = checks.filter((check) => !check.passed && check.level === 'error');
  const warnings = checks.filter((check) => !check.passed && check.level === 'warning');
  return {
    createdAt: new Date().toISOString(),
    reelDirectory: reelDirectory.split(path.sep).join('/'),
    stage: 'pre-render',
    passed: errors.length === 0,
    summary: { passedChecks: checks.filter((check) => check.passed).length, failedChecks: errors.length, warnings: warnings.length, totalChecks: checks.length },
    checks
  };
}

export async function buildMasterTimeline(reelDirectory, { audioDurationSeconds = null, strict = false, probeAudio = true } = {}) {
  const reel = await readJson(path.join(reelDirectory, 'reel.json'));
  const scenes = await readJson(path.join(reelDirectory, 'scenes', 'scene-index.json'), []);
  if (!reel) throw new Error('reel.json wurde nicht gefunden.');
  if (!scenes.length) throw new Error('scenes/scene-index.json enthält keine Szenen.');

  const subtitlesPlan = await readJson(path.join(reelDirectory, 'subtitles', 'subtitle-plan.json'), { cues: [] });
  const effectsPlan = await readJson(path.join(reelDirectory, 'effects', 'effects-plan.json'), { scenes: [] });
  const manifest = await readJson(path.join(reelDirectory, 'assets-manifest.json'), { audio: {}, scenes: [] });
  const status = await readJson(path.join(reelDirectory, 'status.json'), {});
  const audioSync = await ensureAudioSync(reelDirectory, scenes);
  const audioPath = await findAudioPath(reelDirectory, manifest);

  const explicit = numberOrNull(audioDurationSeconds) ?? numberOrNull(audioSync.audioDurationSeconds);
  const probed = explicit === null && probeAudio ? await probeAudioDuration(audioPath) : null;
  const planned = scenes.reduce((sum, scene) => sum + Math.max(0, numberOrNull(scene.durationSeconds) ?? 0), 0);
  const totalDuration = explicit ?? probed ?? (planned > 0 ? planned : numberOrNull(reel.targetDurationSeconds) ?? 45);
  const durationKnown = explicit !== null || probed !== null;
  const timing = createTimings(scenes, totalDuration, audioSync);
  const effectByScene = new Map((effectsPlan.scenes ?? []).map((scene) => [scene.sceneId, scene]));
  const manifestByScene = new Map((manifest.scenes ?? []).map((scene) => [scene.sceneId, scene]));
  const subtitles = subtitleTimeline(scenes, timing.scenes, subtitlesPlan);

  const timelineScenes = timing.scenes.map((item, index) => {
    const scene = scenes[index];
    const effect = effectByScene.get(scene.sceneId) ?? {};
    const asset = manifestByScene.get(scene.sceneId) ?? {};
    return {
      ...item,
      title: scene.title ?? '',
      narration: scene.narration ?? '',
      imageText: scene.imageText ?? '',
      imageFile: asset.expectedFile ?? `scenes/${scene.sceneId}/${scene.expectedImageFileName ?? `${scene.sceneId}.png`}`,
      imageStatus: asset.status ?? scene.imageStatus ?? 'missing',
      subtitleCueIds: subtitles.filter((cue) => cue.sceneId === scene.sceneId).map((cue) => cue.id),
      transitionIn: effect.transitionIn ?? { type: index ? 'cut' : 'none', durationSeconds: 0 },
      cameraMotion: effect.cameraMotion ?? { type: 'none', startScale: 1, endScale: 1, panXPercent: 0, panYPercent: 0 },
      soundEffects: soundTimeline(effect, item)
    };
  });

  const allCuesExact = timing.totalCueCount === 0 || timing.exactCueCount === timing.totalCueCount;
  const timingStatus = durationKnown && allCuesExact ? 'audio-synced' : durationKnown ? 'audio-duration-synced' : 'estimated';
  const relativeAudio = audioPath ? path.relative(reelDirectory, audioPath).split(path.sep).join('/') : null;
  const timeline = {
    version: 1,
    reelId: reel.reelId,
    createdAt: new Date().toISOString(),
    timingStatus,
    audio: { file: relativeAudio, durationSeconds: round(totalDuration), durationSource: explicit !== null ? 'audio-sync-or-cli' : probed !== null ? 'ffprobe' : 'planned-scenes', exactDurationKnown: durationKnown },
    composition: { width: 1080, height: 1920, fps: 30 },
    subtitles: { planFile: 'subtitles/subtitle-plan.json', cues: subtitles },
    effectsPlanFile: 'effects/effects-plan.json',
    scenes: timelineScenes
  };

  const renderPlan = {
    version: 1,
    reelId: reel.reelId,
    status: timelineScenes.every((scene) => scene.imageStatus === 'ready') && relativeAudio ? 'ready-for-renderer' : 'waiting-for-assets',
    composition: { width: 1080, height: 1920, fps: 30, durationSeconds: round(totalDuration), durationFrames: Math.ceil(totalDuration * 30) },
    voiceover: { file: relativeAudio, volume: 1 },
    backgroundMusic: effectsPlan.backgroundMusic ?? { enabled: false },
    scenes: timelineScenes.map((scene) => ({
      sceneId: scene.sceneId,
      imageFile: scene.imageFile,
      startSeconds: scene.startSeconds,
      endSeconds: scene.endSeconds,
      startFrame: Math.round(scene.startSeconds * 30),
      endFrame: Math.round(scene.endSeconds * 30),
      transitionIn: scene.transitionIn,
      cameraMotion: scene.cameraMotion,
      subtitles: subtitles.filter((cue) => cue.sceneId === scene.sceneId),
      soundEffects: scene.soundEffects
    }))
  };
  const report = qualityReport(reelDirectory, scenes, timelineScenes, subtitles, audioPath, durationKnown, timingStatus, strict);

  await writeJson(path.join(reelDirectory, 'timeline', 'timeline-plan.json'), timeline);
  await writeJson(path.join(reelDirectory, 'render', 'render-plan.json'), renderPlan);
  await writeJson(path.join(reelDirectory, 'review', 'final-video-report.json'), report);
  status.timeline = report.passed ? timingStatus : 'needs-review';
  status.render = renderPlan.status;
  status.qualityControl = report.passed ? 'timeline-passed' : 'timeline-failed';
  await writeJson(path.join(reelDirectory, 'status.json'), status);
  return { timeline, renderPlan, qualityReport: report };
}
