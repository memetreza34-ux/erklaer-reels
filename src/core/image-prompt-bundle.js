import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { flattenSceneImagePhases } from '../shared/visual-moments.js';

const BUNDLE_DIRECTORY = 'all-image-prompts';
const BUNDLE_FILE = 'all-image-prompts.txt';
const CONTROLLER_FILE = 'google-flow-controller.txt';
const INDIVIDUAL_PROMPTS_DIRECTORY = 'image-prompts';
const USER_PROMPTS_DIRECTORY = '00-bildprompts';
const USER_BUNDLE_FILE = '99-alle-bildprompts.txt';

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
  const userDirectory = path.join(reelDirectory, USER_PROMPTS_DIRECTORY);

  return {
    directory,
    file: path.join(directory, BUNDLE_FILE),
    controller: path.join(directory, CONTROLLER_FILE),
    individualPromptsDirectory,
    readme: path.join(directory, 'README.md'),
    userDirectory,
    userFile: path.join(userDirectory, USER_BUNDLE_FILE),
    userReadme: path.join(userDirectory, 'README.md')
  };
}

export async function ensureImagePromptBundleDirectory(reelDirectory) {
  const paths = getImagePromptBundlePaths(reelDirectory);
  await mkdir(paths.individualPromptsDirectory, { recursive: true });
  await mkdir(paths.userDirectory, { recursive: true });

  const readme = `# Google-Flow-Bildprompts\n\nDie **verbindliche Nutzerdatei** ist der komplette serielle Gesamtprompt:\n\n\`${USER_PROMPTS_DIRECTORY}/${USER_BUNDLE_FILE}\`\n\nAktuell ist im Repository **keine feste Bildwelt definiert**. Der Exporter fügt deshalb keine Countryball-, Figuren-, Farb-, Papier-, Editorial- oder Golden-Reference-Regeln hinzu. Ausschließlich die konkreten Cover- und Szenenprompts bestimmen den visuellen Inhalt. Historische Reel-Prompts sind keine aktive Stilvorgabe.\n\nWichtig: Trotz Gesamtprompt darf Google Flow niemals mehrere Bilder gleichzeitig starten. Exakt eine Bildgenerierung pro Agent-Schritt, vollständig warten, das Ergebnis gegen den aktuellen Prompt prüfen, umbenennen und erst danach das nächste Bild.\n\n\`${BUNDLE_DIRECTORY}/${BUNDLE_FILE}\` ist eine identische technische Kopie. Die Dateien unter \`${BUNDLE_DIRECTORY}/${INDIVIDUAL_PROMPTS_DIRECTORY}/\` bleiben nur als interne Einzelprompt-Sicherung erhalten. \`${CONTROLLER_FILE}\` ist deaktiviert und wird beim Export entfernt.\n\nErzeugen oder aktualisieren:\n\n\`\`\`bash\nnpm run export:prompts -- --dir "${normalizedRelativePath(reelDirectory)}" --strict\n\`\`\`\n`;

  const userReadme = `# Bildprompts\n\nFür Google Flow **nur diese Datei verwenden**:\n\n\`${USER_BUNDLE_FILE}\`\n\nAktuell existiert keine feste Repo-Bildwelt. Der Gesamtprompt darf keine alte Kugel-/Countryball-Welt oder andere historische Stilvorgabe automatisch ergänzen. Immer genau ein Bild erzeugen, gegen den jeweiligen Bildprompt prüfen, korrekt benennen und erst dann das nächste starten.\n`;

  await writeFile(paths.readme, readme, 'utf8');
  await writeFile(paths.userReadme, userReadme, 'utf8');
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

function formatIndividualPrompt(entry) {
  return entry.prompt || '[BILDPROMPT FEHLT]';
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
    '',
    'STRENG SERIELL – NIE PARALLEL',
    'Zu jedem Zeitpunkt darf genau EINE Bildgenerierung aktiv, ausstehend, queued oder in Bearbeitung sein.',
    'Für jedes Bild zwingend:',
    '1. Nur den aktuellen Bildabschnitt bearbeiten.',
    '2. Genau EINEN Bildgenerator-Aufruf auslösen. Niemals zwei oder mehr Generierungsaktionen im selben Agent-Schritt, Tool-Batch oder Turn.',
    '3. Warten, bis dieses eine Bild sichtbar vollständig fertig ist.',
    '4. VOR dem Fortfahren das Bild sichtbar gegen den aktuellen visuellen Prompt prüfen. Bei falschem Inhalt dasselbe Bild neu erzeugen und NICHT zum nächsten Bild gehen.',
    '5. Erst ein korrektes Bild exakt in den vorgesehenen Namen umbenennen.',
    '6. Prüfen, dass die Umbenennung erfolgreich ist und genau dieses Bild fertig vorliegt.',
    '7. Erst NACH dieser Bestätigung den nächsten Bildabschnitt ausführen.',
    'Die späteren Bildprompts stehen zwar bereits in dieser Nachricht, sind aber bis zum Abschluss des aktuellen Bildes NICHT zur Ausführung freigegeben.',
    'Keine Batches, keine Queue, kein paralleles Tool-Batching, kein gleichzeitiges Starten, keine Mehrfach-Generierung und keine Ansammlung unbenannter Bilder.',
    'Falls versehentlich ein zweiter oder dritter Job gestartet wurde: keine weiteren Jobs starten; spätere parallele Jobs abbrechen und beim ersten noch nicht sauber abgeschlossenen Bild fortsetzen.',
    '',
    'KEINE FESTE BILDWELT AKTIV',
    'Das Repository definiert aktuell bewusst keine feste Bildwelt, kein festes Figurenmodell und keine Golden Reference.',
    'Keine Regeln aus alten Kugel-, Countryball-, Editorial- oder anderen historischen Reels automatisch übernehmen.',
    'Für jedes Bild ist ausschließlich der jeweilige konkrete visuelle Prompt maßgeblich.',
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
    'Bild 00.png ist das Cover. Es wird aktuell NICHT automatisch als verbindlicher globaler Style-Master interpretiert. Eine neue feste Bildwelt oder Style-Master-Regel darf erst nach einer ausdrücklichen Nutzerentscheidung eingeführt werden.',
    '',
    'ARBEITSLABELS SIND NIEMALS BILDINHALT',
    'BILD-Nummern, COVER, SZENE, BILDPHASE, DATEINAME, Dateinamen und diese Workflow-Anweisungen sind nur Steuertext. Sie dürfen niemals im generierten Bild erscheinen.',
    '',
    'TEXTREGEL',
    'Nur der im jeweiligen visuellen Prompt ausdrücklich verlangte deutsche Text darf sichtbar erscheinen. Kein zusätzlicher englischer Text, keine Fantasiewörter, keine technischen Labels, keine Logos und keine Wasserzeichen. Wenn der Bildprompt keinen sichtbaren Text verlangt, bleibt das Bild vollständig textfrei.',
    '',
    'ENDE',
    `Erst nachdem Bild 00 bis Bild ${last} vollständig erzeugt, gegen den jeweiligen Bildprompt geprüft, korrekt umbenannt und die Nummerierung geprüft wurden, alle fertigen Bilder gemeinsam in den vorgesehenen Sammelordner legen.`,
    '',
    '────────────────────────────────────────'
  );

  for (const entry of ordered) {
    const number = padImageNumber(entry.order);
    lines.push(
      '',
      imageHeading(entry),
      `DATEINAME NACH FERTIGSTELLUNG: Bild ${number}.png`,
      entry.prompt || '[BILDPROMPT FEHLT]'
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
  for (const entry of ordered) {
    const number = padImageNumber(entry.order);
    await writeFile(path.join(paths.individualPromptsDirectory, `Bild ${number}.txt`), `${formatIndividualPrompt(entry)}\n`, 'utf8');
  }

  const bundle = formatCompleteSerialBundle(ordered);
  await writeFile(paths.file, bundle, 'utf8');
  await writeFile(paths.userFile, bundle, 'utf8');
  await rm(paths.controller, { force: true });

  const statusPath = path.join(reelDirectory, 'status.json');
  if (await exists(statusPath)) {
    const status = await readJson(statusPath);
    status.imagePromptBundle = missingIds.length === 0 ? 'ready-complete-serial-bundle-no-fixed-visual-world' : 'incomplete';
    status.googleFlowController = 'disabled-use-complete-bundle';
    status.imagePromptMode = 'single-complete-serial-bundle-no-fixed-visual-world';
    status.plannedImageCount = prompts.filter((entry) => entry.kind === 'scene').length;
    await writeFile(statusPath, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
  }

  return {
    outputFile: paths.userFile,
    technicalMirrorFile: paths.file,
    controllerFile: null,
    individualPromptsDirectory: paths.individualPromptsDirectory,
    sceneCount: new Set(prompts.filter((entry) => entry.kind === 'scene').map((entry) => entry.sceneId)).size,
    plannedImageCount: prompts.filter((entry) => entry.kind === 'scene').length,
    totalPromptCount: prompts.length,
    coverIncluded: prompts.some((entry) => entry.kind === 'cover' && !entry.missing),
    missingPromptIds: missingIds,
    missingSceneIds: prompts.filter((entry) => entry.kind === 'scene' && entry.missing).map((entry) => entry.sceneId),
    complete: missingIds.length === 0,
    content: bundle
  };
}

export async function validateImagePromptBundle(reelDirectory) {
  const paths = getImagePromptBundlePaths(reelDirectory);
  const prompts = await collectImagePrompts(reelDirectory);
  const missingIds = missingPromptIds(prompts);
  const ordered = [...prompts].sort((a, b) => a.order - b.order);
  const expectedBundle = formatCompleteSerialBundle(ordered);

  const actualTechnical = await exists(paths.file) ? await readFile(paths.file, 'utf8') : null;
  const actualUser = await exists(paths.userFile) ? await readFile(paths.userFile, 'utf8') : null;
  const controllerPresent = await exists(paths.controller);

  const individualChecks = [];
  for (const entry of ordered) {
    const number = padImageNumber(entry.order);
    const filePath = path.join(paths.individualPromptsDirectory, `Bild ${number}.txt`);
    const expected = `${formatIndividualPrompt(entry)}\n`;
    const actual = await exists(filePath) ? await readFile(filePath, 'utf8') : null;
    individualChecks.push({ number, filePath, present: actual !== null, current: actual === expected });
  }

  const current = actualTechnical === expectedBundle
    && actualUser === expectedBundle
    && !controllerPresent
    && individualChecks.every((item) => item.current);

  return {
    passed: missingIds.length === 0 && current,
    outputFile: paths.userFile,
    technicalMirrorFile: paths.file,
    sceneCount: new Set(prompts.filter((entry) => entry.kind === 'scene').map((entry) => entry.sceneId)).size,
    plannedImageCount: prompts.filter((entry) => entry.kind === 'scene').length,
    totalPromptCount: prompts.length,
    coverIncluded: prompts.some((entry) => entry.kind === 'cover' && !entry.missing),
    missingPromptIds: missingIds,
    missingSceneIds: prompts.filter((entry) => entry.kind === 'scene' && entry.missing).map((entry) => entry.sceneId),
    filePresent: actualUser !== null,
    technicalMirrorPresent: actualTechnical !== null,
    controllerPresent,
    individualPromptFiles: individualChecks,
    current,
    message: missingIds.length > 0
      ? `Bildprompts fehlen für: ${missingIds.join(', ')}.`
      : controllerPresent
        ? 'Der alte separate Google-Flow-Controller ist noch vorhanden und muss entfernt werden.'
        : !actualUser
          ? `Kompletter Google-Flow-Gesamtprompt fehlt: ${normalizedRelativePath(paths.userFile)}.`
          : !actualTechnical
            ? `Technische Spiegeldatei fehlt: ${normalizedRelativePath(paths.file)}.`
            : individualChecks.some((item) => !item.present)
              ? 'Mindestens eine interne Einzelprompt-Sicherung fehlt.'
              : !current
                ? 'Kompletter Gesamtprompt oder Einzelprompt-Sicherungen sind veraltet.'
                : 'Kompletter serieller Google-Flow-Gesamtprompt ist aktuell und enthält keine feste Repo-Bildwelt.'
  };
}
