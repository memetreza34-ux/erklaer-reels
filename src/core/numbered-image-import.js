import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { collectImagePrompts } from './image-prompt-bundle.js';

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
  await writeFile(
    readmePath,
    '# Alle Bilder hier hinein\n\n' +
    'Lege Cover und alle Szenen-Bildphasen gemeinsam in diesen Ordner. Die zweistellige Nummer bestimmt nur das vorgeschlagene Ziel in der **globalen Bildreihenfolge**:\n\n' +
    '- `00.png` oder `Bild 00.png` → Cover\n' +
    '- `01.png` → erste Bildphase des Reels\n' +
    '- `02.png` → zweite Bildphase des Reels\n' +
    '- usw. bis zum letzten geplanten Bild\n\n' +
    '**Wichtig:** Bild 03 bedeutet nicht automatisch Szene 3. Wenn Szene 2 zwei Bilder besitzt, können Bild 02 und Bild 03 beide zu Szene 2 gehören.\n\n' +
    'Unterstützt werden PNG, JPG, JPEG und WEBP. Die Nummerierung ist weiterhin nur Routing-Hilfe. Vor der endgültigen Übernahme muss jedes Bild sichtbar gegen seine konkrete Bildphase geprüft werden.\n',
    'utf8'
  );

  return directory;
}

function sourceRelativeToInbox(fileName) {
  return `${SOURCE_DIRECTORY}/${fileName}`;
}

function emptyVisualFields(target, sceneOrder, phaseOrder) {
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
    assignment.suggestedPhaseOrder = phaseOrder;
  }

  return assignment;
}

export async function prepareNumberedImageAssignments(reelDirectory, { skipWhenEmpty = false } = {}) {
  const directory = await ensureNumberedImageDropDirectory(reelDirectory);
  const prompts = await collectImagePrompts(reelDirectory);
  const imageTargetsByNumber = new Map(
    prompts
      .filter((entry) => entry.kind === 'scene')
      .map((entry) => [Number(entry.order), entry])
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
        suggestedBy: 'numbered-global-image-order',
        importNumber: 0,
        ...emptyVisualFields('cover', null, null)
      });
      continue;
    }

    const visual = imageTargetsByNumber.get(number);
    if (!visual) {
      unmatched.push({
        source,
        reason: `Für Bildnummer ${String(number).padStart(2, '0')} existiert keine geplante Bildphase.`
      });
      continue;
    }

    assignments.push({
      source,
      target: visual.targetId,
      parentSceneId: visual.sceneId,
      suggestedBy: 'numbered-global-image-order',
      importNumber: number,
      ...emptyVisualFields(visual.targetId, visual.sceneOrder, visual.phaseOrder)
    });
  }

  const mapPath = path.join(reelDirectory, 'inbox', 'asset-map.json');
  const previousMap = await readJson(mapPath, { assignments: [] });
  const preservedAssignments = Array.isArray(previousMap?.assignments)
    ? previousMap.assignments.filter((assignment) => String(assignment?.target ?? '') === 'audio')
    : [];

  const assetMap = {
    version: 4,
    generatedBy: 'numbered-image-import',
    assignmentMode: 'global-image-order-suggestion-with-required-visual-review',
    plannedImageCount: imageTargetsByNumber.size,
    instructions: [
      'Die zweistellige Dateinummer beschreibt die globale Bildreihenfolge: 00=Cover, danach alle geplanten Bildphasen fortlaufend.',
      'Eine Bildnummer ist nicht automatisch identisch mit einer Szenennummer, wenn Szenen mehrere Bilder besitzen.',
      'Vor --apply jedes Bild öffnen und den sichtbaren Inhalt tatsächlich gegen die vorgeschlagene Bildphase prüfen.',
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
    plannedImageCount: imageTargetsByNumber.size,
    assignedCount: assignments.length,
    preservedAudioAssignments: preservedAssignments.length,
    unmatchedCount: unmatched.length,
    assignments,
    unmatched
  };
}
