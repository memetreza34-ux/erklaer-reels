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

async function createFixture({ missingSecondPrompt = false } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'prompt-bundle-'));
  await writeJson(path.join(root, 'status.json'), { imagePrompts: 'ready' });
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), [
    { sceneId: 'scene-02', order: 2 },
    { sceneId: 'scene-01', order: 1 },
    { sceneId: 'scene-03', order: 3 }
  ]);

  for (const sceneId of ['scene-01', 'scene-02', 'scene-03']) {
    await mkdir(path.join(root, 'scenes', sceneId), { recursive: true });
  }

  await writeFile(path.join(root, 'scenes', 'scene-01', 'image-prompt.txt'), 'Prompt für die erste Szene.', 'utf8');
  if (!missingSecondPrompt) {
    await writeFile(path.join(root, 'scenes', 'scene-02', 'image-prompt.txt'), 'Prompt für die zweite Szene.', 'utf8');
  }
  await writeFile(path.join(root, 'scenes', 'scene-03', 'image-prompt.txt'), 'Prompt für die dritte Szene.', 'utf8');
  return root;
}

test('legt den neuen Sammelordner und die Textdatei an', async () => {
  const root = await createFixture();
  const paths = await ensureImagePromptBundleDirectory(root);
  const placeholder = await readFile(paths.file, 'utf8');

  assert.match(paths.file, /all-image-prompts[\\/]all-image-prompts\.txt$/);
  assert.match(placeholder, /Sammeldatei/);
});

test('exportiert alle Bildprompts chronologisch in eine Datei', async () => {
  const root = await createFixture();
  const result = await buildImagePromptBundle(root, { strict: true });
  const content = await readFile(result.outputFile, 'utf8');

  const first = content.indexOf('SZENE 1 – BILDPROMPT 1');
  const second = content.indexOf('SZENE 2 – BILDPROMPT 2');
  const third = content.indexOf('SZENE 3 – BILDPROMPT 3');

  assert.ok(first >= 0);
  assert.ok(second > first);
  assert.ok(third > second);
  assert.match(content, /Prompt für die erste Szene\./);
  assert.match(content, /Prompt für die zweite Szene\./);
  assert.match(content, /Prompt für die dritte Szene\./);

  const validation = await validateImagePromptBundle(root);
  assert.equal(validation.passed, true);
});

test('blockiert im strengen Modus fehlende Szenenprompts', async () => {
  const root = await createFixture({ missingSecondPrompt: true });

  await assert.rejects(
    () => buildImagePromptBundle(root, { strict: true }),
    /scene-02/
  );
});

test('erkennt eine veraltete Sammeldatei', async () => {
  const root = await createFixture();
  const result = await buildImagePromptBundle(root, { strict: true });
  await writeFile(result.outputFile, 'veraltet\n', 'utf8');

  const validation = await validateImagePromptBundle(root);
  assert.equal(validation.passed, false);
  assert.equal(validation.current, false);
});
