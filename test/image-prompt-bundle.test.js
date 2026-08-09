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
  assert.match(readme, /jeweils genau EINEN vollständigen Promptblock in Google Flow/);
  assert.match(readme, /direkte Google-Flow-Bildgenerierungsbefehle/);
});

test('exportiert Cover und Szenen chronologisch als direkt kopierbare Flow-Generierungsbefehle', async () => {
  const root = await createFixture();
  const result = await buildImagePromptBundle(root, { strict: true });
  const content = await readFile(result.outputFile, 'utf8');

  const cover = content.indexOf('BILD 00 – COVER – GOOGLE-FLOW-PROMPT');
  const first = content.indexOf('BILD 01 – SZENE 1 – GOOGLE-FLOW-PROMPT');
  const second = content.indexOf('BILD 02 – SZENE 2 – GOOGLE-FLOW-PROMPT');
  const third = content.indexOf('BILD 03 – SZENE 3 – GOOGLE-FLOW-PROMPT');
  const numbering = content.indexOf('DATEIBENENNUNG UND ABLAGE NACH DER BILDGENERIERUNG');

  assert.ok(cover >= 0);
  assert.ok(first > cover);
  assert.ok(second > first);
  assert.ok(third > second);
  assert.ok(numbering > third);

  assert.match(content, /BILD 00 – COVER – GOOGLE-FLOW-PROMPT\nZIEL: COVER\nGEWÜNSCHTER DATEINAME NACH DEM DOWNLOAD: Bild 00\.png/);
  assert.match(content, /BILD 01 – SZENE 1 – GOOGLE-FLOW-PROMPT\nZIEL: SZENE 1\nGEWÜNSCHTER DATEINAME NACH DEM DOWNLOAD: Bild 01\.png/);
  assert.match(content, /BILD 02 – SZENE 2 – GOOGLE-FLOW-PROMPT\nZIEL: SZENE 2\nGEWÜNSCHTER DATEINAME NACH DEM DOWNLOAD: Bild 02\.png/);
  assert.match(content, /BILD 03 – SZENE 3 – GOOGLE-FLOW-PROMPT\nZIEL: SZENE 3\nGEWÜNSCHTER DATEINAME NACH DEM DOWNLOAD: Bild 03\.png/);

  assert.match(content, /GOOGLE FLOW – DIREKTER BILDGENERIERUNGSBEFEHL: ERZEUGE JETZT GENAU EIN BILD/);
  assert.match(content, /Keine Erklärung, keine Bestätigung, keine Zusammenfassung und keine reine Textantwort/);
  assert.match(content, /Starte sofort die Bildgenerierung/);
  assert.match(content, /Erzeuge nur dieses eine Bild/);

  assert.match(content, /Prompt für das Cover\./);
  assert.match(content, /Prompt für die erste Szene\./);
  assert.match(content, /Prompt für die zweite Szene\./);
  assert.match(content, /Prompt für die dritte Szene\./);
  assert.match(content, /Bild 00 = COVER → Dateiname `Bild 00\.png`/);
  assert.match(content, /Bild 01 = SZENE 1 → Dateiname `Bild 01\.png`/);
  assert.match(content, /Bild 02 = SZENE 2 → Dateiname `Bild 02\.png`/);
  assert.match(content, /Bild 03 = SZENE 3 → Dateiname `Bild 03\.png`/);
  assert.match(content, /00-ALLE-BILDER-HIER-REIN/);

  assert.doesNotMatch(content, /FÜR DEN NUTZER/);
  assert.doesNotMatch(content, /Kein Agent soll dieses Bild erzeugen/);
  assert.doesNotMatch(content, /NUR DER NUTZER ERSTELLT DIE BILDER/);
  assert.doesNotMatch(content, /Kein Agent darf die Bildgenerierung übernehmen/);
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
