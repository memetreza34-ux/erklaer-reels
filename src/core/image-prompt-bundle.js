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

  const readme = `# Alle Bildprompts\n\nIn \`${BUNDLE_FILE}\` stehen zuerst der Cover-Prompt und danach alle Szenen-Bildprompts in chronologischer Reihenfolge. Ganz am Ende steht automatisch die verbindliche Google-Flow-Arbeitsanweisung für den Einzelbild-Ablauf und die Dateibenennung: Bild 00 = Cover, Bild 01 = Szene 1 usw.\n\nErzeugen oder aktualisieren:\n\n\`\`\`bash\nnpm run export:prompts -- --dir "${normalizedRelativePath(reelDirectory)}" --strict\n\`\`\`\n\nDie Datei wird automatisch aus \`cover/cover-prompt.txt\` und \`scenes/scene-XX/image-prompt.txt\` aufgebaut und sollte nicht manuell gepflegt werden.\n`;
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
    'GOOGLE FLOW KI-AGENT – VERBINDLICHER ABLAUF FÜR DIE BILDGENERIERUNG',
    '',
    'ACHTUNG: Diese Arbeitsanweisung richtet sich ausdrücklich an den Google-Flow-KI-Agenten, der die Bilder erzeugt. Sie ist keine Codex-Anweisung.',
    '',
    'ARBEITE IMMER BILD FÜR BILD – NIE MEHRERE BILDER AUF EINMAL:',
    '1. Erzeuge immer genau EIN Bild anhand des dazugehörigen Prompts.',
    '2. Beginne mit Bild 00 = Cover.',
    '3. Sobald dieses eine Bild vollständig erzeugt ist, benenne es SOFORT korrekt um: `Bild 00.png`.',
    '4. Erst nachdem dieses Bild korrekt umbenannt wurde, darfst du mit dem nächsten Bild fortfahren.',
    '5. Erzeuge danach Bild 01 = Szene 1 anhand des Prompts für Szene 1 und benenne es SOFORT nach der Generierung in `Bild 01.png` um.',
    '6. Erst danach Bild 02 = Szene 2 erzeugen → sofort in `Bild 02.png` umbenennen → erst danach das nächste Bild erzeugen.',
    '7. Wiederhole diesen Ablauf strikt für jedes einzelne Bild: PROMPT LESEN → GENAU EIN BILD ERZEUGEN → SOFORT UMBENENNEN → ERST DANN ZUM NÄCHSTEN PROMPT.',
    `8. Fahre so lange einzeln fort, bis wirklich alle Bilder von Bild 00 bis Bild ${lastNumber} vollständig erzeugt UND korrekt umbenannt wurden.`,
    '9. Prüfe danach einmal die komplette Reihe: keine Nummer fehlt, keine Nummer ist doppelt und keine Nummer wurde vertauscht.',
    '10. ERST WENN ALLE Bilder fertig erzeugt, korrekt umbenannt und vollständig geprüft sind, lege ALLE fertigen Bilder gemeinsam in den Ordner `00-bildprompts/00-ALLE-BILDER-HIER-REIN/`.',
    '11. Die Bilder bleiben dort als ein gemeinsamer Stapel. Nicht einzeln auf Cover- oder Szenenordner verteilen.',
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
    `Damit gilt immer: Cover = Bild 00, erste Szene = Bild 01 und jede weitere Szene erhält chronologisch genau eine fortlaufende Nummer bis Bild ${lastNumber}.`,
    'Falls das Bildformat nicht PNG ist, darf nur die Dateiendung abweichen; die Nummerierung `Bild 00`, `Bild 01`, `Bild 02` usw. bleibt unverändert.',
    'WICHTIG: Google Flow darf niemals mehrere noch unbenannte Bilder sammeln. Jedes Bild wird einzeln erzeugt und unmittelbar danach korrekt umbenannt. Erst wenn wirklich alle Bilder fertig und benannt sind, werden sie gemeinsam in den Sammelordner gelegt.'
  );

  return lines.join('\n');
}

export function formatImagePromptBundle(prompts) {
  const sections = prompts.map((entry) => {
    const body = entry.prompt || '[BILDPROMPT FEHLT]';
    if (entry.kind === 'cover') {
      return `COVER – BILDPROMPT\n\n${body}`;
    }
    return `SZENE ${entry.order} – BILDPROMPT ${entry.order}\n\n${body}`;
  });

  const numberingContract = formatImageNumberingContract(prompts);
  return `ALLE BILDPROMPTS – COVER UND SZENEN\n\n${sections.join('\n\n\n')}\n\n\n${numberingContract}\n`;
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
          ? 'Die Bildprompt-Sammeldatei ist veraltet oder enthält Cover, Szenen oder die verbindliche Google-Flow-Einzelbild-Anweisung nicht vollständig in der richtigen Reihenfolge.'
          : 'Die Bildprompt-Sammeldatei enthält Cover, alle Szenenprompts sowie die vollständige Google-Flow-Einzelbild- und Bildnummerierungsanweisung.'
  };
}
