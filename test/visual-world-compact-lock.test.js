import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FIXED_VISUAL_WORLD_PROMPT,
  FIXED_VISUAL_WORLD_COMPACT_PROMPT
} from '../src/shared/fixed-visual-world.js';

/**
 * Der kompakte World-Lock steht vor jedem einzelnen Bildprompt. Er darf kuerzer sein
 * als der vollstaendige Block, aber keine harte Regel verlieren - sonst driftet die
 * Bildwelt ueber die zwanzig Bilder eines Reels auseinander.
 */
const HARTE_REGELN = [
  ['9:16', 'Hochformat'],
  ['Serious Minimal Countryball Explainer', 'Welt-Name'],
  ['thick clean black outlines', 'Konturstärke'],
  ['flat colours', 'flache Farben'],
  ['perfectly round countryball', 'Kugelgeometrie'],
  ['simple white eyes', 'Augen-Sprache'],
  ['No separate human head', 'kein Menschenkopf'],
  ['flag patterns only when', 'Flaggen nur bei Relevanz'],
  ['German only', 'sichtbarer Text nur Deutsch'],
  ['spelled exactly', 'exakte Schreibweise'],
  ['no readable text at all', 'kein Text wenn nicht gefordert'],
  ['stick figures', 'Verbot Stick-Figures'],
  ['photorealism', 'Verbot Fotorealismus'],
  ['realistic hands or skin', 'Verbot echte Haende/Haut'],
  ['anime', 'Verbot Anime'],
  ['manga', 'Verbot Manga'],
  ['clay', 'Verbot Clay'],
  ['glossy 3D', 'Verbot 3D'],
  ['Pixar-like', 'Verbot Pixar-Look'],
  ['stock-photo', 'Verbot Stock-Optik'],
  ['16:9 composition', 'Verbot Querformat'],
  ['YouTube visual world', 'Abgrenzung zur YouTube-Welt'],
  ['normal illustrated humans', 'Verbot normale Menschen'],
  ['One dominant focal idea', 'ein dominantes Motiv']
];

test('der kompakte World-Lock enthält jede harte Regel', () => {
  const fehlend = HARTE_REGELN
    .filter(([fragment]) => !FIXED_VISUAL_WORLD_COMPACT_PROMPT.includes(fragment))
    .map(([fragment, bedeutung]) => `${bedeutung} ("${fragment}")`);

  assert.deepEqual(fehlend, [], `Im kompakten Lock fehlen harte Regeln: ${fehlend.join(', ')}`);
});

test('der kompakte Lock ist deutlich kürzer als der vollständige', () => {
  assert.ok(FIXED_VISUAL_WORLD_COMPACT_PROMPT.length < FIXED_VISUAL_WORLD_PROMPT.length * 0.6,
    `Der kompakte Lock spart zu wenig: ${FIXED_VISUAL_WORLD_COMPACT_PROMPT.length} von ${FIXED_VISUAL_WORLD_PROMPT.length} Zeichen.`);
  assert.ok(FIXED_VISUAL_WORLD_COMPACT_PROMPT.length > 1200,
    'Der kompakte Lock ist so kurz, dass er die Bildwelt kaum noch festlegt.');
});

test('die Pipeline setzt den kompakten Lock vor jedes Bild, den vollen nur einmal', async () => {
  const quelle = await import('node:fs/promises')
    .then((fs) => fs.readFile('src/core/image-prompt-bundle.js', 'utf8'));

  // Der Prompt pro Bild nutzt den kompakten Block.
  const proBild = quelle.slice(quelle.indexOf('function formatStyledGenerationPrompt'));
  const bildBlock = proBild.slice(0, proBild.indexOf('function imageRole'));
  assert.match(bildBlock, /FIXED_VISUAL_WORLD_COMPACT_PROMPT/);
  assert.doesNotMatch(bildBlock, /FIXED_VISUAL_WORLD_PROMPT(?!_)/);

  // Der volle Block steht weiterhin im Kopf der Sammeldatei.
  assert.match(quelle, /FIXED_VISUAL_WORLD_PROMPT,/);
});
