import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { flattenSceneImagePhases } from '../shared/visual-moments.js';

const BUNDLE_DIRECTORY = 'all-image-prompts';
const BUNDLE_FILE = 'all-image-prompts.txt';

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
  return {
    directory,
    file: path.join(directory, BUNDLE_FILE),
    readme: path.join(directory, 'README.md')
  };
}

export async function ensureImagePromptBundleDirectory(reelDirectory) {
  const paths = getImagePromptBundlePaths(reelDirectory);
  await mkdir(paths.directory, { recursive: true });

  const readme = `# Alle Bildprompts\n\n\`${BUNDLE_FILE}\` ist ein einziger Google-Flow-Gesamtauftrag. Bild 00 ist immer das Cover. Danach folgen alle geplanten Bildphasen fortlaufend als Bild 01, Bild 02, Bild 03 usw.\n\n**Wichtig:** Die Bildnummer ist die globale Bildreihenfolge und nicht automatisch die Szenennummer. Eine narrative Szene kann ein, zwei oder selten drei Bilder besitzen.\n\n**Noch wichtiger:** Bildnummern, Dateinamen, COVER-/SZENE-/BILDPHASE-Labels und sonstige Workflow-Metadaten sind reine Steuerinformationen und dürfen niemals im generierten Bild sichtbar sein. Pro Bild gilt eine harte Text-Whitelist: nur der ausdrücklich erlaubte deutsche Bildtext; bei leerem Bildtext gar kein lesbarer Text.\n\nFür \`round-country-characters\` gilt zusätzlich: jede anthropomorphe Länderfigur ist eine vollständig runde Kugel mit Flaggenmuster. Länderumrisse/Kartenformen dürfen nie selbst Gesicht, Augen oder Körper einer Figur sein.\n\nDie Bildanzahl wird für jedes Reel individuell geplant. Google Flow arbeitet trotzdem streng seriell: genau ein Bild erzeugen → vollständig warten → sofort korrekt umbenennen → prüfen → automatisch das nächste Bild starten. Kein Parallelisieren, keine Queue und kein weiteres Go zwischen den Bildern.\n\nBild 00 bleibt die verbindliche Stilvorlage für das gesamte Reel.\n\nErzeugen oder aktualisieren:\n\n\`\`\`bash\nnpm run export:prompts -- --dir "${normalizedRelativePath(reelDirectory)}" --strict\n\`\`\`\n`;
  await writeFile(paths.readme, readme, 'utf8');

  if (!(await exists(paths.file))) {
    await writeFile(paths.file, 'Die Bildprompt-Sammeldatei wird nach Fertigstellung aller Bildphasen erzeugt.\n', 'utf8');
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
  const visualStyleId = String(reel.visualStyleId ?? '').trim();

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

  return prompts;
}

function sceneLabel(entry) {
  if (entry.phaseOrder === 1) return `scene-${entry.sceneOrder}-phase-1`;
  return `scene-${entry.sceneOrder}-phase-${entry.phaseOrder}`;
}

function formatVisibleTextGuard(entry) {
  const allowed = String(entry.allowedVisibleText ?? '').trim();
  const forbidden = 'Never render workflow metadata such as image numbers, filenames, COVER, SZENE/SCENE, BILDPHASE/IMAGE PHASE, DATEINAME, GOOGLE FLOW, PROMPT, STYLE-REFERENZ/STYLE REFERENCE, ZIEL/TARGET, technical ids or file extensions.';

  if (!allowed) {
    return [
      'VISIBLE-TEXT FIREWALL — NON-NEGOTIABLE:',
      'Generate ZERO readable text inside the image.',
      forbidden
    ].join('\n');
  }

  return [
    'VISIBLE-TEXT FIREWALL — NON-NEGOTIABLE:',
    `The ONLY readable text allowed anywhere inside the image is exactly: "${allowed}"`,
    'Do not add a title, header, label, caption, filename or any other letters/numbers beyond that exact phrase.',
    forbidden
  ].join('\n');
}

function formatVisualWorldGuard(entry) {
  if (entry.visualStyleId !== 'round-country-characters') return '';

  return [
    'ROUND-COUNTRY-CHARACTER BODY RULE — NON-NEGOTIABLE:',
    'Every anthropomorphic country character must be a complete perfectly round circular country ball/sphere with the simplified flag pattern wrapped across the round body and simple white eyes.',
    'Never use a country outline, map silhouette, territorial polygon, continent shape or irregular geographic shape as the body, face or character.',
    'Never put eyes, mouth, arms or legs on a map-shaped country or continent.',
    'Map outlines and territorial silhouettes may appear only as FACELESS background/support geography.'
  ].join('\n');
}

export function formatImageNumberingContract(prompts) {
  const visuals = prompts
    .filter((entry) => entry.kind === 'scene')
    .sort((a, b) => a.order - b.order);
  const lastNumber = padImageNumber(visuals.at(-1)?.order ?? 0);

  const lines = [
    'WORKFLOW COMPLETION CHECK — NOT VISUAL CONTENT',
    '',
    'Only after the final image has been generated, renamed and verified, check the complete file sequence.',
    'These filenames and mappings are workflow metadata only and must never be visible inside any generated image.',
    '',
    '- asset 00 -> filename `Bild 00.png` -> cover'
  ];

  for (const visual of visuals) {
    const number = padImageNumber(visual.order);
    lines.push(`- asset ${number} -> filename \`Bild ${number}.png\` -> ${sceneLabel(visual)}`);
  }

  lines.push(
    '',
    `Verify assets 00 through ${lastNumber}: no missing, duplicate or reordered filename.`,
    'The asset number describes global image order, not narrative scene number.',
    'Then place all completed images together in `00-bildprompts/00-ALLE-BILDER-HIER-REIN/`.'
  );

  return lines.join('\n');
}

function formatFlowExecutionContract(prompts) {
  const visuals = prompts
    .filter((entry) => entry.kind === 'scene')
    .sort((a, b) => a.order - b.order);
  const lastNumber = padImageNumber(visuals.at(-1)?.order ?? 0);
  const total = visuals.length + 1;

  return [
    'WORKFLOW CONTROL — NEVER RENDER WORKFLOW TEXT INTO THE IMAGE',
    '',
    `This file contains ${total} sequential image tasks, assets 00 through ${lastNumber}.`,
    'Everything describing asset numbers, filenames, cover/scene/phase roles or workflow steps is CONTROL METADATA ONLY.',
    'For each task, obey the VISIBLE-TEXT FIREWALL inside that task. That whitelist overrides every workflow word around it.',
    'At any moment exactly ONE image generation may be active.',
    'After each image is fully complete: rename the file exactly, verify the filename, then automatically start the next task.',
    'Do not wait for Go, Weiter, OK or another user message.',
    'No batch processing, no queue, no preloading and no parallel generation.',
    '',
    'Asset 00 is the cover and binding visual style reference. Later tasks match its visual style but never copy its visible headline unless their own whitelist explicitly allows the same text.',
    '',
    'Narrative scenes and image tasks are not 1:1 coupled; one scene may contain multiple image phases.',
    '',
    `Continue strictly one task at a time through asset ${lastNumber}.`
  ].join('\n');
}

function formatDirectGenerationInstruction(number, previousNumber, isCover, isLast) {
  const gate = previousNumber === null
    ? 'Start this first image task immediately after the overall prompt is submitted.'
    : `Start this task automatically only after workflow asset ${previousNumber} is fully finished, renamed and verified.`;

  const styleInstruction = isCover
    ? 'This task establishes the visual style master for all later images.'
    : 'Match the visual style of the completed cover asset exactly; do not copy the cover headline unless explicitly whitelisted below.';

  const releaseInstruction = isLast
    ? 'After this task is renamed and verified, run the final filename-sequence check.'
    : 'After renaming and verification, immediately continue to the next task without waiting for user input.';

  return [
    gate,
    styleInstruction,
    'Generate exactly ONE image for this task and do not start another image concurrently.',
    `After completion, rename the output file to \`Bild ${number}.png\`. The filename is workflow metadata and must never appear inside the image.`,
    releaseInstruction
  ].join('\n');
}

function formatDirectPromptSection(entry, index, prompts) {
  const body = entry.prompt || '[BILDPROMPT FEHLT]';
  const number = padImageNumber(entry.order);
  const previousNumber = entry.order === 0 ? null : padImageNumber(entry.order - 1);
  const isCover = entry.kind === 'cover';
  const isLast = index === prompts.length - 1;
  const metadata = isCover
    ? `[[WORKFLOW_METADATA asset=${number}; role=cover; filename="Bild ${number}.png"]]`
    : `[[WORKFLOW_METADATA asset=${number}; role=${sceneLabel(entry)}; target=${entry.targetId}; filename="Bild ${number}.png"]]`;
  const worldGuard = formatVisualWorldGuard(entry);

  return [
    metadata,
    'WORKFLOW METADATA IS NEVER VISUAL CONTENT.',
    formatDirectGenerationInstruction(number, previousNumber, isCover, isLast),
    '',
    formatVisibleTextGuard(entry),
    worldGuard ? `\n${worldGuard}` : '',
    '',
    'VISUAL PROMPT:',
    body
  ].filter(Boolean).join('\n');
}

export function formatImagePromptBundle(prompts) {
  const sections = prompts.map((entry, index) => formatDirectPromptSection(entry, index, prompts));
  const executionContract = formatFlowExecutionContract(prompts);
  const numberingContract = formatImageNumberingContract(prompts);
  return `GOOGLE FLOW CONTROL FILE — WORKFLOW TEXT MUST NEVER APPEAR IN GENERATED IMAGES\n\n${executionContract}\n\n\n${sections.join('\n\n\n')}\n\n\n${numberingContract}\n`;
}

function missingPromptIds(prompts) {
  return prompts.filter((entry) => entry.missing).map((entry) => entry.promptId);
}

export async function buildImagePromptBundle(reelDirectory, { strict = false } = {}) {
  const paths = await ensureImagePromptBundleDirectory(reelDirectory);
  const prompts = await collectImagePrompts(reelDirectory);
  const missingIds = missingPromptIds(prompts);

  if (strict && missingIds.length > 0) {
    throw new Error(`Bildprompts fehlen für: ${missingIds.join(', ')}.`);
  }

  const content = formatImagePromptBundle(prompts);
  await writeFile(paths.file, content, 'utf8');

  const statusPath = path.join(reelDirectory, 'status.json');
  if (await exists(statusPath)) {
    const status = await readJson(statusPath);
    status.imagePromptBundle = missingIds.length === 0 ? 'ready' : 'incomplete';
    status.plannedImageCount = prompts.filter((entry) => entry.kind === 'scene').length;
    await writeFile(statusPath, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
  }

  return {
    outputFile: paths.file,
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
  const expected = formatImagePromptBundle(prompts);
  const actual = await exists(paths.file) ? await readFile(paths.file, 'utf8') : null;
  const current = actual === expected;

  return {
    passed: missingIds.length === 0 && current,
    outputFile: paths.file,
    sceneCount: new Set(prompts.filter((entry) => entry.kind === 'scene').map((entry) => entry.sceneId)).size,
    plannedImageCount: prompts.filter((entry) => entry.kind === 'scene').length,
    totalPromptCount: prompts.length,
    coverIncluded: prompts.some((entry) => entry.kind === 'cover' && !entry.missing),
    missingPromptIds: missingIds,
    missingSceneIds: prompts
      .filter((entry) => entry.kind === 'scene' && entry.missing)
      .map((entry) => entry.sceneId),
    filePresent: actual !== null,
    current,
    message: missingIds.length > 0
      ? `Bildprompts fehlen für: ${missingIds.join(', ')}.`
      : !actual
        ? `Sammeldatei fehlt: ${normalizedRelativePath(paths.file)}.`
        : !current
          ? 'Die Bildprompt-Sammeldatei ist veraltet.'
          : 'Die Bildprompt-Sammeldatei enthält alle individuell geplanten Bildphasen in fortlaufender Google-Flow-Reihenfolge mit Text-Whitelist und Bildwelt-Guard.'
  };
}
