#!/usr/bin/env node

import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

export function parseUploadMarkdown(markdown) {
  const lines = String(markdown ?? '').split(/\r?\n/);
  const sections = {};
  let key = null;
  let buffer = [];

  const commit = () => {
    if (!key) return;
    sections[key] = buffer.join('\n').trim();
  };

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      commit();
      const heading = match[1].trim().toLowerCase();
      if (heading.startsWith('titel')) key = 'title';
      else if (heading.startsWith('beschreibung')) key = 'description';
      else if (heading.startsWith('kapitel')) key = 'chapters';
      else if (heading.startsWith('tags')) key = 'tags';
      else key = null;
      buffer = [];
      continue;
    }
    if (key) buffer.push(line);
  }
  commit();
  return sections;
}

export function formatYoutubeTimestamp(secondsValue) {
  const total = Math.max(0, Math.floor(Number(secondsValue) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function cleanTranscriptText(words) {
  return words
    .map((item) => String(item.word ?? '').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([„“"'])\s+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function collectMeasuredWords(measurement) {
  const collected = [];
  for (const part of measurement?.parts ?? []) {
    const offset = Number(part.absoluteOffsetSeconds ?? 0);
    for (const item of part.words ?? []) {
      const word = String(item.word ?? '').trim();
      const start = Number(item.start);
      const end = Number(item.end);
      if (!word || !Number.isFinite(start) || !Number.isFinite(end)) continue;
      collected.push({
        word,
        start: Math.max(0, offset + start),
        end: Math.max(0, offset + end)
      });
    }
  }
  return collected.sort((a, b) => a.start - b.start || a.end - b.end);
}

export function buildTimedTranscriptText(measurement, { windowSeconds = 10 } = {}) {
  const window = Number(windowSeconds);
  if (!Number.isFinite(window) || window <= 0) throw new Error('windowSeconds muss größer als 0 sein.');
  const words = collectMeasuredWords(measurement);
  if (!words.length) throw new Error('YOUTUBE_WORD_TIMINGS.json enthält keine verwertbaren Wortzeiten.');

  const lastWordEnd = Math.max(...words.map((item) => item.end));
  const totalDuration = Math.max(lastWordEnd, Number(measurement?.masterDurationSeconds ?? 0));
  const lines = [];

  for (let start = 0; start < totalDuration; start += window) {
    const end = Math.min(start + window, totalDuration);
    const bucket = words.filter((item) => item.start >= start && item.start < start + window);
    if (!bucket.length) continue;
    const text = cleanTranscriptText(bucket);
    if (!text) continue;
    lines.push(`${formatYoutubeTimestamp(start)}–${formatYoutubeTimestamp(end)} ${text}`);
  }

  if (!lines.length) throw new Error('Aus den Wortzeiten konnte kein Zeittranskript erzeugt werden.');
  return `${lines.join('\n\n')}\n`;
}

export function buildUploadOverview({ title, description, chapters, tags }) {
  return [
    'YOUTUBE-UPLOAD',
    '',
    'TITEL',
    String(title ?? '').trim(),
    '',
    'BESCHREIBUNG',
    String(description ?? '').trim(),
    '',
    'KAPITEL',
    String(chapters ?? '').trim(),
    '',
    'TAGS',
    String(tags ?? '').trim(),
    ''
  ].join('\n');
}

async function buildTimelineChapters(projectDir) {
  const techDir = path.join(projectDir, '99-technik');
  const chapterPlanPath = path.join(techDir, 'YOUTUBE_CHAPTERS.json');
  const timelinePath = path.join(techDir, 'FINAL_TIMELINE.json');
  if (!(await exists(chapterPlanPath)) || !(await exists(timelinePath))) return null;

  const chapterPlan = await readJson(chapterPlanPath);
  const timeline = await readJson(timelinePath);
  const byImage = new Map((timeline.images ?? []).map((item) => [Number(item.imageNumber), Number(item.startSeconds)]));
  const chapters = [];
  for (const chapter of chapterPlan.chapters ?? []) {
    const imageNumber = Number(chapter.imageNumber);
    const startSeconds = byImage.get(imageNumber);
    const title = String(chapter.title ?? '').trim();
    if (!Number.isFinite(startSeconds)) throw new Error(`Kapitel verweist auf Bild ${chapter.imageNumber}, das nicht in FINAL_TIMELINE existiert.`);
    if (!title) throw new Error(`Kapitel bei Bild ${chapter.imageNumber} hat keinen Titel.`);
    chapters.push(`${formatYoutubeTimestamp(startSeconds)} ${title}`);
  }
  return chapters.length ? `${chapters.join('\n')}\n` : null;
}

async function writeRequired(filePath, value, label) {
  const text = String(value ?? '').trim();
  if (!text) throw new Error(`${label} fehlt oder ist leer.`);
  await writeFile(filePath, `${text}\n`, 'utf8');
}

function coverImageNumberForMeta(meta) {
  if (Number(meta?.schemaVersion) >= 7) {
    const cover = Number(meta?.coverPolicy?.coverImageNumber);
    if (cover !== 1 || meta?.coverPolicy?.firstSceneIsCover !== true || meta?.coverPolicy?.coverMustAlsoBeThumbnailSource !== true) {
      throw new Error('Neue YouTube-Projekte müssen Bild 01 als Cover, erste Videoszene und Thumbnail-Quelle verwenden.');
    }
    return 1;
  }
  return 0;
}

export async function finalizeYoutubeExport(projectDirectory) {
  const projectDir = path.resolve(projectDirectory);
  const exportDir = path.join(projectDir, '03-export');
  await mkdir(exportDir, { recursive: true });

  const metaPath = path.join(projectDir, '99-technik', 'video.json');
  const meta = (await exists(metaPath)) ? await readJson(metaPath) : {};
  const coverNumber = coverImageNumberForMeta(meta);
  const coverFile = `Bild ${String(coverNumber).padStart(2, '0')}.png`;
  const thumbnailSource = path.join(projectDir, '00-bildprompts', 'images', coverFile);
  if (!(await exists(thumbnailSource))) throw new Error(`Thumbnail/Cover fehlt: 00-bildprompts/images/${coverFile}`);
  const thumbnailTarget = path.join(exportDir, 'THUMBNAIL.png');
  await copyFile(thumbnailSource, thumbnailTarget);

  const uploadPath = path.join(exportDir, 'UPLOAD.md');
  const upload = (await exists(uploadPath)) ? parseUploadMarkdown(await readFile(uploadPath, 'utf8')) : {};

  const titlePath = path.join(exportDir, 'YOUTUBE-TITEL.txt');
  const descriptionPath = path.join(exportDir, 'YOUTUBE-BESCHREIBUNG.txt');
  const chaptersPath = path.join(exportDir, 'YOUTUBE-KAPITEL.txt');
  const tagsPath = path.join(exportDir, 'YOUTUBE-TAGS.txt');
  const overviewPath = path.join(exportDir, 'YOUTUBE-UPLOAD.txt');
  const timedTranscriptPath = path.join(exportDir, 'YOUTUBE-UNTERTITEL-ZEITABSCHNITTE.txt');

  const existingOrUpload = async (filePath, uploadValue) => {
    if (String(uploadValue ?? '').trim()) return String(uploadValue).trim();
    if (await exists(filePath)) return String(await readFile(filePath, 'utf8')).trim();
    return '';
  };

  const title = await existingOrUpload(titlePath, upload.title || meta.title);
  const description = await existingOrUpload(descriptionPath, upload.description);
  const timelineChapters = await buildTimelineChapters(projectDir);
  const chapters = String(timelineChapters ?? await existingOrUpload(chaptersPath, upload.chapters)).trim();
  const tags = await existingOrUpload(tagsPath, upload.tags);

  await writeRequired(titlePath, title, 'YouTube-Titel');
  await writeRequired(descriptionPath, description, 'YouTube-Beschreibung');
  await writeRequired(chaptersPath, chapters, 'YouTube-Kapitel');
  await writeRequired(tagsPath, tags, 'YouTube-Tags');
  await writeFile(overviewPath, buildUploadOverview({ title, description, chapters, tags }), 'utf8');

  const measurementPath = path.join(projectDir, '99-technik', 'YOUTUBE_WORD_TIMINGS.json');
  if (await exists(measurementPath)) {
    const measurement = await readJson(measurementPath);
    await writeFile(timedTranscriptPath, buildTimedTranscriptText(measurement, { windowSeconds: 10 }), 'utf8');
  } else if (Number(meta?.schemaVersion) >= 13) {
    throw new Error('Schema-13+: 99-technik/YOUTUBE_WORD_TIMINGS.json fehlt. Zeitabschnitt-Untertitel können nicht exportiert werden.');
  }

  return {
    thumbnail: thumbnailTarget,
    title: titlePath,
    description: descriptionPath,
    chapters: chaptersPath,
    tags: tagsPath,
    overview: overviewPath,
    timedTranscript: (await exists(timedTranscriptPath)) ? timedTranscriptPath : null
  };
}

async function main() {
  const dir = arg('--dir');
  if (!dir) throw new Error('Nutzung: npm run finalize:youtube-export -- --dir "youtube/<woche>/<thema>"');
  const result = await finalizeYoutubeExport(dir);
  console.log('YouTube-Export finalisiert:');
  console.log(`- ${result.thumbnail}`);
  console.log(`- ${result.title}`);
  console.log(`- ${result.description}`);
  console.log(`- ${result.chapters}`);
  console.log(`- ${result.tags}`);
  console.log(`- ${result.overview}`);
  if (result.timedTranscript) console.log(`- ${result.timedTranscript}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`YouTube Export: FEHLER — ${error.message}`);
    process.exitCode = 1;
  });
}
