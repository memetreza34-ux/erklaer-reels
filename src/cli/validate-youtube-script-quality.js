#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { validateYoutubeScriptQuality } from '../core/youtube-script-quality.js';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function requireTrue(errors, value, label) {
  if (value !== true) errors.push(`${label} muss true sein.`);
}

async function main() {
  const dir = arg('--dir');
  if (!dir) throw new Error('Nutzung: node src/cli/validate-youtube-script-quality.js --dir "youtube/<woche>/<thema>"');

  const repoRoot = process.cwd();
  const projectDir = path.resolve(repoRoot, dir);
  const [policy, meta, script] = await Promise.all([
    readJson(path.join(repoRoot, 'config/youtube-channel-policy.json')),
    readJson(path.join(projectDir, '99-technik/video.json')),
    readFile(path.join(projectDir, '01-voice-script/voice-script.txt'), 'utf8')
  ]);

  const schema = Number(meta.schemaVersion) || 0;
  if (schema < 14) {
    console.log(`YouTube Script Quality: LEGACY-SKIP — Schema ${schema}; Hard-Gate gilt ab Schema 14.`);
    return;
  }

  const errors = [];
  if (meta.scriptQualityPolicyVersion !== policy.scriptQualityPolicyVersion) {
    errors.push(`scriptQualityPolicyVersion ist ${meta.scriptQualityPolicyVersion ?? 'fehlend'}, erwartet ${policy.scriptQualityPolicyVersion}.`);
  }

  const projectPolicy = meta.scriptQualityPolicy || {};
  for (const key of [
    'flexibleTopicSpecificOpeningRequired',
    'legacyQuestionThoughtShortAnswerTemplateForbidden',
    'causalExplanationRequired',
    'concreteExamplesOrFactsRequired',
    'spokenLanguageReadabilityRequired',
    'genericMetaIntroForbidden',
    'schoolbookDefinitionLeadForbidden'
  ]) {
    requireTrue(errors, projectPolicy[key], `scriptQualityPolicy.${key}`);
  }

  const result = validateYoutubeScriptQuality(script, policy.scriptQualityPolicy, {
    topic: meta.topic,
    title: meta.title
  });
  for (const error of result.errors) errors.push(`Script Quality V${policy.scriptQualityPolicyVersion}: ${error}`);

  if (errors.length) {
    console.error('YouTube Script Quality: FEHLER');
    for (const error of errors) console.error(`- ${error}`);
    console.error(`- Messwerte: ${JSON.stringify(result.metrics)}`);
    process.exitCode = 1;
    return;
  }

  console.log(`YouTube Script Quality: BESTANDEN — V${policy.scriptQualityPolicyVersion}`);
  console.log(`- Wörter: ${result.metrics.wordCount}; Absätze: ${result.metrics.paragraphCount}; Ø Satzlänge: ${result.metrics.averageSentenceWords}`);
  console.log(`- Ursache/Folge-Signale: ${result.metrics.causalSignals}; konkrete Signale: ${result.metrics.concreteSignals}; Fragen: ${result.metrics.questionCount}`);
  for (const warning of result.warnings) console.warn(`- HINWEIS: ${warning}`);
}

main().catch((error) => {
  console.error(`YouTube Script Quality: FEHLER — ${error.message}`);
  process.exitCode = 1;
});
