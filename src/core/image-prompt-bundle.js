import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  FIXED_VISUAL_STYLE_ID,
  FIXED_VISUAL_WORLD_LABEL,
  FIXED_VISUAL_WORLD_PROMPT
} from '../shared/fixed-visual-world.js';
import { flattenSceneImagePhases } from '../shared/visual-moments.js';

const USER_PROMPTS_DIRECTORY = '00-bildprompts';
const USER_BUNDLE_FILE = '99-alle-bildprompts.txt';
const LEGACY_BUNDLE_DIRECTORY = 'all-image-prompts';
const FLOW_OUTPUT_FOLDER = '00-FERTIGE-REEL-BILDER';

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
  const userDirectory = path.join(reelDirectory, USER_PROMPTS_DIRECTORY);
  const userFile = path.join(userDirectory, USER_BUNDLE_FILE);
  return {
    directory: userDirectory,
    file: userFile,
    userDirectory,
    userFile,
    readme: path.join(userDirectory, 'README.md'),
    userReadme: path.join(userDirectory, 'README.md'),
    legacyDirectory: path.join(reelDirectory, LEGACY_BUNDLE_DIRECTORY)
  };
}

export async function ensureImagePromptBundleDirectory(reelDirectory) {
  const paths = getImagePromptBundlePaths(reelDirectory);
  await mkdir(paths.userDirectory, { recursive: true });
  await rm(paths.legacyDirectory, { recursive: true, force: true });

  const readme = `# Bildprompts\n\nFür Google Flow gibt es genau **eine** verbindliche Masterdatei:\n\n\`${USER_BUNDLE_FILE}\`\n\nEs gibt keine zweite Spiegelkopie unter \`${LEGACY_BUNDLE_DIRECTORY}/\`. Alte technische Kopien werden beim Export automatisch entfernt.\n\nFeste Reel-Bildwelt: **${FIXED_VISUAL_WORLD_LABEL}**. Wenn Akteure vorkommen, sind es runde Kugelfiguren mit einfachen weißen Augen und ohne separaten Kopf; Flaggen nur bei echter geografischer Relevanz, sonst neutrale Kugeln. Eine Kugelfigur ist nicht in jedem Bild Pflicht, wenn ein Gegenstand, Mechanismus, eine Karte oder eine Umgebung die Aussage klarer erklärt. Menschliche Köpfe auf Kugelkörpern, humanoide Cartoonmenschen und Stick-Figuren sind nicht Teil der aktiven Reel-Bildwelt.\n\nPrompts sind Englisch, sichtbarer Bildtext ist Deutsch. Vor Bild 00 legt Google Flow den gemeinsamen Ordner \`${FLOW_OUTPUT_FOLDER}\` an. Danach immer genau ein Bild erzeugen, vollständig warten, prüfen, umbenennen, in diesen Ordner legen und erst dann das nächste starten. Keine Batch- oder Parallelgenerierung.\n\nAktualisieren:\n\n\`\`\`bash\nnpm run export:prompts -- --dir "${normalizedRelativePath(reelDirectory)}" --strict\n\`\`\`\n`;

  await writeFile(paths.userReadme, readme, 'utf8');
  return paths;
}

export async function collectImagePrompts(reelDirectory) {
  const sceneIndexPath = path.join(reelDirectory, 'scenes', 'scene-index.json');
  if (!(await exists(sceneIndexPath))) throw new Error('scenes/scene-index.json wurde nicht gefunden.');

  const scenes = await readJson(sceneIndexPath);
  if (!Array.isArray(scenes) || scenes.length === 0) throw new Error('scenes/scene-index.json enthält keine Szenen.');

  const cover = await readJsonIfExists(path.join(reelDirectory, 'cover', 'cover.json'), {});
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
      missing: !prompt
    });
  }

  return prompts;
}

function visibleTextRule(entry) {
  if (entry.allowedVisibleText) {
    return `Visible text rule for this image: the ONLY readable text allowed is exactly the German phrase "${entry.allowedVisibleText}". Keep the spelling exact. No other readable text and no English visible text.`;
  }
  return 'Visible text rule for this image: no readable text anywhere in the image. No English, pseudo-text, labels, logos or watermark.';
}

