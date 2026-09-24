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

test('YouTube bleibt eigener Workflow und nutzt eine getrennte Editorial-Bildwelt', async () => {
  const [workflow, readme, reelBible, youtubeWorld] = await Promise.all([
    read('CURRENT_WORKFLOW.md'),
    read('README.md'),
    read('knowledge/fixed-visual-world.md'),
    read('youtube/YOUTUBE_VISUAL_WORLD.md')
  ]);

  assert.match(workflow, /eigene unabhängige 16:9-Editorial-Bildwelt|eigene YouTube-Bildwelt/i);
  assert.match(readme, /premium-editorial-explainer-illustration-youtube-16x9/);
  assert.match(reelBible, /YouTube.*nicht mehr automatisch|eigene 16:9-Bildwelt/i);
  assert.match(youtubeWorld, /premium-editorial-explainer-illustration-youtube-16x9/);
  assert.match(youtubeWorld, /kein.*Bild.*Referenz|no previous generated image as a visual reference/i);
});
