import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const load = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Post-Video-Lernschleife ist in den vorrangigen Agenten- und Workflowregeln verankert', async () => {
  for (const file of ['AGENTS.md', 'CURRENT_WORKFLOW.md', 'youtube/YOUTUBE_WORKFLOW.md']) {
    const content = await load(file);
    assert.match(content, /docs\/POST_VIDEO_IMPROVEMENT\.md/, file);
    assert.match(content, /nach jedem.*Video/i, file);
  }
});

test('Lernschleife verlangt beobachtbares Feedback und schützt vorhandene Videos', async () => {
  const policy = await load('docs/POST_VIDEO_IMPROVEMENT.md');
  assert.match(policy, /Nach JEDEM fertiggestellten Video/);
  assert.match(policy, /tatsächlich ansehen oder prüfen/);
  assert.match(policy, /Zeitstempel/);
  assert.match(policy, /wiederverwendbar/);
  assert.match(policy, /ausdrücklichen Auftrag für genau dieses Video/);
  assert.match(policy, /keinen.*künstlichen Commit/i);
  assert.match(policy, /keine.*selbstständige externe Nachbearbeitung/i);
  assert.match(policy, /docs\/CHANGE_SAFETY_POLICY\.md/);
  assert.match(policy, /YouTube-Analytics nur berücksichtigen/);
});