function formatStyledGenerationPrompt(entry) {
  const specificPrompt = entry.prompt || '[BILDPROMPT FEHLT]';
  return [
    'FIXED VISUAL STYLE FOR THIS IMAGE — MANDATORY:',
    FIXED_VISUAL_WORLD_PROMPT,
    'If the specific image content below contains style wording that conflicts with this fixed visual world, ignore only the conflicting style wording. Preserve its factual subject, composition, action and requested German text.',
    visibleTextRule(entry),
    '',
    'SPECIFIC IMAGE CONTENT:',
    specificPrompt
  ].join('\n');
}

function imageRole(entry) {
  if (entry.kind === 'cover') return 'Cover';
  if (Number(entry.phaseOrder ?? 1) > 1) return `Szene ${entry.sceneOrder}, Bildphase ${entry.phaseOrder}`;
  return `Szene ${entry.sceneOrder}`;
}

function imageHeading(entry) {
  const number = padImageNumber(entry.order);
  if (entry.kind === 'cover') return `BILD ${number} – COVER`;
  if (Number(entry.phaseOrder ?? 1) > 1) return `BILD ${number} – SZENE ${entry.sceneOrder} – BILDPHASE ${entry.phaseOrder}`;
  return `BILD ${number} – SZENE ${entry.sceneOrder}`;
}

