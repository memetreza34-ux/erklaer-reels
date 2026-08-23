import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { flattenSceneImagePhases } from '../shared/visual-moments.js';

const BUNDLE_DIRECTORY = 'all-image-prompts';
const LEGACY_INDEX_FILE = 'all-image-prompts.txt';
const CONTROLLER_FILE = 'google-flow-controller.txt';
const INDIVIDUAL_PROMPTS_DIRECTORY = 'image-prompts';

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function readJsonIfExists(filePath, fallback = {}) {
  return (await exists(filePath)) ? readJson(filePath) : fallback;
}

function normalizedRelativePath(value) {
  return value.split(path.sep).join('/');
}

function padImageNumber(value) {
  return String(value).padStart(2, '0');
}

export function getImagePromptBundlePaths(reelDirectory) {
  const directory = path.join(reelDirectory, BUNDLE_DIRECTORY);
  const individualPromptsDirectory = path.join(directory, INDIVIDUAL_PROMPTS_DIRECTORY);
  return {
    directory,
    file: path.join(directory, LEGACY_INDEX_FILE),
    controller: path.join(directory, CONTROLLER_FILE),
    individualPromptsDirectory,
    readme: path.join(directory, 'README.md')
  };
}

export async function ensureImagePromptBundleDirectory(reelDirectory) {
  const paths = getImagePromptBundlePaths(reelDirectory);
  await mkdir(paths.individualPromptsDirectory, { recursive: true });

  const readme = `# Google-Flow-Bildprompts\n\nGoogle Flow wird weiterhin **streng seriell** über \`${CONTROLLER_FILE}\` gesteuert.\n\nDie visuelle Prompt-Qualität bleibt aber im früheren bewährten Aufbau. Jede Datei unter \`${INDIVIDUAL_PROMPTS_DIRECTORY}/Bild NN.txt\` enthält ausschließlich den eigentlichen visuellen Quellprompt aus \`cover/cover-prompt.txt\` bzw. \`scenes/.../image-prompt*.txt\` — wortgetreu und ohne technische Wrapper.\n\nVerbindlicher Ablauf:\n\n1. nur \`Bild 00.txt\` lesen\n2. genau ein Bild erzeugen\n3. vollständig warten\n4. in \`Bild 00.png\` umbenennen und prüfen\n5. erst danach \`Bild 01.txt\` öffnen\n6. so seriell bis zum letzten Bild fortfahren\n\nKeine Queue, kein Batch, keine parallelen Generierungen und niemals mehrere Prompt-Dateien vorab einlesen.\n\n\`${LEGACY_INDEX_FILE}\` ist nur eine Kompatibilitäts-/Indexdatei und darf nicht als Generierungsprompt verwendet werden.\n\n**Wichtig:** Steuertexte wie Dateinamen, Bildnummern, Szenenlabels, \`GENERATE EXACTLY ONE IMAGE\`, \`VISIBLE TEXT FIREWALL\`, \`ROUND SPHERE WORLD\` oder \`QUALITY GATE\` gehören nicht in die einzelnen Visual-Prompts. Der Visual-Prompt selbst bleibt im alten detaillierten Editorial-Aufbau.\n\nErzeugen oder aktualisieren:\n\n\`\`\`bash\nnpm run export:prompts -- --dir "${normalizedRelativePath(reelDirectory)}" --strict\n\`\`\`\n`;
  await writeFile(paths.readme, readme, 'utf8');

  return paths;
}

