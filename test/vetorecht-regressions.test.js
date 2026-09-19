// Jeder Test hier deckt einen Fehler ab, der im fertig gerenderten
// Vetorecht-Reel gelandet ist, obwohl die komplette Pipeline "bestanden"
// gemeldet hat. Gemeinsame Ursache: Es prüfte nur JSON gegen JSON, nie ein
// Bild und nie eine Liste gegen die andere.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { verifyAssetPlanConsistency } from '../src/core/asset-plan-consistency.js';
import { deltaE } from '../src/core/background-palette.js';
import { normalizeImageText } from '../src/core/image-text-ocr.js';
import { AUDIO_PACING_STYLE } from '../src/shared/audio-pacing-style.js';
import { FIXED_VISUAL_WORLD_COMPACT_PROMPT, FIXED_VISUAL_WORLD_PROMPT } from '../src/shared/fixed-visual-world.js';
import { analyzeFlagPrompt } from '../src/shared/image-prompt-entities.js';

async function createReel(timeline, manifest, files = [], date = '2026-10-01') {
  const directory = await mkdtemp(path.join(tmpdir(), 'reel-consistency-'));
  await mkdir(path.join(directory, 'timeline'), { recursive: true });
  await writeFile(path.join(directory, 'reel.json'), JSON.stringify({ date }), 'utf8');
  await writeFile(path.join(directory, 'timeline', 'timeline-plan.json'), JSON.stringify(timeline), 'utf8');
  await writeFile(path.join(directory, 'assets-manifest.json'), JSON.stringify(manifest), 'utf8');
  for (const file of files) {
    const target = path.join(directory, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, 'x', 'utf8');
  }
  return directory;
}

test('ein Prompt, der Flaggen verlangt, muss sie auch benennen', () => {
  // Der echte Prompt aus scene-10. Geliefert kamen sechs Bälle, darunter
  // Deutschland und Brasilien, in einem Bild über die fünf Vetomächte.
  const vague = analyzeFlagPrompt(
    'Vertical 9:16. Five flag-patterned countryballs arranged in one closed circle facing inward. No text.'
  );
  assert.equal(vague.requestsFlags, true);
  assert.equal(vague.requestedBallCount, 5);
  assert.deepEqual(vague.namedCountries, []);
  assert.ok(vague.issue);

  // Der echte Prompt aus scene-05, der korrekt zurückkam.
  const explicit = analyzeFlagPrompt(
    'Vertical 9:16. Five large countryballs in one clean horizontal row, each with a flat flag pattern: '
    + 'United States stars and stripes, Russian white-blue-red bands, Chinese red with yellow stars, '
    + 'French blue-white-red vertical bands, British union pattern. '
    + 'German text reading exactly DIE STÄNDIGEN FÜNF in the upper third.'
  );
  assert.equal(explicit.namedCountries.length, 5);
  assert.equal(explicit.issue, null);
});

test('"German text" ist eine Textanweisung und zählt nicht als Flagge Deutschlands', () => {
  const result = analyzeFlagPrompt('Two flag-patterned countryballs, Russian and Chinese. German text NEIN in the upper third.');
  assert.deepEqual(result.namedCountries.sort(), ['china', 'russia']);
  assert.equal(result.issue, null);
});

test('ein Prompt ohne Flaggenwunsch bleibt unberührt', () => {
  const result = analyzeFlagPrompt('Vertical 9:16. One flat stack of documents with red crosses. German text FAST 300 MAL in bold type.');
  assert.equal(result.requestsFlags, false);
  assert.equal(result.issue, null);
});

test('Bildtext-Vergleich ignoriert Satzzeichen, unterscheidet aber Umlaute', () => {
  assert.equal(normalizeImageText('  Was ist ein Vetorecht? '), 'WAS IST EIN VETORECHT');
  assert.equal(normalizeImageText('DIE\nSTÄNDIGEN FÜNF'), 'DIE STÄNDIGEN FÜNF');
  assert.notEqual(normalizeImageText('DIE STANDIGEN FUNF'), normalizeImageText('DIE STÄNDIGEN FÜNF'));
  // Das gelieferte Cover trug eine andere Headline als geplant.
  assert.ok(!normalizeImageText('ENTSCHEIDET DIE MEHRHEIT?').includes(normalizeImageText('Was ist ein Vetorecht?')));
});

