import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createReelWorkspace } from '../src/core/workspace.js';
import { validateReelContent } from '../src/core/content-validator.js';
import { SUBTITLE_STYLE } from '../src/shared/subtitle-style.js';

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function getCheck(report, id) {
  const check = report.checks.find((item) => item.id === id);
  assert.ok(check, `Prüfung ${id} wurde nicht erzeugt.`);
  return check;
}

test('neue Arbeitsordner verwenden social-safe Untertitel mit exakter Wortmarkierung', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-reels-subtitles-'));

  try {
    const { reelDirectory } = await createReelWorkspace({
      title: 'Untertitel Test',
      script: 'Dieses Rohscript wird zu einem vollständigen Ein-Minuten-Reel mit exakt synchronisierten Untertiteln ausgebaut.',
      date: new Date('2026-08-03T12:00:00'),
      sceneCount: 13,
      outputRoot
    });

    const plan = await readJson(path.join(reelDirectory, 'subtitles', 'subtitle-plan.json'));
    const scene = await readJson(path.join(reelDirectory, 'scenes', 'scene-01', 'scene.json'));

    assert.equal(SUBTITLE_STYLE.position, 'center');
    assert.equal(SUBTITLE_STYLE.verticalPositionPercent, 64);
    assert.deepEqual(SUBTITLE_STYLE.safeVerticalRangePercent, { min: 62, max: 66 });
    assert.equal(SUBTITLE_STYLE.maxWidthPercent, 72);
    assert.equal(SUBTITLE_STYLE.textColor, '#F5F7FA');
    assert.equal(scene.subtitlePosition, SUBTITLE_STYLE.position);
    assert.equal(plan.position, SUBTITLE_STYLE.position);
    assert.equal(plan.verticalPositionPercent, SUBTITLE_STYLE.verticalPositionPercent);
    assert.deepEqual(plan.safeVerticalRangePercent, SUBTITLE_STYLE.safeVerticalRangePercent);
    assert.equal(plan.textColor, SUBTITLE_STYLE.textColor);
    assert.equal(plan.highlightCurrentWord, true);
    assert.equal(plan.highlightColor, '#B7794A');
    assert.equal(plan.backgroundColor, 'transparent');
    assert.equal(plan.exactWordTimingsRequired, true);
    assert.equal(plan.timingProvider, 'codex-local-audio-review');
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});

test('strenge Inhaltsprüfung blockiert Positionen außerhalb der Safe-Zone, falsche Farben und Box', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-reels-old-subtitles-'));

  try {
    const { reelDirectory } = await createReelWorkspace({
      title: 'Alte Untertitelwerte',
      script: 'Dieses Rohscript dient ausschließlich der Prüfung veralteter Untertitelwerte im strengen Modus.',
      date: new Date('2026-08-04T12:00:00'),
      sceneCount: 13,
      outputRoot
    });

    const planPath = path.join(reelDirectory, 'subtitles', 'subtitle-plan.json');
    const plan = await readJson(planPath);
    plan.verticalPositionPercent = 58;
    plan.safeVerticalRangePercent = { min: 58, max: 58 };
    plan.textColor = '#E7C39A';
    plan.highlightColor = '#E7C39A';
    plan.backgroundColor = 'rgba(0, 0, 0, 0.72)';
    await writeJson(planPath, plan);

    const report = await validateReelContent(reelDirectory, { strict: true });

    assert.equal(getCheck(report, 'subtitle-plan-vertical-position').passed, false);
    assert.equal(getCheck(report, 'subtitle-plan-safe-range-min').passed, false);
    assert.equal(getCheck(report, 'subtitle-plan-safe-range-max').passed, false);
    assert.equal(getCheck(report, 'subtitle-plan-text-color').passed, false);
    assert.equal(getCheck(report, 'subtitle-plan-highlight-color').passed, false);
    assert.equal(getCheck(report, 'subtitle-plan-background-color').passed, false);
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});
