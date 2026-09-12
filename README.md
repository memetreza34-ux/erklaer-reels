import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { collectImagePrompts } from './image-prompt-bundle.js';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const DROP_DIRECTORY = path.join('inbox', 'numbered-images');
const SOURCE_DIRECTORY = 'numbered-images';
const README_FILE = 'README.md';

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
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
  return { number: Number(match[1]), extension };
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
    'Lege alle Reel-Bilder gemeinsam hier ab. Die zweistellige Nummer ist die **verbindliche globale Bildreihenfolge**:\n\n' +
    '- `01.png` oder `Bild 01.png` → erster Bildmoment / Titelbild\n' +
    '- `02.png` → zweiter Bildmoment\n' +
    '- usw. bis zum letzten geplanten Bild\n\n' +
    'Bei mehreren Bildphasen pro Szene ist die Bildnummer nicht gleich der Szenennummer. Die Pipeline routet die vollständige Nummernfolge automatisch. Danach reicht ein schneller Sichtcheck auf offensichtliche Inhalts- oder Stilfehler.\n',
    'utf8'
  );
  return directory;
}

function sourceRelativeToInbox(fileName) {
  return `${SOURCE_DIRECTORY}/${fileName}`;
}

function chronologicalAssignment(target, sceneOrder, phaseOrder) {
  return {
    confidence: 1,
    visualReviewed: false,
    secondPassConfirmed: false,
    sceneOrderConfirmed: true,
    confirmedTarget: target,
    confirmedSceneOrder: sceneOrder,
    suggestedSceneOrder: sceneOrder,
    suggestedPhaseOrder: phaseOrder,
    visibleSummary: '',
    reason: '',
    comparedFields: [],
    matchMethod: 'numbered-global-image-order'
  };
}

export async function prepareNumberedImageAssignments(reelDirectory, { skipWhenEmpty = false } = {}) {
  const directory = await ensureNumberedImageDropDirectory(reelDirectory);
  const prompts = await collectImagePrompts(reelDirectory);
  const imageTargetsByNumber = new Map(
    prompts.filter((entry) => entry.kind === 'scene').map((entry) => [Number(entry.order), entry])
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
      unmatched.push({ source: sourceRelativeToInbox(candidate.name), reason: 'Keine eindeutige zweistellige Bildnummer gefunden.' });
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
          reason: `Mehrere Dateien verwenden dieselbe Nummer ${String(number).padStart(2, '0')}.`
        });
      }
      continue;
    }

    const candidate = candidates[0];
    const source = sourceRelativeToInbox(candidate.name);
    const visual = imageTargetsByNumber.get(number);
    if (!visual) {
      unmatched.push({ source, reason: `Für Bildnummer ${String(number).padStart(2, '0')} existiert keine geplante Bildphase.` });
      continue;
    }

    assignments.push({
      source,
      target: visual.targetId,
      parentSceneId: visual.sceneId,
      suggestedBy: 'numbered-global-image-order',
      importNumber: number,
      ...chronologicalAssignment(visual.targetId, visual.sceneOrder, visual.phaseOrder)
    });
  }

  const mapPath = path.join(reelDirectory, 'inbox', 'asset-map.json');
  const previousMap = await readJson(mapPath, { assignments: [] });
  const preservedAssignments = Array.isArray(previousMap?.assignments)
    ? previousMap.assignments.filter((assignment) => String(assignment?.target ?? '') === 'audio')
    : [];

  const assetMap = {
    version: 5,
    generatedBy: 'numbered-image-import',
    assignmentMode: 'global-image-order-authoritative-with-fast-spot-check',
    plannedImageCount: imageTargetsByNumber.size,
    instructions: [
      'Die zweistellige Nummer ist die verbindliche globale Bildreihenfolge.',
      'Vollständige eindeutige Nummern werden automatisch auf die geplanten Bildphasen geroutet.',
      'Kein zweiter Prüfpass und keine schriftliche Match-Begründung erforderlich.',
      'Nach dem Import führt check:visuals einen schnellen technischen/visuellen Einmal-Check durch.',
      'Nur echte Konflikte wie fehlende, doppelte oder offensichtlich falsche Bilder blockieren.'
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
