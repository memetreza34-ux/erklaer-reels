import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { validateYoutubeScriptOpening } from '../src/core/youtube-script-opening.js';

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

test('akzeptiert einen konkreten Story-/Szenen-Einstieg ohne feste Frageformel', async () => {
  const policy = await readJson('config/youtube-channel-policy.json');
  const script = 'Berlin, Juni 1948. Über Nacht werden Straßen, Bahnlinien und Wasserwege nach West-Berlin blockiert. Plötzlich hängt die Versorgung von mehr als zwei Millionen Menschen davon ab, ob Flugzeuge schnell genug Lebensmittel und Kohle in die Stadt bringen können. Genau an dieser Krise lässt sich verstehen, warum aus den Verbündeten des Zweiten Weltkriegs Gegner im Kalten Krieg wurden.';
  const result = validateYoutubeScriptOpening(script, policy.scriptOpeningPolicy);
  assert.equal(result.passed, true, result.errors.join('\n'));
});

test('akzeptiert einen überraschenden Fakt als Einstieg', async () => {
  const policy = await readJson('config/youtube-channel-policy.json');
  const script = 'Fast ein halbes Jahrhundert standen sich zwei Supermächte gegenüber, ohne einander direkt den Krieg zu erklären. Gleichzeitig starben in Stellvertreterkriegen Millionen Menschen. Wie konnte ein Konflikt gleichzeitig „kalt“ heißen und so gefährlich sein? Die Antwort führt von Europa nach 1945 bis an den Rand eines Atomkriegs.';
  const result = validateYoutubeScriptOpening(script, policy.scriptOpeningPolicy);
  assert.equal(result.passed, true, result.errors.join('\n'));
});

test('akzeptiert weiterhin eine starke direkte Frage, aber ohne Pflicht-Floskel', async () => {
  const policy = await readJson('config/youtube-channel-policy.json');
  const script = 'Wie konnten die USA und die Sowjetunion gemeinsam Hitler besiegen und nur wenige Jahre später zu erbitterten Rivalen werden? Der entscheidende Punkt war nicht ein einzelnes Ereignis, sondern eine Kette aus Sicherheitsängsten, Machtpolitik und völlig unterschiedlichen Vorstellungen davon, wie Europa nach 1945 aussehen sollte.';
  const result = validateYoutubeScriptOpening(script, policy.scriptOpeningPolicy);
  assert.equal(result.passed, true, result.errors.join('\n'));
});

test('blockiert abstrakten Schulbuch-Einstieg', async () => {
  const policy = await readJson('config/youtube-channel-policy.json');
  const script = 'Nationalismus gehört zu den Begriffen, die fast jeder kennt, aber nicht jeder gleich meint. Historisch betrachtet gibt es verschiedene Ausprägungen und Definitionen.';
  const result = validateYoutubeScriptOpening(script, policy.scriptOpeningPolicy);
  assert.equal(result.passed, false);
  assert.ok(result.errors.some((error) => /abstrakte Definition/i.test(error)));
});

test('blockiert generische Video-Ansage statt inhaltlichem Hook', async () => {
  const policy = await readJson('config/youtube-channel-policy.json');
  const script = 'In diesem Video erklären wir dir den Kalten Krieg. Danach schauen wir uns die wichtigsten Ereignisse Schritt für Schritt an.';
  const result = validateYoutubeScriptOpening(script, policy.scriptOpeningPolicy);
  assert.equal(result.passed, false);
  assert.ok(result.errors.some((error) => /generischen Video-Ansage/i.test(error)));
});

test('blockiert nicht ausgefüllte Opening-Platzhalter', async () => {
  const policy = await readJson('config/youtube-channel-policy.json');
  const script = '[HOOK] Danach kommt die eigentliche Erklärung.';
  const result = validateYoutubeScriptOpening(script, policy.scriptOpeningPolicy);
  assert.equal(result.passed, false);
  assert.ok(result.errors.some((error) => /Platzhalter/i.test(error)));
});

test('Template verlangt für zukünftige Schema-14-Projekte flexible Hooks plus Script Quality V1', async () => {
  const [policy, meta, scriptTemplate, workflow] = await Promise.all([
    readJson('config/youtube-channel-policy.json'),
    readJson('youtube/templates/video-template/99-technik/video.json'),
    readFile('youtube/templates/video-template/01-voice-script/voice-script.txt', 'utf8'),
    readFile('youtube/YOUTUBE_WORKFLOW.md', 'utf8')
  ]);

  assert.equal(policy.scriptOpeningPolicyVersion, 1);
  assert.equal(policy.scriptQualityPolicyVersion, 1);
  assert.equal(policy.scriptOpeningPolicy.directQuestionRequiredAtStart, false);
  assert.equal(policy.scriptOpeningPolicy.viewerThoughtPhraseRequired, false);
  assert.equal(policy.scriptOpeningPolicy.sameOpeningPatternAcrossConsecutiveVideosForbidden, true);
  assert.equal(meta.schemaVersion, 14);
  assert.equal(meta.scriptOpeningPolicyVersion, 1);
  assert.equal(meta.scriptQualityPolicyVersion, 1);
  assert.equal(meta.scriptQualityPolicy.legacyQuestionThoughtShortAnswerTemplateForbidden, true);
  assert.equal(meta.scriptQualityPolicy.causalExplanationRequired, true);
  assert.equal(meta.explicitScriptOpeningOverride, false);
  assert.match(scriptTemplate, /konkrete Szene\/Mini-Geschichte/i);
  assert.match(scriptTemplate, /kein festes Satzmuster/i);
  assert.match(workflow, /SCRIPT OPENING V1 — HARD LOCK/);
  assert.match(workflow, /Mini-Geschichte|konkrete Szene/i);
});
