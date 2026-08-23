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

const LEGACY_STYLE = 'Vertical 9:16 premium mature 2D editorial country-character illustration. Warm off-white textured paper background, deep navy borders and map shapes, muted rust, mustard, cobalt and forest-green accents, bold clean hand-inked outlines, flat geometric shading, subtle grain, high contrast, sophisticated documentary tone, not childish.';

async function createFixture({ missingCoverPrompt = false, missingSecondPrompt = false, missingExtraPrompt = false } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'prompt-bundle-'));
  await writeJson(path.join(root, 'status.json'), { imagePrompts: 'ready' });
  await writeJson(path.join(root, 'reel.json'), { visualStyleId: 'round-country-characters' });
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
  if (!missingCoverPrompt) {
    await writeFile(
      path.join(root, 'cover', 'cover-prompt.txt'),
      `${LEGACY_STYLE} Complete perfectly round country spheres with simple white eyes. Create a strong cover composition. Integrate the exact German headline "NUR DIESE HOOK" as the only readable phrase. No other readable text, no English, no logos, no watermark. No 3D, no photorealism. Use the full 9:16 composition naturally; no subtitle safe-zone.`,
      'utf8'
    );
  }

  for (const sceneId of ['scene-01', 'scene-02', 'scene-03']) await mkdir(path.join(root, 'scenes', sceneId), { recursive: true });

  await writeFile(
    path.join(root, 'scenes', 'scene-01', 'image-prompt.txt'),
    `${LEGACY_STYLE} Match Bild 00.png exactly. Show one complete perfectly round sphere as the focal character. Integrate the exact German text "ERSTE SZENE" as the only readable phrase. No other readable text, no English, no logos, no watermark. No 3D, no photorealism. Full 9:16 frame, no subtitle safe-zone.`,
    'utf8'
  );

  if (!missingSecondPrompt) {
    await writeFile(
      path.join(root, 'scenes', 'scene-02', 'image-prompt.txt'),
      `${LEGACY_STYLE} Match Bild 00.png exactly. Show two complete perfectly round sphere characters in a clear comparison. Integrate the exact German text "SZENE ZWEI" as the only readable phrase. No other readable text, no English, no logos, no watermark. No 3D, no photorealism. Full 9:16 frame, no subtitle safe-zone.`,
      'utf8'
    );
  }

  if (!missingExtraPrompt) {
    await writeFile(
      path.join(root, 'scenes', 'scene-02', 'image-prompt-02.txt'),
      `${LEGACY_STYLE} Match Bild 00.png exactly. Zoom into the second visual beat with complete perfectly round sphere characters. No readable text anywhere in the image. No English, no logos, no watermark. No 3D, no photorealism. Full 9:16 frame, no subtitle safe-zone.`,
      'utf8'
    );
  }

  await writeFile(
    path.join(root, 'scenes', 'scene-03', 'image-prompt.txt'),
    `${LEGACY_STYLE} Match Bild 00.png exactly. Show a strong final editorial composition with complete perfectly round sphere characters. Integrate the exact German text "DRITTE SZENE" as the only readable phrase. No other readable text, no English, no logos, no watermark. No 3D, no photorealism. Full 9:16 frame, no subtitle safe-zone.`,
    'utf8'
  );

  return root;
}

test('README erklärt serielle Steuerung und wortgetreue alte Visual-Prompts', async () => {
  const root = await createFixture();
  const paths = await ensureImagePromptBundleDirectory(root);
  const readme = await readFile(paths.readme, 'utf8');

  assert.match(readme, /google-flow-controller\.txt/);
  assert.match(readme, /Bild 00\.txt/);
  assert.match(readme, /wortgetreu/);
  assert.match(readme, /ohne technische Wrapper/);
  assert.match(readme, /Keine Queue/);
  assert.match(readme, /Kompatibilitäts-\/Indexdatei/);
});

test('exportiert Controller plus unveränderten visuellen Quellprompt pro Bild', async () => {
  const root = await createFixture();
  const sourceCover = (await readFile(path.join(root, 'cover', 'cover-prompt.txt'), 'utf8')).trim();
  const sourceScene = (await readFile(path.join(root, 'scenes', 'scene-02', 'image-prompt-02.txt'), 'utf8')).trim();

  const result = await buildImagePromptBundle(root, { strict: true });

  const controller = await readFile(result.controllerFile, 'utf8');
  const index = await readFile(result.outputFile, 'utf8');
  const p00 = (await readFile(path.join(result.individualPromptsDirectory, 'Bild 00.txt'), 'utf8')).trim();
  const p03 = (await readFile(path.join(result.individualPromptsDirectory, 'Bild 03.txt'), 'utf8')).trim();

  assert.match(controller, /Do NOT read all prompt files in advance/);
  assert.match(controller, /Generate exactly ONE image/);
  assert.match(controller, /Do not rewrite, summarize, merge or simplify them/);
  assert.match(controller, /batch generation/);
  assert.match(controller, /parallel generation/);
  assert.match(controller, /open image-prompts\/Bild 00\.txt only/);

  assert.match(index, /NICHT ALS GOOGLE-FLOW-GENERIERUNGSPROMPT VERWENDEN/);
  assert.match(index, /image-prompts\/Bild 00\.txt/);
  assert.match(index, /image-prompts\/Bild 04\.txt/);
  assert.doesNotMatch(index, /Vertical 9:16/);

  assert.equal(p00, sourceCover);
  assert.equal(p03, sourceScene);
  assert.match(p00, /Warm off-white textured paper background/);
  assert.match(p00, /deep navy borders and map shapes/);
  assert.match(p00, /muted rust, mustard, cobalt and forest-green accents/);
  assert.match(p00, /bold clean hand-inked outlines/);
  assert.match(p00, /subtle grain/);
  assert.match(p00, /sophisticated documentary tone/);

  assert.doesNotMatch(p00, /GENERATE EXACTLY ONE IMAGE ONLY/);
  assert.doesNotMatch(p00, /VISIBLE TEXT FIREWALL/);
  assert.doesNotMatch(p00, /ROUND SPHERE WORLD/);
  assert.doesNotMatch(p00, /QUALITY GATE/);
  assert.doesNotMatch(p00, /filename/i);

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
