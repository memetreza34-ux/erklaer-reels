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

test('wertet Wort-Sync bei deaktivierter Wortmarkierung automatisch als nicht erforderlich', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'erklaer-progress-'));

  await writeJson(path.join(root, 'reel.json'), {
    reelId: 'reel-01_test',
    title: 'Test',
    visualStyleId: 'human-editorial-cartoon',
    visualStyleReason: 'Ein konsistenter Editorial-Cartoon erklärt das Thema verständlich.'
  });
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), []);
  await writeJson(path.join(root, 'assets-manifest.json'), { audio: {}, scenes: [], cover: {} });
  await writeJson(path.join(root, 'subtitles', 'subtitle-plan.json'), {
    highlightCurrentWord: false,
    position: 'lower',
    verticalPositionPercent: 76
  });

  const progress = await calculateReelProgress(root);

  assert.equal(progress.wordSync, 100);
  assert.equal(progress.details.wordSyncRequired, false);
  assert.equal(progress.details.wordSyncPassed, true);
  assert.equal(progress.details.wordSyncProvider, 'not-required');
  assert.equal(progress.details.wordCoverage, 1);
});
