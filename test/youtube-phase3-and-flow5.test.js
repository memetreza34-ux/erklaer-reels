import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { computeEffectiveAudioEnd, findAnchorInWords } from '../src/core/youtube-audio-alignment.js';
import { motionForComplexity } from '../src/core/youtube-remotion-renderer.js';

const ROM_PROJECT = 'youtube/2026-KW39_21-09_bis_27-09/warum-ging-das-roemische-reich-unter';
const TEMPLATE = 'youtube/templates/video-template';

test('YouTube-Anchor wird monoton an echten Wortzeiten gefunden', () => {
  const words = [
    { word: 'Hallo', start: 0.1, end: 0.3 },
    { word: 'Welt', start: 0.31, end: 0.5 },
    { word: 'Doch', start: 1.2, end: 1.4 },
    { word: 'je', start: 1.41, end: 1.5 },
    { word: 'komplexer', start: 1.51, end: 1.9 },
    { word: 'Gesellschaften', start: 1.91, end: 2.4 }
  ];
  const hit = findAnchorInWords('Doch je komplexer Gesellschaften', words, 2);
  assert.equal(hit.wordIndex, 2);
  assert.equal(hit.startSeconds, 1.2);
  assert.equal(hit.confidence, 1);
  assert.equal(findAnchorInWords('Doch je komplexer Gesellschaften', words, 3), null);
});

test('YouTube-Endstille wird nur im internen Master gekürzt', () => {
  const words = [
    { word: 'Letztes', start: 8.4, end: 8.8 },
    { word: 'Wort', start: 8.81, end: 9.0 }
  ];
  const trimmed = computeEffectiveAudioEnd(12, words, {
    maxTrailingSilenceSeconds: 0.35,
    preserveAfterLastWordSeconds: 0.2
  });
  assert.equal(trimmed.trimmed, true);
  assert.equal(trimmed.trailingSilenceSeconds, 3);
  assert.equal(trimmed.effectiveDurationSeconds, 9.2);
  assert.equal(trimmed.trimmedSeconds, 2.8);

  const untouched = computeEffectiveAudioEnd(9.2, words, {
    maxTrailingSilenceSeconds: 0.35,
    preserveAfterLastWordSeconds: 0.2
  });
  assert.equal(untouched.trimmed, false);
  assert.equal(untouched.effectiveDurationSeconds, 9.2);
});

test('A-E-Komplexität erzeugt unterschiedliche YouTube-Motion', () => {
  const simple = motionForComplexity('A', 0);
  const complex = motionForComplexity('D', 0);
  const overview = motionForComplexity('E', 0);
  assert.notDeepEqual(simple, complex);
  assert.notEqual(complex.type, overview.type);
  assert.ok(Math.abs(overview.scaleTo - overview.scaleFrom) < Math.abs(complex.scaleTo - complex.scaleFrom));
});

test('YouTube-Dokumentation erzwingt 5er-Wellen statt Massen-Parallelgenerierung', async () => {
  const [readme, workflow, pacing] = await Promise.all([
    readFile('youtube/README.md', 'utf8'),
    readFile('youtube/YOUTUBE_WORKFLOW.md', 'utf8'),
    readFile('youtube/ADAPTIVE_PACING_V2.md', 'utf8')
  ]);
  for (const text of [readme, workflow, pacing]) {
    assert.match(text, /5 Bilder gleichzeitig|5er-Wellen|5er-Steuerung|höchstens 5 aktive|mehr als fünf aktive/i);
  }
  assert.doesNotMatch(readme, /immer nur \*\*eine aktive Bildgenerierung\*\*/i);
});

