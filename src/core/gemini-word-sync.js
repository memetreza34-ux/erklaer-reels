import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { buildMasterTimeline } from './timeline.js';

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg', '.webm', '.mp4']);
const MIME_TYPES = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.flac': 'audio/flac',
  '.ogg': 'audio/ogg',
  '.webm': 'audio/webm',
  '.mp4': 'audio/mp4'
};

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
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function round(value, digits = 3) {
  const factor = 10 ** digits;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

export function parseOffsetSeconds(value) {
  if (Number.isFinite(Number(value))) return Number(value);
  const text = String(value ?? '').trim();
  if (!text) return null;

  const milliseconds = text.match(/^(-?\d+(?:\.\d+)?)ms$/i);
  if (milliseconds) return Number(milliseconds[1]) / 1000;

  const seconds = text.match(/^(-?\d+(?:\.\d+)?)s$/i);
  if (seconds) return Number(seconds[1]);

  const iso = text.match(/^PT(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?$/i);
  if (iso) return Number(iso[1] ?? 0) * 60 + Number(iso[2] ?? 0);

  return null;
}

function normalizeWord(value) {
  return String(value ?? '')
    .toLocaleLowerCase('de-DE')
    .replace(/[„“”"'’`´.,!?;:()[\]{}…—–-]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

export function extractGeminiWordInfo(value) {
  const words = [];
  const seenObjects = new Set();

  function visit(current) {
    if (!current || typeof current !== 'object' || seenObjects.has(current)) return;
    seenObjects.add(current);

    if (Array.isArray(current)) {
      current.forEach(visit);
      return;
    }

    const type = String(current.type ?? '').toLowerCase();
    const start = parseOffsetSeconds(current.start_offset ?? current.startOffset ?? current.start_seconds ?? current.startSeconds);
    const end = parseOffsetSeconds(current.end_offset ?? current.endOffset ?? current.end_seconds ?? current.endSeconds);
    const text = String(current.text ?? current.word ?? '').trim();
    const looksLikeWordInfo = type === 'word_info' || (text && start !== null && end !== null);

    if (looksLikeWordInfo && text && start !== null && end !== null && end > start) {
      words.push({
        text,
        startSeconds: round(start),
        endSeconds: round(end),
        speaker: current.speaker ?? null
      });
    }

    Object.values(current).forEach(visit);
  }

  visit(value);

  const unique = new Map();
  for (const word of words) {
    const key = `${word.startSeconds}|${word.endSeconds}|${normalizeWord(word.text)}`;
    if (!unique.has(key)) unique.set(key, word);
  }

  return [...unique.values()]
    .filter((word) => normalizeWord(word.text))
    .sort((a, b) => a.startSeconds - b.startSeconds || a.endSeconds - b.endSeconds);
}

function smartJoin(words) {
  return words
    .map((word) => String(word.text ?? '').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+([,.;:!?…])/g, '$1')
    .replace(/([([{„“])\s+/g, '$1')
    .trim();
}

function shouldBreakAfter(current, next, {
  minWords,
  maxWords,
  pauseBreakSeconds,
  maxCueSeconds
}) {
  if (!next) return true;
  if (current.length >= maxWords) return true;
  if (current.length < minWords) return false;

  const last = current.at(-1);
  const pause = Math.max(0, next.startSeconds - last.endSeconds);
  const duration = last.endSeconds - current[0].startSeconds;
  const sentenceEnd = /[.!?…]$/.test(last.text);

  return sentenceEnd || pause >= pauseBreakSeconds || duration >= maxCueSeconds;
}

export function chunkTranscriptWords(words, options = {}) {
  const settings = {
    minWords: Number(options.minWords ?? 3),
    maxWords: Number(options.maxWords ?? 6),
    pauseBreakSeconds: Number(options.pauseBreakSeconds ?? 0.24),
    maxCueSeconds: Number(options.maxCueSeconds ?? 2.6)
  };

  const chunks = [];
  let current = [];

  for (let index = 0; index < words.length; index += 1) {
    current.push(words[index]);
    const next = words[index + 1];
    if (shouldBreakAfter(current, next, settings)) {
      chunks.push(current);
      current = [];
    }
  }
  if (current.length) chunks.push(current);

  if (chunks.length > 1 && chunks.at(-1).length < settings.minWords) {
    const tail = chunks.pop();
    const previous = chunks.at(-1);
    if (previous.length + tail.length <= settings.maxWords) previous.push(...tail);
    else chunks.push(tail);
  }

  return chunks;
}

function assignWordsToScenes(words, scenes) {
  const assigned = new Map(scenes.map((scene) => [scene.sceneId, []]));
  const unassigned = [];
  let sceneIndex = 0;

  for (const word of words) {
    const midpoint = (word.startSeconds + word.endSeconds) / 2;
    while (sceneIndex < scenes.length - 1 && midpoint >= Number(scenes[sceneIndex].endSeconds)) {
      sceneIndex += 1;
    }
    const scene = scenes[sceneIndex];
    const within = midpoint >= Number(scene.startSeconds) - 0.08 && midpoint <= Number(scene.endSeconds) + 0.08;
    if (within) assigned.get(scene.sceneId).push(word);
    else unassigned.push(word);
  }

  return { assigned, unassigned };
}

export function buildSubtitleCuesFromWords(words, scenes, options = {}) {
  const position = options.position ?? 'safe-lower-middle';
  const verticalPositionPercent = Number(options.verticalPositionPercent ?? 79.5);
  const highlightColor = options.highlightColor ?? '#FFD84D';
  const { assigned, unassigned } = assignWordsToScenes(words, scenes);
  const cues = [];
  const sceneSummary = [];

  for (const scene of scenes) {
    const sceneWords = assigned.get(scene.sceneId) ?? [];
    const chunks = chunkTranscriptWords(sceneWords, options);

    chunks.forEach((chunk, index) => {
      const nextChunk = chunks[index + 1];
      const first = chunk[0];
      const last = chunk.at(-1);
      const preRoll = Number(options.preRollSeconds ?? 0.035);
      const postRoll = Number(options.postRollSeconds ?? 0.1);
      const nextStart = nextChunk ? Math.max(Number(scene.startSeconds), nextChunk[0].startSeconds - preRoll) : null;
      const startSeconds = Math.max(Number(scene.startSeconds), first.startSeconds - preRoll);
      const naturalEnd = Math.min(Number(scene.endSeconds), last.endSeconds + postRoll);
      const endSeconds = nextStart === null ? naturalEnd : Math.min(naturalEnd, nextStart - 0.01);

      cues.push({
        id: `${scene.sceneId}-subtitle-${String(index + 1).padStart(2, '0')}`,
        sceneId: scene.sceneId,
        text: smartJoin(chunk),
        startSeconds: round(startSeconds),
        endSeconds: round(Math.max(startSeconds + 0.05, endSeconds)),
        position,
        verticalPositionPercent,
        highlightCurrentWord: true,
        highlightColor,
        timingStatus: 'gemini-word-synced',
        timingSource: 'gemini-interactions-asr',
        wordTimings: chunk.map((word) => ({
          text: word.text,
          startSeconds: round(word.startSeconds),
          endSeconds: round(word.endSeconds)
        }))
      });
    });

    sceneSummary.push({
      sceneId: scene.sceneId,
      startSeconds: scene.startSeconds,
      endSeconds: scene.endSeconds,
      wordCount: sceneWords.length,
      cueCount: chunks.length
    });
  }

  return { cues, sceneSummary, unassigned };
}

async function loadDotEnv() {
  const filePath = path.resolve('.env');
  if (!(await exists(filePath))) return;
  const content = await readFile(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

async function findAudioPath(reelDirectory, manifest) {
  const listed = manifest?.audio?.expectedFile;
  if (listed && await exists(path.join(reelDirectory, listed))) return path.join(reelDirectory, listed);

  const audioDirectory = path.join(reelDirectory, 'audio');
  if (!(await exists(audioDirectory))) return null;
  const entries = await readdir(audioDirectory, { withFileTypes: true });
  const candidate = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .find((name) => AUDIO_EXTENSIONS.has(path.extname(name).toLowerCase()));
  return candidate ? path.join(audioDirectory, candidate) : null;
}

async function transcribeWithGemini(audioPath, {
  apiKey,
  model = 'gemini-3.6-flash',
  languageHint = 'de-DE'
} = {}) {
  if (!apiKey) throw new Error('GEMINI_API_KEY fehlt. Trage ihn in .env oder als Umgebungsvariable ein.');

  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  const extension = path.extname(audioPath).toLowerCase();
  const mimeType = MIME_TYPES[extension] ?? 'audio/mpeg';
  const audioBuffer = await readFile(audioPath);

  let audioInput;
  if (audioBuffer.length <= 18 * 1024 * 1024) {
    audioInput = {
      type: 'audio',
      data: audioBuffer.toString('base64'),
      mime_type: mimeType
    };
  } else {
    const uploaded = await ai.files.upload({
      file: audioPath,
      config: { mime_type: mimeType }
    });
    audioInput = {
      type: 'audio',
      uri: uploaded.uri,
      mime_type: uploaded.mimeType ?? uploaded.mime_type ?? mimeType
    };
  }

  const interaction = await ai.interactions.create({
    model,
    input: [
      {
        type: 'text',
        text: 'Transkribiere die gesprochene deutsche Stimme exakt. Keine Übersetzung, keine Zusammenfassung und keine erfundenen Wörter.'
      },
      audioInput
    ],
    transcription_config: {
      language_hints: [languageHint],
      timestamp_granularities: ['word']
    },
    store: false
  });

  const words = extractGeminiWordInfo(interaction);
  if (!words.length) {
    throw new Error('Gemini hat keine Wortzeitstempel geliefert. Prüfe Modellzugriff und transcription_config.');
  }

  return {
    provider: 'gemini-interactions',
    model,
    words,
    rawResponse: interaction
  };
}

export async function syncSubtitleWordsWithGemini(reelDirectory, {
  apiKey = null,
  model = 'gemini-3.6-flash',
  languageHint = 'de-DE',
  transcriptJson = null,
  dryRun = false,
  strict = false
} = {}) {
  await loadDotEnv();

  const manifest = await readJson(path.join(reelDirectory, 'assets-manifest.json'), {});
  const audioPath = await findAudioPath(reelDirectory, manifest);
  if (!audioPath && !transcriptJson) throw new Error('Keine Voice-over-Datei im Reel-Ordner gefunden.');

  let timeline = await readJson(path.join(reelDirectory, 'timeline', 'timeline-plan.json'), null);
  if (!timeline) {
    const built = await buildMasterTimeline(reelDirectory, { strict: false });
    timeline = built.timeline;
  }

  const scenes = Array.isArray(timeline?.scenes) ? timeline.scenes : [];
  if (!scenes.length) throw new Error('Die Master-Timeline enthält keine Szenen.');

  let transcription;
  if (transcriptJson) {
    const raw = await readJson(path.resolve(transcriptJson), null);
    const words = Array.isArray(raw?.words)
      ? raw.words.map((word) => ({
          text: String(word.text ?? word.word ?? '').trim(),
          startSeconds: Number(word.startSeconds ?? word.start),
          endSeconds: Number(word.endSeconds ?? word.end)
        })).filter((word) => word.text && Number.isFinite(word.startSeconds) && Number.isFinite(word.endSeconds) && word.endSeconds > word.startSeconds)
      : extractGeminiWordInfo(raw);
    transcription = { provider: 'json-file', model: null, words, rawResponse: raw };
  } else {
    transcription = await transcribeWithGemini(audioPath, {
      apiKey: apiKey ?? process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_TRANSCRIBE_MODEL ?? model,
      languageHint
    });
  }

  if (!transcription.words.length) throw new Error('Die Transkription enthält keine verwertbaren Wortzeiten.');

  const built = buildSubtitleCuesFromWords(transcription.words, scenes);
  const emptyScenes = built.sceneSummary.filter((scene) => scene.wordCount === 0);
  const assignedCount = built.sceneSummary.reduce((sum, scene) => sum + scene.wordCount, 0);
  const coverage = transcription.words.length ? assignedCount / transcription.words.length : 0;
  const passed = coverage >= 0.98 && emptyScenes.length === 0 && built.cues.length > 0;

  const previousPlanPath = path.join(reelDirectory, 'subtitles', 'subtitle-plan.json');
  const previousPlan = await readJson(previousPlanPath, {});
  const nextPlan = {
    ...previousPlan,
    version: Math.max(2, Number(previousPlan.version ?? 1)),
    enabled: true,
    language: 'de',
    position: 'safe-lower-middle',
    verticalPositionPercent: 79.5,
    highlightCurrentWord: true,
    highlightColor: '#FFD84D',
    exactWordTimingsRequired: true,
    timingStatus: 'gemini-word-synced',
    timingProvider: transcription.provider,
    timingModel: transcription.model,
    generatedAt: new Date().toISOString(),
    cues: built.cues
  };

  const report = {
    version: 1,
    createdAt: new Date().toISOString(),
    passed,
    strict,
    provider: transcription.provider,
    model: transcription.model,
    audioFile: audioPath ? path.relative(reelDirectory, audioPath).split(path.sep).join('/') : null,
    totalWords: transcription.words.length,
    assignedWords: assignedCount,
    unassignedWords: built.unassigned,
    coverage: round(coverage, 4),
    cueCount: built.cues.length,
    sceneSummary: built.sceneSummary,
    checks: [
      { id: 'word-timestamps-present', passed: transcription.words.length > 0, level: 'error', message: 'Keine Wortzeitstempel vorhanden.' },
      { id: 'word-coverage', passed: coverage >= 0.98, level: strict ? 'error' : 'warning', message: 'Mindestens 98 % der Wörter müssen einer Szene zugeordnet sein.' },
      { id: 'all-scenes-covered', passed: emptyScenes.length === 0, level: strict ? 'error' : 'warning', message: `Szenen ohne erkannte Wörter: ${emptyScenes.map((scene) => scene.sceneId).join(', ') || 'keine'}.` },
      { id: 'subtitle-cues-created', passed: built.cues.length > 0, level: 'error', message: 'Es wurden keine Untertitel-Cues erzeugt.' }
    ]
  };

  if (!dryRun) {
    const backupPath = path.join(reelDirectory, 'review', 'subtitle-plan-before-word-sync.json');
    if (!(await exists(backupPath))) await writeJson(backupPath, previousPlan);
    await writeJson(previousPlanPath, nextPlan);
    await writeJson(path.join(reelDirectory, 'review', 'word-sync-report.json'), report);
    await writeJson(path.join(reelDirectory, 'review', 'gemini-transcript.json'), {
      provider: transcription.provider,
      model: transcription.model,
      words: transcription.words
    });
    await buildMasterTimeline(reelDirectory, { strict: false });

    const statusPath = path.join(reelDirectory, 'status.json');
    const status = await readJson(statusPath, {});
    status.wordSync = passed ? 'complete' : 'needs-review';
    await writeJson(statusPath, status);
  }

  if (strict && !passed) {
    const failed = report.checks.filter((check) => !check.passed).map((check) => check.message).join(' ');
    throw new Error(`Wort-Synchronisierung nicht bestanden: ${failed}`);
  }

  return { report, subtitlePlan: nextPlan };
}
