import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  buildImagePromptBundle,
  ensureImagePromptBundleDirectory,
  validateImagePromptBundle
} from '../src/core/image-prompt-bundle.js';
import { FIXED_VISUAL_STYLE_ID, FIXED_VISUAL_WORLD_LABEL } from '../src/shared/fixed-visual-world.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

const NEUTRAL_BASE = 'Vertical 9:16 serious minimal countryball explainer illustration. One clear idea, no subtitle zone.';

async function createFixture({ missingFirstPrompt = false, missingSecondPrompt = false, missingExtraPrompt = false } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'prompt-bundle-'));
  await writeJson(path.join(root, 'status.json'), { imagePrompts: 'ready' });
  await writeJson(path.join(root, 'reel.json'), { visualStyleId: FIXED_VISUAL_STYLE_ID });
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), [
    { sceneId: 'scene-01', order: 1, imageText: 'ERSTE SZENE' },
    {
      sceneId: 'scene-02', order: 2, imageText: 'SZENE ZWEI',
      imagePhases: [
        { phaseId: 'scene-02-image-01', order: 1, startPercent: 0, promptFileName: 'image-prompt.txt', imageText: 'SZENE ZWEI' },
        { phaseId: 'scene-02-image-02', order: 2, startPercent: 0.55, promptFileName: 'image-prompt-02.txt', imageText: '', audioCue: 'zweiter Gedanke' }
      ]
    },
    { sceneId: 'scene-03', order: 3, imageText: 'DRITTE SZENE' }
  ]);

  for (const sceneId of ['scene-01', 'scene-02', 'scene-03']) await mkdir(path.join(root, 'scenes', sceneId), { recursive: true });
  if (!missingFirstPrompt) await writeFile(path.join(root, 'scenes', 'scene-01', 'image-prompt.txt'), `${NEUTRAL_BASE} Show one large round countryball actor with meaningful props. Integrate exactly "ERSTE SZENE".`, 'utf8');
  if (!missingSecondPrompt) await writeFile(path.join(root, 'scenes', 'scene-02', 'image-prompt.txt'), `${NEUTRAL_BASE} Show one political or geographic symbol. Integrate exactly "SZENE ZWEI".`, 'utf8');
  if (!missingExtraPrompt) await writeFile(path.join(root, 'scenes', 'scene-02', 'image-prompt-02.txt'), `${NEUTRAL_BASE} Show one clear supporting object. No readable text.`, 'utf8');
  await writeFile(path.join(root, 'scenes', 'scene-03', 'image-prompt.txt'), `${NEUTRAL_BASE} Show a clean final symbolic scene. Integrate exactly "DRITTE SZENE".`, 'utf8');
  return root;
}

test('README erklärt genau eine Google-Flow-Masterdatei', async () => {
  const root = await createFixture();
  const paths = await ensureImagePromptBundleDirectory(root);
  const readme = await readFile(paths.userReadme, 'utf8');
  assert.match(readme, /genau \*\*eine\*\* verbindliche Masterdatei/i);
  assert.match(readme, /99-alle-bildprompts\.txt/);
  assert.ok(readme.includes(FIXED_VISUAL_WORLD_LABEL));
});

test('exportiert nur den einen seriellen Gesamtprompt in der aktiven festen Bildwelt', async () => {
  const root = await createFixture();
  await mkdir(path.join(root, 'all-image-prompts'), { recursive: true });
  await writeFile(path.join(root, 'all-image-prompts', 'all-image-prompts.txt'), 'legacy\n', 'utf8');

  const result = await buildImagePromptBundle(root, { strict: true });
  const bundle = await readFile(result.outputFile, 'utf8');

  assert.equal(result.outputFile, path.join(root, '00-bildprompts', '99-alle-bildprompts.txt'));
  assert.equal(result.technicalMirrorFile, null);
  assert.equal(result.individualPromptsDirectory, null);
  assert.equal(await exists(path.join(root, 'all-image-prompts')), false);
  assert.match(bundle, /^GOOGLE FLOW – KOMPLETTER SERIELLER BILDLAUF/);
  assert.match(bundle, /STRENG SERIELL – NIE PARALLEL/);
  assert.ok(bundle.includes(FIXED_VISUAL_WORLD_LABEL.toUpperCase()));
  assert.match(bundle, /Serious Minimal Countryball Explainer/i);
  assert.match(bundle, /perfectly round countryball-like character/i);
  assert.match(bundle, /A ball character is optional/i);
  assert.match(bundle, /DATEINAME NACH FERTIGSTELLUNG: Bild 03\.png/);
  assert.equal(result.titleImageIncluded, true);
  assert.equal(result.sceneCount, 3);
  assert.equal(result.plannedImageCount, 4);
  assert.equal(result.totalPromptCount, 4);
  assert.equal(result.visualWorldLabel, FIXED_VISUAL_WORLD_LABEL);

  const validation = await validateImagePromptBundle(root);
  assert.equal(validation.passed, true);
  assert.equal(validation.filePresent, true);
  assert.equal(validation.technicalMirrorPresent, false);
  assert.equal(validation.individualPromptFiles.length, 0);
});

test('blockiert fehlende Prompts im strengen Modus', async () => {
  const noTitle = await createFixture({ missingFirstPrompt: true });
  await assert.rejects(() => buildImagePromptBundle(noTitle, { strict: true }), /scene-01/);
  const noPrimary = await createFixture({ missingSecondPrompt: true });
  await assert.rejects(() => buildImagePromptBundle(noPrimary, { strict: true }), /scene-02/);
  const noExtra = await createFixture({ missingExtraPrompt: true });
  await assert.rejects(() => buildImagePromptBundle(noExtra, { strict: true }), /scene-02-image-02/);
});

test('erkennt Legacy-Doppelordner als veraltet', async () => {
  const root = await createFixture();
  await buildImagePromptBundle(root, { strict: true });
  await mkdir(path.join(root, 'all-image-prompts'), { recursive: true });
  await writeFile(path.join(root, 'all-image-prompts', 'all-image-prompts.txt'), 'legacy\n', 'utf8');
  const validation = await validateImagePromptBundle(root);
  assert.equal(validation.passed, false);
  assert.equal(validation.technicalMirrorPresent, true);
});
