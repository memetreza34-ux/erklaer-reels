#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import {
  DEFAULT_PRESET,
  VOICE_PRESETS,
  generateYoutubeVoiceover
} from '../core/youtube-voice-generator.js';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function printUsage() {
  console.log(`
Weltlogik YouTube Voiceover Generator (stickman-user-clone / Qwen3-TTS 1.7B MLX)
================================================================================

Erzeugt das Voiceover mit deiner kalibrierten Master-Kanalstimme (stickman-user-clone)
vollautomatisch aus 01-voice-script/voice-script.txt und legt es unter
99-technik/voiceover-raw.wav sowie 02-audio/voiceover-final.wav ab.

Verwendung:
  npm run voice:youtube -- --dir "youtube/<woche>/<thema>" [Optionen]

Optionen:
  --preset <name>       Stimm-Preset (Standard: stickman-user-clone)
  --profile <name>      Alias für --preset (Standard: stickman-user-clone)
  --tempo <faktor>      Sprechtempo-Multiplikator (Standard: 0.95)
  --rate <rate>         Sprechgeschwindigkeit als Prozentwert (Standard: -5%)
  --pause <sekunden>    Max. Pause in Sekunden nach Tempo-Anpassung (Standard: 0.30)
  --no-boost            Studio Voice Boost deaktivieren
  --force               Bestehendes Audio überschreiben
  --dry-run             Zeigt Skript-Zerlegung, Wortzahl & Schätzung ohne Synthese
  --align               Startet direkt nach erfolgreicher Generierung auto-align:youtube
  --list-presets        Zeigt das aktive Master-Preset im Detail
`);
}

async function main() {
  if (hasFlag('--help') || hasFlag('-h')) {
    printUsage();
    return;
  }

  if (hasFlag('--list-presets')) {
    console.log('\n=== Aktives Stimm-Preset für Weltlogik ===\n');
    for (const [key, preset] of Object.entries(VOICE_PRESETS)) {
      const isDefault = key === DEFAULT_PRESET ? ' [STANDARD]' : '';
      console.log(`• ${key}${isDefault}`);
      console.log(`  Titel:        ${preset.label}`);
      console.log(`  Engine:       ${preset.engine} (${preset.model})`);
      console.log(`  Referenz:     ${preset.refAudio}`);
      console.log(`  Tempo:        ${preset.tempo}x (${preset.rate}) | Max. Pause: ${preset.maxPauseSeconds}s (Pre-Stretch: ${preset.preStretchMaxPauseSeconds}s)`);
      console.log(`  Chunk-Größe:  max. ${preset.maxWordsPerChunk} Wörter | Temperature: ${preset.temperature}`);
      console.log(`  Beschreibung: ${preset.description}\n`);
    }
    return;
  }

  const dir = arg('--dir');
  if (!dir) {
    printUsage();
    throw new Error('Projektverzeichnis fehlt: --dir "youtube/<woche>/<thema>" erforderlich.');
  }

  const projectDir = path.resolve(dir);
  const preset = arg('--profile') || arg('--preset') || DEFAULT_PRESET;
  const voice = arg('--voice');
  const tempo = arg('--tempo') ? Number(arg('--tempo')) : undefined;
  const rate = arg('--rate');
  const pitch = arg('--pitch');
  const pause = arg('--pause') ? Number(arg('--pause')) : undefined;
  const boost = !hasFlag('--no-boost');
  const force = hasFlag('--force');
  const dryRun = hasFlag('--dry-run');
  const align = hasFlag('--align');

  console.log(`\n🎙️  Weltlogik Voiceover Generator`);
  console.log(`-----------------------------------`);
  console.log(`Projekt: ${path.relative(process.cwd(), projectDir)}`);
  console.log(`Preset:  ${preset}`);

  const result = await generateYoutubeVoiceover(projectDir, {
    preset,
    voice,
    tempo,
    rate,
    pitch,
    maxPauseSeconds: pause,
    pauseBetweenSeconds: pause,
    boost,
    force,
    dryRun
  });

  if (result.dryRun) {
    console.log(`\n[DRY RUN] Skript-Analyse:`);
    console.log(`Gesamtwörter:    ${result.totalWords}`);
    console.log(`Absatz-Chunks:   ${result.totalChunks} (max. ${result.config.maxWordsPerChunk} Wörter/Chunk)`);
    console.log(`Tempo:           ${result.config.tempo}x (${result.config.rate}), max. Pause: ${result.config.maxPauseSeconds}s`);
    console.log(`Geschätzte Dauer: ~${result.estimatedDurationMinutes} Minuten`);
    console.log(`\nChunk-Übersicht:`);
    result.chunks.forEach((c) => {
      console.log(`  [Chunk ${c.id}] (${c.words} Wörter): ${c.preview}`);
    });
    return;
  }

  console.log(`\n✅ Voiceover erfolgreich generiert!`);
  console.log(`Roh-Audio:   ${path.relative(process.cwd(), result.rawAudioPath)}`);
  console.log(`Master-WAV:  ${path.relative(process.cwd(), result.audioPath)}`);
  console.log(`Dauer:       ${result.report.durationSeconds}s (~${(result.report.durationSeconds / 60).toFixed(2)} min)`);
  console.log(`Sprechtempo: ${result.report.wpm} Wörter/Minute (Tempo ${result.report.tempo}x)`);
  console.log(`Stimme:      ${result.report.voice} (${result.report.preset})`);
  console.log(`Messbericht: ${path.relative(process.cwd(), result.reportPath)}`);

  if (align) {
    console.log(`\n📐 Starte automatisches Alignment (Whisper)...`);
    const alignResult = spawnSync(
      process.execPath,
      ['src/cli/auto-align-youtube.js', '--dir', projectDir],
      { stdio: 'inherit' }
    );
    if (alignResult.error) throw alignResult.error;
    if (alignResult.status !== 0) {
      throw new Error(`auto-align-youtube.js fehlgeschlagen mit Exit-Code ${alignResult.status}`);
    }
  } else {
    console.log(`\nNächster Schritt:`);
    console.log(`  npm run auto-align:youtube -- --dir "${path.relative(process.cwd(), projectDir)}"`);
  }
}

main().catch((err) => {
  console.error(`\n❌ Fehler bei der Voiceover-Generierung: ${err.message}`);
  process.exitCode = 1;
});
