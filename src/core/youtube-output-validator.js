import { access, readFile, stat, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function readJson(filePath, fallback = null) {
  try { return JSON.parse(await readFile(filePath, 'utf8')); } catch { return fallback; }
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function check(id, passed, message) {
  return { id, passed: Boolean(passed), message, level: 'error' };
}

function resolveInside(root, filePath) {
  const absoluteRoot = path.resolve(root);
  const resolved = path.resolve(absoluteRoot, filePath);
  const relative = path.relative(absoluteRoot, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Ausgabepfad verlässt das YouTube-Projekt: ${filePath}`);
  return resolved;
}

export function validateYoutubeProbeMetadata(metadata, expectedDurationSeconds) {
  const streams = Array.isArray(metadata?.streams) ? metadata.streams : [];
  const video = streams.find((stream) => stream.codec_type === 'video');
  const audio = streams.find((stream) => stream.codec_type === 'audio');
  const duration = Number(metadata?.format?.duration);
  return [
    check('video-stream', Boolean(video), 'Die MP4 enthält keinen Videostream.'),
    check('audio-stream', Boolean(audio), 'Die MP4 enthält keinen Audiostream.'),
    check('width', Number(video?.width) === 1920, 'Die finale MP4 ist nicht 1920 Pixel breit.'),
    check('height', Number(video?.height) === 1080, 'Die finale MP4 ist nicht 1080 Pixel hoch.'),
    check('duration', Number.isFinite(duration) && Math.abs(duration - expectedDurationSeconds) <= 0.75,
      'Die MP4-Dauer weicht vom Renderplan ab.')
  ];
}

async function probe(filePath) {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error',
    '-show_streams',
    '-show_format',
    '-of', 'json',
    filePath
  ]);
  return JSON.parse(stdout);
}

export async function validateYoutubeOutput(projectDirectory) {
  const root = path.resolve(projectDirectory);
  const renderReport = await readJson(path.join(root, '08-edit', 'render-execution-report.json'), null);
  const readiness = await readJson(path.join(root, '08-edit', 'final-readiness.json'), {});
  const plan = await readJson(path.join(root, '08-edit', 'render-plan.json'), {});
  const checks = [
    check('render-report', renderReport?.passed === true, 'Erfolgreicher Renderbericht fehlt.'),
    check('final-video-qc', readiness.finalVideoQcPassed === true, 'Antigravity hat die vollständige MP4 noch nicht visuell und akustisch freigegeben.'),
    check('subtitle-absence', readiness.subtitleAbsencePassed === true, 'Untertitelfreiheit ist nicht bestätigt.')
  ];

  let outputFile = null;
  if (renderReport?.outputFile) {
    try {
      outputFile = resolveInside(root, renderReport.outputFile);
      checks.push(check('output-present', await exists(outputFile), 'Gerenderte MP4 wurde nicht gefunden.'));
      if (await exists(outputFile)) {
        const fileStats = await stat(outputFile);
        checks.push(check('output-nonempty', fileStats.size > 100_000, 'Gerenderte MP4 ist ungewöhnlich klein oder leer.'));
        const metadata = await probe(outputFile);
        const composition = plan.composition ?? {};
        const expectedDuration = Number(composition.durationFrames) / Number(composition.fps);
        checks.push(...validateYoutubeProbeMetadata(metadata, expectedDuration));
      }
    } catch (error) {
      checks.push(check('output-safe-and-readable', false, error.message));
    }
  } else {
    checks.push(check('output-file', false, 'Im Renderbericht fehlt outputFile.'));
  }

  const passed = checks.every((entry) => entry.passed);
  const report = {
    schemaVersion: 1,
    passed,
    checkedAt: new Date().toISOString(),
    outputFile,
    checks
  };
  await writeJson(path.join(root, '08-edit', 'final-output-report.json'), report);
  if (passed) {
    const statusPath = path.join(root, 'status.json');
    const status = await readJson(statusPath, {});
    status.phase = 'complete';
    status.render = 'complete';
    status.finalVideoQc = 'passed';
    status.completedAt = report.checkedAt;
    await writeJson(statusPath, status);
  }
  return report;
}
