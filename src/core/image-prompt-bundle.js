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

  const readme = `# Google-Flow-Bildprompts\n\nDie **verbindliche Nutzerdatei** ist der komplette serielle Gesamtprompt:\n\n\`${USER_PROMPTS_DIRECTORY}/${USER_BUNDLE_FILE}\`\n\nDer Gesamtprompt enthält die bewährte alte Editorial-Struktur plus einen Golden-Reference-Countryball-Lock. Die Markenfigur wird nicht neu interpretiert: vollständige runde Countryball-Silhouette, nur zwei einfache weiße Augen, kein Mund und kein menschlicher Kopf-/Torso-Look. Bei Nicht-Länder-Themen bleibt exakt dieselbe Figur erhalten, nur mit kräftigem Editorial-Farbmuster statt Flagge.\n\nWichtig: Trotz Gesamtprompt darf Google Flow niemals mehrere Bilder gleichzeitig starten. Exakt eine Bildgenerierung pro Agent-Schritt, vollständig warten, Figurenmodell prüfen, umbenennen und erst danach das nächste Bild. Bei falschem Charaktermodell dasselbe Bild neu generieren statt fortfahren.\n\n\`${BUNDLE_DIRECTORY}/${BUNDLE_FILE}\` ist eine identische technische Kopie. Die Dateien unter \`${BUNDLE_DIRECTORY}/${INDIVIDUAL_PROMPTS_DIRECTORY}/\` bleiben nur als interne Einzelprompt-Sicherung erhalten. \`${CONTROLLER_FILE}\` ist deaktiviert und wird beim Export entfernt.\n\nErzeugen oder aktualisieren:\n\n\`\`\`bash\nnpm run export:prompts -- --dir "${normalizedRelativePath(reelDirectory)}" --strict\n\`\`\`\n`;

  const userReadme = `# Bildprompts\n\nFür Google Flow **nur diese Datei verwenden**:\n\n\`${USER_BUNDLE_FILE}\`\n\nSie enthält den kompletten seriellen Ablauf und die Golden-Reference-Regel der alten erfolgreichen Kugel-Reels. Immer genau ein Bild erzeugen, das Countryball-Modell sichtbar prüfen, korrekt benennen und erst dann das nächste starten.\n`;

  await writeFile(paths.readme, readme, 'utf8');
  await writeFile(paths.userReadme, userReadme, 'utf8');
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
    '4. VOR dem Fortfahren das Figurenmodell sichtbar prüfen. Bei falscher Kugelwelt dasselbe Bild verwerfen/neu erzeugen und NICHT zum nächsten Bild gehen.',
    '5. Erst ein korrektes Bild exakt in den vorgesehenen Namen umbenennen.',
    '6. Prüfen, dass die Umbenennung erfolgreich ist und genau dieses Bild fertig vorliegt.',
    '7. Erst NACH dieser Bestätigung den nächsten Bildabschnitt ausführen.',
    'Die späteren Bildprompts stehen zwar bereits in dieser Nachricht, sind aber bis zum Abschluss des aktuellen Bildes NICHT zur Ausführung freigegeben.',
    'Keine Batches, keine Queue, kein paralleles Tool-Batching, kein gleichzeitiges Starten, keine Mehrfach-Generierung und keine Ansammlung unbenannter Bilder.',
    'Falls versehentlich ein zweiter oder dritter Job gestartet wurde: keine weiteren Jobs starten; spätere parallele Jobs abbrechen und beim ersten noch nicht sauber abgeschlossenen Bild fortsetzen.',
    '',
    'GOLDEN-REFERENCE COUNTRYBALL-MODELL – HÖCHSTE PRIORITÄT',
    'Die Figuren müssen wie die bewährten älteren Länder-Reels aussehen (Linksverkehr / Länder ohne Armee / Länder in Ländern): klassische vollständige Countryballs, nicht eine neu erfundene Menschen-Kugel.',
    'Der KOMPLETTE Charakter ist EIN perfekter geometrischer 1:1-Kreis. Die vollständige runde Außenkontur der Hauptfigur muss sichtbar sein.',
    'GESICHT: ausschließlich zwei einfache weiße Countryball-Augen direkt auf der Kugel. KEIN Mund, keine Nase, keine Ohren, keine Haare, keine Lippen, keine Zähne, keine menschliche Gesichtsstruktur, keine Iris/Pupillen/Wimpern.',
    'Es gibt keinen separaten Kopf, Hals, Schultern, Brustkorb, Rumpf, Taille oder Hüften. Winzige einfache Arme/Beine dürfen direkt am Kreisrand sitzen.',
    'Die Hauptkugel darf NICHT hinter Schreibtisch, Tisch, Sofa, Bett oder anderen Vordergrundflächen so verdeckt werden, dass nur eine runde Kopf-Form sichtbar bleibt. Requisiten um die Kugel herum oder dahinter anordnen; bei einer normalerweise sitzenden Szene die Komposition so ändern, dass der ganze Countryball sichtbar bleibt.',
    'NICHT-LÄNDER: exakt dasselbe Countryball-Modell wie bei Länderfiguren. Statt Flagge eine kräftige flache Editorial-Farbe oder einfache 2-Ton-/Streifen-/Panel-Gestaltung auf der Kugel. Keine Haut-/Fleischfarbe als Standardkörperfarbe.',
    'ABSOLUT VERBOTEN: oval, Ei, Bean, Kapsel, Birne, Tropfen, humanoider Kopf, humanoider Torso, Countryball als Kopf auf Körper, Mund, menschliche Mimik, nur obere Kugelhälfte hinter Möbeln sichtbar.',
    'Wenn Szenenwörter wie person, sitting, posture, sad, relaxed oder expression mit dieser Markenfigur kollidieren, wird die KOMPOSITION angepasst — niemals das Countryball-Modell.',
    '',
    'DATEINAMEN'
  ];

  for (const entry of ordered) {
    const number = padImageNumber(entry.order);
    lines.push(`Bild ${number}.png = ${imageRole(entry)}`);
  }

  lines.push(
    '',
    'STYLE-MASTER',
    'Bild 00.png wird zuerst vollständig erzeugt. Es darf NUR dann Style-Master werden, wenn es das Golden-Reference-Countryball-Modell erfüllt: vollständiger Kreis sichtbar, Augen-only, kein Mund, kein menschlicher Kopf-/Torso-Look, keine Möbel-Kopf-Illusion. Falls Bild 00 diese Prüfung nicht besteht, Bild 00 neu generieren und NICHT mit Bild 01 fortfahren.',
    'Das akzeptierte Bild 00.png ist danach verbindliche Referenz für Palette, Papiertextur, Konturstärke, Detailqualität, Kugelproportion, Augenstil und Kugeloberfläche. Spätere Bilder dürfen nie menschlicher werden.',
    '',
    'ARBEITSLABELS SIND NIEMALS BILDINHALT',
    'BILD-Nummern, COVER, SZENE, BILDPHASE, DATEINAME, Dateinamen und diese Workflow-Anweisungen sind nur Steuertext. Sie dürfen niemals im generierten Bild erscheinen.',
    '',
    'TEXTREGEL',
    'Nur der im jeweiligen visuellen Prompt ausdrücklich verlangte deutsche Text darf sichtbar erscheinen. Kein zusätzlicher englischer Text, keine Fantasiewörter, keine technischen Labels, keine Logos und keine Wasserzeichen. Wenn der Bildprompt keinen sichtbaren Text verlangt, bleibt das Bild vollständig textfrei.',
    '',
    'ENDE',
    `Erst nachdem Bild 00 bis Bild ${last} vollständig erzeugt, auf das Golden-Reference-Countryball-Modell geprüft, korrekt umbenannt und die Nummerierung geprüft wurden, alle fertigen Bilder gemeinsam in den vorgesehenen Sammelordner legen.`,
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
    status.imagePromptBundle = missingIds.length === 0 ? 'ready-complete-old-style-serial-bundle-golden-countryball' : 'incomplete';
    status.googleFlowController = 'disabled-use-complete-bundle';
    status.imagePromptMode = 'single-complete-serial-bundle-golden-countryball';
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
                : 'Kompletter serieller Google-Flow-Gesamtprompt ist aktuell und enthält den Golden-Reference-Countryball-Lock.'
  };
}
