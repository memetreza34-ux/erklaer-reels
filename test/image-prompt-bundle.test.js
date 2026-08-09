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

async function createFixture({ missingCoverPrompt = false, missingSecondPrompt = false } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'prompt-bundle-'));
  await writeJson(path.join(root, 'status.json'), { imagePrompts: 'ready' });
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), [
    { sceneId: 'scene-02', order: 2 },
    { sceneId: 'scene-01', order: 1 },
    { sceneId: 'scene-03', order: 3 }
  ]);

  await mkdir(path.join(root, 'cover'), { recursive: true });
  if (!missingCoverPrompt) {
    await writeFile(path.join(root, 'cover', 'cover-prompt.txt'), 'Prompt für das Cover.', 'utf8');
  }

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

test('legt den Sammelordner und die Textdatei für Cover und Szenen an', async () => {
  const root = await createFixture();
  const paths = await ensureImagePromptBundleDirectory(root);
  const placeholder = await readFile(paths.file, 'utf8');
  const readme = await readFile(paths.readme, 'utf8');

  assert.match(paths.file, /all-image-prompts[\\/]all-image-prompts\.txt$/);
  assert.match(placeholder, /Cover und Szenen/);
  assert.match(readme, /cover\/cover-prompt\.txt/);
  assert.match(readme, /Bild 00 = Cover/);
  assert.match(readme, /JEDEM einzelnen Prompt/);
  assert.match(readme, /Einzelbild-Ablauf/);
});

test('exportiert Cover und Szenen chronologisch mit direkter Bildnummer und Dateiname an jedem Prompt', async () => {
  const root = await createFixture();
  const result = await buildImagePromptBundle(root, { strict: true });
  const content = await readFile(result.outputFile, 'utf8');

  const cover = content.indexOf('BILD 00 – COVER – BILDPROMPT');
  const first = content.indexOf('BILD 01 – SZENE 1 – BILDPROMPT');
  const second = content.indexOf('BILD 02 – SZENE 2 – BILDPROMPT');
  const third = content.indexOf('BILD 03 – SZENE 3 – BILDPROMPT');
  const numbering = content.indexOf('GOOGLE FLOW KI-AGENT – VERBINDLICHER ABLAUF FÜR DIE BILDGENERIERUNG');

  assert.ok(cover >= 0);
  assert.ok(first > cover);
  assert.ok(second > first);
  assert.ok(third > second);
  assert.ok(numbering > third);

  assert.match(content, /BILD 00 – COVER – BILDPROMPT\nZIEL: COVER\nDATEINAME NACH ERZEUGUNG: Bild 00\.png/);
  assert.match(content, /BILD 01 – SZENE 1 – BILDPROMPT\nZIEL: SZENE 1\nDATEINAME NACH ERZEUGUNG: Bild 01\.png/);
  assert.match(content, /BILD 02 – SZENE 2 – BILDPROMPT\nZIEL: SZENE 2\nDATEINAME NACH ERZEUGUNG: Bild 02\.png/);
  assert.match(content, /BILD 03 – SZENE 3 – BILDPROMPT\nZIEL: SZENE 3\nDATEINAME NACH ERZEUGUNG: Bild 03\.png/);

  assert.match(content, /GOOGLE FLOW: Erzeuge jetzt NUR dieses eine Bild/);
  assert.match(content, /benenne es SOFORT in `Bild 00\.png` um/);
  assert.match(content, /benenne es SOFORT in `Bild 01\.png` um/);
  assert.match(content, /benenne es SOFORT in `Bild 02\.png` um/);
  assert.match(content, /benenne es SOFORT in `Bild 03\.png` um/);

  assert.match(content, /Prompt für das Cover\./);
  assert.match(content, /Prompt für die erste Szene\./);
  assert.match(content, /Prompt für die zweite Szene\./);
  assert.match(content, /Prompt für die dritte Szene\./);
  assert.match(content, /Google-Flow-KI-Agenten/);
  assert.match(content, /keine Codex-Anweisung/);
  assert.match(content, /ARBEITE IMMER BILD FÜR BILD/);
  assert.match(content, /PROMPT LESEN → GENAU EIN BILD ERZEUGEN → SOFORT UMBENENNEN → ERST DANN ZUM NÄCHSTEN PROMPT/);
  assert.match(content, /ERST WENN ALLE Bilder fertig erzeugt, korrekt umbenannt und vollständig geprüft sind/);
  assert.match(content, /Bild 00 = COVER → Dateiname `Bild 00\.png`/);
  assert.match(content, /Bild 01 = SZENE 1 → Dateiname `Bild 01\.png`/);
  assert.match(content, /Bild 02 = SZENE 2 → Dateiname `Bild 02\.png`/);
  assert.match(content, /Bild 03 = SZENE 3 → Dateiname `Bild 03\.png`/);
  assert.match(content, /00-ALLE-BILDER-HIER-REIN/);
  assert.doesNotMatch(content, /3ER-STEPS|3er-Step|3er-Batches/);
  assert.equal(result.coverIncluded, true);
  assert.equal(result.sceneCount, 3);
  assert.equal(result.totalPromptCount, 4);

  const validation = await validateImagePromptBundle(root);
  assert.equal(validation.passed, true);
  assert.equal(validation.coverIncluded, true);
});

test('blockiert im strengen Modus einen fehlenden Cover-Prompt', async () => {
  const root = await createFixture({ missingCoverPrompt: true });

  await assert.rejects(
    () => buildImagePromptBundle(root, { strict: true }),
    /cover/
  );
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
