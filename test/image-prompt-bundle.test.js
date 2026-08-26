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

const NEUTRAL_BASE = 'Vertical 9:16 illustration. Use the full frame naturally with one clear focal moment, readable smartphone composition and no reserved subtitle safe-zone.';

async function createFixture({ missingCoverPrompt = false, missingSecondPrompt = false, missingExtraPrompt = false } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'prompt-bundle-'));
  await writeJson(path.join(root, 'status.json'), { imagePrompts: 'ready' });
  await writeJson(path.join(root, 'reel.json'), { visualStyleId: null, visualStyleReason: '' });
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
      `${NEUTRAL_BASE} Create a strong cover composition around one concrete symbolic object. Integrate the exact German headline "NUR DIESE HOOK" as the only readable phrase. No other readable text, no English, no logos, no watermark.`,
      'utf8'
    );
  }

  for (const sceneId of ['scene-01', 'scene-02', 'scene-03']) await mkdir(path.join(root, 'scenes', sceneId), { recursive: true });

  await writeFile(
    path.join(root, 'scenes', 'scene-01', 'image-prompt.txt'),
    `${NEUTRAL_BASE} Show a clear first explanatory moment with one focal object and one supporting prop. Integrate the exact German text "ERSTE SZENE" as the only readable phrase. No other readable text, no English, no logos, no watermark.`,
    'utf8'
  );

  if (!missingSecondPrompt) {
    await writeFile(
      path.join(root, 'scenes', 'scene-02', 'image-prompt.txt'),
      `${NEUTRAL_BASE} Show a clear comparison between two visible alternatives. Integrate the exact German text "SZENE ZWEI" as the only readable phrase. No other readable text, no English, no logos, no watermark.`,
      'utf8'
    );
  }

  if (!missingExtraPrompt) {
    await writeFile(
      path.join(root, 'scenes', 'scene-02', 'image-prompt-02.txt'),
      `${NEUTRAL_BASE} Show the second visual beat as a close detail that clearly advances the explanation. No readable text anywhere in the image. No English, no logos, no watermark.`,
      'utf8'
    );
  }

  await writeFile(
    path.join(root, 'scenes', 'scene-03', 'image-prompt.txt'),
    `${NEUTRAL_BASE} Show a strong final explanatory composition with a simple consequence visual. Integrate the exact German text "DRITTE SZENE" as the only readable phrase. No other readable text, no English, no logos, no watermark.`,
    'utf8'
  );

  return root;
}

test('README erklärt den kompletten seriellen Gesamtprompt ohne feste Bildwelt', async () => {
  const root = await createFixture();
  const paths = await ensureImagePromptBundleDirectory(root);
  const readme = await readFile(paths.readme, 'utf8');
  const userReadme = await readFile(paths.userReadme, 'utf8');

  assert.match(readme, /00-bildprompts\/99-alle-bildprompts\.txt/);
  assert.match(readme, /komplette serielle Gesamtprompt/);
  assert.match(readme, /Exakt eine Bildgenerierung pro Agent-Schritt/);
  assert.match(readme, /google-flow-controller\.txt.*deaktiviert/is);
  assert.match(readme, /keine feste Bildwelt definiert/i);
  assert.match(userReadme, /99-alle-bildprompts\.txt/);
});

test('exportiert kompletten seriellen Aufbau und hält konkrete Visual-Prompts wortgetreu', async () => {
  const root = await createFixture();
  const sourceCover = (await readFile(path.join(root, 'cover', 'cover-prompt.txt'), 'utf8')).trim();
  const sourceScene = (await readFile(path.join(root, 'scenes', 'scene-02', 'image-prompt-02.txt'), 'utf8')).trim();

  const result = await buildImagePromptBundle(root, { strict: true });

  const bundle = await readFile(result.outputFile, 'utf8');
  const mirror = await readFile(result.technicalMirrorFile, 'utf8');
  const p00 = (await readFile(path.join(result.individualPromptsDirectory, 'Bild 00.txt'), 'utf8')).trim();
  const p03 = (await readFile(path.join(result.individualPromptsDirectory, 'Bild 03.txt'), 'utf8')).trim();

  assert.equal(bundle, mirror);
  assert.match(bundle, /^GOOGLE FLOW – KOMPLETTER SERIELLER BILDLAUF/);
  assert.match(bundle, /DIESE EINE NACHRICHT IST DIE KOMPLETTE FREIGABE/);
  assert.match(bundle, /STRENG SERIELL – NIE PARALLEL/);
  assert.match(bundle, /Genau EINEN Bildgenerator-Aufruf/);
  assert.match(bundle, /Niemals zwei oder mehr Generierungsaktionen im selben Agent-Schritt/);
  assert.match(bundle, /späteren Bildprompts.*NICHT zur Ausführung freigegeben/);
  assert.match(bundle, /KEINE FESTE BILDWELT AKTIV/);
  assert.match(bundle, /BILD 00 – COVER/);
  assert.match(bundle, /BILD 03 – SZENE 2 – BILDPHASE 2/);
  assert.match(bundle, /DATEINAME NACH FERTIGSTELLUNG: Bild 03\.png/);
  assert.match(bundle, /ARBEITSLABELS SIND NIEMALS BILDINHALT/);
  assert.ok(bundle.includes(sourceCover));
  assert.ok(bundle.includes(sourceScene));
  assert.doesNotMatch(bundle, /round-country-characters/);
  assert.doesNotMatch(bundle, /Golden Reference/i);

  assert.equal(p00, sourceCover);
  assert.equal(p03, sourceScene);
  assert.doesNotMatch(p00, /BILD 00 – COVER/);
  assert.doesNotMatch(p00, /DATEINAME NACH FERTIGSTELLUNG/);

  assert.equal(result.controllerFile, null);
  assert.equal(result.coverIncluded, true);
  assert.equal(result.sceneCount, 3);
  assert.equal(result.plannedImageCount, 4);
  assert.equal(result.totalPromptCount, 5);

  const validation = await validateImagePromptBundle(root);
  assert.equal(validation.passed, true);
  assert.equal(validation.controllerPresent, false);
  assert.equal(validation.filePresent, true);
  assert.equal(validation.technicalMirrorPresent, true);
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

test('erkennt veraltete Einzelprompt-Sicherung', async () => {
  const root = await createFixture();
  const result = await buildImagePromptBundle(root, { strict: true });
  await writeFile(path.join(result.individualPromptsDirectory, 'Bild 02.txt'), 'veraltet\n', 'utf8');

  const validation = await validateImagePromptBundle(root);
  assert.equal(validation.passed, false);
  assert.equal(validation.current, false);
});
