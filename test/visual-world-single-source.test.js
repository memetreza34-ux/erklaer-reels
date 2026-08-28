import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import { FIXED_VISUAL_STYLE_ID, FIXED_VISUAL_WORLD_LABEL } from '../src/shared/fixed-visual-world.js';

const REPO_ROOT = new URL('..', import.meta.url).pathname;

// Jede Style-ID und jeder Weltname, der einmal aktiv war. Keiner davon darf in einer
// Policy-Datei wieder auftauchen, sonst laufen Agenten erneut auseinander.
const RETIRED_STYLE_IDS = [
  'human-head-editorial-reel',
  'human-editorial-cartoon',
  'round-country-characters',
  'visual-metaphor'
];

const RETIRED_WORLD_LABELS = [
  'Human Head Editorial Reel',
  'Human Editorial Explainer'
];

// Dateien, die einem Agenten sagen, wie er ein neues Reel baut.
const POLICY_FILES = [
  'AGENTS.md',
  'CODEX_TASK.md',
  'CURRENT_WORKFLOW.md',
  'PRODUCTION_STATUS.md',
  'README.md',
  'config/content-rules.json',
  'config/image-styles.json',
  'docs/autonomous-reel.md',
  'docs/roadmap.md',
  'knowledge/fixed-visual-world.md',
  'knowledge/production-rules.md',
  'knowledge/visual-quality-rules.md'
];

async function read(relativePath) {
  return readFile(path.join(REPO_ROOT, relativePath), 'utf8');
}

test('keine Policy-Datei nennt eine abgeschaltete Bildwelt als aktiv', async () => {
  for (const relativePath of POLICY_FILES) {
    const content = await read(relativePath);

    for (const retiredId of RETIRED_STYLE_IDS) {
      const lines = content.split('\n').filter((line) => line.includes(retiredId));
      for (const line of lines) {
        // Eine Erwähnung ist nur erlaubt, wenn sie ausdrücklich als abgeschaltet markiert ist.
        assert.match(
          line,
          /Nicht autonom aktivieren|nicht automatisch aktivieren|abgeschaltet|Legacy|legacy/,
          `${relativePath} nennt die abgeschaltete Bildwelt "${retiredId}" ohne sie als inaktiv zu markieren:\n${line.trim()}`
        );
      }
    }

    for (const retiredLabel of RETIRED_WORLD_LABELS) {
      assert.ok(
        !content.includes(retiredLabel),
        `${relativePath} nennt noch den alten Weltnamen "${retiredLabel}".`
      );
    }
  }
});

test('jede Policy-Datei nennt genau die aktive Bildwelt', async () => {
  const mustNameStyleId = [
    'CODEX_TASK.md',
    'PRODUCTION_STATUS.md',
    'README.md',
    'config/content-rules.json',
    'config/image-styles.json',
    'docs/autonomous-reel.md',
    'knowledge/fixed-visual-world.md',
    'knowledge/production-rules.md',
    'knowledge/visual-quality-rules.md'
  ];

  for (const relativePath of mustNameStyleId) {
    const content = await read(relativePath);
    assert.ok(
      content.includes(FIXED_VISUAL_STYLE_ID),
      `${relativePath} nennt die aktive Style-ID "${FIXED_VISUAL_STYLE_ID}" nicht.`
    );
  }

  const mustNameLabel = ['AGENTS.md', 'CURRENT_WORKFLOW.md', 'README.md'];
  for (const relativePath of mustNameLabel) {
    const content = await read(relativePath);
    assert.ok(
      content.includes(FIXED_VISUAL_WORLD_LABEL),
      `${relativePath} nennt den aktiven Weltnamen "${FIXED_VISUAL_WORLD_LABEL}" nicht.`
    );
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

  assert.equal(ids.size, 1, `Uneinheitliche Style-IDs im Repo: ${[...ids].join(', ')}`);
});

test('Style-Bibel liegt dort, wo Config und Produktionsregeln sie erwarten', async () => {
  const styles = JSON.parse(await read('config/image-styles.json'));
  const contentRules = JSON.parse(await read('config/content-rules.json'));

  assert.equal(styles.styleBiblePath, 'knowledge/fixed-visual-world.md');
  assert.equal(contentRules.visualRules.styleBiblePath, 'knowledge/fixed-visual-world.md');

  const knowledgeFiles = await readdir(path.join(REPO_ROOT, 'knowledge'));
  assert.ok(knowledgeFiles.includes('fixed-visual-world.md'));
});
