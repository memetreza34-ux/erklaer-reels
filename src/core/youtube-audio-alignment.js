import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const AUDIO_RE = /\.(mp3|wav|m4a|aac|flac|ogg|opus)$/i;
const DEFAULT_MODEL = 'small';
const MEASUREMENT_FILE = 'YOUTUBE_WORD_TIMINGS.json';
const MASTER_AUDIO_FILE = 'YOUTUBE_AUDIO_MASTER.wav';

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function sha256(filePath) {
  return createHash('sha256').update(await readFile(filePath)).digest('hex');
}

function round(value) {
  return Number(Number(value).toFixed(3));
}

export function normalizeSpokenToken(value) {
  return String(value ?? '')
    .toLocaleLowerCase('de-DE')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '');
}

function tokenize(text) {
  return String(text ?? '')
    .split(/\s+/)
    .map(normalizeSpokenToken)
    .filter(Boolean);
}

function tokenSimilarity(a, b) {
  if (a === b) return 1;
  if (!a || !b) return 0;
  if (a.length >= 5 && b.length >= 5 && (a.startsWith(b) || b.startsWith(a))) return 0.9;
  return 0;
}

export function findAnchorInWords(anchor, words, fromWordIndex = 0) {
  const expected = tokenize(anchor);
  if (!expected.length) return null;
  const normalizedWords = words.map((item) => normalizeSpokenToken(item.word));
  const maxStart = normalizedWords.length - expected.length;
  let best = null;

  for (let start = Math.max(0, fromWordIndex); start <= maxStart; start += 1) {
    let score = 0;
    for (let offset = 0; offset < expected.length; offset += 1) {
      score += tokenSimilarity(expected[offset], normalizedWords[start + offset]);
    }
    const confidence = score / expected.length;
    if (!best || confidence > best.confidence) {
      best = { wordIndex: start, confidence, startSeconds: Number(words[start]?.start) };
    }
    if (confidence === 1) break;
  }

  if (!best || best.confidence < 0.95 || !Number.isFinite(best.startSeconds)) return null;
  return { ...best, confidence: round(best.confidence), startSeconds: round(best.startSeconds) };
}

function collectWords(transcript) {
  const words = [];
  for (const segment of transcript?.segments ?? []) {
    for (const item of segment.words ?? []) {
      const text = String(item.word ?? '').trim();
      const start = Number(item.start);
      const end = Number(item.end);
      if (!text || !Number.isFinite(start) || !Number.isFinite(end)) continue;
      words.push({ word: text, start: round(start), end: round(end) });
    }
  }
  return words;
}

export function computeEffectiveAudioEnd(durationSeconds, words, {
  maxTrailingSilenceSeconds = 0.35,
  preserveAfterLastWordSeconds = 0.2
} = {}) {
  const duration = Number(durationSeconds);
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('Ungültige Audio-Gesamtdauer.');
  const lastWordEnd = Number(words?.at(-1)?.end);
  if (!Number.isFinite(lastWordEnd) || lastWordEnd <= 0 || lastWordEnd > duration + 0.5) {
    return {
      sourceDurationSeconds: round(duration),
      lastSpokenWordEndSeconds: null,
      trailingSilenceSeconds: null,
      effectiveDurationSeconds: round(duration),
      trimmedSeconds: 0,
      trimmed: false
    };
  }
  const trailing = Math.max(0, duration - lastWordEnd);
  const shouldTrim = trailing > Number(maxTrailingSilenceSeconds);
  const effective = shouldTrim
    ? Math.min(duration, lastWordEnd + Math.max(0, Number(preserveAfterLastWordSeconds)))
    : duration;
  return {
    sourceDurationSeconds: round(duration),
    lastSpokenWordEndSeconds: round(lastWordEnd),
    trailingSilenceSeconds: round(trailing),
    effectiveDurationSeconds: round(effective),
    trimmedSeconds: round(duration - effective),
    trimmed: shouldTrim
  };
}

