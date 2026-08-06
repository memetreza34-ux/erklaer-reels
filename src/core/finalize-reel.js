import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { validateReelContent } from './content-validator.js';
import { buildMasterTimeline } from './timeline.js';
import { runVisualQualityCheck } from './visual-qc.js';
import { calculateReelProgress } from './reel-progress.js';
import { validateExactWordTimings } from '../renderer/subtitle-timing.js';
import {
  AUDIO_PACING_STYLE,
  isTargetPlaybackRate
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
    .map((check) => ({
      id: check.id,
      level,
      message: check.message
    }));
}

function audioPacingStage(report, strict) {
  const rate = Number(report?.playbackRate);
  const loudnessTarget = Number(report?.loudnessSettings?.loudnessTargetLufs);
  const truePeak = Number(report?.loudnessSettings?.truePeakDbtp);
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
      passed: isTargetPlaybackRate(rate),
      level: strict ? 'error' : 'warning',
      message: `Das Voice-over muss mit exakt ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}x verarbeitet werden.`
    },
    {
      id: 'audio-pacing-loudness-normalized',
      passed: report?.loudnessNormalized === true,
      level: strict ? 'error' : 'warning',
      message: 'Das Voice-over muss für Social Media lautheitsnormalisiert werden.'
    },
    {
      id: 'audio-pacing-lufs-target',
      passed: loudnessTarget === AUDIO_PACING_STYLE.loudnessTargetLufs,
      level: strict ? 'error' : 'warning',
      message: `Die Ziellautheit muss ${AUDIO_PACING_STYLE.loudnessTargetLufs} LUFS betragen.`
    },
    {
      id: 'audio-pacing-true-peak',
      passed: truePeak === AUDIO_PACING_STYLE.truePeakDbtp,
      level: strict ? 'error' : 'warning',
      message: `Der True-Peak-Zielwert muss ${AUDIO_PACING_STYLE.truePeakDbtp} dBTP betragen.`
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
    loudnessTargetLufs: Number.isFinite(loudnessTarget) ? loudnessTarget : null,
    truePeakDbtp: Number.isFinite(truePeak) ? truePeak : null,
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
      message: 'Die Wort-für-Wort-Markierung muss deaktiviert bleiben; die Synchronisierung erfolgt nur über echte Wortzeiten.'
    }
  ];

  let exactCueCount = 0;
  for (const cue of cues) {
    const result = validateExactWordTimings(cue);
    const exact = result.valid;
    if (exact) exactCueCount += 1;

    checks.push({
      id: `${cue.id ?? 'subtitle'}-exact-word-timing`,
      passed: exact,
      level: strict ? 'error' : 'warning',
      message: `${cue.id ?? 'Untertitel'}: ${result.issues.join(' ') || 'Exakte Wortzeiten vorhanden.'}`
    });
    checks.push({
      id: `${cue.id ?? 'subtitle'}-timing-status`,
      passed: cue.timingStatus === 'codex-word-synced',
      level: strict ? 'error' : 'warning',
      message: `${cue.id ?? 'Untertitel'} muss timingStatus "codex-word-synced" verwenden.`
    });
    checks.push({
      id: `${cue.id ?? 'subtitle'}-timing-source`,
      passed: cue.timingSource === 'codex-local-audio-review',
      level: strict ? 'error' : 'warning',
      message: `${cue.id ?? 'Untertitel'} muss aus der lokalen Codex-Audioprüfung stammen.`
    });
  }

  const provider = cues.length > 0 && cues.every((cue) => cue.timingSource === 'codex-local-audio-review')
    ? 'codex-local-audio-review'
    : null;
  const errors = checks.filter((check) => !check.passed && check.level === 'error');
  const warnings = checks.filter((check) => !check.passed && check.level === 'warning');
  return {
    passed: errors.length === 0 && cues.length > 0 && exactCueCount === cues.length && provider === 'codex-local-audio-review',
    strict,
    provider,
    cueCount: cues.length,
    exactCueCount,
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
    loudnessTargetLufs: pacing.loudnessTargetLufs,
    truePeakDbtp: pacing.truePeakDbtp,
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
    stages.wordSync?.provider === 'codex-local-audio-review' &&
    stages.wordSync?.exactCueCount === stages.wordSync?.cueCount &&
    stages.visualQuality?.passed === true &&
    stages.visualQuality?.strict === true &&
    progress.productionReady === 100;

  const normalizedDirectory = reelDirectory.split(path.sep).join('/');
  const report = {
    version: 8,
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
        ? `Voice-over mit ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}x und Lautheitsnormalisierung neu erzeugen: npm run trim:pauses -- --dir "${normalizedDirectory}"; danach Timeline und Audio-Cues neu synchronisieren.`
        : stages.wordSync?.passed !== true
          ? `Exakte Untertitelzeiten erstellen: npm run sync:words -- --dir "${normalizedDirectory}"; production/codex-word-sync-task.md bearbeiten; danach npm run sync:words -- --dir "${normalizedDirectory}" --apply --strict.`
          : progress.nextStep
  };

  await writeJson(path.join(reelDirectory, 'review', 'final-readiness-report.json'), report);

  const statusPath = path.join(reelDirectory, 'status.json');
  const status = await readJson(statusPath, {});
  status.audioPacing = stages.audioPacing?.passed ? 'complete' : 'needs-review';
  status.wordSync = stages.wordSync?.passed ? 'complete' : 'needs-review';
  status.finalReadiness = readyForRenderer ? 'ready-for-renderer' : 'needs-review';
  if (readyForRenderer && status.render !== 'complete') status.render = 'ready';
  await writeJson(statusPath, status);

  return report;
}
