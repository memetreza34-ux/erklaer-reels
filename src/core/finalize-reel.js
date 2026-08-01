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

function wordSyncStage(renderPlan, strict) {
  const cues = (renderPlan?.scenes ?? []).flatMap((scene) => scene.subtitles ?? []);
  const checks = [];

  checks.push({
    id: 'subtitle-cues-present',
    passed: cues.length > 0,
    level: strict ? 'error' : 'warning',
    message: 'Der Render-Plan enthält keine Untertitel-Cues.'
  });

  const highlightedCues = cues.filter((cue) => cue.highlightCurrentWord !== false);
  checks.push({
    id: 'codex-word-sync-provider',
    passed: highlightedCues.length > 0 && highlightedCues.every((cue) => cue.timingSource === 'codex-local-audio-review'),
    level: strict ? 'error' : 'warning',
    message: 'Die finalen Wortzeiten müssen aus der lokalen Codex-Audio-Prüfung stammen.'
  });

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
    provider: highlightedCues[0]?.timingSource ?? null,
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
    stages.timeline?.passed === true &&
    stages.timeline?.timingStatus === 'audio-synced' &&
    stages.timeline?.renderStatus === 'ready-for-renderer' &&
    stages.wordSync?.passed === true &&
    stages.wordSync?.strict === true &&
    stages.wordSync?.provider === 'codex-local-audio-review' &&
    stages.visualQuality?.passed === true &&
    stages.visualQuality?.strict === true &&
    progress.productionReady === 100;

  const normalizedDirectory = reelDirectory.split(path.sep).join('/');
  const report = {
    version: 4,
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
      : stages.wordSync?.passed !== true
        ? `Codex-Wort-Sync vorbereiten: npm run sync:words -- --dir "${normalizedDirectory}"; danach production/codex-word-sync-task.md bearbeiten und mit --apply --strict übernehmen.`
        : progress.nextStep
  };

  await writeJson(path.join(reelDirectory, 'review', 'final-readiness-report.json'), report);

  const statusPath = path.join(reelDirectory, 'status.json');
  const status = await readJson(statusPath, {});
  status.wordSync = stages.wordSync?.passed ? 'complete' : 'needs-review';
  status.finalReadiness = readyForRenderer ? 'ready-for-renderer' : 'needs-review';
  if (readyForRenderer && status.render !== 'complete') status.render = 'ready';
  await writeJson(statusPath, status);

  return report;
}
