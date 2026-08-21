import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg']);
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(currentDirectory, '..', '..', 'config', 'youtube-production.json');

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function text(filePath) {
  try { return (await readFile(filePath, 'utf8')).trim(); } catch { return ''; }
}

async function json(filePath, fallback = null) {
  try { return JSON.parse(await readFile(filePath, 'utf8')); } catch { return fallback; }
}

async function files(directory, extensions) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => path.join(directory, entry.name));
  } catch { return []; }
}

function imageNumber(filePath) {
  const name = path.basename(filePath, path.extname(filePath));
  const match = name.match(/^(?:bild[\s_-]*)?(\d{1,3})$/i);
  return match ? Number(match[1]) : null;
}

function check(id, passed, message) {
  return { id, passed: Boolean(passed), message };
}

function sourceUrls(value) {
  return [...String(value).matchAll(/https:\/\/[^\s)>\]]+/g)].map((match) => match[0]);
}

export async function verifyYoutubeHandoff(projectDirectory) {
  const root = path.resolve(projectDirectory);
  const config = await json(configPath, {});
  const video = await json(path.join(root, 'video.json'), {});
  const scenes = await json(path.join(root, '03-szenen', 'scene-plan.json'), []);
  const voiceScript = await text(path.join(root, '02-script', 'voice-script.txt'));
  const sources = await text(path.join(root, '01-recherche', 'sources.md'));
  const wordCount = voiceScript.split(/\s+/).filter(Boolean).length;
  const targetMinutes = Number(video?.targetDurationMinutes?.target ?? config?.durationMinutes?.target);
  const minimumWords = Math.floor(targetMinutes * 120);
  const maximumWords = Math.ceil(targetMinutes * 170);

  const incompleteScenes = scenes.filter((scene) =>
    !scene.sceneId || !String(scene.narration ?? '').trim() || !String(scene.audioCue ?? '').trim() ||
    !String(scene.visualIdea ?? '').trim() || !String(scene.imagePrompt ?? '').trim()
  );
  const allowedSceneModes = new Set((config?.visualWorld?.sceneModes ?? []).map((mode) => mode.id));
  const invalidSceneModes = scenes.filter((scene) => !allowedSceneModes.has(scene.sceneMode));
  const sceneModeMixPassed = [...allowedSceneModes].every((modeId) => {
    const target = config.visualWorld.sceneModes.find((mode) => mode.id === modeId).targetPercent;
    const actual = scenes.length ? scenes.filter((scene) => scene.sceneMode === modeId).length * 100 / scenes.length : 0;
    return Math.abs(actual - target) <= 3;
  });
  const phase1Checks = [
    check('format', video.format === 'youtube-longform', 'Format youtube-longform'),
    check('dimensions', video.aspectRatio === '16:9' && Number(video.width) === 1920 && Number(video.height) === 1080, '16:9 mit 1920 × 1080'),
    check('visual-world', video.visualStyleId === config.visualWorld.id, `Bildwelt ${config.visualWorld.id}`),
    check('no-subtitles', video.subtitlesEnabled === false && video.textCardsEnabled === false, 'Untertitel und Textkarten deaktiviert'),
    check('single-narrator', Number(video.narratorCount) === 1, 'genau ein Erzähler'),
    check('scene-count', Number.isInteger(video.sceneCount) && video.sceneCount >= config.sceneCount.min && video.sceneCount <= config.sceneCount.max, `${config.sceneCount.min} bis ${config.sceneCount.max} Szenen`),
    check('scene-plan', scenes.length === video.sceneCount, 'Szenenplan vollständig'),
    check('scene-content', incompleteScenes.length === 0, incompleteScenes.length ? `${incompleteScenes.length} Szenen sind unvollständig` : 'Szenen vollständig'),
    check('scene-modes', invalidSceneModes.length === 0 && sceneModeMixPassed, '45 % Minimal-Vignetten, 25 % Objekt-Erklärbilder, 30 % reduzierte Umgebungen'),
    check('voice-script', wordCount >= minimumWords && wordCount <= maximumWords, `Voice-Script ${minimumWords} bis ${maximumWords} Wörter für ${targetMinutes} Minuten`),
    check('sources', new Set(sourceUrls(sources)).size >= config.script.minimumSources, `mindestens ${config.script.minimumSources} HTTPS-Quellen`),
    check('idea-brief', (await text(path.join(root, '00-idee', 'brief.md'))).length > 100, 'Ideenbrief ausgefüllt'),
    check('outline', (await text(path.join(root, '02-script', 'outline.md'))).length > 200, 'Outline ausgefüllt'),
    check('prompt-bundle', (await text(path.join(root, '04-bildprompts', 'all-image-prompts.txt'))).length > 500, 'Google-Flow-Sammeldatei ausgefüllt'),
    check('thumbnail-brief', (await text(path.join(root, '07-thumbnail', 'thumbnail-brief.md'))).length > 200, 'Thumbnail-Brief ausgefüllt'),
    check('thumbnail-prompt', (await text(path.join(root, '07-thumbnail', 'thumbnail-prompt.txt'))).length > 180, 'Thumbnail-Prompt ausgefüllt'),
    check('upload-title', (await text(path.join(root, '09-upload', 'title-options.txt'))).length > 20, 'Titeloptionen vorhanden'),
    check('upload-description', (await text(path.join(root, '09-upload', 'description.txt'))).length > 100, 'Beschreibung vorhanden'),
    check('upload-chapters', (await text(path.join(root, '09-upload', 'chapters.txt'))).length > 30, 'Kapitel vorhanden')
  ];

  const images = await files(path.join(root, '05-assets', 'numbered-images'), IMAGE_EXTENSIONS);
  const indexes = images.map(imageNumber).filter(Number.isInteger);
  const unique = new Set(indexes);
  const expected = Array.from({ length: Number(video.sceneCount) + 1 }, (_, index) => index);
  const completeImages = images.length === expected.length && unique.size === expected.length && expected.every((index) => unique.has(index));
  const audio = await files(path.join(root, '06-audio', 'inbox'), AUDIO_EXTENSIONS);
  const phase2Checks = [
    check('complete-image-series', completeImages, `eindeutige Serie Bild 00 bis Bild ${String(video.sceneCount).padStart(2, '0')}`),
    check('voiceover', audio.length === 1, audio.length > 1 ? 'Mehrere Voice-over-Dateien sind nicht eindeutig' : 'genau eine Voice-over-Datei')
  ];

  const phase1Ready = phase1Checks.every((entry) => entry.passed);
  const phase2Ready = phase2Checks.every((entry) => entry.passed);
  return {
    schemaVersion: 1,
    projectDirectory: root,
    format: 'youtube-longform',
    phase1: { owner: 'chatgpt', ready: phase1Ready, checks: phase1Checks },
    phase2: { owner: 'user', ready: phase2Ready, checks: phase2Checks },
    phase3: { owner: 'antigravity', ready: phase1Ready && phase2Ready },
    passed: phase1Ready && phase2Ready
  };
}
