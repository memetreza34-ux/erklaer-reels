import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  buildImagePromptBundle,
  ensureImagePromptBundleDirectory,
  validateImagePromptBundle
} from '../src/core/image-prompt-bundle.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function createFixture({ missingCoverPrompt = false, missingSecondPrompt = false, missingExtraPrompt = false } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'prompt-bundle-'));
  await writeJson(path.join(root, 'status.json'), { imagePrompts: 'ready' });
  await writeJson(path.join(root, 'reel.json'), { visualStyleId: 'visual-metaphor' });
  await writeJson(path.join(root, 'cover', 'cover.json'), { headline: 'NUR DIESE HOOK' });
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), [
    {
      sceneId: 'scene-02',
      order: 2,
      imageText: 'SZENE ZWEI',
      imagePhases: [
        { phaseId: 'scene-02-image-01', order: 1, startPercent: 0, promptFileName: 'image-prompt.txt', imageText: 'SZENE ZWEI' },
        { phaseId: 'scene-02-image-02', order: 2, startPercent: 0.55, promptFileName: 'image-prompt-02.txt', imageText: '' }
      ]
    },
    { sceneId: 'scene-01', order: 1, imageText: 'ERSTE SZENE' },
    { sceneId: 'scene-03', order: 3, imageText: 'DRITTE SZENE' }
  ]);

  await mkdir(path.join(root, 'cover'), { recursive: true });
  if (!missingCoverPrompt) await writeFile(path.join(root, 'cover', 'cover-prompt.txt'), 'Prompt für das Cover.', 'utf8');

  for (const sceneId of ['scene-01', 'scene-02', 'scene-03']) await mkdir(path.join(root, 'scenes', sceneId), { recursive: true });
  await writeFile(path.join(root, 'scenes', 'scene-01', 'image-prompt.txt'), 'Prompt für die erste Szene.', 'utf8');
  if (!missingSecondPrompt) await writeFile(path.join(root, 'scenes', 'scene-02', 'image-prompt.txt'), 'Prompt für Szene zwei, Bildphase eins.', 'utf8');
  if (!missingExtraPrompt) await writeFile(path.join(root, 'scenes', 'scene-02', 'image-prompt-02.txt'), 'Prompt für Szene zwei, Bildphase zwei.', 'utf8');
  await writeFile(path.join(root, 'scenes', 'scene-03', 'image-prompt.txt'), 'Prompt für die dritte Szene.', 'utf8');
  return root;
}

test('README erklärt Controller und Einzelprompt-Dateien', async () => {
  const root = await createFixture();
  const paths = await ensureImagePromptBundleDirectory(root);
  const readme = await readFile(paths.readme, 'utf8');

  assert.match(readme, /google-flow-controller\.txt/);
  assert.match(readme, /Bild 00\.txt/);
  assert.match(readme, /genau ein Bild erzeugen/);
  assert.match(readme, /Keine Queue/);
  assert.match(readme, /Kompatibilitäts-\/Indexdatei/);
});

test('exportiert Controller plus genau eine Prompt-Datei pro Bild', async () => {
  const root = await createFixture();
  const result = await buildImagePromptBundle(root, { strict: true });

  const controller = await readFile(result.controllerFile, 'utf8');
  const index = await readFile(result.outputFile, 'utf8');
  const p00 = await readFile(path.join(result.individualPromptsDirectory, 'Bild 00.txt'), 'utf8');
  const p03 = await readFile(path.join(result.individualPromptsDirectory, 'Bild 03.txt'), 'utf8');

  assert.match(controller, /Do NOT read all prompt files in advance/);
  assert.match(controller, /Generate exactly ONE image/);
  assert.match(controller, /batch generation/);
  assert.match(controller, /parallel generation/);
  assert.match(controller, /open image-prompts\/Bild 00\.txt only/);

  assert.match(index, /NICHT ALS GOOGLE-FLOW-GENERIERUNGSPROMPT VERWENDEN/);
  assert.match(index, /image-prompts\/Bild 00\.txt/);
  assert.match(index, /image-prompts\/Bild 04\.txt/);
  assert.doesNotMatch(index, /Prompt für Szene zwei/);

  assert.match(p00, /GENERATE EXACTLY ONE IMAGE ONLY/);
  assert.match(p00, /The ONLY readable text allowed anywhere in the image is exactly: "NUR DIESE HOOK"/);
  assert.match(p00, /complete perfectly round circular sphere/);
  assert.match(p00, /Never use a map-shaped/);
  assert.match(p03, /Generate ZERO readable text inside the image/);
  assert.match(p03, /Prompt für Szene zwei, Bildphase zwei\./);

  assert.equal(result.coverIncluded, true);
  assert.equal(result.sceneCount, 3);
  assert.equal(result.plannedImageCount, 4);
  assert.equal(result.totalPromptCount, 5);

  const validation = await validateImagePromptBundle(root);
  assert.equal(validation.passed, true);
  assert.equal(validation.controllerPresent, true);
  assert.equal(validation.individualPromptFiles.length, 5);
  assert.ok(validation.individualPromptFiles.every((item) => item.current));
});

test('erzwingt Kugel-Welt selbst wenn Reel alte Bildwelt enthält', async () => {
  const root = await createFixture();
  const result = await buildImagePromptBundle(root, { strict: true });
  const prompt = await readFile(path.join(result.individualPromptsDirectory, 'Bild 01.txt'), 'utf8');
  assert.match(prompt, /ROUND SPHERE WORLD/);
  assert.match(prompt, /country-ball-style character/);
  assert.match(prompt, /Never use a map-shaped, country-outline-shaped, continent-shaped or human-shaped character/);
});

test('blockiert fehlende Prompts im strengen Modus', async () => {
  const noCover = await createFixture({ missingCoverPrompt: true });
  await assert.rejects(() => buildImagePromptBundle(noCover, { strict: true }), /cover/);

  const noPrimary = await createFixture({ missingSecondPrompt: true });
  await assert.rejects(() => buildImagePromptBundle(noPrimary, { strict: true }), /scene-02/);

  const noExtra = await createFixture({ missingExtraPrompt: true });
  await assert.rejects(() => buildImagePromptBundle(noExtra, { strict: true }), /scene-02-image-02/);
});

test('erkennt veraltete Einzelprompt-Datei', async () => {
  const root = await createFixture();
  const result = await buildImagePromptBundle(root, { strict: true });
  await writeFile(path.join(result.individualPromptsDirectory, 'Bild 02.txt'), 'veraltet\n', 'utf8');

  const validation = await validateImagePromptBundle(root);
  assert.equal(validation.passed, false);
  assert.equal(validation.current, false);
});
