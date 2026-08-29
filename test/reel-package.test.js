import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { importReelPackage, validateReelPackage } from '../src/core/reel-package.js';
import { validateReelContent } from '../src/core/content-validator.js';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));

function baueSzene(index, woerter) {
  const anzahl = index === 0 ? 1 : 2;
  return {
    narration: Array.from({ length: woerter }, (_, i) => `Wort${i + 1}`).join(' '),
    imageText: `TEXT ${index + 1}`,
    visualIdea: 'Runde Kugelfiguren auf einer flachen Landkarte zeigen den Zusammenhang deutlich.',
    continuityNotes: 'Gleiche Konturstärke und Farbwelt wie in der Szene davor.',
    durationSeconds: index === 0 ? 5.5 : 6.5,
    cameraMotion: { type: index === 0 ? 'none' : 'ken-burns' },
    soundEffects: index === 0 ? [] : [{ type: 'pop', atPercent: 0.05, visualEvent: 'Wechsel', reason: 'Markiert den Schnitt.' }],
    images: Array.from({ length: anzahl }, (_, j) => ({
      prompt: `Vertical 9:16 explainer illustration in the fixed Modern Countryball Explainer world. ${'Detailbeschreibung '.repeat(12)}Szene ${index + 1} Bild ${j + 1}.`,
      imageText: j === 0 ? `TEXT ${index + 1}` : `DETAIL ${index + 1}`,
      startPercent: j === 0 ? 0 : 0.5
    }))
  };
}

function bauePaket({ szenenzahl = 9, woerterProSzene = 18 } = {}) {
  return {
    title: 'Warum haben manche Länder zwei Hauptstädte?',
    topicArea: 'Länder, Geografie und Geschichte',
    caption: `Warum verteilen manche Länder ihre Staatsmacht auf mehrere Städte?

${'Erklärender Fließtext zur Aufteilung der Hauptstadtfunktionen im Land. '.repeat(14)}

#erklärt #geografie #wissen`,
    sources: [
      { title: 'Offizielle Quelle', url: 'https://www.gov.za/beispiel', accessed: '2026-08-29', type: 'Primärquelle', supports: 'Belegt die Aufteilung der Hauptstadtfunktionen.' },
      { title: 'Fachquelle', url: 'https://www.britannica.com/beispiel', accessed: '2026-08-29', type: 'Sekundärquelle', supports: 'Belegt den historischen Hintergrund.' }
    ],
    scenes: Array.from({ length: szenenzahl }, (_, i) => {
      const szene = baueSzene(i, woerterProSzene);
      // Die vorletzte Szene stellt die Prüffrage, die letzte löst auf.
      if (i === szenenzahl - 2) {
        szene.narration = `Fällt dir dazu spontan ein eigenes Beispiel ein? ${szene.narration}`;
        szene.visualIdea = 'Eine Kugelfigur betrachtet nachdenklich eine Karte und sucht ein eigenes Beispiel.';
      }
      if (i === szenenzahl - 1) {
        szene.visualIdea = 'Ruhige Schlussansicht der Karte mit klar markierter Hauptstadt und den Regionen ringsum.';
      }
      return szene;
    })
  };
}

test('meldet fehlende Pflichtfelder, statt ein halbes Reel anzulegen', () => {
  assert.ok(validateReelPackage({}).length >= 5);
  assert.match(validateReelPackage({}).join(' '), /title/);
});

test('erkennt eine falsche Szenen- und Bildanzahl', () => {
  const zuWenig = validateReelPackage(bauePaket({ szenenzahl: 5 }));
  assert.match(zuWenig.join(' '), /8 bis 10/);

  const paket = bauePaket();
  paket.scenes[3].images = [paket.scenes[3].images[0]];
  assert.match(validateReelPackage(paket).join(' '), /erwartet 2 Bild/);
});

test('erkennt eine verfehlte Wortzahl', () => {
  // Ohne diese Prüfung fällt es erst in der Inhaltskontrolle auf, nach dem Anlegen.
  const zuKurz = validateReelPackage(bauePaket({ woerterProSzene: 8 }));
  assert.match(zuKurz.join(' '), /155 bis 175/);
});

test('erkennt einen zu knappen Bildprompt', () => {
  const paket = bauePaket();
  paket.scenes[2].images[0].prompt = 'Zu kurz.';
  assert.match(validateReelPackage(paket).join(' '), /unter 180 Zeichen/);
});

