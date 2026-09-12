import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { collectImagePrompts } from './image-prompt-bundle.js';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg']);
const DROP_DIRECTORY = path.join('inbox', 'numbered-images');
const AUDIO_DIRECTORY = path.join('inbox', 'audio');
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

  return { number: Number(match[1]), extension };
}

export function getNumberedImageDropDirectory(reelDirectory) {
  return path.join(reelDirectory, DROP_DIRECTORY);
}

export async function ensureNumberedImageDropDirectory(reelDirectory) {
  const directory = getNumberedImageDropDirectory(reelDirectory);
  await mkdir(directory, { recursive: true });

  await writeFile(
    path.join(directory, README_FILE),
    '# Alle Bilder hier hinein\n\n' +
    'Lege die finalen Reel-Bilder in globaler Reihenfolge in diesen Ordner. Szene 1 ist zugleich das Titelbild; es gibt kein separates Reel-Thumbnail.\n\n' +
    '- `Bild 01.png` → erster geplanter Bildmoment\n' +
    '- `Bild 02.png` → zweiter geplanter Bildmoment\n' +
    '- usw. bis zur tatsächlich geplanten Bildanzahl\n\n' +
    'Die zweistellige Nummer ist für Phase 3 die verbindliche Routing-Reihenfolge. Bei mehreren Bildphasen pro Szene können mehrere aufeinanderfolgende Nummern zur gleichen Szene gehören.\n\n' +
    'Unterstützt werden PNG, JPG, JPEG und WEBP. Nach dem automatischen Routing folgt genau ein schneller visueller QC-Durchgang. Es ist keine schriftliche Begründung und kein zweiter Prüfpass pro Bild nötig.\n',
    'utf8'
  );

  return directory;
}

function sourceRelativeToInbox(fileName) {
  return `${SOURCE_DIRECTORY}/${fileName}`;
}

async function collectSingleAudioAssignment(reelDirectory, previousAssignments) {
  const preserved = previousAssignments.find((assignment) => String(assignment?.target ?? '') === 'audio');
  if (preserved) return { assignment: preserved, conflict: null };

  const directory = path.join(reelDirectory, AUDIO_DIRECTORY);
  if (!(await exists(directory))) return { assignment: null, conflict: null };

  const files = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'de', { numeric: true }));

  if (files.length === 0) return { assignment: null, conflict: null };
  if (files.length > 1) {
    return {
      assignment: null,
      conflict: {
        source: 'audio/',
        reason: `Mehrere Voice-over-Dateien gefunden (${files.join(', ')}). Das ist ein echter Hard Blocker; Phase 3 darf nicht raten.`
      }
    };
  }

  return {
    assignment: {
      source: `audio/${files[0]}`,
      target: 'audio',
      confidence: 1,
      matchMethod: 'single-audio-candidate',
      suggestedBy: 'single-current-reel-audio-file'
    },
    conflict: null
  };
}

function automaticVisualAssignment(source, visual, number) {
  return {
    source,
    target: visual.targetId,
    parentSceneId: visual.sceneId,
    importNumber: number,
    suggestedBy: 'numbered-global-image-order',
    confidence: 1,
    visualReviewed: false,
    secondPassConfirmed: false,
    sceneOrderConfirmed: true,
    confirmedTarget: visual.targetId,
    confirmedSceneOrder: visual.sceneOrder,
    confirmedPhaseOrder: visual.phaseOrder,
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
        reason: 'Dateiname enthält keine eindeutige zweistellige Bildnummer wie `Bild 01.png`.'
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
          reason: `Mehrere Dateien verwenden Bildnummer ${String(number).padStart(2, '0')}. Das ist ein echter Hard Blocker.`
        });
      }
      continue;
    }

    const candidate = candidates[0];
    const source = sourceRelativeToInbox(candidate.name);
    const visual = imageTargetsByNumber.get(number);

    if (!visual) {
      unmatched.push({
        source,
        reason: `Für Bildnummer ${String(number).padStart(2, '0')} existiert keine geplante Bildphase.`
      });
      continue;
    }

    assignments.push(automaticVisualAssignment(source, visual, number));
  }

  const expectedNumbers = [...imageTargetsByNumber.keys()].sort((a, b) => a - b);
  const missingNumbers = expectedNumbers.filter((number) => !grouped.has(number));
  for (const number of missingNumbers) {
    unmatched.push({
      source: null,
      reason: `Bild ${String(number).padStart(2, '0')} fehlt.`
    });
  }

  const mapPath = path.join(reelDirectory, 'inbox', 'asset-map.json');
  const previousMap = await readJson(mapPath, { assignments: [] });
  const previousAssignments = Array.isArray(previousMap?.assignments) ? previousMap.assignments : [];
  const audio = await collectSingleAudioAssignment(reelDirectory, previousAssignments);
  if (audio.conflict) unmatched.push(audio.conflict);

  const assetMap = {
    version: 5,
    generatedBy: 'numbered-image-import-simple-mode',
    assignmentMode: 'global-number-routing-plus-separate-fast-visual-qc',
    plannedImageCount: imageTargetsByNumber.size,
    instructions: [
      'Bildnummern bestimmen die globale chronologische Routing-Reihenfolge automatisch.',
      'Keine manuelle Bildbeschreibung, keine Match-Begründung und keine zweite Zuordnungsprüfung ausfüllen.',
      'Nach --apply läuft check:visuals --strict genau einmal als schneller visueller QC-Durchgang.',
      'Nur fehlende/doppelte Nummern, mehrere Audio-Kandidaten oder andere echte Konflikte blockieren und rechtfertigen eine Rückfrage.'
    ],
    assignments: [
      ...(audio.assignment ? [audio.assignment] : []),
      ...assignments
    ],
    unmatched
  };

  await writeJson(mapPath, assetMap);

  return {
    directory,
    mapPath,
    candidateCount: candidateFiles.length,
    plannedImageCount: imageTargetsByNumber.size,
    assignedCount: assignments.length,
    audioAssigned: Boolean(audio.assignment),
    unmatchedCount: unmatched.length,
    hardBlockerCount: unmatched.length,
    assignments,
    unmatched
  };
}
