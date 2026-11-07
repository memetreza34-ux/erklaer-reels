import { execFile } from 'node:child_process';
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));

export const MASTER_REFERENCE_TEXT =
  'Willkommen bei Alles Stickman. Wir erzählen die krassesten und faszinierendsten Geschichten der Menschheit. Unzensiert, direkt und auf den Punkt. Was passiert, wenn alles schief geht und du nur eine einzige Chance hast zu überleben? Genau das finden wir heute heraus. Lehn dich zurück und bleib bis zum Ende dran.';

export const VOICE_PRESETS = {
  'stickman-user-clone': {
    name: 'stickman-user-clone',
    label: 'Master Creator Voice Clone (0.95x Tempo)',
    engine: 'qwen-mlx',
    provider: 'qwen-mlx',
    model: 'mlx-community/Qwen3-TTS-12Hz-1.7B-Base-bf16',
    voice: 'stickman-user-clone',
    persona: 'stickman-user-clone',
    refAudio: 'channel/audio/reference/user_voice_reference.wav',
    refMetadata: 'channel/audio/reference/user_voice_reference.json',
    refText: MASTER_REFERENCE_TEXT,
    temperature: 0.7,
    tempo: 0.95,
    atempo: 0.95,
    rate: '-5%',
    pitch: '+0Hz',
    volume: '+0%',
    max_pause: 0.285,
    preStretchMaxPauseSeconds: 0.285,
    maxPauseSeconds: 0.30,
    maxWordsPerChunk: 32,
    description:
      'Exakter 1:1 Stimmklon aus deiner eigenen Referenzaufnahme (18.48s Studio-Referenz) via Qwen3-TTS 1.7B Base auf Apple Silicon, kalibriert auf 0.95x Tempo (-5%), max. 0.30s Pausen und 32 Wörter pro Chunk.'
  }
};

export const DEFAULT_PRESET = 'stickman-user-clone';

