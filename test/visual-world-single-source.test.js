import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FIXED_VISUAL_STYLE_ID, FIXED_VISUAL_WORLD_LABEL } from '../src/shared/fixed-visual-world.js';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (relativePath) => readFile(path.join(REPO_ROOT, relativePath), 'utf8');

const POLICY_FILES = [
  'AGENTS.md',
  'CURRENT_WORKFLOW.md',
  'README.md',
  'config/content-rules.json',
  'config/image-styles.json',
  'knowledge/fixed-visual-world.md'
];

test('aktive Reel-Bildwelt ist überall Serious Minimal Countryball Explainer', async () => {
  assert.equal(FIXED_VISUAL_STYLE_ID, 'serious-minimal-countryball-explainer');
  assert.equal(FIXED_VISUAL_WORLD_LABEL, 'Serious Minimal Countryball Explainer');

  for (const relativePath of POLICY_FILES) {
    const content = await read(relativePath);
    assert.ok(content.includes(FIXED_VISUAL_STYLE_ID) || content.includes(FIXED_VISUAL_WORLD_LABEL), `${relativePath} muss die aktive Bildwelt nennen.`);
  }
});

test('Runtime, Style-Config und Content-Regeln teilen dieselbe Style-ID', async () => {
  const styles = JSON.parse(await read('config/image-styles.json'));
  const contentRules = JSON.parse(await read('config/content-rules.json'));
  const ids = new Set([
    FIXED_VISUAL_STYLE_ID,
    styles.fixedVisualWorld,
    styles.styles[0].id,
    ...styles.newReelAllowedStyleIds,
    contentRules.visualRules.fixedVisualWorld
  ]);
  assert.equal(ids.size, 1, `Uneinheitliche Style-IDs: ${[...ids].join(', ')}`);
});

test('Style-Bibel liegt am konfigurierten Ort', async () => {
  const styles = JSON.parse(await read('config/image-styles.json'));
  const contentRules = JSON.parse(await read('config/content-rules.json'));
  assert.equal(styles.styleBiblePath, 'knowledge/fixed-visual-world.md');
  assert.equal(contentRules.visualRules.styleBiblePath, 'knowledge/fixed-visual-world.md');
  const knowledgeFiles = await readdir(path.join(REPO_ROOT, 'knowledge'));
  assert.ok(knowledgeFiles.includes('fixed-visual-world.md'));
});

test('YouTube bleibt als eigene Bildwelt getrennt', async () => {
  const workflow = await read('CURRENT_WORKFLOW.md');
  assert.match(workflow, /YouTube bleibt.*getrennt/i);
});