const WHISPER_CANDIDATES = [
  ['whisper', []],
  ['python3', ['-m', 'whisper']],
  ['python', ['-m', 'whisper']]
];
let cachedWhisperCommand;

async function resolveWhisperCommand() {
  if (cachedWhisperCommand !== undefined) return cachedWhisperCommand;
  for (const [command, prefix] of WHISPER_CANDIDATES) {
    try {
      await execFileAsync(command, [...prefix, '--help'], { timeout: 120_000, maxBuffer: 8 * 1024 * 1024 });
      cachedWhisperCommand = { command, prefix };
      return cachedWhisperCommand;
    } catch {
      // try next candidate
    }
  }
  cachedWhisperCommand = null;
  return null;
}

async function ffprobeDuration(filePath) {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', filePath
  ]);
  const value = Number(String(stdout).trim());
  if (!Number.isFinite(value) || value <= 0) throw new Error(`Ungültige Audiodauer: ${filePath}`);
  return round(value);
}

async function transcribeAudio(audioPath, { model = DEFAULT_MODEL, language = 'de' } = {}) {
  const tool = await resolveWhisperCommand();
  if (!tool) throw new Error('Whisper ist nicht installiert. Benötigt: `pip install -U openai-whisper`.');
  const workDir = await mkdtemp(path.join(tmpdir(), 'youtube-word-timings-'));
  try {
    const wavPath = path.join(workDir, 'voice.wav');
    await execFileAsync('ffmpeg', ['-v', 'error', '-i', audioPath, '-ar', '16000', '-ac', '1', wavPath, '-y'], { timeout: 300_000 });
    await execFileAsync(tool.command, [
      ...tool.prefix, wavPath,
      '--model', model,
      '--language', language,
      '--word_timestamps', 'True',
      '--output_format', 'json',
      '--output_dir', workDir,
      '--verbose', 'False'
    ], { timeout: 1_800_000, maxBuffer: 32 * 1024 * 1024 });
    const transcript = await readJson(path.join(workDir, 'voice.json'));
    const words = collectWords(transcript);
    if (!words.length) throw new Error(`Whisper lieferte keine Wortzeiten für ${path.basename(audioPath)}.`);
    return words;
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

async function discoverSingleAudio(projectDir, explicitAudio) {
  if (explicitAudio) {
    const absolute = path.resolve(explicitAudio);
    if (!(await exists(absolute))) throw new Error(`Audio fehlt: ${absolute}`);
    return absolute;
  }
  const audioDir = path.join(projectDir, '02-audio');
  const entries = await readdir(audioDir, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && AUDIO_RE.test(entry.name)).map((entry) => path.join(audioDir, entry.name));
  if (files.length !== 1) throw new Error(`V1 erwartet genau eine Audiodatei unter 02-audio; gefunden: ${files.length}. Nutze --audio.`);
  return files[0];
}

async function normalizeAudioSource(source, output) {
  const args = ['-v', 'error', '-i', source.absolute];
  if (Number.isFinite(source.effectiveDurationSeconds)) args.push('-t', String(source.effectiveDurationSeconds));
  args.push('-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', output, '-y');
  await execFileAsync('ffmpeg', args, { timeout: 600_000 });
}

async function materializeMasterAudio(projectDir, sources) {
  const techDir = path.join(projectDir, '99-technik');
  await mkdir(techDir, { recursive: true });
  const output = path.join(techDir, MASTER_AUDIO_FILE);
  if (sources.length === 1) {
    await normalizeAudioSource(sources[0], output);
    return output;
  }

  const workspace = await mkdtemp(path.join(tmpdir(), 'youtube-audio-master-'));
  try {
    const normalized = [];
    for (let index = 0; index < sources.length; index += 1) {
      const partOut = path.join(workspace, `part-${String(index + 1).padStart(2, '0')}.wav`);
      await normalizeAudioSource(sources[index], partOut);
      normalized.push(partOut);
    }
    const listPath = path.join(workspace, 'concat.txt');
    const lines = normalized.map((file) => `file '${file.replace(/'/g, "'\\''")}'`).join('\n');
    await writeFile(listPath, `${lines}\n`, 'utf8');
    await execFileAsync('ffmpeg', ['-v', 'error', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', output, '-y'], { timeout: 600_000 });
    return output;
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}

export async function alignYoutubeProject(projectDirectory, { audio = null, model = DEFAULT_MODEL, refresh = false } = {}) {
  const projectDir = path.resolve(projectDirectory);
  const mappingPath = path.join(projectDir, '99-technik', 'BILD_AUDIO_ZUORDNUNG.json');
  const videoPath = path.join(projectDir, '99-technik', 'video.json');
  const measurementPath = path.join(projectDir, '99-technik', MEASUREMENT_FILE);
  const mapping = await readJson(mappingPath);
  const meta = await readJson(videoPath);
  const images = Array.isArray(mapping.images) ? mapping.images : [];
  if (!images.length) throw new Error('BILD_AUDIO_ZUORDNUNG.json enthält keine Bilder.');

  const rulesVersion = Number(meta.productionRulesVersion ?? 1);
  const language = String(meta.language ?? 'de').slice(0, 2);
  const cached = (await exists(measurementPath)) ? await readJson(measurementPath) : null;
  const groups = [];
  const endPolicy = meta.audioEndPolicy ?? {};
  const maxTrailingSilenceSeconds = Number(endPolicy.maxTrailingSilenceSeconds ?? 0.35);
  const preserveAfterLastWordSeconds = Number(endPolicy.preserveAfterLastWordSeconds ?? 0.2);

  if (rulesVersion >= 2) {
    const byFile = new Map();
    for (const item of images) {
      const relative = String(item.audioPartFile ?? '').trim();
      if (!relative) throw new Error(`Bild ${item.imageNumber}: audioPartFile fehlt für V2.`);
      if (!byFile.has(relative)) byFile.set(relative, []);
      byFile.get(relative).push(item);
    }
    for (const [relative, groupImages] of byFile.entries()) {
      const absolute = path.join(projectDir, relative);
      if (!(await exists(absolute))) throw new Error(`Audio-Part fehlt: ${relative}`);
      groups.push({ relative, absolute, images: groupImages });
    }
  } else {
    const absolute = await discoverSingleAudio(projectDir, audio);
    groups.push({ relative: path.relative(projectDir, absolute).split(path.sep).join('/'), absolute, images });
  }

  let absoluteOffset = 0;
  const measuredParts = [];
  const aligned = [];
  const missing = [];

  for (const group of groups) {
    const fingerprint = await sha256(group.absolute);
    const cachedPart = cached?.parts?.find((part) => part.audioFile === group.relative && part.audioFingerprintSha256 === fingerprint && part.model === model);
    const words = (!refresh && cachedPart?.words?.length) ? cachedPart.words : await transcribeAudio(group.absolute, { model, language });
    const sourceDuration = await ffprobeDuration(group.absolute);
    const endInfo = computeEffectiveAudioEnd(sourceDuration, words, {
      maxTrailingSilenceSeconds,
      preserveAfterLastWordSeconds
    });
    group.effectiveDurationSeconds = endInfo.effectiveDurationSeconds;
    let cursor = 0;

    for (const [localIndex, item] of group.images.entries()) {
      let hit;
      if (localIndex === 0 && aligned.length === 0) {
        hit = { wordIndex: 0, confidence: 1, startSeconds: 0 };
      } else {
        hit = findAnchorInWords(item.startAnchor, words, cursor);
      }
      if (!hit) {
        missing.push({ imageNumber: item.imageNumber, startAnchor: item.startAnchor, audioFile: group.relative });
        aligned.push({ ...item, actualStartSeconds: null, actualEndSeconds: null, alignmentConfidence: null, alignmentMethod: 'whisper-word-timestamps-v1', audioFingerprintSha256: fingerprint, matchedWordIndex: null });
        continue;
      }
      cursor = hit.wordIndex;
      aligned.push({
        ...item,
        actualStartSeconds: round(absoluteOffset + hit.startSeconds),
        actualEndSeconds: null,
        alignmentConfidence: hit.confidence,
        alignmentMethod: 'whisper-word-timestamps-v1',
        audioFingerprintSha256: fingerprint,
        matchedWordIndex: hit.wordIndex,
        matchedAudioFile: group.relative
      });
    }

    measuredParts.push({
      audioFile: group.relative,
      audioFingerprintSha256: fingerprint,
      model,
      durationSeconds: endInfo.effectiveDurationSeconds,
      sourceDurationSeconds: endInfo.sourceDurationSeconds,
      effectiveDurationSeconds: endInfo.effectiveDurationSeconds,
      lastSpokenWordEndSeconds: endInfo.lastSpokenWordEndSeconds,
      trailingSilenceSeconds: endInfo.trailingSilenceSeconds,
      trailingSilenceTrimmedSeconds: endInfo.trimmedSeconds,
      trailingSilenceTrimmed: endInfo.trimmed,
      absoluteOffsetSeconds: round(absoluteOffset),
      wordCount: words.length,
      words
    });
    absoluteOffset += endInfo.effectiveDurationSeconds;
  }

  for (let index = 0; index < aligned.length; index += 1) {
    const current = aligned[index];
    if (current.actualStartSeconds === null) continue;
    const next = aligned.slice(index + 1).find((item) => item.actualStartSeconds !== null);
    current.actualEndSeconds = next ? next.actualStartSeconds : round(absoluteOffset);
  }

  const masterAudio = await materializeMasterAudio(projectDir, groups.map((group) => ({
    absolute: group.absolute,
    effectiveDurationSeconds: group.effectiveDurationSeconds
  })));
  const masterFingerprint = await sha256(masterAudio);
  const masterDuration = await ffprobeDuration(masterAudio);
  const measurement = {
    schemaVersion: 2,
    createdAt: new Date().toISOString(),
    source: 'whisper-word-timestamps-v1',
    model,
    language,
    endSilencePolicy: {
      maxTrailingSilenceSeconds,
      preserveAfterLastWordSeconds,
      userOriginalsModified: false
    },
    masterAudioFile: `99-technik/${MASTER_AUDIO_FILE}`,
    masterAudioFingerprintSha256: masterFingerprint,
    totalDurationSeconds: round(masterDuration),
    parts: measuredParts
  };
  await writeFile(measurementPath, `${JSON.stringify(measurement, null, 2)}\n`, 'utf8');

  const finalAudioDuration = round(masterDuration);
  const lastAligned = aligned.at(-1);
  if (lastAligned?.actualStartSeconds !== null && lastAligned?.actualStartSeconds !== undefined) {
    lastAligned.actualEndSeconds = finalAudioDuration;
  }

  const updatedMapping = {
    ...mapping,
    alignmentEvidenceFile: `99-technik/${MEASUREMENT_FILE}`,
    audioMasterFile: `99-technik/${MASTER_AUDIO_FILE}`,
    autoAlignment: {
      method: 'whisper-word-timestamps-v1',
      model,
      totalDurationSeconds: finalAudioDuration,
      matched: aligned.length - missing.length,
      total: aligned.length,
      complete: missing.length === 0
    },
    images: aligned
  };
  await writeFile(mappingPath, `${JSON.stringify(updatedMapping, null, 2)}\n`, 'utf8');

  return { mapping: updatedMapping, measurement, missing, masterAudio };
}

export async function validateYoutubeAlignmentEvidence(projectDirectory, mapping) {
  const projectDir = path.resolve(projectDirectory);
  const evidenceRelative = String(mapping.alignmentEvidenceFile ?? '').trim();
  if (!evidenceRelative) return { passed: false, errors: ['alignmentEvidenceFile fehlt im Mapping.'] };
  const evidencePath = path.join(projectDir, evidenceRelative);
  if (!(await exists(evidencePath))) return { passed: false, errors: [`Alignment-Beleg fehlt: ${evidenceRelative}`] };
  const evidence = await readJson(evidencePath);
  const errors = [];
  const partsByFile = new Map((evidence.parts ?? []).map((part) => [part.audioFile, part]));

  for (const part of evidence.parts ?? []) {
    const audioPath = path.join(projectDir, part.audioFile);
    if (!(await exists(audioPath))) {
      errors.push(`Gemessene Audiodatei fehlt: ${part.audioFile}`);
      continue;
    }
    const currentFingerprint = await sha256(audioPath);
    if (currentFingerprint !== part.audioFingerprintSha256) errors.push(`Audio wurde nach der Wortmessung geändert: ${part.audioFile}`);
  }

  const previousWordIndexByFile = new Map();
  for (const item of mapping.images ?? []) {
    const audioFile = String(item.matchedAudioFile ?? item.audioPartFile ?? evidence.parts?.[0]?.audioFile ?? '');
    const part = partsByFile.get(audioFile);
    if (!part) {
      errors.push(`Bild ${item.imageNumber}: kein Messbeleg für ${audioFile || 'Audio'}.`);
      continue;
    }
    if (item.alignmentMethod !== 'whisper-word-timestamps-v1') errors.push(`Bild ${item.imageNumber}: Alignment wurde nicht mit Whisper-Wortzeiten gemessen.`);
    const wordIndex = Number(item.matchedWordIndex);
    if (!Number.isInteger(wordIndex) || wordIndex < 0 || wordIndex >= part.words.length) {
      errors.push(`Bild ${item.imageNumber}: matchedWordIndex ist ungültig.`);
      continue;
    }
    const previous = previousWordIndexByFile.get(audioFile) ?? -1;
    if (wordIndex < previous) errors.push(`Bild ${item.imageNumber}: Anchor-Suche springt im Audio rückwärts.`);
    previousWordIndexByFile.set(audioFile, wordIndex);

    const hit = findAnchorInWords(item.startAnchor, part.words, wordIndex);
    if (!hit || hit.wordIndex !== wordIndex) {
      errors.push(`Bild ${item.imageNumber}: startAnchor passt nicht zum gespeicherten Worttreffer.`);
      continue;
    }
    const expectedAbsolute = round(Number(part.absoluteOffsetSeconds ?? 0) + hit.startSeconds);
    const isFirstImage = Number(item.imageNumber) === Number(mapping.videoFirstImageNumber ?? 1);
    if (!isFirstImage && Math.abs(Number(item.actualStartSeconds) - expectedAbsolute) > 0.08) {
      errors.push(`Bild ${item.imageNumber}: actualStartSeconds stimmt nicht mit der gemessenen Wortzeit überein.`);
    }
    if (isFirstImage && Math.abs(Number(item.actualStartSeconds)) > 0.001) {
      errors.push(`Bild ${item.imageNumber}: erstes Bild muss bei 0,000 s beginnen.`);
    }
    if (Number(item.alignmentConfidence) < 0.95) errors.push(`Bild ${item.imageNumber}: gemessene Alignment-Konfidenz < 0,95.`);
  }

  const masterPath = path.join(projectDir, String(evidence.masterAudioFile ?? ''));
  if (!(await exists(masterPath))) errors.push('Gemessene Master-Audiodatei fehlt.');
  else {
    if (await sha256(masterPath) !== evidence.masterAudioFingerprintSha256) errors.push('Master-Audio wurde nach der Messung verändert.');
    const currentMasterDuration = await ffprobeDuration(masterPath);
    if (Math.abs(currentMasterDuration - Number(evidence.totalDurationSeconds)) > 0.3) {
      errors.push('Master-Audiodauer stimmt nicht mehr mit dem Messbeleg überein.');
    }
  }

  return { passed: errors.length === 0, errors, evidence };
}

export { MEASUREMENT_FILE, MASTER_AUDIO_FILE };
