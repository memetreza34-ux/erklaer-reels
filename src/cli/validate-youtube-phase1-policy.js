#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

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

  if (meta.visualPolicyVersion !== policy.visualPolicyVersion) errors.push(`visualPolicyVersion ist ${meta.visualPolicyVersion ?? 'fehlend'}, erwartet ${policy.visualPolicyVersion}.`);
  if (meta.visualStyleId !== policy.visualStyleId) errors.push(`visualStyleId ist ${meta.visualStyleId ?? 'fehlend'}, erwartet ${policy.visualStyleId}.`);

  const allowedTopics = new Set(policy.channelFocus.primaryTopics);
  if (!allowedTopics.has(meta.topicCategory) && meta.explicitUserRequestedOutsideFocus !== true) {
    errors.push(`topicCategory "${meta.topicCategory ?? 'fehlend'}" liegt außerhalb des YouTube-Kanalfokus und wurde nicht ausdrücklich vom Nutzer angefordert.`);
  }
  if (!meta.topicCoreLink || typeof meta.topicCoreLink !== 'string') errors.push('topicCoreLink muss den Bezug zum Kanalfokus kurz dokumentieren.');

  requireTrue(errors, meta.sessionPolicy?.freshFlowSessionRequiredWhenVisualPolicyChanges, 'sessionPolicy.freshFlowSessionRequiredWhenVisualPolicyChanges');
  requireTrue(errors, meta.sessionPolicy?.continueSessionContainingLegacyStyleInstructionsForbidden, 'sessionPolicy.continueSessionContainingLegacyStyleInstructionsForbidden');
  requireTrue(errors, meta.sessionPolicy?.previousGeneratedImageAsReferenceForbidden, 'sessionPolicy.previousGeneratedImageAsReferenceForbidden');

  const q = meta.visualQualityPolicy || {};
  requireTrue(errors, q.visualStorytellingRequired, 'visualQualityPolicy.visualStorytellingRequired');
  requireTrue(errors, q.lifelessStaticCompositionForbidden, 'visualQualityPolicy.lifelessStaticCompositionForbidden');
  requireTrue(errors, q.genericCenteredObjectOnBlankBackgroundForbiddenByDefault, 'visualQualityPolicy.genericCenteredObjectOnBlankBackgroundForbiddenByDefault');
  requireTrue(errors, q.genericIconCollageForbidden, 'visualQualityPolicy.genericIconCollageForbidden');
  requireTrue(errors, q.sceneSpecificArtDirectionRequired, 'visualQualityPolicy.sceneSpecificArtDirectionRequired');
  requireTrue(errors, q.controlledDepthRequired, 'visualQualityPolicy.controlledDepthRequired');
  requireTrue(errors, q.adjacentCompositionModeRepeatForbiddenWithoutReason, 'visualQualityPolicy.adjacentCompositionModeRepeatForbiddenWithoutReason');
  requireTrue(errors, q.childishCartoonLookForbidden, 'visualQualityPolicy.childishCartoonLookForbidden');

  if (Number(meta.schemaVersion) >= 7) {
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

  const requiredPromptMarkers = [
    `YOUTUBE_VISUAL_POLICY_VERSION: ${policy.visualPolicyVersion}`,
    `ACTIVE_STYLE_ID: ${policy.visualStyleId}`,
    'SESSION RESET HARD LOCK',
    'VISUAL STORYTELLING HARD LOCK',
    'ANTI-LIFELESS HARD LOCK',
    'Do not use any previous generated image as a visual reference.'
  ];
  if (Number(meta.schemaVersion) >= 7) {
    requiredPromptMarkers.push(
      `COVER_POLICY_VERSION: ${policy.coverPolicyVersion}`,
      'FIRST SCENE = COVER HARD LOCK',
      'Bild 01 is the cover AND the first video scene'
    );
  }
  for (const marker of requiredPromptMarkers) if (!prompt.includes(marker)) errors.push(`Masterprompt fehlt Pflichtmarker: ${marker}`);

  const stalePatterns = [
    /serious-minimal-countryball-explainer-youtube-16x9/i,
    /MASTER-REFERENCE-REGEL/i,
    /verbindlicher MASTER-STYLE-FRAME erzeugt/i,
    /Bild 01 als Master-Style-Referenz festlegen/i,
    /jeweils mit Bild 01 als Referenz/i,
    /using it as our anchor reference/i
  ];
  if (Number(meta.schemaVersion) >= 7) {
    stalePatterns.push(/BILD 00\s*[—-]\s*THUMBNAIL/i, /Bild 00.*Thumbnail/i, /Bild 00.*Timeline/i, /thumbnailImageNumber"\s*:\s*0/i);
  }
  for (const pattern of stalePatterns) if (pattern.test(prompt)) errors.push(`Masterprompt enthält veraltete Bildwelt-/Coverregel: ${pattern}`);

  if (errors.length > 0) {
    console.error('YouTube Phase-1-Policy: FEHLER');
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`YouTube Phase-1-Policy: BESTANDEN — Visual Policy V${policy.visualPolicyVersion}, Cover Policy V${policy.coverPolicyVersion}, Kanalfokus, Session-Schutz und Anti-Lifeless-Regeln sind aktiv.`);
}

main().catch((error) => {
  console.error(`YouTube Phase-1-Policy: FEHLER — ${error.message}`);
  process.exitCode = 1;
});