export async function collectImagePrompts(reelDirectory) {
  const sceneIndexPath = path.join(reelDirectory, 'scenes', 'scene-index.json');
  if (!(await exists(sceneIndexPath))) throw new Error('scenes/scene-index.json wurde nicht gefunden.');

  const scenes = await readJson(sceneIndexPath);
  if (!Array.isArray(scenes) || scenes.length === 0) throw new Error('scenes/scene-index.json enthält keine Szenen.');

  const reel = await readJsonIfExists(path.join(reelDirectory, 'reel.json'), {});
  const cover = await readJsonIfExists(path.join(reelDirectory, 'cover', 'cover.json'), {});
  const visualStyleId = 'round-country-characters';

  const coverPromptPath = path.join(reelDirectory, 'cover', 'cover-prompt.txt');
  const coverPromptPresent = await exists(coverPromptPath);
  const coverPrompt = coverPromptPresent ? (await readFile(coverPromptPath, 'utf8')).trim() : '';

  const prompts = [{
    kind: 'cover',
    promptId: 'cover',
    targetId: 'cover',
    sceneId: null,
    sceneOrder: null,
    phaseOrder: null,
    order: 0,
    promptPath: coverPromptPath,
    prompt: coverPrompt,
    allowedVisibleText: String(cover.headline ?? '').trim(),
    visualStyleId,
    sourceVisualStyleId: String(reel.visualStyleId ?? '').trim(),
    missing: !coverPrompt
  }];

  for (const phase of flattenSceneImagePhases(scenes)) {
    const promptPath = path.join(reelDirectory, 'scenes', phase.sceneId, phase.promptFileName);
    const present = await exists(promptPath);
    const prompt = present ? (await readFile(promptPath, 'utf8')).trim() : '';
    prompts.push({
      kind: 'scene',
      promptId: phase.targetId,
      targetId: phase.targetId,
      sceneId: phase.sceneId,
      sceneOrder: phase.sceneOrder,
      phaseId: phase.phaseId,
      phaseOrder: phase.phaseOrder,
      order: phase.globalOrder,
      startPercent: phase.startPercent,
      promptPath,
      prompt,
      allowedVisibleText: String(phase.imageText ?? '').trim(),
      visualStyleId,
      sourceVisualStyleId: String(reel.visualStyleId ?? '').trim(),
      missing: !prompt
    });
  }

  return prompts;
}

function formatIndividualPrompt(entry) {
  return entry.prompt || '[BILDPROMPT FEHLT]';
}

function formatController(prompts) {
  const ordered = [...prompts].sort((a, b) => a.order - b.order);
  const last = padImageNumber(ordered.at(-1)?.order ?? 0);

  return [
    'GOOGLE FLOW SERIAL CONTROLLER — ONE IMAGE AT A TIME',
    '',
    'This controller is the ONLY file to start the Google Flow agent with.',
    'The files inside image-prompts/ are pure visual prompts in the proven legacy editorial structure. Do not rewrite, summarize, merge or simplify them.',
    'Do NOT read all prompt files in advance.',
    'Do NOT preload future prompt files.',
    '',
    'STRICT LOOP:',
    '1. Open only the next required prompt file from image-prompts/.',
    '2. Read only that one complete visual prompt.',
    '3. Generate exactly ONE image from that prompt.',
    '4. Wait until generation is completely finished.',
    '5. Rename the result to the matching Bild NN.png filename.',
    '6. Verify image quality and filename.',
    '7. Only then open the next prompt file.',
    '',
    'FORBIDDEN:',
    '- batch generation',
    '- parallel generation',
    '- queues',
    '- contact sheets or grids',
    '- multiple outputs from one image task',
    '- reading two or more image prompt files before the current image is finished',
    '- combining or shortening multiple visual prompts',
    `- using ${LEGACY_INDEX_FILE} as a generation prompt`,
    '',
    'START:',
    '- open image-prompts/Bild 00.txt only',
    '- generate Bild 00.png',
    '- use Bild 00.png as visual style master for all later images where the visual prompt requests it',
    '',
    `Continue strictly one image at a time through image-prompts/Bild ${last}.txt.`,
    'Do not ask the user for Go/Weiter/OK between images.'
  ].join('\n');
}

function formatLegacyIndex(prompts) {
  const ordered = [...prompts].sort((a, b) => a.order - b.order);
  const lines = [
    'KOMPATIBILITÄTS-/INDEXDATEI — NICHT ALS GOOGLE-FLOW-GENERIERUNGSPROMPT VERWENDEN',
    '',
    `Starte Google Flow stattdessen mit: ${CONTROLLER_FILE}`,
    '',
    'Einzelprompts:'
  ];

  for (const entry of ordered) {
    const number = padImageNumber(entry.order);
    lines.push(`- image-prompts/Bild ${number}.txt -> output Bild ${number}.png`);
  }

  return `${lines.join('\n')}\n`;
}

function missingPromptIds(prompts) {
  return prompts.filter((entry) => entry.missing).map((entry) => entry.promptId);
}

export function formatImagePromptBundle(prompts) {
  return formatLegacyIndex(prompts);
}

