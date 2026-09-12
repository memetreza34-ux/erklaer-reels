import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const text = (file) => readFile(path.join(REPO_ROOT, file), 'utf8');

test('Workspace-Core verankert aktuelle Bildwelt und Quellen-Schema', async () => {
  const workspace = await text('src/core/workspace.js');
  const fixedWorld = await text('src/shared/fixed-visual-world.js');
  assert.match(workspace, /FIXED_VISUAL_STYLE_ID/);
  assert.match(fixedWorld, /serious-minimal-countryball-explainer/);
  assert.match(workspace, /sourceQualitySchemaVersion:\s*3/);
});

test('Audio-Pacing bindet echte Messung an die Ausgabedatei', async () => {
  const source = await text('src/cli/trim-pauses.js');
  assert.match(source, /stampAudioPacingFileBinding/);
  assert.match(source, /Gemessen:/);
  assert.match(source, /SHA-256-Fingerprint/);
});

test('aktiver Reel-Renderpfad benötigt keinen Word-Sync', async () => {
  const packageJson = JSON.parse(await text('package.json'));
  const renderer = await text('src/cli/render-reel.js');
  assert.equal(packageJson.scripts['sync:words'], undefined);
  assert.equal(packageJson.scripts['legacy:sync:words'], 'node src/cli/sync-words.js');
  assert.doesNotMatch(renderer, /verifyAppliedWordSyncAudioBinding/);
});

test('Phase 3 besitzt einen nicht-interaktiven Simple-Mode-Einstieg', async () => {
  const packageJson = JSON.parse(await text('package.json'));
  const phase3 = await text('src/cli/phase3-reel.js');
  assert.equal(packageJson.scripts['phase3:reel'], 'node src/cli/phase3-reel.js');
  assert.match(phase3, /NONINTERACTIVE/);
  assert.match(phase3, /ANTIGRAVITY_AUTOPILOT/);
  assert.match(phase3, /organize:assets/);
  assert.match(phase3, /--numbered/);
  assert.match(phase3, /auto-align:reel/);
  assert.match(phase3, /sync:sounds/);
});
