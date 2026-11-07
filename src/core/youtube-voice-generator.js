import { execFile } from 'node:child_process';
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export const VOICE_PRESETS = {
  'weltlogik-alte-stimme-klon': {
    name: 'weltlogik-alte-stimme-klon',
    label: 'Deine alte Kanalstimme (1:1 KI-Klon via Qwen3-Base)',
    engine: 'qwen3-voice-design',
    persona: 'alte-kanalstimme',
    atempo: 1.05,
    max_pause: 0.25,
    description: '1:1 Nachbau deiner bisherigen Google-KI-Stimme, optimiert mit sanft beschleunigtem Tempo (1.05x) und natürlichen kurzen Pausen (≤0.25s).'
  },
  'weltlogik-explainer-storyteller': {
    name: 'weltlogik-explainer-storyteller',
    label: 'Der Moderne Explainer (Simplicissimus / MrWissen2go Vibe)',
    engine: 'qwen3-voice-design',
    persona: 'explainer-storyteller',
    description: 'Perfekte Balance für TikTok/Reels & 15min YouTube. Natürlich, mitreißend, Neugier weckend, null KI-Gefühl.'
  },
  'weltlogik-explainer-suspense': {
    name: 'weltlogik-explainer-suspense',
    label: 'Der Fesselnde Storyteller (Spannung & Neugier)',
    engine: 'qwen3-voice-design',
    persona: 'explainer-suspense',
    description: 'Spannungsgeladene Erzählung mit Mysterium im Unterton. Hält die Zuschauerbindung bis zum Schluss extrem hoch.'
  },
  'weltlogik-explainer-soveraen': {
    name: 'weltlogik-explainer-soveraen',
    label: 'Der Souveräne Analyst (Kurzgesagt / Arte Doku)',
    engine: 'qwen3-voice-design',
    persona: 'explainer-soveraen',
    description: 'Samtiger, warmer Bariton mit glasklarer Diktion und philosophischer Ruhe für maximale Glaubwürdigkeit.'
  },
  'weltlogik-explainer-close-mic': {
    name: 'weltlogik-explainer-close-mic',
    label: 'Der Intime Doku-Host (Desk Creator & Nahbesprechung)',
    engine: 'qwen3-voice-design',
    persona: 'explainer-close-mic',
    description: 'Nah am Mikrofon, intim und authentisch. Erzeugt das Gefühl eines persönlichen Insider-Gesprächs.'
  },
  'weltlogik-brueckner': {
    name: 'weltlogik-brueckner',
    label: 'Christian Brückner Klon (Die legendäre Stimme / De Niro)',
    engine: 'qwen3-voice-design',
    persona: 'christian-brueckner',
    description: 'Rau, rauchig, tief und unendlich fesselnd. Die berühmteste deutsche Dokumentarstimme aller Zeiten.'
  },
  'weltlogik-nathan': {
    name: 'weltlogik-nathan',
    label: 'David Nathan Klon (Christian Bale / Stephen King Thriller)',
    engine: 'qwen3-voice-design',
    persona: 'david-nathan',
    description: 'Dunkel, packend, intensiver Vocal-Fry. Perfekt für Crime, Machtspiele und Social Media Reels.'
  },
  'weltlogik-wunder': {
    name: 'weltlogik-wunder',
    label: 'Dietmar Wunder Klon (Daniel Craig / James Bond)',
    engine: 'qwen3-voice-design',
    persona: 'dietmar-wunder',
    description: 'Maskulin, messerscharf, cool und modern. Hohe Dynamik für Social Media Hooks.'
  },
  'weltlogik-social-alpha': {
    name: 'weltlogik-social-alpha',
    label: 'Social Media Alpha Host (TikTok / Reels High-Retention Pacing)',
    engine: 'qwen3-voice-design',
    persona: 'social-alpha-host',
    description: 'Schnelles, mitreißendes Erklär-Pacing (MrWissen2go Tempo) mit maximaler Zuschauerbindung.'
  },
  'weltlogik-lehmann': {
    name: 'weltlogik-lehmann',
    label: 'Manfred Lehmann Klon (Bruce Willis – Rau & Kraftvoll)',
    engine: 'qwen3-voice-design',
    persona: 'manfred-lehmann',
    description: 'Extrem markanter, heiser-kräftiger Action-Trailer-Sound. Unverwechselbar und 100% menschlich.'
  },
  'weltlogik-qwen3-bariton': {
    name: 'weltlogik-qwen3-bariton',
    label: 'Weltlogik Signatur (Qwen3-TTS 1.7B Bariton – Tief & Hypnotisch)',
    engine: 'qwen3-voice-design',
    persona: 'geopolitik-bariton',
    description: 'Bespoke 1.7B KI-Stimme via Apple Silicon Metal GPU. Warme Bariton-Brustresonanz, ruhige Gravitas, Arte/ZDFinfo Doku-Stil.'
  },
  'weltlogik-qwen3-thriller': {
    name: 'weltlogik-qwen3-thriller',
    label: 'Weltlogik Thriller (Qwen3-TTS 1.7B – Raspy, Dunkel & Fesselnd)',
    engine: 'qwen3-voice-design',
    persona: 'cinematic-thriller',
    description: 'Tiefe, leicht rauchige Erzählerstimme mit befehlsartiger Präsenz und intensivem Vocal-Fry für maximale Spannung.'
  },
  'weltlogik-qwen3-investigativ': {
    name: 'weltlogik-qwen3-investigativ',
    label: 'Weltlogik Investigativ (Qwen3-TTS 1.7B – Nahbesprechung & Geheimnisvoll)',
    engine: 'qwen3-voice-design',
    persona: 'investigativ-intim',
    description: 'Körpernahe Nahbesprechung im Radio-Studio, analytisch, intim und hochgradig glaubwürdig.'
  },
  'weltlogik-qwen3-host': {
    name: 'weltlogik-qwen3-host',
    label: 'Weltlogik Doku-Host (Qwen3-TTS 1.7B – Modern & Dynamisch)',
    engine: 'qwen3-voice-design',
    persona: 'doku-host',
    description: 'Modernes Erklär-Pacing mit glasklarer deutscher Diktion (MrWissen2go / Kurzgesagt Stil).'
  },
  'weltlogik-qwen3-korrespondentin': {
    name: 'weltlogik-qwen3-korrespondentin',
    label: 'Weltlogik Korrespondentin (Qwen3-TTS 1.7B – Souveräne Altstimme)',
    engine: 'qwen3-voice-design',
    persona: 'doku-korrespondentin',
    description: 'Warme, sonore Alt-Stimme einer diplomatischen Chefkorrespondentin für geopolitische Analysen.'
  },
  'weltlogik-florian-studio': {
    name: 'weltlogik-florian-studio',
    label: 'Florian Studio Mastered (Edge-TTS – Schneller Fallback)',
    engine: 'edge-tts',
    voice: 'de-DE-FlorianMultilingualNeural',
    rate: '+4%',
    pitch: '-2Hz',
    volume: '+0%',
    description: 'Florian mit analoger Brustresonanz (+3.2dB @195Hz) und De-Esser gegen digitales Zischeln.'
  },
  'weltlogik-signature': {
    name: 'weltlogik-signature',
    label: 'Weltlogik Killian (Edge-TTS)',
    engine: 'edge-tts',
    voice: 'de-DE-KillianNeural',
    rate: '+4%',
    pitch: '-1Hz',
    volume: '+0%',
    description: 'Warme Bariton-Sprecherstimme.'
  },
  'weltlogik-conrad': {
    name: 'weltlogik-conrad',
    label: 'Weltlogik Conrad (Edge-TTS)',
    engine: 'edge-tts',
    voice: 'de-DE-ConradNeural',
    rate: '+4%',
    pitch: '0Hz',
    volume: '+0%',
    description: 'Klare, scharfe, artikulierte Sprecherstimme.'
  }
};

