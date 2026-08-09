import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

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

function sceneNumber(scene, fallbackIndex) {
  const order = Number(scene?.order);
  if (Number.isInteger(order) && order > 0) return order;
  const match = String(scene?.sceneId ?? '').match(/(\d+)$/);
  return match ? Number(match[1]) : fallbackIndex + 1;
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

  const readme = `# Alle Bildprompts\n\n\`${BUNDLE_FILE}\` ist absichtlich als **ein einziger Google-Flow-Gesamtauftrag** aufgebaut. Der Nutzer kopiert die komplette Datei auf einmal in Google Flow und sendet sie ab. Google Flow soll ohne Bestätigungs- oder Erklärungstext sofort bei Bild 00 starten und danach alle nummerierten Bildblöcke chronologisch bis zum letzten Bild abarbeiten.\n\nDirekt bei JEDEM Bildblock stehen feste Bildnummer, Ziel und Dateiname: Bild 00 = Cover, Bild 01 = Szene 1, Bild 02 = Szene 2 usw.\n\nWichtig: Regeln für Antigravity, Codex oder andere Repo-Agenten gehören **nicht** in diese kopierbare Datei. Dort stehen nur direkte Ausführungsbefehle für Google Flow.\n\nErzeugen oder aktualisieren:\n\n\`\`\`bash\nnpm run export:prompts -- --dir "${normalizedRelativePath(reelDirectory)}" --strict\n\`\`\`\n\nDie Datei wird automatisch aus \`cover/cover-prompt.txt\` und \`scenes/scene-XX/image-prompt.txt\` aufgebaut und sollte nicht manuell gepflegt werden.\n`;
  await writeFile(paths.readme, readme, 'utf8');

  if (!(await exists(paths.file))) {
    await writeFile(paths.file, 'Die Bildprompt-Sammeldatei mit Cover und Szenen wird nach Fertigstellung aller Prompts erzeugt.\n', 'utf8');
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
    sceneId: null,
    order: 0,
    promptPath: coverPromptPath,
    prompt: coverPrompt,
    missing: !coverPrompt
  }];

  const orderedScenes = scenes
    .map((scene, index) => ({ ...scene, resolvedOrder: sceneNumber(scene, index) }))
    .sort((a, b) => a.resolvedOrder - b.resolvedOrder);

  for (const scene of orderedScenes) {
    const promptPath = path.join(reelDirectory, 'scenes', scene.sceneId, 'image-prompt.txt');
    const present = await exists(promptPath);
    const prompt = present ? (await readFile(promptPath, 'utf8')).trim() : '';
    prompts.push({
      kind: 'scene',
      promptId: scene.sceneId,
      sceneId: scene.sceneId,
      order: scene.resolvedOrder,
      promptPath,
      prompt,
      missing: !prompt
    });
  }

  return prompts;
}

export function formatImageNumberingContract(prompts) {
  const scenes = prompts
    .filter((entry) => entry.kind === 'scene')
    .sort((a, b) => a.order - b.order);
  const lastNumber = padImageNumber(scenes.at(-1)?.order ?? 0);

  const lines = [
    'ABSCHLUSS – DATEIBENENNUNG UND GEMEINSAME ABLAGE',
    '',
    'Wenn alle Bilder vollständig erzeugt sind, prüfe die feste Nummerierung:',
    '',
    'FESTE DATEIBENENNUNG:',
    '- Bild 00 = COVER → Dateiname `Bild 00.png`'
  ];

  for (const scene of scenes) {
    const number = padImageNumber(scene.order);
    lines.push(`- Bild ${number} = SZENE ${scene.order} → Dateiname \`Bild ${number}.png\``);
  }

  lines.push(
    '',
    `Damit gilt: Cover = Bild 00, erste Szene = Bild 01 und jede weitere Szene erhält chronologisch genau eine fortlaufende Nummer bis Bild ${lastNumber}.`,
    'Falls das Bildformat nicht PNG ist, darf nur die Dateiendung abweichen; die Nummerierung `Bild 00`, `Bild 01`, `Bild 02` usw. bleibt unverändert.',
    'Erst wenn wirklich ALLE Bilder fertig erzeugt und korrekt benannt sind, lege sie gemeinsam in `00-bildprompts/00-ALLE-BILDER-HIER-REIN/`. Nicht auf einzelne Cover- oder Szenenordner verteilen.'
  );

  return lines.join('\n');
}

