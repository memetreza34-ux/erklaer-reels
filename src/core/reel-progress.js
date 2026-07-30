import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readText(filePath) {
  return (await readFile(filePath, 'utf8')).trim();
}

async function readJson(filePath, fallback = null) {
  if (!(await exists(filePath))) return fallback;
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export async function calculateReelProgress(reelDirectory) {
  const reel = await readJson(path.join(reelDirectory, 'reel.json'), {});
  const scenes = await readJson(path.join(reelDirectory, 'scenes', 'scene-index.json'), []);
  const manifest = await readJson(path.join(reelDirectory, 'assets-manifest.json'), { scenes: [] });
  const readiness = await readJson(path.join(reelDirectory, 'review', 'content-readiness.json'), null);
  const matchingReport = await readJson(path.join(reelDirectory, 'review', 'asset-matching-report.json'), null);

  const finalScript = (await exists(path.join(reelDirectory, 'script', 'final-script.txt')))
    ? await readText(path.join(reelDirectory, 'script', 'final-script.txt'))
    : '';
  const voiceScript = (await exists(path.join(reelDirectory, 'script', 'voice-script.txt')))
    ? await readText(path.join(reelDirectory, 'script', 'voice-script.txt'))
    : '';
  const caption = (await exists(path.join(reelDirectory, 'caption', 'caption.txt')))
    ? await readText(path.join(reelDirectory, 'caption', 'caption.txt'))
    : '';
  const sources = (await exists(path.join(reelDirectory, 'sources', 'sources.md')))
    ? await readText(path.join(reelDirectory, 'sources', 'sources.md'))
    : '';
  const coverPrompt = (await exists(path.join(reelDirectory, 'cover', 'cover-prompt.txt')))
    ? await readText(path.join(reelDirectory, 'cover', 'cover-prompt.txt'))
    : '';
  const cover = await readJson(path.join(reelDirectory, 'cover', 'cover.json'), {});

  const scriptsReady = finalScript.length >= 120 && voiceScript.length >= 120;
  const styleReady = Boolean(reel.visualStyleId) && String(reel.visualStyleReason ?? '').trim().length >= 20;
  const completeScenes = scenes.filter((scene) =>
    String(scene.narration ?? '').trim().length >= 10 &&
    String(scene.visualIdea ?? '').trim().length >= 20 &&
    String(scene.continuityNotes ?? '').trim().length >= 10 &&
    Number(scene.durationSeconds ?? 0) >= 2.5
  ).length;

  let promptCount = 0;
  for (const scene of scenes) {
    const promptPath = path.join(reelDirectory, 'scenes', scene.sceneId, 'image-prompt.txt');
    if ((await exists(promptPath)) && (await readText(promptPath)).length >= 180) promptCount += 1;
  }

  const coverReady = coverPrompt.length >= 180 &&
    String(cover.headline ?? cover.title ?? '').trim().length >= 5 &&
    String(cover.visualIdea ?? '').trim().length >= 20;
  const captionReady = caption.length >= 80;
  const sourcesReady = sources.length >= 40 && sources !== '# Quellen';
  const contentCheckReady = readiness?.passed === true;

  const sceneRatio = scenes.length > 0 ? completeScenes / scenes.length : 0;
  const promptRatio = scenes.length > 0 ? promptCount / scenes.length : 0;
  const preProduction = clamp(
    (scriptsReady ? 15 : 0) +
    (styleReady ? 10 : 0) +
    sceneRatio * 25 +
    promptRatio * 25 +
    (coverReady ? 10 : 0) +
    (captionReady ? 5 : 0) +
    (sourcesReady ? 5 : 0) +
    (contentCheckReady ? 5 : 0)
  );

  const readySceneImages = Array.isArray(manifest.scenes)
    ? manifest.scenes.filter((scene) => scene.status === 'ready').length
    : 0;
  const sceneImageRatio = scenes.length > 0 ? readySceneImages / scenes.length : 0;
  const audioReady = manifest.audio?.status === 'ready';
  const coverImageReady = manifest.cover?.status === 'ready';
  const assetReportReady = Boolean(matchingReport);
  const assets = clamp(
    (audioReady ? 20 : 0) +
    sceneImageRatio * 60 +
    (coverImageReady ? 15 : 0) +
    (assetReportReady ? 5 : 0)
  );

  const overall = clamp(preProduction * 0.65 + assets * 0.35);
  const nextStep = preProduction < 100
    ? 'Codex muss production/agent-task.md fertigstellen und die strenge Inhaltsprüfung bestehen.'
    : assets < 100
      ? 'Voice-over und Bilder extern erzeugen, unsortiert in die Inbox legen und zuordnen lassen.'
      : 'Reel-Assets sind vollständig organisiert; als Nächstes folgt der Videoschnitt.';

  return {
    reelId: reel.reelId ?? path.basename(reelDirectory),
    title: reel.title ?? '',
    preProduction,
    assets,
    overall,
    details: {
      scriptsReady,
      styleReady,
      scenesReady: `${completeScenes}/${scenes.length}`,
      promptsReady: `${promptCount}/${scenes.length}`,
      coverPromptReady: coverReady,
      captionReady,
      sourcesReady,
      contentCheckReady,
      audioReady,
      sceneImagesReady: `${readySceneImages}/${scenes.length}`,
      coverImageReady,
      assetReportReady
    },
    nextStep
  };
}
