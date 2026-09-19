/**
 * Hard Gate: Bildschnitte müssen am Audio gemessen sein, nicht geschätzt.
 *
 * `buildSequentialAudioSync` hat die Gesamtdauer nach Wortgewicht verteilt und
 * das Ergebnis trotzdem `timingStatus: "audio-synced"` genannt. Die Timeline hat
 * daraus `exact-audio-cue` gemacht, der Final-Report meldete "exakte Audio-Cues"
 * — und die Bilder liefen im Vetorecht-Reel im Mittel 1,44 s zu früh.
 *
 * Dieser Gate prüft drei Dinge:
 *   1. Die Zeitpunkte stammen aus einer Messung.
 *   2. Die Messung gehört zum aktuellen Voice-over (Fingerprint).
 *   3. Jeder Cue sitzt wirklich an seinem gesprochenen Wort.
 */

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

import { findSpokenCue } from '../shared/spoken-text-match.js';
import { MEASURED_ALIGNMENT_METHOD } from './measured-cue-alignment.js';
import { readMeasuredWordTimings } from './voice-word-timings.js';

const MEASURED_TIMING_GATE_SINCE = '2026-09-19';

// Der Renderer setzt den Schnitt bewusst 0,08–0,10 s vor das Cue-Wort. Alles
// darüber hinaus ist Drift und auf dem Handy als Versatz wahrnehmbar.
const MAXIMUM_CUE_DEVIATION_SECONDS = 0.25;

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

/**
 * @returns {Promise<{required: boolean, passed: boolean, reason: string, findings: object[], statistics: object|null}>}
 */
export async function verifyMeasuredCueTiming(technicalDirectory) {
  const reel = await readJson(path.join(technicalDirectory, 'reel.json'), {});
  const required = String(reel?.date ?? '') >= MEASURED_TIMING_GATE_SINCE;
  if (!required) {
    return { required: false, passed: true, reason: 'Archiv-Reel vor der verpflichtenden Zeitmessung.', findings: [], statistics: null };
  }

  const audioSync = await readJson(path.join(technicalDirectory, 'timeline', 'audio-sync.json'));
  if (!audioSync) {
    return { required, passed: false, reason: 'timeline/audio-sync.json fehlt.', findings: [{ issue: 'audio-sync-missing' }], statistics: null };
  }

  if (audioSync.source !== MEASURED_ALIGNMENT_METHOD) {
    return {
      required,
      passed: false,
      reason: `Die Bildschnitte stammen aus "${audioSync.source ?? 'unbekannt'}" statt aus einer Messung am Voice-over.`,
      findings: [{ issue: 'timing-not-measured', source: audioSync.source ?? null }],
      statistics: null
    };
  }

  const measurement = await readMeasuredWordTimings(technicalDirectory, audioSync.audioFile);
  if (!measurement.available) {
    return {
      required,
      passed: false,
      reason: measurement.reason,
      findings: [{ issue: measurement.stale ? 'measurement-stale' : 'measurement-missing', detail: measurement.reason }],
      statistics: null
    };
  }

  const cues = [
    ...(audioSync.cueTimings ?? []).map((cue, index) => ({ ...cue, id: cue.sceneId, isFirst: index === 0 })),
    ...(audioSync.phaseCueTimings ?? []).map((cue) => ({ ...cue, id: cue.targetId, isFirst: false }))
  ].sort((a, b) => Number(a.cueTimeSeconds ?? 0) - Number(b.cueTimeSeconds ?? 0));

  const findings = [];
  const deviations = [];
  let cursor = 0;

  for (const cue of cues) {
    if (cue.isFirst) continue;

    const planned = Number(cue.cueTimeSeconds);
    if (!Number.isFinite(planned)) {
      findings.push({ id: cue.id, issue: 'cue-time-missing', audioCue: cue.audioCue, detail: `${cue.id}: kein gemessener Zeitpunkt.` });
      continue;
    }

    const hit = findSpokenCue(cue.audioCue, measurement.words, { fromWordIndex: cursor });
    if (!hit) {
      findings.push({
        id: cue.id,
        issue: 'cue-not-spoken',
        audioCue: cue.audioCue,
        detail: `${cue.id}: "${cue.audioCue}" kommt im gemessenen Voice-over nicht vor.`
      });
      continue;
    }

    cursor = hit.wordIndex;
    const deviation = planned - hit.startSeconds;
    deviations.push(Math.abs(deviation));

    if (Math.abs(deviation) > MAXIMUM_CUE_DEVIATION_SECONDS) {
      findings.push({
        id: cue.id,
        issue: 'cue-time-drift',
        audioCue: cue.audioCue,
        plannedSeconds: Number(planned.toFixed(2)),
        spokenSeconds: Number(hit.startSeconds.toFixed(2)),
        deviationSeconds: Number(deviation.toFixed(2)),
        detail: `${cue.id}: Bildwechsel bei ${planned.toFixed(2)} s, "${cue.audioCue}" wird aber erst bei ${hit.startSeconds.toFixed(2)} s gesprochen (${deviation > 0 ? '+' : ''}${deviation.toFixed(2)} s).`
      });
    }
  }

  const statistics = deviations.length > 0
    ? {
      checkedCues: deviations.length,
      meanDeviationSeconds: Number((deviations.reduce((sum, value) => sum + value, 0) / deviations.length).toFixed(3)),
      maximumDeviationSeconds: Number(Math.max(...deviations).toFixed(3)),
      maximumAllowedSeconds: MAXIMUM_CUE_DEVIATION_SECONDS
    }
    : null;

  const passed = findings.length === 0;
  return {
    required,
    passed,
    reason: passed
      ? `Alle ${statistics?.checkedCues ?? 0} Bildschnitte sitzen am gesprochenen Wort (größte Abweichung ${statistics?.maximumDeviationSeconds ?? 0} s).`
      : `${findings.length} Bildschnitte sitzen nicht am gesprochenen Wort.`,
    findings,
    statistics
  };
}
