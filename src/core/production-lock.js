import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRepositoryRoot = path.resolve(currentDirectory, '..', '..');

function isSafeRelativePath(value) {
  if (!value || path.isAbsolute(value)) return false;
  const normalized = path.normalize(value);
  return normalized !== '..' && !normalized.startsWith(`..${path.sep}`);
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export async function verifyProductionLock({
  repositoryRoot = defaultRepositoryRoot,
  manifestPath = path.join(repositoryRoot, 'config', 'locked-production-baseline.json')
} = {}) {
  const root = await realpath(repositoryRoot);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const entries = Array.isArray(manifest.files) ? manifest.files : [];
  const checks = [];

  for (const entry of entries) {
    const relativePath = String(entry?.path ?? '');
    if (!isSafeRelativePath(relativePath)) {
      checks.push({ path: relativePath, passed: false, reason: 'unsafe-path' });
      continue;
    }

    const absolutePath = path.resolve(root, relativePath);
    try {
      const resolvedPath = await realpath(absolutePath);
      const insideRoot = resolvedPath === root || resolvedPath.startsWith(`${root}${path.sep}`);
      if (!insideRoot) {
        checks.push({ path: relativePath, passed: false, reason: 'outside-repository' });
        continue;
      }
      const actual = sha256(await readFile(resolvedPath));
      checks.push({
        path: relativePath,
        passed: actual === entry.sha256,
        reason: actual === entry.sha256 ? 'match' : 'hash-mismatch',
        expected: entry.sha256,
        actual
      });
    } catch (error) {
      checks.push({ path: relativePath, passed: false, reason: 'missing-or-unreadable', error: error.message });
    }
  }

  const requiredEntryCount = Number(manifest.requiredEntryCount);
  const manifestComplete = Number.isInteger(requiredEntryCount) && requiredEntryCount > 0 && entries.length === requiredEntryCount;
  return {
    schemaVersion: manifest.schemaVersion,
    manifestPath,
    manifestComplete,
    checks,
    passed: manifestComplete && checks.length === requiredEntryCount && checks.every((check) => check.passed)
  };
}
