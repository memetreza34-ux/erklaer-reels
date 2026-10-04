import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const PROJECT = 'youtube/2026-KW40_28-09_bis_04-10/kalter-krieg-wie-aus-verbuendeten-feinde-wurden';

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function runPhase1Gate() {
  return spawnSync(process.execPath, ['src/cli/validate-youtube-phase1-policy.js', '--dir', PROJECT], {
    cwd: process.cwd(),
    encoding: 'utf8'
  });
}

test('Kalter-Krieg-Projekt nutzt Schema 13 und den 6–7-Minuten-Rahmen', async () => {
  const [meta, script] = await Promise.all([
    readJson(`${PROJECT}/99-technik/video.json`),
    readFile(`${PROJECT}/01-voice-script/voice-script.txt`, 'utf8')
  ]);

  assert.equal(meta.schemaVersion, 13);
  assert.equal(meta.visualFlexibilityPolicyVersion, 1);
  assert.equal(meta.targetDurationSeconds, 400);
  assert.deepEqual(meta.targetDurationRangeSeconds, [380, 420]);
  assert.equal(meta.plannedImageCount, 74);
  assert.equal(meta.renderPolicy.endHoldSeconds, 1.3);
  assert.equal(meta.topicEditor.decision, 'APPROVED_NEW');
  assert.equal(script.trim().split(/\s+/).length, 1011);
  assert.match(script, /^Wie begann der Kalte Krieg\? Denkst du dir gerade vielleicht\. Kurz gesagt:/);
});

test('74 Bilder besitzen Topic Anchor und Visual Form im Flow-Masterprompt', async () => {
  const prompt = await readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8');
  const blocks = [...prompt.matchAll(/^BILD\s+(\d{2})\s+·/gim)];
  const anchors = [...prompt.matchAll(/^Topic Anchor:\s*.+$/gim)];
  const forms = [...prompt.matchAll(/^Visual Form:\s*.+$/gim)];

  assert.equal(blocks.length, 74);
  assert.deepEqual(blocks.map((m) => Number(m[1])), Array.from({ length: 74 }, (_, i) => i + 1));
  assert.equal(anchors.length, 74);
  assert.equal(forms.length, 74);
  assert.match(prompt, /COUNTRYBALLS ARE OPTIONAL PER IMAGE/i);
  assert.match(prompt, /BEST VISUAL FORM > FORCED COUNTRYBALL > FORCED COMPLEX SCENE/i);
  assert.match(prompt, /No normal illustrated humans/i);
  assert.match(prompt, /Bild 02 through Bild 74 is generated exactly ONCE/i);
});

test('Audio-Mapping enthält 74 exakte monotone Skriptanker', async () => {
  const [script, mapping] = await Promise.all([
    readFile(`${PROJECT}/01-voice-script/voice-script.txt`, 'utf8'),
    readJson(`${PROJECT}/99-technik/BILD_AUDIO_ZUORDNUNG.json`)
  ]);

  assert.equal(mapping.images.length, 74);
  assert.equal(mapping.videoFirstImageNumber, 1);
  assert.equal(mapping.videoLastImageNumber, 74);

  let previous = -1;
  for (let i = 0; i < mapping.images.length; i += 1) {
    const image = mapping.images[i];
    assert.equal(image.imageNumber, i + 1);
    const index = script.indexOf(image.startAnchor);
    assert.ok(index >= 0, `Anchor fehlt bei Bild ${image.imageNumber}: ${image.startAnchor}`);
    assert.ok(index > previous, `Anchor nicht monoton bei Bild ${image.imageNumber}`);
    previous = index;
    assert.match(String(image.complexityLevel), /^[A-E]$/);
    assert.ok(String(image.complexityReason).trim().length > 0);
    assert.ok(Number(image.plannedHoldSeconds) >= 4 && Number(image.plannedHoldSeconds) <= 12);
    if (mapping.images[i + 1]) assert.equal(image.endAnchor, mapping.images[i + 1].startAnchor);
    else assert.equal(image.endAnchor, null);
  }
});

test('Bildplanung nutzt unterschiedliche Visual Forms statt erzwungener Countryballs', async () => {
  const prompt = await readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8');
  for (const form of ['map-only', 'object-only', 'document-only', 'simple-schema', 'multi-actor', 'multi-element', 'full-scene']) {
    assert.match(prompt, new RegExp(`Visual Form: ${form}`, 'i'));
  }
  assert.match(prompt, /KOREA 1950–1953/);
  assert.match(prompt, /SPUTNIK 1957/);
  assert.match(prompt, /9\. NOVEMBER 1989/);
  assert.match(prompt, /DER KONFLIKT ENDETE – SEINE SPUREN BLIEBEN/);
});

test('Recherche und Produktionsplan decken den ganzen historischen Bogen ab', async () => {
  const [research, production] = await Promise.all([
    readFile(`${PROJECT}/99-technik/RECHERCHE.md`, 'utf8'),
    readFile(`${PROJECT}/99-technik/PRODUKTIONSPLAN.md`, 'utf8')
  ]);
  for (const marker of ['Truman Doctrine', 'Marshall Plan', 'Berlin Airlift', 'Cuban Missile Crisis', 'Soviet Invasion of Afghanistan', 'Collapse of the Soviet Union']) {
    assert.match(research, new RegExp(marker, 'i'));
  }
  assert.match(production, /Einleitung/);
  assert.match(production, /Hauptteil/);
  assert.match(production, /Schluss/);
  assert.match(production, /74 Bildmomente/);
});

test('Kalter-Krieg-Projekt besteht das echte Phase-1-Policy-Gate', () => {
  const result = runPhase1Gate();
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /BESTANDEN/i);
});
