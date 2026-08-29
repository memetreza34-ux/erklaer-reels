import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FIXED_VISUAL_STYLE_ID, FIXED_VISUAL_WORLD_LABEL } from '../src/shared/fixed-visual-world.js';

// fileURLToPath statt .pathname: ein Umlaut im Projektpfad bleibt sonst prozent-kodiert
// und jeder Dateizugriff schlägt fehl.
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));

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

test('ein frisch angelegtes Reel besteht die Bildwelt-Prüfung der Inhaltskontrolle', async () => {
  const { createReelWorkspace } = await import('../src/core/workspace.js');
  const { validateReelContent } = await import('../src/core/content-validator.js');
  const { mkdtemp, rm } = await import('node:fs/promises');
  const os = await import('node:os');

  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-world-gate-'));
  try {
    const result = await createReelWorkspace({
      title: 'Warum haben manche Länder zwei Hauptstädte?',
      script: 'Dieses Rohscript wird später zu einem vollständigen Ein-Minuten-Reel erweitert und dient hier nur als Platzhalter.',
      date: new Date('2026-09-10T12:00:00'),
      outputRoot
    });

    const report = await validateReelContent(result.reelDirectory);
    const worldChecks = report.checks.filter((check) => check.id.startsWith('visual-world-'));

    // createReelWorkspace setzt die feste Bildwelt. Wenn die Inhaltsprüfung sie
    // ablehnt, kann kein einziges neues Reel je fertig werden — genau dieser
    // Widerspruch bestand, solange der Validator eine leere visualStyleId verlangte.
    assert.ok(worldChecks.length > 0, 'Die Bildwelt muss geprüft werden');
    for (const check of worldChecks) {
      assert.equal(check.passed, true, `${check.id}: ${check.message}`);
    }
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});
