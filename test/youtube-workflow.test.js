import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { verifyYoutubeHandoff } from '../src/core/youtube-handoff.js';
import { validateYoutubeRendererInput } from '../src/core/youtube-render-validator.js';
import { createYoutubeWorkspace } from '../src/core/youtube-workspace.js';
import { validateYoutubeProbeMetadata } from '../src/core/youtube-output-validator.js';

async function write(filePath, content) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, 'utf8');
}

test('YouTube-Konfiguration verwendet 16:9, eigene Bildwelt und keine Untertitel', async () => {
  const config = JSON.parse(await readFile(new URL('../config/youtube-production.json', import.meta.url), 'utf8'));
  assert.deepEqual(config.composition, { width: 1920, height: 1080, fps: 30 });
  assert.deepEqual(config.durationMinutes, { min: 8, target: 10, max: 12 });
  assert.equal(config.visualWorld.id, 'german-simple-explainer-cartoon');
  assert.equal(config.visualWorld.copyingForbidden, true);
  assert.deepEqual(config.visualWorld.sceneModes.map((mode) => mode.targetPercent), [45, 25, 30]);
  assert.equal(config.subtitles.enabled, false);
  assert.equal(config.subtitles.burnedInCaptionsForbidden, true);
  assert.equal(config.workflow.phase3Owner, 'antigravity');
  assert.equal(config.workflow.communicationMode, 'silent-until-error-or-complete');
  const gitignore = await readFile(new URL('../.gitignore', import.meta.url), 'utf8');
  assert.match(gitignore, /youtube\/projects\/\*\*\/10-output\/\*\.mp4/);
  assert.match(gitignore, /youtube\/projects\/\*\*\/05-assets\/\*\*\/\*\.png/);
});

test('erstellt ein vollständiges YouTube-Projektskelett mit 72 Bildszenen', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'youtube-workspace-'));
  const result = await createYoutubeWorkspace({
    title: 'Warum fühlte sich die Steinzeit anders an?',
    topic: 'Alltag früher Menschen',
    outputRoot,
    now: new Date('2026-08-21T12:00:00Z')
  });
  assert.equal(result.video.aspectRatio, '16:9');
  assert.equal(result.video.sceneCount, 72);
  assert.equal(result.video.subtitlesEnabled, false);
  assert.equal(result.scenePlan.length, 72);
  assert.equal(result.scenePlan[0].sceneId, 'scene-001');
  assert.equal(result.scenePlan.at(-1).sceneId, 'scene-072');
  assert.equal(result.scenePlan.filter((scene) => scene.sceneMode === 'minimal-vignette').length, 32);
  assert.equal(result.scenePlan.filter((scene) => scene.sceneMode === 'object-explainer').length, 18);
  assert.equal(result.scenePlan.filter((scene) => scene.sceneMode === 'sparse-environment').length, 22);
});

test('YouTube-Übergabe gibt Phase 3 erst mit kreativem Paket, Bildserie und Audio frei', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'youtube-handoff-'));
  const result = await createYoutubeWorkspace({
    title: 'Wie überlebten Menschen die erste Kälte?',
    topic: 'Menschheitsgeschichte',
    outputRoot,
    targetDurationMinutes: 8,
    sceneCount: 60
  });
  const root = result.projectDirectory;
  const scenes = result.scenePlan.map((scene) => ({
    ...scene,
    narration: `Erklärsatz für ${scene.sceneId}`,
    audioCue: `Cue ${scene.order}`,
    visualIdea: `Historischer Bildmoment ${scene.order}`,
    imagePrompt: `Landscape 16:9 original simple flat explainer cartoon scene ${scene.order}, no subtitles, no text overlay.`
  }));
  await write(path.join(root, '03-szenen', 'scene-plan.json'), JSON.stringify(scenes));
  await write(path.join(root, '00-idee', 'brief.md'), `# Brief\n\n${'Konkrete Kernfrage und Zuschauerwirkung. '.repeat(5)}`);
  await write(path.join(root, '01-recherche', 'sources.md'), '# Quellen\n\n- https://example.com/a\n- https://example.org/b\n- https://example.net/c');
  await write(path.join(root, '02-script', 'outline.md'), `# Outline\n\n${'Kapitel, Micro-Summary und Forward-Hook. '.repeat(8)}`);
  await write(path.join(root, '02-script', 'voice-script.txt'), Array.from({ length: 1000 }, () => 'Wort').join(' '));
  await write(path.join(root, '04-bildprompts', 'all-image-prompts.txt'), 'Google Flow seriell. '.repeat(40));
  await write(path.join(root, '07-thumbnail', 'thumbnail-brief.md'), `# Thumbnail\n\n${'Großes Motiv, mobile Lesbarkeit und eigener Stil. '.repeat(6)}`);
  await write(path.join(root, '07-thumbnail', 'thumbnail-prompt.txt'), 'Landscape 16:9 original German simple flat explainer cartoon thumbnail. '.repeat(5));
  await write(path.join(root, '09-upload', 'title-options.txt'), 'Wie Menschen den tödlichen Winter besiegten');
  await write(path.join(root, '09-upload', 'description.txt'), 'Eine quellenbasierte deutsche Erklärung. '.repeat(5));
  await write(path.join(root, '09-upload', 'chapters.txt'), '00:00 Hook\n00:30 Der Anfang\n04:00 Die Lösung\n07:30 Schluss');

  const beforeAssets = await verifyYoutubeHandoff(root);
  assert.equal(beforeAssets.phase1.ready, true);
  assert.equal(beforeAssets.phase2.ready, false);
  assert.equal(beforeAssets.phase3.ready, false);

  for (let index = 0; index <= 60; index += 1) {
    await write(path.join(root, '05-assets', 'numbered-images', `Bild ${String(index).padStart(2, '0')}.png`), 'image');
  }
  await write(path.join(root, '06-audio', 'inbox', 'voiceover.wav'), 'audio');
  const ready = await verifyYoutubeHandoff(root);
  assert.equal(ready.phase2.ready, true);
  assert.equal(ready.phase3.ready, true);
});

