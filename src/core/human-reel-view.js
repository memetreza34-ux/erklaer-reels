import { access, lstat, mkdir, readlink, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export const HUMAN_REEL_FOLDERS = Object.freeze([
  '00-cover',
  '01-voice-script',
  '02-audio',
  '03-szenen',
  '04-caption',
  '05-review',
  '06-video'
]);

export const TECHNICAL_REEL_ENTRIES = Object.freeze([
  'all-image-prompts',
  'assets-manifest.json',
  'audio',
  'caption',
  'cover',
  'effects',
  'inbox',
  'output',
  'production',
  'reel.json',
  'review',
  'scenes',
  'script',
  'sources',
  'status.json',
  'subtitles'
]);

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function writeIfMissing(filePath, content) {
  if (await exists(filePath)) return false;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, 'utf8');
  return true;
}

async function ensureSymlink(linkPath, target, type) {
  await mkdir(path.dirname(linkPath), { recursive: true });

  try {
    const stat = await lstat(linkPath);
    if (!stat.isSymbolicLink()) return { status: 'kept-existing', linkPath };
    const currentTarget = await readlink(linkPath);
    if (currentTarget === target) return { status: 'current', linkPath };
    return { status: 'kept-different-link', linkPath };
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  try {
    await symlink(target, linkPath, type);
    return { status: 'created', linkPath };
  } catch (error) {
    if (!['EPERM', 'EACCES', 'ENOTSUP'].includes(error?.code)) throw error;
    await writeFile(
      `${linkPath}.txt`,
      `Verknüpfungsziel: ${target}\nDie Umgebung erlaubt keine symbolischen Links. Öffne den technischen Zielpfad direkt.\n`,
      'utf8'
    );
    return { status: 'fallback-pointer', linkPath: `${linkPath}.txt` };
  }
}

async function applyMacFinderVisibility(reelDirectory) {
  if (process.platform !== 'darwin') {
    return { applied: false, reason: 'not-macos' };
  }

  const visiblePaths = HUMAN_REEL_FOLDERS.map((entry) => path.join(reelDirectory, entry));
  const technicalPaths = [];
  for (const entry of TECHNICAL_REEL_ENTRIES) {
    const entryPath = path.join(reelDirectory, entry);
    if (await exists(entryPath)) technicalPaths.push(entryPath);
  }

  try {
    if (visiblePaths.length > 0) await execFileAsync('chflags', ['nohidden', ...visiblePaths]);
    if (technicalPaths.length > 0) await execFileAsync('chflags', ['hidden', ...technicalPaths]);
    return { applied: true, hiddenCount: technicalPaths.length };
  } catch (error) {
    return { applied: false, reason: error.message };
  }
}

export async function ensureHumanReelView(reelDirectory, { hideTechnicalInFinder = false } = {}) {
  const absoluteReelDirectory = path.resolve(reelDirectory);
  if (!(await exists(path.join(absoluteReelDirectory, 'reel.json')))) {
    throw new Error(`Kein gültiger Reel-Ordner: reel.json fehlt unter ${absoluteReelDirectory}.`);
  }

  await Promise.all([
    ...HUMAN_REEL_FOLDERS.map((folder) => mkdir(path.join(absoluteReelDirectory, folder), { recursive: true })),
    mkdir(path.join(absoluteReelDirectory, 'output'), { recursive: true })
  ]);

  await Promise.all([
    writeIfMissing(path.join(absoluteReelDirectory, '00-cover', 'README.md'), '# 00 – Cover\n\nHier findest du den Cover-Prompt. Das fertige Cover kannst du über `COVER-BILD-HIER-EINFUEGEN` ablegen. Dateiname am besten: `cover.png`.\n'),
    writeIfMissing(path.join(absoluteReelDirectory, '01-voice-script', 'README.md'), '# 01 – Voice-Script\n\nHier liegt der endgültige Text für das Voice-over.\n'),
    writeIfMissing(path.join(absoluteReelDirectory, '02-audio', 'README.md'), '# 02 – Audio\n\nUnbearbeitetes Voice-over nach `AUDIO-HIER-EINFUEGEN`. Das optimierte Audio erscheint später unter `FINAL-AUDIO`.\n'),
    writeIfMissing(path.join(absoluteReelDirectory, '03-szenen', 'README.md'), '# 03 – Szenen\n\nHier liegen die chronologische Prompt-Sammeldatei, alle einzelnen Szenen und der Ordner für generierte Bilder.\n'),
    writeIfMissing(path.join(absoluteReelDirectory, '04-caption', 'README.md'), '# 04 – Caption\n\nHier liegt die fertige Social-Media-Caption.\n'),
    writeIfMissing(path.join(absoluteReelDirectory, '05-review', 'README.md'), '# 05 – Quellen und Prüfung\n\nHier findest du Quellen sowie die technischen Prüfberichte. Diese Dateien musst du normalerweise nicht bearbeiten.\n'),
    writeIfMissing(path.join(absoluteReelDirectory, '06-video', 'README.md'), '# 06 – Fertiges Video\n\nDie finale MP4 erscheint nach dem Rendern unter `FERTIGES-VIDEO`.\n'),
    writeIfMissing(path.join(absoluteReelDirectory, 'output', 'README.md'), '# Render-Ausgabe\n\nDie finale MP4 wird lokal in diesem Ordner erzeugt. Videodateien werden nicht in Git gespeichert.\n')
  ]);

  const linkResults = [];
  const links = [
    ['00-cover/cover-prompt.txt', '../cover/cover-prompt.txt', 'file'],
    ['00-cover/COVER-BILD-HIER-EINFUEGEN', '../inbox/images', 'dir'],
    ['01-voice-script/voice-script.txt', '../script/voice-script.txt', 'file'],
    ['02-audio/AUDIO-HIER-EINFUEGEN', '../inbox/audio', 'dir'],
    ['02-audio/FINAL-AUDIO', '../audio', 'dir'],
    ['03-szenen/alle-bildprompts.txt', '../all-image-prompts/all-image-prompts.txt', 'file'],
    ['03-szenen/EINZELNE-SZENEN', '../scenes', 'dir'],
    ['03-szenen/BILDER-HIER-EINFUEGEN', '../inbox/images', 'dir'],
    ['04-caption/caption.txt', '../caption/caption.txt', 'file'],
    ['05-review/quellen.md', '../sources/sources.md', 'file'],
    ['05-review/TECHNISCHE-PRUEFUNG', '../review', 'dir'],
    ['06-video/FERTIGES-VIDEO', '../output', 'dir']
  ];

  for (const [relativeLink, target, type] of links) {
    linkResults.push(await ensureSymlink(path.join(absoluteReelDirectory, relativeLink), target, type));
  }

  const finder = hideTechnicalInFinder
    ? await applyMacFinderVisibility(absoluteReelDirectory)
    : { applied: false, reason: 'not-requested' };

  return {
    reelDirectory: absoluteReelDirectory,
    visibleFolders: HUMAN_REEL_FOLDERS,
    linkResults,
    finder
  };
}
