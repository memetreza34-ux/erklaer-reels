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

test('legt den Sammelordner und die One-Paste-Hinweise an', async () => {
  const root = await createFixture();
  const paths = await ensureImagePromptBundleDirectory(root);
  const placeholder = await readFile(paths.file, 'utf8');
  const readme = await readFile(paths.readme, 'utf8');

  assert.match(paths.file, /all-image-prompts[\\/]all-image-prompts\.txt$/);
  assert.match(placeholder, /Cover und Szenen/);
  assert.match(readme, /Bild 00 = Cover/);
  assert.match(readme, /komplette Datei auf einmal in Google Flow/);
  assert.match(readme, /sofort bei Bild 00 starten/);
  assert.match(readme, /Regeln für Antigravity, Codex oder andere Repo-Agenten gehören \*\*nicht\*\* in diese kopierbare Datei/);
});

test('exportiert einen einzigen Google-Flow-Gesamtauftrag mit Autostart und allen Bildblöcken', async () => {
  const root = await createFixture();
  const result = await buildImagePromptBundle(root, { strict: true });
  const content = await readFile(result.outputFile, 'utf8');

  const execution = content.indexOf('GOOGLE FLOW – GESAMTAUFTRAG: STARTE JETZT SOFORT');
  const cover = content.indexOf('BILD 00 – COVER – GOOGLE-FLOW-PROMPT');
  const first = content.indexOf('BILD 01 – SZENE 1 – GOOGLE-FLOW-PROMPT');
  const second = content.indexOf('BILD 02 – SZENE 2 – GOOGLE-FLOW-PROMPT');
  const third = content.indexOf('BILD 03 – SZENE 3 – GOOGLE-FLOW-PROMPT');
  const numbering = content.indexOf('ABSCHLUSS – DATEIBENENNUNG UND GEMEINSAME ABLAGE');

  assert.ok(execution >= 0);
  assert.ok(cover > execution);
  assert.ok(first > cover);
  assert.ok(second > first);
  assert.ok(third > second);
  assert.ok(numbering > third);

  assert.match(content, /ALLE BILDPROMPTS – GOOGLE FLOW ONE-PASTE/);
  assert.match(content, /Diese komplette Nachricht ist EIN zusammenhängender Auftrag für 4 Bilder/);
  assert.match(content, /ANTWORTE NICHT mit einer Bestätigung, Zusammenfassung, Erklärung, Anleitung/);
  assert.match(content, /STARTE STATTDESSEN SOFORT mit der tatsächlichen Bildgenerierung von BILD 00/);
  assert.match(content, /Beginne jetzt mit BILD 00 = COVER/);
  assert.match(content, /Danach fahre OHNE Textantwort und OHNE Rückfrage automatisch mit dem direkt nächsten Bildblock fort/);
  assert.match(content, /Stoppe erst, nachdem alle 4 Bilder von Bild 00 bis Bild 03 erzeugt wurden/);

  assert.match(content, /BILD 00 – COVER – GOOGLE-FLOW-PROMPT\nZIEL: COVER\nDATEINAME: Bild 00\.png/);
  assert.match(content, /BILD 01 – SZENE 1 – GOOGLE-FLOW-PROMPT\nZIEL: SZENE 1\nDATEINAME: Bild 01\.png/);
  assert.match(content, /BILD 02 – SZENE 2 – GOOGLE-FLOW-PROMPT\nZIEL: SZENE 2\nDATEINAME: Bild 02\.png/);
  assert.match(content, /BILD 03 – SZENE 3 – GOOGLE-FLOW-PROMPT\nZIEL: SZENE 3\nDATEINAME: Bild 03\.png/);

  assert.match(content, /GOOGLE FLOW – AKTUELLER SCHRITT: Erzeuge JETZT genau BILD 00/);
  assert.match(content, /GOOGLE FLOW – AKTUELLER SCHRITT: Erzeuge JETZT genau BILD 01/);
  assert.match(content, /automatisch mit dem direkt folgenden nummerierten Bildblock dieser Nachricht fort/);

  assert.match(content, /Prompt für das Cover\./);
  assert.match(content, /Prompt für die erste Szene\./);
  assert.match(content, /Prompt für die zweite Szene\./);
  assert.match(content, /Prompt für die dritte Szene\./);
  assert.match(content, /Bild 00 = COVER → Dateiname `Bild 00\.png`/);
  assert.match(content, /Bild 03 = SZENE 3 → Dateiname `Bild 03\.png`/);
  assert.match(content, /00-ALLE-BILDER-HIER-REIN/);

  assert.doesNotMatch(content, /FÜR DEN NUTZER/);
  assert.doesNotMatch(content, /Kein Agent soll dieses Bild erzeugen/);
  assert.doesNotMatch(content, /NUR DER NUTZER ERSTELLT DIE BILDER/);
  assert.doesNotMatch(content, /Kein Agent darf die Bildgenerierung übernehmen/);
  assert.doesNotMatch(content, /immer genau EINEN vollständigen Bildblock kopieren/);
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
