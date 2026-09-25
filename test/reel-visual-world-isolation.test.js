import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (file) => readFile(file, 'utf8');

const REEL_OWNED_DOCS = [
  'CURRENT_WORKFLOW.md',
  'README.md',
  'knowledge/fixed-visual-world.md'
];

const YOUTUBE_IMPLEMENTATION_MARKERS = [
  /premium-editorial-explainer-illustration/i,
  /serious-minimal-countryball-explainer-youtube-16x9/i,
  /ASSET_GENERATION_POLICY_VERSION/i,
  /COVER = 3 CANDIDATES/i,
  /NON-COVER = SINGLE GENERATION/i,
  /FINAL IMAGE FOLDER HARD LOCK/i,
  /coverCandidateCount/i,
  /nonCoverGenerationCount/i,
  /dieselbe.*YouTube.*Bild-DNA/i,
  /gemeinsame.*YouTube.*Bild-DNA/i
];

test('Reel-eigene Dokumente bleiben frei von YouTube-Bildwelt und Produktionspolicy', async () => {
  for (const file of REEL_OWNED_DOCS) {
    const content = await read(file);
    assert.match(content, /serious-minimal-countryball-explainer|Serious Minimal Countryball Explainer/i, `${file} muss die Reel-Bildwelt enthalten.`);
    for (const marker of YOUTUBE_IMPLEMENTATION_MARKERS) {
      assert.doesNotMatch(content, marker, `${file} darf keine YouTube-Bildwelt/Produktionspolicy übernehmen: ${marker}`);
    }
  }
});

test('Reel-Style-Bibel behält die ursprünglichen konkreten Bildbeispiele', async () => {
  const bible = await read('knowledge/fixed-visual-world.md');
  assert.match(bible, /Kugel mit Thermometer und Schweiß/);
  assert.match(bible, /Kugel \+ Theatermaske \+ Musiknote/);
  assert.match(bible, /Kugel verlässt eine offene Tür/);
  assert.match(bible, /Thermometer/);
  assert.match(bible, /Grabstein/);
  assert.match(bible, /Statt realistischer Hirnscan-Person/);
});

test('Reel-Config bleibt technisch von YouTube getrennt', async () => {
  const styles = JSON.parse(await read('config/image-styles.json'));
  assert.equal(styles.fixedVisualWorld, 'serious-minimal-countryball-explainer');
  assert.deepEqual(styles.newReelAllowedStyleIds, ['serious-minimal-countryball-explainer']);
  assert.equal(styles.styles[0].composition.aspectRatio, '9:16');
  assert.ok(styles.selectionCriteria.includes('klare Trennung von der YouTube-Bildwelt'));
});
