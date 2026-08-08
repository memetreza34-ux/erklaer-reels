import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { verifyWordSyncTimelineReadiness } from '../src/core/word-sync-timeline-guard.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function fixture({
  pacingVersion = 6,
  timelineTimingStatus = 'audio-synced',
  statusTimeline = 'audio-synced',
  timelinePresent = true
} = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'word-sync-timeline-guard-'));
  await mkdir(path.join(root, 'timeline'), { recursive: true });
  await mkdir(path.join(root, 'review'), { recursive: true });
  await writeJson(path.join(root, 'status.json'), { timeline: statusTimeline });
  await writeJson(path.join(root, 'review', 'audio-pacing-report.json'), {
    version: pacingVersion,
    passed: true
  });
  if (timelinePresent) {
    await writeJson(path.join(root, 'timeline', 'timeline-plan.json'), {
      version: 3,
      timingStatus: timelineTimingStatus
    });
  }
  return root;
}

test('moderne Audio-Pipeline erlaubt Word-Sync nur mit audio-synced Timeline', async () => {
  const root = await fixture();
  const result = await verifyWordSyncTimelineReadiness(root);

  assert.equal(result.required, true);
  assert.equal(result.modernAudioPipeline, true);
  assert.equal(result.audioSynced, true);
  assert.equal(result.passed, true);
});

test('moderne Audio-Pipeline blockiert geschätzte oder nur dauer-synchronisierte Timeline', async () => {
  for (const timingStatus of ['estimated', 'audio-duration-synced']) {
    const root = await fixture({ timelineTimingStatus: timingStatus, statusTimeline: timingStatus });
    const result = await verifyWordSyncTimelineReadiness(root);

    assert.equal(result.required, true);
    assert.equal(result.passed, false);
    assert.match(result.reason, /noch nicht exakt/);
  }
});

test('explizit veralteter Timeline-Status blockiert Word-Sync auch bei vorhandener alter Timeline', async () => {
  const root = await fixture({
    pacingVersion: 5,
    timelineTimingStatus: 'audio-synced',
    statusTimeline: 'needs-rebuild-after-audio-pacing'
  });
  const result = await verifyWordSyncTimelineReadiness(root);

  assert.equal(result.required, true);
  assert.equal(result.explicitStale, true);
  assert.equal(result.passed, false);
  assert.match(result.reason, /veraltet/);
});

test('moderne Pipeline blockiert fehlende Timeline', async () => {
  const root = await fixture({ timelinePresent: false, statusTimeline: 'planned' });
  const result = await verifyWordSyncTimelineReadiness(root);

  assert.equal(result.required, true);
  assert.equal(result.timelinePresent, false);
  assert.equal(result.passed, false);
  assert.match(result.reason, /timeline-plan\.json fehlt/);
});

test('Legacy-Pipeline ohne expliziten stale Status behält bisheriges Verhalten', async () => {
  const root = await fixture({
    pacingVersion: 5,
    timelineTimingStatus: 'estimated',
    statusTimeline: 'estimated'
  });
  const result = await verifyWordSyncTimelineReadiness(root);

  assert.equal(result.required, false);
  assert.equal(result.passed, true);
  assert.equal(result.legacy, true);
});
