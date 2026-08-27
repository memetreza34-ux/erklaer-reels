import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  FIXED_VISUAL_STYLE_ID,
  FIXED_VISUAL_WORLD_LABEL,
  FIXED_VISUAL_WORLD_PROMPT
} from '../shared/fixed-visual-world.js';
import { flattenSceneImagePhases } from '../shared/visual-moments.js';

const BUNDLE_DIRECTORY = 'all-image-prompts';
const BUNDLE_FILE = 'all-image-prompts.txt';
const CONTROLLER_FILE = 'google-flow-controller.txt';
const INDIVIDUAL_PROMPTS_DIRECTORY = 'image-prompts';
const USER_PROMPTS_DIRECTORY = '00-bildprompts';
const USER_BUNDLE_FILE = '99-alle-bildprompts.txt';
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

  const readme = `# Google-Flow-Bildprompts\n\nDie **verbindliche Nutzerdatei** ist der komplette serielle Gesamtprompt:\n\n\`${USER_PROMPTS_DIRECTORY}/${USER_BUNDLE_FILE}\`\n\nIm Repository ist die feste Bildwelt **${FIXED_VISUAL_WORLD_LABEL}** (\`${FIXED_VISUAL_STYLE_ID}\`) aktiv. Der Exporter ergänzt diesen Style-Lock global und zusätzlich direkt vor jedem einzelnen Cover-/Szenenprompt. Dadurch bleibt die Bildsprache unabhängig vom Thema gleich. Der konkrete Quellprompt bestimmt Inhalt und Komposition; widersprechende Stilformulierungen werden vom festen Style-Lock überstimmt.\n\nBildprompts sind Englisch. Sichtbarer Bildtext ist ausschließlich der konkret geplante deutsche Text.\n\nWichtig: Trotz Gesamtprompt darf Google Flow niemals mehrere Bilder gleichzeitig starten. Exakt eine Bildgenerierung pro Agent-Schritt, vollständig warten, sichtbar prüfen, sofort umbenennen, sofort in den Flow-Ausgabeordner \`${FLOW_OUTPUT_FOLDER}\` legen und erst danach das nächste Bild starten. Der Ordner wird vor Bild 00 angelegt. Wenn Umbenennen oder Ablegen nicht erfolgreich bestätigt werden kann, muss der Lauf stoppen statt weitere Bilder zu erzeugen.\n\n\`${BUNDLE_DIRECTORY}/${BUNDLE_FILE}\` ist eine identische technische Kopie. Die Dateien unter \`${BUNDLE_DIRECTORY}/${INDIVIDUAL_PROMPTS_DIRECTORY}/\` bleiben nur als interne wortgetreue Einzelprompt-Sicherung erhalten. \`${CONTROLLER_FILE}\` ist deaktiviert und wird beim Export entfernt.\n\nErzeugen oder aktualisieren:\n\n\`\`\`bash\nnpm run export:prompts -- --dir "${normalizedRelativePath(reelDirectory)}" --strict\n\`\`\`\n`;

  const userReadme = `# Bildprompts\n\nFür Google Flow **nur diese Datei verwenden**:\n\n\`${USER_BUNDLE_FILE}\`\n\nFeste Bildwelt: **${FIXED_VISUAL_WORLD_LABEL}** (\`${FIXED_VISUAL_STYLE_ID}\`). Sie gilt für jedes Bild und jedes Thema. Prompts sind Englisch, sichtbarer Bildtext ist Deutsch. Vor Bild 00 den Flow-Ordner \`${FLOW_OUTPUT_FOLDER}\` anlegen. Danach immer exakt ein Bild erzeugen, vollständig warten, prüfen, korrekt umbenennen, sofort in diesen einen Ordner legen und erst dann das nächste starten. Niemals alle Bildprompts als Batch/Serie gleichzeitig generieren.\n`;

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
    'If the specific image content below contains any style wording that conflicts with this fixed visual style, ignore only the conflicting style wording. Preserve its factual subject, visual metaphor, composition and requested German text.',
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
    'Dieser Auftrag ist KEIN Mehrbild-/Serien-Generator-Aufruf. Die Nachricht enthält zwar alle Prompts, aber sie muss als Zustandsmaschine abgearbeitet werden: immer nur genau ein aktuell freigegebenes Bild.',
    '',
    'SCHRITT 0 – ZUERST EINEN GEMEINSAMEN AUSGABEORDNER ANLEGEN',
    `Bevor du Bild 00 generierst, erstelle in diesem Flow-Projekt genau EINEN Ordner bzw. eine Medien-Sammlung mit dem Namen "${FLOW_OUTPUT_FOLDER}".`,
    `Alle final akzeptierten Bilder dieses Reels müssen ausschließlich in "${FLOW_OUTPUT_FOLDER}" gesammelt werden.`,
    'Nach JEDEM einzelnen Bild: erst korrekt umbenennen, dann sofort in diesen Ordner legen/verschieben/einsortieren und sichtbar prüfen, dass es dort vorhanden ist. Nicht bis zum Ende mit dem Einsortieren warten.',
    `Wenn der Ordner "${FLOW_OUTPUT_FOLDER}" nicht angelegt werden kann, oder wenn ein fertiges Bild nicht umbenannt oder dort abgelegt werden kann, STOPPE den Lauf und erzeuge KEINE späteren Bilder.`,
    '',
    'STRENG SERIELL – NIE PARALLEL',
    'Zu jedem Zeitpunkt darf genau EINE Bildgenerierung aktiv, ausstehend, queued oder in Bearbeitung sein.',
    'Für jedes Bild zwingend:',
    '1. Bestimme die nächste noch nicht abgeschlossene Bildnummer. Starte bei Bild 00.',
    '2. Lies und verwende NUR den Promptabschnitt dieser aktuellen Bildnummer. Ignoriere alle späteren Bildabschnitte vollständig, bis das aktuelle Bild gespeichert ist.',
    '3. Genau EINEN Bildgenerator-Aufruf auslösen. Niemals zwei oder mehr Generierungsaktionen im selben Agent-Schritt, Tool-Batch oder Turn.',
    '4. Keine Serienfunktion, keinen Multi-Prompt-Aufruf, kein Batch, keine Galerie-Erstellung und keine Option verwenden, die mehrere Bilder gleichzeitig anfordert. Pro Generierung genau ein Prompt und genau ein Ergebnis.',
    '5. Warten, bis dieses eine Bild sichtbar vollständig fertig ist. Währenddessen keinen späteren Bildprompt lesen, vorbereiten oder starten.',
    '6. VOR dem Fortfahren das Bild sichtbar gegen den aktuellen visuellen Prompt UND die feste Bildwelt prüfen. Bei falschem Inhalt oder Stil dasselbe Bild neu erzeugen und NICHT zum nächsten Bild gehen.',
    '7. Erst ein korrektes Bild exakt in den vorgesehenen Namen umbenennen.',
    '8. Prüfen, dass die Umbenennung erfolgreich ist und genau dieses Bild unter diesem Namen vorliegt.',
    `9. Das korrekt benannte Bild sofort in "${FLOW_OUTPUT_FOLDER}" legen/verschieben/einsortieren. Danach sichtbar prüfen, dass es dort vorhanden ist.`,
    '10. Erst NACH erfolgreicher Generierung + Prüfung + Umbenennung + Ablage im Ordner ist das aktuelle Bild abgeschlossen und der nächste Bildabschnitt freigegeben.',
    'Die späteren Bildprompts stehen zwar bereits in dieser Nachricht, sind aber bis zum vollständigen Abschluss des aktuellen Bildes NICHT zur Ausführung freigegeben.',
    'Keine Batches, keine Queue, kein paralleles Tool-Batching, kein gleichzeitiges Starten, keine Mehrfach-Generierung und keine Ansammlung unbenannter Bilder.',
    'Falls versehentlich ein zweiter oder dritter Job gestartet wurde: keine weiteren Jobs starten; spätere parallele Jobs abbrechen und beim ersten noch nicht sauber abgeschlossenen Bild fortsetzen.',
    '',
    'INTERNE FORTSCHRITTSLOGIK',
    `Führe intern eine einfache Reihenfolge: current = 00 → 01 → 02 → ... → ${last}.`,
    `Ein Bild zählt nur als abgeschlossen, wenn es 1) fertig erzeugt, 2) geprüft, 3) exakt umbenannt und 4) im Ordner "${FLOW_OUTPUT_FOLDER}" bestätigt wurde.`,
    'Wenn irgendeiner dieser vier Punkte fehlt, darf current NICHT erhöht werden.',
    '',
    `VERBINDLICHE BILDWELT – ${FIXED_VISUAL_WORLD_LABEL.toUpperCase()}`,
    `Style-ID: ${FIXED_VISUAL_STYLE_ID}`,
    'Diese Bildwelt gilt ausnahmslos für Cover und jedes Szenenbild, unabhängig vom Thema. Inhalt, Symbolik und Hintergrundfarbe dürfen wechseln; die Formsprache darf nicht wechseln.',
    'Jeder einzelne Bildabschnitt wiederholt den Style-Lock zusätzlich direkt vor dem konkreten Bildinhalt.',
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
    `Bild 00.png ist das Cover. Es ist nicht der alleinige Style-Master; der globale Style-Master ist die feste Repo-Bildwelt ${FIXED_VISUAL_STYLE_ID}, die für Bild 00 und alle folgenden Bilder identisch gilt.`,
    '',
    'ARBEITSLABELS SIND NIEMALS BILDINHALT',
    'BILD-Nummern, COVER, SZENE, BILDPHASE, DATEINAME, Dateinamen und diese Workflow-Anweisungen sind nur Steuertext. Sie dürfen niemals im generierten Bild erscheinen.',
    '',
    'TEXTREGEL',
    'Nur der im jeweiligen visuellen Prompt ausdrücklich verlangte deutsche Text darf sichtbar erscheinen. Kein zusätzlicher englischer Text, keine Fantasiewörter, keine technischen Labels, keine Logos und keine Wasserzeichen. Wenn der Bildprompt keinen sichtbaren Text verlangt, bleibt das Bild vollständig textfrei.',
    '',
    'ABSCHLUSSKONTROLLE',
    `Nach Bild ${last}: Öffne bzw. prüfe den Ordner "${FLOW_OUTPUT_FOLDER}". Er muss exakt ${total} finale Bilder enthalten: Bild 00.png bis Bild ${last}.png, ohne fehlende Nummer, ohne doppelte Nummer und ohne unbenannte finale Bilder.`,
    'Erst nach dieser Ordnerkontrolle ist der Auftrag abgeschlossen.',
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
      `FREIGABEBEDINGUNG FÜR DAS NÄCHSTE BILD: Bild ${number}.png ist sichtbar fertig, geprüft, exakt umbenannt und im Ordner ${FLOW_OUTPUT_FOLDER} bestätigt.`,
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
    status.imagePromptBundle = missingIds.length === 0 ? 'ready-complete-serial-bundle-fixed-visual-world' : 'incomplete';
    status.googleFlowController = 'disabled-use-complete-bundle';
    status.imagePromptMode = 'single-complete-serial-bundle-fixed-visual-world';
    status.visualWorld = `fixed-${FIXED_VISUAL_STYLE_ID}`;
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
    visualStyleId: FIXED_VISUAL_STYLE_ID,
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
    visualStyleId: FIXED_VISUAL_STYLE_ID,
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
                : `Kompletter serieller Google-Flow-Gesamtprompt ist aktuell und erzwingt die feste Bildwelt ${FIXED_VISUAL_STYLE_ID}.`
  };
}
