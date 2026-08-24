import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const E2E_REEL = 'reels/2026-KW35_24-08_bis_30-08/samstag/reel-01_warum-schieben-wir-aufgaben-auf';

async function text(file) {
  return readFile(file, 'utf8');
}

test('für neue Reels ist nur die feste Kugel-Welt aktiv', async () => {
  const styles = JSON.parse(await text('config/image-styles.json'));

  assert.equal(styles.visualWorldMode, 'fixed');
  assert.equal(styles.fixedVisualWorld, 'round-country-characters');
  assert.deepEqual(styles.newReelAllowedStyleIds, ['round-country-characters']);

  const round = styles.styles.find((style) => style.id === 'round-country-characters');
  const human = styles.styles.find((style) => style.id === 'human-editorial-cartoon');
  const metaphor = styles.styles.find((style) => style.id === 'visual-metaphor');

  assert.equal(round?.allowedForNewReels, true);
  assert.equal(human?.allowedForNewReels, false);
  assert.equal(metaphor?.allowedForNewReels, false);
  assert.equal(styles.characterGeometryLock?.bodyShape, 'perfect-geometric-circle');
  assert.equal(styles.characterGeometryLock?.equalVisibleBodyWidthAndHeight, true);
  assert.ok(styles.characterGeometryLock?.forbiddenShapes?.includes('bean-shaped'));
  assert.ok(styles.characterGeometryLock?.forbiddenShapes?.includes('oval'));
});

test('Visual-Policy verbietet ovale, Ei-, Bean- und humanoide Figuren ausdrücklich', async () => {
  const policy = await text('VISUAL_WORLD_POLICY.md');

  assert.match(policy, /perfekter geometrischer Kreis/i);
  assert.match(policy, /1:1-Kreis/i);
  assert.match(policy, /bohnenförm/i);
  assert.match(policy, /eiförmig/i);
  assert.match(policy, /separaten Kopf, Hals, Schultern/i);
  assert.match(policy, /Never deform the circle/i);
});

test('Visual-QC verlangt die exakte Kugelgeometrie als eigenen Pflichtcheck', async () => {
  const rules = JSON.parse(await text('config/visual-quality-rules.json'));

  for (const kind of ['scene', 'cover']) {
    assert.ok(rules.manualChecksByKind[kind].includes('perfectCircularCharacterGeometry'));
    assert.ok(rules.manualChecksByKind[kind].includes('noOvalEggBeanHumanoidCharacters'));
  }
  assert.equal(rules.characterGeometry?.equalVisibleWidthAndHeight, true);
  assert.equal(rules.characterGeometry?.poseMayDeformCircle, false);
});

test('Google-Flow-Exporter setzt den Geometrie-Lock vor alle Bildaufträge', async () => {
  const exporter = await text('src/core/image-prompt-bundle.js');

  assert.match(exporter, /KUGEL-GEOMETRIE – HÖCHSTE PRIORITÄT/);
  assert.match(exporter, /perfekter geometrischer 1:1-Kreis/);
  assert.match(exporter, /ABSOLUT VERBOTEN: oval, eiförmig, bohnenförmig/);
  assert.match(exporter, /Körperform bleibt EXAKT dieselbe wie bei klassischen Countryballs/);
});

test('E2E-Prokrastinations-Cover nutzt echte Country-Ball-Geometrie statt Bean-Charakter', async () => {
  const coverPrompt = await text(`${E2E_REEL}/cover/cover-prompt.txt`);
  const bundle = await text(`${E2E_REEL}/all-image-prompts/all-image-prompts.txt`);

  assert.match(coverPrompt, /EXACT COUNTRYBALL GEOMETRY LOCK/);
  assert.match(coverPrompt, /ONE perfect geometric 1:1 circle/);
  assert.match(coverPrompt, /bean-shaped/);
  assert.match(coverPrompt, /No separate head, neck, shoulders/i);

  assert.match(bundle, /KUGEL-GEOMETRIE – HÖCHSTE PRIORITÄT/);
  assert.match(bundle, /bohnenförmig/);
  assert.match(bundle, /perfekte 1:1-Country-Ball-Körpergeometrie/);
});
