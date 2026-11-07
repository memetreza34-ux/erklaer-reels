import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_PRESET,
  VOICE_PRESETS,
  normalizeGermanScriptForTts,
  resolveVoiceConfig,
  splitScriptIntoParagraphs
} from '../src/core/youtube-voice-generator.js';

test('VOICE_PRESETS enthält alle Standardstimmen für Weltlogik', () => {
  assert.ok(VOICE_PRESETS['weltlogik-alte-stimme-klon']);
  assert.ok(VOICE_PRESETS['weltlogik-explainer-storyteller']);
  assert.ok(VOICE_PRESETS['weltlogik-signature']);
  assert.ok(VOICE_PRESETS['weltlogik-conrad']);

  const klon = VOICE_PRESETS['weltlogik-alte-stimme-klon'];
  assert.equal(klon.engine, 'qwen3-voice-design');
  assert.equal(klon.persona, 'alte-kanalstimme');
  assert.equal(klon.atempo, 1.05);
  assert.equal(klon.max_pause, 0.25);
  assert.equal(DEFAULT_PRESET, 'weltlogik-alte-stimme-klon');
});

test('resolveVoiceConfig verwendet Klon-Preset als Fallback und erlaubt Overrides', () => {
  const defaultConfig = resolveVoiceConfig();
  assert.equal(defaultConfig.preset, 'weltlogik-alte-stimme-klon');
  assert.equal(defaultConfig.engine, 'qwen3-voice-design');
  assert.equal(defaultConfig.persona, 'alte-kanalstimme');
  assert.equal(defaultConfig.atempo, 1.05);

  const conradConfig = resolveVoiceConfig({ preset: 'weltlogik-conrad' });
  assert.equal(conradConfig.preset, 'weltlogik-conrad');
  assert.equal(conradConfig.voice, 'de-DE-ConradNeural');

  const customConfig = resolveVoiceConfig({
    preset: 'weltlogik-signature',
    rate: '+8%',
    pitch: '-2Hz'
  });
  assert.equal(customConfig.rate, '+8%');
  assert.equal(customConfig.pitch, '-2Hz');
});

test('normalizeGermanScriptForTts entfernt Regieanweisungen und bereinigt Markdown', () => {
  const input = `
# Überschrift 1
[Szene 01: Karte von Europa]
(Pause)
Hier beginnt der Text. (flüstert leise)
[Musik fade out]
Und hier geht es weiter.
`;
  const normalized = normalizeGermanScriptForTts(input);
  assert.ok(!normalized.includes('#'));
  assert.ok(!normalized.includes('[Szene 01'));
  assert.ok(!normalized.includes('(Pause)'));
  assert.ok(!normalized.includes('[Musik'));
  assert.match(normalized, /Hier beginnt der Text\.\s+Und hier geht es weiter\./);
});

test('normalizeGermanScriptForTts expandiert geopolitische Akronyme und Abkürzungen sauber', () => {
  const input = 'Das UN-Veto im UN-Sicherheitsrat. Die USA und die UdSSR schlossen ein Abkommen. Die EU berät mit z. B. 10 Mrd. Euro ca. 50% mehr.';
  const normalized = normalizeGermanScriptForTts(input);

  assert.ok(normalized.includes('U-N-Veto'));
  assert.ok(normalized.includes('U-N-Sicherheitsrat'));
  assert.ok(normalized.includes('U-S-A'));
  assert.ok(normalized.includes('U-d-S-S-R'));
  assert.ok(normalized.includes('E-U'));
  assert.ok(normalized.includes('zum Beispiel'));
  assert.ok(normalized.includes('Milliarden'));
  assert.ok(normalized.includes('circa'));
  assert.ok(normalized.includes('Prozent'));
});

test('splitScriptIntoParagraphs teilt Text sauber in logische Absätze und nummerierte Chunks', () => {
  const text = `Absatz eins ist kurz.

Absatz zwei erklärt den zweiten Gedanken.

Absatz drei beendet die Szene.`;

  const chunks = splitScriptIntoParagraphs(text);
  assert.equal(chunks.length, 3);
  assert.equal(chunks[0].id, 0);
  assert.equal(chunks[0].text, 'Absatz eins ist kurz.');
  assert.equal(chunks[1].id, 1);
  assert.equal(chunks[2].id, 2);
});

test('splitScriptIntoParagraphs teilt überlange Absätze an Satzgrenzen auf', () => {
  const longSentences = Array.from({ length: 40 }, (_, i) => `Satz Nummer ${i + 1} beschreibt wichtige Vorgänge in der Geopolitik.`).join(' ');
  const chunks = splitScriptIntoParagraphs(longSentences, 50);

  assert.ok(chunks.length > 1);
  for (const chunk of chunks) {
    const words = chunk.text.split(/\s+/).filter(Boolean);
    assert.ok(words.length <= 60);
  }
});
