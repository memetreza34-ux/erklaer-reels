#!/usr/bin/env node

import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { getReelLayout } from '../core/compact-reel-layout.js';
import { alignCuesToMeasuredAudio } from '../core/measured-cue-alignment.js';
import { writeSequentialAudioSync } from '../core/reel-image-audio-mapping.js';
import { probeAudioDuration } from '../core/timeline.js';
import { getArgument } from '../shared/cli-args.js';

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg']);

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

Jeder Bildmoment wird auf den Zeitpunkt gesetzt, an dem sein Cue tatsächlich
gesprochen wird. Die Wortzeiten kommen aus einer Whisper-Messung am finalen
Voice-over und werden gegen dessen Fingerprint gecacht.

Optionen:
  --model      Whisper-Modell, Standard: small
  --refresh    Messung erzwingen, auch wenn der Cache passt
  --estimate   Notfall-Rückfall auf die alte Textgewichts-Schätzung
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
  const estimateOnly = process.argv.includes('--estimate');

  if (!estimateOnly) {
    const measured = await alignCuesToMeasuredAudio(layout.technicalDirectory, {
      audioFile,
      audioDurationSeconds: duration,
      model: getArgument('--model') ?? undefined,
      refresh: process.argv.includes('--refresh')
    });

    if (measured.available) {
      console.log('Bild↔Audio-Alignment am gesprochenen Wort gemessen.');
      console.log(`Audio: ${audioFile}`);
      console.log(`Dauer: ${duration.toFixed(2)} s`);
      console.log(`Bildmomente: ${measured.total}${measured.cached ? ' (Messung aus dem Cache)' : ''}`);
      console.log(`Gemessene Cues: ${measured.matched}/${measured.total}`);
      for (const miss of measured.unmatched) {
        console.log(`- Nicht gefunden: ${miss.phaseId} "${miss.audioCue}" — Cue an den tatsächlich gesprochenen Wortlaut anpassen.`);
      }
      console.log(`Audio-Sync: ${measured.audioSyncPath}`);
      if (measured.unmatched.length > 0) process.exitCode = 1;
      return;
    }

    console.error(`Messung nicht möglich: ${measured.reason}`);
    console.error('Mit --estimate lässt sich die alte Textgewichts-Schätzung erzwingen; sie gilt dann aber nicht als audio-synchron.');
    process.exitCode = 1;
    return;
  }

  const result = await writeSequentialAudioSync(layout.technicalDirectory, {
    audioDurationSeconds: duration,
    audioFile
  });

  console.log('Bild↔Audio-Alignment GESCHÄTZT (nicht gemessen).');
  console.log(`Audio: ${audioFile}`);
  console.log(`Dauer: ${duration.toFixed(2)} s`);
  console.log(`Bildmomente: ${result.mapping.mappings.length}`);
  console.log('Methode: sequenziell nach gesprochenem Textgewicht. Am Vetorecht-Reel lag diese Schätzung im Mittel 1,44 s daneben.');
  console.log(`Audio-Sync: ${result.audioSyncPath}`);
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
