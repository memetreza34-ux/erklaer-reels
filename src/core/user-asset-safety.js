import { constants as fsConstants } from 'node:fs';
import { copyFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const TECHNICAL_DIRECTORY_NAME = '99-technik';

function normalizeOuterReelDirectory(reelDirectory) {
  const absolute = path.resolve(reelDirectory);
  return path.basename(absolute) === TECHNICAL_DIRECTORY_NAME ? path.dirname(absolute) : absolute;
}

function isWithin(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function getReelsRoot(targetReelDirectory) {
  const outer = normalizeOuterReelDirectory(targetReelDirectory);
  const dayDirectory = path.dirname(outer);
  const weekDirectory = path.dirname(dayDirectory);
  const reelsRoot = path.dirname(weekDirectory);
  return path.basename(reelsRoot) === 'reels' ? reelsRoot : null;
}

function findReelRootInsideReels(reelsRoot, candidatePath) {
  if (!reelsRoot) return null;
  const relative = path.relative(reelsRoot, candidatePath);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return null;

  const parts = relative.split(path.sep).filter(Boolean);
  if (parts.length < 3 || !parts[2].startsWith('reel-')) return null;
  return path.join(reelsRoot, parts[0], parts[1], parts[2]);
}

export function classifyUserAssetSource(targetReelDirectory, sourcePath) {
  const targetReel = normalizeOuterReelDirectory(targetReelDirectory);
  const source = path.resolve(sourcePath);
  const reelsRoot = getReelsRoot(targetReel);
  const sourceReel = findReelRootInsideReels(reelsRoot, source);

  if (sourceReel && path.resolve(sourceReel) !== path.resolve(targetReel)) {
    return {
      allowed: false,
      reason: 'cross-reel-source-forbidden',
      targetReel,
      source,
      sourceReel
    };
  }

  return {
    allowed: true,
    reason: isWithin(targetReel, source) ? 'inside-target-reel' : 'external-source',
    targetReel,
    source,
    sourceReel
  };
}

export function assertUserAssetSourceAllowed(targetReelDirectory, sourcePath) {
  const result = classifyUserAssetSource(targetReelDirectory, sourcePath);
  if (!result.allowed) {
    throw new Error(
      `Sicherheitsstopp: Nutzerasset stammt aus einem anderen Reel (${result.sourceReel}). ` +
      'Assets eines früheren Reels dürfen niemals als Ersatz für ein aktuelles Reel übernommen, verschoben oder gelöscht werden.'
    );
  }
  return result;
}

export async function copyUserAssetSafely({
  targetReelDirectory,
  sourcePath,
  targetDirectory,
  targetFileName = null
}) {
  const sourcePolicy = assertUserAssetSourceAllowed(targetReelDirectory, sourcePath);
  const targetReel = sourcePolicy.targetReel;
  const source = sourcePolicy.source;
  const destinationDirectory = path.resolve(targetDirectory);

  if (!isWithin(targetReel, destinationDirectory)) {
    throw new Error('Sicherheitsstopp: Ziel für Nutzerassets muss innerhalb des aktuellen Reel-Ordners liegen.');
  }

  const sourceStat = await stat(source);
  if (!sourceStat.isFile()) throw new Error(`Nutzerasset ist keine reguläre Datei: ${source}`);

  await mkdir(destinationDirectory, { recursive: true });
  const destination = path.join(destinationDirectory, targetFileName ?? path.basename(source));

  // COPYFILE_EXCL ist absichtlich hart: bestehende Nutzerdateien werden nie still überschrieben.
  await copyFile(source, destination, fsConstants.COPYFILE_EXCL);

  return {
    source,
    destination,
    sourcePreserved: true,
    sourcePolicy: sourcePolicy.reason
  };
}
