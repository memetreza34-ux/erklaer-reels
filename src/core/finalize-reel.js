import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { validateReelContent } from './content-validator.js';
import { buildMasterTimeline } from './timeline.js';
import { runVisualQualityCheck } from './visual-qc.js';
import { calculateReelProgress } from './reel-progress.js';

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

  try {
    const timelineResult = await buildMasterTimeline(reelDirectory, {
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
    stages.timeline?.passed === true &&
    stages.timeline?.timingStatus === 'audio-synced' &&
    stages.timeline?.renderStatus === 'ready-for-renderer' &&
    stages.visualQuality?.passed === true &&
    stages.visualQuality?.strict === true &&
    progress.productionReady === 100;

  const report = {
    version: 2,
    createdAt,
    reelDirectory: reelDirectory.split(path.sep).join('/'),
    strict,
    readyForRenderer,
    stages,
    progress,
    blockingIssues,
    warnings,
    nextStep: readyForRenderer
      ? `Renderer prüfen und MP4 erzeugen: npm run validate:render -- --dir "${reelDirectory.split(path.sep).join('/')}" && npm run render:reel -- --dir "${reelDirectory.split(path.sep).join('/')}"`
      : progress.nextStep
  };

  await writeJson(path.join(reelDirectory, 'review', 'final-readiness-report.json'), report);

  const statusPath = path.join(reelDirectory, 'status.json');
  const status = await readJson(statusPath, {});
  status.finalReadiness = readyForRenderer ? 'ready-for-renderer' : 'needs-review';
  if (readyForRenderer && status.render !== 'complete') status.render = 'ready';
  await writeJson(statusPath, status);

  return report;
}
