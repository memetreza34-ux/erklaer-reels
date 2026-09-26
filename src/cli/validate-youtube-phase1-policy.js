#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { checkYoutubeTopic } from '../core/youtube-topic-editor.js';
import { validateYoutubeScriptOpening } from '../core/youtube-script-opening.js';

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

function validateTopicAnchors(errors, prompt, plannedImageCount) {
  const count = Number(plannedImageCount);
  if (!Number.isInteger(count) || count < 1) {
    errors.push('Schema-12+: plannedImageCount muss vor Phase 2 als positive Ganzzahl feststehen.');
    return;
  }

  for (let imageNumber = 1; imageNumber <= count; imageNumber += 1) {
    const nn = String(imageNumber).padStart(2, '0');
    const start = prompt.search(new RegExp(`(?:^|\\n)BILD\\s+${nn}\\b`, 'i'));
    if (start < 0) {
      errors.push(`Topic Visual Relevance V1: Bild ${nn} fehlt im Masterprompt.`);
      continue;
    }
    const afterStart = prompt.slice(start);
    const nextMatch = afterStart.slice(1).search(/\nBILD\s+\d{2,}\b/i);
    const end = nextMatch >= 0 ? start + 1 + nextMatch : prompt.length;
    const block = prompt.slice(start, end);
    if (!/Topic Anchor:\s*[^\n\[]+/i.test(block)) {
      errors.push(`Topic Visual Relevance V1: Bild ${nn} braucht einen konkreten Topic Anchor.`);
    }
  }
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
  const usesCountryball = schema >= 9;
  const usesPremiumCountryballV5 = schema >= 10;
  const usesScriptOpeningV1 = schema >= 11;
  const usesTopicVisualRelevanceV1 = schema >= 12;

  // Schema 10+ follows the current V5 visual policy. Schema 11+ locks the direct
  // viewer-question opening. Schema 12+ additionally locks concrete scene
  // illustration, topic-specific visual relevance and a deliberate final hold.
  if (usesPremiumCountryballV5) {
    if (meta.visualPolicyVersion !== policy.visualPolicyVersion) {
      errors.push(`visualPolicyVersion ist ${meta.visualPolicyVersion ?? 'fehlend'}, erwartet ${policy.visualPolicyVersion}.`);
    }
    if (meta.designQualityVersion !== policy.designQualityVersion) {
      errors.push(`designQualityVersion ist ${meta.designQualityVersion ?? 'fehlend'}, erwartet ${policy.designQualityVersion}.`);
    }
    if (meta.adaptivePacingVersion !== policy.adaptivePacingVersion) {
      errors.push(`adaptivePacingVersion ist ${meta.adaptivePacingVersion ?? 'fehlend'}, erwartet ${policy.adaptivePacingVersion}.`);
    }
    if (meta.visualStyleId !== policy.visualStyleId) {
      errors.push(`visualStyleId ist ${meta.visualStyleId ?? 'fehlend'}, erwartet ${policy.visualStyleId}.`);
    }
    if (meta.sourceVisualWorldId !== policy.sourceVisualWorldId) {
      errors.push(`sourceVisualWorldId ist ${meta.sourceVisualWorldId ?? 'fehlend'}, erwartet ${policy.sourceVisualWorldId}.`);
    }
  } else if (schema === 9) {
    if (Number(meta.visualPolicyVersion) !== 4) errors.push('Schema-9-Projekt muss Visual Policy V4 behalten.');
    if (meta.visualStyleId !== 'serious-minimal-countryball-explainer-youtube-16x9') errors.push('Schema-9-Projekt muss die Countryball-V4-Style-ID behalten.');
    if (meta.sourceVisualWorldId !== 'serious-minimal-countryball-explainer') errors.push('Schema-9-Projekt muss die Reel-Countryball-Quellwelt behalten.');
  } else {
    if (!Number.isFinite(Number(meta.visualPolicyVersion))) errors.push('Legacy-Projekt: visualPolicyVersion fehlt.');
    if (!String(meta.visualStyleId ?? '').trim()) errors.push('Legacy-Projekt: visualStyleId fehlt.');
  }

  if (usesScriptOpeningV1) {
    if (meta.scriptOpeningPolicyVersion !== policy.scriptOpeningPolicyVersion) {
      errors.push(`scriptOpeningPolicyVersion ist ${meta.scriptOpeningPolicyVersion ?? 'fehlend'}, erwartet ${policy.scriptOpeningPolicyVersion}.`);
    }
    if (meta.explicitScriptOpeningOverride !== true) {
      let script = '';
      try {
        script = await readFile(path.join(projectDir, '01-voice-script/voice-script.txt'), 'utf8');
      } catch {
        errors.push('Script Opening V1: 01-voice-script/voice-script.txt fehlt.');
      }
      if (script) {
        const openingResult = validateYoutubeScriptOpening(script, policy.scriptOpeningPolicy);
        for (const error of openingResult.errors) errors.push(`Script Opening V${policy.scriptOpeningPolicyVersion}: ${error}`);
      }
    }
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

  if (usesCountryball) {
    requireTrue(errors, q.seriousMinimalCountryballWorldRequired, 'visualQualityPolicy.seriousMinimalCountryballWorldRequired');
    requireTrue(errors, q.perfectlyRoundCountryballActorsRequired, 'visualQualityPolicy.perfectlyRoundCountryballActorsRequired');
    requireTrue(errors, q.normalIllustratedHumansForbidden, 'visualQualityPolicy.normalIllustratedHumansForbidden');
    requireTrue(errors, meta.visualWorldParityPolicy?.mustMatchReelVisualDNA, 'visualWorldParityPolicy.mustMatchReelVisualDNA');
    requireTrue(errors, meta.visualWorldParityPolicy?.countryballVisualWorldRequired, 'visualWorldParityPolicy.countryballVisualWorldRequired');
    requireTrue(errors, meta.visualWorldParityPolicy?.normalIllustratedHumansForbidden, 'visualWorldParityPolicy.normalIllustratedHumansForbidden');
    if (meta.visualWorldParityPolicy?.independentYoutubeStyle !== false) errors.push('visualWorldParityPolicy.independentYoutubeStyle muss false sein.');
  } else {
    requireTrue(errors, q.controlledDepthRequired, 'visualQualityPolicy.controlledDepthRequired');
    requireTrue(errors, q.adjacentCompositionModeRepeatForbiddenWithoutReason, 'visualQualityPolicy.adjacentCompositionModeRepeatForbiddenWithoutReason');
  }

  if (usesPremiumCountryballV5) {
    requireTrue(errors, q.premiumCompositionRequired, 'visualQualityPolicy.premiumCompositionRequired');
    requireTrue(errors, q.intentionalPaletteRequired, 'visualQualityPolicy.intentionalPaletteRequired');
    requireTrue(errors, q.typographyHierarchyRequiredWhenTextPresent, 'visualQualityPolicy.typographyHierarchyRequiredWhenTextPresent');
    requireTrue(errors, q.balancedNegativeSpaceRequired, 'visualQualityPolicy.balancedNegativeSpaceRequired');
    requireTrue(errors, q.mapLegibilityRequired, 'visualQualityPolicy.mapLegibilityRequired');
    requireTrue(errors, q.visualRelationshipOverIconListingRequired, 'visualQualityPolicy.visualRelationshipOverIconListingRequired');
    requireTrue(errors, q.premiumDoesNotAuthorizeStyleChange, 'visualQualityPolicy.premiumDoesNotAuthorizeStyleChange');

    const density = meta.imageDensityPolicy || {};
    requireTrue(errors, density.contentDrivenImageCountRequired, 'imageDensityPolicy.contentDrivenImageCountRequired');
    requireTrue(errors, density.fixedImageCountForbidden, 'imageDensityPolicy.fixedImageCountForbidden');
    requireTrue(errors, density.splitOnNewVisualIdeaRequired, 'imageDensityPolicy.splitOnNewVisualIdeaRequired');
    requireTrue(errors, density.splitOnEraLocationPerspectiveChangeRequired, 'imageDensityPolicy.splitOnEraLocationPerspectiveChangeRequired');
    requireTrue(errors, density.splitCauseEffectWhenDense, 'imageDensityPolicy.splitCauseEffectWhenDense');
    requireTrue(errors, density.allowMoreImagesWhenNarrativelyUseful, 'imageDensityPolicy.allowMoreImagesWhenNarrativelyUseful');
    requireTrue(errors, density.doNotAddFillerImages, 'imageDensityPolicy.doNotAddFillerImages');
    if (density.globalHardMaximumSeconds !== 16) errors.push('imageDensityPolicy.globalHardMaximumSeconds muss 16 sein.');
    if (density.softReviewAboveSeconds !== 9) errors.push('imageDensityPolicy.softReviewAboveSeconds muss 9 sein.');
    if (density.strongSplitReviewAboveSeconds !== 11) errors.push('imageDensityPolicy.strongSplitReviewAboveSeconds muss 11 sein.');
  }

  if (usesTopicVisualRelevanceV1) {
    if (meta.sceneIllustrationPolicyVersion !== policy.sceneIllustrationPolicyVersion) {
      errors.push(`sceneIllustrationPolicyVersion ist ${meta.sceneIllustrationPolicyVersion ?? 'fehlend'}, erwartet ${policy.sceneIllustrationPolicyVersion}.`);
    }
    if (meta.topicVisualRelevancePolicyVersion !== policy.topicVisualRelevancePolicyVersion) {
      errors.push(`topicVisualRelevancePolicyVersion ist ${meta.topicVisualRelevancePolicyVersion ?? 'fehlend'}, erwartet ${policy.topicVisualRelevancePolicyVersion}.`);
    }
    if (meta.endHoldPolicyVersion !== policy.endHoldPolicyVersion) {
      errors.push(`endHoldPolicyVersion ist ${meta.endHoldPolicyVersion ?? 'fehlend'}, erwartet ${policy.endHoldPolicyVersion}.`);
    }

    const scene = meta.sceneIllustrationPolicy || {};
    requireTrue(errors, scene.concreteIllustratedScenePreferred, 'sceneIllustrationPolicy.concreteIllustratedScenePreferred');
    requireTrue(errors, scene.abstractInfographicPosterForbiddenByDefault, 'sceneIllustrationPolicy.abstractInfographicPosterForbiddenByDefault');
    requireTrue(errors, scene.multiPanelDashboardForbiddenByDefault, 'sceneIllustrationPolicy.multiPanelDashboardForbiddenByDefault');
    requireTrue(errors, scene.iconGridAsPrimaryCompositionForbidden, 'sceneIllustrationPolicy.iconGridAsPrimaryCompositionForbidden');
    requireTrue(errors, scene.recognizablePlaceOrSituationPreferred, 'sceneIllustrationPolicy.recognizablePlaceOrSituationPreferred');
    requireTrue(errors, scene.sceneBasedColorVariationRequired, 'sceneIllustrationPolicy.sceneBasedColorVariationRequired');
    requireTrue(errors, scene.textMustSupportSceneNotReplaceScene, 'sceneIllustrationPolicy.textMustSupportSceneNotReplaceScene');

    const relevance = meta.topicVisualRelevancePolicy || {};
    requireTrue(errors, relevance.eachImageMustBeSpecificToVideoTopic, 'topicVisualRelevancePolicy.eachImageMustBeSpecificToVideoTopic');
    requireTrue(errors, relevance.sentenceAndTopicDualMatchRequired, 'topicVisualRelevancePolicy.sentenceAndTopicDualMatchRequired');
    requireTrue(errors, relevance.topicAnchorRequiredPerImagePlan, 'topicVisualRelevancePolicy.topicAnchorRequiredPerImagePlan');
    requireTrue(errors, relevance.interchangeableGenericSceneForbidden, 'topicVisualRelevancePolicy.interchangeableGenericSceneForbidden');
    requireTrue(errors, relevance.genericMetaphorForbiddenWhenTopicSpecificSceneExists, 'topicVisualRelevancePolicy.genericMetaphorForbiddenWhenTopicSpecificSceneExists');
    requireTrue(errors, relevance.arbitraryCountryOrFlagUseForbidden, 'topicVisualRelevancePolicy.arbitraryCountryOrFlagUseForbidden');
    requireTrue(errors, relevance.countryOrFlagRequiresNarrativeReason, 'topicVisualRelevancePolicy.countryOrFlagRequiresNarrativeReason');
    requireTrue(errors, relevance.topicSpecificInstitutionsObjectsPlacesPreferred, 'topicVisualRelevancePolicy.topicSpecificInstitutionsObjectsPlacesPreferred');
    requireTrue(errors, relevance.finalImageMustSummarizeCoreTopicNotGenericMoral, 'topicVisualRelevancePolicy.finalImageMustSummarizeCoreTopicNotGenericMoral');

    const end = meta.endHoldPolicy || {};
    requireTrue(errors, end.lastImageMustRemainVisibleAfterLastWord, 'endHoldPolicy.lastImageMustRemainVisibleAfterLastWord');
    requireTrue(errors, end.audioSilenceMustNotBeUsedAsSubstitute, 'endHoldPolicy.audioSilenceMustNotBeUsedAsSubstitute');
    if (Number(end.minimumSeconds) !== Number(policy.endHoldPolicy.minimumSeconds)) errors.push(`endHoldPolicy.minimumSeconds muss ${policy.endHoldPolicy.minimumSeconds} sein.`);
    if (Number(end.targetSeconds) !== Number(policy.endHoldPolicy.targetSeconds)) errors.push(`endHoldPolicy.targetSeconds muss ${policy.endHoldPolicy.targetSeconds} sein.`);
    if (Number(end.maximumSeconds) !== Number(policy.endHoldPolicy.maximumSeconds)) errors.push(`endHoldPolicy.maximumSeconds muss ${policy.endHoldPolicy.maximumSeconds} sein.`);
    const configuredEndHold = Number(meta.renderPolicy?.endHoldSeconds);
    if (!Number.isFinite(configuredEndHold) || configuredEndHold < policy.endHoldPolicy.minimumSeconds || configuredEndHold > policy.endHoldPolicy.maximumSeconds) {
      errors.push(`renderPolicy.endHoldSeconds muss zwischen ${policy.endHoldPolicy.minimumSeconds} und ${policy.endHoldPolicy.maximumSeconds} liegen.`);
    }

    validateTopicAnchors(errors, prompt, meta.plannedImageCount);
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

  const expectedVisualVersion = usesPremiumCountryballV5 ? policy.visualPolicyVersion : meta.visualPolicyVersion;
  const expectedStyleId = usesPremiumCountryballV5 ? policy.visualStyleId : meta.visualStyleId;
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
  if (usesPremiumCountryballV5) {
    requiredPromptMarkers.push(
      `DESIGN_QUALITY_VERSION: ${policy.designQualityVersion}`,
      `ADAPTIVE_PACING_VERSION: ${policy.adaptivePacingVersion}`,
      'PREMIUM DESIGN LAYER V1 — HARD LOCK',
      'ADAPTIVE IMAGE DENSITY V3 — HARD LOCK',
      'Premium does NOT mean realistic.'
    );
  }
  if (usesTopicVisualRelevanceV1) {
    requiredPromptMarkers.push(
      `SCENE_ILLUSTRATION_POLICY_VERSION: ${policy.sceneIllustrationPolicyVersion}`,
      `TOPIC_VISUAL_RELEVANCE_POLICY_VERSION: ${policy.topicVisualRelevancePolicyVersion}`,
      `END_HOLD_POLICY_VERSION: ${policy.endHoldPolicyVersion}`,
      'SCENE ILLUSTRATION V2 — HARD LOCK',
      'TOPIC VISUAL RELEVANCE V1 — HARD LOCK',
      'EVERY IMAGE MUST MATCH BOTH THE CURRENT SPOKEN SENTENCE AND THE SPECIFIC VIDEO TOPIC.',
      'Topic Anchor:'
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

  if (usesCountryball) {
    stalePatterns.push(
      /ACTIVE_STYLE_ID:\s*premium-editorial-explainer-illustration-youtube-16x9/i,
      /WRITTEN STYLE LOCK\s*[—-]\s*PREMIUM EDITORIAL/i,
      /no mandatory mascot, no countryball template/i
    );
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
  if (usesPremiumCountryballV5) {
    // Only actual legacy values are stale. V5's required phrases such as
    // "There is NO fixed target image count" and "Premium does NOT mean realistic"
    // are intentional policy statements and must not self-trigger this gate.
    stalePatterns.push(/plannedImageCount\s*(?:=|:)\s*24/i);
  }
  if (usesTopicVisualRelevanceV1) {
    stalePatterns.push(
      /random countryballs? for visual variety/i,
      /arbitrary flags? are allowed/i,
      /generic metaphor is preferred/i
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
  const openingText = usesScriptOpeningV1 ? `, Script Opening V${policy.scriptOpeningPolicyVersion}` : '';
  const relevanceText = usesTopicVisualRelevanceV1
    ? `, Scene Illustration V${policy.sceneIllustrationPolicyVersion}, Topic Relevance V${policy.topicVisualRelevancePolicyVersion}, End Hold V${policy.endHoldPolicyVersion}`
    : '';
  const visualLabel = usesPremiumCountryballV5
    ? `Premium Serious-Minimal-Countryball V${policy.visualPolicyVersion}, Design V${policy.designQualityVersion}, Pacing V${policy.adaptivePacingVersion}`
    : schema === 9
      ? 'Serious-Minimal-Countryball V4 (Legacy Schema 9)'
      : `Legacy Visual Policy V${meta.visualPolicyVersion}`;
  console.log(`YouTube Phase-1-Policy: BESTANDEN — ${visualLabel}${openingText}${relevanceText}, Cover Policy V${policy.coverPolicyVersion}${topicText}${assetText}, Kanalfokus und Session-Schutz sind aktiv.`);
}

main().catch((error) => {
  console.error(`YouTube Phase-1-Policy: FEHLER — ${error.message}`);
  process.exitCode = 1;
});
