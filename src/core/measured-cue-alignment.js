/**
 * Setzt jeden Bildschnitt auf den Zeitpunkt, an dem sein Cue-Wort tatsächlich
 * gesprochen wird — statt ihn aus dem Textgewicht zu schätzen.
 *
 * Die Zuordnung läuft streng monoton durch den gemessenen Wortstrom: Ein
 * späterer Bildmoment kann nie vor einem früheren liegen. Sonst würde eine im
 * Script wiederholte Formulierung ("die Mehrheit" kommt im Vetorecht-Script
 * dreimal vor) den Schnitt an die falsche Stelle ziehen.
 */

import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { findSpokenCue } from '../shared/spoken-text-match.js';
import { measureVoiceWordTimings } from './voice-word-timings.js';

export const MEASURED_ALIGNMENT_METHOD = 'measured-word-timings-v1';

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

const round = (value) => Number(Number(value).toFixed(3));

/**
 * Misst die Cue-Zeitpunkte und schreibt sie nach timeline/audio-sync.json.
 *
 * @returns {Promise<{available: boolean, reason: string, source: string, matched: number, total: number,
 *   unmatched: object[], alignments: object[], audioSync: object|null}>}
 */
export async function alignCuesToMeasuredAudio(technicalDirectory, { audioFile, audioDurationSeconds, model, refresh = false } = {}) {
  const mapping = await readJson(path.join(technicalDirectory, 'BILD_AUDIO_ZUORDNUNG.json'));
  const entries = Array.isArray(mapping?.mappings) ? mapping.mappings : [];
  if (entries.length === 0) {
    return { available: false, reason: 'BILD_AUDIO_ZUORDNUNG.json enthält keine Bildmomente.', source: null, matched: 0, total: 0, unmatched: [], alignments: [], audioSync: null };
  }

  const measurement = await measureVoiceWordTimings(technicalDirectory, audioFile, { model, refresh });
  if (!measurement.available) {
    return { available: false, reason: measurement.reason, source: null, matched: 0, total: entries.length, unmatched: [], alignments: [], audioSync: null };
  }

  const words = measurement.words;
  const alignments = [];
  const unmatched = [];
  let cursor = 0;

  for (const [index, entry] of entries.entries()) {
    const cue = String(entry.existingAudioCue || entry.startAnchor || '').trim();
    // Das allererste Bild startet immer bei Sekunde 0, egal was Whisper aus dem
    // ersten Wort macht.
    if (index === 0) {
      alignments.push({ ...entry, actualStartSeconds: 0, alignmentConfidence: 1, alignmentMethod: MEASURED_ALIGNMENT_METHOD, matchedWordIndex: 0 });
      continue;
    }

    const hit = cue ? findSpokenCue(cue, words, { fromWordIndex: cursor }) : null;
    if (!hit) {
      unmatched.push({ phaseId: entry.phaseId, sceneId: entry.sceneId, audioCue: cue });
      alignments.push({ ...entry, actualStartSeconds: null, alignmentConfidence: null, alignmentMethod: MEASURED_ALIGNMENT_METHOD, matchedWordIndex: null });
      continue;
    }

    cursor = hit.wordIndex;
    alignments.push({
      ...entry,
      actualStartSeconds: round(hit.startSeconds),
      alignmentConfidence: hit.confidence,
      alignmentMethod: `${MEASURED_ALIGNMENT_METHOD}:${hit.method}`,
      matchedWordIndex: hit.wordIndex
    });
  }

  // Endzeiten ergeben sich aus dem jeweils nächsten gemessenen Start.
  for (const [index, entry] of alignments.entries()) {
    const next = alignments.slice(index + 1).find((item) => item.actualStartSeconds !== null);
    entry.actualEndSeconds = next ? next.actualStartSeconds : round(audioDurationSeconds);
  }

  const cueTimings = alignments
    .filter((entry) => entry.timingRole === 'scene-start')
    .map((entry, index) => ({
      sceneId: entry.sceneId,
      audioCue: entry.existingAudioCue || entry.startAnchor,
      cueTimeSeconds: index === 0 ? 0 : entry.actualStartSeconds,
      leadInSeconds: index === 0 ? 0 : 0.10,
      confidence: entry.alignmentConfidence,
      method: entry.alignmentMethod
    }));

  const phaseCueTimings = alignments
    .filter((entry) => entry.timingRole === 'internal-image-cut')
    .map((entry) => ({
      targetId: entry.phaseId,
      sceneId: entry.sceneId,
      phaseId: entry.phaseId,
      audioCue: entry.existingAudioCue || entry.startAnchor,
      cueTimeSeconds: entry.actualStartSeconds,
      confidence: entry.alignmentConfidence,
      method: entry.alignmentMethod
    }));

  const matched = alignments.filter((entry) => entry.actualStartSeconds !== null).length;
  const audioSync = {
    version: 3,
    audioDurationSeconds: round(audioDurationSeconds),
    audioFile,
    source: MEASURED_ALIGNMENT_METHOD,
    timingStatus: unmatched.length === 0 ? 'audio-synced' : 'measurement-incomplete',
    measurement: {
      method: 'whisper-word-timestamps',
      model: measurement.model,
      audioFingerprintSha256: measurement.fingerprint,
      wordCount: words.length,
      matchedCues: matched,
      totalCues: alignments.length
    },
    instructions: [
      'cueTimeSeconds stammt aus der Wortmessung am finalen Voice-over, nicht aus einer Schätzung.',
      'Nach jeder Änderung am Voice-over muss die Messung neu laufen; der Fingerprint erzwingt das.',
      'Szenencut ca. 0,10 s vor dem Sprachbeginn; interner Bildcut ca. 0,08 s davor.'
    ],
    cueTimings,
    phaseCueTimings
  };

  const audioSyncPath = path.join(technicalDirectory, 'timeline', 'audio-sync.json');
  await writeFile(audioSyncPath, `${JSON.stringify(audioSync, null, 2)}\n`, 'utf8');

  const mappingPath = path.join(technicalDirectory, 'BILD_AUDIO_ZUORDNUNG.json');
  await writeFile(mappingPath, `${JSON.stringify({
    ...mapping,
    version: Math.max(Number(mapping.version ?? 0), 3),
    autoAlignment: {
      method: MEASURED_ALIGNMENT_METHOD,
      audioDurationSeconds: round(audioDurationSeconds),
      model: measurement.model,
      audioFingerprintSha256: measurement.fingerprint,
      matchedCues: matched,
      totalCues: alignments.length,
      note: 'Zeitpunkte am gesprochenen Wort gemessen. Keine Schätzung aus Textgewicht mehr.'
    },
    mappings: alignments
  }, null, 2)}\n`, 'utf8');

  return {
    available: true,
    reason: unmatched.length === 0
      ? `Alle ${matched} Bildmomente sind am gesprochenen Wort gemessen.`
      : `${unmatched.length} von ${alignments.length} Cues wurden im Voice-over nicht gefunden.`,
    source: MEASURED_ALIGNMENT_METHOD,
    matched,
    total: alignments.length,
    unmatched,
    alignments,
    audioSync,
    audioSyncPath,
    cached: measurement.cached
  };
}
