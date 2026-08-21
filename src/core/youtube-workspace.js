import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { slugify } from './workspace.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, '..', '..');
const templateDirectory = path.join(repositoryRoot, 'youtube', 'templates', 'video-template');
const configPath = path.join(repositoryRoot, 'config', 'youtube-production.json');

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function nextVideoNumber(outputRoot) {
  try {
    const entries = await readdir(outputRoot, { withFileTypes: true });
    const numbers = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name.match(/^video-(\d+)_/))
      .filter(Boolean)
      .map((match) => Number(match[1]));
    return Math.max(0, ...numbers) + 1;
  } catch {
    return 1;
  }
}

function buildSceneModeSequence(sceneCount, modes) {
  const normalized = modes.map((mode) => ({
    id: mode.id,
    exact: sceneCount * Number(mode.targetPercent) / 100
  }));
  const counts = normalized.map((mode) => Math.floor(mode.exact));
  let remaining = sceneCount - counts.reduce((sum, value) => sum + value, 0);
  const remainderOrder = normalized
    .map((mode, index) => ({ index, remainder: mode.exact - Math.floor(mode.exact) }))
    .sort((a, b) => b.remainder - a.remainder);
  for (let index = 0; index < remaining; index += 1) counts[remainderOrder[index].index] += 1;

  const used = counts.map(() => 0);
  return Array.from({ length: sceneCount }, (_, sceneIndex) => {
    let selected = 0;
    let highestDeficit = -Infinity;
    for (let modeIndex = 0; modeIndex < counts.length; modeIndex += 1) {
      if (used[modeIndex] >= counts[modeIndex]) continue;
      const expected = ((sceneIndex + 1) * counts[modeIndex]) / sceneCount;
      const deficit = expected - used[modeIndex];
      if (deficit > highestDeficit) {
        highestDeficit = deficit;
        selected = modeIndex;
      }
    }
    used[selected] += 1;
    return normalized[selected].id;
  });
}

export async function createYoutubeWorkspace({
  title,
  topic = '',
  outputRoot = path.join('youtube', 'projects'),
  targetDurationMinutes = null,
  sceneCount = null,
  now = new Date()
}) {
  if (!String(title ?? '').trim()) throw new Error('Ein YouTube-Titel ist erforderlich.');
  const config = await readJson(configPath);
  const duration = Number(targetDurationMinutes ?? config.durationMinutes.target);
  const scenes = Number(sceneCount ?? config.sceneCount.target);
  if (!Number.isFinite(duration) || duration < config.durationMinutes.min || duration > config.durationMinutes.max) {
    throw new Error(`targetDurationMinutes muss zwischen ${config.durationMinutes.min} und ${config.durationMinutes.max} liegen.`);
  }
  if (!Number.isInteger(scenes) || scenes < config.sceneCount.min || scenes > config.sceneCount.max) {
    throw new Error(`sceneCount muss zwischen ${config.sceneCount.min} und ${config.sceneCount.max} liegen.`);
  }

  await mkdir(outputRoot, { recursive: true });
  const number = await nextVideoNumber(outputRoot);
  const videoId = `video-${String(number).padStart(2, '0')}_${slugify(title)}`;
  const projectDirectory = path.join(outputRoot, videoId);
  await cp(templateDirectory, projectDirectory, { recursive: true, errorOnExist: true });

  const createdAt = now.toISOString();
  const video = await readJson(path.join(projectDirectory, 'video.json'));
  Object.assign(video, {
    videoId,
    title: title.trim(),
    topic: String(topic ?? '').trim(),
    status: 'phase-1-draft',
    targetDurationMinutes: {
      min: config.durationMinutes.min,
      target: duration,
      max: config.durationMinutes.max,
      mode: 'approximate'
    },
    sceneCount: scenes,
    createdAt,
    updatedAt: createdAt
  });
  await writeJson(path.join(projectDirectory, 'video.json'), video);

  const sceneModes = buildSceneModeSequence(scenes, config.visualWorld.sceneModes);
  const scenePlan = Array.from({ length: scenes }, (_, index) => ({
    sceneId: `scene-${String(index + 1).padStart(3, '0')}`,
    order: index + 1,
    sceneMode: sceneModes[index],
    narration: '',
    audioCue: '',
    visualIdea: '',
    continuityNotes: '',
    imagePrompt: '',
    expectedImageFile: `05-assets/numbered-images/Bild ${String(index + 1).padStart(2, '0')}.png`,
    status: 'phase-1-pending'
  }));
  await writeJson(path.join(projectDirectory, '03-szenen', 'scene-plan.json'), scenePlan);

  const status = await readJson(path.join(projectDirectory, 'status.json'));
  status.videoId = videoId;
  status.phase = 'phase-1-chatgpt';
  status.phase3Handoff = 'not-ready';
  await writeJson(path.join(projectDirectory, 'status.json'), status);

  return { projectDirectory, video, scenePlan };
}
