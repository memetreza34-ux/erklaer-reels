#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { checkYoutubeTopic } from '../core/youtube-topic-editor.js';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function requireTrue(errors, value, label) {
  if (value !== true) errors.push(`${label} muss true sein.`);
}

async function main() {
  const dir = arg('--dir');
  if (!dir) throw new Error('Nutzung: npm run validate:youtube-phase1 -- --dir "youtube/<woche>/<thema>"');

  const repoRoot = process.cwd();
  const projectDir = path.resolve(repoRoot, dir);
  const policy = await readJson(path.join(repoRoot, 'config/youtube-channel-policy.json'));
  const meta = await readJson(path.join(projectDir, '99-technik/video.json'));
  const prompt = await readFile(path.join(projectDir, '00-bildprompts/google-flow-prompt.txt'), 'utf8');
  const errors = [];
  const schema = Number(meta.schemaVersion) || 0;
  const usesRestoredCountryballV4 = schema >= 9;

  // Schema 9+ uses the current central visual policy. Older projects stay reproducible
  // with the visual policy they were created under instead of being retroactively rewritten.
  if (usesRestoredCountryballV4) {
    if (meta.visualPolicyVersion !== policy.visualPolicyVersion) {
      errors.push(`visualPolicyVersion ist ${meta.visualPolicyVersion ?? 'fehlend'}, erwartet ${policy.visualPolicyVersion}.`);
    }
    if (meta.visualStyleId !== policy.visualStyleId) {
      errors.push(`visualStyleId ist ${meta.visualStyleId ?? 'fehlend'}, erwartet ${policy.visualStyleId}.`);
    }
    if (meta.sourceVisualWorldId !== policy.sourceVisualWorldId) {
      errors.push(`sourceVisualWorldId ist ${meta.sourceVisualWorldId ?? 'fehlend'}, erwartet ${policy.sourceVisualWorldId}.`);
    }
  } else {
    if (!Number.isFinite(Number(meta.visualPolicyVersion))) errors.push('Legacy-Projekt: visualPolicyVersion fehlt.');
    if (!String(meta.visualStyleId ?? '').trim()) errors.push('Legacy-Projekt: visualStyleId fehlt.');
  }

  const allowedTopics = new Set(policy.channelFocus.primaryTopics);
  if (!allowedTopics.has(meta.topicCategory) && meta.explicitUserRequestedOutsideFocus !== true) {
    errors.push(`topicCategory "${meta.topicCategory ?? 'fehlend'}" liegt außerhalb des YouTube-Kanalfokus und wurde nicht ausdrücklich vom Nutzer angefordert.`);
  }
  if (!meta.topicCoreLink || typeof meta.topicCoreLink !== 'string') errors.push('topicCoreLink muss den Bezug zum Kanalfokus kurz dokumentieren.');

  if (schema >= 8) {
    const proof = meta.topicEditor || {};
    if (proof.version !== 1) errors.push('topicEditor.version muss 1 sein.');
    if (proof.decision !== 'APPROVED_NEW') errors.push('topicEditor.decision muss APPROVED_NEW sein.');
    if (proof.checkedBeforeProjectCreation !== true) errors.push('topicEditor.checkedBeforeProjectCreation muss true sein.');
    if (proof.candidateTitle !== meta.title) errors.push('topicEditor.candidateTitle muss exakt dem Video-Titel entsprechen.');

    const topicResult = await checkYoutubeTopic({
      candidateTitle: meta.title,
      repoRoot,
      selfVideoId: meta.videoId || null,
      excludeProjectDir: projectDir
    });
    if (topicResult.decision !== 'APPROVED_NEW') {
      errors.push(`Themen-Editor blockiert dieses Projekt: ${topicResult.decision}; nächster Treffer: ${topicResult.closestMatch.title ?? 'unbekannt'}.`);
    }
  }

  requireTrue(errors, meta.sessionPolicy?.freshFlowSessionRequiredWhenVisualPolicyChanges, 'sessionPolicy.freshFlowSessionRequiredWhenVisualPolicyChanges');
  requireTrue(errors, meta.sessionPolicy?.continueSessionContainingLegacyStyleInstructionsForbidden, 'sessionPolicy.continueSessionContainingLegacyStyleInstructionsForbidden');
  requireTrue(errors, meta.sessionPolicy?.previousGeneratedImageAsReferenceForbidden, 'sessionPolicy.previousGeneratedImageAsReferenceForbidden');

  const q = meta.visualQualityPolicy || {};
  requireTrue(errors, q.visualStorytellingRequired, 'visualQualityPolicy.visualStorytellingRequired');
  requireTrue(errors, q.lifelessStaticCompositionForbidden, 'visualQualityPolicy.lifelessStaticCompositionForbidden');
  requireTrue(errors, q.genericCenteredObjectOnBlankBackgroundForbiddenByDefault, 'visualQualityPolicy.genericCenteredObjectOnBlankBackgroundForbiddenByDefault');
  requireTrue(errors, q.genericIconCollageForbidden, 'visualQualityPolicy.genericIconCollageForbidden');
  requireTrue(errors, q.sceneSpecificArtDirectionRequired, 'visualQualityPolicy.sceneSpecificArtDirectionRequired');
  requireTrue(errors, q.childishCartoonLookForbidden, 'visualQualityPolicy.childishCartoonLookForbidden');

  if (usesRestoredCountryballV4) {
    requireTrue(errors, q.seriousMinimalCountryballWorldRequired, 'visualQualityPolicy.seriousMinimalCountryballWorldRequired');
    requireTrue(errors, q.perfectlyRoundCountryballActorsRequired, 'visualQualityPolicy.perfectlyRoundCountryballActorsRequired');
    requireTrue(errors, q.normalIllustratedHumansForbidden, 'visualQualityPolicy.normalIllustratedHumansForbidden');
    requireTrue(errors, meta.visualWorldParityPolicy?.mustMatchReelVisualDNA, 'visualWorldParityPolicy.mustMatchReelVisualDNA');
    requireTrue(errors, meta.visualWorldParityPolicy?.countryballVisualWorldRequired, 'visualWorldParityPolicy.countryballVisualWorldRequired');
    requireTrue(errors, meta.visualWorldParityPolicy?.normalIllustratedHumansForbidden, 'visualWorldParityPolicy.normalIllustratedHumansForbidden');
    if (meta.visualWorldParityPolicy?.independentYoutubeStyle !== false) errors.push('visualWorldParityPolicy.independentYoutubeStyle muss bei Visual Policy V4 false sein.');
  } else {
    requireTrue(errors, q.controlledDepthRequired, 'visualQualityPolicy.controlledDepthRequired');
    requireTrue(errors, q.adjacentCompositionModeRepeatForbiddenWithoutReason, 'visualQualityPolicy.adjacentCompositionModeRepeatForbiddenWithoutReason');
  }

  if (schema >= 7) {
    if (meta.coverPolicyVersion !== policy.coverPolicyVersion) errors.push(`coverPolicyVersion ist ${meta.coverPolicyVersion ?? 'fehlend'}, erwartet ${policy.coverPolicyVersion}.`);
    const c = meta.coverPolicy || {};
    requireTrue(errors, c.firstSceneIsCover, 'coverPolicy.firstSceneIsCover');
    requireTrue(errors, c.coverMustBeFirstTimelineImage, 'coverPolicy.coverMustBeFirstTimelineImage');
    requireTrue(errors, c.coverMustAlsoBeThumbnailSource, 'coverPolicy.coverMustAlsoBeThumbnailSource');
    requireTrue(errors, c.separateThumbnailImageForbidden, 'coverPolicy.separateThumbnailImageForbidden');
    requireTrue(errors, c.image00Forbidden, 'coverPolicy.image00Forbidden');
    requireTrue(errors, c.headlineRequired, 'coverPolicy.headlineRequired');
    if (Number(c.coverImageNumber) !== 1) errors.push('coverPolicy.coverImageNumber muss 1 sein.');
  }

  if (schema >= 9) {
    if (meta.assetGenerationPolicyVersion !== policy.assetGenerationPolicyVersion) {
      errors.push(`assetGenerationPolicyVersion ist ${meta.assetGenerationPolicyVersion ?? 'fehlend'}, erwartet ${policy.assetGenerationPolicyVersion}.`);
    }
    const a = meta.assetGenerationPolicy || {};
    if (Number(a.coverCandidateCount) !== 3) errors.push('assetGenerationPolicy.coverCandidateCount muss 3 sein.');
    requireTrue(errors, a.coverSelectionRequired, 'assetGenerationPolicy.coverSelectionRequired');
    if (a.selectedCoverFinalName !== 'Bild 01.png') errors.push('assetGenerationPolicy.selectedCoverFinalName muss Bild 01.png sein.');
    requireTrue(errors, a.discardUnselectedCoverCandidates, 'assetGenerationPolicy.discardUnselectedCoverCandidates');
    if (Number(a.nonCoverGenerationCount) !== 1) errors.push('assetGenerationPolicy.nonCoverGenerationCount muss 1 sein.');
    requireTrue(errors, a.nonCoverManualWaveReviewForbidden, 'assetGenerationPolicy.nonCoverManualWaveReviewForbidden');
    requireTrue(errors, a.nonCoverRegenerationByDefaultForbidden, 'assetGenerationPolicy.nonCoverRegenerationByDefaultForbidden');
    if (Number(a.maxConcurrentGenerations) !== 5) errors.push('assetGenerationPolicy.maxConcurrentGenerations muss 5 sein.');
    requireTrue(errors, a.renameEachFinalImageExactlyOnce, 'assetGenerationPolicy.renameEachFinalImageExactlyOnce');
    requireTrue(errors, a.finalImagesFlatInSingleFolder, 'assetGenerationPolicy.finalImagesFlatInSingleFolder');
    if (a.finalImageDirectory !== '00-bildprompts/images') errors.push('assetGenerationPolicy.finalImageDirectory muss 00-bildprompts/images sein.');
    requireTrue(errors, a.temporaryCoverCandidatesForbiddenInFinalFolder, 'assetGenerationPolicy.temporaryCoverCandidatesForbiddenInFinalFolder');
  }

  const expectedVisualVersion = usesRestoredCountryballV4 ? policy.visualPolicyVersion : meta.visualPolicyVersion;
  const expectedStyleId = usesRestoredCountryballV4 ? policy.visualStyleId : meta.visualStyleId;
  const requiredPromptMarkers = [
    `YOUTUBE_VISUAL_POLICY_VERSION: ${expectedVisualVersion}`,
    `ACTIVE_STYLE_ID: ${expectedStyleId}`,
    'SESSION RESET HARD LOCK',
    'VISUAL STORYTELLING HARD LOCK',
    'ANTI-LIFELESS HARD LOCK',
    'Do not use any previous generated image as a visual reference.'
  ];
  if (schema >= 7) {
    requiredPromptMarkers.push(
      `COVER_POLICY_VERSION: ${policy.coverPolicyVersion}`,
      'FIRST SCENE = COVER HARD LOCK',
      'Bild 01 is the cover AND the first video scene'
    );
  }
  if (schema >= 9) {
    requiredPromptMarkers.push(
      `ASSET_GENERATION_POLICY_VERSION: ${policy.assetGenerationPolicyVersion}`,
      'COVER = 3 CANDIDATES HARD LOCK',
      'NON-COVER = SINGLE GENERATION HARD LOCK',
      'FINAL IMAGE FOLDER HARD LOCK',
      'WRITTEN STYLE LOCK — SERIOUS MINIMAL COUNTRYBALL'
    );
  }
  for (const marker of requiredPromptMarkers) if (!prompt.includes(marker)) errors.push(`Masterprompt fehlt Pflichtmarker: ${marker}`);

  const stalePatterns = [
    /MASTER-REFERENCE-REGEL/i,
    /verbindlicher MASTER-STYLE-FRAME erzeugt/i,
    /Bild 01 als Master-Style-Referenz festlegen/i,
    /jeweils mit Bild 01 als Referenz/i,
    /using it as our anchor reference/i
  ];

  if (usesRestoredCountryballV4) {
    stalePatterns.push(
      /ACTIVE_STYLE_ID:\s*premium-editorial-explainer-illustration-youtube-16x9/i,
      /WRITTEN STYLE LOCK\s*[—-]\s*PREMIUM EDITORIAL/i,
      /no mandatory mascot, no countryball template/i
    );
  } else {
    // V3 projects intentionally used the independent Editorial world.
    stalePatterns.push(/ACTIVE_STYLE_ID:\s*serious-minimal-countryball-explainer-youtube-16x9/i);
  }

  if (schema >= 7) {
    stalePatterns.push(/BILD 00\s*[—-]\s*THUMBNAIL/i, /Bild 00.*Thumbnail/i, /Bild 00.*Timeline/i, /thumbnailImageNumber"\s*:\s*0/i);
  }
  if (schema >= 9) {
    stalePatterns.push(
      /Welle prüfen/i,
      /vollständig prüfen\. Erst danach/i,
      /Fehler nur im betroffenen Bild regenerieren/i,
      /Reject and regenerate any image/i,
      /nächste Welle erst nach vollständigem Check/i
    );
  }
  for (const pattern of stalePatterns) if (pattern.test(prompt)) errors.push(`Masterprompt enthält veraltete Bildwelt-/Cover-/Phase-2-Regel: ${pattern}`);

  if (errors.length > 0) {
    console.error('YouTube Phase-1-Policy: FEHLER');
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  const topicText = schema >= 8 ? ', Themen-Editor FREI' : '';
  const assetText = schema >= 9 ? `, Asset Generation Policy V${policy.assetGenerationPolicyVersion}` : '';
  const visualLabel = usesRestoredCountryballV4 ? 'Serious-Minimal-Countryball V4' : `Legacy Visual Policy V${meta.visualPolicyVersion}`;
  console.log(`YouTube Phase-1-Policy: BESTANDEN — ${visualLabel}, Cover Policy V${policy.coverPolicyVersion}${topicText}${assetText}, Kanalfokus und Session-Schutz sind aktiv.`);
}

main().catch((error) => {
  console.error(`YouTube Phase-1-Policy: FEHLER — ${error.message}`);
  process.exitCode = 1;
});
