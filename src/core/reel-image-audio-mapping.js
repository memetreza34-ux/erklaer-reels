import { readFile, writeFile } from 'node:fs/promises';
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

/**
 * Baut die kanonische 1:1-Zuordnung zwischen gesprochenem Text und jedem
 * Reel-Bildmoment. Phase 1 definiert die Textbereiche; Phase 3 löst die
 * tatsächlichen Sekundenwerte am finalen Voice-over auf.
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
    version: 1,
    purpose: 'Kanonische Bild↔Voice-over-Zuordnung für Reel-Phase 3.',
    timingAuthority: 'final-voiceover',
    rule: 'Jedes Bild gehört exakt zu spokenText. Antigravity darf Bildgrenzen nicht nach Gefühl oder pauschaler Dauer setzen.',
    alignmentRule: 'startAnchor/endAnchor am final optimierten Voice-over auflösen. Bei mehrdeutiger oder fehlender Zuordnung nicht raten; zuerst prüfen.',
    cutRules: {
      sceneLeadSeconds: 0.10,
      internalImageLeadSeconds: 0.08,
      minimumImagePhaseSeconds: 3.0
    },
    imageCount: mappings.length,
    mappings
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
