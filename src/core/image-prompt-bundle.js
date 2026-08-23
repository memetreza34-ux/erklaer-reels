import { access, mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { flattenSceneImagePhases } from '../shared/visual-moments.js';

const BUNDLE_DIRECTORY = 'all-image-prompts';
const BUNDLE_FILE = 'all-image-prompts.txt';
const CONTROLLER_FILE = 'google-flow-controller.txt';
const INDIVIDUAL_DIRECTORY = 'individual-prompts';
const DEFAULT_VISUAL_STYLE_ID = 'round-country-characters';

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

function individualPromptFileName(order) {
  return `Bild ${padImageNumber(order)}.txt`;
}

export function getImagePromptBundlePaths(reelDirectory) {
  const directory = path.join(reelDirectory, BUNDLE_DIRECTORY);
  const promptDirectory = path.join(directory, INDIVIDUAL_DIRECTORY);
  return {
    directory,
    file: path.join(directory, BUNDLE_FILE),
    controller: path.join(directory, CONTROLLER_FILE),
    promptDirectory,
    readme: path.join(directory, 'README.md')
  };
}

export async function ensureImagePromptBundleDirectory(reelDirectory) {
  const paths = getImagePromptBundlePaths(reelDirectory);
  await mkdir(paths.promptDirectory, { recursive: true });

  const readme = `# Google-Flow-Bildprompts\n\nDie frühere Mega-Prompt-Strategie ist deaktiviert. Google Flow darf immer nur **einen einzigen Bildprompt gleichzeitig** erhalten.\n\nAusgabe:\n\n- \`${CONTROLLER_FILE}\` = Reihenfolge und Steuerlogik für einen Agenten mit Repo-Zugriff\n- \`${BUNDLE_FILE}\` = Manifest/Kompatibilitätsdatei; enthält keine vollständigen Visual-Prompts\n- \`${INDIVIDUAL_DIRECTORY}/Bild 00.txt\`, \`Bild 01.txt\`, ... = jeweils genau ein echter Visual-Prompt\n\nVerbindlicher Ablauf:\n\n1. genau eine Einzelprompt-Datei öffnen\n2. ausschließlich deren Inhalt an Google Flow geben\n3. genau ein Bild erzeugen\n4. vollständig warten und Ergebnis prüfen\n5. extern korrekt umbenennen\n6. erst danach die nächste Einzelprompt-Datei öffnen\n\nKeine Batch-, Queue-, Parallel-, Storyboard- oder Kontaktbogen-Generierung.\n\nFür neue Reels ist die Kugel-Welt \`round-country-characters\` die einzige aktive Bildwelt. Alle anthropomorphen Hauptfiguren sind perfekt runde Kugeln.\n\nErzeugen oder aktualisieren:\n\n\`\`\`bash\nnpm run export:prompts -- --dir "${normalizedRelativePath(reelDirectory)}" --strict\n\`\`\`\n`;

  await writeFile(paths.readme, readme, 'utf8');

  if (!(await exists(paths.file))) {
    await writeFile(paths.file, 'Manifest wird durch export:prompts erzeugt. Nicht als Mega-Prompt an Google Flow senden.\n', 'utf8');
  }
  if (!(await exists(paths.controller))) {
    await writeFile(paths.controller, 'Controller wird durch export:prompts erzeugt.\n', 'utf8');
  }

  return paths;
}

export async function collectImagePrompts(reelDirectory) {
  const sceneIndexPath = path.join(reelDirectory, 'scenes', 'scene-index.json');
  if (!(await exists(sceneIndexPath))) {
    throw new Error('scenes/scene-index.json wurde nicht gefunden.');
  }

  const scenes = await readJson(sceneIndexPath);
  if (!Array.isArray(scenes) || scenes.length === 0) {
    throw new Error('scenes/scene-index.json enthält keine Szenen.');
  }

  const reel = await readJsonIfExists(path.join(reelDirectory, 'reel.json'), {});
  const cover = await readJsonIfExists(path.join(reelDirectory, 'cover', 'cover.json'), {});
  const visualStyleId = String(reel.visualStyleId || DEFAULT_VISUAL_STYLE_ID).trim();

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
    missing: !coverPrompt
  }];

  const phases = flattenSceneImagePhases(scenes);
  for (const phase of phases) {
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
      missing: !prompt
    });
  }

  return prompts.sort((a, b) => a.order - b.order);
}

