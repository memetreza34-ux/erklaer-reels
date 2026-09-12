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
import { FIXED_VISUAL_WORLD_LABEL } from '../src/shared/fixed-visual-world.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

const NEUTRAL_BASE = 'Vertical 9:16 illustration. Use one clear physical moment, readable smartphone composition and no reserved subtitle safe-zone.';

async function createFixture({ missingFirstPrompt = false, missingSecondPrompt = false, missingExtraPrompt = false } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'prompt-bundle-'));
  await writeJson(path.join(root, 'status.json'), { imagePrompts: 'ready' });
  await writeJson(path.join(root, 'reel.json'), { visualStyleId: 'modern-countryball-explainer' });
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), [
    { sceneId: 'scene-01', order: 1, imageText: 'ERSTE SZENE' },
    {
      sceneId: 'scene-02',
      order: 2,
      imageText: 'SZENE ZWEI',
      imagePhases: [
        { phaseId: 'scene-02-image-01', order: 1, startPercent: 0, promptFileName: 'image-prompt.txt', imageText: 'SZENE ZWEI' },
        { phaseId: 'scene-02-image-02', order: 2, startPercent: 0.55, promptFileName: 'image-prompt-02.txt', imageText: '' }
      ]
    },
    { sceneId: 'scene-03', order: 3, imageText: 'DRITTE SZENE' }
  ]);

  for (const sceneId of ['scene-01', 'scene-02', 'scene-03']) await mkdir(path.join(root, 'scenes', sceneId), { recursive: true });
  // Szene 1 ist zugleich das Titelbild; ein separates Cover gibt es nicht mehr.
  if (!missingFirstPrompt) await writeFile(path.join(root, 'scenes', 'scene-01', 'image-prompt.txt'), `${NEUTRAL_BASE} Show one round ball character performing one clear action. Integrate exactly "ERSTE SZENE".`, 'utf8');
  if (!missingSecondPrompt) await writeFile(path.join(root, 'scenes', 'scene-02', 'image-prompt.txt'), `${NEUTRAL_BASE} Show a clear human action. Integrate exactly "SZENE ZWEI".`, 'utf8');
  if (!missingExtraPrompt) await writeFile(path.join(root, 'scenes', 'scene-02', 'image-prompt-02.txt'), `${NEUTRAL_BASE} Show one concrete object close-up. No readable text.`, 'utf8');
  await writeFile(path.join(root, 'scenes', 'scene-03', 'image-prompt.txt'), `${NEUTRAL_BASE} Show a strong final human scene. Integrate exactly "DRITTE SZENE".`, 'utf8');
  return root;
}

test('README erklärt genau eine Google-Flow-Masterdatei', async () => {
  const root = await createFixture();
  const paths = await ensureImagePromptBundleDirectory(root);
  const readme = await readFile(paths.userReadme, 'utf8');

  assert.match(readme, /genau \*\*eine\*\* verbindliche Masterdatei/i);
  assert.match(readme, /99-alle-bildprompts\.txt/);
  assert.match(readme, /keine zweite Spiegelkopie/i);
  assert.ok(readme.includes(FIXED_VISUAL_WORLD_LABEL));
  assert.match(readme, /runde Kugelfiguren/i);
  assert.match(readme, /Stick-Figuren sind nicht Teil/i);
});

test('exportiert nur den einen seriellen Gesamtprompt im sichtbaren Bildprompt-Ordner', async () => {
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
  assert.ok(bundle.includes(`VERBINDLICHE EINE REEL-BILDWELT – ${FIXED_VISUAL_WORLD_LABEL.toUpperCase()}`));
  assert.match(bundle, /round countryball-style character/i);
  assert.match(bundle, /never bean-shaped, oval, egg-shaped, human-headed or humanoid/i);
  assert.match(bundle, /An actor is NOT mandatory in every image/i);
  assert.match(bundle, /FIXED VISUAL STYLE FOR THIS IMAGE — MANDATORY:/);
  assert.match(bundle, /DATEINAME NACH FERTIGSTELLUNG: Bild 03\.png/);
  assert.equal(result.controllerFile, null);
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
  assert.ok(validation.message.includes(FIXED_VISUAL_WORLD_LABEL));
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
