import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CHANNELS,
  getVisualWorld,
  assertVisualWorldForChannel,
  listVisualWorlds,
  RETIRED_VISUAL_WORLD_IDS
} from '../src/shared/visual-worlds.js';
import { FIXED_VISUAL_STYLE_ID, FIXED_VISUAL_ASPECT_RATIO } from '../src/shared/fixed-visual-world.js';
import { YOUTUBE_VISUAL_STYLE_ID, YOUTUBE_VISUAL_ASPECT_RATIO } from '../src/shared/youtube-visual-world.js';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (relativePath) => readFile(path.join(REPO_ROOT, relativePath), 'utf8');

test('jeder Kanal hat genau eine Bildwelt', () => {
  assert.deepEqual([...CHANNELS].sort(), ['reel', 'youtube']);
  for (const channel of CHANNELS) {
    const world = getVisualWorld(channel);
    assert.equal(world.channel, channel);
    assert.equal(world.active, true);
  }
});

test('Reel und YouTube unterscheiden sich in Format und Figurensystem', () => {
  const reel = getVisualWorld('reel');
  const youtube = getVisualWorld('youtube');

  assert.notEqual(reel.id, youtube.id);
  assert.equal(reel.aspectRatio, '9:16');
  assert.equal(youtube.aspectRatio, '16:9');
  assert.notEqual(reel.characterSystem, youtube.characterSystem);
  assert.notEqual(reel.styleBible, youtube.styleBible);
  assert.notEqual(reel.productionRoot, youtube.productionRoot);
});

test('die Kanal-Module spiegeln exakt die Registry', () => {
  assert.equal(FIXED_VISUAL_STYLE_ID, getVisualWorld('reel').id);
  assert.equal(FIXED_VISUAL_ASPECT_RATIO, '9:16');
  assert.equal(YOUTUBE_VISUAL_STYLE_ID, getVisualWorld('youtube').id);
  assert.equal(YOUTUBE_VISUAL_ASPECT_RATIO, '16:9');
});

test('eine Bildwelt im falschen Kanal ist ein Hard Blocker', () => {
  assert.throws(
    () => assertVisualWorldForChannel('youtube', FIXED_VISUAL_STYLE_ID),
    /gehört zum Kanal "reel"/
  );
  assert.throws(
    () => assertVisualWorldForChannel('reel', YOUTUBE_VISUAL_STYLE_ID),
    /gehört zum Kanal "youtube"/
  );
  assert.doesNotThrow(() => assertVisualWorldForChannel('reel', FIXED_VISUAL_STYLE_ID));
  assert.doesNotThrow(() => assertVisualWorldForChannel('youtube', YOUTUBE_VISUAL_STYLE_ID));
});

test('stillgelegte Bildwelten werden abgewiesen', () => {
  for (const retiredId of RETIRED_VISUAL_WORLD_IDS) {
    for (const channel of CHANNELS) {
      assert.throws(() => assertVisualWorldForChannel(channel, retiredId), /stillgelegt/);
    }
  }
});

test('keine aktive Regel nennt eine stillgelegte Bildwelt als gültig', async () => {
  // Historische Erwähnungen sind erlaubt, solange der Satz sie als ersetzt markiert.
  const HISTORICAL_MARKERS = /früher|bisherig|ersetzt|stillgelegt|abgelöst|nicht mehr|alte[nr]?\s/i;
  const SEARCH_DIRECTORIES = ['', 'config', 'docs', 'knowledge', 'youtube'];

  const offenders = [];
  for (const directory of SEARCH_DIRECTORIES) {
    const absolute = path.join(REPO_ROOT, directory);
    const entries = await readdir(absolute, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!/\.(md|json)$/.test(entry.name)) continue;
      const relativePath = path.join(directory, entry.name);
      if (relativePath === path.join('config', 'visual-worlds.json')) continue;

      const content = await read(relativePath);
      for (const [index, line] of content.split('\n').entries()) {
        for (const retiredId of RETIRED_VISUAL_WORLD_IDS) {
          if (!line.includes(retiredId)) continue;
          if (HISTORICAL_MARKERS.test(line)) continue;
          offenders.push(`${relativePath}:${index + 1}`);
        }
      }
    }
  }

  assert.deepEqual(offenders, [], `Stillgelegte Bildwelt wird noch als gültig genannt: ${offenders.join(', ')}`);
});

test('Style-Bibeln beider Kanäle existieren und beschreiben verschiedene Welten', async () => {
  const reel = getVisualWorld('reel');
  const youtube = getVisualWorld('youtube');

  const reelBible = await read(reel.styleBible);
  const youtubeBible = await read(youtube.styleBible);

  assert.ok(reelBible.includes(reel.id), `${reel.styleBible} muss ${reel.id} nennen.`);
  assert.ok(youtubeBible.includes(youtube.id), `${youtube.styleBible} muss ${youtube.id} nennen.`);
  assert.ok(!reelBible.includes(youtube.id) || /getrennt|nicht/i.test(reelBible));
});

test('Registry-IDs sind eindeutig', () => {
  const ids = listVisualWorlds().map((world) => world.id);
  assert.equal(new Set(ids).size, ids.length);
});
