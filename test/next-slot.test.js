import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { findNextFreeProductionSlot } from '../src/core/next-slot.js';

async function temporaryContentRoot() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'erklaer-reels-slot-'));
  return { root, content: path.join(root, 'content') };
}

async function occupy(content, week, weekday, reel = 'reel-01_test') {
  await mkdir(path.join(content, week, weekday, reel), { recursive: true });
}

test('wählt im neuesten Wochenordner den ersten chronologisch freien Tag', async () => {
  const { root, content } = await temporaryContentRoot();
  try {
    const week = '2026-KW31_27-07_bis_02-08';
    await occupy(content, week, 'montag');

    const slot = await findNextFreeProductionSlot({
      outputRoot: content,
      now: new Date('2026-08-01T12:00:00')
    });

    assert.equal(slot.weekDirectoryName, week);
    assert.equal(slot.weekday, 'dienstag');
    assert.equal(slot.dateValue, '2026-07-28');
    assert.equal(slot.reason, 'first-free-day-in-latest-week');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('beginnt am nächsten Montag, wenn die neueste Woche vollständig belegt ist', async () => {
  const { root, content } = await temporaryContentRoot();
  try {
    const week = '2026-KW31_27-07_bis_02-08';
    for (const weekday of ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag']) {
      await occupy(content, week, weekday);
    }

    const slot = await findNextFreeProductionSlot({
      outputRoot: content,
      now: new Date('2026-08-01T12:00:00')
    });

    assert.equal(slot.weekday, 'montag');
    assert.equal(slot.dateValue, '2026-08-03');
    assert.equal(slot.weekDirectoryName, '2026-KW32_03-08_bis_09-08');
    assert.equal(slot.reason, 'latest-week-full-next-monday');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('startet ohne vorhandene Wochen am aktuellen Wochentag', async () => {
  const { root, content } = await temporaryContentRoot();
  try {
    const slot = await findNextFreeProductionSlot({
      outputRoot: content,
      now: new Date('2026-08-01T12:00:00')
    });

    assert.equal(slot.weekday, 'samstag');
    assert.equal(slot.dateValue, '2026-08-01');
    assert.equal(slot.weekDirectoryName, '2026-KW31_27-07_bis_02-08');
    assert.equal(slot.reason, 'no-existing-week-start-at-current-day');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
