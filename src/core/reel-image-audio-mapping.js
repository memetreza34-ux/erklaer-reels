import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function text(value) {
  return String(value ?? '').trim();
}

function firstWords(value, count = 6) {
  return text(value).split(/\s+/).filter(Boolean).slice(0, count).join(' ');
}

function findCueIndex(narration, cue) {
  const source = text(narration);
  const needle = text(cue);
  if (!source || !needle) return -1;
  return source.toLocaleLowerCase('de-DE').indexOf(needle.toLocaleLowerCase('de-DE'));
}

function visibleImageName(number) {
  return `Bild ${String(number).padStart(2, '0')}.png`;
}

function round(value, digits = 3) {
  const factor = 10 ** digits;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

function spokenWeight(value) {
  const source = text(value);
  const words = source.split(/\s+/).filter(Boolean).length;
  const commas = (source.match(/[,;:]/g) ?? []).length;
  const sentenceEnds = (source.match(/[.!?]/g) ?? []).length;
  return Math.max(1, words + commas * 0.15 + sentenceEnds * 0.35);
}

/**
 * Baut die kanonische 1:1-Zuordnung zwischen gesprochenem Text und jedem
 * Reel-Bildmoment. Phase 1 definiert die Textbereiche; Phase 3 setzt die
 * tatsächlichen Sekundenwerte am finalen Voice-over.
 */
export function buildReelImageAudioMapping(sceneIndex) {
  if (!Array.isArray(sceneIndex) || sceneIndex.length === 0) {
    throw new Error('scene-index.json enthält keine Szenen.');
  }

  const preparedScenes = sceneIndex.map((scene) => {
    const narration = text(scene?.narration);
    if (!narration) throw new Error(`${scene?.sceneId ?? 'Unbekannte Szene'} hat keine Narration.`);

    const phases = Array.isArray(scene?.imagePhases) ? scene.imagePhases : [];
    if (phases.length === 0) throw new Error(`${scene?.sceneId ?? 'Unbekannte Szene'} hat keine Bildphasen.`);

    const boundaries = phases.map((phase, index) => {
      if (index === 0) return 0;
      const cue = text(phase?.audioCue);
      if (!cue) throw new Error(`${scene.sceneId}/${phase?.phaseId ?? `Phase ${index + 1}`}: audioCue fehlt.`);
      const cueIndex = findCueIndex(narration, cue);
      if (cueIndex < 0) {
        throw new Error(`${scene.sceneId}/${phase?.phaseId ?? `Phase ${index + 1}`}: audioCue "${cue}" kommt in der Narration nicht vor.`);
      }
      return cueIndex;
    });

    for (let index = 1; index < boundaries.length; index += 1) {
      if (boundaries[index] <= boundaries[index - 1]) {
        throw new Error(`${scene.sceneId}: Bildphasen-Cues sind nicht in gesprochener Reihenfolge.`);
      }
    }

    return { scene, narration, phases, boundaries };
  });

  let globalImageNumber = 1;
  const mappings = [];

  for (let sceneIndexPosition = 0; sceneIndexPosition < preparedScenes.length; sceneIndexPosition += 1) {
    const prepared = preparedScenes[sceneIndexPosition];
    const nextScene = preparedScenes[sceneIndexPosition + 1];

    for (let phaseIndex = 0; phaseIndex < prepared.phases.length; phaseIndex += 1) {
      const phase = prepared.phases[phaseIndex];
      const startIndex = prepared.boundaries[phaseIndex];
      const endIndex = phaseIndex + 1 < prepared.phases.length
        ? prepared.boundaries[phaseIndex + 1]
        : prepared.narration.length;
      const spokenText = prepared.narration.slice(startIndex, endIndex).trim();

      if (!spokenText) {
        throw new Error(`${prepared.scene.sceneId}/${phase.phaseId}: zugeordneter Sprachbereich ist leer.`);
      }

      const nextPhase = prepared.phases[phaseIndex + 1];
      const startAnchor = phaseIndex === 0
        ? firstWords(spokenText)
        : text(phase.audioCue) || firstWords(spokenText);
      const endAnchor = nextPhase
        ? text(nextPhase.audioCue) || firstWords(prepared.narration.slice(prepared.boundaries[phaseIndex + 1]))
        : nextScene
          ? firstWords(nextScene.narration)
          : 'VOICEOVER_END';

      mappings.push({
        globalImageNumber,
        visibleImageFileName: visibleImageName(globalImageNumber),
        sceneId: prepared.scene.sceneId,
        sceneOrder: prepared.scene.order,
        phaseId: phase.phaseId,
        phaseOrder: phase.order ?? phaseIndex + 1,
        technicalExpectedImageFileName: phase.expectedImageFileName ?? null,
        spokenText,
        startAnchor,
        endAnchor,
        existingAudioCue: text(phase.audioCue) || text(prepared.scene.audioCue) || startAnchor,
        timingRole: phaseIndex === 0 ? 'scene-start' : 'internal-image-cut',
        cutLeadSeconds: phaseIndex === 0 ? 0.10 : 0.08,
        timingAuthority: 'final-voiceover',
        actualStartSeconds: null,
        actualEndSeconds: null,
        alignmentConfidence: null
      });

      globalImageNumber += 1;
    }
  }

  return {
    version: 2,
    purpose: 'Kanonische Bild↔Voice-over-Zuordnung für Reel-Phase 3.',
    timingAuthority: 'final-voiceover',
    rule: 'Jedes Bild gehört in fester chronologischer Reihenfolge zu genau einem spokenText-Bereich.',
    alignmentRule: 'Exakte Audioanker sind bevorzugt. Wenn sie nicht automatisch verfügbar sind, darf Phase 3 ohne Rückfrage eine monotone zeitproportionale Startschätzung aus den bereits festgelegten spokenText-Bereichen erzeugen und sie beim finalen Reel-QC nur bei sichtbarer Fehlpassung korrigieren.',
    cutRules: {
      sceneLeadSeconds: 0.10,
      internalImageLeadSeconds: 0.08,
      minimumImagePhaseSeconds: 2.2
    },
    imageCount: mappings.length,
    mappings
  };
}

export function buildSequentialAudioSync(mapping, audioDurationSeconds, audioFile = null) {
  const entries = Array.isArray(mapping?.mappings) ? mapping.mappings : [];
  const duration = Number(audioDurationSeconds);
  if (!entries.length) throw new Error('BILD_AUDIO_ZUORDNUNG.json enthält keine Bildmomente.');
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('Für Auto-Alignment wird eine positive finale Audiodauer benötigt.');

  const weights = entries.map((entry) => spokenWeight(entry.spokenText));
  const totalWeight = weights.reduce((sum, value) => sum + value, 0) || 1;
  let cursor = 0;

  const aligned = entries.map((entry, index) => {
    const start = cursor;
    const end = index === entries.length - 1
      ? duration
      : cursor + duration * (weights[index] / totalWeight);
    cursor = end;
    return {
      ...entry,
      actualStartSeconds: round(start),
      actualEndSeconds: round(end),
      alignmentConfidence: 0.86,
      alignmentMethod: 'sequential-spoken-text-weight-v1'
    };
  });

  const cueTimings = aligned
    .filter((entry) => entry.timingRole === 'scene-start')
    .map((entry, index) => ({
      sceneId: entry.sceneId,
      audioCue: entry.existingAudioCue || entry.startAnchor,
      cueTimeSeconds: index === 0 ? 0 : entry.actualStartSeconds,
      leadInSeconds: index === 0 ? 0 : 0.10,
      confidence: entry.alignmentConfidence,
      method: entry.alignmentMethod
    }));

  const phaseCueTimings = aligned
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

  return {
    mapping: {
      ...mapping,
      version: Math.max(Number(mapping.version ?? 0), 2),
      autoAlignment: {
        method: 'sequential-spoken-text-weight-v1',
        audioDurationSeconds: round(duration),
        confidence: 0.86,
        note: 'Automatischer Startwert ohne Nutzer-Rückfrage. Finale Reel-QC korrigiert nur sichtbare Fehlpassungen.'
      },
      mappings: aligned
    },
    audioSync: {
      version: 3,
      audioDurationSeconds: round(duration),
      audioFile,
      source: 'sequential-spoken-text-weight-v1',
      timingStatus: 'audio-synced',
      instructions: [
        'Automatisch aus der festgelegten Bild↔Satz-Reihenfolge und der finalen Audiodauer erzeugt.',
        'Nicht bei jedem Anchor nachfragen. Nur offensichtliche sichtbare Fehlpassungen im finalen QC korrigieren.',
        'Szenencut ca. 0,10 s vor dem Sprachbeginn; interner Bildcut ca. 0,08 s davor.'
      ],
      cueTimings,
      phaseCueTimings
    }
  };
}

export async function writeReelImageAudioMapping(technicalDirectory) {
  const sceneIndexPath = path.join(technicalDirectory, 'scenes', 'scene-index.json');
  const sceneIndex = JSON.parse(await readFile(sceneIndexPath, 'utf8'));
  const mapping = buildReelImageAudioMapping(sceneIndex);
  const outputPath = path.join(technicalDirectory, 'BILD_AUDIO_ZUORDNUNG.json');
  await writeFile(outputPath, `${JSON.stringify(mapping, null, 2)}\n`, 'utf8');
  return { outputPath, mapping };
}

export async function writeSequentialAudioSync(technicalDirectory, { audioDurationSeconds, audioFile = null } = {}) {
  const mappingPath = path.join(technicalDirectory, 'BILD_AUDIO_ZUORDNUNG.json');
  let mapping;
  try {
    mapping = JSON.parse(await readFile(mappingPath, 'utf8'));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    mapping = (await writeReelImageAudioMapping(technicalDirectory)).mapping;
  }

  const result = buildSequentialAudioSync(mapping, audioDurationSeconds, audioFile);
  await writeFile(mappingPath, `${JSON.stringify(result.mapping, null, 2)}\n`, 'utf8');
  const timelineDirectory = path.join(technicalDirectory, 'timeline');
  await mkdir(timelineDirectory, { recursive: true });
  const audioSyncPath = path.join(timelineDirectory, 'audio-sync.json');
  await writeFile(audioSyncPath, `${JSON.stringify(result.audioSync, null, 2)}\n`, 'utf8');
  return { ...result, mappingPath, audioSyncPath };
}
