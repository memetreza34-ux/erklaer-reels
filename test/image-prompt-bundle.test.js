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
    await writeFile(path.join(root, 'cover', 'cover-prompt.txt'), 'Prompt für das Cover mit sichtbarer Hook.', 'utf8');
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

test('legt den Sammelordner und Hinweise fuer serielle Generierung plus Cover-Stilvorlage an', async () => {
  const root = await createFixture();
  const paths = await ensureImagePromptBundleDirectory(root);
  const placeholder = await readFile(paths.file, 'utf8');
  const readme = await readFile(paths.readme, 'utf8');

  assert.match(paths.file, /all-image-prompts[\\/]all-image-prompts\.txt$/);
  assert.match(placeholder, /Cover und Szenen/);
  assert.match(readme, /Bild 00 = Cover/);
  assert.match(readme, /harte serielle Sperre/);
  assert.match(readme, /nur \*\*eine einzige Bildgenerierung aktiv\*\*/);
  assert.match(readme, /Kein Parallelisieren, keine Warteschlange, kein Vorladen/);
  assert.match(readme, /Bild 00 ist zusätzlich die verbindliche visuelle Stilvorlage/);
  assert.match(readme, /Cover enthält den sichtbaren Hook zum Reel-Thema/);
  assert.match(readme, /gleicher Zeichen-\/Renderstil/);
});

test('exportiert Google-Flow-Gesamtauftrag mit serieller Sperre, Cover-Hook und Style-Referenz', async () => {
  const root = await createFixture();
  const result = await buildImagePromptBundle(root, { strict: true });
  const content = await readFile(result.outputFile, 'utf8');

  const execution = content.indexOf('GOOGLE FLOW – HARTE SERIELLE SPERRE – NIEMALS PARALLEL');
  const cover = content.indexOf('BILD 00 – COVER – GOOGLE-FLOW-PROMPT');
  const first = content.indexOf('BILD 01 – SZENE 1 – GOOGLE-FLOW-PROMPT');
  const second = content.indexOf('BILD 02 – SZENE 2 – GOOGLE-FLOW-PROMPT');
  const third = content.indexOf('BILD 03 – SZENE 3 – GOOGLE-FLOW-PROMPT');
  const numbering = content.indexOf('ABSCHLUSS – ERST JETZT GEMEINSAM IN EINEN ORDNER');

  assert.ok(execution >= 0);
  assert.ok(cover > execution);
  assert.ok(first > cover);
  assert.ok(second > first);
  assert.ok(third > second);
  assert.ok(numbering > third);

  assert.match(content, /ALLE BILDPROMPTS – GOOGLE FLOW – STRENG EINZELN \+ COVER ALS STYLE-VORLAGE/);
  assert.match(content, /NICHT gleichzeitig und NICHT als Batch/);
  assert.match(content, /ZU JEDEM ZEITPUNKT DARF GENAU EINE EINZIGE BILDGENERIERUNG AKTIV SEIN/);
  assert.match(content, /STARTE NIEMALS DAS NÄCHSTE BILD/);
  assert.match(content, /Warteschlange oder Queue/);
  assert.match(content, /WARTE, bis diese eine Bildgenerierung vollständig abgeschlossen ist/);
  assert.match(content, /WARTE, bis auch die Umbenennung abgeschlossen ist/);
  assert.match(content, /ERST JETZT ist der nächste nummerierte Bildblock freigegeben/);

  assert.match(content, /BILD 00 = COVER \+ VERBINDLICHE STILVORLAGE/);
  assert.match(content, /sichtbare deutsche Text ist der HOOK des Reels/);
  assert.match(content, /verwende genau dieses fertige Cover als visuelle Referenz\/Vorlage für ALLE folgenden Szenen/i);
  assert.match(content, /denselben Zeichen-\/Renderstil, dieselbe Farbwelt, dieselben Figurenmerkmale/);
  assert.match(content, /Übernimm den Cover-Hook-Text NICHT automatisch in spätere Szenen/);

  assert.match(content, /BILD 00 – COVER – GOOGLE-FLOW-PROMPT\nZIEL: COVER \+ STYLE-VORLAGE FÜR DAS GESAMTE REEL\nDATEINAME: Bild 00\.png/);
  assert.match(content, /BILD 01 – SZENE 1 – GOOGLE-FLOW-PROMPT\nZIEL: SZENE 1\nDATEINAME: Bild 01\.png/);
  assert.match(content, /BILD 02 – SZENE 2 – GOOGLE-FLOW-PROMPT\nZIEL: SZENE 2\nDATEINAME: Bild 02\.png/);
  assert.match(content, /BILD 03 – SZENE 3 – GOOGLE-FLOW-PROMPT\nZIEL: SZENE 3\nDATEINAME: Bild 03\.png/);

  assert.match(content, /COVER-REGEL: Dieses Bild ist das echte Cover UND die verbindliche visuelle Stilvorlage/);
  assert.match(content, /HOOK-REGEL: Der im folgenden Cover-Prompt verlangte sichtbare deutsche Text muss exakt und gut lesbar/);
  assert.match(content, /STYLE-REFERENZ: Verwende das bereits fertig erzeugte `Bild 00\.png` direkt als verbindliche visuelle Vorlage/);
  assert.match(content, /Den Cover-Hook-Text nicht kopieren/);

  assert.match(content, /FREIGABE: Dies ist der einzige jetzt freigegebene Bildblock/);
  assert.match(content, /FREIGABE-BEDINGUNG: Dieser Block ist GESPERRT, bis BILD 00 vollständig fertig erzeugt, exakt als `Bild 00\.png` umbenannt/);
  assert.match(content, /FREIGABE-BEDINGUNG: Dieser Block ist GESPERRT, bis BILD 01 vollständig fertig erzeugt, exakt als `Bild 01\.png` umbenannt/);
  assert.match(content, /Während diese Generierung läuft: KEIN anderes Bild starten/);
  assert.match(content, /sofort exakt in `Bild 03\.png` umbenennen und prüfen/);

  assert.match(content, /Prompt für das Cover mit sichtbarer Hook\./);
  assert.match(content, /Prompt für die erste Szene\./);
  assert.match(content, /Prompt für die zweite Szene\./);
  assert.match(content, /Prompt für die dritte Szene\./);
  assert.match(content, /Bild 00 = COVER → Dateiname `Bild 00\.png`/);
  assert.match(content, /Bild 03 = SZENE 3 → Dateiname `Bild 03\.png`/);
  assert.match(content, /ERST NACH DIESER VOLLSTÄNDIGEN PRÜFUNG/);
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
