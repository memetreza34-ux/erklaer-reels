import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FIXED_VISUAL_STYLE_ID, FIXED_VISUAL_WORLD_LABEL } from '../src/shared/fixed-visual-world.js';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (relativePath) => readFile(path.join(REPO_ROOT, relativePath), 'utf8');

const REEL_POLICY_FILES = [
  'AGENTS.md',
  'CURRENT_WORKFLOW.md',
  'README.md',
  'config/content-rules.json',
  'config/image-styles.json',
  'knowledge/fixed-visual-world.md'
];

test('aktive Reel-Bildwelt bleibt überall Serious Minimal Countryball Explainer', async () => {
  assert.equal(FIXED_VISUAL_STYLE_ID, 'serious-minimal-countryball-explainer');
  assert.equal(FIXED_VISUAL_WORLD_LABEL, 'Serious Minimal Countryball Explainer');

  for (const relativePath of REEL_POLICY_FILES) {
    const content = await read(relativePath);
    assert.ok(content.includes(FIXED_VISUAL_STYLE_ID) || content.includes(FIXED_VISUAL_WORLD_LABEL), `${relativePath} muss die aktive Reel-Bildwelt nennen.`);
  }
});

test('Runtime, Style-Config und Content-Regeln teilen dieselbe Reel-Style-ID', async () => {
  const styles = JSON.parse(await read('config/image-styles.json'));
  const contentRules = JSON.parse(await read('config/content-rules.json'));
  const ids = new Set([
    FIXED_VISUAL_STYLE_ID,
    styles.fixedVisualWorld,
    styles.styles[0].id,
    ...styles.newReelAllowedStyleIds,
    contentRules.visualRules.fixedVisualWorld
  ]);
  assert.equal(ids.size, 1, `Uneinheitliche Reel-Style-IDs: ${[...ids].join(', ')}`);
});

test('Reel-Style-Bibel liegt am konfigurierten Ort', async () => {
  const styles = JSON.parse(await read('config/image-styles.json'));
  const contentRules = JSON.parse(await read('config/content-rules.json'));
  assert.equal(styles.styleBiblePath, 'knowledge/fixed-visual-world.md');
  assert.equal(contentRules.visualRules.styleBiblePath, 'knowledge/fixed-visual-world.md');
  const knowledgeFiles = await readdir(path.join(REPO_ROOT, 'knowledge'));
  assert.ok(knowledgeFiles.includes('fixed-visual-world.md'));
});

test('YouTube bleibt eigener Workflow, nutzt aber wieder dieselbe Serious-Minimal-Countryball-DNA', async () => {
  const [workflow, readme, reelBible, youtubeWorld, policy] = await Promise.all([
    read('CURRENT_WORKFLOW.md'),
    read('README.md'),
    read('knowledge/fixed-visual-world.md'),
    read('youtube/YOUTUBE_VISUAL_WORLD.md'),
    read('config/youtube-channel-policy.json').then(JSON.parse)
  ]);

  assert.match(workflow, /serious-minimal-countryball-explainer-youtube-16x9/i);
  assert.match(readme, /serious-minimal-countryball-explainer-youtube-16x9/i);
  assert.match(reelBible, /dieselbe.*Countryball|gleiche.*Countryball|shared.*Countryball/i);
  assert.match(youtubeWorld, /serious-minimal-countryball-explainer-youtube-16x9/i);
  assert.equal(policy.visualStyleId, 'serious-minimal-countryball-explainer-youtube-16x9');
  assert.equal(policy.sourceVisualWorldId, 'serious-minimal-countryball-explainer');
  assert.match(youtubeWorld, /kein.*Referenz|do not use any previous generated image as a visual reference/i);
});
