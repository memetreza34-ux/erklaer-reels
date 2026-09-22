/**
 * Misst, wann im finalen Voice-over welches Wort gesprochen wird.
 *
 * Bis hierher hat die Pipeline die Bildschnitte nicht gemessen, sondern
 * geschätzt: `buildSequentialAudioSync` verteilt die Gesamtdauer proportional
 * zum Wortgewicht der Textabschnitte und schreibt das Ergebnis trotzdem als
 * `timingStatus: "audio-synced"` und `exact-audio-cue` weg.
 *
 * Am Vetorecht-Reel gemessen: Die Bildwechsel liefen dem Ton im Mittel 1,44 s
 * voraus, im schlimmsten Fall 2,94 s. Beim geplanten Schnitt auf "Damit etwas
 * durchgeht" lief noch der Satz davor ("Die Gewinner des Zweiten Weltkriegs").
 * Über weite Strecken sah man also schon das nächste Bild zum vorherigen Satz.
 *
 * Das Transkript wird gegen den Fingerprint der Audiodatei gecacht, damit
 * Whisper nur nach einer echten Audioänderung erneut läuft.
 */

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export const WORD_TIMINGS_FILE = 'timeline/voice-word-timings.json';
const DEFAULT_MODEL = 'small';

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath, fallback = null) {
  if (!(await exists(filePath))) return fallback;
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

async function fingerprint(filePath) {
  return createHash('sha256').update(await readFile(filePath)).digest('hex');
}

// Je nach Installation ist Whisper mal ein eigenes Kommando, mal nur ein
// Python-Modul. Auf diesem Rechner ist /opt/homebrew/bin/whisper ein Wrapper
// auf einen Interpreter, den Node nicht ausführen kann (ENOEXEC), während
// `python3 -m whisper` sauber läuft. Deshalb wird die Aufrufform einmal
// ermittelt statt hart angenommen.
const WHISPER_CANDIDATES = Object.freeze([
  ['whisper', []],
  ['python3', ['-m', 'whisper']],
  ['python', ['-m', 'whisper']]
]);

let cachedCommand;

async function resolveWhisperCommand() {
  if (cachedCommand !== undefined) return cachedCommand;
  for (const [command, prefix] of WHISPER_CANDIDATES) {
    try {
      await execFileAsync(command, [...prefix, '--help'], { timeout: 120_000, maxBuffer: 8 * 1024 * 1024 });
      cachedCommand = { command, prefix };
      return cachedCommand;
    } catch {
      // nächsten Kandidaten versuchen
    }
  }
  cachedCommand = null;
  return cachedCommand;
}

function collectWords(transcript) {
  const words = [];
  for (const segment of transcript?.segments ?? []) {
    for (const word of segment.words ?? []) {
      const start = Number(word.start);
      const end = Number(word.end);
      const text = String(word.word ?? '').trim();
      if (!text || !Number.isFinite(start) || !Number.isFinite(end)) continue;
      words.push({ word: text, start: Number(start.toFixed(3)), end: Number(end.toFixed(3)) });
    }
  }
  return words;
}

async function runWhisper(audioPath, model, tool) {
  const workspace = await mkdtemp(path.join(tmpdir(), 'reel-word-timings-'));
  try {
    // Whisper arbeitet am zuverlässigsten mit 16-kHz-Mono-PCM.
    const wavPath = path.join(workspace, 'voice.wav');
    await execFileAsync('ffmpeg', ['-v', 'error', '-i', audioPath, '-ar', '16000', '-ac', '1', wavPath, '-y'], { timeout: 300_000 });

    await execFileAsync(tool.command, [
      ...tool.prefix,
      wavPath,
      '--model', model,
      '--language', 'de',
      '--word_timestamps', 'True',
      '--output_format', 'json',
      '--output_dir', workspace,
      '--verbose', 'False'
    ], { timeout: 1_800_000, maxBuffer: 32 * 1024 * 1024 });

    const transcript = await readJson(path.join(workspace, 'voice.json'));
    if (!transcript) throw new Error('Whisper hat kein JSON-Transkript geschrieben.');
    return collectWords(transcript);
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}

/**
 * @returns {Promise<{available: boolean, reason?: string, words: object[], fingerprint: string|null, model: string, cached: boolean}>}
 */
export async function measureVoiceWordTimings(technicalDirectory, audioRelativePath, { model = DEFAULT_MODEL, refresh = false } = {}) {
  const audioPath = path.join(technicalDirectory, audioRelativePath);
  if (!(await exists(audioPath))) {
    return { available: false, reason: `Das finale Voice-over fehlt (${audioRelativePath}).`, words: [], fingerprint: null, model, cached: false };
  }

  const audioFingerprint = await fingerprint(audioPath);
  const cachePath = path.join(technicalDirectory, WORD_TIMINGS_FILE);
  const cached = await readJson(cachePath);

  if (!refresh && cached?.audioFingerprintSha256 === audioFingerprint && Array.isArray(cached.words) && cached.words.length > 0) {
    return { available: true, words: cached.words, fingerprint: audioFingerprint, model: cached.model ?? model, cached: true };
  }

  const tool = await resolveWhisperCommand();
  if (!tool) {
    return {
      available: false,
      reason: 'Whisper ist nicht aufrufbar. Ohne Messung dürfen Bildschnitte nicht als audio-synchron gelten (`pip install -U openai-whisper`).',
      words: [],
      fingerprint: audioFingerprint,
      model,
      cached: false
    };
  }

  let words;
  try {
    words = await runWhisper(audioPath, model, tool);
  } catch (error) {
    return { available: false, reason: `Die Wortmessung ist fehlgeschlagen: ${error.message}`, words: [], fingerprint: audioFingerprint, model, cached: false };
  }

  if (words.length === 0) {
    return { available: false, reason: 'Whisper hat keine Wortzeiten geliefert.', words: [], fingerprint: audioFingerprint, model, cached: false };
  }

  await mkdir(path.dirname(cachePath), { recursive: true });
  await writeFile(cachePath, `${JSON.stringify({
    version: 1,
    createdAt: new Date().toISOString(),
    audioFile: audioRelativePath,
    audioFingerprintSha256: audioFingerprint,
    model,
    source: 'whisper-word-timestamps',
    wordCount: words.length,
    lastWordEndSeconds: words.at(-1).end,
    words
  }, null, 2)}\n`, 'utf8');

  return { available: true, words, fingerprint: audioFingerprint, model, cached: false };
}

/**
 * Liest ein bereits gemessenes Transkript, ohne Whisper zu starten. Guards
 * nutzen das, um eine Timeline gegen die Messung zu prüfen, die zu ihr gehört.
 */
export async function readMeasuredWordTimings(technicalDirectory, audioRelativePath = null) {
  const cached = await readJson(path.join(technicalDirectory, WORD_TIMINGS_FILE));
  if (!cached || !Array.isArray(cached.words) || cached.words.length === 0) {
    return { available: false, reason: `${WORD_TIMINGS_FILE} fehlt. Bildschnitte wurden nie am Audio gemessen.`, words: [], stale: false };
  }

  if (audioRelativePath) {
    const audioPath = path.join(technicalDirectory, audioRelativePath);
    if (await exists(audioPath)) {
      const current = await fingerprint(audioPath);
      if (current !== cached.audioFingerprintSha256) {
        return { available: false, reason: 'Die Wortmessung gehört zu einer älteren Fassung des Voice-overs.', words: cached.words, stale: true };
      }
    }
  }

  return { available: true, words: cached.words, stale: false, model: cached.model };
}
