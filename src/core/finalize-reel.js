import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { validateReelContent } from './content-validator.js';
import { buildMasterTimeline } from './timeline.js';
import { runVisualQualityCheck } from './visual-qc.js';
import { calculateReelProgress } from './reel-progress.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function failedChecks(report) {
  return (report?.checks ?? [])
    .filter((check) => check.passed === false)
    .map((check) => ({
      id: check.id,
      level: check.level ?? 'error',
      message: check.message
    }));
}

export async function finalizeReel(reelDirectory, {
  strict = false,
  audioDurationSeconds = null,
  probeAudio = true
} = {}) {
  const createdAt = new Date().toISOString();
  const stages = {};
  const blockingIssues = [];

  const content = await validateReelContent(reelDirectory, { strict: true });
  stages.content = {
    passed: content.passed,
    reportFile: 'review/content-readiness.json',
    summary: content.summary
  };
  if (!content.passed) blockingIssues.push(...failedChecks(content));

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
    if (!timelineResult.qualityReport.passed) {
      blockingIssues.push(...failedChecks(timelineResult.qualityReport));
    }
  } catch (error) {
    stages.timeline = {
      passed: false,
      error: error.message,
      reportFile: 'review/final-video-report.json'
    };
    blockingIssues.push({ id: 'timeline-build', level: 'error', message: error.message });
  }

  let visual = null;
  try {
    visual = await runVisualQualityCheck(reelDirectory, { strict });
    stages.visualQuality = {
      passed: visual.passed,
      strict: visual.strict,
      reportFile: 'review/visual-quality-report.json',
      inspectionFile: 'review/visual-inspection.json',
      summary: visual.summary
    };
    if (!visual.passed) blockingIssues.push(...failedChecks(visual));
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
    stages.timeline?.passed === true &&
    stages.timeline?.timingStatus === 'audio-synced' &&
    stages.timeline?.renderStatus === 'ready-for-renderer' &&
    stages.visualQuality?.passed === true &&
    stages.visualQuality?.strict === true &&
    progress.overall === 100;

  const report = {
    version: 1,
    createdAt,
    reelDirectory: reelDirectory.split(path.sep).join('/'),
    strict,
    readyForRenderer,
    stages,
    progress,
    blockingIssues,
    nextStep: readyForRenderer
      ? 'Das Reel ist für einen Renderer vorbereitet.'
      : progress.nextStep
  };

  await writeJson(path.join(reelDirectory, 'review', 'final-readiness-report.json'), report);
  return report;
}