export function resolveRepoPath(...parts) {
  return path.join(REPO_ROOT, ...parts);
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function loadVoicePolicy(customPath) {
  const policyPath = customPath || resolveRepoPath('config', 'voice-policy.json');
  const raw = await readFile(policyPath, 'utf8');
  return JSON.parse(raw);
}

/**
 * Parses a tempo multiplier from profile/CLI options.
 * Supports numeric tempo (e.g. 0.95) or percentage rate strings (e.g. "-5%", "+4%").
 */
export function parseProfileTempo(profile = {}, options = {}) {
  if (options.tempo !== undefined && options.tempo !== null) {
    const t = Number(options.tempo);
    if (Number.isFinite(t) && t >= 0.5 && t <= 2.0) return Number(t.toFixed(4));
  }
  if (options.atempo !== undefined && options.atempo !== null) {
    const t = Number(options.atempo);
    if (Number.isFinite(t) && t >= 0.5 && t <= 2.0) return Number(t.toFixed(4));
  }
  if (typeof options.rate === 'string' && options.rate.trim().endsWith('%')) {
    const pct = Number(options.rate.trim().slice(0, -1));
    if (Number.isFinite(pct)) {
      const t = 1 + pct / 100;
      if (t >= 0.5 && t <= 2.0) return Number(t.toFixed(4));
    }
  }
  if (profile.tempo !== undefined && profile.tempo !== null) {
    const t = Number(profile.tempo);
    if (Number.isFinite(t) && t >= 0.5 && t <= 2.0) return Number(t.toFixed(4));
  }
  if (profile.atempo !== undefined && profile.atempo !== null) {
    const t = Number(profile.atempo);
    if (Number.isFinite(t) && t >= 0.5 && t <= 2.0) return Number(t.toFixed(4));
  }
  if (typeof profile.rate === 'string' && profile.rate.trim().endsWith('%')) {
    const pct = Number(profile.rate.trim().slice(0, -1));
    if (Number.isFinite(pct)) {
      const t = 1 + pct / 100;
      if (t >= 0.5 && t <= 2.0) return Number(t.toFixed(4));
    }
  }
  return 0.95;
}

export function formatAtempoFilter(tempo) {
  const num = Number(tempo);
  if (!Number.isFinite(num) || Math.abs(num - 1.0) < 0.001) {
    return null;
  }
  const clamped = Math.min(2.0, Math.max(0.5, num));
  return `atempo=${Number(clamped.toFixed(4))}`;
}

/**
 * Builds the FFmpeg audio filter chain that makes voices sound fuller,
 * warmer, smoother, and less robotic ("Studio Voice Boost").
 */
export function buildVoiceBoostFilter(boost) {
  if (boost && boost.enabled === false) return null;
  const b = boost || {
    enabled: true,
    highpassHz: 75,
    deess: { enabled: true, intensity: 0.45, max: 0.55, frequency: 0.5, freqHz: 6600, gainDb: -3.5, q: 2.0 },
    warmth: { freqHz: 180, gainDb: 2.2, q: 1.2 },
    presence: { freqHz: 3200, gainDb: 2.0, q: 1.2 },
    aiSheenTame: { freqHz: 11500, gainDb: -2.5, q: 1.0 },
    tubeWarmth: { enabled: true, type: 'tanh', threshold: 0.88, output: 0.98 },
    roomPresence: { enabled: true, inGain: 0.88, outGain: 0.95, delays: '18|28', decays: '0.04|0.02' },
    compand: 'attacks=0.02:decays=0.15:points=-60/-60|-24/-18|-12/-10|0/-3:gain=1',
    limiter: 0.92
  };

  const parts = [];

  if (b.highpassHz) {
    parts.push(`highpass=f=${Number(b.highpassHz)}`);
  }

  if (b.deess && b.deess.enabled !== false) {
    const intensity = b.deess.intensity ?? 0.45;
    const maxDeess = b.deess.max ?? 0.55;
    const freq = b.deess.frequency ?? 0.5;
    parts.push(`deesser=i=${intensity}:m=${maxDeess}:f=${freq}:s=o`);
    if (b.deess.freqHz && b.deess.gainDb) {
      const q = b.deess.q ?? 2.0;
      parts.push(`equalizer=f=${Number(b.deess.freqHz)}:t=q:w=${Number(q)}:g=${Number(b.deess.gainDb)}`);
    }
  }

  if (b.warmth && typeof b.warmth === 'object') {
    parts.push(`equalizer=f=${Number(b.warmth.freqHz)}:t=q:w=${Number(b.warmth.q)}:g=${Number(b.warmth.gainDb)}`);
  }

  if (b.presence && typeof b.presence === 'object') {
    parts.push(`equalizer=f=${Number(b.presence.freqHz)}:t=q:w=${Number(b.presence.q)}:g=${Number(b.presence.gainDb)}`);
  }

  if (b.treble && typeof b.treble === 'object') {
    parts.push(`treble=g=${Number(b.treble.gainDb)}:f=${Number(b.treble.freqHz)}`);
  }

  if (b.aiSheenTame && typeof b.aiSheenTame === 'object' && b.aiSheenTame.enabled !== false) {
    const freqHz = b.aiSheenTame.freqHz ?? 11500;
    const gainDb = b.aiSheenTame.gainDb ?? -2.0;
    const q = b.aiSheenTame.q ?? 1.0;
    parts.push(`equalizer=f=${Number(freqHz)}:t=q:w=${Number(q)}:g=${Number(gainDb)}`);
  }

  if (b.tubeWarmth && typeof b.tubeWarmth === 'object' && b.tubeWarmth.enabled !== false) {
    const type = b.tubeWarmth.type || 'tanh';
    const thresh = b.tubeWarmth.threshold || 0.88;
    const out = b.tubeWarmth.output || 0.98;
    parts.push(`asoftclip=type=${type}:threshold=${thresh}:output=${out}`);
  }

  if (b.roomPresence && typeof b.roomPresence === 'object' && b.roomPresence.enabled !== false) {
    const inGain = b.roomPresence.inGain ?? 0.88;
    const outGain = b.roomPresence.outGain ?? 0.95;
    const delays = b.roomPresence.delays || '18|28';
    const decays = b.roomPresence.decays || '0.04|0.02';
    parts.push(`aecho=in_gain=${inGain}:out_gain=${outGain}:delays=${delays}:decays=${decays}`);
  }

  if (b.compand) {
    parts.push(`compand=${b.compand}`);
  }

  if (b.limiter) {
    parts.push(`alimiter=limit=${Number(b.limiter)}:level=false`);
  }

  return parts.length > 0 ? parts.join(',') : null;
}

/**
 * Normalizes script text for German Text-to-Speech:
 * - Expands acronyms (UN, USA, UdSSR, etc.)
 * - Expands common abbreviations (z. B., d. h., Mrd., etc.)
 * - Removes bracketed stage directions ([Szene 1], [Pause], etc.)
 */
export function normalizeGermanScriptForTts(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText;

  // 1. Remove bracketed stage directions or notes
  text = text.replace(/\[[^\]]*\]/g, ' ');
  text = text.replace(/\((?:Pause|Musik|SFX|Sprecher|Betonung|flüstert)[^)]*\)/gi, ' ');

  // 2. Remove markdown headings
  text = text.replace(/^#{1,6}\s+/gm, '');

  // 3. Geopolitical acronyms (avoid mispronunciation like 'un' or 'usa')
  text = text.replace(
    /\bUN-(Sicherheitsrat|Charta|Veto|Resolution|Truppen|Mission|Generalversammlung|Mitgliedstaaten|Mitglieder|Organisation|Abstimmung)\b/gi,
    'U-N-$1'
  );
  text = text.replace(/\bUN\b/g, 'U-N');
  text = text.replace(/\bUSA\b/g, 'U-S-A');
  text = text.replace(/\bUdSSR\b/g, 'U-d-S-S-R');
  text = text.replace(/\bEU\b/g, 'E-U');
  text = text.replace(/\bBVerfG\b/g, 'Bundesverfassungsgericht');
  text = text.replace(/\bBIP\b/g, 'B-I-P');
  text = text.replace(/\bLNG\b/g, 'L-N-G');
  text = text.replace(/\bG7\b/g, 'G-7');
  text = text.replace(/\bG20\b/g, 'G-20');
  text = text.replace(/\bWTO\b/g, 'W-T-O');
  text = text.replace(/\bIWF\b/g, 'I-W-F');
  text = text.replace(/\bWHO\b/g, 'W-H-O');
  text = text.replace(/\bIAEA\b/g, 'I-A-E-A');
  text = text.replace(/\bICC\b/g, 'I-C-C');
  text = text.replace(/\bIGH\b/g, 'I-G-H');

  // 4. Common German abbreviations
  text = text.replace(/\bz\.\s*B\./g, 'zum Beispiel');
  text = text.replace(/\bd\.\s*h\./g, 'das heißt');
  text = text.replace(/\bbzw\./g, 'beziehungsweise');
  text = text.replace(/\bca\./g, 'circa');
  text = text.replace(/\bu\.\s*a\./g, 'unter anderem');
  text = text.replace(/\bv\.\s*a\./g, 'vor allem');
  text = text.replace(/\bsog\./g, 'sogenannte');
  text = text.replace(/\bMrd\./g, 'Milliarden');
  text = text.replace(/\bMio\./g, 'Millionen');
  text = text.replace(/\bkm²\b/g, 'Quadratkilometer');
  text = text.replace(/\bkm\b/g, 'Kilometer');
  text = text.replace(/(\d+)\s*%/g, '$1 Prozent');
  text = text.replace(/\s*%/g, ' Prozent');
  text = text.replace(/\b§\s*(\d+)/g, 'Paragraph $1');
  text = text.replace(/\bArt\.\s*(\d+)/g, 'Artikel $1');
  text = text.replace(/\bNr\.\s*(\d+)/g, 'Nummer $1');

  // 5. Clean whitespace
  text = text.replace(/[ \t]+/g, ' ');
  return text.trim();
}

