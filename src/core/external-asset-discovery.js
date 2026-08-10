import { access, copyFile, mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import {
  getNumberedImageDropDirectory,
  parseNumberedImageFileName
} from './numbered-image-import.js';

const execFileAsync = promisify(execFile);
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg']);
const ZIP_EXTENSION = '.zip';
const DEFAULT_MAX_DEPTH = 2;
const MAX_DISCOVERY_FILES = 2500;
const RECENT_AUDIO_WINDOW_MS = 24 * 60 * 60 * 1000;

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
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function walkLimited(directory, {
  maxDepth = DEFAULT_MAX_DEPTH,
  currentDepth = 0,
  files = []
} = {}) {
  if (files.length >= MAX_DISCOVERY_FILES || !(await exists(directory))) return files;

  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    if (files.length >= MAX_DISCOVERY_FILES) break;
    if (entry.name.startsWith('.')) continue;

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (currentDepth < maxDepth) {
        await walkLimited(absolutePath, {
          maxDepth,
          currentDepth: currentDepth + 1,
          files
        });
      }
      continue;
    }

    if (!entry.isFile()) continue;
    try {
      const fileStat = await stat(absolutePath);
      files.push({
        absolutePath,
        name: entry.name,
        extension: path.extname(entry.name).toLowerCase(),
        modifiedAtMs: fileStat.mtimeMs,
        size: fileStat.size
      });
    } catch {
      // Datei kann zwischen Suche und stat verschwunden sein.
    }
  }

  return files;
}

function uniqueRoots(reelDirectory, searchRoots = null) {
  const defaults = [
    path.resolve(reelDirectory),
    path.join(os.homedir(), 'Downloads'),
    path.join(os.homedir(), 'Desktop')
  ];
  const roots = Array.isArray(searchRoots) && searchRoots.length > 0 ? searchRoots : defaults;
  return [...new Set(roots.map((entry) => path.resolve(entry)))];
}

function deduplicateFiles(files) {
  return [...new Map(files.map((file) => [file.absolutePath, file])).values()];
}

function expectedNumbers(sceneIndex) {
  const orders = sceneIndex
    .map((scene) => Number(scene.order))
    .filter((value) => Number.isInteger(value) && value > 0);
  const lastScene = orders.length > 0 ? Math.max(...orders) : 0;
  return Array.from({ length: lastScene + 1 }, (_, index) => index);
}

function analyzeNumberedNames(names, expected) {
  const grouped = new Map();
  for (const name of names) {
    const parsed = parseNumberedImageFileName(path.basename(name));
    if (!parsed) continue;
    const bucket = grouped.get(parsed.number) ?? [];
    bucket.push({ name, parsed });
    grouped.set(parsed.number, bucket);
  }

  const missing = expected.filter((number) => !grouped.has(number));
  const duplicates = expected
    .filter((number) => (grouped.get(number)?.length ?? 0) > 1)
    .map((number) => ({ number, count: grouped.get(number).length }));

  return {
    grouped,
    missing,
    duplicates,
    complete: missing.length === 0 && duplicates.length === 0
  };
}

function isSafeArchiveEntry(entry) {
  const normalized = String(entry).replaceAll('\\', '/');
  if (!normalized || normalized.startsWith('/') || /^[A-Za-z]:\//.test(normalized)) return false;
  return !normalized.split('/').some((segment) => segment === '..');
}

async function listZipEntries(zipPath) {
  try {
    const { stdout } = await execFileAsync('unzip', ['-Z1', zipPath], {
      maxBuffer: 10 * 1024 * 1024
    });
    const entries = stdout.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean);
    if (entries.some((entry) => !isSafeArchiveEntry(entry))) {
      return { supported: true, safe: false, entries: [], error: 'ZIP enthält unsichere Pfade.' };
    }
    return { supported: true, safe: true, entries, error: null };
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return { supported: false, safe: false, entries: [], error: 'Systemprogramm `unzip` ist nicht verfügbar.' };
    }
    return { supported: true, safe: false, entries: [], error: error.message };
  }
}

