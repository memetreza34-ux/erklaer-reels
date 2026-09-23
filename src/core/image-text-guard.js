import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { normalizeImageText, readImageTexts } from './image-text-ocr.js';

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function readJson(filePath, fallback = null) {
  if (!(await exists(filePath))) return fallback;
  try { return JSON.parse(await readFile(filePath, 'utf8')); } catch { return fallback; }
}

async function sha256(filePath) {
  return createHash('sha256').update(await readFile(filePath)).digest('hex');
}

function collectPlannedShots(plan, timeline) {
  const renderShots = (plan?.scenes ?? []).filter((shot) => Object.prototype.hasOwnProperty.call(shot, 'imageText'));
  if (renderShots.length) return renderShots;

  const shots = [];
  for (const scene of timeline?.scenes ?? []) {
    const phases = Array.isArray(scene.imagePhases) && scene.imagePhases.length ? scene.imagePhases : [scene];
    for (const phase of phases) {
      if (!Object.prototype.hasOwnProperty.call(phase, 'imageText')) continue;
      shots.push({
        sceneId: phase.targetId ?? scene.id,
        imageFile: phase.imageFile ?? scene.imageFile,
        imageText: phase.imageText
      });
    }
  }
  return shots;
}

export function evaluateImageTextFindings(shots, recognizedByFile, reelDirectory = '.') {
  const findings = [];
  for (const shot of shots) {
    const absolute = path.resolve(reelDirectory, shot.imageFile);
    const recognized = recognizedByFile.get(absolute);
    const planned = normalizeImageText(shot.imageText);
    const seen = normalizeImageText(recognized?.text ?? recognized?.lines?.join(' ') ?? '');

    if (planned) {
      if (!seen.includes(planned)) {
        findings.push({
          sceneId: shot.sceneId,
          imageFile: shot.imageFile,
          issue: 'planned-image-text-missing',
          planned: shot.imageText,
          seen: recognized?.lines?.join(' / ') || '(kein Text erkannt)'
        });
      }
    } else if (seen) {
      findings.push({
        sceneId: shot.sceneId,
        imageFile: shot.imageFile,
        issue: 'unexpected-readable-text',
        planned: '',
        seen: recognized?.lines?.join(' / ') || seen
      });
    }
  }
  return findings;
}

export async function verifyRenderedImageText(reelDirectory, { recognizer = readImageTexts } = {}) {
  const rules = await readJson(path.resolve('config', 'visual-quality-rules.json'), {});
  const textRules = rules.renderedImageText ?? {};
  const gateSince = String(textRules.hardGateSince ?? '');
  const reel = await readJson(path.join(reelDirectory, 'reel.json'), {});
  const required = textRules.verifyPlannedTextIsVisible === true
    && Boolean(gateSince)
    && String(reel?.date ?? '') >= gateSince;

  if (!required) {
    return { required: false, passed: true, reason: 'Reel liegt vor dem verpflichtenden Bildtext-Gate.', findings: [], checkedImages: 0 };
  }

  const plan = await readJson(path.join(reelDirectory, 'render', 'render-plan.json'), null);
  const timeline = await readJson(path.join(reelDirectory, 'timeline', 'timeline-plan.json'), null);
  if (!plan && !timeline) {
    return { required, passed: false, reason: 'Render- und Timeline-Plan fehlen.', findings: [{ issue: 'image-plan-missing' }], checkedImages: 0 };
  }

  const shots = collectPlannedShots(plan, timeline).filter((shot) => String(shot.imageFile ?? '').trim());
  if (!shots.length) {
    return { required, passed: false, reason: 'Kein prüfbarer Bildtext-Plan gefunden.', findings: [{ issue: 'image-text-plan-missing' }], checkedImages: 0 };
  }

  const absoluteFiles = shots.map((shot) => path.resolve(reelDirectory, shot.imageFile));
  const ocr = await recognizer(absoluteFiles);
  if (!ocr.available) {
    return {
      required,
      passed: false,
      reason: `Echter Bildtext konnte nicht geprüft werden: ${ocr.reason}`,
      findings: [{ issue: 'image-text-check-unavailable', detail: ocr.reason }],
      checkedImages: 0
    };
  }

  const findings = evaluateImageTextFindings(shots, ocr.byFile, reelDirectory);
  const fingerprints = [];
  for (const shot of shots) {
    const absolute = path.resolve(reelDirectory, shot.imageFile);
    if (await exists(absolute)) fingerprints.push({ imageFile: shot.imageFile, sha256: await sha256(absolute) });
  }

  const passed = findings.length === 0;
  const report = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    required,
    passed,
    checkedImages: shots.length,
    findings,
    imageFingerprints: fingerprints,
    engine: 'macos-vision-ocr',
    note: 'Dieser Report prüft die tatsächlich gelieferten Bilddateien, nicht nur Prompt oder Plan.'
  };
  const reportPath = path.join(reelDirectory, 'review', 'image-text-report.json');
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  return {
    ...report,
    reason: passed
      ? `Tatsächlicher Bildtext stimmt für ${shots.length} Bilder mit dem Plan überein.`
      : `${findings.length} Bildtext-Abweichung(en) gefunden.`
  };
}
