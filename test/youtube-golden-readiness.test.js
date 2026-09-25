import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { checkWhisperAvailability } from '../src/cli/preflight-youtube.js';
import { parseYoutubeLoudnessMeasurement } from '../src/core/youtube-audio-optimizer.js';
import { parseUploadMarkdown } from '../src/cli/finalize-youtube-export.js';

const KALININGRAD_UPLOAD = 'youtube/2026-KW39_21-09_bis_27-09/warum-ist-kaliningrad-von-russland-getrennt/03-export/UPLOAD.md';

test('YouTube-Lautheitsmessung akzeptiert Zielwerte und blockiert schlechte Messwerte', () => {
  const good = parseYoutubeLoudnessMeasurement(`{
    "input_i": "-16.20",
    "input_tp": "-1.60"
  }`);
  const bad = parseYoutubeLoudnessMeasurement(`{
    "input_i": "-13.20",
    "input_tp": "-0.50"
  }`);

  assert.equal(good.measured, true);
  assert.equal(good.passed, true);
  assert.equal(good.integratedLufs, -16.2);
  assert.equal(good.truePeakDbtp, -1.6);
  assert.equal(bad.measured, true);
  assert.equal(bad.passed, false);
});

test('YouTube-Preflight erkennt Whisper auch über python3 -m whisper', () => {
  const fakeSpawn = (command) => ({ status: command === 'python3' ? 0 : 1, error: null });
  const result = checkWhisperAvailability(fakeSpawn);

  assert.equal(result.passed, true);
  assert.equal(result.command, 'python3 -m whisper');
});

test('YouTube-Preflight blockiert wenn keine Whisper-Variante verfügbar ist', () => {
  const result = checkWhisperAvailability(() => ({ status: 1, error: null }));
  assert.equal(result.passed, false);
  assert.equal(result.command, null);
});

test('neue YouTube-Medienpfade werden nicht versehentlich versioniert', async () => {
  const gitignore = await readFile('.gitignore', 'utf8');

  assert.match(gitignore, /youtube\/\*\*\/00-bildprompts\/images\/\*\.png/);
  assert.match(gitignore, /youtube\/\*\*\/02-audio\/\*\.wav/);
  assert.match(gitignore, /youtube\/\*\*\/03-export\/\*\.mp4/);
  assert.match(gitignore, /youtube\/\*\*\/03-export\/THUMBNAIL\.png/);
  assert.match(gitignore, /youtube\/\*\*\/99-technik\/\*\.wav/);
});

test('Kaliningrad-Golden-Test besitzt Finalizer-kompatible Upload-Metadaten', async () => {
  const upload = parseUploadMarkdown(await readFile(KALININGRAD_UPLOAD, 'utf8'));

  assert.match(upload.title, /Kaliningrad/);
  assert.match(upload.description, /Polen und Litauen/);
  assert.match(upload.tags, /Geopolitik/);
});