/**
 * Splits normalized script into manageable narrative chunks (default: <= 32 words per chunk).
 */
export function splitScriptIntoParagraphs(text, maxWordsPerChunk = 32) {
  const paragraphs = String(text || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks = [];
  let currentId = 0;

  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length <= maxWordsPerChunk) {
      chunks.push({ id: currentId++, text: para });
    } else {
      const sentences = para.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g) || [para];
      let sub = '';
      for (const sent of sentences) {
        const trimmedSent = sent.trim();
        if (!trimmedSent) continue;
        const sentWords = trimmedSent.split(/\s+/).filter(Boolean);
        if (sentWords.length > maxWordsPerChunk) {
          if (sub.trim().length > 0) {
            chunks.push({ id: currentId++, text: sub.trim() });
            sub = '';
          }
          for (let i = 0; i < sentWords.length; i += maxWordsPerChunk) {
            chunks.push({
              id: currentId++,
              text: sentWords.slice(i, i + maxWordsPerChunk).join(' ')
            });
          }
          continue;
        }
        const candidate = (sub ? `${sub} ${trimmedSent}` : trimmedSent).trim();
        if (candidate.split(/\s+/).filter(Boolean).length > maxWordsPerChunk && sub.length > 0) {
          chunks.push({ id: currentId++, text: sub.trim() });
          sub = trimmedSent;
        } else {
          sub = candidate;
        }
      }
      if (sub.trim().length > 0) {
        chunks.push({ id: currentId++, text: sub.trim() });
      }
    }
  }

  return chunks;
}

