import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg']);

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function readJson(filePath, fallback = null) {
  try { return JSON.parse(await readFile(filePath, 'utf8')); } catch { return fallback; }
}

function resolveInside(root, relativePath) {
  const absoluteRoot = path.resolve(root);
  const resolved = path.resolve(absoluteRoot, String(relativePath ?? ''));
  const relative = path.relative(absoluteRoot, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Pfad verlässt das YouTube-Projekt: ${relativePath}`);
  return resolved;
}

function add(checks, id, passed, message, level = 'error') {
  checks.push({ id, passed: Boolean(passed), message, level });
}

function finish(checks, plan, video) {
  const failedErrors = checks.filter((entry) => !entry.passed && entry.level === 'error');
  return {
    schemaVersion: 1,
    passed: failedErrors.length === 0,
    checks,
    summary: {
      totalChecks: checks.length,
      passedChecks: checks.filter((entry) => entry.passed).length,
      failedChecks: failedErrors.length,
      warnings: checks.filter((entry) => !entry.passed && entry.level === 'warning').length
    },
    plan,
    video
  };
}

export async function validateYoutubeRendererInput(projectDirectory, { requireFinalReadiness = true } = {}) {
  const root = path.resolve(projectDirectory);
  const checks = [];
  const video = await readJson(path.join(root, 'video.json'), {});
  const plan = await readJson(path.join(root, '08-edit', 'render-plan.json'), null);
  const readiness = await readJson(path.join(root, '08-edit', 'final-readiness.json'), {});

  add(checks, 'render-plan', Boolean(plan), '08-edit/render-plan.json fehlt.');
  if (!plan) return finish(checks, null, video);

  add(checks, 'video-format', video.format === 'youtube-longform', 'video.json muss youtube-longform verwenden.');
  add(checks, 'video-style', video.visualStyleId === 'german-simple-explainer-cartoon', 'Falsche YouTube-Bildwelt.');
  add(checks, 'video-subtitles-disabled', video.subtitlesEnabled === false, 'YouTube-Untertitel müssen im Video deaktiviert sein.');
  add(checks, 'video-text-cards-disabled', video.textCardsEnabled === false, 'Redaktionelle Textkarten müssen deaktiviert sein.');
  add(checks, 'plan-subtitles-empty', Array.isArray(plan.subtitles) && plan.subtitles.length === 0, 'Der Renderplan darf keine Untertitel enthalten.');
  add(checks, 'background-music-absent', !plan.backgroundMusic?.file, 'Hintergrundmusik ist im aktuellen YouTube-Standard deaktiviert.');

  const composition = plan.composition ?? {};
  const fps = Number(composition.fps);
  const durationFrames = Number(composition.durationFrames);
  const durationMinutes = durationFrames / fps / 60;
  const minimumMinutes = Number(video?.targetDurationMinutes?.min ?? 8);
  const maximumMinutes = Number(video?.targetDurationMinutes?.max ?? 12);
  add(checks, 'composition-width', Number(composition.width) === 1920, 'YouTube-Renderbreite muss 1920 sein.');
  add(checks, 'composition-height', Number(composition.height) === 1080, 'YouTube-Renderhöhe muss 1080 sein.');
  add(checks, 'composition-fps', fps === 30, 'YouTube-Renderer erwartet 30 FPS.');
  add(checks, 'composition-duration-frames', Number.isInteger(durationFrames) && durationFrames > 0, 'durationFrames muss eine positive Ganzzahl sein.');
  add(checks, 'composition-duration-minutes', Number.isFinite(durationMinutes) && durationMinutes >= minimumMinutes && durationMinutes <= maximumMinutes,
    `Videodauer muss zwischen ${minimumMinutes} und ${maximumMinutes} Minuten liegen.`);

  add(checks, 'render-status', plan.status === 'ready-for-renderer', 'Renderplan ist noch nicht ready-for-renderer.', requireFinalReadiness ? 'error' : 'warning');
  for (const [key, label] of [
    ['readyForRenderer', 'Renderer-Freigabe'],
    ['sourceQualityPassed', 'Quellen-QC'],
    ['visualQcPassed', 'visuelle Zwei-Pass-QC'],
    ['audioQualityPassed', 'Audio-QC'],
    ['subtitleAbsencePassed', 'Untertitelfreiheit']
  ]) {
    add(checks, `readiness-${key}`, readiness[key] === true, `${label} ist nicht bestanden.`, requireFinalReadiness ? 'error' : 'warning');
  }

  const voiceFile = plan.voiceover?.file;
  add(checks, 'voiceover-file', Boolean(voiceFile), 'Voice-over-Datei fehlt im Renderplan.');
  if (voiceFile) {
    try {
      const resolved = resolveInside(root, voiceFile);
      add(checks, 'voiceover-format', AUDIO_EXTENSIONS.has(path.extname(resolved).toLowerCase()), 'Nicht unterstütztes Voice-over-Format.');
      add(checks, 'voiceover-present', await exists(resolved), `Voice-over nicht gefunden: ${voiceFile}`);
    } catch (error) {
      add(checks, 'voiceover-safe-path', false, error.message);
    }
  }

  const scenes = Array.isArray(plan.scenes) ? plan.scenes : [];
  add(checks, 'scenes-present', scenes.length > 0, 'Der YouTube-Renderplan enthält keine Szenen.');
  add(checks, 'scene-count', scenes.length === Number(video.sceneCount), `Renderplan benötigt exakt ${video.sceneCount} Szenen.`);
  let previousEnd = 0;
  for (let index = 0; index < scenes.length; index += 1) {
    const scene = scenes[index];
    const id = scene.sceneId ?? `scene-${index + 1}`;
    const start = Number(scene.startFrame);
    const end = Number(scene.endFrame);
    add(checks, `${id}-range`, Number.isInteger(start) && Number.isInteger(end) && end > start, `${id}: ungültiger Framebereich.`);
    add(checks, `${id}-continuous`, index === 0 ? start === 0 : start === previousEnd, `${id}: Lücke oder Überlappung im Renderplan.`);
    previousEnd = end;
    add(checks, `${id}-no-subtitles`, !Array.isArray(scene.subtitles) || scene.subtitles.length === 0, `${id}: Untertitel sind verboten.`);
    add(checks, `${id}-no-text-card`, !scene.textOverlay && !scene.caption && !scene.titleCard, `${id}: Textkarten sind verboten.`);
    const expectedTransition = index === 0 ? 'none' : 'cut';
    add(checks, `${id}-hard-cut`, (scene.transitionIn?.type ?? expectedTransition) === expectedTransition && Number(scene.transitionIn?.durationSeconds ?? 0) === 0,
      `${id}: nur direkte harte Schnitte sind erlaubt.`);
    const motion = scene.cameraMotion ?? {};
    const scales = [Number(motion.startScale ?? 1), Number(motion.endScale ?? 1)];
    add(checks, `${id}-motion-scale`, scales.every((value) => value >= 0.92 && value <= 1.08), `${id}: Zoom liegt außerhalb 0,92–1,08.`);
    add(checks, `${id}-motion-pan`, Math.abs(Number(motion.panXPercent ?? 0)) <= 4 && Math.abs(Number(motion.panYPercent ?? 0)) <= 4,
      `${id}: Schwenk darf höchstens 4 Prozent betragen.`);
    if (!scene.imageFile) {
      add(checks, `${id}-image`, false, `${id}: imageFile fehlt.`);
    } else {
      try {
        const resolved = resolveInside(root, scene.imageFile);
        add(checks, `${id}-image-format`, IMAGE_EXTENSIONS.has(path.extname(resolved).toLowerCase()), `${id}: nicht unterstütztes Bildformat.`);
        add(checks, `${id}-image-present`, await exists(resolved), `${id}: Bild fehlt: ${scene.imageFile}`);
      } catch (error) {
        add(checks, `${id}-image-safe-path`, false, error.message);
      }
    }
  }
  add(checks, 'timeline-end', scenes.length > 0 && previousEnd === durationFrames, 'Die letzte Szene muss exakt mit durationFrames enden.');
  return finish(checks, plan, video);
}
