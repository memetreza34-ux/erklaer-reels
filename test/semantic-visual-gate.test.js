import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { verifySemanticVisualReview } from '../src/core/semantic-visual-review-guard.js';
import { runVisualQualityCheck } from '../src/core/visual-qc.js';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'erklaer-semantic-review-'));
  const scene = {
    sceneId: 'scene-01', order: 1, title: 'Vetorecht',
    narration: 'Ein Vetorecht erlaubt es, eine Entscheidung zu blockieren.',
    audioCue: 'Ein Vetorecht',
    visualIdea: 'Eine große rote Stop-Hand vor einem Abstimmungssymbol in der Serious-Minimal-Countryball-Welt.',
    imageText: 'VETORECHT',
    imageCount: 1,
    imagePhases: [{
      phaseId: 'scene-01-image-01', order: 1, startPercent: 0,
      promptFileName: 'image-prompt.txt', expectedImageFileName: 'scene-01.png',
      visualIdea: 'Eine große rote Stop-Hand vor einem Abstimmungssymbol in der Serious-Minimal-Countryball-Welt.',
      imageText: 'VETORECHT'
    }]
  };
  await writeJson(path.join(root, 'reel.json'), {
    reelId: 'reel-01_vetorecht', date: '2026-09-23', title: 'Was ist ein Vetorecht?',
    subtitlesEnabled: false, imageCountMode: 'adaptive-dense-v2', plannedImageCount: 1,
    visualStyleId: 'serious-minimal-countryball-explainer'
  });
  await writeJson(path.join(root, 'scenes', 'scene-index.json'), [scene]);
  await mkdir(path.join(root, 'scenes', 'scene-01'), { recursive: true });
  await writeFile(path.join(root, 'scenes', 'scene-01', 'image-prompt.txt'), 'Vertical 9:16 Serious Minimal Countryball Explainer. Exact German text: VETORECHT.', 'utf8');
  await writeJson(path.join(root, 'assets-manifest.json'), {
    visuals: [{ targetId: 'scene-01', expectedFile: 'scenes/scene-01/scene-01.png', status: 'missing' }],
    scenes: [{ sceneId: 'scene-01', expectedFile: 'scenes/scene-01/scene-01.png', status: 'missing' }]
  });
  await writeJson(path.join(root, 'effects', 'effects-plan.json'), { scenes: [] });
  await writeJson(path.join(root, 'status.json'), {});
  await mkdir(path.join(root, 'review'), { recursive: true });
  return root;
}

test('neues Reel blockiert solange die echte semantische Sichtprüfung pending ist', async () => {
  const root = await fixture();
  await runVisualQualityCheck(root, { strict: false });
  const result = await verifySemanticVisualReview(root);
  assert.equal(result.required, true);
  assert.equal(result.passed, false);
  assert.ok(result.findings.some((finding) => finding.issue === 'semantic-review-not-passed'));
  assert.ok(result.findings.some((finding) => finding.issue === 'semantic-check-not-confirmed'));
});

test('ein einmal real geprüftes Bild besteht mit Reviewer, Zeitpunkt und allen Checks', async () => {
  const root = await fixture();
  await runVisualQualityCheck(root, { strict: false });
  const inspectionPath = path.join(root, 'review', 'visual-inspection.json');
  const inspection = await readJson(inspectionPath);
  const entry = inspection.assets[0];
  entry.reviewer = 'antigravity-visual-review';
  entry.reviewedAt = '2026-09-23T18:30:00.000Z';
  entry.status = 'passed';
  for (const key of Object.keys(entry.checks)) entry.checks[key] = true;
  await writeJson(inspectionPath, inspection);

  const result = await verifySemanticVisualReview(root);
  assert.equal(result.required, true);
  assert.equal(result.passed, true, JSON.stringify(result.findings, null, 2));
  assert.equal(result.checkedAssets, 1);
});

test('Bild- oder Bedeutungsänderung invalidiert die alte semantische Freigabe automatisch', async () => {
  const root = await fixture();
  await runVisualQualityCheck(root, { strict: false });
  const inspectionPath = path.join(root, 'review', 'visual-inspection.json');
  const first = await readJson(inspectionPath);
  first.assets[0].reviewer = 'antigravity-visual-review';
  first.assets[0].reviewedAt = '2026-09-23T18:30:00.000Z';
  first.assets[0].status = 'passed';
  for (const key of Object.keys(first.assets[0].checks)) first.assets[0].checks[key] = true;
  await writeJson(inspectionPath, first);
  assert.equal((await verifySemanticVisualReview(root)).passed, true);

  const scenesPath = path.join(root, 'scenes', 'scene-index.json');
  const scenes = await readJson(scenesPath);
  scenes[0].narration = 'Das Vetorecht eines ständigen Mitglieds kann einen Beschluss des Sicherheitsrats verhindern.';
  scenes[0].visualIdea = 'UN-Sicherheitsrat mit einem klar markierten blockierenden Countryball.';
  await writeJson(scenesPath, scenes);

  await runVisualQualityCheck(root, { strict: false });
  const refreshed = await readJson(inspectionPath);
  assert.equal(refreshed.assets[0].status, 'pending');
  assert.equal(refreshed.assets[0].reviewer, '');
  assert.notEqual(refreshed.assets[0].reviewFingerprint, first.assets[0].reviewFingerprint);
  assert.equal((await verifySemanticVisualReview(root)).passed, false);
});

test('Finalizer und Renderer re-fingerprinten die aktuellen Bilder vor Freigabe', async () => {
  const [finalizer, renderer, rules] = await Promise.all([
    readFile('src/cli/finalize-reel.js', 'utf8'),
    readFile('src/cli/render-reel.js', 'utf8'),
    readFile('config/visual-quality-rules.json', 'utf8').then(JSON.parse)
  ]);
  for (const source of [finalizer, renderer]) {
    assert.match(source, /runVisualQualityCheck\(reelDirectory, \{ strict: true \}\)/);
    assert.match(source, /verifySemanticVisualReview/);
  }
  assert.equal(rules.semanticReview.requirePassedStatus, true);
  assert.equal(rules.semanticReview.requireAllChecksTrue, true);
  assert.equal(rules.semanticReview.fingerprintBound, true);
  assert.equal(rules.semanticReview.forceCannotBypass, true);
  assert.equal(rules.strictMode.requireSemanticSceneVerification, true);
});