async function inspectZipCandidate(file, expected) {
  const listing = await listZipEntries(file.absolutePath);
  if (!listing.supported || !listing.safe) {
    return {
      ...file,
      kind: 'zip',
      usable: false,
      complete: false,
      missing: expected,
      duplicates: [],
      error: listing.error
    };
  }

  const analysis = analyzeNumberedNames(listing.entries, expected);
  return {
    ...file,
    kind: 'zip',
    usable: true,
    complete: analysis.complete,
    missing: analysis.missing,
    duplicates: analysis.duplicates,
    numberedCount: [...analysis.grouped.values()].reduce((sum, value) => sum + value.length, 0),
    entries: listing.entries,
    error: null
  };
}

async function candidateFromExplicitZip(zipPath, expected) {
  const absolutePath = path.resolve(zipPath);
  if (!(await exists(absolutePath))) throw new Error(`Angegebene ZIP nicht gefunden: ${absolutePath}`);
  const fileStat = await stat(absolutePath);
  if (!fileStat.isFile() || path.extname(absolutePath).toLowerCase() !== ZIP_EXTENSION) {
    throw new Error(`Angegebener Pfad ist keine ZIP-Datei: ${absolutePath}`);
  }
  return inspectZipCandidate({
    absolutePath,
    name: path.basename(absolutePath),
    extension: ZIP_EXTENSION,
    modifiedAtMs: fileStat.mtimeMs,
    size: fileStat.size
  }, expected);
}

async function existingNumbersInDrop(dropDirectory) {
  if (!(await exists(dropDirectory))) return new Set();
  const entries = await readdir(dropDirectory, { withFileTypes: true });
  return new Set(
    entries
      .filter((entry) => entry.isFile())
      .map((entry) => parseNumberedImageFileName(entry.name)?.number)
      .filter((value) => Number.isInteger(value))
  );
}

async function copyNumberedFiles(filesByNumber, expected, dropDirectory) {
  await mkdir(dropDirectory, { recursive: true });
  const existingNumbers = await existingNumbersInDrop(dropDirectory);
  const copied = [];

  for (const number of expected) {
    if (existingNumbers.has(number)) continue;
    const source = filesByNumber.get(number);
    if (!source) continue;
    const extension = path.extname(source).toLowerCase();
    const targetName = `Bild ${String(number).padStart(2, '0')}${extension}`;
    const targetPath = path.join(dropDirectory, targetName);
    await copyFile(source, targetPath);
    existingNumbers.add(number);
    copied.push({ number, source, target: targetPath });
  }

  return copied;
}

async function extractNumberedZip(candidate, expected, dropDirectory) {
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'erklaer-reels-zip-'));
  try {
    await execFileAsync('unzip', ['-qq', candidate.absolutePath, '-d', temporaryDirectory], {
      maxBuffer: 10 * 1024 * 1024
    });
    const extracted = await walkLimited(temporaryDirectory, { maxDepth: 6 });
    const grouped = new Map();

    for (const file of extracted) {
      const parsed = parseNumberedImageFileName(file.name);
      if (!parsed || !expected.includes(parsed.number)) continue;
      const bucket = grouped.get(parsed.number) ?? [];
      bucket.push(file.absolutePath);
      grouped.set(parsed.number, bucket);
    }

    const filesByNumber = new Map();
    for (const number of expected) {
      const bucket = grouped.get(number) ?? [];
      if (bucket.length !== 1) {
        throw new Error(`ZIP ist nach dem Entpacken nicht eindeutig für Bild ${String(number).padStart(2, '0')}.`);
      }
      filesByNumber.set(number, bucket[0]);
    }

    return copyNumberedFiles(filesByNumber, expected, dropDirectory);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

function completeLooseDirectories(files, expected) {
  const byDirectory = new Map();
  for (const file of files) {
    const parsed = parseNumberedImageFileName(file.name);
    if (!parsed) continue;
    const directory = path.dirname(file.absolutePath);
    const bucket = byDirectory.get(directory) ?? [];
    bucket.push(file);
    byDirectory.set(directory, bucket);
  }

  const candidates = [];
  for (const [directory, entries] of byDirectory) {
    const analysis = analyzeNumberedNames(entries.map((entry) => entry.name), expected);
    if (!analysis.complete) continue;
    candidates.push({
      directory,
      entries,
      modifiedAtMs: Math.max(...entries.map((entry) => entry.modifiedAtMs))
    });
  }

  return candidates.sort((left, right) => right.modifiedAtMs - left.modifiedAtMs);
}

async function importLooseNumberedSet(candidate, expected, dropDirectory) {
  const filesByNumber = new Map();
  for (const file of candidate.entries) {
    const parsed = parseNumberedImageFileName(file.name);
    if (!parsed || !expected.includes(parsed.number)) continue;
    filesByNumber.set(parsed.number, file.absolutePath);
  }
  return copyNumberedFiles(filesByNumber, expected, dropDirectory);
}

function audioNameLooksIntentional(fileName) {
  return /(voice|voiceover|speech|sprecher|narration|erz[aä]hler|eleven|audio)/i.test(fileName);
}

async function hasExistingAudio(reelDirectory) {
  const directories = [path.join(reelDirectory, 'audio'), path.join(reelDirectory, 'inbox', 'audio')];
  for (const directory of directories) {
    if (!(await exists(directory))) continue;
    const entries = await readdir(directory, { withFileTypes: true });
    if (entries.some((entry) => entry.isFile() && AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))) {
      return true;
    }
  }
  return false;
}

