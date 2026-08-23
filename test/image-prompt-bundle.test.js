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

async function createFixture({ missingCoverPrompt = false, missingSecondPrompt = false, missingExtraPrompt = false, omitStyle = false } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'prompt-bundle-'));
  await writeJson(path.join(root, 'status.json'), { imagePrompts: 'ready' });
  await writeJson(path.join(root, 'reel.json'), omitStyle ? {} : { visualStyleId: 'round-country-characters' });
  await writeJson(path.join(root, 'cover', 'cover.json'), { headline: 'NUR DIESE HOOK' });
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), [
    {
      sceneId: 'scene-02',
      order: 2,
      imageText: 'ZWEITER PUNKT',
      imagePhases: [
        {
          phaseId: 'scene-02-image-01',
          order: 1,
          startPercent: 0,
          promptFileName: 'image-prompt.txt',
          imageText: 'ZWEITER PUNKT'
        },
        {
          phaseId: 'scene-02-image-02',
          order: 2,
          startPercent: 0.55,
          promptFileName: 'image-prompt-02.txt',
          imageText: ''
        }
      ]
    },
    { sceneId: 'scene-01', order: 1, imageText: 'ERSTER PUNKT' },
    { sceneId: 'scene-03', order: 3, imageText: 'DRITTER PUNKT' }
  ]);

  await mkdir(path.join(root, 'cover'), { recursive: true });
  if (!missingCoverPrompt) {
    await writeFile(path.join(root, 'cover', 'cover-prompt.txt'), 'Create a strong opening image with four perfectly round sphere characters.', 'utf8');
  }

  for (const sceneId of ['scene-01', 'scene-02', 'scene-03']) {
    await mkdir(path.join(root, 'scenes', sceneId), { recursive: true });
  }

  await writeFile(path.join(root, 'scenes', 'scene-01', 'image-prompt.txt'), 'Match Bild 00.png exactly. Prompt für die erste Szene.', 'utf8');
  if (!missingSecondPrompt) {
    await writeFile(path.join(root, 'scenes', 'scene-02', 'image-prompt.txt'), 'Prompt für Szene zwei, Bildphase eins.', 'utf8');
  }
  if (!missingExtraPrompt) {
    await writeFile(path.join(root, 'scenes', 'scene-02', 'image-prompt-02.txt'), 'Prompt für Szene zwei, Bildphase zwei.', 'utf8');
  }
  await writeFile(path.join(root, 'scenes', 'scene-03', 'image-prompt.txt'), 'Prompt für die dritte Szene.', 'utf8');
  return root;
}

test('README erklärt Einzelprompt-Qualitätsmodus und Kugel-Welt', async () => {
  const root = await createFixture();
  const paths = await ensureImagePromptBundleDirectory(root);
  const readme = await readFile(paths.readme, 'utf8');

  assert.match(paths.file, /all-image-prompts[\\/]all-image-prompts\.txt$/);
  assert.match(paths.controller, /all-image-prompts[\\/]google-flow-controller\.txt$/);
  assert.match(paths.promptDirectory, /all-image-prompts[\\/]individual-prompts$/);
  assert.match(readme, /Mega-Prompt-Strategie ist deaktiviert/);
  assert.match(readme, /einen einzigen Bildprompt gleichzeitig/);
  assert.match(readme, /vollständig runde Kugeln/);
  assert.match(readme, /Keine Batch-, Queue-, Parallel-/);
});

