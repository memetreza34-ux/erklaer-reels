import { access, lstat, mkdir, readdir, readlink, rename, rm, symlink } from 'node:fs/promises';
import path from 'node:path';

export const TECHNICAL_DIRECTORY_NAME = '99-technik';

export const COMPACT_TECHNICAL_ENTRIES = Object.freeze([
  'assets-manifest.json',
  'audio',
  'caption',
  'cover',
  'effects',
  'export',
  'inbox',
  'output',
  'production',
  'reel.json',
  'render',
  'review',
  'scenes',
  'script',
  'sources',
  'status',
  'status.json',
  'subtitles',
  'timeline'
]);

const OBSOLETE_TECHNICAL_ALIASES = Object.freeze([
  'ASSET-MANIFEST.json',
  'AUDIO',
  'AUDIO-INTERN',
  'CAPTION',
  'CAPTION-INTERN',
  'EFFECTS',
  'EFFEKTE',
  'EXPORT-INTERN',
  'EXPORT-TECHNIK',
  'INBOX',
  'OUTPUT',
  'OUTPUT-INTERN',
  'PRODUKTION',
  'PRUEFBERICHTE',
  'QUELLEN.md',
  'REEL-DATEN.json',
  'REEL.json',
  'RENDER-INTERN',
  'REVIEW',
  'SCENES',
  'SCRIPT',
  'SCRIPT-INTERN',
  'SOURCES',
  'STATUS.json',
  'SZENEN',
  'TIMELINE-INTERN'
]);

