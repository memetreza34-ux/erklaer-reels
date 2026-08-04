import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { validateReelContent } from './content-validator.js';
import { buildMasterTimeline } from './timeline.js';
import { runVisualQualityCheck } from './visual-qc.js';
import { calculateReelProgress } from './reel-progress.js';
import { validateExactWordTimings } from '../renderer/subtitle-timing.js';

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
    .map((check) => ({
      id: check.id,
      level,
      message: check.message
    }));
}

function audioPacingStage(report, strict) {
  const rate = Number(report?.playbackRate);
  const checks = [
    {
      id: 'audio-pacing-report-present',
      passed: Boolean(report?.createdAt),
      level: strict ? 'error' : 'warning',
      message: 'review/audio-pacing-report.json fehlt. Führe trim:pauses vor der Timeline aus.'
    },
    {
      id: 'audio-pacing-passed',
      passed: report?.passed === true,
      level: strict ? 'error' : 'warning',
      message: 'Die Voice-over-Optimierung wurde nicht erfolgreich abgeschlossen.'
    },
    {
      id: 'audio-pacing-rate',
      passed: Number.isFinite(rate) && rate >= 1.03 && rate <= 1.07,
      level: strict ? 'error' : 'warning',
      message: 'Das Voice-over soll leicht beschleunigt sein; Zielwert ist ungefähr 1.05x.'
    },
    {
      id: 'audio-pacing-duration-reduced',
      passed: Number(report?.afterSeconds) > 0 && Number(report?.afterSeconds) < Number(report?.beforeSeconds),
      level: strict ? 'error' : 'warning',
      message: 'Die optimierte Audiodatei muss kürzer als das Original sein.'
    }
  ];
  const errors = checks.filter((check) => !check.passed && check.level === 'error');
  const warnings = checks.filter((check) => !check.passed && check.level === 'warning');
  return {
    passed: errors.length === 0 && checks.every((check) => check.passed),
    strict,
    playbackRate: Number.isFinite(rate) ? rate : null,
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

function wordSyncStage(renderPlan, strict) {
  const cues = (renderPlan?.scenes ?? []).flatMap((scene) => scene.subtitles ?? []);
  const highlightedCues = cues.filter((cue) => cue.highlightCurrentWord === true);
  const checks = [
    {
      id: 'subtitle-cues-present',
      passed: cues.length > 0,
      level: strict ? 'error' : 'warning',
      message: 'Der Render-Plan enthält keine Untertitel-Cues.'
    },
    {
      id: 'word-highlight-disabled',
      passed: highlightedCues.length === 0,
      level: strict ? 'error' : 'warning',
      message: 'Die Wort-für-Wort-Markierung muss für den schlichten weißen Untertitelstil deaktiviert sein.'
    }
  ];

  for (const cue of highlightedCues) {
    const result = validateExactWordTimings(cue);
    checks.push({
      id: `${cue.id ?? 'subtitle'}-exact-word-timing`,
      passed: result.valid,
      level: strict ? 'error' : 'warning',
      message: `${cue.id ?? 'Untertitel'}: ${result.issues.join(' ') || 'Exakte Wortzeiten vorhanden.'}`
    });
  }

  const errors = checks.filter((check) => !check.passed && check.level === 'error');
  const warnings = checks.filter((check) => !check.passed && check.level === 'warning');
  return {
    passed: errors.length === 0 && cues.length > 0,
    strict,
    provider: highlightedCues.length === 0 ? 'not-required' : highlightedCues[0]?.timingSource ?? null,
    cueCount: cues.length,
    exactCueCount: checks.filter((check) => check.id.endsWith('-exact-word-timing') && check.passed).length,
    summary: {
      passedChecks: checks.filter((check) => check.passed).length,
      failedChecks: errors.length,
      warnings: warnings.length,
      totalChecks: checks.length
    },
    checks
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

  const content = await validateReelContent(reelDirectory, { strict: true });
  stages.content = {
    passed: content.passed,
    reportFile: 'review/content-readiness.json',
    summary: content.summary
  };
  blockingIssues.push(...issuesFrom(content, 'error'));
  warnings.push(...issuesFrom(content, 'warning'));

  const pacingReport = await readJson(path.join(reelDirectory, 'review', 'audio-pacing-report.json'), null);
  const pacing = audioPacingStage(pacingReport, strict);
  stages.audioPacing = {
    passed: pacing.passed,
    strict,
    playbackRate: pacing.playbackRate,
    beforeSeconds: pacing.beforeSeconds,
    afterSeconds: pacing.afterSeconds,
    reportFile: pacing.reportFile,
    summary: pacing.summary
  };
  blockingIssues.push(...issuesFrom(pacing, 'error'));
  warnings.push(...issuesFrom(pacing, 'warning'));

  let timelineResult = null;
  try {
    timelineResult = await buildMasterTimeline(reelDirectory, {
      audioDurationSeconds,
      strict,
      probeAudio
    });
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
    stages.timeline = {
      passed: false,
      error: error.message,
      reportFile: 'review/final-video-report.json'
    };
    blockingIssues.push({ id: 'timeline-build', level: 'error', message: error.message });
  }

  const wordSync = wordSyncStage(timelineResult?.renderPlan, strict);
  stages.wordSync = {
    passed: wordSync.passed,
    strict,
    provider: wordSync.provider,
    cueCount: wordSync.cueCount,
    exactCueCount: wordSync.exactCueCount,
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
    stages.visualQuality = {
      passed: false,
      strict,
      error: error.message,
      reportFile: 'review/visual-quality-report.json'
    };
    blockingIssues.push({ id: 'visual-quality', level: 'error', message: error.message });
  }

  const progress = await calculateReelProgress(reelDirectory);
  const readyForRenderer =
    content.passed === true &&
    stages.audioPacing?.passed === true &&
    stages.audioPacing?.strict === true &&
    stages.timeline?.passed === true &&
    stages.timeline?.timingStatus === 'audio-synced' &&
    stages.timeline?.renderStatus === 'ready-for-renderer' &&
    stages.wordSync?.passed === true &&
    stages.wordSync?.strict === true &&
    stages.wordSync?.provider === 'not-required' &&
    stages.visualQuality?.passed === true &&
    stages.visualQuality?.strict === true &&
    progress.productionReady === 100;

  const normalizedDirectory = reelDirectory.split(path.sep).join('/');
  const report = {
    version: 6,
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
      : stages.audioPacing?.passed !== true
        ? `Voice-over straffen: npm run trim:pauses -- --dir "${normalizedDirectory}"; danach Timeline und Audio-Cues neu synchronisieren.`
        : progress.nextStep
  };

  await writeJson(path.join(reelDirectory, 'review', 'final-readiness-report.json'), report);

  const statusPath = path.join(reelDirectory, 'status.json');
  const status = await readJson(statusPath, {});
  status.audioPacing = stages.audioPacing?.passed ? 'complete' : 'needs-review';
  status.wordSync = stages.wordSync?.passed ? 'not-required' : 'needs-review';
  status.finalReadiness = readyForRenderer ? 'ready-for-renderer' : 'needs-review';
  if (readyForRenderer && status.render !== 'complete') status.render = 'ready';
  await writeJson(statusPath, status);

  return report;
}
