import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function readJson(filePath, fallback = null) {
  if (!(await exists(filePath))) return fallback;
  try { return JSON.parse(await readFile(filePath, 'utf8')); } catch { return fallback; }
}

function requiredChecksForEntry(rules, entry) {
  const checks = rules.manualChecksByKind?.[entry.kind];
  return Array.isArray(checks) ? checks : [];
}

function validIsoDate(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  return Number.isFinite(Date.parse(value));
}

export function evaluateSemanticReviewEntry(entry, rules) {
  const semantic = rules.semanticReview ?? {};
  const findings = [];
  const requiredChecks = requiredChecksForEntry(rules, entry);

  if (semantic.requirePassedStatus === true && entry?.status !== 'passed') {
    findings.push({ assetId: entry?.assetId, issue: 'semantic-review-not-passed', detail: `Status ist ${entry?.status ?? 'missing'} statt passed.` });
  }
  if (semantic.requireReviewer === true && !String(entry?.reviewer ?? '').trim()) {
    findings.push({ assetId: entry?.assetId, issue: 'semantic-reviewer-missing' });
  }
  if (semantic.requireReviewedAt === true && !validIsoDate(entry?.reviewedAt)) {
    findings.push({ assetId: entry?.assetId, issue: 'semantic-reviewed-at-missing-or-invalid' });
  }
  if (semantic.fingerprintBound === true && !String(entry?.reviewFingerprint ?? '').trim()) {
    findings.push({ assetId: entry?.assetId, issue: 'semantic-review-fingerprint-missing' });
  }

  if (semantic.requireAllChecksTrue === true) {
    for (const check of requiredChecks) {
      if (entry?.checks?.[check] !== true) {
        findings.push({ assetId: entry?.assetId, issue: 'semantic-check-not-confirmed', check });
      }
    }
  }
  return findings;
}

export async function verifySemanticVisualReview(reelDirectory) {
  const rules = await readJson(path.resolve('config', 'visual-quality-rules.json'), {});
  const semantic = rules.semanticReview ?? {};
  const gateSince = String(semantic.hardGateSince ?? '');
  const reel = await readJson(path.join(reelDirectory, 'reel.json'), {});
  const required = Boolean(gateSince) && String(reel?.date ?? '') >= gateSince;

  if (!required) {
    return { required: false, passed: true, reason: 'Reel liegt vor dem verpflichtenden semantischen Sicht-Gate.', findings: [], checkedAssets: 0 };
  }

  const inspection = await readJson(path.join(reelDirectory, 'review', 'visual-inspection.json'), null);
  if (!inspection || !Array.isArray(inspection.assets) || inspection.assets.length === 0) {
    return {
      required,
      passed: false,
      reason: 'Fingerprint-gebundene visuelle Sichtprüfung fehlt.',
      findings: [{ issue: 'semantic-review-file-missing' }],
      checkedAssets: 0
    };
  }

  const findings = [];
  for (const entry of inspection.assets) findings.push(...evaluateSemanticReviewEntry(entry, rules));
  const passed = findings.length === 0;
  return {
    required,
    passed,
    reason: passed
      ? `${inspection.assets.length} aktuelle Bilddateien wurden semantisch gegen Narration, Reihenfolge und Bildwelt bestätigt.`
      : `${findings.length} fehlende oder nicht bestätigte semantische Prüfpunkte.`,
    findings,
    checkedAssets: inspection.assets.length,
    mode: 'single-visual-pass-fingerprint-bound'
  };
}
