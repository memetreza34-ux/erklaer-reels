import { access, copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg']);

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
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function walkFiles(directory, root = directory) {
  if (!(await exists(directory))) return [];

  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles(absolutePath, root));
    } else if (entry.isFile() && entry.name !== '.gitkeep') {
      files.push({
        absolutePath,
        relativePath: path.relative(root, absolutePath).split(path.sep).join('/')
      });
    }
  }

  return files;
}

function extensionOf(filePath) {
  return path.extname(filePath).toLowerCase();
}

function ensureInside(parentDirectory, candidatePath) {
  const relative = path.relative(parentDirectory, candidatePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Ungültiger Dateipfad außerhalb des Inbox-Ordners: ${candidatePath}`);
  }
}

export async function buildAssetInventory(reelDirectory) {
  const inboxDirectory = path.join(reelDirectory, 'inbox');
  const imagesDirectory = path.join(inboxDirectory, 'images');
  const audioDirectory = path.join(inboxDirectory, 'audio');

  await mkdir(imagesDirectory, { recursive: true });
  await mkdir(audioDirectory, { recursive: true });

  const sceneIndexPath = path.join(reelDirectory, 'scenes', 'scene-index.json');
  const sceneIndex = await readJson(sceneIndexPath, []);

  const scenes = [];
  for (const scene of sceneIndex) {
    const promptPath = path.join(reelDirectory, 'scenes', scene.sceneId, 'image-prompt.txt');
    scenes.push({
      sceneId: scene.sceneId,
      order: scene.order,
      title: scene.title,
      narration: scene.narration ?? '',
      imageText: scene.imageText ?? '',
      visualIdea: scene.visualIdea ?? '',
      imagePrompt: (await exists(promptPath)) ? (await readFile(promptPath, 'utf8')).trim() : ''
    });
  }

  const imageFiles = (await walkFiles(imagesDirectory, inboxDirectory))
    .filter((file) => IMAGE_EXTENSIONS.has(extensionOf(file.relativePath)))
    .map((file) => ({ file: file.relativePath, extension: extensionOf(file.relativePath) }));

  const audioFiles = (await walkFiles(audioDirectory, inboxDirectory))
    .filter((file) => AUDIO_EXTENSIONS.has(extensionOf(file.relativePath)))
    .map((file) => ({ file: file.relativePath, extension: extensionOf(file.relativePath) }));

  const inventory = {
    version: 1,
    reelDirectory: reelDirectory.split(path.sep).join('/'),
    createdAt: new Date().toISOString(),
    instructions: [
      'Ordne Bilder nach ihrem sichtbaren Inhalt zu, nicht nach Dateiname oder Dateireihenfolge.',
      'Vergleiche jedes Bild mit narration, imageText, visualIdea und imagePrompt der Szenen.',
      'Sichtbarer deutscher Schlüsseltext im Bild ist ein besonders starkes Zuordnungssignal.',
      'Jede Quelldatei und jedes Ziel darf höchstens einmal verwendet werden.',
      'Das Cover ist eine eigene Zuweisung und gehört nicht zu scene-01.',
      'Bei einer Konfidenz unter 0.75 bleibt die Datei unmatched statt geraten zu werden.'
    ],
    scenes,
    candidates: {
      images: imageFiles,
      audio: audioFiles
    }
  };

  await writeJson(path.join(inboxDirectory, 'asset-inventory.json'), inventory);

  const mapPath = path.join(inboxDirectory, 'asset-map.json');
  if (!(await exists(mapPath))) {
    await writeJson(mapPath, {
      version: 1,
      generatedBy: '',
      assignments: [],
      unmatched: []
    });
  }

  return inventory;
}

export async function applyAssetMap(reelDirectory) {
  const inboxDirectory = path.join(reelDirectory, 'inbox');
  const mapPath = path.join(inboxDirectory, 'asset-map.json');
  const assetMap = await readJson(mapPath);

  if (!assetMap || !Array.isArray(assetMap.assignments)) {
    throw new Error('inbox/asset-map.json fehlt oder enthält keine assignments-Liste.');
  }

  const sceneIndexPath = path.join(reelDirectory, 'scenes', 'scene-index.json');
  const sceneIndex = await readJson(sceneIndexPath, []);
  const scenesById = new Map(sceneIndex.map((scene) => [scene.sceneId, scene]));
  const manifestPath = path.join(reelDirectory, 'assets-manifest.json');
  const manifest = await readJson(manifestPath, { audio: {}, scenes: [], cover: {} });
  const statusPath = path.join(reelDirectory, 'status.json');
  const status = await readJson(statusPath, {});

  const usedSources = new Set();
  const usedTargets = new Set();
  const applied = [];
  const skipped = [];

  for (const assignment of assetMap.assignments) {
    const source = String(assignment.source ?? '').trim();
    const target = String(assignment.target ?? '').trim();
    const confidence = Number(assignment.confidence ?? 0);

    if (!source || !target) {
      skipped.push({ assignment, reason: 'source oder target fehlt' });
      continue;
    }

    if (confidence < 0.75) {
      skipped.push({ assignment, reason: 'Konfidenz unter 0.75' });
      continue;
    }

    if (usedSources.has(source) || usedTargets.has(target)) {
      skipped.push({ assignment, reason: 'Quelle oder Ziel wurde doppelt verwendet' });
      continue;
    }

    const sourcePath = path.resolve(inboxDirectory, source);
    ensureInside(path.resolve(inboxDirectory), sourcePath);

    if (!(await exists(sourcePath))) {
      skipped.push({ assignment, reason: 'Quelldatei nicht gefunden' });
      continue;
    }

    const extension = extensionOf(sourcePath);
    let destinationPath;
    let expectedRelativePath;

    if (target === 'audio') {
      if (!AUDIO_EXTENSIONS.has(extension)) {
        skipped.push({ assignment, reason: 'Datei ist kein unterstütztes Audioformat' });
        continue;
      }

      destinationPath = path.join(reelDirectory, 'audio', `voiceover${extension}`);
      expectedRelativePath = `audio/voiceover${extension}`;
      manifest.audio = {
        expectedFile: expectedRelativePath,
        source,
        confidence,
        status: 'ready'
      };
      status.audio = 'ready';
    } else if (target === 'cover') {
      if (!IMAGE_EXTENSIONS.has(extension)) {
        skipped.push({ assignment, reason: 'Datei ist kein unterstütztes Bildformat' });
        continue;
      }

      destinationPath = path.join(reelDirectory, 'cover', `cover${extension}`);
      expectedRelativePath = `cover/cover${extension}`;
      const coverPath = path.join(reelDirectory, 'cover', 'cover.json');
      const cover = await readJson(coverPath, {});
      cover.expectedImageFileName = `cover${extension}`;
      cover.status = 'ready';
      cover.source = source;
      cover.confidence = confidence;
      await writeJson(coverPath, cover);
      manifest.cover = {
        expectedFile: expectedRelativePath,
        source,
        confidence,
        status: 'ready'
      };
      status.cover = 'ready';
    } else if (scenesById.has(target)) {
      if (!IMAGE_EXTENSIONS.has(extension)) {
        skipped.push({ assignment, reason: 'Datei ist kein unterstütztes Bildformat' });
        continue;
      }

      destinationPath = path.join(reelDirectory, 'scenes', target, `${target}${extension}`);
      expectedRelativePath = `scenes/${target}/${target}${extension}`;
      const scenePath = path.join(reelDirectory, 'scenes', target, 'scene.json');
      const scene = await readJson(scenePath, scenesById.get(target));
      scene.expectedImageFileName = `${target}${extension}`;
      scene.status = 'image-ready';
      scene.source = source;
      scene.matchConfidence = confidence;
      scene.matchReason = assignment.reason ?? '';
      await writeJson(scenePath, scene);
      Object.assign(scenesById.get(target), scene);

      const manifestScene = manifest.scenes.find((item) => item.sceneId === target);
      const nextManifestScene = {
        sceneId: target,
        expectedFile: expectedRelativePath,
        source,
        confidence,
        status: 'ready'
      };
      if (manifestScene) Object.assign(manifestScene, nextManifestScene);
      else manifest.scenes.push(nextManifestScene);
    } else {
      skipped.push({ assignment, reason: `Unbekanntes Ziel: ${target}` });
      continue;
    }

    await mkdir(path.dirname(destinationPath), { recursive: true });
    await copyFile(sourcePath, destinationPath);
    usedSources.add(source);
    usedTargets.add(target);
    applied.push({ source, target, destination: expectedRelativePath, confidence });
  }

  const readySceneCount = manifest.scenes.filter((scene) => scene.status === 'ready').length;
  status.images = readySceneCount === sceneIndex.length
    ? 'ready'
    : readySceneCount > 0
      ? 'partial'
      : 'missing';

  await writeJson(sceneIndexPath, [...scenesById.values()].sort((a, b) => a.order - b.order));
  await writeJson(manifestPath, manifest);
  await writeJson(statusPath, status);

  const report = {
    createdAt: new Date().toISOString(),
    applied,
    skipped,
    unmatched: assetMap.unmatched ?? [],
    summary: {
      assignedScenes: readySceneCount,
      totalScenes: sceneIndex.length,
      audioReady: status.audio === 'ready',
      coverReady: status.cover === 'ready'
    }
  };

  await writeJson(path.join(reelDirectory, 'review', 'asset-matching-report.json'), report);
  return report;
}
