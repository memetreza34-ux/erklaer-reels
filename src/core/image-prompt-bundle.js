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

  const readme = `# Alle Bildprompts\n\n\`${BUNDLE_FILE}\` ist ein einziger Google-Flow-Gesamtauftrag. Bild 00 ist immer das Cover. Danach folgen alle geplanten Bildphasen fortlaufend als Bild 01, Bild 02, Bild 03 usw.\n\n**Wichtig:** Die Bildnummer ist ab jetzt die globale Bildreihenfolge und nicht automatisch die Szenennummer. Eine narrative Szene kann ein, zwei oder selten drei Bilder besitzen. Beispiel: Szene 2 kann Bild 02 und Bild 03 bekommen; Szene 3 beginnt dann mit Bild 04.\n\nDie Bildanzahl wird für jedes Reel individuell geplant. Google Flow arbeitet trotzdem streng seriell: genau ein Bild erzeugen → vollständig warten → sofort korrekt umbenennen → prüfen → automatisch das nächste Bild starten. Kein Parallelisieren, keine Queue und kein weiteres Go zwischen den Bildern.\n\nBild 00 bleibt die verbindliche Stilvorlage für das gesamte Reel.\n\nErzeugen oder aktualisieren:\n\n\`\`\`bash\nnpm run export:prompts -- --dir "${normalizedRelativePath(reelDirectory)}" --strict\n\`\`\`\n`;
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
      missing: !prompt
    });
  }

  return prompts;
}

function sceneLabel(entry) {
  if (entry.phaseOrder === 1) return `SZENE ${entry.sceneOrder} · BILDPHASE 1`;
  return `SZENE ${entry.sceneOrder} · BILDPHASE ${entry.phaseOrder}`;
}

export function formatImageNumberingContract(prompts) {
  const visuals = prompts
    .filter((entry) => entry.kind === 'scene')
    .sort((a, b) => a.order - b.order);
  const lastNumber = padImageNumber(visuals.at(-1)?.order ?? 0);

  const lines = [
    'ABSCHLUSS – ERST JETZT GEMEINSAM IN EINEN ORDNER',
    '',
    'DIESER ABSCHLUSS DARF ERST BEGINNEN, WENN DAS LETZTE BILD VOLLSTÄNDIG FERTIG UND UMBENANNT IST.',
    'Vorher darf KEIN Bild in den gemeinsamen Sammelordner verschoben werden.',
    '',
    'FESTE DATEIBENENNUNG:',
    '- Bild 00 = COVER → Dateiname `Bild 00.png`'
  ];

  for (const visual of visuals) {
    const number = padImageNumber(visual.order);
    lines.push(`- Bild ${number} = ${sceneLabel(visual)} → Dateiname \`Bild ${number}.png\``);
  }

  lines.push(
    '',
    `Prüfe die vollständige Reihe Bild 00 bis Bild ${lastNumber}: keine Nummer fehlt, keine Nummer ist doppelt und keine Nummer ist vertauscht.`,
    'Die Bildnummer beschreibt die globale Bildreihenfolge. Sie ist bei mehreren Bildphasen innerhalb einer Szene ausdrücklich NICHT identisch mit der Szenennummer.',
    'Erst danach alle fertigen Bilder gemeinsam in `00-bildprompts/00-ALLE-BILDER-HIER-REIN/` legen.'
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
    'GOOGLE FLOW – STRIKT SERIELLER AUTONOMER BILDLAUF',
    '',
    `Diese Nachricht enthält ${total} Bildaufträge von Bild 00 bis Bild ${lastNumber}.`,
    'Das einmalige Absenden ist die vollständige Freigabe für den gesamten Durchlauf.',
    'Zu jedem Zeitpunkt darf genau EINE Bildgenerierung aktiv sein.',
    'Nach jedem fertigen Bild: sofort exakt umbenennen, Dateiname prüfen und danach automatisch das nächste Bild starten.',
    'Nicht auf Go, Weiter, OK oder eine weitere Nutzerantwort warten.',
    'Keine Batch-Verarbeitung, keine Queue, kein Vorladen und keine parallelen Generierungen.',
    '',
    'BILD 00 = COVER + VERBINDLICHE STILVORLAGE.',
    'Alle späteren Bilder übernehmen Stil, Farbwelt, Figurenmerkmale, Proportionen, Licht und Detailqualität von Bild 00.',
    '',
    'WICHTIG ZUR STRUKTUR:',
    'Narrative Szenen und Bilder sind nicht mehr 1:1 gekoppelt. Eine Szene kann mehrere aufeinanderfolgende Bildphasen besitzen.',
    'Die unten angegebene Bildnummer ist immer die globale Bildreihenfolge.',
    '',
    `Arbeite ohne Unterbrechung streng einzeln bis einschließlich Bild ${lastNumber}.`
  ].join('\n');
}

