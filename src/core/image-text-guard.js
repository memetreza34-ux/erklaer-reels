/**
 * Harter Gate direkt vor dem Render: Steht der geplante deutsche Bildtext
 * wirklich im gelieferten Bild?
 *
 * Die visuelle QC prüft das bereits, aber ihr Ergebnis fließt über den
 * Final-Readiness-Report, und der lässt sich mit --force übergehen. Genau so
 * ist das Vetorecht-Cover ins fertige Video gekommen: Plan und Prompt sagten
 * "WAS IST EIN VETORECHT?", im Bild stand "ENTSCHEIDET DIE MEHRHEIT?".
 * Ein falscher Titel ist kein Timing-Detail, über das man hinwegrendern darf.
 */

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

import { normalizeImageText, readImageTexts } from './image-text-ocr.js';

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath, fallback = null) {
  if (!(await exists(filePath))) return fallback;
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

/**
 * @returns {Promise<{required: boolean, passed: boolean, reason: string, findings: object[], checkedImages: number}>}
 */
export async function verifyRenderedImageText(reelDirectory) {
  const rules = await readJson(path.resolve('config', 'visual-quality-rules.json'), {});
  const textRules = rules.renderedImageText ?? {};
  const gateSince = String(textRules.hardGateSince ?? '');

  const reel = await readJson(path.join(reelDirectory, 'reel.json'), {});
  const required = textRules.verifyPlannedTextIsVisible === true
    && Boolean(gateSince)
    && String(reel?.date ?? '') >= gateSince;

  if (!required) {
    return { required: false, passed: true, reason: 'Archiv-Reel vor der verpflichtenden Bildtext-Prüfung.', findings: [], checkedImages: 0 };
  }

  const plan = await readJson(path.join(reelDirectory, 'render', 'render-plan.json'), null);
  if (!plan) {
    return { required, passed: false, reason: 'render/render-plan.json fehlt.', findings: [{ issue: 'render-plan-missing' }], checkedImages: 0 };
  }

  const shots = (plan.scenes ?? []).filter((shot) => String(shot.imageText ?? '').trim());
  if (shots.length === 0) {
    // Der Render-Plan trägt den Bildtext nicht selbst; dann bleibt die Timeline maßgeblich.
    const timeline = await readJson(path.join(reelDirectory, 'timeline', 'timeline-plan.json'), null);
    for (const scene of timeline?.scenes ?? []) {
      for (const phase of scene.imagePhases ?? []) {
        if (String(phase.imageText ?? '').trim()) {
          shots.push({ sceneId: phase.targetId, imageFile: phase.imageFile, imageText: phase.imageText });
        }
      }
    }
  }

  if (shots.length === 0) {
    return { required, passed: true, reason: 'Für dieses Reel ist kein sichtbarer Bildtext geplant.', findings: [], checkedImages: 0 };
  }

  const ocr = await readImageTexts(shots.map((shot) => path.resolve(reelDirectory, shot.imageFile)));
  if (!ocr.available) {
    return {
      required,
      passed: false,
      reason: `Der sichtbare Bildtext konnte nicht geprüft werden: ${ocr.reason}`,
      findings: [{ issue: 'image-text-check-unavailable', detail: ocr.reason }],
      checkedImages: 0
    };
  }

  const findings = [];
  for (const shot of shots) {
    const recognized = ocr.byFile.get(path.resolve(reelDirectory, shot.imageFile));
    const planned = normalizeImageText(shot.imageText);
    if (!recognized || !recognized.text.includes(planned)) {
      findings.push({
        sceneId: shot.sceneId,
        issue: 'planned-image-text-missing',
        planned: shot.imageText,
        seen: recognized?.lines?.join(' / ') || '(kein Text erkannt)',
        detail: `${shot.sceneId}: geplant "${shot.imageText}", im Bild "${recognized?.lines?.join(' / ') || 'kein Text'}"`
      });
    }
  }

  const passed = findings.length === 0;
  return {
    required,
    passed,
    reason: passed
      ? `Jeder geplante Bildtext ist im gelieferten Bild nachgewiesen (${shots.length} Bilder).`
      : `${findings.length} von ${shots.length} Bildern zeigen nicht den geplanten deutschen Text.`,
    findings,
    checkedImages: shots.length
  };
}
