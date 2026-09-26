import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { validateYoutubeScriptOpening } from '../src/core/youtube-script-opening.js';

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

test('akzeptiert direkten Zuschauerfrage-Einstieg mit Kurzantwort und Leitfrage', async () => {
  const policy = await readJson('config/youtube-channel-policy.json');
  const script = 'Was ist Nationalismus? Denkst du dir gerade vielleicht. Kurz gesagt: Nationalismus macht die Nation zu einem zentralen politischen Bezugspunkt. Aber was bedeutet das genau – und wo liegt der Unterschied zu Patriotismus? Danach geht die Erklärung weiter.';
  const result = validateYoutubeScriptOpening(script, policy.scriptOpeningPolicy);
  assert.equal(result.passed, true, result.errors.join('\n'));
});

test('blockiert abstrakten Schulbuch-Einstieg wie beim alten Nationalismus-Skript', async () => {
  const policy = await readJson('config/youtube-channel-policy.json');
  const script = 'Nationalismus gehört zu den Begriffen, die fast jeder kennt, aber nicht jeder gleich meint. Ist Nationalismus einfach nur Liebe zum eigenen Land – oder steckt dahinter eine politische Ideologie?';
  const result = validateYoutubeScriptOpening(script, policy.scriptOpeningPolicy);
  assert.equal(result.passed, false);
  assert.ok(result.errors.some((error) => /direkt mit einer echten Videofrage|zu spät|Denkst du dir gerade vielleicht/i.test(error)));
});

test('blockiert Hook ohne kurze Antwort oder zweite Leitfrage', async () => {
  const policy = await readJson('config/youtube-channel-policy.json');
  const script = 'Was ist Nationalismus? Denkst du dir gerade vielleicht. Nationalismus ist eine politische Idee.';
  const result = validateYoutubeScriptOpening(script, policy.scriptOpeningPolicy);
  assert.equal(result.passed, false);
  assert.ok(result.errors.some((error) => /Erstantwort/i.test(error)));
});

test('Template aktiviert Script Opening Policy V1 für zukünftige Projekte', async () => {
  const [policy, meta, scriptTemplate, workflow] = await Promise.all([
    readJson('config/youtube-channel-policy.json'),
    readJson('youtube/templates/video-template/99-technik/video.json'),
    readFile('youtube/templates/video-template/01-voice-script/voice-script.txt', 'utf8'),
    readFile('youtube/YOUTUBE_WORKFLOW.md', 'utf8')
  ]);

  assert.equal(policy.scriptOpeningPolicyVersion, 1);
  assert.equal(meta.schemaVersion, 11);
  assert.equal(meta.scriptOpeningPolicyVersion, 1);
  assert.equal(meta.explicitScriptOpeningOverride, false);
  assert.match(scriptTemplate, /^\[DIREKTE VIDEOFRAGE\]\? Denkst du dir gerade vielleicht\./);
  assert.match(workflow, /SCRIPT OPENING V1 — HARD LOCK/);
});
