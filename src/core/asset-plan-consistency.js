/**
 * Gleicht die drei Stände ab, die ein Reel über seine Bilder führt:
 * das Manifest, die Timeline und die Dateien auf der Platte.
 *
 * Im Vetorecht-Reel liefen sie auseinander, ohne dass es auffiel:
 *   assets-manifest.json  24 Einträge, Quellen "Bild 22/23/24"
 *   scenes/ auf Platte    24 Dateien
 *   timeline-plan.json    21 Bildphasen
 * Ergebnis: drei importierte Bilder waren nie im Video, und in zwei Slots lief
 * ein Bild, das die spätere Nummerierung bewusst aussortiert hatte. Jede
 * Einzelprüfung meldete bestanden, weil keine die andere Liste kannte.
 */

import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

// Wie die übrigen Hard Gates greift auch dieser erst ab einem Stichtag. Sonst
// wären bereits veröffentlichte Reels rückwirkend nicht mehr renderbar, ohne
// dass das irgendjemandem hilft.
const ASSET_CONSISTENCY_GATE_SINCE = '2026-09-19';

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

function normalize(value) {
  return String(value ?? '').split(path.sep).join('/').replace(/^\.\//, '');
}

async function sceneImageFilesOnDisk(reelDirectory) {
  const scenesDirectory = path.join(reelDirectory, 'scenes');
  if (!(await exists(scenesDirectory))) return [];

  const files = [];
  for (const entry of await readdir(scenesDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const sceneDirectory = path.join(scenesDirectory, entry.name);
    for (const file of await readdir(sceneDirectory)) {
      if (IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase())) {
        files.push(`scenes/${entry.name}/${file}`);
      }
    }
  }
  return files.sort();
}

/**
 * @returns {Promise<{required: boolean, passed: boolean, reason: string, findings: object[]}>}
 */
export async function verifyAssetPlanConsistency(reelDirectory) {
  const reel = await readJson(path.join(reelDirectory, 'reel.json'), {});
  if (String(reel?.date ?? '') < ASSET_CONSISTENCY_GATE_SINCE) {
    return { required: false, passed: true, reason: 'Archiv-Reel vor dem verpflichtenden Bildstand-Abgleich.', findings: [] };
  }

  const timeline = await readJson(path.join(reelDirectory, 'timeline', 'timeline-plan.json'), null);
  if (!timeline) {
    return { required: false, passed: true, reason: 'Noch keine Timeline vorhanden; der Abgleich greift erst danach.', findings: [] };
  }

  const manifest = await readJson(path.join(reelDirectory, 'assets-manifest.json'), { visuals: [] });
  const findings = [];

  const timelinePhases = (timeline.scenes ?? []).flatMap((scene) => scene.imagePhases ?? []);
  const timelineFiles = new Map(timelinePhases.map((phase) => [normalize(phase.imageFile), phase.targetId ?? phase.phaseId]));
  const manifestVisuals = Array.isArray(manifest.visuals) ? manifest.visuals : [];
  const manifestByTarget = new Map(manifestVisuals.map((entry) => [String(entry.targetId), entry]));

  if (manifestVisuals.length !== timelinePhases.length) {
    findings.push({
      issue: 'manifest-phase-count-mismatch',
      manifestEntries: manifestVisuals.length,
      timelinePhases: timelinePhases.length,
      detail: `Das Manifest führt ${manifestVisuals.length} Bilder, die Timeline zeigt ${timelinePhases.length}. Nach einer Planänderung muss der Import neu laufen.`
    });
  }

  for (const phase of timelinePhases) {
    const targetId = String(phase.targetId ?? phase.phaseId ?? '');
    const timelineFile = normalize(phase.imageFile);
    const manifestEntry = manifestByTarget.get(targetId);

    if (!manifestEntry) {
      findings.push({ targetId, issue: 'manifest-entry-missing', detail: 'Die Timeline zeigt eine Bildphase, für die das Manifest keinen Eintrag führt.' });
      continue;
    }

    const manifestFile = normalize(manifestEntry.expectedFile);
    if (manifestFile && timelineFile && manifestFile !== timelineFile) {
      findings.push({ targetId, issue: 'manifest-timeline-file-mismatch', manifestFile, timelineFile, detail: 'Manifest und Timeline zeigen auf verschiedene Bilddateien.' });
    }

    if (!(await exists(path.join(reelDirectory, timelineFile)))) {
      findings.push({ targetId, issue: 'timeline-image-missing', timelineFile, detail: 'Die Timeline verweist auf eine Bilddatei, die es nicht gibt.' });
    }
  }

  // Eine im Manifest genannte Quelle, die es nicht mehr gibt, heißt: Der Import
  // lief gegen eine andere Lieferung als die, die jetzt im Ordner liegt.
  for (const entry of manifestVisuals) {
    const source = normalize(entry.source);
    if (!source) continue;
    const sourcePath = path.join(reelDirectory, 'inbox', source);
    if (!(await exists(sourcePath))) {
      findings.push({ targetId: String(entry.targetId ?? ''), issue: 'manifest-source-missing', source, detail: 'Die im Manifest festgehaltene Quelldatei existiert nicht mehr.' });
    }
  }

  for (const file of await sceneImageFilesOnDisk(reelDirectory)) {
    if (!timelineFiles.has(file)) {
      findings.push({ issue: 'orphan-scene-image', file, detail: 'Dieses importierte Bild taucht in keiner Bildphase der Timeline auf und landet nicht im Video.' });
    }
  }

  const passed = findings.length === 0;
  return {
    required: true,
    passed,
    reason: passed
      ? 'Manifest, Timeline und Bilddateien beschreiben dieselbe Bildfolge.'
      : `Manifest, Timeline und Bilddateien weichen an ${findings.length} Stellen voneinander ab.`,
    findings
  };
}
