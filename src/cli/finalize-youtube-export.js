#!/usr/bin/env node

import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

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

export async function finalizeYoutubeExport(projectDirectory) {
  const projectDir = path.resolve(projectDirectory);
  const exportDir = path.join(projectDir, '03-export');
  await mkdir(exportDir, { recursive: true });

  const thumbnailSource = path.join(projectDir, '00-bildprompts', 'images', 'Bild 00.png');
  if (!(await exists(thumbnailSource))) throw new Error('Thumbnail fehlt: 00-bildprompts/images/Bild 00.png');
  const thumbnailTarget = path.join(exportDir, 'THUMBNAIL.png');
  await copyFile(thumbnailSource, thumbnailTarget);

  const uploadPath = path.join(exportDir, 'UPLOAD.md');
  const upload = (await exists(uploadPath)) ? parseUploadMarkdown(await readFile(uploadPath, 'utf8')) : {};

  const titlePath = path.join(exportDir, 'YOUTUBE-TITEL.txt');
  const descriptionPath = path.join(exportDir, 'YOUTUBE-BESCHREIBUNG.txt');
  const chaptersPath = path.join(exportDir, 'YOUTUBE-KAPITEL.txt');
  const tagsPath = path.join(exportDir, 'YOUTUBE-TAGS.txt');

  const existingOrUpload = async (filePath, uploadValue) => {
    if (String(uploadValue ?? '').trim()) return uploadValue;
    if (await exists(filePath)) return readFile(filePath, 'utf8');
    return '';
  };

  await writeRequired(titlePath, await existingOrUpload(titlePath, upload.title), 'YouTube-Titel');
  await writeRequired(descriptionPath, await existingOrUpload(descriptionPath, upload.description), 'YouTube-Beschreibung');
  const timelineChapters = await buildTimelineChapters(projectDir);
  await writeRequired(chaptersPath, timelineChapters ?? await existingOrUpload(chaptersPath, upload.chapters), 'YouTube-Kapitel');
  await writeRequired(tagsPath, await existingOrUpload(tagsPath, upload.tags), 'YouTube-Tags');

  return {
    thumbnail: thumbnailTarget,
    title: titlePath,
    description: descriptionPath,
    chapters: chaptersPath,
    tags: tagsPath
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
}

main().catch((error) => {
  console.error(`YouTube Export: FEHLER — ${error.message}`);
  process.exitCode = 1;
});