/**
 * Resolves voice configuration from preset or explicit overrides.
 * Only 'stickman-user-clone' is supported as the calibrated channel voice.
 */
export function resolveVoiceConfig({
  preset = DEFAULT_PRESET,
  profile,
  engine,
  voice,
  rate,
  pitch,
  volume,
  persona,
  instruct,
  tempo,
  atempo,
  max_pause,
  maxPauseSeconds,
  maxWordsPerChunk,
  temperature,
  refAudio,
  refText
} = {}) {
  const requestedKey = profile || preset || DEFAULT_PRESET;
  const base = VOICE_PRESETS[requestedKey] || VOICE_PRESETS[DEFAULT_PRESET];
  const resolvedTempo = parseProfileTempo(base, { tempo, atempo, rate });
  const resolvedMaxPause =
    maxPauseSeconds !== undefined ? Number(maxPauseSeconds) : base.maxPauseSeconds;
  const resolvedPreStretchPause =
    max_pause !== undefined
      ? Number(max_pause)
      : Number((resolvedMaxPause * resolvedTempo).toFixed(4));

  return {
    preset: VOICE_PRESETS[requestedKey] ? requestedKey : DEFAULT_PRESET,
    profile: VOICE_PRESETS[requestedKey] ? requestedKey : DEFAULT_PRESET,
    label: base.label,
    engine: engine || base.engine || 'qwen-mlx',
    provider: base.provider || 'qwen-mlx',
    model: base.model,
    persona: persona || base.persona || 'stickman-user-clone',
    instruct: instruct || base.instruct,
    voice: voice || base.voice || 'stickman-user-clone',
    refAudio: refAudio || base.refAudio,
    refText: refText || base.refText,
    temperature: temperature !== undefined ? Number(temperature) : base.temperature,
    rate: rate || base.rate || '-5%',
    pitch: pitch || base.pitch || '+0Hz',
    volume: volume || base.volume || '+0%',
    tempo: resolvedTempo,
    atempo: resolvedTempo,
    max_pause: resolvedPreStretchPause,
    preStretchMaxPauseSeconds: resolvedPreStretchPause,
    maxPauseSeconds: resolvedMaxPause,
    maxWordsPerChunk: maxWordsPerChunk || base.maxWordsPerChunk || 32
  };
}

/**
 * Probes audio duration with ffprobe.
 */
