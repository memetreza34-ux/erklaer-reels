import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const WEEKDAYS_DE = [
  'sonntag',
  'montag',
  'dienstag',
  'mittwoch',
  'donnerstag',
  'freitag',
  'samstag'
];

export function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatDate(date) {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}`;
}

export function getIsoWeek(date) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
  return { year: utc.getUTCFullYear(), week };
}

export function getWeekRange(date) {
  const current = new Date(date);
  const day = current.getDay() || 7;
  const monday = new Date(current);
  monday.setDate(current.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
}

async function writeText(filePath, content = '') {
  await writeFile(filePath, content, 'utf8');
}

async function writeJson(filePath, value) {
  await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function nextReelNumber(dayDirectory) {
  try {
    const entries = await readdir(dayDirectory, { withFileTypes: true });
    const numbers = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name.match(/^reel-(\d+)_/))
      .filter(Boolean)
      .map((match) => Number(match[1]));
    return Math.max(0, ...numbers) + 1;
  } catch {
    return 1;
  }
}

export async function createReelWorkspace({
  title,
  script,
  date = new Date(),
  sceneCount = 9,
  outputRoot = 'content'
}) {
  if (!title?.trim()) throw new Error('Ein Titel ist erforderlich.');
  if (!script?.trim()) throw new Error('Ein Script ist erforderlich.');
  if (!Number.isInteger(sceneCount) || sceneCount < 8 || sceneCount > 10) {
    throw new Error('sceneCount muss zwischen 8 und 10 liegen.');
  }

  const parsedDate = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsedDate.getTime())) throw new Error('Ungültiges Datum.');

  const { year, week } = getIsoWeek(parsedDate);
  const { monday, sunday } = getWeekRange(parsedDate);
  const weekDirectoryName = `${year}-KW${pad(week)}_${formatDate(monday)}_bis_${formatDate(sunday)}`;
  const weekday = WEEKDAYS_DE[parsedDate.getDay()];
  const dayDirectory = path.join(outputRoot, weekDirectoryName, weekday);

  await mkdir(dayDirectory, { recursive: true });
  const reelNumber = await nextReelNumber(dayDirectory);
  const reelId = `reel-${pad(reelNumber)}_${slugify(title)}`;
  const reelDirectory = path.join(dayDirectory, reelId);

  const directories = [
    'script',
    'audio',
    'scenes',
    'cover',
    'caption',
    'sources',
    'review',
    'inbox/images',
    'inbox/audio',
    'inbox/processed'
  ];

  await Promise.all(directories.map((directory) => mkdir(path.join(reelDirectory, directory), { recursive: true })));

  const sceneIndex = [];
  for (let index = 1; index <= sceneCount; index += 1) {
    const sceneId = `scene-${pad(index)}`;
    const sceneDirectory = path.join(reelDirectory, 'scenes', sceneId);
    await mkdir(sceneDirectory, { recursive: true });

    const scene = {
      sceneId,
      order: index,
      title: index === 1 ? 'Hook' : `Bildmoment ${index}`,
      narration: '',
      imageText: '',
      visualIdea: '',
      expectedImageFileName: `${sceneId}.png`,
      status: 'planned'
    };

    sceneIndex.push(scene);
    await writeJson(path.join(sceneDirectory, 'scene.json'), scene);
    await writeText(path.join(sceneDirectory, 'image-prompt.txt'), '');
  }

  const reel = {
    reelId,
    title: title.trim(),
    topicArea: '',
    date: parsedDate.toISOString().slice(0, 10),
    language: 'de',
    promptLanguage: 'en',
    aspectRatio: '9:16',
    sceneCount,
    visualStyleId: '',
    status: 'workspace-created'
  };

  await writeJson(path.join(reelDirectory, 'reel.json'), reel);
  await writeJson(path.join(reelDirectory, 'status.json'), {
    script: 'provided',
    scenes: 'planned',
    audio: 'missing',
    imagePrompts: 'missing',
    images: 'missing',
    cover: 'missing',
    assetMatching: 'waiting-for-files',
    qualityControl: 'pending'
  });
  await writeJson(path.join(reelDirectory, 'assets-manifest.json'), {
    audio: { expectedFile: 'audio/voiceover.mp3', status: 'missing' },
    scenes: sceneIndex.map((scene) => ({
      sceneId: scene.sceneId,
      expectedFile: `scenes/${scene.sceneId}/${scene.expectedImageFileName}`,
      status: 'missing'
    })),
    cover: { expectedFile: 'cover/cover.png', status: 'missing' }
  });

  await writeText(path.join(reelDirectory, 'script', 'raw-script.txt'), `${script.trim()}\n`);
  await writeText(path.join(reelDirectory, 'script', 'final-script.txt'), `${script.trim()}\n`);
  await writeText(path.join(reelDirectory, 'script', 'voice-script.txt'), `${script.trim()}\n`);
  await writeText(path.join(reelDirectory, 'audio', '.gitkeep'));
  await writeJson(path.join(reelDirectory, 'scenes', 'scene-index.json'), sceneIndex);
  await writeText(path.join(reelDirectory, 'cover', 'cover-prompt.txt'));
  await writeJson(path.join(reelDirectory, 'cover', 'cover.json'), {
    title: '',
    expectedImageFileName: 'cover.png',
    status: 'planned'
  });
  await writeText(path.join(reelDirectory, 'caption', 'caption.txt'));
  await writeText(path.join(reelDirectory, 'sources', 'sources.md'), '# Quellen\n\n');
  await writeText(path.join(reelDirectory, 'review', 'notes.md'), '# Review-Notizen\n\n');
  await writeJson(path.join(reelDirectory, 'review', 'quality-report.json'), {
    passed: false,
    checks: [],
    notes: []
  });
  await writeText(path.join(reelDirectory, 'inbox', 'images', '.gitkeep'));
  await writeText(path.join(reelDirectory, 'inbox', 'audio', '.gitkeep'));
  await writeText(path.join(reelDirectory, 'inbox', 'processed', '.gitkeep'));
  await writeJson(path.join(reelDirectory, 'inbox', 'asset-map.json'), {
    version: 1,
    generatedBy: '',
    assignments: [],
    unmatched: []
  });

  return { reelDirectory, reel };
}