test('Neue YouTube-Struktur zeigt nur einen Masterprompt und ein Gesamtskript', async () => {
  const promptEntries = (await readdir(`${ROM_PROJECT}/00-bildprompts`, { withFileTypes: true }))
    .map((entry) => entry.name)
    .sort();
  const scriptEntries = (await readdir(`${ROM_PROJECT}/01-voice-script`, { withFileTypes: true }))
    .map((entry) => entry.name)
    .sort();

  assert.deepEqual(promptEntries, ['google-flow-prompt.txt']);
  assert.deepEqual(scriptEntries, ['voice-script.txt']);

  const masterPrompt = await readFile(`${ROM_PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8');
  assert.match(masterPrompt, /Bild 01–05 gleichzeitig/i);
  assert.match(masterPrompt, /BILD 36–38/i);
  assert.match(masterPrompt, /00-bildprompts\/images/);
});

test('YouTube-Template kann nicht auf alte 10er-Part-Struktur zurückfallen', async () => {
  const promptEntries = (await readdir(`${TEMPLATE}/00-bildprompts`, { withFileTypes: true })).map((entry) => entry.name).sort();
  assert.ok(promptEntries.includes('google-flow-prompt.txt'));
  assert.ok(promptEntries.includes('README.md'));
  assert.ok(!promptEntries.includes('99-alle-bildprompts.txt'));
  assert.ok(!promptEntries.includes('00_thumbnail'));

  const [promptReadme, scriptReadme, audioReadme, productionPlan] = await Promise.all([
    readFile(`${TEMPLATE}/00-bildprompts/README.md`, 'utf8'),
    readFile(`${TEMPLATE}/01-voice-script/README.md`, 'utf8'),
    readFile(`${TEMPLATE}/02-audio/README.md`, 'utf8'),
    readFile(`${TEMPLATE}/99-technik/PRODUKTIONSPLAN.md`, 'utf8')
  ]);
  assert.match(promptReadme, /maximal fünf aktive/i);
  assert.match(scriptReadme, /genau ein vollständiges Skript/i);
  assert.match(audioReadme, /eine einzige finale Voice-over-Datei/i);
  for (const text of [promptReadme, scriptReadme, audioReadme, productionPlan]) {
    assert.doesNotMatch(text, /01_part-bilder|02_part-bilder|10er-Bildpaket|10er-Pakete sind/i);
  }
});

test('Rom-Mapping ist bereits vor Phase 2 single-audio und flat-image sauber', async () => {
  const mapping = JSON.parse(await readFile(`${ROM_PROJECT}/99-technik/BILD_AUDIO_ZUORDNUNG.json`, 'utf8'));
  assert.equal(mapping.schemaVersion, 3);
  assert.equal(mapping.userFacingAudioMode, 'single-final-voiceover');
  assert.equal(mapping.images.length, 38);
  for (const image of mapping.images) {
    assert.equal(image.batchFolder, 'images');
    assert.ok(!('audioPartId' in image));
    assert.ok(!('scriptPartFile' in image));
    assert.ok(!('audioPartFile' in image));
    assert.match(image.complexityLevel, /^[A-E]$/);
  }
});

test('Neue V2-Regeln verlangen keine sichtbaren Script- oder Audio-Parts', async () => {
  const [readme, workflow, pacing] = await Promise.all([
    readFile('youtube/README.md', 'utf8'),
    readFile('youtube/YOUTUBE_WORKFLOW.md', 'utf8'),
    readFile('youtube/ADAPTIVE_PACING_V2.md', 'utf8')
  ]);

  assert.match(readme, /EIN (?:Google-Flow-)?Masterprompt/i);
  assert.match(readme, /EIN Gesamtskript/i);
  assert.match(workflow, /eine einzige finale Voice-over-Datei/i);
  assert.match(pacing, /keine sichtbaren Script- oder Audio-Parts/i);
});

test('Single-Audio-CLI ist syntaktisch gültig und normalisiert auf flache Bilder', async () => {
  const source = await readFile('src/cli/auto-align-youtube.js', 'utf8');
  assert.match(source, /single-final-voiceover/);
  assert.match(source, /batchFolder: 'images'/);
  assert.match(source, /01-voice-script\/voice-script\.txt/);

  const check = spawnSync(process.execPath, ['--check', 'src/cli/auto-align-youtube.js'], { encoding: 'utf8' });
  assert.equal(check.status, 0, check.stderr || check.stdout);
});

test('YouTube-Export und Renderplan sind Teil der echten Phase-3-Pipeline', async () => {
  const [phase3, renderer, composition, finalizer, packageJson] = await Promise.all([
    readFile('src/cli/phase3-youtube.js', 'utf8'),
    readFile('src/core/youtube-remotion-renderer.js', 'utf8'),
    readFile('src/youtube-renderer/YouTubeComposition.jsx', 'utf8'),
    readFile('src/cli/finalize-youtube-export.js', 'utf8'),
    readFile('package.json', 'utf8')
  ]);
  assert.match(phase3, /finalize-youtube-export\.js/);
  assert.match(renderer, /YOUTUBE_RENDER_PLAN\.json/);
  assert.match(renderer, /loadSoundLibrary/);
  assert.match(composition, /plan\.sounds/);
  assert.match(finalizer, /THUMBNAIL\.png/);
  assert.match(finalizer, /YOUTUBE-KAPITEL\.txt/);
  assert.match(packageJson, /finalize:youtube-export/);
});

test('Neue YouTube-Kernskripte sind syntaktisch gültig', async () => {
  for (const file of [
    'src/core/youtube-audio-alignment.js',
    'src/core/youtube-remotion-renderer.js',
    'src/cli/validate-youtube-adaptive-pacing.js',
    'src/cli/validate-youtube-phase3.js',
    'src/cli/finalize-youtube-export.js',
    'src/cli/phase3-youtube.js'
  ]) {
    const check = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    assert.equal(check.status, 0, `${file}: ${check.stderr || check.stdout}`);
  }
});