function formatDirectGenerationInstruction(number, previousNumber, isCover, isLast) {
  const gate = previousNumber === null
    ? 'FREIGABE: Dies ist der erste Bildblock. Das einmalige Absenden des Gesamtprompts reicht für die gesamte Kette.'
    : `FREIGABE: Diesen Block automatisch starten, sobald Bild ${previousNumber} vollständig fertig, korrekt umbenannt und geprüft ist.`;

  const styleInstruction = isCover
    ? 'COVER-REGEL: Dieses Bild ist Cover, Hook und verbindliche visuelle Stilvorlage für alle folgenden Bilder.'
    : 'STYLE-REFERENZ: Verwende Bild 00.png als verbindliche visuelle Referenz. Den Cover-Hook nicht automatisch kopieren.';

  const releaseInstruction = isLast
    ? 'Dies ist das letzte Bild. Danach automatisch die vollständige Nummerierung prüfen.'
    : 'Nach erfolgreicher Umbenennung sofort automatisch den nächsten Bildblock starten; keine Nutzerantwort abwarten.';

  return [
    gate,
    styleInstruction,
    `Erzeuge GENAU EIN Bild: BILD ${number}.`,
    'Währenddessen kein anderes Bild starten.',
    `Nach vollständigem Abschluss sofort exakt in \`Bild ${number}.png\` umbenennen und den Dateinamen prüfen.`,
    releaseInstruction
  ].join('\n');
}

function formatDirectPromptSection(entry, index, prompts) {
  const body = entry.prompt || '[BILDPROMPT FEHLT]';
  const number = padImageNumber(entry.order);
  const previousNumber = entry.order === 0 ? null : padImageNumber(entry.order - 1);
  const isCover = entry.kind === 'cover';
  const isLast = index === prompts.length - 1;

  if (isCover) {
    return [
      `BILD ${number} – COVER – GOOGLE-FLOW-PROMPT`,
      'ZIEL: COVER + STYLE-VORLAGE FÜR DAS GESAMTE REEL',
      `DATEINAME: Bild ${number}.png`,
      formatDirectGenerationInstruction(number, previousNumber, true, isLast),
      '',
      body
    ].join('\n');
  }

  return [
    `BILD ${number} – ${sceneLabel(entry)} – GOOGLE-FLOW-PROMPT`,
    `ZIEL: ${entry.targetId}`,
    `DATEINAME: Bild ${number}.png`,
    formatDirectGenerationInstruction(number, previousNumber, false, isLast),
    '',
    body
  ].join('\n');
}

export function formatImagePromptBundle(prompts) {
  const sections = prompts.map((entry, index) => formatDirectPromptSection(entry, index, prompts));
  const executionContract = formatFlowExecutionContract(prompts);
  const numberingContract = formatImageNumberingContract(prompts);
  return `ALLE BILDPROMPTS – GOOGLE FLOW – INDIVIDUELLE BILDDICHTE + STRENG SERIELL\n\n${executionContract}\n\n\n${sections.join('\n\n\n')}\n\n\n${numberingContract}\n`;
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
          : 'Die Bildprompt-Sammeldatei enthält alle individuell geplanten Bildphasen in fortlaufender Google-Flow-Reihenfolge.'
  };
}
