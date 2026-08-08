import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

import { inspectSourcesMarkdown } from './source-quality.js';

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

export async function verifyRequiredSourceQuality(reelDirectory) {
  const reel = await readJson(path.join(reelDirectory, 'reel.json'), {});
  const reelRequiredSchemaVersion = Number(reel?.sourceQualitySchemaVersion ?? 1);
  const sourcesPath = path.join(reelDirectory, 'sources', 'sources.md');
  const sources = (await exists(sourcesPath)) ? await readFile(sourcesPath, 'utf8') : '';
  const inspection = inspectSourcesMarkdown(sources);
  const requiredSchemaVersion = Math.max(reelRequiredSchemaVersion, Number(inspection.schemaVersion ?? 1));

  if (requiredSchemaVersion < 2) {
    return {
      required: false,
      passed: true,
      legacy: true,
      requiredSchemaVersion,
      reelRequiredSchemaVersion,
      inspection
    };
  }

  const markerPresent = inspection.schemaVersion >= requiredSchemaVersion;
  const passed = markerPresent && inspection.passed === true;
  return {
    required: true,
    passed,
    legacy: false,
    requiredSchemaVersion,
    reelRequiredSchemaVersion,
    markerPresent,
    inspection,
    reason: passed
      ? null
      : !markerPresent
        ? `Das Reel verlangt Quellen-Schema ${requiredSchemaVersion}, aber der Schema-Marker in sources/sources.md fehlt oder wurde entfernt.`
        : 'Die verpflichtende Quellen-QC für dieses Reel ist nicht vollständig bestanden.'
  };
}