test('exportiert Manifest, Controller und genau eine sichere Prompt-Datei pro Bild', async () => {
  const root = await createFixture();
  const result = await buildImagePromptBundle(root, { strict: true });

  const manifest = await readFile(result.outputFile, 'utf8');
  const controller = await readFile(result.controllerFile, 'utf8');
  const coverPrompt = await readFile(path.join(result.promptDirectory, 'Bild 00.txt'), 'utf8');
  const firstPrompt = await readFile(path.join(result.promptDirectory, 'Bild 01.txt'), 'utf8');
  const secondPrompt = await readFile(path.join(result.promptDirectory, 'Bild 02.txt'), 'utf8');
  const extraPrompt = await readFile(path.join(result.promptDirectory, 'Bild 03.txt'), 'utf8');

  assert.match(manifest, /NOT A GOOGLE FLOW IMAGE PROMPT/);
  assert.match(manifest, /contains NO full visual prompts/);
  assert.doesNotMatch(manifest, /Prompt für die erste Szene/);
  assert.doesNotMatch(manifest, /Prompt für Szene zwei/);

  assert.match(controller, /SERIAL CONTROLLER — QUALITY MODE/);
  assert.match(controller, /Open exactly one `individual-prompts\/Bild XX\.txt` file/);
  assert.match(controller, /Never batch, queue, preload or start multiple images in parallel/);
  assert.doesNotMatch(controller, /Prompt für die erste Szene/);

  assert.match(coverPrompt, /Create exactly one vertical 9:16 image/);
  assert.match(coverPrompt, /only readable text allowed anywhere inside the image is exactly: "NUR DIESE HOOK"/i);
  assert.match(coverPrompt, /complete perfectly round circular ball\/sphere character/);

  assert.match(firstPrompt, /Prompt für die erste Szene\./);
  assert.match(firstPrompt, /Match the established master visual style exactly\./);
  assert.doesNotMatch(firstPrompt, /Bild 00\.png/);
  assert.doesNotMatch(firstPrompt, /Bild 01/);
  assert.doesNotMatch(firstPrompt, /\bCOVER\b/);
  assert.doesNotMatch(firstPrompt, /\bBILDPHASE\b/);
  assert.doesNotMatch(firstPrompt, /DATEINAME/);

  assert.match(secondPrompt, /only readable text allowed anywhere inside the image is exactly: "ZWEITER PUNKT"/i);
  assert.match(extraPrompt, /Do not place any readable text/i);

  assert.equal(result.coverIncluded, true);
  assert.equal(result.sceneCount, 3);
  assert.equal(result.plannedImageCount, 4);
  assert.equal(result.totalPromptCount, 5);
  assert.equal(result.promptFiles.length, 5);

  const validation = await validateImagePromptBundle(root);
  assert.equal(validation.passed, true);
  assert.equal(validation.plannedImageCount, 4);
  assert.equal(validation.individualPromptsCurrent, true);
});

test('nutzt Kugel-Welt als Export-Default wenn visualStyleId leer ist', async () => {
  const root = await createFixture({ omitStyle: true });
  const result = await buildImagePromptBundle(root, { strict: true });
  const firstPrompt = await readFile(path.join(result.promptDirectory, 'Bild 01.txt'), 'utf8');

  assert.match(firstPrompt, /universal mature 2D editorial Kugel-Welt/);
  assert.match(firstPrompt, /never use a normal human/i);
});

test('blockiert im strengen Modus einen fehlenden Cover-Prompt', async () => {
  const root = await createFixture({ missingCoverPrompt: true });
  await assert.rejects(() => buildImagePromptBundle(root, { strict: true }), /cover/);
});

test('blockiert fehlende primäre oder zusätzliche Bildphasen-Prompts', async () => {
  const missingPrimary = await createFixture({ missingSecondPrompt: true });
  await assert.rejects(() => buildImagePromptBundle(missingPrimary, { strict: true }), /scene-02/);

  const missingExtra = await createFixture({ missingExtraPrompt: true });
  await assert.rejects(() => buildImagePromptBundle(missingExtra, { strict: true }), /scene-02-image-02/);
});

test('erkennt eine veraltete Einzelprompt-Datei', async () => {
  const root = await createFixture();
  const result = await buildImagePromptBundle(root, { strict: true });
  await writeFile(path.join(result.promptDirectory, 'Bild 02.txt'), 'veraltet\n', 'utf8');

  const validation = await validateImagePromptBundle(root);
  assert.equal(validation.passed, false);
  assert.equal(validation.current, false);
  assert.equal(validation.individualPromptsCurrent, false);
});
