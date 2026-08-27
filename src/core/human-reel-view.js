import { access, lstat, mkdir, readdir, readlink, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export const HUMAN_REEL_FOLDERS = Object.freeze([
  '00-bildprompts',
  '01-voice-script',
  '02-audio',
  '03-caption',
  '04-video',
  '05-export',
  '99-technik'
]);

const LEGACY_HUMAN_REEL_FOLDERS = Object.freeze([
  '00-cover',
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
  'status.json',
  'subtitles',
  'timeline'
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
    await rm(linkPath, { force: true });
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

async function removeLegacyHumanView(reelDirectory) {
  const removed = [];
  for (const folder of LEGACY_HUMAN_REEL_FOLDERS) {
    const folderPath = path.join(reelDirectory, folder);
    if (!(await exists(folderPath))) continue;
    await rm(folderPath, { recursive: true, force: true });
    removed.push(folder);
  }
  return removed;
}

async function listSceneDirectories(reelDirectory) {
  const scenesDirectory = path.join(reelDirectory, 'scenes');
  const entries = await readdir(scenesDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && /^scene-\d+$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'de', { numeric: true }));
}

async function applyMacFinderVisibility(reelDirectory, sceneDirectories) {
  if (process.platform !== 'darwin') {
    return { applied: false, reason: 'not-macos' };
  }

  const visiblePaths = HUMAN_REEL_FOLDERS.map((entry) => path.join(reelDirectory, entry));
  const technicalPaths = [];
  for (const entry of TECHNICAL_REEL_ENTRIES) {
    const entryPath = path.join(reelDirectory, entry);
    if (await exists(entryPath)) technicalPaths.push(entryPath);
  }

  const internalMetadataPaths = [
    path.join(reelDirectory, 'cover', 'cover.json'),
    ...sceneDirectories.map((sceneDirectory) => path.join(reelDirectory, 'scenes', sceneDirectory, 'scene.json'))
  ];
  for (const entryPath of internalMetadataPaths) {
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

  const removedLegacyFolders = await removeLegacyHumanView(absoluteReelDirectory);
  const sceneDirectories = await listSceneDirectories(absoluteReelDirectory);

  await Promise.all([
    ...HUMAN_REEL_FOLDERS.map((folder) => mkdir(path.join(absoluteReelDirectory, folder), { recursive: true })),
    mkdir(path.join(absoluteReelDirectory, 'output'), { recursive: true }),
    mkdir(path.join(absoluteReelDirectory, 'export'), { recursive: true }),
    mkdir(path.join(absoluteReelDirectory, 'inbox', 'numbered-images'), { recursive: true })
  ]);

  await Promise.all([
    writeIfMissing(
      path.join(absoluteReelDirectory, '00-bildprompts', 'README.md'),
      '# 00 – Bildprompts und Bilder\n\nVerbindliche aktuelle Regeln stehen in `CURRENT_WORKFLOW.md` im Repository. Für Google Flow verwendest du die komplette Datei `99-alle-bildprompts.txt`. Google Flow erzeugt die Bilder streng einzeln: ein Bild vollständig fertigstellen → gegen den aktuellen Bildprompt prüfen → sofort `Bild XX.png` benennen → ohne weiteres Go automatisch mit dem nächsten Bild fortfahren. `Bild 00.png` ist das Cover. Danach läuft die Nummerierung über alle geplanten Bildphasen global weiter; eine Bildnummer ist nicht automatisch eine Szenennummer. Erst wenn wirklich alle Bilder fertig und korrekt benannt sind, legst du sie gemeinsam in `00-ALLE-BILDER-HIER-REIN`.\n'
    ),
    writeIfMissing(
      path.join(absoluteReelDirectory, 'inbox', 'numbered-images', 'README.md'),
      '# Nummerierter Bild-Schnellimport\n\nDieser Ordner wird erst verwendet, wenn die komplette Bildreihe fertig erzeugt und jedes Bild bereits korrekt benannt ist. `Bild 00.png` ist das Cover; danach folgt die globale Bildreihenfolge aller geplanten Bildphasen. Kompatibilitätsnamen wie `00.png`, `bild-00.png`, `bild_02.webp` oder `03-meine-szene.jpg` werden ebenfalls erkannt. Die Dateinummer bestimmt nur das vorgeschlagene Ziel; vor der endgültigen Übernahme muss jedes Bild weiterhin visuell geprüft werden.\n'
    ),
    writeIfMissing(path.join(absoluteReelDirectory, '01-voice-script', 'README.md'), '# 01 – Voice-Script\n\nHier liegt der endgültige Text für das Voice-over.\n'),
    writeIfMissing(path.join(absoluteReelDirectory, '02-audio', 'README.md'), '# 02 – Audio\n\nUnbearbeitetes Voice-over nach `AUDIO-HIER-EINFUEGEN`. Das optimierte Audio erscheint später unter `FINAL-AUDIO`.\n'),
    writeIfMissing(path.join(absoluteReelDirectory, '03-caption', 'README.md'), '# 03 – Universelle Caption\n\nHier liegt die plattformneutrale Caption für Instagram Reels, TikTok und YouTube Shorts. Dieselbe fertige Caption wird beim Rendern automatisch in den Exportbereich übernommen.\n'),
    writeIfMissing(path.join(absoluteReelDirectory, '04-video', 'README.md'), '# 04 – Fertiges Video\n\nDie finale MP4 erscheint nach dem Rendern unter `FERTIGES-VIDEO`. Der komplette Upload-Bereich liegt zusätzlich unter `05-export`.\n'),
    writeIfMissing(path.join(absoluteReelDirectory, '05-export', 'README.md'), '# 05 – Export\n\nHier liegt nach dem finalen Render alles, was du zum Hochladen brauchst:\n\n- `FERTIGES-REEL.mp4` – finales Reel\n- `UNIVERSELLE-CAPTION.txt` – dieselbe plattformneutrale Caption für Instagram Reels, TikTok und YouTube Shorts\n\nDu sollst für den normalen Upload nur diesen Ordner brauchen.\n'),
    writeIfMissing(
      path.join(absoluteReelDirectory, '99-technik', 'README.md'),
      '# 99 – Technik\n\nHier sind Quellen, Prüfberichte, Effekt-, Produktions- und Kompatibilitätsdateien gesammelt. Diesen Ordner musst du normalerweise nicht öffnen. Untertitel sind für neue Reels deaktiviert und werden hier nicht als aktiver Arbeitsbereich angeboten.\n'
    ),
    writeIfMissing(path.join(absoluteReelDirectory, 'output', 'README.md'), '# Legacy-Render-Ausgabe\n\nDieser technische Ordner bleibt aus Kompatibilitätsgründen bestehen. Der normale finale Export landet unter `export/` bzw. sichtbar unter `05-export/`.\n'),
    writeIfMissing(path.join(absoluteReelDirectory, 'export', 'README.md'), '# Finaler Export\n\nDer Renderer schreibt hier automatisch `FERTIGES-REEL.mp4` und `UNIVERSELLE-CAPTION.txt`. Videodateien werden nicht in Git gespeichert.\n')
  ]);

  const linkResults = [];
  const links = [
    ['00-bildprompts/00-ALLE-BILDER-HIER-REIN', '../inbox/numbered-images', 'dir'],
    ['00-bildprompts/00-cover', '../cover', 'dir'],
    ['00-bildprompts/99-alle-bildprompts.txt', '../all-image-prompts/all-image-prompts.txt', 'file'],
    ['01-voice-script/voice-script.txt', '../script/voice-script.txt', 'file'],
    ['02-audio/AUDIO-HIER-EINFUEGEN', '../inbox/audio', 'dir'],
    ['02-audio/FINAL-AUDIO', '../audio', 'dir'],
    ['03-caption/caption.txt', '../caption/caption.txt', 'file'],
    ['04-video/FERTIGES-VIDEO', '../export', 'dir'],
    ['05-export/FERTIGES-REEL.mp4', '../export/FERTIGES-REEL.mp4', 'file'],
    ['05-export/UNIVERSELLE-CAPTION.txt', '../export/UNIVERSELLE-CAPTION.txt', 'file'],
    ['99-technik/QUELLEN.md', '../sources/sources.md', 'file'],
    ['99-technik/PRUEFBERICHTE', '../review', 'dir'],
    ['99-technik/PRODUKTION', '../production', 'dir'],
    ['99-technik/EFFEKTE', '../effects', 'dir'],
    ['99-technik/REEL-DATEN.json', '../reel.json', 'file'],
    ['99-technik/STATUS.json', '../status.json', 'file'],
    ['99-technik/ASSET-MANIFEST.json', '../assets-manifest.json', 'file']
  ];

  for (const [index, sceneDirectory] of sceneDirectories.entries()) {
    const visibleName = `${String(index + 1).padStart(2, '0')}-${sceneDirectory}`;
    links.push([`00-bildprompts/${visibleName}`, `../scenes/${sceneDirectory}`, 'dir']);
  }

  for (const [relativeLink, target, type] of links) {
    linkResults.push(await ensureSymlink(path.join(absoluteReelDirectory, relativeLink), target, type));
  }

  const finder = hideTechnicalInFinder
    ? await applyMacFinderVisibility(absoluteReelDirectory, sceneDirectories)
    : { applied: false, reason: 'not-requested' };

  return {
    reelDirectory: absoluteReelDirectory,
    visibleFolders: HUMAN_REEL_FOLDERS,
    sceneDirectories,
    removedLegacyFolders,
    linkResults,
    finder
  };
}