export const DEFAULT_PRESET = 'weltlogik-alte-stimme-klon';

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
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
  text = text.replace(/\bUN-(Sicherheitsrat|Charta|Veto|Resolution|Truppen|Mission|Generalversammlung|Mitgliedstaaten|Mitglieder|Organisation|Abstimmung)\b/gi, 'U-N-$1');
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
 * Splits normalized script into manageable narrative chunks (by paragraph or sentence limits).
 */
export function splitScriptIntoParagraphs(text, maxWordsPerChunk = 250) {
  const paragraphs = text
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
      // Split very long paragraphs by sentence boundaries
      const sentences = para.match(/[^.!?]+[.!?]+(?:\s+|$)/g) || [para];
      let sub = '';
      for (const sent of sentences) {
        const candidate = (sub + ' ' + sent).trim();
        if (candidate.split(/\s+/).filter(Boolean).length > maxWordsPerChunk && sub.length > 0) {
          chunks.push({ id: currentId++, text: sub.trim() });
          sub = sent;
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
 */
export function resolveVoiceConfig({ preset = DEFAULT_PRESET, engine, voice, rate, pitch, volume, persona, instruct, atempo, max_pause } = {}) {
  const base = VOICE_PRESETS[preset] || VOICE_PRESETS[DEFAULT_PRESET];
  return {
    preset: VOICE_PRESETS[preset] ? preset : 'custom',
    label: base.label,
    engine: engine || base.engine || 'qwen3-voice-design',
    persona: persona || base.persona || 'geopolitik-bariton',
    instruct: instruct || base.instruct,
    voice: voice || base.voice,
    rate: rate || base.rate,
    pitch: pitch || base.pitch,
    volume: volume || base.volume,
    atempo: atempo !== undefined ? atempo : base.atempo,
    max_pause: max_pause !== undefined ? max_pause : base.max_pause
  };
}

/**
 * Probes audio duration with ffprobe.
 */
export async function probeAudioDuration(filePath) {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath
  ]);
  const duration = Number(String(stdout).trim());
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Ungültige Audiodauer ermittelt: ${filePath}`);
  }
  return Number(duration.toFixed(3));
}

/**
 * Generates automated YouTube voiceover using the open-source edge-tts engine.
 */
export async function generateYoutubeVoiceover(projectDirectory, options = {}) {
  const projectDir = path.resolve(projectDirectory);
  const scriptPath = path.join(projectDir, '01-voice-script', 'voice-script.txt');
  const audioDir = path.join(projectDir, '02-audio');
  const techDir = path.join(projectDir, '99-technik');
  const outputWav = path.join(audioDir, 'voiceover-final.wav');
  const reportPath = path.join(techDir, 'YOUTUBE_VOICE_REPORT.json');

  if (!(await exists(scriptPath))) {
    throw new Error(`Voice-Script fehlt: ${scriptPath}`);
  }

  if (await exists(outputWav) && !options.force) {
    throw new Error(`Audiodatei existiert bereits: ${outputWav}. Verwende --force zum Überschreiben.`);
  }

  const rawScript = await readFile(scriptPath, 'utf8');
  const normalizedScript = normalizeGermanScriptForTts(rawScript);
  const chunks = splitScriptIntoParagraphs(normalizedScript);

  if (!chunks.length) {
    throw new Error('Das Skript enthält keinen sprechbaren Text.');
  }

  const wordCount = normalizedScript.split(/\s+/).filter(Boolean).length;
  const config = resolveVoiceConfig(options);
  const pauseBetweenSeconds = options.pauseBetweenSeconds ?? 0.35;

  if (options.dryRun) {
    return {
      dryRun: true,
      config,
      totalWords: wordCount,
      totalChunks: chunks.length,
      estimatedDurationMinutes: (wordCount / 150).toFixed(1),
      chunks: chunks.map(c => ({ id: c.id, words: c.text.split(/\s+/).length, preview: c.text.slice(0, 80) + '...' }))
    };
  }

  const workDir = path.join(techDir, 'temp-tts-generation');
  await rm(workDir, { recursive: true, force: true });
  await mkdir(workDir, { recursive: true });

  try {
    // 1. Synthesize chunks via Python bridge
    const repoRoot = path.resolve(new URL('../../', import.meta.url).pathname);
    const chunkWavs = [];

    if (config.engine === 'qwen3-voice-design') {
      const bridgeScript = path.join(repoRoot, 'scripts', 'qwen3_tts_bridge.py');
      const bridgePayload = {
        chunks,
        persona: config.persona || 'geopolitik-bariton',
        instruct: config.instruct,
        output_dir: workDir,
        atempo: config.atempo ?? 1.05,
        max_pause: config.max_pause ?? 0.25,
        ref_audio: config.ref_audio,
        ref_text: config.ref_text
      };
      const payloadPath = path.join(workDir, 'payload.json');
      await writeFile(payloadPath, JSON.stringify(bridgePayload, null, 2), 'utf8');

      const localVenvPython = '/Users/arman/finanzneo-tts/.venv/bin/python';
      const hasLocalVenv = await exists(localVenvPython);

      if (hasLocalVenv) {
        await execFileAsync(localVenvPython, [bridgeScript, payloadPath], {
          timeout: 600_000,
          env: { ...process.env, HF_HOME: '/Users/arman/finanzneo-tts/hf' }
        });
      } else {
        await execFileAsync('uv', [
          'run',
          '--with', 'mlx',
          '--with', 'mlx-audio',
          '--with', 'soundfile',
          '--with', 'numpy',
          'python3',
          bridgeScript,
          payloadPath
        ], { timeout: 600_000 });
      }

      for (const chunk of chunks) {
        const wavPath = path.join(workDir, `chunk_${String(chunk.id).padStart(4, '0')}.wav`);
        if (!(await exists(wavPath))) {
          throw new Error(`Fehlender Audio-Chunk nach Qwen3-Synthese: ${wavPath}`);
        }
        chunkWavs.push(wavPath);
      }
    } else {
      const bridgeScript = path.join(repoRoot, 'scripts', 'edge_tts_bridge.py');
      const bridgePayload = {
        chunks,
        voice: config.voice,
        rate: config.rate,
        pitch: config.pitch,
        volume: config.volume,
        output_dir: workDir,
        concurrency: options.concurrency ?? 4
      };

      const payloadPath = path.join(workDir, 'payload.json');
      await writeFile(payloadPath, JSON.stringify(bridgePayload, null, 2), 'utf8');

      await execFileAsync('uv', [
        'run',
        '--with', 'edge-tts',
        'python3',
        bridgeScript,
        payloadPath
      ], { timeout: 300_000 });

      // Convert each chunk to standard 48kHz mono WAV
      for (const chunk of chunks) {
        const mp3Path = path.join(workDir, `chunk_${String(chunk.id).padStart(4, '0')}.mp3`);
        const wavPath = path.join(workDir, `chunk_${String(chunk.id).padStart(4, '0')}.wav`);
        if (!(await exists(mp3Path))) {
          throw new Error(`Fehlender Audio-Chunk nach Synthese: ${mp3Path}`);
        }
        await execFileAsync('ffmpeg', [
          '-y',
          '-v', 'error',
          '-i', mp3Path,
          '-ar', '48000',
          '-ac', '1',
          wavPath
        ]);
        chunkWavs.push(wavPath);
      }
    }

    // 3. Generate silence buffer
    const silencePath = path.join(workDir, 'silence.wav');
    await execFileAsync('ffmpeg', [
      '-y',
      '-v', 'error',
      '-f', 'lavfi',
      '-i', `anullsrc=r=48000:cl=mono`,
      '-t', String(pauseBetweenSeconds),
      silencePath
    ]);

    // 4. Concatenate chunks with silence buffer
    const concatList = [];
    for (let i = 0; i < chunkWavs.length; i++) {
      concatList.push(`file '${chunkWavs[i]}'`);
      if (i < chunkWavs.length - 1 && pauseBetweenSeconds > 0) {
        concatList.push(`file '${silencePath}'`);
      }
    }

    const concatTxtPath = path.join(workDir, 'concat.txt');
    await writeFile(concatTxtPath, concatList.join('\n') + '\n', 'utf8');

    await mkdir(audioDir, { recursive: true });
    await execFileAsync('ffmpeg', [
      '-y',
      '-v', 'error',
      '-f', 'concat',
      '-safe', '0',
      '-i', concatTxtPath,
      '-c:a', 'pcm_s16le',
      '-ar', '48000',
      '-ac', '1',
      outputWav
    ]);

    // 5. Verify duration
    const durationSeconds = await probeAudioDuration(outputWav);

    // 6. Generate detailed report
    const report = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      engine: config.engine,
      preset: config.preset,
      voice: config.voice,
      rate: config.rate,
      pitch: config.pitch,
      pauseBetweenParagraphsSeconds: pauseBetweenSeconds,
      sourceScript: '01-voice-script/voice-script.txt',
      outputFile: '02-audio/voiceover-final.wav',
      totalWords: wordCount,
      totalChunks: chunks.length,
      durationSeconds,
      sampleRate: 48000,
      channels: 1,
      wpm: Math.round((wordCount / durationSeconds) * 60)
    };

    await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

    // 7. Update status.json if present
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
      audioPath: outputWav,
      reportPath,
      report
    };
  } finally {
    // Cleanup temporary chunk files
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