async function maybeStageAudio(reelDirectory, files) {
  if (await hasExistingAudio(reelDirectory)) {
    return { staged: null, candidates: [], reason: 'audio-already-present' };
  }

  const now = Date.now();
  const candidates = files
    .filter((file) => AUDIO_EXTENSIONS.has(file.extension))
    .filter((file) => now - file.modifiedAtMs <= RECENT_AUDIO_WINDOW_MS)
    .sort((left, right) => right.modifiedAtMs - left.modifiedAtMs);

  const intentional = candidates.filter((candidate) => audioNameLooksIntentional(candidate.name));
  if (intentional.length === 1) {
    const targetDirectory = path.join(reelDirectory, 'inbox', 'audio');
    await mkdir(targetDirectory, { recursive: true });
    const targetPath = path.join(targetDirectory, intentional[0].name);
    if (!(await exists(targetPath))) await copyFile(intentional[0].absolutePath, targetPath);
    return {
      staged: { source: intentional[0].absolutePath, target: targetPath },
      candidates: candidates.map((candidate) => candidate.absolutePath),
      reason: 'single-recent-intentional-audio-candidate'
    };
  }

  return {
    staged: null,
    candidates: candidates.map((candidate) => candidate.absolutePath),
    reason: candidates.length === 0 ? 'no-recent-audio-candidate' : 'audio-candidates-require-review'
  };
}

