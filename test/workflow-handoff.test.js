import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { verifyWorkflowHandoff } from '../src/core/workflow-handoff.js';

async function write(filePath, content) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, 'utf8');
}

test('3-Phasen-Übergabe gibt Antigravity nur mit komplettem Paket und Assets frei', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'reel-handoff-'));
  const scenes = Array.from({ length: 12 }, (_, index) => ({
    sceneId: `scene-${String(index + 1).padStart(2, '0')}`,
    narration: `Satz ${index + 1}`,
    visualIdea: `Bildidee ${index + 1}`,
    audioCue: `Cue ${index + 1}`
  }));
  await write(path.join(root, 'reel.json'), JSON.stringify({
    sceneCount: 12,
    visualStyleId: 'human-editorial-cartoon',
    visualStyleReason: 'Menschen tragen dieses Psychologiethema klarer als Länderfiguren oder eine Objektmetapher.'
  }));
  await write(path.join(root, 'scenes', 'scene-index.json'), JSON.stringify(scenes));
  await write(path.join(root, 'script', 'voice-script.txt'), 'Ein vollständiger Sprechertext.');
  await write(path.join(root, 'cover', 'cover-prompt.txt'), 'Cover prompt');
  await write(path.join(root, 'all-image-prompts', 'all-image-prompts.txt'), 'Alle Prompts');
  await write(path.join(root, 'caption', 'caption.txt'), 'Caption');
  await write(path.join(root, 'sources', 'sources.md'), '# Quellen\n\n- https://example.com');
  for (const scene of scenes) await write(path.join(root, 'scenes', scene.sceneId, 'image-prompt.txt'), `Prompt ${scene.sceneId}`);

  const beforeAssets = await verifyWorkflowHandoff(root);
  assert.equal(beforeAssets.phase1.ready, true);
  assert.equal(beforeAssets.phase2.ready, false);
  assert.equal(beforeAssets.phase3.ready, false);

  for (let index = 0; index <= 12; index += 1) {
    await write(path.join(root, 'inbox', 'numbered-images', `Bild ${String(index).padStart(2, '0')}.png`), 'image');
  }
  await write(path.join(root, 'inbox', 'audio', 'voiceover.wav'), 'audio');

  const ready = await verifyWorkflowHandoff(root);
  assert.equal(ready.phase2.ready, true);
  assert.equal(ready.phase3.ready, true);
  assert.equal(ready.runtimeOwner, 'antigravity');
});

test('nur die drei freigegebenen Bildwelten bestehen die Übergabe', async () => {
  const config = JSON.parse(await (await import('node:fs/promises')).readFile(new URL('../config/workflow-phases.json', import.meta.url), 'utf8'));
  assert.deepEqual(config.allowedVisualWorlds, [
    'human-editorial-cartoon',
    'round-country-characters',
    'visual-metaphor'
  ]);
  const phase3 = config.phases.find((phase) => phase.id === 'phase-3-antigravity');
  assert.equal(phase3.communicationPolicy.mode, 'silent-until-error-or-complete');
  assert.equal(phase3.communicationPolicy.intermediateStatusMessages, false);
  assert.equal(phase3.communicationPolicy.routineQuestions, false);
  assert.ok(phase3.startTriggers.includes('Antigravity los, erstelle das Reel'));
});

test('bloße Bildanzahl ohne vollständige eindeutige Nummern reicht nicht', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'reel-handoff-images-'));
  await write(path.join(root, 'reel.json'), JSON.stringify({ sceneCount: 12 }));
  await write(path.join(root, 'scenes', 'scene-index.json'), '[]');
  for (let index = 1; index <= 13; index += 1) {
    await write(path.join(root, 'inbox', 'numbered-images', `falsch-${index}.png`), 'image');
  }
  await write(path.join(root, 'inbox', 'audio', 'voiceover.wav'), 'audio');

  const result = await verifyWorkflowHandoff(root);
  assert.equal(result.phase2.checks.find((entry) => entry.id === 'complete-image-series').passed, false);
});
