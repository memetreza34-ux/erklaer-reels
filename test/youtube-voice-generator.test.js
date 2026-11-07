import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  DEFAULT_PRESET,
  VOICE_PRESETS,
  buildVoiceBoostFilter,
  formatAtempoFilter,
  generateYoutubeVoiceover,
  loadVoicePolicy,
  normalizeGermanScriptForTts,
  parseProfileTempo,
  resolveRepoPath,
  resolveVoiceConfig,
  splitScriptIntoParagraphs
} from '../src/core/youtube-voice-generator.js';

test('VOICE_PRESETS enthält ausschließlich die kalibrierte Master-Stimme stickman-user-clone', () => {
  const keys = Object.keys(VOICE_PRESETS);
  assert.deepEqual(keys, ['stickman-user-clone']);
  assert.equal(DEFAULT_PRESET, 'stickman-user-clone');

  // Alte Stimmen müssen restlos gelöscht sein
  assert.equal(VOICE_PRESETS['weltlogik-alte-stimme-klon'], undefined);
  assert.equal(VOICE_PRESETS['weltlogik-explainer-storyteller'], undefined);
  assert.equal(VOICE_PRESETS['weltlogik-signature'], undefined);
  assert.equal(VOICE_PRESETS['weltlogik-conrad'], undefined);
  assert.equal(VOICE_PRESETS['weltlogik-florian-studio'], undefined);

  const klon = VOICE_PRESETS['stickman-user-clone'];
  assert.equal(klon.engine, 'qwen-mlx');
  assert.equal(klon.provider, 'qwen-mlx');
  assert.equal(klon.voice, 'stickman-user-clone');
  assert.equal(klon.tempo, 0.95);
  assert.equal(klon.atempo, 0.95);
  assert.equal(klon.rate, '-5%');
  assert.equal(klon.maxPauseSeconds, 0.30);
  assert.equal(klon.preStretchMaxPauseSeconds, 0.285);
  assert.equal(klon.maxWordsPerChunk, 32);
  assert.equal(klon.temperature, 0.7);
});

test('config/voice-policy.json und Master-Referenzdateien existieren und sind vollständig kalibriert', async () => {
  const policy = await loadVoicePolicy();
  assert.equal(policy.defaultProfile, 'stickman-user-clone');
  assert.deepEqual(Object.keys(policy.profiles), ['stickman-user-clone']);

  const profile = policy.profiles['stickman-user-clone'];
  assert.equal(profile.provider, 'qwen-mlx');
  assert.equal(profile.tempo, 0.95);
  assert.equal(profile.rate, '-5%');
  assert.equal(profile.maxPauseSeconds, 0.30);
  assert.equal(profile.preStretchMaxPauseSeconds, 0.285);
  assert.equal(profile.maxWordsPerChunk, 32);
  assert.equal(profile.temperature, 0.7);

  const refWavPath = resolveRepoPath(profile.refAudio);
  const refMetaPath = resolveRepoPath(profile.refMetadata);
  const wavStat = await stat(refWavPath);
  assert.ok(wavStat.size > 800_000, 'Master-Referenz-WAV muss vorhanden und vollständig sein');

  const refMeta = JSON.parse(await readFile(refMetaPath, 'utf8'));
  assert.equal(refMeta.voiceId, 'stickman-user-clone');
  assert.equal(refMeta.sampleRateHz, 24000);
  assert.equal(refMeta.channels, 1);
  assert.equal(refMeta.synthesisConfig.tempo, 0.95);
  assert.equal(refMeta.synthesisConfig.maxPauseSeconds, 0.30);

  const policyFilter = buildVoiceBoostFilter(policy.voiceBoost);
  assert.ok(!policyFilter.includes('[object Object]'));
  assert.ok(policyFilter.includes('highpass=f=75'));
  assert.ok(policyFilter.includes('equalizer=f=180:t=q:w=1.2:g=2.2'));

  // Alte edge_tts_bridge.py darf nicht mehr existieren
  await assert.rejects(access(resolveRepoPath('scripts', 'edge_tts_bridge.py')));
});