export async function discoverExternalAssets(reelDirectory, {
  searchRoots = null,
  maxDepth = DEFAULT_MAX_DEPTH,
  preferredZipPath = null
} = {}) {
  const sceneIndex = await readJson(path.join(reelDirectory, 'scenes', 'scene-index.json'), []);
  const expected = expectedNumbers(sceneIndex);
  const roots = uniqueRoots(reelDirectory, searchRoots);
  const collectedFiles = [];

  for (const root of roots) {
    await walkLimited(root, { maxDepth, files: collectedFiles });
    if (collectedFiles.length >= MAX_DISCOVERY_FILES) break;
  }
  const files = deduplicateFiles(collectedFiles);

  const dropDirectory = getNumberedImageDropDirectory(reelDirectory);
  await mkdir(dropDirectory, { recursive: true });
  const existingDropFiles = await readdir(dropDirectory, { withFileTypes: true });
  const existingAnalysis = analyzeNumberedNames(
    existingDropFiles.filter((entry) => entry.isFile()).map((entry) => entry.name),
    expected
  );

  const report = {
    version: 2,
    createdAt: new Date().toISOString(),
    reelDirectory: path.resolve(reelDirectory),
    searchRoots: roots,
    scannedFiles: files.length,
    expectedImageNumbers: expected,
    imageDiscovery: {
      alreadyComplete: existingAnalysis.complete,
      importedFrom: null,
      copiedFiles: [],
      zipCandidates: [],
      ambiguousCompleteZips: [],
      looseCandidateDirectories: [],
      ambiguousLooseSets: []
    },
    audioDiscovery: null,
    instructions: [
      'Fehlende externe Assets nicht sofort als endgültig fehlend melden: zuerst diese Discovery ausführen.',
      'Eine ZIP wird nur automatisch verwendet, wenn genau eine vollständige eindeutige nummerierte Bildserie gefunden wurde oder der Agent einen geprüften preferredZipPath vorgibt.',
      'Bei mehreren vollständigen ZIPs zuerst den passenden Kandidaten inhaltlich prüfen; niemals blind die neueste ZIP wählen.',
      'Entpackte Nummern sind nur Routing-Hilfe. Vor --apply bleibt die visuelle Zwei-Pass-QC vollständig Pflicht.',
      'Bei mehreren oder unklaren Audio-Kandidaten nicht raten; Kandidaten prüfen.'
    ]
  };

  if (!existingAnalysis.complete && expected.length > 0) {
    const zipCandidates = [];
    for (const file of files.filter((entry) => entry.extension === ZIP_EXTENSION)) {
      zipCandidates.push(await inspectZipCandidate(file, expected));
    }

    if (preferredZipPath) {
      const preferredAbsolute = path.resolve(preferredZipPath);
      let preferred = zipCandidates.find((candidate) => candidate.absolutePath === preferredAbsolute);
      if (!preferred) {
        preferred = await candidateFromExplicitZip(preferredAbsolute, expected);
        zipCandidates.push(preferred);
      }
      if (!preferred.usable || !preferred.complete) {
        throw new Error(`Ausgewählte ZIP ist für dieses Reel nicht vollständig/eindeutig: ${preferredAbsolute}`);
      }
      report.imageDiscovery.copiedFiles = await extractNumberedZip(preferred, expected, dropDirectory);
      report.imageDiscovery.importedFrom = { type: 'zip', path: preferred.absolutePath };
    } else {
      const completeZips = zipCandidates.filter((candidate) => candidate.usable && candidate.complete);
      if (completeZips.length === 1) {
        report.imageDiscovery.copiedFiles = await extractNumberedZip(completeZips[0], expected, dropDirectory);
        report.imageDiscovery.importedFrom = { type: 'zip', path: completeZips[0].absolutePath };
      } else if (completeZips.length > 1) {
        report.imageDiscovery.ambiguousCompleteZips = completeZips
          .sort((left, right) => right.modifiedAtMs - left.modifiedAtMs)
          .map((candidate) => candidate.absolutePath);
      }
    }

    report.imageDiscovery.zipCandidates = zipCandidates.map((candidate) => ({
      path: candidate.absolutePath,
      modifiedAtMs: candidate.modifiedAtMs,
      complete: candidate.complete,
      usable: candidate.usable,
      missing: candidate.missing,
      duplicates: candidate.duplicates,
      error: candidate.error
    }));

    if (!report.imageDiscovery.importedFrom && report.imageDiscovery.ambiguousCompleteZips.length === 0) {
      const looseCandidates = completeLooseDirectories(files, expected);
      report.imageDiscovery.looseCandidateDirectories = looseCandidates.map((candidate) => candidate.directory);
      if (looseCandidates.length === 1) {
        report.imageDiscovery.copiedFiles = await importLooseNumberedSet(looseCandidates[0], expected, dropDirectory);
        report.imageDiscovery.importedFrom = {
          type: 'loose-numbered-files',
          path: looseCandidates[0].directory
        };
      } else if (looseCandidates.length > 1) {
        report.imageDiscovery.ambiguousLooseSets = looseCandidates.map((candidate) => candidate.directory);
      }
    }
  }

  report.audioDiscovery = await maybeStageAudio(reelDirectory, files);
  await writeJson(path.join(reelDirectory, 'inbox', 'asset-discovery.json'), report);
  return report;
}