function sceneLabel(entry) {
  if (entry.kind === 'cover') return 'cover';
  return `scene-${entry.sceneOrder}-phase-${entry.phaseOrder}`;
}

function sanitizePromptBody(value) {
  return String(value ?? '')
    .split(/\r?\n/)
    .filter((line) => !/^\s*(?:\[\[WORKFLOW_METADATA|BILD\s*\d+\s*[–—-]|DATEINAME\s*:|ZIEL\s*:|GOOGLE FLOW\b|WORKFLOW CONTROL\b|ABSCHLUSS\b)/i.test(line))
    .join('\n')
    .replace(/\bMatch\s+Bild\s*00(?:\.png)?\s+exactly\.?/gi, 'Match the established master visual style exactly.')
    .replace(/\bBild\s*00(?:\.png)?\b/gi, 'the established master-style reference')
    .replace(/\[\[WORKFLOW_METADATA[^\]]*\]\]/gi, '')
    .trim();
}

function formatVisibleTextRule(entry) {
  const allowed = String(entry.allowedVisibleText ?? '').trim();
  if (!allowed) {
    return 'Do not place any readable text, letters, numbers, labels, captions, filenames or interface words inside the image.';
  }

  return `The only readable text allowed anywhere inside the image is exactly: "${allowed}". Do not add any other letters, numbers, labels, captions, filenames or interface words.`;
}

function formatBallWorldRule(entry) {
  if (entry.visualStyleId !== DEFAULT_VISUAL_STYLE_ID) return '';

  return [
    'Use the universal mature 2D editorial Kugel-Welt.',
    'Every anthropomorphic main character must be a complete perfectly round circular ball/sphere character with simple white eyes and at most tiny arms or legs.',
    'For country characters, wrap the simplified recognizable flag pattern across the perfectly round sphere.',
    'For non-country roles or concepts, use a neutral perfectly round sphere with a simple color or symbol motif instead of a normal human.',
    'Never use a country outline, map silhouette, territorial polygon, continent shape or irregular geographic shape as a character body or face.',
    'Never use a normal human head, torso or full human figure as the main character.',
    'Map outlines and territorial silhouettes may appear only as faceless background/support geography.'
  ].join(' ');
}

export function formatIndividualImagePrompt(entry) {
  const body = sanitizePromptBody(entry.prompt || '[BILDPROMPT FEHLT]');
  const worldRule = formatBallWorldRule(entry);

  return [
    'Create exactly one vertical 9:16 image from this request.',
    'Do not generate, queue, preload, storyboard, batch, collage, contact-sheet or combine any additional images. Finish only this one image.',
    'Treat every instruction sentence as non-visual direction; never copy workflow or instruction wording into the artwork.',
    formatVisibleTextRule(entry),
    worldRule,
    body
  ].filter(Boolean).join('\n\n').trim() + '\n';
}

export function formatImageNumberingContract(prompts) {
  const lines = [
    'SERIAL FILE ORDER',
    '',
    'Open exactly one file at a time. Never send more than one individual prompt to Google Flow at once.'
  ];

  for (const entry of prompts) {
    const fileName = individualPromptFileName(entry.order);
    lines.push(`- ${fileName} -> ${sceneLabel(entry)}`);
  }

  lines.push(
    '',
    'After each image is fully finished and visually checked, rename the generated image externally to the matching `Bild XX.png` filename, then continue with the next text file.',
    'The text filename and image filename are workflow metadata only and must never appear inside the generated image.'
  );

  return lines.join('\n');
}

function formatFlowExecutionContract(prompts) {
  const lastNumber = padImageNumber(prompts.at(-1)?.order ?? 0);
  return [
    'GOOGLE FLOW SERIAL CONTROLLER — QUALITY MODE',
    '',
    'DO NOT use this controller text itself as an image-generation prompt.',
    'DO NOT paste all visual prompts into one Flow message.',
    'The visual prompts live in `individual-prompts/` and must be opened one at a time.',
    '',
    'For every step:',
    '1. Open exactly one `individual-prompts/Bild XX.txt` file.',
    '2. Send only that file content to Google Flow.',
    '3. Start exactly one image generation.',
    '4. Wait until it is completely finished.',
    '5. Check image quality, round-ball character shape and visible-text whitelist.',
    '6. Rename the completed image externally to the matching `Bild XX.png`.',
    '7. Only then open the next prompt file.',
    '',
    'Never batch, queue, preload or start multiple images in parallel.',
    'Never ask Google Flow to interpret multiple prompt files in one message.',
    'Asset 00 establishes the visual style master. Later individual prompts must visually match that completed style reference.',
    '',
    `Continue until Bild ${lastNumber}.txt has been completed.`
  ].join('\n');
}

export function formatImagePromptBundle(prompts) {
  return [
    'IMAGE PROMPT MANIFEST — NOT A GOOGLE FLOW IMAGE PROMPT',
    '',
    'This file intentionally contains NO full visual prompts.',
    'The old all-in-one Mega-Prompt workflow is disabled because it can trigger parallel generation and lower image quality.',
    'Use `google-flow-controller.txt` for sequence control and `individual-prompts/Bild XX.txt` one at a time for actual generation.',
    '',
    formatImageNumberingContract(prompts),
    ''
  ].join('\n');
}

function missingPromptIds(prompts) {
  return prompts.filter((entry) => entry.missing).map((entry) => entry.promptId);
}

async function clearGeneratedPromptFiles(promptDirectory) {
  if (!(await exists(promptDirectory))) return;
  const entries = await readdir(promptDirectory, { withFileTypes: true });
  await Promise.all(entries
    .filter((entry) => entry.isFile() && /^Bild \d+\.txt$/i.test(entry.name))
    .map((entry) => unlink(path.join(promptDirectory, entry.name))));
}

async function writeIndividualPromptFiles(paths, prompts) {
  await clearGeneratedPromptFiles(paths.promptDirectory);
  const written = [];

  for (const entry of prompts) {
    const fileName = individualPromptFileName(entry.order);
    const filePath = path.join(paths.promptDirectory, fileName);
    await writeFile(filePath, formatIndividualImagePrompt(entry), 'utf8');
    written.push(filePath);
  }

  return written;
}

export async function buildImagePromptBundle(reelDirectory, { strict = false } = {}) {
  const paths = await ensureImagePromptBundleDirectory(reelDirectory);
  const prompts = await collectImagePrompts(reelDirectory);
  const missingIds = missingPromptIds(prompts);

  if (strict && missingIds.length > 0) {
    throw new Error(`Bildprompts fehlen für: ${missingIds.join(', ')}.`);
  }

  const content = formatImagePromptBundle(prompts);
  const controller = formatFlowExecutionContract(prompts) + '\n\n' + formatImageNumberingContract(prompts) + '\n';
  const promptFiles = await writeIndividualPromptFiles(paths, prompts);

  await writeFile(paths.file, content, 'utf8');
  await writeFile(paths.controller, controller, 'utf8');

  const statusPath = path.join(reelDirectory, 'status.json');
  if (await exists(statusPath)) {
    const status = await readJson(statusPath);
    status.imagePromptBundle = missingIds.length === 0 ? 'ready-serial-individual-files' : 'incomplete';
    status.imagePromptDelivery = 'one-file-per-image';
    status.googleFlowController = missingIds.length === 0 ? 'ready' : 'incomplete';
    status.plannedImageCount = prompts.filter((entry) => entry.kind === 'scene').length;
    await writeFile(statusPath, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
  }

  return {
    outputFile: paths.file,
    controllerFile: paths.controller,
    promptDirectory: paths.promptDirectory,
    promptFiles,
    sceneCount: new Set(prompts.filter((entry) => entry.kind === 'scene').map((entry) => entry.sceneId)).size,
    plannedImageCount: prompts.filter((entry) => entry.kind === 'scene').length,
    totalPromptCount: prompts.length,
    coverIncluded: prompts.some((entry) => entry.kind === 'cover' && !entry.missing),
    missingPromptIds: missingIds,
    missingSceneIds: prompts
      .filter((entry) => entry.kind === 'scene' && entry.missing)
      .map((entry) => entry.sceneId),
    complete: missingIds.length === 0,
    content
  };
}

export async function validateImagePromptBundle(reelDirectory) {
  const paths = getImagePromptBundlePaths(reelDirectory);
  const prompts = await collectImagePrompts(reelDirectory);
  const missingIds = missingPromptIds(prompts);
  const expectedManifest = formatImagePromptBundle(prompts);
  const expectedController = formatFlowExecutionContract(prompts) + '\n\n' + formatImageNumberingContract(prompts) + '\n';

  const actualManifest = await exists(paths.file) ? await readFile(paths.file, 'utf8') : null;
  const actualController = await exists(paths.controller) ? await readFile(paths.controller, 'utf8') : null;
  const manifestCurrent = actualManifest === expectedManifest;
  const controllerCurrent = actualController === expectedController;

  const individualChecks = [];
  for (const entry of prompts) {
    const filePath = path.join(paths.promptDirectory, individualPromptFileName(entry.order));
    const actual = await exists(filePath) ? await readFile(filePath, 'utf8') : null;
    const expected = formatIndividualImagePrompt(entry);
    individualChecks.push({
      filePath,
      present: actual !== null,
      current: actual === expected
    });
  }

  const individualPromptsCurrent = individualChecks.every((check) => check.present && check.current);
  const current = manifestCurrent && controllerCurrent && individualPromptsCurrent;

  return {
    passed: missingIds.length === 0 && current,
    outputFile: paths.file,
    controllerFile: paths.controller,
    promptDirectory: paths.promptDirectory,
    sceneCount: new Set(prompts.filter((entry) => entry.kind === 'scene').map((entry) => entry.sceneId)).size,
    plannedImageCount: prompts.filter((entry) => entry.kind === 'scene').length,
    totalPromptCount: prompts.length,
    coverIncluded: prompts.some((entry) => entry.kind === 'cover' && !entry.missing),
    missingPromptIds: missingIds,
    missingSceneIds: prompts
      .filter((entry) => entry.kind === 'scene' && entry.missing)
      .map((entry) => entry.sceneId),
    filePresent: actualManifest !== null,
    controllerPresent: actualController !== null,
    manifestCurrent,
    controllerCurrent,
    individualPromptsCurrent,
    individualChecks,
    current,
    message: missingIds.length > 0
      ? `Bildprompts fehlen für: ${missingIds.join(', ')}.`
      : !actualManifest
        ? `Manifest fehlt: ${normalizedRelativePath(paths.file)}.`
        : !actualController
          ? `Google-Flow-Controller fehlt: ${normalizedRelativePath(paths.controller)}.`
          : !individualPromptsCurrent
            ? 'Mindestens eine Einzelprompt-Datei fehlt oder ist veraltet.'
            : !manifestCurrent || !controllerCurrent
              ? 'Manifest oder Controller ist veraltet.'
              : 'Serieller Einzelprompt-Export ist vollständig und aktuell.'
  };
}
