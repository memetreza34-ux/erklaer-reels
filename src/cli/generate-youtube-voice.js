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
Weltlogik YouTube Voiceover Generator (Open-Source Automated TTS)
=================================================================

Erzeugt eine hochqualitative, maßgeschneiderte Sprecherstimme für das YouTube-Projekt
vollautomatisch aus 01-voice-script/voice-script.txt und legt sie unter 02-audio/voiceover-final.wav ab.

Verwendung:
  npm run voice:youtube -- --dir "youtube/<woche>/<thema>" [Optionen]

Optionen:
  --preset <name>       Stimm-Preset (Standard: weltlogik-signature)
                        Verfügbar:
                        - weltlogik-signature: Warmer, sonorer Bariton (Arte/ZDFinfo Stil)
                        - weltlogik-conrad:    Präziser, analytischer Investigativton
                        - weltlogik-florian:   Dynamischer Erklärer (MrWissen2go Stil)
                        - weltlogik-seraphina: Eindrucksvolle feminine Dokumentarstimme
                        - weltlogik-katja:     Klassische Nachrichtensprecherin
  --rate <rate>         Sprechgeschwindigkeit (Standard aus Preset, z. B. +4% oder +6%)
  --pitch <pitch>       Tonhöhe (Standard aus Preset, z. B. -1Hz)
  --pause <sekunden>    Pause zwischen Absätzen in Sekunden (Standard: 0.35)
  --voice <voice-id>    Explizite Stimm-ID überschreiben
  --force               Bestehendes Audio überschreiben
  --dry-run             Zeigt Skript-Zerlegung, Wortzahl & Schätzung ohne Synthese
  --align               Startet direkt nach erfolgreicher Generierung auto-align:youtube
  --list-presets        Zeigt alle Presets im Detail
`);
}

async function main() {
  if (hasFlag('--help') || hasFlag('-h')) {
    printUsage();
    return;
  }

  if (hasFlag('--list-presets')) {
    console.log('\n=== Verfügbare Stimm-Presets für Weltlogik ===\n');
    for (const [key, preset] of Object.entries(VOICE_PRESETS)) {
      const isDefault = key === DEFAULT_PRESET ? ' [STANDARD]' : '';
      console.log(`• ${key}${isDefault}`);
      console.log(`  Titel:       ${preset.label}`);
      if (preset.engine === 'qwen3-voice-design') {
        console.log(`  Engine:      Qwen3-TTS 1.7B (Apple Silicon Metal GPU)`);
        console.log(`  Persona:     ${preset.persona} | Tempo: ${preset.atempo ? preset.atempo + 'x' : '1.0x'}`);
      } else {
        console.log(`  Stimme:      ${preset.voice}`);
        console.log(`  Tempo:       ${preset.rate} | Tonhöhe: ${preset.pitch}`);
      }
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
  const preset = arg('--preset') || DEFAULT_PRESET;
  const voice = arg('--voice');
  const rate = arg('--rate');
  const pitch = arg('--pitch');
  const pause = arg('--pause') ? Number(arg('--pause')) : undefined;
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
    rate,
    pitch,
    pauseBetweenSeconds: pause,
    force,
    dryRun
  });

  if (result.dryRun) {
    console.log(`\n[DRY RUN] Skript-Analyse:`);
    console.log(`Gesamtwörter:    ${result.totalWords}`);
    console.log(`Absatz-Chunks:   ${result.totalChunks}`);
    console.log(`Geschätzte Dauer: ~${result.estimatedDurationMinutes} Minuten`);
    console.log(`\nAbsatzübersicht:`);
    result.chunks.forEach((c) => {
      console.log(`  [Chunk ${c.id}] (${c.words} Wörter): ${c.preview}`);
    });
    return;
  }

  console.log(`\n✅ Voiceover erfolgreich generiert!`);
  console.log(`Ausgabe:     ${path.relative(process.cwd(), result.audioPath)}`);
  console.log(`Dauer:       ${result.report.durationSeconds}s (~${(result.report.durationSeconds / 60).toFixed(2)} min)`);
  console.log(`Sprechtempo: ${result.report.wpm} Wörter/Minute`);
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
