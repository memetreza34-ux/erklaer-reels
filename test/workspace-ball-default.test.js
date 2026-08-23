import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createReelWorkspace } from '../src/core/workspace.js';

test('neue Workspaces verwenden standardmäßig ausschließlich die Kugel-Welt', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'workspace-ball-default-'));
  const result = await createReelWorkspace({
    title: 'Test Reel',
    script: 'Ein ausreichend klarer Testtext für einen neuen Reel-Arbeitsordner.',
    date: new Date('2026-08-31T12:00:00'),
    sceneCount: 13,
    outputRoot
  });

  assert.equal(result.reel.visualStyleId, 'round-country-characters');
  assert.match(result.reel.visualStyleReason, /Kugel-Welt/);

  const status = JSON.parse(await readFile(path.join(result.reelDirectory, 'status.json'), 'utf8'));
  assert.equal(status.visualStyle, 'round-country-characters');
  assert.equal(status.imagePromptDelivery, 'one-file-per-image');

  await access(path.join(result.reelDirectory, 'all-image-prompts', 'individual-prompts'));
});
