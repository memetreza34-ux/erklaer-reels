import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { compactReelLayout } from '../src/core/compact-reel-layout.js';
import {
  assertUserAssetSourceAllowed,
  classifyUserAssetSource,
  copyUserAssetSafely
} from '../src/core/user-asset-safety.js';

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function reelPath(root, reelName) {
  return path.join(root, 'reels', '2026-KW36_31-08_bis_06-09', 'montag', reelName);
}

test('blockiert Nutzerassets aus einem anderen Reel', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'user-asset-safety-'));
  const targetReel = reelPath(root, 'reel-01_regen');
  const otherReel = reelPath(root, 'reel-02_alt');
  const source = path.join(otherReel, 'inbox', 'numbered-images', 'download.zip');

  await mkdir(path.dirname(source), { recursive: true });
  await writeFile(source, 'zip-original');
  await mkdir(targetReel, { recursive: true });

  const classification = classifyUserAssetSource(targetReel, source);
  assert.equal(classification.allowed, false);
  assert.equal(classification.reason, 'cross-reel-source-forbidden');
  assert.throws(() => assertUserAssetSourceAllowed(targetReel, source), /anderen Reel/);
});

test('sicherer Import kopiert und lässt das Original unverändert', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'user-asset-copy-'));
  const targetReel = reelPath(root, 'reel-01_regen');
  const downloads = path.join(root, 'Downloads');
  const source = path.join(downloads, 'voice.mp4');
  const targetDirectory = path.join(targetReel, '99-technik', 'inbox', 'audio');

  await mkdir(downloads, { recursive: true });
  await writeFile(source, 'original-audio');

  const result = await copyUserAssetSafely({
    targetReelDirectory: targetReel,
    sourcePath: source,
    targetDirectory
  });

  assert.equal(result.sourcePreserved, true);
  assert.equal(await readFile(source, 'utf8'), 'original-audio');
  assert.equal(await readFile(result.destination, 'utf8'), 'original-audio');
});

test('sicherer Import überschreibt niemals eine vorhandene Nutzerdatei', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'user-asset-no-overwrite-'));
  const targetReel = reelPath(root, 'reel-01_regen');
  const downloads = path.join(root, 'Downloads');
  const source = path.join(downloads, 'download.zip');
  const targetDirectory = path.join(targetReel, '99-technik', 'inbox', 'numbered-images');
  const destination = path.join(targetDirectory, 'download.zip');

  await mkdir(downloads, { recursive: true });
  await mkdir(targetDirectory, { recursive: true });
  await writeFile(source, 'new');
  await writeFile(destination, 'existing');

  await assert.rejects(
    copyUserAssetSafely({ targetReelDirectory: targetReel, sourcePath: source, targetDirectory }),
    { code: 'EEXIST' }
  );
  assert.equal(await readFile(destination, 'utf8'), 'existing');
  assert.equal(await readFile(source, 'utf8'), 'new');
});

test('kompakte Aufräumlogik löscht echte alte Technikordner mit Inhalt nicht rekursiv', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'user-asset-compact-'));
  const reelDirectory = reelPath(root, 'reel-01_regen');

  await mkdir(path.join(reelDirectory, '99-technik', 'INBOX'), { recursive: true });
  await writeFile(path.join(reelDirectory, '99-technik', 'INBOX', 'user-original.zip'), 'keep-me');

  for (const directory of ['00-bildprompts', '01-voice-script', '02-audio', '03-export', 'inbox', 'scenes', 'script']) {
    await mkdir(path.join(reelDirectory, directory), { recursive: true });
  }
  await mkdir(path.join(reelDirectory, 'inbox', 'audio'), { recursive: true });
  await mkdir(path.join(reelDirectory, 'inbox', 'numbered-images'), { recursive: true });
  await writeFile(path.join(reelDirectory, 'reel.json'), '{"reelId":"safe"}\n');
  await writeFile(path.join(reelDirectory, 'status.json'), '{}\n');
  await writeFile(path.join(reelDirectory, 'assets-manifest.json'), '{}\n');
  await writeFile(path.join(reelDirectory, 'script', 'voice-script.txt'), 'Test\n');

  const result = await compactReelLayout(reelDirectory);

  assert.ok(result.preservedPhysicalAliases.includes('INBOX'));
  assert.equal(
    await readFile(path.join(reelDirectory, '99-technik', 'INBOX', 'user-original.zip'), 'utf8'),
    'keep-me'
  );
  assert.equal(await exists(path.join(reelDirectory, '99-technik', 'reel.json')), true);
});

test('Agentenregeln verbieten exakt die Befehle, die Nutzerassets gefährden', async () => {
  const [agents, workflow, packageJson] = await Promise.all([
    readFile('AGENTS.md', 'utf8'),
    readFile('CURRENT_WORKFLOW.md', 'utf8'),
    readFile('package.json', 'utf8')
  ]);

  for (const document of [agents, workflow]) {
    assert.match(document, /anderen Reel/);
    assert.match(document, /\bmv\b/);
    assert.match(document, /rm -rf/);
    assert.match(document, /git checkout/);
    assert.match(document, /import:user-asset/);
  }

  assert.equal(JSON.parse(packageJson).scripts['import:user-asset'], 'node src/cli/import-user-asset.js');
});