function formatFlowExecutionContract(prompts) {
  const scenes = prompts
    .filter((entry) => entry.kind === 'scene')
    .sort((a, b) => a.order - b.order);
  const lastNumber = padImageNumber(scenes.at(-1)?.order ?? 0);
  const total = scenes.length + 1;

  return [
    'GOOGLE FLOW – GESAMTAUFTRAG: STARTE JETZT SOFORT',
    '',
    `Diese komplette Nachricht ist EIN zusammenhängender Auftrag für ${total} Bilder von Bild 00 bis Bild ${lastNumber}.`,
    'ANTWORTE NICHT mit einer Bestätigung, Zusammenfassung, Erklärung, Anleitung oder einem Hinweis, dass du die Prompts verstanden hast.',
    'STARTE STATTDESSEN SOFORT mit der tatsächlichen Bildgenerierung von BILD 00.',
    '',
    'VERBINDLICHER ABLAUF:',
    '1. Arbeite ALLE nachfolgenden nummerierten Bildblöcke dieser Nachricht vollständig und streng chronologisch ab.',
    '2. Beginne jetzt mit BILD 00 = COVER.',
    '3. Erzeuge immer nur GENAU EIN Bild gleichzeitig anhand des Bildprompts im aktuellen Block.',
    '4. Sobald dieses Bild fertig ist, verwende sofort den im Block angegebenen Dateinamen.',
    '5. Danach fahre OHNE Textantwort und OHNE Rückfrage automatisch mit dem direkt nächsten Bildblock fort.',
    `6. Wiederhole das selbstständig Bild für Bild bis einschließlich BILD ${lastNumber}.`,
    '7. Überspringe keinen Bildblock, erzeuge keine zusätzlichen Varianten und ändere die Reihenfolge nicht.',
    `8. Stoppe erst, nachdem alle ${total} Bilder von Bild 00 bis Bild ${lastNumber} erzeugt wurden.`,
    '9. Erst danach die vollständige Nummerierung prüfen und alle fertigen Bilder gemeinsam in den unten angegebenen Sammelordner legen.',
    '',
    'JETZT AUSFÜHREN: Beginne unmittelbar mit BILD 00. Keine Textantwort vor der ersten Bildgenerierung.'
  ].join('\n');
}

function formatDirectGenerationInstruction(number) {
  return `GOOGLE FLOW – AKTUELLER SCHRITT: Erzeuge JETZT genau BILD ${number} anhand des folgenden Prompts. Keine Erklärung und keine Bestätigung. Sobald BILD ${number} fertig ist, benenne es wie oben angegeben und fahre automatisch mit dem direkt folgenden nummerierten Bildblock dieser Nachricht fort.`;
}

function formatDirectPromptSection(entry) {
  const body = entry.prompt || '[BILDPROMPT FEHLT]';
  const number = padImageNumber(entry.kind === 'cover' ? 0 : entry.order);

  if (entry.kind === 'cover') {
    return [
      `BILD ${number} – COVER – GOOGLE-FLOW-PROMPT`,
      'ZIEL: COVER',
      `DATEINAME: Bild ${number}.png`,
      formatDirectGenerationInstruction(number),
      '',
      body
    ].join('\n');
  }

  return [
    `BILD ${number} – SZENE ${entry.order} – GOOGLE-FLOW-PROMPT`,
    `ZIEL: SZENE ${entry.order}`,
    `DATEINAME: Bild ${number}.png`,
    formatDirectGenerationInstruction(number),
    '',
    body
  ].join('\n');
}

export function formatImagePromptBundle(prompts) {
  const sections = prompts.map(formatDirectPromptSection);
  const executionContract = formatFlowExecutionContract(prompts);
  const numberingContract = formatImageNumberingContract(prompts);
  return `ALLE BILDPROMPTS – GOOGLE FLOW ONE-PASTE\n\n${executionContract}\n\n\n${sections.join('\n\n\n')}\n\n\n${numberingContract}\n`;
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
    await writeFile(statusPath, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
  }

  return {
    outputFile: paths.file,
    sceneCount: prompts.filter((entry) => entry.kind === 'scene').length,
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
    sceneCount: prompts.filter((entry) => entry.kind === 'scene').length,
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
          ? 'Die Bildprompt-Sammeldatei ist veraltet oder enthält den Google-Flow-One-Paste-Gesamtauftrag und alle nummerierten Bildblöcke nicht vollständig.'
          : 'Die Bildprompt-Sammeldatei ist als ein einziger Google-Flow-One-Paste-Gesamtauftrag aufgebaut und startet direkt mit Bild 00.'
  };
}
