import test from 'node:test';
import assert from 'node:assert/strict';

import { buildReelImageAudioMapping, buildSequentialAudioSync } from '../src/core/reel-image-audio-mapping.js';

test('ordnet jeden Reel-Bildmoment exakt einem gesprochenen Textbereich zu', () => {
  const sceneIndex = [
    {
      sceneId: 'scene-01', order: 1, audioCue: 'Warum passiert das',
      narration: 'Warum passiert das eigentlich? Genau diese Frage klären wir jetzt.',
      imagePhases: [{ phaseId: 'scene-01-image-01', order: 1, audioCue: 'Warum passiert das', expectedImageFileName: 'scene-01.png' }]
    },
    {
      sceneId: 'scene-02', order: 2, audioCue: 'Der erste Grund',
      narration: 'Der erste Grund liegt im Körper. Danach reagiert auch dein Gehirn automatisch.',
      imagePhases: [
        { phaseId: 'scene-02-image-01', order: 1, audioCue: 'Der erste Grund', expectedImageFileName: 'scene-02.png' },
        { phaseId: 'scene-02-image-02', order: 2, audioCue: 'Danach reagiert', expectedImageFileName: 'scene-02-2.png' }
      ]
    }
  ];

  const mapping = buildReelImageAudioMapping(sceneIndex);
  assert.equal(mapping.version, 2);
  assert.equal(mapping.imageCount, 3);
  assert.equal(mapping.mappings[0].visibleImageFileName, 'Bild 01.png');
  assert.equal(mapping.mappings[0].spokenText, 'Warum passiert das eigentlich? Genau diese Frage klären wir jetzt.');
  assert.equal(mapping.mappings[0].endAnchor, 'Der erste Grund liegt im Körper.');
  assert.equal(mapping.mappings[1].spokenText, 'Der erste Grund liegt im Körper.');
  assert.equal(mapping.mappings[1].timingRole, 'scene-start');
  assert.equal(mapping.mappings[1].cutLeadSeconds, 0.10);
  assert.equal(mapping.mappings[1].endAnchor, 'Danach reagiert');
  assert.equal(mapping.mappings[2].spokenText, 'Danach reagiert auch dein Gehirn automatisch.');
  assert.equal(mapping.mappings[2].timingRole, 'internal-image-cut');
  assert.equal(mapping.mappings[2].cutLeadSeconds, 0.08);
  assert.equal(mapping.mappings[2].endAnchor, 'VOICEOVER_END');
  assert.equal(mapping.mappings[2].actualStartSeconds, null);
});

test('bricht in Phase 1 weiter ab, wenn ein geplanter interner Cue gar nicht in der Narration vorkommt', () => {
  assert.throws(() => buildReelImageAudioMapping([
    {
      sceneId: 'scene-01', order: 1, narration: 'Ein kurzer gültiger Satz.',
      imagePhases: [
        { phaseId: 'scene-01-image-01', order: 1, expectedImageFileName: 'scene-01.png' },
        { phaseId: 'scene-01-image-02', order: 2, audioCue: 'kommt niemals vor', expectedImageFileName: 'scene-01-2.png' }
      ]
    }
  ]), /kommt in der Narration nicht vor/);
});

test('Phase 3 kann die feste Reihenfolge automatisch auf eine echte Audiodauer legen', () => {
  const mapping = buildReelImageAudioMapping([
    {
      sceneId: 'scene-01', order: 1,
      narration: 'Erste Aussage. Zweite Aussage mit etwas mehr Inhalt.',
      imagePhases: [
        { phaseId: 'scene-01-image-01', order: 1, expectedImageFileName: 'scene-01.png' },
        { phaseId: 'scene-01-image-02', order: 2, audioCue: 'Zweite Aussage', expectedImageFileName: 'scene-01-2.png' }
      ]
    }
  ]);
  const result = buildSequentialAudioSync(mapping, 12, 'audio/voiceover.mp3');
  assert.equal(result.audioSync.timingStatus, 'audio-synced');
  assert.equal(result.mapping.mappings[0].actualStartSeconds, 0);
  assert.equal(result.mapping.mappings[1].actualEndSeconds, 12);
  assert.ok(result.mapping.mappings[1].actualStartSeconds > 0);
});
