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
  await writeJson(path.join(root, 'reel.json'), { visualStyleId: 'round-country-characters' });
  await writeJson(path.join(root, 'cover', 'cover.json'), { headline: 'NUR DIESE HOOK' });
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), [
    {
      sceneId: 'scene-02',
      order: 2,
      imageText: 'SZENE ZWEI',
      imagePhases: [
        {
          phaseId: 'scene-02-image-01',
          order: 1,
          startPercent: 0,
          promptFileName: 'image-prompt.txt',
          imageText: 'SZENE ZWEI'
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
    { sceneId: 'scene-01', order: 1, imageText: 'ERSTE SZENE' },
    { sceneId: 'scene-03', order: 3, imageText: 'DRITTE SZENE' }
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

test('README erklärt individuelle Bilddichte, Text-Whitelist und Länder-Kugeln', async () => {
  const root = await createFixture();
  const paths = await ensureImagePromptBundleDirectory(root);
  const readme = await readFile(paths.readme, 'utf8');

  assert.match(paths.file, /all-image-prompts[\\/]all-image-prompts\.txt$/);
  assert.match(readme, /Bild 00 ist immer das Cover/);
  assert.match(readme, /globale Bildreihenfolge/);
  assert.match(readme, /Workflow-Metadaten/);
  assert.match(readme, /harte Text-Whitelist/);
  assert.match(readme, /vollständig runde Kugel/);
  assert.match(readme, /streng seriell/);
});

test('exportiert Bildphasen ohne renderbare COVER-/SZENE-Header und mit Text-Firewall', async () => {
  const root = await createFixture();
  const result = await buildImagePromptBundle(root, { strict: true });
  const content = await readFile(result.outputFile, 'utf8');

  const cover = content.indexOf('[[WORKFLOW_METADATA asset=00; role=cover; filename="Bild 00.png"]]');
  const first = content.indexOf('[[WORKFLOW_METADATA asset=01; role=scene-1-phase-1; target=scene-01; filename="Bild 01.png"]]');
  const secondA = content.indexOf('[[WORKFLOW_METADATA asset=02; role=scene-2-phase-1; target=scene-02; filename="Bild 02.png"]]');
  const secondB = content.indexOf('[[WORKFLOW_METADATA asset=03; role=scene-2-phase-2; target=scene-02-image-02; filename="Bild 03.png"]]');
  const third = content.indexOf('[[WORKFLOW_METADATA asset=04; role=scene-3-phase-1; target=scene-03; filename="Bild 04.png"]]');

  assert.ok(cover >= 0);
  assert.ok(first > cover);
  assert.ok(secondA > first);
  assert.ok(secondB > secondA);
  assert.ok(third > secondB);

  assert.match(content, /WORKFLOW CONTROL — NEVER RENDER WORKFLOW TEXT INTO THE IMAGE/);
  assert.match(content, /WORKFLOW METADATA IS NEVER VISUAL CONTENT/);
  assert.match(content, /VISIBLE-TEXT FIREWALL — NON-NEGOTIABLE/);
  assert.match(content, /The ONLY readable text allowed anywhere inside the image is exactly: "NUR DIESE HOOK"/);
  assert.match(content, /The ONLY readable text allowed anywhere inside the image is exactly: "SZENE ZWEI"/);
  assert.match(content, /Generate ZERO readable text inside the image/);
  assert.match(content, /ROUND-COUNTRY-CHARACTER BODY RULE — NON-NEGOTIABLE/);
  assert.match(content, /complete perfectly round circular country ball\/sphere/);
  assert.match(content, /Never use a country outline, map silhouette/);
  assert.match(content, /Prompt für Szene zwei, Bildphase zwei\./);
  assert.match(content, /asset 03 -> filename `Bild 03\.png` -> scene-2-phase-2/);
  assert.doesNotMatch(content, /BILD 00 – COVER – GOOGLE-FLOW-PROMPT/);
  assert.doesNotMatch(content, /BILD 01 – SZENE 1 · BILDPHASE 1 – GOOGLE-FLOW-PROMPT/);

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
