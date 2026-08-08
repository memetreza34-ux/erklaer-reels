import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  AUDIO_PACING_STYLE,
  isMeasuredLoudnessWithinTolerance,
  isTargetPlaybackRate,
  toFiniteNumberOrNull
} from '../shared/audio-pacing-style.js';

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
  const subtitlePlan = await readJson(path.join(reelDirectory, 'subtitles', 'subtitle-plan.json'), {});
  const readiness = await readJson(path.join(reelDirectory, 'review', 'content-readiness.json'), null);
  const matchingReport = await readJson(path.join(reelDirectory, 'review', 'asset-matching-report.json'), null);
  const audioPacingReport = await readJson(path.join(reelDirectory, 'review', 'audio-pacing-report.json'), null);
  const timeline = await readJson(path.join(reelDirectory, 'timeline', 'timeline-plan.json'), null);
  const renderPlan = await readJson(path.join(reelDirectory, 'render', 'render-plan.json'), null);
  const timelineReport = await readJson(path.join(reelDirectory, 'review', 'final-video-report.json'), null);
  const wordSyncReport = await readJson(path.join(reelDirectory, 'review', 'word-sync-report.json'), null);
  const visualReport = await readJson(path.join(reelDirectory, 'review', 'visual-quality-report.json'), null);
  const visualInspection = await readJson(path.join(reelDirectory, 'review', 'visual-inspection.json'), null);
  const rendererInputReport = await readJson(path.join(reelDirectory, 'review', 'renderer-input-report.json'), null);
  const renderExecutionReport = await readJson(path.join(reelDirectory, 'review', 'render-execution-report.json'), null);

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

  const audioPacingCreated = Boolean(audioPacingReport?.createdAt);
  const audioPacingRate = toFiniteNumberOrNull(audioPacingReport?.playbackRate) ?? 0;
  const audioPacingRateSafe = isTargetPlaybackRate(audioPacingRate);
  const audioLoudnessNormalized = audioPacingReport?.loudnessNormalized === true;
  const audioLoudnessTarget = toFiniteNumberOrNull(audioPacingReport?.loudnessSettings?.loudnessTargetLufs);
  const audioTruePeakTarget = toFiniteNumberOrNull(audioPacingReport?.loudnessSettings?.truePeakDbtp);
  const audioLoudnessTargetSafe = audioLoudnessTarget === AUDIO_PACING_STYLE.loudnessTargetLufs;
  const audioTruePeakSafe = audioTruePeakTarget === AUDIO_PACING_STYLE.truePeakDbtp;
  const audioMeasurementRequired = Number(audioPacingReport?.version ?? 0) >= 5;
  const measuredIntegratedLufs = toFiniteNumberOrNull(audioPacingReport?.loudnessMeasurement?.integratedLufs);
  const measuredTruePeakDbtp = toFiniteNumberOrNull(audioPacingReport?.loudnessMeasurement?.truePeakDbtp);
  const audioMeasurementPresent = !audioMeasurementRequired || (
    audioPacingReport?.loudnessMeasured === true &&
    measuredIntegratedLufs !== null &&
    measuredTruePeakDbtp !== null
  );
  const audioMeasurementSafe = !audioMeasurementRequired || (
    audioPacingReport?.loudnessMeasurement?.passed === true &&
    isMeasuredLoudnessWithinTolerance(
      { integratedLufs: measuredIntegratedLufs, truePeakDbtp: measuredTruePeakDbtp },
      { loudnessTargetLufs: audioLoudnessTarget, truePeakTargetDbtp: audioTruePeakTarget }
    )
  );
  const audioPacingDurationReduced = Number(audioPacingReport?.afterSeconds) > 0 &&
    Number(audioPacingReport?.afterSeconds) < Number(audioPacingReport?.beforeSeconds);
  const audioPacingPassed = audioPacingReport?.passed === true &&
    audioPacingRateSafe &&
    audioLoudnessNormalized &&
    audioLoudnessTargetSafe &&
    audioTruePeakSafe &&
    audioMeasurementPresent &&
    audioMeasurementSafe &&
    audioPacingDurationReduced;
  const audioPacing = clamp(
    (audioPacingCreated ? 15 : 0) +
    (audioPacingReport?.passed === true ? 20 : 0) +
    (audioPacingRateSafe ? 25 : 0) +
    (audioLoudnessNormalized && audioLoudnessTargetSafe && audioTruePeakSafe && audioMeasurementPresent && audioMeasurementSafe ? 20 : 0) +
    (audioPacingDurationReduced ? 20 : 0)
  );

  const timelineBuilt = Boolean(timeline);
  const audioDurationKnown = timeline?.audio?.exactDurationKnown === true;
  const audioSynced = timeline?.timingStatus === 'audio-synced';
  const renderReady = renderPlan?.status === 'ready-for-renderer';
  const timelineCheckReady = timelineReport?.passed === true;
  const timelineProgress = clamp(
    (timelineBuilt ? 20 : 0) +
    (audioDurationKnown ? 20 : 0) +
    (audioSynced ? 30 : 0) +
    (renderReady ? 20 : 0) +
    (timelineCheckReady ? 10 : 0)
  );

  const wordSyncRequired = reel.subtitlesEnabled !== false && subtitlePlan.enabled !== false;
  const wordSyncCreated = Boolean(wordSyncReport);
  const measuredWordCoverage = Number(wordSyncReport?.coverage ?? 0);
  const measuredWordSyncProvider = wordSyncReport?.provider ?? null;
  const measuredWordSyncPassed = wordSyncReport?.passed === true &&
    measuredWordCoverage >= 0.98 &&
    Number(wordSyncReport?.cueCount ?? 0) > 0 &&
    measuredWordSyncProvider === 'codex-local-audio-review';
  const wordSyncPassed = wordSyncRequired ? measuredWordSyncPassed : true;
  const wordSyncProvider = wordSyncRequired ? measuredWordSyncProvider : 'not-required';
  const wordCoverage = wordSyncRequired ? measuredWordCoverage : 1;
  const wordSync = wordSyncRequired
    ? clamp(
      (wordSyncCreated ? 20 : 0) +
      Math.min(1, Math.max(0, wordCoverage)) * 50 +
      (wordSyncPassed ? 30 : 0)
    )
    : 100;

  const expectedVisualAssets = scenes.length + 1;
  const reviewedAssets = Array.isArray(visualInspection?.assets)
    ? visualInspection.assets.filter((asset) => asset.status === 'passed').length
    : 0;
  const reviewedRatio = expectedVisualAssets > 0 ? reviewedAssets / expectedVisualAssets : 0;
  const visualReportCreated = Boolean(visualReport);
  const visualTechnicalReady = visualReport?.passed === true;
  const visualStrictReady = visualReport?.passed === true && visualReport?.strict === true;
  const visualQuality = clamp(
    (visualReportCreated ? 20 : 0) +
    (visualTechnicalReady ? 30 : 0) +
    reviewedRatio * 30 +
    (visualStrictReady ? 20 : 0)
  );

  const productionReady = clamp(
    preProduction * 0.4 +
    assets * 0.2 +
    audioPacing * 0.1 +
    timelineProgress * 0.12 +
    wordSync * 0.08 +
    visualQuality * 0.1
  );

  const rendererValidated = rendererInputReport?.passed === true;
  const renderComplete = renderExecutionReport?.passed === true &&
    Boolean(renderExecutionReport?.outputFile) &&
    await exists(renderExecutionReport.outputFile);
  const rendering = renderComplete ? 100 : rendererValidated ? 30 : 0;
  const overall = clamp(productionReady * 0.9 + rendering * 0.1);

  let nextStep;
  if (preProduction < 100) {
    nextStep = 'Codex muss production/agent-task.md fertigstellen und die strenge Inhaltsprüfung bestehen.';
  } else if (assets < 100) {
    nextStep = 'Voice-over und Bilder direkt in die vorgesehenen Audio-, Cover- und Szenenordner legen und prüfen.';
  } else if (audioPacing < 100) {
    nextStep = `Mit trim:pauses das Voice-over auf ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}x beschleunigen, Pausen kürzen und auf ${AUDIO_PACING_STYLE.loudnessTargetLufs} LUFS normalisieren und nachmessen.`;
  } else if (timelineProgress < 100) {
    nextStep = 'Master-Timeline mit dem optimierten Audio erzeugen, echte Audio-Cues eintragen und sync:audio streng ausführen.';
  } else if (wordSyncRequired && wordSync < 100) {
    nextStep = 'sync:words vorbereiten, production/codex-word-sync-task.md akustisch bearbeiten und danach mit --apply --strict übernehmen.';
  } else if (visualQuality < 100) {
    nextStep = 'check:visuals ausführen, jedes Bild visuell prüfen und die strenge visuelle Abnahme bestehen.';
  } else if (!rendererValidated) {
    nextStep = 'finalize:reel --strict und anschließend validate:render ausführen.';
  } else if (!renderComplete) {
    nextStep = 'Mit render:reel die fertige MP4-Datei erzeugen.';
  } else {
    nextStep = 'Reel ist vollständig gerendert und bereit zur Veröffentlichung.';
  }

  return {
    reelId: reel.reelId ?? path.basename(reelDirectory),
    title: reel.title ?? '',
    preProduction,
    assets,
    audioPacing,
    timeline: timelineProgress,
    wordSync,
    visualQuality,
    productionReady,
    rendering,
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
      assetReportReady,
      audioPacingCreated,
      audioPacingPassed,
      audioPacingRate,
      audioPacingRateSafe,
      audioLoudnessNormalized,
      audioLoudnessTargetSafe,
      audioTruePeakSafe,
      audioMeasurementRequired,
      audioMeasurementPresent,
      audioMeasurementSafe,
      measuredIntegratedLufs,
      measuredTruePeakDbtp,
      audioPacingDurationReduced,
      timelineBuilt,
      audioDurationKnown,
      audioSynced,
      renderReady,
      timelineCheckReady,
      wordSyncRequired,
      wordSyncCreated,
      wordSyncPassed,
      wordSyncProvider,
      wordCoverage,
      visualReportCreated,
      visualTechnicalReady,
      visualAssetsReviewed: `${reviewedAssets}/${expectedVisualAssets}`,
      visualStrictReady,
      rendererValidated,
      renderComplete
    },
    nextStep
  };
}