test('ein gültiges Paket ergibt ein Reel, das die strenge Inhaltsprüfung besteht', async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-paket-'));
  try {
    const paket = bauePaket();
    assert.deepEqual(validateReelPackage(paket), []);

    const ergebnis = await importReelPackage(paket, { outputRoot, date: new Date('2026-09-14T12:00:00') });
    assert.equal(ergebnis.sceneCount, 9);
    assert.equal(ergebnis.plannedImageCount, 17);

    // Alle Prompts müssen als Datei liegen, sonst bricht der Export.
    const index = JSON.parse(await readFile(path.join(ergebnis.reelDirectory, 'scenes', 'scene-index.json'), 'utf8'));
    for (const szene of index) {
      for (const phase of szene.imagePhases) {
        const inhalt = await readFile(path.join(ergebnis.reelDirectory, 'scenes', szene.sceneId, phase.promptFileName), 'utf8');
        assert.ok(inhalt.trim().length >= 180, `${szene.sceneId}/${phase.promptFileName} ist zu kurz`);
      }
    }

    const bericht = await validateReelContent(ergebnis.reelDirectory);
    const fehler = bericht.checks.filter((check) => check.passed === false && check.level === 'error');
    // Der Flow-Masterprompt entsteht erst beim Export und darf hier noch fehlen.
    const echteFehler = fehler.filter((check) => !/Masterprompt/i.test(check.message ?? ''));
    assert.deepEqual(echteFehler.map((check) => check.message), []);
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});

test('die Beispielvorlage im Repo passt zum erwarteten Format', async () => {
  const vorlage = JSON.parse(await readFile(path.join(REPO_ROOT, 'input', 'reel-paket.beispiel.json'), 'utf8'));
  for (const feld of ['title', 'topicArea', 'caption', 'sources', 'scenes']) {
    assert.ok(vorlage[feld], `Der Vorlage fehlt das Feld ${feld}`);
  }
  const echteSzenen = vorlage.scenes.filter((szene) => szene.narration);
  assert.ok(echteSzenen.length >= 2, 'Die Vorlage braucht mehrere Beispielszenen');
  assert.ok(echteSzenen[0].images.length === 1, 'Die Hook hat einen Bildmoment');
  assert.ok(echteSzenen[1].images.length === 2, 'Standardszenen haben zwei Bildmomente');
});

test('lehnt schwache Quellen ab, bevor ein Reel entsteht', () => {
  const paket = bauePaket();

  const ohneHttps = structuredClone(paket);
  ohneHttps.sources[0].url = 'http://www.gov.za/beispiel';
  assert.match(validateReelPackage(ohneHttps).join(' '), /https:\/\//);

  const gleicherHost = structuredClone(paket);
  gleicherHost.sources[1].url = 'https://www.gov.za/anderes';
  assert.match(validateReelPackage(gleicherHost).join(' '), /verschiedenen Hosts/);

  const ohneSekundaer = structuredClone(paket);
  ohneSekundaer.sources[1].type = 'Primärquelle';
  assert.match(validateReelPackage(ohneSekundaer).join(' '), /Sekundär- oder Fachquelle/);

  const leeresFeld = structuredClone(paket);
  leeresFeld.sources[0].accessed = '';
  assert.match(validateReelPackage(leeresFeld).join(' '), /"accessed" fehlt/);

  const vageBegruendung = structuredClone(paket);
  vageBegruendung.sources[0].supports = 'Belegt.';
  assert.match(validateReelPackage(vageBegruendung).join(' '), /supports/);
});

test('lehnt eine Caption ab, die der Renderer später zurückweisen würde', () => {
  const paket = bauePaket();

  const zuKurz = structuredClone(paket);
  zuKurz.caption = 'Viel zu kurze Caption ohne Substanz.\n\n#a #b #c';
  assert.match(validateReelPackage(zuKurz).join(' '), /60 bis 130 Wörter/);

  const zuVieleHashtags = structuredClone(paket);
  zuVieleHashtags.caption = `${'Wort '.repeat(70)}\n\n#a #b #c #d #e #f #g`;
  assert.match(validateReelPackage(zuVieleHashtags).join(' '), /3 bis 6 Hashtags/);

  const ohneHook = structuredClone(paket);
  ohneHook.caption = `Kurz.\n\n${'Wort '.repeat(70)}\n\n#a #b #c`;
  assert.match(validateReelPackage(ohneHook).join(' '), /Hook/);
});

test('verlangt für jedes Bild ein kurzes deutsches Stichwort', () => {
  const ohneText = bauePaket();
  ohneText.scenes[3].images[1].imageText = '';
  // Ein Bild ohne Wort wirkt im Feed leer — das soll schon im Paket auffallen.
  assert.match(validateReelPackage(ohneText).join(' '), /imageText fehlt/);

  const zuLang = bauePaket();
  zuLang.scenes[2].images[0].imageText = 'Dieser Bildtext ist deutlich zu lang für ein Reel';
  assert.match(validateReelPackage(zuLang).join(' '), /erlaubt sind 1 bis 5/);
});
