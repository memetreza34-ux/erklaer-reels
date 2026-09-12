#!/usr/bin/env node

import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { getReelLayout } from '../core/compact-reel-layout.js';
import { writeSequentialAudioSync } from '../core/reel-image-audio-mapping.js';
import { probeAudioDuration } from '../core/timeline.js';

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg']);

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function findFinalAudio(technicalDirectory) {
  const manifestPath = path.join(technicalDirectory, 'assets-manifest.json');
  if (await exists(manifestPath)) {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    const listed = manifest?.audio?.expectedFile;
    if (listed) {
      const candidate = path.join(technicalDirectory, listed);
      if (await exists(candidate)) return candidate;
    }
  }

  const audioDirectory = path.join(technicalDirectory, 'audio');
  if (!(await exists(audioDirectory))) return null;
  const entries = await readdir(audioDirectory, { withFileTypes: true });
  const file = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => AUDIO_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort()[0];
  return file ? path.join(audioDirectory, file) : null;
}

function usage() {
  console.log(`
Automatische Bild↔Audio-Grundausrichtung für Reels.

Verwendung:
  npm run auto-align:reel -- --dir "reels/.../reel-01_thema"

Die feste Bildreihenfolge und die bereits in Phase 1 definierten spokenText-
Bereiche werden auf die echte finale Audiodauer verteilt. Dadurch muss
Antigravity nicht jeden einzelnen Sprachanker interaktiv bestätigen.
`);
}

async function main() {
  if (process.argv.includes('--help')) return usage();

  const reelDirectory = getArgument('--dir');
  if (!reelDirectory) {
    usage();
    process.exitCode = 1;
    return;
  }

  const layout = await getReelLayout(reelDirectory);
  const audioPath = await findFinalAudio(layout.technicalDirectory);
  if (!audioPath) throw new Error('Finales Voice-over fehlt. Erst Audio importieren und trim:pauses ausführen.');

  const duration = await probeAudioDuration(audioPath);
  if (!duration) throw new Error('Die finale Audiodauer konnte mit ffprobe nicht bestimmt werden.');

  const audioFile = path.relative(layout.technicalDirectory, audioPath).split(path.sep).join('/');
  const result = await writeSequentialAudioSync(layout.technicalDirectory, {
    audioDurationSeconds: duration,
    audioFile
  });

  console.log('Bild↔Audio-Auto-Alignment erstellt.');
  console.log(`Audio: ${audioFile}`);
  console.log(`Dauer: ${duration.toFixed(2)} s`);
  console.log(`Bildmomente: ${result.mapping.mappings.length}`);
  console.log('Methode: sequenziell nach gesprochenem Textgewicht; keine Einzel-Rückfragen nötig.');
  console.log(`Audio-Sync: ${result.audioSyncPath}`);
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
