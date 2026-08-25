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
  assert.equal(styles.goldenReferenceFile, 'knowledge/countryball-style-master.md');

  const round = styles.styles.find((style) => style.id === 'round-country-characters');
  const human = styles.styles.find((style) => style.id === 'human-editorial-cartoon');
  const metaphor = styles.styles.find((style) => style.id === 'visual-metaphor');

  assert.equal(round?.allowedForNewReels, true);
  assert.equal(human?.allowedForNewReels, false);
  assert.equal(metaphor?.allowedForNewReels, false);
  assert.equal(styles.characterGeometryLock?.bodyShape, 'perfect-geometric-circle');
  assert.equal(styles.characterGeometryLock?.equalVisibleBodyWidthAndHeight, true);
  assert.equal(styles.characterGeometryLock?.fullMainCharacterCircleVisible, true);
  assert.equal(styles.characterGeometryLock?.mouth, false);
  assert.equal(styles.characterGeometryLock?.humanFacialAnatomy, false);
  assert.equal(styles.characterGeometryLock?.defaultNonCountrySkinTone, false);
  assert.ok(styles.characterGeometryLock?.forbiddenShapes?.includes('bean-shaped'));
  assert.ok(styles.characterGeometryLock?.forbiddenShapes?.includes('ball-as-human-head'));
});

test('Golden-Reference-Datei zeigt auf die alten erfolgreichen Kugel-Reels', async () => {
  const master = await text('knowledge/countryball-style-master.md');

  assert.match(master, /warum-fahren-manche-laender-links/);
  assert.match(master, /warum-haben-manche-laender-keine-armee/);
  assert.match(master, /warum-gibt-es-laender-in-anderen-laendern/);
  assert.match(master, /kein Mund/i);
  assert.match(master, /vollständige runde Außenkontur/i);
  assert.match(master, /nicht hinter einem Schreibtisch/i);
});

test('Visual-Policy verbietet Human-Face-Drift und Möbel-Kopf-Illusion', async () => {
  const policy = await text('VISUAL_WORLD_POLICY.md');

  assert.match(policy, /Golden References/);
  assert.match(policy, /vollständige Kreis-Silhouette/i);
  assert.match(policy, /kein Mund/i);
  assert.match(policy, /keine Nase/i);
  assert.match(policy, /nicht hinter Schreibtisch/i);
  assert.match(policy, /Haut-\/Fleischfarbe/i);
  assert.match(policy, /CLASSIC COUNTRYBALL CHARACTER MODEL/);
});

test('Visual-QC verlangt Golden-Reference-, Gesichts- und Silhouettenchecks', async () => {
  const rules = JSON.parse(await text('config/visual-quality-rules.json'));

  for (const kind of ['scene', 'cover']) {
    assert.ok(rules.manualChecksByKind[kind].includes('goldenReferenceCountryballMatch'));
    assert.ok(rules.manualChecksByKind[kind].includes('perfectCircularCharacterGeometry'));
    assert.ok(rules.manualChecksByKind[kind].includes('fullMainBallSilhouetteVisible'));
    assert.ok(rules.manualChecksByKind[kind].includes('countryballEyesOnlyNoHumanFace'));
    assert.ok(rules.manualChecksByKind[kind].includes('noFurnitureHeadOcclusion'));
    assert.ok(rules.manualChecksByKind[kind].includes('noSkinToneHumanHeadLook'));
  }
  assert.equal(rules.characterGeometry?.equalVisibleWidthAndHeight, true);
  assert.equal(rules.characterGeometry?.fullMainBallSilhouetteVisible, true);
  assert.equal(rules.characterGeometry?.mouthAllowed, false);
  assert.equal(rules.characterGeometry?.humanFacialAnatomyAllowed, false);
  assert.equal(rules.characterGeometry?.forbidFurnitureOcclusionThatCreatesHeadLook, true);
  assert.equal(rules.characterGeometry?.poseMayDeformCircle, false);
});

test('Google-Flow-Exporter setzt Golden-Reference-Lock vor alle Bildaufträge', async () => {
  const exporter = await text('src/core/image-prompt-bundle.js');

  assert.match(exporter, /GOLDEN-REFERENCE COUNTRYBALL-MODELL – HÖCHSTE PRIORITÄT/);
  assert.match(exporter, /Linksverkehr \/ Länder ohne Armee \/ Länder in Ländern/);
  assert.match(exporter, /KEIN Mund/);
  assert.match(exporter, /vollständige runde Außenkontur/);
  assert.match(exporter, /NICHT hinter Schreibtisch/);
  assert.match(exporter, /Keine Haut-\/Fleischfarbe/);
  assert.match(exporter, /Falls Bild 00 diese Prüfung nicht besteht/);
});

test('E2E-Prokrastinations-Cover ist auf die alte erfolgreiche Countryball-Welt angepasst', async () => {
  const coverPrompt = await text(`${E2E_REEL}/cover/cover-prompt.txt`);
  const sceneOne = await text(`${E2E_REEL}/scenes/scene-01/image-prompt.txt`);
  const bundle = await text(`${E2E_REEL}/all-image-prompts/all-image-prompts.txt`);

  for (const prompt of [coverPrompt, sceneOne]) {
    assert.match(prompt, /complete.*round/i);
    assert.match(prompt, /entire circular silhouette/i);
    assert.match(prompt, /two simple white countryball eyes/i);
    assert.match(prompt, /NO mouth/i);
    assert.match(prompt, /cobalt-and-mustard two-tone/i);
    assert.match(prompt, /Do not.*behind.*desk|Do NOT place.*behind a desk/i);
  }

  assert.match(bundle, /GOLDEN-REFERENCE COUNTRYBALL-MODELL/);
  assert.match(bundle, /KEIN Mund/);
  assert.match(bundle, /vollständige runde Außenkontur/);
  assert.match(bundle, /Bild 00 neu generieren/);
});