export async function buildImagePromptBundle(reelDirectory, { strict = false } = {}) {
  const paths = await ensureImagePromptBundleDirectory(reelDirectory);
  const prompts = await collectImagePrompts(reelDirectory);
  const missingIds = missingPromptIds(prompts);

  if (strict && missingIds.length > 0) throw new Error(`Bildprompts fehlen für: ${missingIds.join(', ')}.`);

  const ordered = [...prompts].sort((a, b) => a.order - b.order);
  for (const entry of ordered) {
    const number = padImageNumber(entry.order);
    await writeFile(path.join(paths.individualPromptsDirectory, `Bild ${number}.txt`), `${formatIndividualPrompt(entry)}\n`, 'utf8');
  }

  const controller = formatController(ordered);
  const index = formatLegacyIndex(ordered);
  await writeFile(paths.controller, `${controller}\n`, 'utf8');
  await writeFile(paths.file, index, 'utf8');

  const statusPath = path.join(reelDirectory, 'status.json');
  if (await exists(statusPath)) {
    const status = await readJson(statusPath);
    status.imagePromptBundle = missingIds.length === 0 ? 'ready-individual-files-legacy-visual-prompts' : 'incomplete';
    status.googleFlowController = missingIds.length === 0 ? 'ready' : 'incomplete';
    status.imagePromptMode = 'one-file-per-image-strict-serial-legacy-visual-payload';
    status.plannedImageCount = prompts.filter((entry) => entry.kind === 'scene').length;
    await writeFile(statusPath, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
  }

  return {
    outputFile: paths.file,
    controllerFile: paths.controller,
    individualPromptsDirectory: paths.individualPromptsDirectory,
    sceneCount: new Set(prompts.filter((entry) => entry.kind === 'scene').map((entry) => entry.sceneId)).size,
    plannedImageCount: prompts.filter((entry) => entry.kind === 'scene').length,
    totalPromptCount: prompts.length,
    coverIncluded: prompts.some((entry) => entry.kind === 'cover' && !entry.missing),
    missingPromptIds: missingIds,
    missingSceneIds: prompts.filter((entry) => entry.kind === 'scene' && entry.missing).map((entry) => entry.sceneId),
    complete: missingIds.length === 0,
    content: index,
    controller
  };
}

export async function validateImagePromptBundle(reelDirectory) {
  const paths = getImagePromptBundlePaths(reelDirectory);
  const prompts = await collectImagePrompts(reelDirectory);
  const missingIds = missingPromptIds(prompts);
  const ordered = [...prompts].sort((a, b) => a.order - b.order);

  const expectedIndex = formatLegacyIndex(ordered);
  const expectedController = `${formatController(ordered)}\n`;
  const actualIndex = await exists(paths.file) ? await readFile(paths.file, 'utf8') : null;
  const actualController = await exists(paths.controller) ? await readFile(paths.controller, 'utf8') : null;

  const individualChecks = [];
  for (const entry of ordered) {
    const number = padImageNumber(entry.order);
    const filePath = path.join(paths.individualPromptsDirectory, `Bild ${number}.txt`);
    const expected = `${formatIndividualPrompt(entry)}\n`;
    const actual = await exists(filePath) ? await readFile(filePath, 'utf8') : null;
    individualChecks.push({ number, filePath, present: actual !== null, current: actual === expected });
  }

  const current = actualIndex === expectedIndex && actualController === expectedController && individualChecks.every((item) => item.current);

  return {
    passed: missingIds.length === 0 && current,
    outputFile: paths.file,
    controllerFile: paths.controller,
    sceneCount: new Set(prompts.filter((entry) => entry.kind === 'scene').map((entry) => entry.sceneId)).size,
    plannedImageCount: prompts.filter((entry) => entry.kind === 'scene').length,
    totalPromptCount: prompts.length,
    coverIncluded: prompts.some((entry) => entry.kind === 'cover' && !entry.missing),
    missingPromptIds: missingIds,
    missingSceneIds: prompts.filter((entry) => entry.kind === 'scene' && entry.missing).map((entry) => entry.sceneId),
    filePresent: actualIndex !== null,
    controllerPresent: actualController !== null,
    individualPromptFiles: individualChecks,
    current,
    message: missingIds.length > 0
      ? `Bildprompts fehlen für: ${missingIds.join(', ')}.`
      : !actualController
        ? `Google-Flow-Controller fehlt: ${normalizedRelativePath(paths.controller)}.`
        : individualChecks.some((item) => !item.present)
          ? 'Mindestens eine serielle Einzelprompt-Datei fehlt.'
          : !current
            ? 'Controller, Index oder Einzelprompt-Dateien sind veraltet.'
            : 'Controller und serielle Einzelprompt-Dateien sind aktuell; die Visual-Prompts werden wortgetreu im bewährten alten Aufbau exportiert.'
  };
}
