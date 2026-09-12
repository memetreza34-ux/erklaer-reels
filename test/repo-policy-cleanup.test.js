import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const text = (file) => readFile(path.resolve(file), 'utf8');
async function exists(file) {
  try { await access(path.resolve(file)); return true; } catch { return false; }
}

test('gefährliche Fake-QC- und Fake-Timing-Helfer bleiben entfernt', async () => {
  for (const file of ['force-render-state.js', 'approve-visuals.js', 'confirm-assets.js', 'do-sync.js', 'auto-sync.js', 'auto-cues.js']) {
    assert.equal(await exists(file), false, `${file} darf nicht wieder aktiv werden.`);
  }
});

test('README nennt aktive Reel-Bildwelt, Themenfokus und Simple Mode', async () => {
  const readme = await text('README.md');
  assert.match(readme, /serious-minimal-countryball-explainer/);
  assert.match(readme, /Politik, Geschichte, Geografie/i);
  assert.match(readme, /phase3:reel/);
  assert.match(readme, /Adaptive Dense V2/i);
});

test('Antigravity Policy verbietet Eigenproduktion und alte Zwei-Pass-Pflicht', async () => {
  const policy = await text('ANTIGRAVITY_IMAGE_POLICY.md');
  assert.match(policy, /erzeugt keine Reel-Bilder/i);
  assert.match(policy, /phase3:reel/);
  assert.match(policy, /keine zweite Zuordnungsprüfung/i);
  assert.doesNotMatch(policy, /visuelle Zwei-Pass-QC/);
});

test('Quality Gates verwenden Single-Pass-Fast-QC', async () => {
  const gates = JSON.parse(await text('config/production-quality-gates.json'));
  assert.equal(gates.assetMatching.mode, 'ordered-fast-qc-v3');
  assert.equal(gates.assetMatching.requireSecondPassConfirmation, false);
  assert.equal(gates.assetMatching.requireMatchReason, false);
  assert.equal(gates.assetMatching.requireVisibleSummary, false);
  assert.equal(gates.assetMatching.askUserOnlyOnHardBlocker, true);
  assert.equal(gates.visualContinuity.singlePassVisualQc, true);
});