test('Manifest, Timeline und Bilddateien müssen dieselbe Bildfolge beschreiben', async () => {
  const timeline = {
    scenes: [{ sceneId: 'scene-01', imagePhases: [{ targetId: 'scene-01', imageFile: 'scenes/scene-01/scene-01.jpeg' }] }]
  };
  const manifest = { visuals: [{ targetId: 'scene-01', expectedFile: 'scenes/scene-01/scene-01.jpeg', source: 'numbered-images/Bild 01.jpeg' }] };

  const clean = await createReel(timeline, manifest, ['scenes/scene-01/scene-01.jpeg', 'inbox/numbered-images/Bild 01.jpeg']);
  const cleanResult = await verifyAssetPlanConsistency(clean);
  assert.equal(cleanResult.passed, true, JSON.stringify(cleanResult.findings));
  await rm(clean, { recursive: true, force: true });

  // Genau der Zustand des Vetorecht-Reels: ein importiertes Bild, das in keiner
  // Bildphase vorkommt, und eine Manifest-Quelle, die es nicht mehr gibt.
  const drifted = await createReel(
    timeline,
    { visuals: [...manifest.visuals, { targetId: 'scene-01-image-02', expectedFile: 'scenes/scene-01/scene-01-2.jpeg', source: 'numbered-images/Bild 22.jpeg' }] },
    ['scenes/scene-01/scene-01.jpeg', 'scenes/scene-01/scene-01-2.jpeg', 'inbox/numbered-images/Bild 01.jpeg']
  );
  const driftedResult = await verifyAssetPlanConsistency(drifted);
  const issues = driftedResult.findings.map((finding) => finding.issue);
  assert.equal(driftedResult.passed, false);
  assert.ok(issues.includes('manifest-phase-count-mismatch'));
  assert.ok(issues.includes('manifest-source-missing'));
  assert.ok(issues.includes('orphan-scene-image'));
  await rm(drifted, { recursive: true, force: true });

  // Bereits veröffentlichte Reels dürfen nicht rückwirkend blockieren; sonst
  // lässt sich ein Archiv-Reel nicht einmal mehr neu rendern.
  const archived = await createReel(
    timeline,
    { visuals: [...manifest.visuals, { targetId: 'scene-01-image-02', expectedFile: 'scenes/scene-01/scene-01-2.jpeg', source: 'numbered-images/Bild 22.jpeg' }] },
    ['scenes/scene-01/scene-01.jpeg', 'inbox/numbered-images/Bild 01.jpeg'],
    '2026-09-10'
  );
  const archivedResult = await verifyAssetPlanConsistency(archived);
  assert.equal(archivedResult.required, false);
  assert.equal(archivedResult.passed, true);
  await rm(archived, { recursive: true, force: true });
});

test('Bilder müssen nativ in Kompositionsgröße vorliegen', async () => {
  const { readFile } = await import('node:fs/promises');
  const rules = JSON.parse(await readFile(new URL('../config/visual-quality-rules.json', import.meta.url), 'utf8'));
  // 768×1376 hat das alte Minimum von 720×1280 bestanden und wurde im Render
  // auf 1080×1920 hochskaliert, plus Zoom.
  assert.equal(rules.composition.minimumWidth, rules.composition.width);
  assert.equal(rules.composition.minimumHeight, rules.composition.height);
  assert.ok(rules.composition.nativeResolutionHardGateSince);
  assert.equal(rules.renderedImageText.verifyPlannedTextIsVisible, true);
});

test('Lautheit zielt auf den Social-Feed statt auf den Podcast-Standard', () => {
  assert.equal(AUDIO_PACING_STYLE.loudnessTargetLufs, -14);
  assert.equal(AUDIO_PACING_STYLE.truePeakDbtp, -1);
});

test('die feste Bildwelt legt die Hintergrundfarben fest', async () => {
  // Ohne Palette wanderten die Hintergründe eines Reels durch Navy, Creme,
  // Mint, Lavendel, Lachs und Oliv.
  const { readFile } = await import('node:fs/promises');
  const rules = JSON.parse(await readFile(new URL('../config/visual-quality-rules.json', import.meta.url), 'utf8'));
  const palette = rules.backgroundPalette;

  assert.ok(palette.colours.length >= 4);
  assert.ok(palette.maximumDeltaE > 0);
  assert.ok(palette.hardGateSince);

  // Prompt und Prüfung müssen exakt dieselben Farben nennen, sonst verlangt der
  // World-Lock etwas anderes, als der Gate misst.
  for (const prompt of [FIXED_VISUAL_WORLD_COMPACT_PROMPT, FIXED_VISUAL_WORLD_PROMPT]) {
    for (const colour of palette.colours) assert.ok(prompt.includes(colour.hex), `${colour.hex} fehlt im World-Lock`);
    assert.match(prompt, /never invent a new background hue/i);
  }
});

test('die Hintergrundmessung trennt Palettenfarben von Ausreißern', () => {
  const navy = [0x22, 0x2C, 0x4C];
  // Am Vetorecht-Reel gemessene Werte: die navyfarbenen Bilder lagen bei ΔE 1–4,
  // die Ausreißer bei 14–25. Die Schwelle 12 liegt in dieser Lücke.
  assert.ok(deltaE([0x25, 0x2C, 0x4C], navy) < 5);
  assert.ok(deltaE([0x1F, 0x30, 0x56], navy) < 12);
  assert.ok(deltaE([0xEE, 0xB9, 0x9C], navy) > 12);
  assert.equal(deltaE(navy, navy), 0);
});