export async function probeAudioDuration(filePath) {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    filePath
  ]);
  const duration = Number(String(stdout).trim());
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Ungültige Audiodauer ermittelt: ${filePath}`);
  }
  return Number(duration.toFixed(3));
}

/**
 * Synthesizes German voiceover using the calibrated stickman-user-clone voice
 * (Qwen3-TTS 1.7B Base via MLX at 0.95x tempo, <=0.30s pauses, <=32 words per chunk).
 */
export async function generateYoutubeVoiceover(projectDirectory, options = {}) {
  const projectDir = path.resolve(projectDirectory);
  const scriptPath = path.join(projectDir, '01-voice-script', 'voice-script.txt');
  const audioDir = path.join(projectDir, '02-audio');
  const techDir = path.join(projectDir, '99-technik');
  const rawWavPath = path.join(techDir, 'voiceover-raw.wav');
  const outputWav = path.join(audioDir, 'voiceover-final.wav');
  const reportPath = path.join(techDir, 'YOUTUBE_VOICE_REPORT.json');

  if (!(await exists(scriptPath))) {
    throw new Error(`Voice-Script fehlt: ${scriptPath}`);
  }

  if ((await exists(outputWav)) && !options.force && !options.dryRun) {
    throw new Error(
      `Audiodatei existiert bereits: ${outputWav}. Verwende --force zum Überschreiben.`
    );
  }

  const policy = await loadVoicePolicy(options.policyPath);
  const config = resolveVoiceConfig(options);
  const rawScript = await readFile(scriptPath, 'utf8');
  const normalizedScript = normalizeGermanScriptForTts(rawScript);
  const chunks = splitScriptIntoParagraphs(normalizedScript, config.maxWordsPerChunk);

  if (!chunks.length) {
    throw new Error('Das Skript enthält keinen sprechbaren Text.');
  }

  const wordCount = normalizedScript.split(/\s+/).filter(Boolean).length;
  const pauseBetweenSeconds = options.pauseBetweenSeconds ?? config.maxPauseSeconds ?? 0.30;

  if (options.dryRun) {
    return {
      dryRun: true,
      config,
      rawAudioPath: rawWavPath,
      outputWav,
      totalWords: wordCount,
      totalChunks: chunks.length,
      estimatedDurationMinutes: (wordCount / 145).toFixed(1),
      chunks: chunks.map((c) => ({
        id: c.id,
        words: c.text.split(/\s+/).filter(Boolean).length,
        preview: c.text.slice(0, 80) + (c.text.length > 80 ? '...' : '')
      }))
    };
  }

  const workDir = path.join(techDir, 'temp-tts-generation');
  await rm(workDir, { recursive: true, force: true });
  await mkdir(workDir, { recursive: true });
  await mkdir(audioDir, { recursive: true });
  await mkdir(techDir, { recursive: true });

  try {
    const refAudioPath = path.isAbsolute(config.refAudio)
      ? config.refAudio
      : resolveRepoPath(config.refAudio);
    if (!(await exists(refAudioPath))) {
      throw new Error(`Referenz-Audiodatei für Voice-Cloning fehlt: ${refAudioPath}`);
    }

    const sprecherPy = '/Users/arman/finanzneo-tts/sprecher.py';
    const localVenvPython = '/Users/arman/finanzneo-tts/.venv/bin/python';
    const hasSprecher = (await exists(sprecherPy)) && (await exists(localVenvPython));

    const tempRawUnstretchedWav = path.join(workDir, 'raw-unstretched.wav');

    if (hasSprecher) {
      const normalizedTxtPath = path.join(workDir, 'normalized-script.txt');
      await writeFile(normalizedTxtPath, `${normalizedScript}\n`, 'utf8');

      await execFileAsync(
        localVenvPython,
        [
          sprecherPy,
          '--script',
          normalizedTxtPath,
          '--out',
          tempRawUnstretchedWav,
          '--voice',
          config.voice,
          '--ref-audio',
          refAudioPath,
          '--ref-text',
          config.refText,
          '--temperature',
          String(config.temperature ?? 0.7),
          '--max-pause',
          String(config.preStretchMaxPauseSeconds ?? 0.285),
          '--no-master'
        ],
        {
          timeout: 60 * 60 * 1000,
          maxBuffer: 20 * 1024 * 1024,
          env: { ...process.env, HF_HOME: '/Users/arman/finanzneo-tts/hf' }
        }
      );
    } else {
      const bridgeScript = resolveRepoPath('scripts', 'qwen3_tts_bridge.py');
      const bridgePayload = {
        chunks,
        persona: config.persona,
        output_dir: workDir,
        atempo: 1.0,
        eq_filter: '',
        max_pause: config.preStretchMaxPauseSeconds ?? 0.285,
        temperature: config.temperature ?? 0.7,
        ref_audio: refAudioPath,
        ref_text: config.refText
      };
      const payloadPath = path.join(workDir, 'payload.json');
      await writeFile(payloadPath, JSON.stringify(bridgePayload, null, 2), 'utf8');

      await execFileAsync(
        'uv',
        [
          'run',
          '--with',
          'mlx',
          '--with',
          'mlx-audio',
          '--with',
          'soundfile',
          '--with',
          'numpy',
          'python3',
          bridgeScript,
          payloadPath
        ],
        { timeout: 60 * 60 * 1000 }
      );

      const chunkWavs = [];
      for (const chunk of chunks) {
        const wavPath = path.join(workDir, `chunk_${String(chunk.id).padStart(4, '0')}.wav`);
        if (!(await exists(wavPath))) {
          throw new Error(`Fehlender Audio-Chunk nach Qwen3-Synthese: ${wavPath}`);
        }
        chunkWavs.push(wavPath);
      }

      const silencePath = path.join(workDir, 'silence.wav');
      await execFileAsync('ffmpeg', [
        '-y',
        '-v',
        'error',
        '-f',
        'lavfi',
        '-i',
        'anullsrc=r=48000:cl=mono',
        '-t',
        String(config.preStretchMaxPauseSeconds ?? 0.285),
        silencePath
      ]);

      const concatList = [];
      for (let i = 0; i < chunkWavs.length; i++) {
        concatList.push(`file '${chunkWavs[i]}'`);
        if (i < chunkWavs.length - 1) {
          concatList.push(`file '${silencePath}'`);
        }
      }
      const concatTxtPath = path.join(workDir, 'concat.txt');
      await writeFile(concatTxtPath, concatList.join('\n') + '\n', 'utf8');

      await execFileAsync('ffmpeg', [
        '-y',
        '-v',
        'error',
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        concatTxtPath,
        '-c:a',
        'pcm_s16le',
        '-ar',
        '48000',
        '-ac',
        '1',
        tempRawUnstretchedWav
      ]);
    }

    // Apply tempo (0.95x) to produce rawWavPath
    const atempoFilter = formatAtempoFilter(config.tempo);
    const rawFilterArgs = atempoFilter ? ['-af', atempoFilter] : [];
    await execFileAsync('ffmpeg', [
      '-y',
      '-v',
      'error',
      '-i',
      tempRawUnstretchedWav,
      ...rawFilterArgs,
      '-ar',
      '48000',
      '-ac',
      '1',
      '-c:a',
      'pcm_s16le',
      rawWavPath
    ]);

    // Apply Studio Voice Boost to produce voiceover-final.wav
    const applyBoost = options.boost !== false && policy.voiceBoost?.enabled !== false;
    const boostFilter = applyBoost ? buildVoiceBoostFilter(policy.voiceBoost) : null;
    const finalFilterArgs = boostFilter ? ['-af', boostFilter] : [];

    await execFileAsync('ffmpeg', [
      '-y',
      '-v',
      'error',
      '-i',
      rawWavPath,
      ...finalFilterArgs,
      '-ar',
      '48000',
      '-ac',
      '1',
      '-c:a',
      'pcm_s16le',
      outputWav
    ]);

    const durationSeconds = await probeAudioDuration(outputWav);

    const report = {
      schemaVersion: 2,
      generatedAt: new Date().toISOString(),
      engine: config.engine,
      provider: config.provider,
      model: config.model,
      preset: config.preset,
      voice: config.voice,
      refAudio: config.refAudio,
      tempo: config.tempo,
      rate: config.rate,
      pitch: config.pitch,
      maxPauseSeconds: config.maxPauseSeconds,
      preStretchMaxPauseSeconds: config.preStretchMaxPauseSeconds,
      maxWordsPerChunk: config.maxWordsPerChunk,
      pauseBetweenParagraphsSeconds: pauseBetweenSeconds,
      voiceBoostApplied: applyBoost,
      sourceScript: '01-voice-script/voice-script.txt',
      rawAudioFile: '99-technik/voiceover-raw.wav',
      outputFile: '02-audio/voiceover-final.wav',
      totalWords: wordCount,
      totalChunks: chunks.length,
      durationSeconds,
      sampleRate: 48000,
      channels: 1,
      wpm: Math.round((wordCount / durationSeconds) * 60)
    };

    await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

    const statusPath = path.join(techDir, 'status.json');
    if (await exists(statusPath)) {
      try {
        const status = JSON.parse(await readFile(statusPath, 'utf8'));
        if (status.phase2) {
          status.phase2.singleFinalAudio = 'voiceover-final.wav';
        }
        await writeFile(statusPath, JSON.stringify(status, null, 2) + '\n', 'utf8');
      } catch {
        // Non-fatal if status.json has parsing issues
      }
    }

    return {
      success: true,
      rawAudioPath: rawWavPath,
      audioPath: outputWav,
      reportPath,
      report
    };
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
