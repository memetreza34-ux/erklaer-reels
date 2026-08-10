import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { verifyAudioPacingFileBinding } from './audio-pacing-file-guard.js';
import { validateReelContent } from './content-validator.js';
import { buildMasterTimeline } from './timeline.js';
import { runVisualQualityCheck } from './visual-qc.js';
import { calculateReelProgress } from './reel-progress.js';
import { verifyRequiredSourceQuality } from './source-quality-file-guard.js';
import { verifyAppliedWordSyncAudioBinding } from './word-sync-audio-guard.js';
import { validateExactWordTimings } from '../renderer/subtitle-timing.js';
import { SUBTITLE_STYLE } from '../shared/subtitle-style.js';
import {
  AUDIO_PACING_STYLE,
  isMeasuredLoudnessWithinTolerance,
  isTargetPlaybackRate,
  toFiniteNumberOrNull
} from '../shared/audio-pacing-style.js';

async function readJson(filePath, fallback = {}) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function issuesFrom(report, level) {
  return (report?.checks ?? [])
    .filter((check) => check.passed === false && (check.level ?? 'error') === level)
    .map((check) => ({ id: check.id, level, message: check.message }));
}

function normalizeSubtitleToken(value) {
  return String(value ?? '')
    .toLocaleLowerCase('de-DE')
    .replace(/[„“”"'’`´.,!?;:()[\]{}…—–-]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

function tokensFromText(value) {
  return String(value ?? '')
    .trim()
    .split(/\s+/)
    .map(normalizeSubtitleToken)
    .filter(Boolean);
}

function sameTokenSequence(expected, actual) {
  return expected.length === actual.length
    && expected.every((token, index) => token === actual[index]);
}

function audioPacingStage(report, strict) {
  const rate = toFiniteNumberOrNull(report?.playbackRate);
  const loudnessTarget = toFiniteNumberOrNull(report?.loudnessSettings?.loudnessTargetLufs);
  const truePeak = toFiniteNumberOrNull(report?.loudnessSettings?.truePeakDbtp);
  const measuredAudioRequired = Number(report?.version ?? 0) >= 5;
  const checks = [
    { id: 'audio-pacing-report-present', passed: Boolean(report?.createdAt), level: strict ? 'error' : 'warning', message: 'review/audio-pacing-report.json fehlt. Führe trim:pauses vor der Timeline aus.' },
    { id: 'audio-pacing-passed', passed: report?.passed === true, level: strict ? 'error' : 'warning', message: 'Die Voice-over-Optimierung wurde nicht erfolgreich abgeschlossen.' },
    { id: 'audio-pacing-rate', passed: isTargetPlaybackRate(rate), level: strict ? 'error' : 'warning', message: `Das Voice-over muss mit exakt ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}x verarbeitet werden.` },
    { id: 'audio-pacing-loudness-normalized', passed: report?.loudnessNormalized === true, level: strict ? 'error' : 'warning', message: 'Das Voice-over muss für Social Media lautheitsnormalisiert werden.' },
    { id: 'audio-pacing-lufs-target', passed: loudnessTarget === AUDIO_PACING_STYLE.loudnessTargetLufs, level: strict ? 'error' : 'warning', message: `Die Ziellautheit muss ${AUDIO_PACING_STYLE.loudnessTargetLufs} LUFS betragen.` },
    { id: 'audio-pacing-true-peak', passed: truePeak === AUDIO_PACING_STYLE.truePeakDbtp, level: strict ? 'error' : 'warning', message: `Der True-Peak-Zielwert muss ${AUDIO_PACING_STYLE.truePeakDbtp} dBTP betragen.` },
    { id: 'audio-pacing-duration-reduced', passed: Number(report?.afterSeconds) > 0 && Number(report?.afterSeconds) < Number(report?.beforeSeconds), level: strict ? 'error' : 'warning', message: 'Die optimierte Audiodatei muss kürzer als das Original sein.' }
  ];

  let measuredLufs = null;
  let measuredTruePeak = null;
  if (measuredAudioRequired) {
    const measurement = report?.loudnessMeasurement ?? {};
    measuredLufs = toFiniteNumberOrNull(measurement.integratedLufs);
    measuredTruePeak = toFiniteNumberOrNull(measurement.truePeakDbtp);
    const measurementValuesPass = isMeasuredLoudnessWithinTolerance(
      { integratedLufs: measuredLufs, truePeakDbtp: measuredTruePeak },
      { loudnessTargetLufs: loudnessTarget, truePeakTargetDbtp: truePeak }
    );
    checks.push(
      { id: 'audio-pacing-loudness-measured', passed: report?.loudnessMeasured === true, level: strict ? 'error' : 'warning', message: 'Audio-Pacing-Reports ab Version 5 müssen eine echte Lautheitsnachmessung enthalten.' },
      { id: 'audio-pacing-measurement-passed', passed: measurement.passed === true, level: strict ? 'error' : 'warning', message: 'Die nachgelagerte LUFS-/True-Peak-Messung muss bestanden sein.' },
      { id: 'audio-pacing-measured-lufs-present', passed: measuredLufs !== null, level: strict ? 'error' : 'warning', message: 'Der tatsächlich gemessene Integrated-LUFS-Wert fehlt.' },
      { id: 'audio-pacing-measured-true-peak-present', passed: measuredTruePeak !== null, level: strict ? 'error' : 'warning', message: 'Der tatsächlich gemessene True-Peak-Wert fehlt.' },
      { id: 'audio-pacing-measured-values-within-tolerance', passed: measurementValuesPass, level: strict ? 'error' : 'warning', message: 'Die gespeicherten LUFS-/True-Peak-Messwerte liegen außerhalb der zentralen Produktionstoleranz.' }
    );
  }

  const errors = checks.filter((check) => !check.passed && check.level === 'error');
  const warnings = checks.filter((check) => !check.passed && check.level === 'warning');
  return {
    passed: errors.length === 0 && checks.every((check) => check.passed),
    strict,
    playbackRate: rate,
    loudnessTargetLufs: loudnessTarget,
    truePeakDbtp: truePeak,
    loudnessMeasured: measuredAudioRequired ? report?.loudnessMeasured === true : null,
    measuredIntegratedLufs: measuredAudioRequired ? measuredLufs : null,
    measuredTruePeakDbtp: measuredAudioRequired ? measuredTruePeak : null,
    beforeSeconds: Number(report?.beforeSeconds) || null,
    afterSeconds: Number(report?.afterSeconds) || null,
    reportFile: 'review/audio-pacing-report.json',
    summary: {
      passedChecks: checks.filter((check) => check.passed).length,
      failedChecks: errors.length,
      warnings: warnings.length,
      totalChecks: checks.length
    },
    checks
  };
}

function wordSyncStage(renderPlan, strict, voiceScript) {
  const cues = (renderPlan?.scenes ?? []).flatMap((scene) => scene.subtitles ?? []);
  const expectedTokens = tokensFromText(voiceScript);
  const renderedTokens = [];
  const checks = [
    { id: 'subtitle-cues-present', passed: cues.length > 0, level: strict ? 'error' : 'warning', message: 'Der Render-Plan enthält keine Untertitel-Cues.' },
    { id: 'speaker-highlight-enabled', passed: SUBTITLE_STYLE.highlightCurrentWord === true, level: strict ? 'error' : 'warning', message: 'Die sprecher-synchrone Wortmarkierung muss aktiviert sein.' },
    { id: 'speaker-highlight-brown', passed: SUBTITLE_STYLE.highlightColor === '#B7794A', level: strict ? 'error' : 'warning', message: 'Das aktuell gesprochene Wort muss Braun #B7794A verwenden.' }
  ];

  let exactCueCount = 0;
  for (const cue of cues) {
    const result = validateExactWordTimings(cue);
    const exact = result.valid;
    if (exact) {
      exactCueCount += 1;
      renderedTokens.push(...result.words.map((word) => normalizeSubtitleToken(word.text)).filter(Boolean));
    }

    checks.push({ id: `${cue.id ?? 'subtitle'}-exact-word-timing`, passed: exact, level: strict ? 'error' : 'warning', message: `${cue.id ?? 'Untertitel'}: ${result.issues.join(' ') || 'Exakte Wortzeiten vorhanden.'}` });
    checks.push({ id: `${cue.id ?? 'subtitle'}-timing-status`, passed: cue.timingStatus === 'codex-word-synced', level: strict ? 'error' : 'warning', message: `${cue.id ?? 'Untertitel'} muss timingStatus "codex-word-synced" verwenden.` });
    checks.push({ id: `${cue.id ?? 'subtitle'}-timing-source`, passed: cue.timingSource === 'codex-local-audio-review', level: strict ? 'error' : 'warning', message: `${cue.id ?? 'Untertitel'} muss aus der lokalen Codex-Audioprüfung stammen.` });
  }

  checks.push({
    id: 'subtitle-full-spoken-text-coverage',
    passed: expectedTokens.length > 0 && sameTokenSequence(expectedTokens, renderedTokens),
    level: strict ? 'error' : 'warning',
    message: `Untertitel müssen 100 % des Voice-Scripts in identischer Wortfolge enthalten. Erwartet: ${expectedTokens.length}, gerendert: ${renderedTokens.length}.`
  });

  const provider = cues.length > 0 && cues.every((cue) => cue.timingSource === 'codex-local-audio-review')
    ? 'codex-local-audio-review'
    : null;
  const errors = checks.filter((check) => !check.passed && check.level === 'error');
  const warnings = checks.filter((check) => !check.passed && check.level === 'warning');
  const fullCoverage = expectedTokens.length > 0 && sameTokenSequence(expectedTokens, renderedTokens);
  return {
    passed: errors.length === 0 && cues.length > 0 && exactCueCount === cues.length && provider === 'codex-local-audio-review' && fullCoverage,
    strict,
    provider,
    cueCount: cues.length,
    exactCueCount,
    expectedWordCount: expectedTokens.length,
    renderedWordCount: renderedTokens.length,
    fullCoverage,
    summary: {
      passedChecks: checks.filter((check) => check.passed).length,
      failedChecks: errors.length,
      warnings: warnings.length,
      totalChecks: checks.length
    },
    checks
  };
}

function guardStage(result, id, message) {
  return {
    passed: result?.passed === true,
    required: result?.required === true,
    legacy: result?.legacy === true,
    reason: result?.reason ?? null,
    checks: [{ id, passed: result?.passed === true, level: 'error', message: result?.passed === true ? `${message}: bestanden.` : (result?.reason ?? `${message}: nicht bestanden.`) }]
  };
}

export async function finalizeReel(reelDirectory, {
  strict = false,
  audioDurationSeconds = null,
  probeAudio = true
} = {}) {
  const createdAt = new Date().toISOString();
  const stages = {};
  const blockingIssues = [];
  const warnings = [];

  const sourceGate = await verifyRequiredSourceQuality(reelDirectory);
  stages.sourceQuality = guardStage(sourceGate, 'source-quality-binding', 'Verpflichtende Quellen-QC');
  if (!sourceGate.passed) blockingIssues.push({ id: 'source-quality-binding', level: 'error', message: sourceGate.reason });

  const pacingBinding = await verifyAudioPacingFileBinding(reelDirectory);
  stages.audioPacingFileBinding = guardStage(pacingBinding, 'audio-pacing-file-binding', 'Audio-Pacing-Dateibindung');
  if (!pacingBinding.passed) blockingIssues.push({ id: 'audio-pacing-file-binding', level: 'error', message: pacingBinding.reason });

  const wordSyncBinding = await verifyAppliedWordSyncAudioBinding(reelDirectory);
  stages.wordSyncAudioBinding = guardStage(wordSyncBinding, 'word-sync-audio-binding', 'Word-Sync-Audiobindung');
  if (!wordSyncBinding.passed) blockingIssues.push({ id: 'word-sync-audio-binding', level: 'error', message: wordSyncBinding.reason });

  const content = await validateReelContent(reelDirectory, { strict: true });
  stages.content = { passed: content.passed, reportFile: 'review/content-readiness.json', summary: content.summary };
  blockingIssues.push(...issuesFrom(content, 'error'));
  warnings.push(...issuesFrom(content, 'warning'));

  const pacingReport = await readJson(path.join(reelDirectory, 'review', 'audio-pacing-report.json'), null);
  const pacing = audioPacingStage(pacingReport, strict);
  stages.audioPacing = {
    passed: pacing.passed,
    strict,
    playbackRate: pacing.playbackRate,
    loudnessTargetLufs: pacing.loudnessTargetLufs,
    truePeakDbtp: pacing.truePeakDbtp,
    loudnessMeasured: pacing.loudnessMeasured,
    measuredIntegratedLufs: pacing.measuredIntegratedLufs,
    measuredTruePeakDbtp: pacing.measuredTruePeakDbtp,
    beforeSeconds: pacing.beforeSeconds,
    afterSeconds: pacing.afterSeconds,
    reportFile: pacing.reportFile,
    summary: pacing.summary
  };
  blockingIssues.push(...issuesFrom(pacing, 'error'));
  warnings.push(...issuesFrom(pacing, 'warning'));

  let timelineResult = null;
  try {
    timelineResult = await buildMasterTimeline(reelDirectory, { audioDurationSeconds, strict, probeAudio });
    stages.timeline = {
      passed: timelineResult.qualityReport.passed,
      timingStatus: timelineResult.timeline.timingStatus,
      renderStatus: timelineResult.renderPlan.status,
      reportFile: 'review/final-video-report.json',
      summary: timelineResult.qualityReport.summary
    };
    blockingIssues.push(...issuesFrom(timelineResult.qualityReport, 'error'));
    warnings.push(...issuesFrom(timelineResult.qualityReport, 'warning'));
  } catch (error) {
    stages.timeline = { passed: false, error: error.message, reportFile: 'review/final-video-report.json' };
    blockingIssues.push({ id: 'timeline-build', level: 'error', message: error.message });
  }

  let voiceScript = '';
  try {
    voiceScript = await readFile(path.join(reelDirectory, 'script', 'voice-script.txt'), 'utf8');
  } catch {
    voiceScript = '';
  }
  const wordSync = wordSyncStage(timelineResult?.renderPlan, strict, voiceScript);
  stages.wordSync = {
    passed: wordSync.passed,
    strict,
    provider: wordSync.provider,
    cueCount: wordSync.cueCount,
    exactCueCount: wordSync.exactCueCount,
    expectedWordCount: wordSync.expectedWordCount,
    renderedWordCount: wordSync.renderedWordCount,
    fullCoverage: wordSync.fullCoverage,
    reportFile: 'review/word-sync-report.json',
    summary: wordSync.summary
  };
  blockingIssues.push(...issuesFrom(wordSync, 'error'));
  warnings.push(...issuesFrom(wordSync, 'warning'));

  try {
    const visual = await runVisualQualityCheck(reelDirectory, { strict });
    stages.visualQuality = {
      passed: visual.passed,
      strict: visual.strict,
      reportFile: 'review/visual-quality-report.json',
      inspectionFile: 'review/visual-inspection.json',
      summary: visual.summary
    };
    blockingIssues.push(...issuesFrom(visual, 'error'));
    warnings.push(...issuesFrom(visual, 'warning'));
  } catch (error) {
    stages.visualQuality = { passed: false, strict, error: error.message, reportFile: 'review/visual-quality-report.json' };
    blockingIssues.push({ id: 'visual-quality', level: 'error', message: error.message });
  }

  const progress = await calculateReelProgress(reelDirectory);
  const readyForRenderer =
    stages.sourceQuality?.passed === true &&
    stages.audioPacingFileBinding?.passed === true &&
    stages.wordSyncAudioBinding?.passed === true &&
    content.passed === true &&
    stages.audioPacing?.passed === true &&
    stages.audioPacing?.strict === true &&
    stages.timeline?.passed === true &&
    stages.timeline?.timingStatus === 'audio-synced' &&
    stages.timeline?.renderStatus === 'ready-for-renderer' &&
    stages.wordSync?.passed === true &&
    stages.wordSync?.strict === true &&
    stages.wordSync?.provider === 'codex-local-audio-review' &&
    stages.wordSync?.exactCueCount === stages.wordSync?.cueCount &&
    stages.wordSync?.fullCoverage === true &&
    stages.wordSync?.expectedWordCount === stages.wordSync?.renderedWordCount &&
    stages.visualQuality?.passed === true &&
    stages.visualQuality?.strict === true &&
    progress.productionReady === 100;

  const normalizedDirectory = reelDirectory.split(path.sep).join('/');
  const report = {
    version: 10,
    createdAt,
    reelDirectory: normalizedDirectory,
    strict,
    readyForRenderer,
    stages,
    progress,
    blockingIssues,
    warnings,
    nextStep: readyForRenderer
      ? `Renderer prüfen und MP4 erzeugen: npm run validate:render -- --dir "${normalizedDirectory}" && npm run render:reel -- --dir "${normalizedDirectory}"`
      : stages.sourceQuality?.passed !== true
        ? `Quellen-QC korrigieren und erneut prüfen: npm run check:content -- --dir "${normalizedDirectory}" --strict.`
        : stages.audioPacingFileBinding?.passed !== true
          ? `Aktuelles Voice-over erneut verarbeiten und messen: npm run trim:pauses -- --dir "${normalizedDirectory}"; danach Timeline und Word-Sync neu erstellen.`
          : stages.audioPacing?.passed !== true
            ? `Voice-over mit ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}x und Lautheitsnormalisierung neu erzeugen: npm run trim:pauses -- --dir "${normalizedDirectory}"; danach Timeline und Audio-Cues neu synchronisieren.`
            : stages.wordSyncAudioBinding?.passed !== true || stages.wordSync?.passed !== true
              ? `Vollständige exakte Untertitelzeiten erstellen: npm run sync:words -- --dir "${normalizedDirectory}"; jedes Wort akustisch prüfen; danach npm run sync:words -- --dir "${normalizedDirectory}" --apply --strict.`
              : progress.nextStep
  };

  await writeJson(path.join(reelDirectory, 'review', 'final-readiness-report.json'), report);

  const statusPath = path.join(reelDirectory, 'status.json');
  const status = await readJson(statusPath, {});
  status.audioPacing = stages.audioPacing?.passed && stages.audioPacingFileBinding?.passed ? 'complete' : 'needs-review';
  status.wordSync = stages.wordSync?.passed && stages.wordSyncAudioBinding?.passed ? 'complete' : 'needs-review';
  status.finalReadiness = readyForRenderer ? 'ready-for-renderer' : 'needs-review';
  if (readyForRenderer && status.render !== 'complete') status.render = 'ready';
  await writeJson(statusPath, status);

  return report;
}