function formatCompleteSerialBundle(prompts) {
  const ordered = [...prompts].sort((a, b) => a.order - b.order);
  const lastEntry = ordered.at(-1);
  const last = padImageNumber(lastEntry?.order ?? 0);
  const total = ordered.length;
  const sceneCount = new Set(ordered.filter((entry) => entry.kind === 'scene').map((entry) => entry.sceneId)).size;

  const lines = [
    'GOOGLE FLOW – KOMPLETTER SERIELLER BILDLAUF',
    '',
    'AUFTRAG',
    `Erzeuge für dieses Reel genau ${total} Bilder: Bild 00 als Cover und danach Bild 01 bis Bild ${last} für die geplanten Bildmomente der ${sceneCount} Szenen.`,
    '',
    'WICHTIG – DIESE EINE NACHRICHT IST DIE KOMPLETTE FREIGABE',
    `Sobald dieser Gesamtprompt einmal abgesendet wurde, arbeitest du selbstständig bis Bild ${last} fertig ist. Frage NICHT nach Go, Weiter, OK, Bestätigung oder Erlaubnis.`,
    'Die Nachricht enthält alle Prompts, muss aber streng als Zustandsmaschine abgearbeitet werden: immer nur genau ein aktuell freigegebenes Bild.',
    '',
    'SCHRITT 0 – ZUERST EINEN GEMEINSAMEN AUSGABEORDNER ANLEGEN',
    `Bevor du Bild 00 generierst, erstelle genau EINEN Ordner bzw. eine Medien-Sammlung mit dem Namen "${FLOW_OUTPUT_FOLDER}".`,
    `Alle final akzeptierten Bilder dieses Reels werden ausschließlich in "${FLOW_OUTPUT_FOLDER}" gesammelt.`,
    `Wenn der Ordner nicht angelegt werden kann oder ein fertiges Bild nicht umbenannt bzw. dort abgelegt werden kann, STOPPE den Lauf und erzeuge keine späteren Bilder.`,
    '',
    'STRENG SERIELL – NIE PARALLEL',
    'Zu jedem Zeitpunkt darf genau EINE Bildgenerierung aktiv, ausstehend, queued oder in Bearbeitung sein.',
    'Für jedes Bild zwingend:',
    '1. Nimm die nächste noch nicht abgeschlossene Bildnummer. Starte bei Bild 00.',
    '2. Verwende NUR den Promptabschnitt dieser Bildnummer.',
    '3. Starte genau EINEN Bildgenerator-Aufruf.',
    '4. Keine Serienfunktion, kein Multi-Prompt-Aufruf, kein Batch, keine Galerie und keine Parallelgenerierung.',
    '5. Warte vollständig, bis dieses eine Bild sichtbar fertig ist.',
    '6. Prüfe es gegen den aktuellen Prompt und die feste Reel-Bildwelt.',
    '7. Bei falschem Inhalt oder Stil erzeuge NUR dieses Bild neu.',
    '8. Benenne das akzeptierte Bild exakt in den vorgesehenen Dateinamen um.',
    `9. Lege es sofort in "${FLOW_OUTPUT_FOLDER}" und prüfe sichtbar die Ablage.`,
    '10. Erst danach ist das nächste Bild freigegeben.',
    '',
    `VERBINDLICHE EINE REEL-BILDWELT – ${FIXED_VISUAL_WORLD_LABEL.toUpperCase()}`,
    'Es gibt für dieses Reel keine zweite oder themenspezifische Bildwelt. Das Thema ändert nur den Inhalt, niemals die Formsprache.',
    '',
    'GLOBAL FIXED STYLE LOCK (ENGLISH — MANDATORY FOR EVERY IMAGE):',
    FIXED_VISUAL_WORLD_PROMPT,
    '',
    'DATEINAMEN'
  ];

  for (const entry of ordered) {
    const number = padImageNumber(entry.order);
    lines.push(`Bild ${number}.png = ${imageRole(entry)}`);
  }

  lines.push(
    '',
    'BILD 00',
    `Bild 00.png ist das Cover. Die globale Bildwelt ${FIXED_VISUAL_WORLD_LABEL} bleibt für alle folgenden Bilder identisch.`,
    '',
    'ARBEITSLABELS SIND NIEMALS BILDINHALT',
    'BILD-Nummern, COVER, SZENE, BILDPHASE, DATEINAME, Dateinamen und Workflow-Anweisungen dürfen niemals im Bild erscheinen.',
    '',
    'TEXTREGEL',
    'Nur der im jeweiligen Prompt ausdrücklich verlangte deutsche Text darf sichtbar erscheinen. Kein zusätzlicher englischer Text, keine Fantasiewörter, keine technischen Labels, Logos oder Wasserzeichen. Wenn kein sichtbarer Text verlangt wird, bleibt das Bild vollständig textfrei.',
    '',
    'ABSCHLUSSKONTROLLE',
    `Nach Bild ${last}: Prüfe "${FLOW_OUTPUT_FOLDER}". Der Ordner muss exakt ${total} finale Bilder enthalten: Bild 00.png bis Bild ${last}.png, ohne fehlende oder doppelte Nummern.`,
    'Erst danach ist der Auftrag abgeschlossen.',
    '',
    '────────────────────────────────────────'
  );

  for (const entry of ordered) {
    const number = padImageNumber(entry.order);
    lines.push(
      '',
      imageHeading(entry),
      `DATEINAME NACH FERTIGSTELLUNG: Bild ${number}.png`,
      `DANACH SOFORT IN ORDNER: ${FLOW_OUTPUT_FOLDER}`,
      `FREIGABEBEDINGUNG FÜR DAS NÄCHSTE BILD: Bild ${number}.png ist fertig, geprüft, exakt umbenannt und im Ordner bestätigt.`,
      formatStyledGenerationPrompt(entry)
    );
  }

  return `${lines.join('\n')}\n`;
}

function missingPromptIds(prompts) {
  return prompts.filter((entry) => entry.missing).map((entry) => entry.promptId);
}

export function formatImagePromptBundle(prompts) {
  return formatCompleteSerialBundle(prompts);
}

