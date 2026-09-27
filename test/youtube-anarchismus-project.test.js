import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const PROJECT = 'youtube/2026-KW39_21-09_bis_27-09/anarchismus-gesellschaft-ohne-staat';

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

function runPhase1Gate() {
  return spawnSync(process.execPath, ['src/cli/validate-youtube-phase1-policy.js', '--dir', PROJECT], {
    cwd: process.cwd(),
    encoding: 'utf8'
  });
}

test('Anarchismus-Projekt nutzt Schema 13 und Visual Flexibility V1', async () => {
  const [meta, prompt, script] = await Promise.all([
    readJson(`${PROJECT}/99-technik/video.json`),
    readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readFile(`${PROJECT}/01-voice-script/voice-script.txt`, 'utf8')
  ]);

  assert.equal(meta.schemaVersion, 13);
  assert.equal(meta.visualFlexibilityPolicyVersion, 1);
  assert.equal(meta.visualFlexibilityPolicy.countryballsOptionalPerImage, true);
  assert.equal(meta.visualWorldParityPolicy.countryballRequiredInEveryImage, false);
  assert.equal(meta.visualQualityPolicy.singleObjectAllowedWhenItIsTheClearestVisual, true);
  assert.equal(meta.targetDurationSeconds, 120);
  assert.deepEqual(meta.targetDurationRangeSeconds, [114, 128]);
  assert.equal(meta.plannedImageCount, 25);
  assert.match(script, /^Was ist Anarchismus\? Denkst du dir gerade vielleicht\. Kurz gesagt:/);
  assert.match(prompt, /VISUAL_FLEXIBILITY_POLICY_VERSION: 1/);
  assert.match(prompt, /COUNTRYBALLS ARE OPTIONAL PER IMAGE/);
});

test('Anarchismus-Skript hat 362 Wörter und 25 monotone Audioanker', async () => {
  const [script, mapping] = await Promise.all([
    readFile(`${PROJECT}/01-voice-script/voice-script.txt`, 'utf8'),
    readJson(`${PROJECT}/99-technik/BILD_AUDIO_ZUORDNUNG.json`)
  ]);

  assert.equal(script.trim().split(/\s+/).length, 362);
  assert.equal(mapping.images.length, 25);
  let previous = -1;
  for (let i = 0; i < mapping.images.length; i += 1) {
    const image = mapping.images[i];
    assert.equal(image.imageNumber, i + 1);
    const position = script.indexOf(image.startAnchor);
    assert.ok(position >= 0, `Startanker fehlt bei Bild ${image.imageNumber}`);
    assert.ok(position > previous, `Startanker nicht monoton bei Bild ${image.imageNumber}`);
    previous = position;
    const next = mapping.images[i + 1];
    if (next) assert.equal(image.endAnchor, next.startAnchor);
    else assert.equal(image.endAnchor, null);
  }
});

test('alle 25 Bilder besitzen Topic Anchor und Visual Form', async () => {
  const prompt = await readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8');
  const imageBlocks = [...prompt.matchAll(/^BILD\s+(\d{2})\s+·/gim)];
  const topicAnchors = [...prompt.matchAll(/^Topic Anchor:\s*.+$/gim)];
  const visualForms = [...prompt.matchAll(/^Visual Form:\s*.+$/gim)];

  assert.equal(imageBlocks.length, 25);
  assert.deepEqual(imageBlocks.map((m) => Number(m[1])), Array.from({ length: 25 }, (_, i) => i + 1));
  assert.equal(topicAnchors.length, 25);
  assert.equal(visualForms.length, 25);
});

test('Visual Flexibility wird im echten Bildplan genutzt statt nur dokumentiert', async () => {
  const [prompt, mapping] = await Promise.all([
    readFile(`${PROJECT}/00-bildprompts/google-flow-prompt.txt`, 'utf8'),
    readJson(`${PROJECT}/99-technik/BILD_AUDIO_ZUORDNUNG.json`)
  ]);

  const forms = new Set(mapping.images.map((image) => image.visualForm));
  for (const expected of ['object-only', 'document-only', 'simple-schema', 'multi-actor', 'multi-element', 'full-scene']) {
    assert.ok(forms.has(expected), `Visual Form fehlt: ${expected}`);
  }
  assert.match(prompt, /Do NOT force a character into the frame/i);
  assert.match(prompt, /single dominant object is allowed/i);
  assert.match(prompt, /Simplicity is NOT a quality failure/i);
});

test('Anarchismus-Projekt besteht das echte Phase-1-Policy-Gate', () => {
  const result = runPhase1Gate();
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /BESTANDEN/i);
});
