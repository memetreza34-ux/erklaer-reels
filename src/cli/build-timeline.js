#!/usr/bin/env node

import { buildMasterTimeline } from '../core/timeline.js';
import { syncReelSounds } from '../core/sound-library.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function usage() {
  console.log(`
Erstellt die Master-Timeline, einen Render-Plan und einen Vorab-Qualitätsbericht.

Beispiele:
  npm run build:timeline -- --dir "reels/.../reel-01_titel"
  npm run sync:audio -- --dir "reels/.../reel-01_titel" --audio-duration 58.0 --strict

Optionen:
  --dir             Pfad zum Reel-Ordner
  --audio-duration  Echte Voice-over-Dauer in Sekunden, falls ffprobe nicht verfügbar ist
  --strict          Fehlende Assets, unsichere Cue-Zeiten oder unausgeglichene Szenendauern als Fehler behandeln
  --no-probe        ffprobe nicht zur automatischen Dauerermittlung verwenden

Die Timeline hängt automatisch den in config/production-quality-gates.json festgelegten Schlussbild-Nachlauf an.
`);
}

async function main() {
  if (process.argv.includes('--help')) {
    usage();
    return;
  }

  const reelDirectory = getArgument('--dir');
  if (!reelDirectory) {
    usage();
    process.exitCode = 1;
    return;
  }

  const rawDuration = getArgument('--audio-duration');
  const audioDurationSeconds = rawDuration === undefined ? null : Number(rawDuration);
  if (rawDuration !== undefined && (!Number.isFinite(audioDurationSeconds) || audioDurationSeconds <= 0)) {
    throw new Error('--audio-duration muss eine positive Zahl sein.');
  }

  // Geplante Sound-Typen gegen die zentrale Bibliothek auflösen, bevor die Timeline
  // die Effekte übernimmt. Fehlende Dateien blockieren nur im strengen Lauf.
  const sounds = await syncReelSounds(reelDirectory, { strict: process.argv.includes('--strict') });
  if (sounds.copied.length > 0) console.log(`Sounds übernommen: ${sounds.copied.join(', ')}`);
  for (const item of sounds.unknownTypes) {
    console.log(`Warnung: ${item.sceneId} nutzt den unbekannten Sound-Typ "${item.type}".`);
  }
  for (const item of sounds.missingFiles) {
    console.log(`Warnung: Datei fehlt für "${item.type}" — erwartet unter ${item.expected}.`);
  }

  const result = await buildMasterTimeline(reelDirectory, {
    audioDurationSeconds,
    strict: process.argv.includes('--strict'),
    probeAudio: !process.argv.includes('--no-probe')
  });

  console.log(`Timeline: ${result.timeline.timingStatus}`);
  console.log(`Voice-over: ${result.timeline.audio.durationSeconds} Sekunden`);
  console.log(`Schlussbild-Nachlauf: ${result.timeline.composition.endingHoldSeconds} Sekunden`);
  console.log(`Videodauer: ${result.timeline.composition.durationSeconds} Sekunden`);
  console.log(`Szenen: ${result.timeline.scenes.length}`);
  console.log(`Render-Plan: ${result.renderPlan.status}`);
  console.log(`Qualitätsprüfung: ${result.qualityReport.passed ? 'bestanden' : 'nicht bestanden'}`);

  if (result.timeline.timingStatus !== 'audio-synced') {
    console.log('Nächster Schritt: timeline/audio-sync.json mit den echten audioCue-Zeitpunkten ergänzen und den Befehl erneut ausführen.');
  }
  if (process.argv.includes('--strict') && !result.qualityReport.passed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