export async function buildImagePromptBundle(reelDirectory, { strict = false } = {}) {
  const paths = await ensureImagePromptBundleDirectory(reelDirectory);
  const prompts = await collectImagePrompts(reelDirectory);
  const missingIds = missingPromptIds(prompts);

  if (strict && missingIds.length > 0) throw new Error(`Bildprompts fehlen für: ${missingIds.join(', ')}.`);

  const ordered = [...prompts].sort((a, b) => a.order - b.order);
  const bundle = formatCompleteSerialBundle(ordered);
  await writeFile(paths.userFile, bundle, 'utf8');
  await rm(paths.legacyDirectory, { recursive: true, force: true });

  const statusPath = path.join(reelDirectory, 'status.json');
  if (await exists(statusPath)) {
    const status = await readJson(statusPath);
    status.imagePromptBundle = missingIds.length === 0 ? 'ready-single-canonical-serial-bundle-fixed-visual-world' : 'incomplete';
    status.googleFlowController = 'disabled-use-complete-bundle';
    status.imagePromptMode = 'single-canonical-complete-serial-bundle';
    status.visualWorld = `fixed-${FIXED_VISUAL_STYLE_ID}`;
    status.plannedImageCount = prompts.filter((entry) => entry.kind === 'scene').length;
    await writeFile(statusPath, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
  }

  return {
    outputFile: paths.userFile,
    technicalMirrorFile: null,
    controllerFile: null,
    individualPromptsDirectory: null,
    sceneCount: new Set(prompts.filter((entry) => entry.kind === 'scene').map((entry) => entry.sceneId)).size,
    plannedImageCount: prompts.filter((entry) => entry.kind === 'scene').length,
    totalPromptCount: prompts.length,
    coverIncluded: prompts.some((entry) => entry.kind === 'cover' && !entry.missing),
    missingPromptIds: missingIds,
    missingSceneIds: prompts.filter((entry) => entry.kind === 'scene' && entry.missing).map((entry) => entry.sceneId),
    complete: missingIds.length === 0,
    visualStyleId: FIXED_VISUAL_STYLE_ID,
    visualWorldLabel: FIXED_VISUAL_WORLD_LABEL,
    content: bundle
  };
}

export async function validateImagePromptBundle(reelDirectory) {
  const paths = getImagePromptBundlePaths(reelDirectory);
  const prompts = await collectImagePrompts(reelDirectory);
  const missingIds = missingPromptIds(prompts);
  const ordered = [...prompts].sort((a, b) => a.order - b.order);
  const expectedBundle = formatCompleteSerialBundle(ordered);
  const actualUser = await exists(paths.userFile) ? await readFile(paths.userFile, 'utf8') : null;
  const legacyMirrorPresent = await exists(paths.legacyDirectory);
  const current = actualUser === expectedBundle && !legacyMirrorPresent;

  return {
    passed: missingIds.length === 0 && current,
    outputFile: paths.userFile,
    technicalMirrorFile: null,
    sceneCount: new Set(prompts.filter((entry) => entry.kind === 'scene').map((entry) => entry.sceneId)).size,
    plannedImageCount: prompts.filter((entry) => entry.kind === 'scene').length,
    totalPromptCount: prompts.length,
    coverIncluded: prompts.some((entry) => entry.kind === 'cover' && !entry.missing),
    missingPromptIds: missingIds,
    missingSceneIds: prompts.filter((entry) => entry.kind === 'scene' && entry.missing).map((entry) => entry.sceneId),
    filePresent: actualUser !== null,
    technicalMirrorPresent: legacyMirrorPresent,
    controllerPresent: false,
    individualPromptFiles: [],
    visualStyleId: FIXED_VISUAL_STYLE_ID,
    visualWorldLabel: FIXED_VISUAL_WORLD_LABEL,
    current,
    message: missingIds.length > 0
      ? `Bildprompts fehlen für: ${missingIds.join(', ')}.`
      : legacyMirrorPresent
        ? `Legacy-Doppelordner ${LEGACY_BUNDLE_DIRECTORY}/ muss entfernt werden.`
        : !actualUser
          ? `Google-Flow-Masterprompt fehlt: ${normalizedRelativePath(paths.userFile)}.`
          : !current
            ? 'Der eine Google-Flow-Masterprompt ist veraltet.'
            : `Der eine serielle Google-Flow-Masterprompt ist aktuell und verwendet ${FIXED_VISUAL_WORLD_LABEL}.`
  };
}
