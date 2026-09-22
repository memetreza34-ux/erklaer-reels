import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { findAnchorInWords } from '../src/core/youtube-audio-alignment.js';

const ROM_PROJECT = 'youtube/2026-KW39_21-09_bis_27-09/warum-ging-das-roemische-reich-unter';

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
  assert.match(masterPrompt, /Bild 01–05 gleichzeitig/);
  assert.match(masterPrompt, /Bild 36–38/);
  assert.match(masterPrompt, /00-bildprompts\/images/);
});

test('Neue V2-Regeln verlangen keine sichtbaren Script- oder Audio-Parts', async () => {
  const [readme, workflow, pacing] = await Promise.all([
    readFile('youtube/README.md', 'utf8'),
    readFile('youtube/YOUTUBE_WORKFLOW.md', 'utf8'),
    readFile('youtube/ADAPTIVE_PACING_V2.md', 'utf8')
  ]);

  assert.match(readme, /EIN Masterprompt/i);
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
