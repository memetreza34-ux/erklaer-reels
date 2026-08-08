import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath, fallback = null) {
  if (!(await exists(filePath))) return fallback;
  return JSON.parse(await readFile(filePath, 'utf8'));
}

const EXPLICITLY_STALE_TIMELINE_STATES = new Set([
  'waiting-for-audio',
  'needs-rebuild-after-audio-pacing',
  'needs-rebuild-after-word-sync-invalidation'
]);

export async function verifyWordSyncTimelineReadiness(reelDirectory) {
  const [status, timeline, pacingReport] = await Promise.all([
    readJson(path.join(reelDirectory, 'status.json'), {}),
    readJson(path.join(reelDirectory, 'timeline', 'timeline-plan.json'), null),
    readJson(path.join(reelDirectory, 'review', 'audio-pacing-report.json'), null)
  ]);

  const explicitStale = EXPLICITLY_STALE_TIMELINE_STATES.has(String(status?.timeline ?? ''));
  const modernAudioPipeline = Number(pacingReport?.version ?? 0) >= 6;
  const required = explicitStale || modernAudioPipeline;

  if (!required) {
    return {
      required: false,
      passed: true,
      legacy: true,
      explicitStale,
      modernAudioPipeline,
      timelineTimingStatus: timeline?.timingStatus ?? null,
      statusTimeline: status?.timeline ?? null
    };
  }

  const timelinePresent = Boolean(timeline);
  const audioSynced = timeline?.timingStatus === 'audio-synced';
  const passed = timelinePresent && audioSynced && !explicitStale;

  return {
    required: true,
    passed,
    legacy: false,
    explicitStale,
    modernAudioPipeline,
    timelinePresent,
    audioSynced,
    timelineTimingStatus: timeline?.timingStatus ?? null,
    statusTimeline: status?.timeline ?? null,
    reason: passed
      ? null
      : explicitStale
        ? 'Die Timeline ist nach einer Audioänderung ausdrücklich als veraltet markiert.'
        : !timelinePresent
          ? 'timeline/timeline-plan.json fehlt.'
          : `Die Timeline ist noch nicht exakt mit den Audio-Cues synchronisiert (Status: ${timeline?.timingStatus ?? 'unbekannt'}).`
  };
}
