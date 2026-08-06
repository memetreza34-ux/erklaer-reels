import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { calculateReelProgress } from '../src/core/reel-progress.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

test('verlangt exakten Wort-Sync auch ohne Wortmarkierung', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'erklaer-progress-'));

  await writeJson(path.join(root, 'reel.json'), {
    reelId: 'reel-01_test',
    title: 'Test',
    subtitlesEnabled: true,
    visualStyleId: 'human-editorial-cartoon',
    visualStyleReason: 'Ein konsistenter Editorial-Cartoon erklärt das Thema verständlich.'
  });
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), []);
  await writeJson(path.join(root, 'assets-manifest.json'), { audio: {}, scenes: [], cover: {} });
  await writeJson(path.join(root, 'subtitles', 'subtitle-plan.json'), {
    enabled: true,
    highlightCurrentWord: false,
    position: 'center',
    verticalPositionPercent: 58,
    exactWordTimingsRequired: true
  });

  const progress = await calculateReelProgress(root);

  assert.equal(progress.wordSync, 0);
  assert.equal(progress.details.wordSyncRequired, true);
  assert.equal(progress.details.wordSyncPassed, false);
  assert.equal(progress.details.wordSyncProvider, null);
  assert.equal(progress.details.wordCoverage, 0);
  assert.match(progress.nextStep, /production\/agent-task|Voice-over|sync:words/);
});
