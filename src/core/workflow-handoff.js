import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg']);

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readText(filePath) {
  try {
    return (await readFile(filePath, 'utf8')).trim();
  } catch {
    return '';
  }
}

async function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

async function mediaFiles(directory, extensions) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => path.join(directory, entry.name));
  } catch {
    return [];
  }
}

function check(id, passed, message) {
  return { id, passed: Boolean(passed), message };
}

function numberedImageIndex(filePath) {
  const baseName = path.basename(filePath, path.extname(filePath));
  const match = baseName.match(/^(?:bild[\s_-]*)?(\d{1,2})$/i);
  return match ? Number(match[1]) : null;
}

export async function verifyWorkflowHandoff(reelDirectory) {
  const absoluteDirectory = path.resolve(reelDirectory);
  const configPath = new URL('../../config/workflow-phases.json', import.meta.url);
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  const reel = await readJson(path.join(absoluteDirectory, 'reel.json'), {});
  const scenes = await readJson(path.join(absoluteDirectory, 'scenes', 'scene-index.json'), []);
  const manifest = await readJson(path.join(absoluteDirectory, 'assets-manifest.json'), {});
  const sceneCount = Number(reel.sceneCount);

  const phase1Checks = [
    check('scene-count', Number.isInteger(sceneCount) && sceneCount >= 12 && sceneCount <= 14, '12 bis 14 Szenen'),
    check('scene-index', scenes.length === sceneCount, 'Szenenindex vollständig'),
    check('visual-world', config.allowedVisualWorlds.includes(reel.visualStyleId), 'eine der drei erlaubten Bildwelten'),
    check('visual-world-reason', Boolean(String(reel.visualStyleReason ?? '').trim()), 'Bildwelt konkret begründet'),
    check('voice-script', Boolean(await readText(path.join(absoluteDirectory, 'script', 'voice-script.txt'))), 'Voice-Script vorhanden'),
    check('cover-prompt', Boolean(await readText(path.join(absoluteDirectory, 'cover', 'cover-prompt.txt'))), 'Cover-Prompt vorhanden'),
    check('prompt-bundle', Boolean(await readText(path.join(absoluteDirectory, 'all-image-prompts', 'all-image-prompts.txt'))), 'Google-Flow-Sammeldatei vorhanden'),
    check('caption', Boolean(await readText(path.join(absoluteDirectory, 'caption', 'caption.txt'))), 'Caption vorhanden'),
    check('sources', (await readText(path.join(absoluteDirectory, 'sources', 'sources.md'))).replace(/^# Quellen\s*/i, '').length > 0, 'Quellen vorhanden')
  ];

  const incompleteScenes = [];
  for (const scene of scenes) {
    const sceneId = scene.sceneId;
    const prompt = await readText(path.join(absoluteDirectory, 'scenes', sceneId, 'image-prompt.txt'));
    if (!sceneId || !String(scene.narration ?? '').trim() || !String(scene.visualIdea ?? '').trim() || !String(scene.audioCue ?? '').trim() || !prompt) {
      incompleteScenes.push(sceneId ?? 'unbekannt');
    }
  }
  phase1Checks.push(check('complete-scenes', incompleteScenes.length === 0, incompleteScenes.length ? `Unvollständig: ${incompleteScenes.join(', ')}` : 'Szenen und Prompts vollständig'));

  const numberedImages = await mediaFiles(path.join(absoluteDirectory, 'inbox', 'numbered-images'), IMAGE_EXTENSIONS);
  const numberedIndexes = numberedImages.map(numberedImageIndex).filter(Number.isInteger);
  const uniqueNumberedIndexes = new Set(numberedIndexes);
  const expectedNumberedIndexes = Array.from({ length: sceneCount + 1 }, (_, index) => index);
  const finalCover = (await mediaFiles(path.join(absoluteDirectory, 'cover'), IMAGE_EXTENSIONS)).length > 0;
  let finalSceneImages = 0;
  for (const scene of scenes) {
    const files = await mediaFiles(path.join(absoluteDirectory, 'scenes', scene.sceneId), IMAGE_EXTENSIONS);
    if (files.length > 0) finalSceneImages += 1;
  }
  const completeNumberedSeries = numberedImages.length === sceneCount + 1 &&
    uniqueNumberedIndexes.size === sceneCount + 1 &&
    expectedNumberedIndexes.every((index) => uniqueNumberedIndexes.has(index));
  const completeFinalImages = finalCover && finalSceneImages === sceneCount;

  const audioFiles = [
    ...await mediaFiles(path.join(absoluteDirectory, 'inbox', 'audio'), AUDIO_EXTENSIONS),
    ...await mediaFiles(path.join(absoluteDirectory, 'audio'), AUDIO_EXTENSIONS)
  ];
  const declaredAudio = manifest?.audio?.expectedFile
    ? path.join(absoluteDirectory, manifest.audio.expectedFile)
    : null;
  const declaredAudioExists = declaredAudio && AUDIO_EXTENSIONS.has(path.extname(declaredAudio).toLowerCase()) && await exists(declaredAudio);
  const unambiguousAudio = declaredAudioExists || audioFiles.length === 1;
  const phase2Checks = [
    check('complete-image-series', completeNumberedSeries || completeFinalImages, `Cover plus ${sceneCount} Szenenbilder`),
    check('voice-audio', unambiguousAudio, audioFiles.length > 1 && !declaredAudioExists ? 'Mehrere Voice-over-Dateien sind nicht eindeutig' : 'Voice-over-Audio vorhanden')
  ];

  const phase1Ready = phase1Checks.every((entry) => entry.passed);
  const phase2Ready = phase2Checks.every((entry) => entry.passed);
  return {
    version: config.version,
    runtimeOwner: config.runtimeOwner,
    reelDirectory: absoluteDirectory,
    phase1: { owner: 'chatgpt', ready: phase1Ready, checks: phase1Checks },
    phase2: { owner: 'user', ready: phase2Ready, checks: phase2Checks },
    phase3: { owner: 'antigravity', ready: phase1Ready && phase2Ready },
    passed: phase1Ready && phase2Ready
  };
}
