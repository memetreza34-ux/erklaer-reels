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
    throw new Error(`Word-Sync-Audiopfad verlässt den Reel-Ordner oder fehlt: ${relativePath ?? '(leer)'}`);
  }
  return resolved;
}

async function fingerprintAudioReference(reelDirectory, audioFile) {
  const audioPath = resolveInside(reelDirectory, audioFile);
  if (!(await exists(audioPath))) throw new Error(`Word-Sync-Audiodatei fehlt: ${audioFile}`);
  return {
    audioFile,
    audioPath,
    audioFingerprintSha256: await sha256File(audioPath)
  };
}

async function fingerprintForWorkbench(reelDirectory, workbench) {
  if (!workbench?.audioFile) throw new Error('Im Word-Sync-Workbench fehlt audioFile.');
  return fingerprintAudioReference(reelDirectory, workbench.audioFile);
}

async function currentProductionAudioReference(reelDirectory, fallbackAudioFile) {
  const manifest = await readJson(path.join(reelDirectory, 'assets-manifest.json'), {});
  const expectedFile = manifest?.audio?.expectedFile;
  if (expectedFile) {
    const expectedPath = resolveInside(reelDirectory, expectedFile);
    if (await exists(expectedPath)) return expectedFile;
  }
  return fallbackAudioFile;
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

function resetReviewedWords(words) {
  return (words ?? []).map((word) => ({
    ...word,
    startSeconds: null,
    endSeconds: null,
    confidence: null,
    reviewed: false,
    note: word?.note ? `${word.note} | Audio geändert; Timing erneut prüfen.` : 'Audio geändert; Timing erneut prüfen.'
  }));
}

async function invalidateAppliedSync(reelDirectory, reason) {
  const reportPaths = [
    path.join(reelDirectory, 'review', 'word-sync-report.json'),
    path.join(reelDirectory, 'review', 'codex-word-sync-report.json')
  ];
  for (const reportPath of reportPaths) {
    const report = await readJson(reportPath, null);
    if (!report) continue;
    report.passed = false;
    report.stage = 'invalidated-audio-fingerprint-changed';
    report.audioBindingStatus = 'invalidated';
    report.invalidatedAt = new Date().toISOString();
    report.reason = reason;
    await writeJson(reportPath, report);
  }

  const subtitlePlanPath = path.join(reelDirectory, 'subtitles', 'subtitle-plan.json');
  const subtitlePlan = await readJson(subtitlePlanPath, null);
  if (subtitlePlan?.timingStatus === 'codex-word-synced') {
    subtitlePlan.timingStatus = 'invalidated-audio-fingerprint-changed';
    subtitlePlan.cues = (subtitlePlan.cues ?? []).map((cue) => ({
      ...cue,
      timingStatus: 'invalidated-audio-fingerprint-changed',
      timingSource: 'audio-changed-requires-codex-word-sync'
    }));
    await writeJson(subtitlePlanPath, subtitlePlan);
  }

  const statusPath = path.join(reelDirectory, 'status.json');
  const status = await readJson(statusPath, {});
  status.wordSync = 'needs-resync-after-audio-change';
  status.subtitles = 'waiting-for-exact-sync';
  status.timeline = 'needs-rebuild-after-word-sync-invalidation';
  status.render = 'waiting-for-timeline';
  await writeJson(statusPath, status);
}

export async function invalidateStaleWordSyncWorkbench(reelDirectory) {
  const workbenchPath = path.join(reelDirectory, 'subtitles', 'codex-word-sync.json');
  const workbench = await readJson(workbenchPath, null);
  if (!workbench || Number(workbench.version ?? 1) < 2 || !workbench.audioFingerprintSha256) {
    return { required: false, changed: false, legacy: Boolean(workbench) };
  }

  const currentAudioFile = await currentProductionAudioReference(reelDirectory, workbench.audioFile);
  const current = await fingerprintAudioReference(reelDirectory, currentAudioFile);
  const pathChanged = currentAudioFile !== workbench.audioFile;
  const fingerprintChanged = current.audioFingerprintSha256 !== workbench.audioFingerprintSha256;

  if (!fingerprintChanged) {
    if (pathChanged) {
      workbench.audioFile = currentAudioFile;
      workbench.updatedAt = new Date().toISOString();
      await writeJson(workbenchPath, workbench);
    }
    return {
      required: true,
      changed: false,
      pathUpdated: pathChanged,
      legacy: false,
      ...current
    };
  }

  const previousFingerprint = workbench.audioFingerprintSha256;
  const previousAudioFile = workbench.audioFile;
  workbench.status = 'invalidated-audio-changed';
  workbench.updatedAt = new Date().toISOString();
  workbench.words = resetReviewedWords(workbench.words);
  workbench.audioFile = currentAudioFile;
  workbench.audioFingerprintSha256 = current.audioFingerprintSha256;
  workbench.previousAudioFile = previousAudioFile;
  workbench.previousAudioFingerprintSha256 = previousFingerprint;
  await writeJson(workbenchPath, workbench);
  await invalidateAppliedSync(
    reelDirectory,
    'Die aktuelle Voice-over-Datei stimmt nicht mehr mit der Audio-Datei überein, für die die Wortzeiten bestätigt wurden.'
  );

  return {
    required: true,
    changed: true,
    legacy: false,
    pathChanged,
    fingerprintChanged: true,
    previousAudioFile,
    previousAudioFingerprintSha256: previousFingerprint,
    ...current
  };
}

export async function stampPreparedWordSyncAudioBinding(reelDirectory) {
  const workbenchPath = path.join(reelDirectory, 'subtitles', 'codex-word-sync.json');
  const workbench = await readJson(workbenchPath, null);
  if (!workbench) throw new Error('Word-Sync-Workbench fehlt nach der Vorbereitung.');

  const current = await fingerprintForWorkbench(reelDirectory, workbench);
  workbench.version = Math.max(2, Number(workbench.version ?? 1));
  workbench.audioFingerprintSha256 = current.audioFingerprintSha256;
  workbench.audioBindingStatus = 'fingerprinted-for-review';
  workbench.updatedAt = new Date().toISOString();
  await writeJson(workbenchPath, workbench);

  const reportPath = path.join(reelDirectory, 'review', 'word-sync-report.json');
  const report = await readJson(reportPath, null);
  if (report) {
    report.version = Math.max(3, Number(report.version ?? 1));
    report.audioFile = workbench.audioFile;
    report.audioFingerprintSha256 = current.audioFingerprintSha256;
    report.audioBindingStatus = 'fingerprinted-for-review';
    await writeJson(reportPath, report);
  }

  return { workbench, ...current };
}

export async function verifyPreparedWordSyncAudioBinding(reelDirectory) {
  const workbenchPath = path.join(reelDirectory, 'subtitles', 'codex-word-sync.json');
  const workbench = await readJson(workbenchPath, null);
  if (!workbench) throw new Error('subtitles/codex-word-sync.json fehlt. Führe sync:words zuerst ohne --apply aus.');

  if (Number(workbench.version ?? 1) < 2 || !workbench.audioFingerprintSha256) {
    return { required: false, passed: true, legacy: true, workbench };
  }

  const current = await fingerprintForWorkbench(reelDirectory, workbench);
  const passed = current.audioFingerprintSha256 === workbench.audioFingerprintSha256;
  return {
    required: true,
    passed,
    legacy: false,
    expectedAudioFingerprintSha256: workbench.audioFingerprintSha256,
    ...current,
    workbench
  };
}

export async function stampAppliedWordSyncAudioBinding(reelDirectory, expectedFingerprint) {
  const prepared = await verifyPreparedWordSyncAudioBinding(reelDirectory);
  const changedDuringApply = (prepared.required && !prepared.passed) ||
    (expectedFingerprint && prepared.audioFingerprintSha256 !== expectedFingerprint);
  if (changedDuringApply) {
    await invalidateAppliedSync(
      reelDirectory,
      'Die Voice-over-Datei wurde während der Word-Sync-Anwendung geändert; die gerade erzeugten Wortzeiten wurden deshalb nicht freigegeben.'
    );
    throw new Error('Die Voice-over-Datei wurde während der Word-Sync-Anwendung geändert. Wortzeiten werden nicht freigegeben.');
  }

  const fingerprint = prepared.audioFingerprintSha256 ?? expectedFingerprint ?? null;
  if (!fingerprint) return { required: false, passed: true, legacy: true };

  const reportPaths = [
    path.join(reelDirectory, 'review', 'word-sync-report.json'),
    path.join(reelDirectory, 'review', 'codex-word-sync-report.json')
  ];
  for (const reportPath of reportPaths) {
    const report = await readJson(reportPath, null);
    if (!report) continue;
    report.version = Math.max(4, Number(report.version ?? 1));
    report.audioFile = prepared.workbench.audioFile;
    report.audioFingerprintSha256 = fingerprint;
    report.audioBindingStatus = 'verified';
    await writeJson(reportPath, report);
  }

  const subtitlePlanPath = path.join(reelDirectory, 'subtitles', 'subtitle-plan.json');
  const subtitlePlan = await readJson(subtitlePlanPath, null);
  if (subtitlePlan) {
    subtitlePlan.audioFile = prepared.workbench.audioFile;
    subtitlePlan.audioFingerprintSha256 = fingerprint;
    subtitlePlan.audioBindingStatus = 'verified';
    await writeJson(subtitlePlanPath, subtitlePlan);
  }

  return {
    required: true,
    passed: true,
    legacy: false,
    audioFile: prepared.workbench.audioFile,
    audioFingerprintSha256: fingerprint
  };
}

export async function verifyAppliedWordSyncAudioBinding(reelDirectory) {
  const reportPath = path.join(reelDirectory, 'review', 'word-sync-report.json');
  const report = await readJson(reportPath, null);
  if (!report || Number(report.version ?? 1) < 4 || !report.audioFingerprintSha256) {
    return { required: false, passed: true, legacy: Boolean(report) };
  }

  const audioReferences = await declaredProductionAudioReferences(reelDirectory, report.audioFile);
  if (!audioReferences.length) {
    return {
      required: true,
      passed: false,
      legacy: false,
      reason: 'Es wurde keine aktuelle Produktions-Audiodatei gefunden.'
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
    audioFile: report.audioFile,
    expectedAudioFingerprintSha256: report.audioFingerprintSha256,
    checkedAudioFiles: checked,
    reason: passed
      ? null
      : `Die aktuelle Produktions-Audiodatei stimmt nicht mehr mit der bestätigten Word-Sync-Datei überein: ${mismatched.join(', ') || 'unbekannt'}.`
  };
}