async function statOrNull(filePath) {
  try {
    return await lstat(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function normalizeOuterReelDirectory(reelDirectory) {
  const absolute = path.resolve(reelDirectory);
  return path.basename(absolute) === TECHNICAL_DIRECTORY_NAME
    ? path.dirname(absolute)
    : absolute;
}

export async function getReelLayout(reelDirectory) {
  const outerDirectory = normalizeOuterReelDirectory(reelDirectory);
  const compactTechnicalDirectory = path.join(outerDirectory, TECHNICAL_DIRECTORY_NAME);

  if (await exists(path.join(compactTechnicalDirectory, 'reel.json'))) {
    return {
      outerDirectory,
      technicalDirectory: compactTechnicalDirectory,
      compact: true
    };
  }

  if (await exists(path.join(outerDirectory, 'reel.json'))) {
    return {
      outerDirectory,
      technicalDirectory: outerDirectory,
      compact: false
    };
  }

  throw new Error(`Kein gültiger Reel-Ordner: reel.json fehlt unter ${outerDirectory}.`);
}

export async function isCompactReelLayout(reelDirectory) {
  try {
    return (await getReelLayout(reelDirectory)).compact;
  } catch {
    return false;
  }
}

async function ensureRelativeSymlink(linkPath, target) {
  await mkdir(path.dirname(linkPath), { recursive: true });
  const stat = await statOrNull(linkPath);
  if (stat) {
    if (!stat.isSymbolicLink()) return false;
    const currentTarget = await readlink(linkPath).catch(() => '');
    if (currentTarget === target) return false;
    await rm(linkPath, { force: true });
  }
  await symlink(target, linkPath);
  return true;
}

async function refreshVisibleCompatibilityLinks(outerDirectory, technicalDirectory) {
  const changed = [];
  const fixedLinks = [
    ['00-bildprompts/00-ALLE-BILDER-HIER-REIN', '../99-technik/inbox/numbered-images'],
    ['01-voice-script/voice-script.txt', '../99-technik/script/voice-script.txt'],
    ['02-audio/AUDIO-HIER-EINFUEGEN', '../99-technik/inbox/audio'],
    ['02-audio/FINAL-AUDIO', '../99-technik/audio']
  ];

  const optionalFileLinks = [
    ['03-export/FERTIGES-REEL.mp4', '../99-technik/export/FERTIGES-REEL.mp4', 'export/FERTIGES-REEL.mp4'],
    ['03-export/UNIVERSELLE-CAPTION.txt', '../99-technik/export/UNIVERSELLE-CAPTION.txt', 'export/UNIVERSELLE-CAPTION.txt']
  ];

  for (const [relativeLink, target] of fixedLinks) {
    const targetPath = path.resolve(path.dirname(path.join(outerDirectory, relativeLink)), target);
    if (!(await statOrNull(targetPath))) continue;
    if (await ensureRelativeSymlink(path.join(outerDirectory, relativeLink), target)) changed.push(relativeLink);
  }

  for (const [relativeLink, target, technicalTarget] of optionalFileLinks) {
    const linkPath = path.join(outerDirectory, relativeLink);
    if (await statOrNull(path.join(technicalDirectory, technicalTarget))) {
      if (await ensureRelativeSymlink(linkPath, target)) changed.push(relativeLink);
    } else {
      const stat = await statOrNull(linkPath);
      if (stat?.isSymbolicLink()) {
        await rm(linkPath, { force: true });
        changed.push(relativeLink);
      }
    }
  }

  const promptDirectory = path.join(outerDirectory, '00-bildprompts');
  await mkdir(promptDirectory, { recursive: true });

  let promptEntries = [];
  try {
    promptEntries = await readdir(promptDirectory, { withFileTypes: true });
  } catch {}
  for (const entry of promptEntries) {
    if (!/^\d{2}-scene-\d+$/.test(entry.name)) continue;
    const entryPath = path.join(promptDirectory, entry.name);
    const stat = await statOrNull(entryPath);
    if (stat?.isSymbolicLink()) await rm(entryPath, { force: true });
  }

  const scenesDirectory = path.join(technicalDirectory, 'scenes');
  let sceneEntries = [];
  try {
    sceneEntries = await readdir(scenesDirectory, { withFileTypes: true });
  } catch {}
  const sceneNames = sceneEntries
    .filter((entry) => entry.isDirectory() && /^scene-\d+$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'de', { numeric: true }));

  for (const [index, sceneName] of sceneNames.entries()) {
    const visibleName = `${String(index + 1).padStart(2, '0')}-${sceneName}`;
    const relativeLink = `00-bildprompts/${visibleName}`;
    const target = `../99-technik/scenes/${sceneName}`;
    if (await ensureRelativeSymlink(path.join(outerDirectory, relativeLink), target)) changed.push(relativeLink);
  }

  return changed;
}

async function removeObsoleteAliases(technicalDirectory) {
  const removed = [];
  for (const name of OBSOLETE_TECHNICAL_ALIASES) {
    const aliasPath = path.join(technicalDirectory, name);
    const stat = await statOrNull(aliasPath);
    if (!stat) continue;
    if (!stat.isSymbolicLink() && name === 'STATUS.json') continue;
    await rm(aliasPath, { recursive: true, force: true });
    removed.push(name);
  }
  return removed;
}

export async function compactReelLayout(reelDirectory) {
  const outerDirectory = normalizeOuterReelDirectory(reelDirectory);
  const technicalDirectory = path.join(outerDirectory, TECHNICAL_DIRECTORY_NAME);
  await mkdir(technicalDirectory, { recursive: true });

  const movedEntries = [];
  const removedCompatibilityLinks = [];

  for (const entry of COMPACT_TECHNICAL_ENTRIES) {
    const sourcePath = path.join(outerDirectory, entry);
    const destinationPath = path.join(technicalDirectory, entry);
    const sourceStat = await statOrNull(sourcePath);
    if (!sourceStat) continue;

    const destinationStat = await statOrNull(destinationPath);

    // Temporäre Kompatibilitätslinks werden nach einem Pipeline-Lauf nur entfernt.
    if (sourceStat.isSymbolicLink()) {
      const currentTarget = await readlink(sourcePath).catch(() => '');
      if (destinationStat || currentTarget.includes(TECHNICAL_DIRECTORY_NAME)) {
        await rm(sourcePath, { recursive: true, force: true });
        removedCompatibilityLinks.push(entry);
        continue;
      }
    }

    if (destinationStat) {
      if (destinationStat.isSymbolicLink()) {
        await rm(destinationPath, { recursive: true, force: true });
      } else {
        throw new Error(
          `Kompakte Reel-Struktur kann ${entry} nicht verschieben: Ziel existiert bereits unter ${destinationPath}.`
        );
      }
    }

    await rename(sourcePath, destinationPath);
    movedEntries.push(entry);
  }

  if (!(await exists(path.join(technicalDirectory, 'reel.json')))) {
    throw new Error(`Kompakte Reel-Struktur fehlgeschlagen: ${technicalDirectory}/reel.json fehlt.`);
  }

  const removedAliases = await removeObsoleteAliases(technicalDirectory);
  const refreshedVisibleLinks = await refreshVisibleCompatibilityLinks(outerDirectory, technicalDirectory);

  return {
    outerDirectory,
    technicalDirectory,
    compact: true,
    movedEntries,
    removedCompatibilityLinks,
    removedAliases,
    refreshedVisibleLinks
  };
}

export async function materializeLegacyTechnicalLinks(reelDirectory) {
  const layout = await getReelLayout(reelDirectory);
  if (!layout.compact) {
    return {
      compact: false,
      createdLinks: [],
      cleanup: async () => {}
    };
  }

  const createdLinks = [];

  for (const entry of COMPACT_TECHNICAL_ENTRIES) {
    const targetPath = path.join(layout.technicalDirectory, entry);
    if (!(await statOrNull(targetPath))) continue;

    const linkPath = path.join(layout.outerDirectory, entry);
    if (await statOrNull(linkPath)) continue;

    const relativeTarget = path.join(TECHNICAL_DIRECTORY_NAME, entry);
    await symlink(relativeTarget, linkPath);
    createdLinks.push({ linkPath, relativeTarget });
  }

  const cleanup = async () => {
    for (const { linkPath, relativeTarget } of createdLinks.reverse()) {
      const stat = await statOrNull(linkPath);
      if (!stat?.isSymbolicLink()) continue;
      const currentTarget = await readlink(linkPath).catch(() => '');
      if (currentTarget !== relativeTarget) continue;
      await rm(linkPath, { force: true });
    }
  };

  return {
    compact: true,
    createdLinks: createdLinks.map(({ linkPath }) => path.basename(linkPath)),
    cleanup
  };
}
