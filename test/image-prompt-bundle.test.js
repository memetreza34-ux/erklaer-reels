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
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), [
    { sceneId: 'scene-02', order: 2, imagePhases: [
      { phaseId: 'scene-02-image-01', order: 1, startPercent: 0, promptFileName: 'image-prompt.txt' },
      { phaseId: 'scene-02-image-02', order: 2, startPercent: 0.55, promptFileName: 'image-prompt-02.txt' }
    ] },
    { sceneId: 'scene-01', order: 1 },
    { sceneId: 'scene-03', order: 3 }
  ]);

  await mkdir(path.join(root, 'cover'), { recursive: true });
  if (!missingCoverPrompt) {
    await writeFile(path.join(root, 'cover', 'cover-prompt.txt'), 'Prompt für das Cover mit sichtbarer Hook.', 'utf8');
  }

  for (const sceneId of ['scene-01', 'scene-02', 'scene-03']) {
    await mkdir(path.join(root, 'scenes', sceneId), { recursive: true });
  }

  await writeFile(path.join(root, 'scenes', 'scene-01', 'image-prompt.txt'), 'Prompt für die erste Szene.', 'utf8');
  if (!missingSecondPrompt) {
    await writeFile(path.join(root, 'scenes', 'scene-02', 'image-prompt.txt'), 'Prompt für Szene zwei, Bildphase eins.', 'utf8');
  }
  if (!missingExtraPrompt) {
    await writeFile(path.join(root, 'scenes', 'scene-02', 'image-prompt-02.txt'), 'Prompt für Szene zwei, Bildphase zwei.', 'utf8');
  }
  await writeFile(path.join(root, 'scenes', 'scene-03', 'image-prompt.txt'), 'Prompt für die dritte Szene.', 'utf8');
  return root;
}

test('README erklärt individuelle Bilddichte und globale Bildreihenfolge', async () => {
  const root = await createFixture();
  const paths = await ensureImagePromptBundleDirectory(root);
  const readme = await readFile(paths.readme, 'utf8');

  assert.match(paths.file, /all-image-prompts[\\/]all-image-prompts\.txt$/);
  assert.match(readme, /Bild 00 ist immer das Cover/);
  assert.match(readme, /globale Bildreihenfolge/);
  assert.match(readme, /nicht automatisch die Szenennummer/);
  assert.match(readme, /ein, zwei oder selten drei Bilder/);
  assert.match(readme, /streng seriell/);
  assert.match(readme, /kein weiteres Go/);
});

test('exportiert zusätzliche Bildphasen fortlaufend statt 1:1 nach Szenennummer', async () => {
  const root = await createFixture();
  const result = await buildImagePromptBundle(root, { strict: true });
  const content = await readFile(result.outputFile, 'utf8');

  const cover = content.indexOf('BILD 00 – COVER – GOOGLE-FLOW-PROMPT');
  const first = content.indexOf('BILD 01 – SZENE 1 · BILDPHASE 1 – GOOGLE-FLOW-PROMPT');
  const secondA = content.indexOf('BILD 02 – SZENE 2 · BILDPHASE 1 – GOOGLE-FLOW-PROMPT');
  const secondB = content.indexOf('BILD 03 – SZENE 2 · BILDPHASE 2 – GOOGLE-FLOW-PROMPT');
  const third = content.indexOf('BILD 04 – SZENE 3 · BILDPHASE 1 – GOOGLE-FLOW-PROMPT');

  assert.ok(cover >= 0);
  assert.ok(first > cover);
  assert.ok(secondA > first);
  assert.ok(secondB > secondA);
  assert.ok(third > secondB);

  assert.match(content, /INDIVIDUELLE BILDDICHTE/);
  assert.match(content, /Narrative Szenen und Bilder sind nicht mehr 1:1 gekoppelt/);
  assert.match(content, /BILD 00 = COVER \+ VERBINDLICHE STILVORLAGE/);
  assert.match(content, /ZIEL: scene-02-image-02/);
  assert.match(content, /Prompt für Szene zwei, Bildphase zwei\./);
  assert.match(content, /Bild 03 = SZENE 2 · BILDPHASE 2/);
  assert.match(content, /Bildnummer beschreibt die globale Bildreihenfolge/);
  assert.match(content, /00-ALLE-BILDER-HIER-REIN/);

  assert.equal(result.coverIncluded, true);
  assert.equal(result.sceneCount, 3);
  assert.equal(result.plannedImageCount, 4);
  assert.equal(result.totalPromptCount, 5);

  const validation = await validateImagePromptBundle(root);
  assert.equal(validation.passed, true);
  assert.equal(validation.plannedImageCount, 4);
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

test('erkennt eine veraltete Sammeldatei', async () => {
  const root = await createFixture();
  const result = await buildImagePromptBundle(root, { strict: true });
  await writeFile(result.outputFile, 'veraltet\n', 'utf8');

  const validation = await validateImagePromptBundle(root);
  assert.equal(validation.passed, false);
  assert.equal(validation.current, false);
});