test('resolveVoiceConfig verwendet stickman-user-clone als Standard und erlaubt Tempo-/Pausen-Overrides', () => {
  const defaultConfig = resolveVoiceConfig();
  assert.equal(defaultConfig.preset, 'stickman-user-clone');
  assert.equal(defaultConfig.engine, 'qwen-mlx');
  assert.equal(defaultConfig.voice, 'stickman-user-clone');
  assert.equal(defaultConfig.tempo, 0.95);
  assert.equal(defaultConfig.rate, '-5%');
  assert.equal(defaultConfig.maxPauseSeconds, 0.30);
  assert.equal(defaultConfig.preStretchMaxPauseSeconds, 0.285);
  assert.equal(defaultConfig.maxWordsPerChunk, 32);

  // Unbekannte alte Presets fallen sicher auf stickman-user-clone zurück
  const fallbackConfig = resolveVoiceConfig({ preset: 'weltlogik-conrad' });
  assert.equal(fallbackConfig.preset, 'stickman-user-clone');
  assert.equal(fallbackConfig.voice, 'stickman-user-clone');

  const customConfig = resolveVoiceConfig({
    rate: '-8%',
    maxPauseSeconds: 0.25
  });
  assert.equal(customConfig.tempo, 0.92);
  assert.equal(customConfig.maxPauseSeconds, 0.25);
  assert.equal(customConfig.preStretchMaxPauseSeconds, 0.23);
});

test('parseProfileTempo, formatAtempoFilter und buildVoiceBoostFilter erzeugen valide Filterketten', () => {
  assert.equal(parseProfileTempo({ tempo: 0.95 }), 0.95);
  assert.equal(parseProfileTempo({ rate: '-5%' }), 0.95);
  assert.equal(parseProfileTempo({ tempo: 0.95 }, { tempo: 1.0 }), 1.0);
  assert.equal(formatAtempoFilter(0.95), 'atempo=0.95');
  assert.equal(formatAtempoFilter(1.0), null);

  const filter = buildVoiceBoostFilter();
  assert.ok(!filter.includes('[object Object]'));
  assert.ok(filter.includes('highpass=f=75'));
  assert.ok(filter.includes('deesser='));
  assert.ok(filter.includes('asoftclip=type=tanh'));
  assert.ok(filter.includes('alimiter=limit=0.92'));
});

test('normalizeGermanScriptForTts entfernt Regieanweisungen und bereinigt Markdown sowie leere Eingaben', () => {
  assert.equal(normalizeGermanScriptForTts(''), '');
  assert.equal(normalizeGermanScriptForTts(null), '');

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
  const input =
    'Das UN-Veto im UN-Sicherheitsrat. Die USA und die UdSSR schlossen ein Abkommen. Die EU berät mit z. B. 10 Mrd. Euro ca. 50% mehr.';
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

test('splitScriptIntoParagraphs teilt Text standardmäßig in <= 32 Wörter pro Chunk auf', () => {
  const text = `Absatz eins ist kurz.

Absatz zwei erklärt den zweiten Gedanken.

Absatz drei beendet die Szene.`;

  const chunks = splitScriptIntoParagraphs(text);
  assert.equal(chunks.length, 3);
  assert.equal(chunks[0].id, 0);
  assert.equal(chunks[0].text, 'Absatz eins ist kurz.');
  assert.equal(chunks[1].id, 1);
  assert.equal(chunks[2].id, 2);

  const longSentences = Array.from(
    { length: 20 },
    (_, i) => `Satz Nummer ${i + 1} beschreibt wichtige Vorgänge in der Geopolitik.`
  ).join(' ');
  const splitChunks = splitScriptIntoParagraphs(longSentences);
  assert.ok(splitChunks.length > 4);
  for (const chunk of splitChunks) {
    const words = chunk.text.split(/\s+/).filter(Boolean);
    assert.ok(words.length <= 32, `Chunk überschreitet 32 Wörter: ${words.length}`);
  }
});

test('generateYoutubeVoiceover unterstützt --dry-run und prüft fehlende Skriptdateien', async () => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'erklaer-voice-test-'));
  try {
    await assert.rejects(
      generateYoutubeVoiceover(tmpDir, { dryRun: true }),
      /Voice-Script fehlt/
    );

    const scriptDir = path.join(tmpDir, '01-voice-script');
    await mkdir(scriptDir, { recursive: true });
    await writeFile(
      path.join(scriptDir, 'voice-script.txt'),
      'Das UN-Veto blockiert z. B. 50% der Beschlüsse im Sicherheitsrat.\n\nDoch warum existiert dieses Recht überhaupt?',
      'utf8'
    );

    const dry = await generateYoutubeVoiceover(tmpDir, { dryRun: true });
    assert.equal(dry.dryRun, true);
    assert.equal(dry.config.preset, 'stickman-user-clone');
    assert.equal(dry.config.tempo, 0.95);
    assert.equal(dry.config.maxPauseSeconds, 0.30);
    assert.equal(dry.totalChunks, 2);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
});
