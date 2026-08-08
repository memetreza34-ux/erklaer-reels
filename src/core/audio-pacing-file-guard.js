import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { sha256File } from './file-fingerprint.js';

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
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function resolveInside(root, relativePath) {
  const rootPath = path.resolve(root);
  const resolved = path.resolve(rootPath, String(relativePath ?? ''));
  const relative = path.relative(rootPath, resolved);
  if (!relativePath || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Audio-Pacing-Pfad verlässt den Reel-Ordner oder fehlt: ${relativePath ?? '(leer)'}`);
  }
  return resolved;
}

async function fingerprintAudioReference(reelDirectory, audioFile) {
  const audioPath = resolveInside(reelDirectory, audioFile);
  if (!(await exists(audioPath))) throw new Error(`Audio-Pacing-Datei fehlt: ${audioFile}`);
  return {
    audioFile,
    audioPath,
    audioFingerprintSha256: await sha256File(audioPath)
  };
}

async function declaredProductionAudioReferences(reelDirectory, fallbackAudioFile) {
  const manifest = await readJson(path.join(reelDirectory, 'assets-manifest.json'), {});
  const renderPlan = await readJson(path.join(reelDirectory, 'render', 'render-plan.json'), {});
  return [...new Set([
    fallbackAudioFile,
    manifest?.audio?.expectedFile,
    renderPlan?.voiceover?.file
  ].filter(Boolean))];
}

export async function stampAudioPacingFileBinding(reelDirectory) {
  const reportPath = path.join(reelDirectory, 'review', 'audio-pacing-report.json');
  const report = await readJson(reportPath, null);
  if (!report) throw new Error('review/audio-pacing-report.json fehlt nach der Audio-Verarbeitung.');
  if (!report.outputFile) throw new Error('Im Audio-Pacing-Report fehlt outputFile.');

  const current = await fingerprintAudioReference(reelDirectory, report.outputFile);
  report.version = Math.max(6, Number(report.version ?? 1));
  report.audioFingerprintSha256 = current.audioFingerprintSha256;
  report.audioBindingStatus = 'verified-after-measurement';
  report.measuredFile = report.outputFile;
  await writeJson(reportPath, report);

  const manifestPath = path.join(reelDirectory, 'assets-manifest.json');
  const manifest = await readJson(manifestPath, {});
  manifest.audio = {
    ...(manifest.audio ?? {}),
    audioFingerprintSha256: current.audioFingerprintSha256,
    audioBindingStatus: 'verified-after-measurement'
  };
  await writeJson(manifestPath, manifest);

  return { report, ...current };
}

export async function verifyAudioPacingFileBinding(reelDirectory) {
  const reportPath = path.join(reelDirectory, 'review', 'audio-pacing-report.json');
  const report = await readJson(reportPath, null);
  if (!report || Number(report.version ?? 1) < 6 || !report.audioFingerprintSha256) {
    return { required: false, passed: true, legacy: Boolean(report) };
  }

  const audioReferences = await declaredProductionAudioReferences(reelDirectory, report.outputFile);
  if (!audioReferences.length) {
    return {
      required: true,
      passed: false,
      legacy: false,
      reason: 'Es wurde keine aktuelle Produktions-Audiodatei für die Audio-Pacing-Prüfung gefunden.'
    };
  }

  const checked = [];
  for (const audioFile of audioReferences) {
    let current;
    try {
      current = await fingerprintAudioReference(reelDirectory, audioFile);
    } catch (error) {
      checked.push({ audioFile, passed: false, error: error.message });
      continue;
    }
    checked.push({
      audioFile,
      audioFingerprintSha256: current.audioFingerprintSha256,
      passed: current.audioFingerprintSha256 === report.audioFingerprintSha256
    });
  }

  const passed = checked.length > 0 && checked.every((entry) => entry.passed);
  const mismatched = checked.filter((entry) => !entry.passed).map((entry) => entry.audioFile);
  return {
    required: true,
    passed,
    legacy: false,
    measuredFile: report.measuredFile ?? report.outputFile,
    expectedAudioFingerprintSha256: report.audioFingerprintSha256,
    checkedAudioFiles: checked,
    reason: passed
      ? null
      : `Die aktuelle Produktions-Audiodatei stimmt nicht mehr mit der Datei überein, deren Lautheit gemessen wurde: ${mismatched.join(', ') || 'unbekannt'}.`
  };
}
