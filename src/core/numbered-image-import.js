import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const DROP_DIRECTORY = path.join('inbox', 'numbered-images');
const SOURCE_DIRECTORY = 'numbered-images';
const README_FILE = 'README.md';

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath, fallback = null) {
  if (!(await exists(filePath))) return fallback;
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export function parseNumberedImageFileName(fileName) {
  const extension = path.extname(String(fileName ?? '')).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(extension)) return null;

  const stem = path.basename(String(fileName), extension).trim();
  const match = stem.match(/^(?:(?:bild|image)[\s_-]*)?(\d{2})(?:[\s_-].*)?$/i);
  if (!match) return null;

  return {
    number: Number(match[1]),
    extension
  };
}

export function getNumberedImageDropDirectory(reelDirectory) {
  return path.join(reelDirectory, DROP_DIRECTORY);
}

export async function ensureNumberedImageDropDirectory(reelDirectory) {
  const directory = getNumberedImageDropDirectory(reelDirectory);
  await mkdir(directory, { recursive: true });

  const readmePath = path.join(directory, README_FILE);
  if (!(await exists(readmePath))) {
    await writeFile(
      readmePath,
      '# Alle Bilder hier hinein\n\n' +
      'Lege Cover und Szenenbilder gemeinsam in diesen Ordner. Die zweistellige Nummer bestimmt nur das vorgeschlagene Ziel:\n\n' +
      '- `00.png` oder `bild-00.png` → Cover\n' +
      '- `01.png` oder `bild-01.png` → Szene 1\n' +
      '- `02.png` → Szene 2\n' +
      '- usw. bis zur letzten Szene\n\n' +
      'Unterstützt werden PNG, JPG, JPEG und WEBP. Zusätzlicher Text nach der Nummer ist erlaubt, z. B. `03-meine-szene.png`.\n\n' +
      'Die Nummerierung spart nur das manuelle Einsortieren. Vor der endgültigen Übernahme muss die KI jedes Bild weiterhin sichtbar prüfen und die bestehende Asset-QC bestätigen.\n',
      'utf8'
    );
  }

  return directory;
}

function sourceRelativeToInbox(fileName) {
  return `${SOURCE_DIRECTORY}/${fileName}`;
}

function emptyVisualFields(target, sceneOrder) {
  const assignment = {
    confidence: 0,
    visualReviewed: false,
    secondPassConfirmed: false,
    confirmedTarget: null,
    visibleSummary: '',
    reason: '',
    comparedFields: [],
    matchMethod: ''
  };

  if (target !== 'cover') {
    assignment.sceneOrderConfirmed = false;
    assignment.confirmedSceneOrder = null;
    assignment.suggestedSceneOrder = sceneOrder;
  }

  return assignment;
}

export async function prepareNumberedImageAssignments(reelDirectory, { skipWhenEmpty = false } = {}) {
  const directory = await ensureNumberedImageDropDirectory(reelDirectory);
  const sceneIndex = await readJson(path.join(reelDirectory, 'scenes', 'scene-index.json'), []);
  const scenesByOrder = new Map(
    sceneIndex
      .filter((scene) => Number.isInteger(Number(scene.order)) && Number(scene.order) > 0)
      .map((scene) => [Number(scene.order), scene])
  );

  const entries = await readdir(directory, { withFileTypes: true });
  const candidateFiles = entries
    .filter((entry) => entry.isFile() && !entry.name.startsWith('.') && entry.name !== README_FILE)
    .map((entry) => ({ name: entry.name, parsed: parseNumberedImageFileName(entry.name) }));

  if (skipWhenEmpty && candidateFiles.length === 0) return null;

  const grouped = new Map();
  const unmatched = [];

  for (const candidate of candidateFiles) {
    if (!candidate.parsed) {
      unmatched.push({
        source: sourceRelativeToInbox(candidate.name),
        reason: 'Dateiname enthält keine eindeutige zweistellige Bildnummer im Format 00, 01, 02 ...'
      });
      continue;
    }

    const bucket = grouped.get(candidate.parsed.number) ?? [];
    bucket.push(candidate);
    grouped.set(candidate.parsed.number, bucket);
  }

  const assignments = [];

  for (const [number, candidates] of [...grouped.entries()].sort((a, b) => a[0] - b[0])) {
    if (candidates.length > 1) {
      for (const candidate of candidates) {
        unmatched.push({
          source: sourceRelativeToInbox(candidate.name),
          reason: `Mehrere Dateien verwenden dieselbe Nummer ${String(number).padStart(2, '0')}; keine automatische Auswahl.`
        });
      }
      continue;
    }

    const candidate = candidates[0];
    const source = sourceRelativeToInbox(candidate.name);

    if (number === 0) {
      assignments.push({
        source,
        target: 'cover',
        suggestedBy: 'numbered-file-contract',
        importNumber: 0,
        ...emptyVisualFields('cover', null)
      });
      continue;
    }

    const scene = scenesByOrder.get(number);
    if (!scene) {
      unmatched.push({
        source,
        reason: `Für Bildnummer ${String(number).padStart(2, '0')} existiert keine Szene mit order=${number}.`
      });
      continue;
    }

    assignments.push({
      source,
      target: scene.sceneId,
      suggestedBy: 'numbered-file-contract',
      importNumber: number,
      ...emptyVisualFields(scene.sceneId, number)
    });
  }

  const mapPath = path.join(reelDirectory, 'inbox', 'asset-map.json');
  const previousMap = await readJson(mapPath, { assignments: [] });
  const preservedAssignments = Array.isArray(previousMap?.assignments)
    ? previousMap.assignments.filter((assignment) => String(assignment?.target ?? '') === 'audio')
    : [];

  const assetMap = {
    version: 3,
    generatedBy: 'numbered-image-import',
    assignmentMode: 'numbered-target-suggestion-with-required-visual-review',
    instructions: [
      'Die zweistellige Dateinummer bestimmt nur das vorgeschlagene Ziel: 00=Cover, 01=Szene 1, 02=Szene 2 usw.',
      'Vor --apply jedes Bild öffnen und den sichtbaren Inhalt tatsächlich prüfen.',
      'Nach der Sichtprüfung confidence, visualReviewed, secondPassConfirmed, visibleSummary, reason, comparedFields und matchMethod ausfüllen.',
      'Bei Szenen zusätzlich confirmedTarget, confirmedSceneOrder und sceneOrderConfirmed bestätigen.',
      'matchMethod muss nach echter Sichtprüfung visual-content-review oder visual-text-and-content-review sein.',
      'Unter der konfigurierten Mindestkonfidenz nicht anwenden.'
    ],
    assignments: [...preservedAssignments, ...assignments],
    unmatched
  };

  await writeJson(mapPath, assetMap);

  return {
    directory,
    mapPath,
    candidateCount: candidateFiles.length,
    assignedCount: assignments.length,
    preservedAudioAssignments: preservedAssignments.length,
    unmatchedCount: unmatched.length,
    assignments,
    unmatched
  };
}
