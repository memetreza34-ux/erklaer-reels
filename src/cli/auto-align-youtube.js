#!/usr/bin/env node

import { access, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { alignYoutubeProject } from '../core/youtube-audio-alignment.js';

const AUDIO_RE = /\.(mp3|wav|m4a|aac|flac|ogg|opus)$/i;

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function prepareSingleAudioV2(projectDirectory, explicitAudio = null) {
  const projectDir = path.resolve(projectDirectory);
  const techDir = path.join(projectDir, '99-technik');
  const metaPath = path.join(techDir, 'video.json');
  const mappingPath = path.join(techDir, 'BILD_AUDIO_ZUORDNUNG.json');
  if (!(await exists(metaPath)) || !(await exists(mappingPath))) return { mode: 'unknown' };

  const meta = JSON.parse(await readFile(metaPath, 'utf8'));
  if (Number(meta.productionRulesVersion ?? 1) < 2) return { mode: 'v1' };

  let audioAbsolute = null;
  if (explicitAudio) {
    audioAbsolute = path.resolve(explicitAudio);
    if (!(await exists(audioAbsolute))) throw new Error(`Explizite Audiodatei fehlt: ${audioAbsolute}`);
  } else {
    const audioDir = path.join(projectDir, '02-audio');
    const entries = (await exists(audioDir)) ? await readdir(audioDir, { withFileTypes: true }) : [];
    const files = entries
      .filter((entry) => entry.isFile() && AUDIO_RE.test(entry.name))
      .map((entry) => path.join(audioDir, entry.name));

    if (files.length === 1) audioAbsolute = files[0];
    if (files.length === 0) {
      throw new Error('Keine finale Voice-over-Datei unter 02-audio gefunden. Neue V2-Projekte erwarten genau eine vollständige Audiodatei.');
    }
    if (files.length > 1) {
      // Legacy-Mehrpart-Projekt: bestehende audioPartFile-Zuordnung unverändert lassen.
      return { mode: 'legacy-multipart', count: files.length };
    }
  }

  const relativeAudio = path.relative(projectDir, audioAbsolute).split(path.sep).join('/');
  const mapping = JSON.parse(await readFile(mappingPath, 'utf8'));
  const images = Array.isArray(mapping.images) ? mapping.images : [];
  if (!images.length) throw new Error('BILD_AUDIO_ZUORDNUNG.json enthält keine Bilder.');

  const normalized = {
    ...mapping,
    userFacingAudioMode: 'single-final-voiceover',
    userFacingImageDirectory: '00-bildprompts/images',
    sourceVoiceoverFile: relativeAudio,
    images: images.map((item) => ({
      ...item,
      batchFolder: 'images',
      audioPartId: 1,
      scriptPartFile: '01-voice-script/voice-script.txt',
      audioPartFile: relativeAudio
    }))
  };

  await writeFile(mappingPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  return { mode: 'single-final-voiceover', audioFile: relativeAudio };
}

function usage() {
  console.log(`
Misst jeden YouTube-Bildanker am tatsächlich gesprochenen Wort.

Verwendung:
  npm run auto-align:youtube -- --dir "youtube/<woche>/<thema>"

Neue V2-Projekte verwenden standardmäßig EINE finale Voice-over-Datei unter
02-audio/. Die sichtbare Aufteilung in Script-/Audio-Parts ist nicht nötig.

Optionen:
  --audio <datei>   explizite finale Audiodatei
  --model <name>    Whisper-Modell, Standard: small
  --refresh         Wortmessung trotz passendem Fingerprint neu erzeugen
`);
}

async function main() {
  if (process.argv.includes('--help')) return usage();
  const dir = arg('--dir');
  if (!dir) {
    usage();
    process.exitCode = 1;
    return;
  }

  const explicitAudio = arg('--audio') ?? null;
  const prepared = await prepareSingleAudioV2(dir, explicitAudio);
  if (prepared.mode === 'single-final-voiceover') {
    console.log(`YouTube-Audio: eine finale Voice-over-Datei (${prepared.audioFile}).`);
  } else if (prepared.mode === 'legacy-multipart') {
    console.log(`YouTube-Audio: Legacy-Mehrpartmodus (${prepared.count} Audiodateien).`);
  }

  const result = await alignYoutubeProject(dir, {
    audio: explicitAudio,
    model: arg('--model') ?? 'small',
    refresh: process.argv.includes('--refresh')
  });

  console.log(`YouTube Audio-Alignment: ${result.missing.length ? 'UNVOLLSTÄNDIG' : 'BESTANDEN'}`);
  console.log(`Gemessene Bildanker: ${result.mapping.autoAlignment.matched}/${result.mapping.autoAlignment.total}`);
  console.log(`Master-Audio: ${result.mapping.audioMasterFile}`);
  console.log(`Messbeleg: ${result.mapping.alignmentEvidenceFile}`);
  for (const miss of result.missing) {
    console.error(`- Bild ${miss.imageNumber}: Anchor nicht gefunden: "${miss.startAnchor}" (${miss.audioFile})`);
  }
  if (result.missing.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`YouTube Audio-Alignment: FEHLER — ${error.message}`);
  process.exitCode = 1;
});

export { prepareSingleAudioV2 };
