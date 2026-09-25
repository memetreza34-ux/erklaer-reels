#!/usr/bin/env node

import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function exists(filePath) {
  return access(filePath).then(() => true).catch(() => false);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function main() {
  const rawDir = arg('--dir');
  if (!rawDir) throw new Error('Nutzung: npm run validate:youtube-phase2 -- --dir "youtube/<woche>/<thema>"');

  const projectDir = path.resolve(rawDir);
  const metaPath = path.join(projectDir, '99-technik', 'video.json');
  if (!(await exists(metaPath))) throw new Error('99-technik/video.json fehlt.');

  const meta = await readJson(metaPath);
  if (Number(meta.schemaVersion) < 9) {
    console.log('YouTube Phase-2-Assets: LEGACY — Asset Generation Policy V1 gilt erst ab Schema 9.');
    return;
  }

  const policy = meta.assetGenerationPolicy || {};
  const planned = Number(meta.plannedImageCount);
  if (!Number.isInteger(planned) || planned < 1) throw new Error('plannedImageCount ist ungültig.');

  const finalDirRelative = String(policy.finalImageDirectory || '00-bildprompts/images');
  const finalDir = path.join(projectDir, finalDirRelative);
  if (!(await exists(finalDir))) throw new Error(`Finaler Bildordner fehlt: ${finalDirRelative}`);

  const entries = await readdir(finalDir, { withFileTypes: true });
  const errors = [];
  const expected = new Set(Array.from({ length: planned }, (_, index) => `Bild ${String(index + 1).padStart(2, '0')}.png`));

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    if (entry.isDirectory()) {
      errors.push(`Unterordner verboten: ${entry.name}. Alle finalen Bilder müssen flach in ${finalDirRelative} liegen.`);
      continue;
    }
    if (!entry.name.toLowerCase().endsWith('.png')) continue;
    if (!expected.has(entry.name)) {
      errors.push(`Unerlaubte/temporäre PNG-Datei im finalen Ordner: ${entry.name}. Nur Bild 01.png bis Bild ${String(planned).padStart(2, '0')}.png sind erlaubt.`);
    }
  }

  for (const fileName of expected) {
    if (!(await exists(path.join(finalDir, fileName)))) errors.push(`Finales Bild fehlt: ${fileName}`);
  }

  if (await exists(path.join(finalDir, 'Bild 00.png'))) errors.push('Bild 00.png ist bei neuen YouTube-Projekten verboten.');

  if (errors.length) {
    console.error('YouTube Phase-2-Assets: FEHLER');
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`YouTube Phase-2-Assets: BESTANDEN — genau ${planned} finale Bilder, flach in ${finalDirRelative}, keine Cover-Kandidaten oder Zusatzbilder.`);
}

main().catch((error) => {
  console.error(`YouTube Phase-2-Assets: FEHLER — ${error.message}`);
  process.exitCode = 1;
});