test('YouTube-Renderer akzeptiert 16:9-Bilder und Audio, blockiert aber Untertitel', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'youtube-render-'));
  await write(path.join(root, 'video.json'), JSON.stringify({
    videoId: 'video-01_test',
    format: 'youtube-longform',
    visualStyleId: 'german-simple-explainer-cartoon',
    subtitlesEnabled: false,
    textCardsEnabled: false,
    sceneCount: 2,
    targetDurationMinutes: { min: 8, max: 12 }
  }));
  await write(path.join(root, '06-audio', 'voiceover.mp3'), 'audio');
  await write(path.join(root, '05-assets', 'scene-001.png'), 'image');
  await write(path.join(root, '05-assets', 'scene-002.png'), 'image');
  await write(path.join(root, '08-edit', 'final-readiness.json'), JSON.stringify({
    readyForRenderer: true,
    sourceQualityPassed: true,
    visualQcPassed: true,
    audioQualityPassed: true,
    subtitleAbsencePassed: true
  }));
  const plan = {
    status: 'ready-for-renderer',
    composition: { width: 1920, height: 1080, fps: 30, durationFrames: 14400 },
    voiceover: { file: '06-audio/voiceover.mp3', volume: 1 },
    subtitles: [],
    scenes: [
      { sceneId: 'scene-001', startFrame: 0, endFrame: 7200, imageFile: '05-assets/scene-001.png', transitionIn: { type: 'none', durationSeconds: 0 }, subtitles: [] },
      { sceneId: 'scene-002', startFrame: 7200, endFrame: 14400, imageFile: '05-assets/scene-002.png', transitionIn: { type: 'cut', durationSeconds: 0 }, subtitles: [] }
    ]
  };
  await write(path.join(root, '08-edit', 'render-plan.json'), JSON.stringify(plan));
  const valid = await validateYoutubeRendererInput(root);
  assert.equal(valid.passed, true);

  plan.scenes[0].subtitles = [{ text: 'Verboten' }];
  await write(path.join(root, '08-edit', 'render-plan.json'), JSON.stringify(plan));
  const invalid = await validateYoutubeRendererInput(root);
  assert.equal(invalid.passed, false);
  assert.ok(invalid.checks.some((entry) => entry.id === 'scene-001-no-subtitles' && !entry.passed));
});

test('finales YouTube-Gate verlangt 1920 × 1080, Audio und passende Dauer', () => {
  const checks = validateYoutubeProbeMetadata({
    streams: [
      { codec_type: 'video', width: 1920, height: 1080 },
      { codec_type: 'audio', sample_rate: '48000' }
    ],
    format: { duration: '600.2' }
  }, 600);
  assert.equal(checks.every((entry) => entry.passed), true);

  const withoutAudio = validateYoutubeProbeMetadata({
    streams: [{ codec_type: 'video', width: 1920, height: 1080 }],
    format: { duration: '600' }
  }, 600);
  assert.equal(withoutAudio.find((entry) => entry.id === 'audio-stream').passed, false);
});
