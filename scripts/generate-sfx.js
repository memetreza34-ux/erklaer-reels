#!/usr/bin/env node
/**
 * Erzeugt die Soundeffekte der Bibliothek synthetisch.
 *
 * Warum synthetisch: Diese kurzen UI-artigen Effekte lassen sich sauber berechnen.
 * Dadurch sind sie lizenzfrei, immer identisch reproduzierbar, kurz genug für das
 * Voice-over und frei von Rauschen, Musikbett oder Sprachanteilen.
 *
 * Aufruf: node scripts/generate-sfx.js [--force]
 */

import { execFile } from 'node:child_process';
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const RATE = 44100;

// Fester Seed: derselbe Lauf erzeugt immer exakt dieselben Dateien.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296 * 2 - 1;
  };
}

const lerp = (a, b, t) => a + (b - a) * t;

// Exponentieller Abfall mit kurzer Anstiegsflanke — verhindert Knacken am Start.
function envelope(i, total, { attack = 0.005, decay = 3 } = {}) {
  const t = i / total;
  const attackSamples = Math.max(1, Math.floor(attack * RATE));
  const rise = i < attackSamples ? i / attackSamples : 1;
  return rise * Math.exp(-decay * t);
}

// State Variable Filter: liefert Tief-, Band- und Hochpass in einem Durchlauf.
function svf(input, cutoffAt, q = 1.2, mode = 'band') {
  const out = new Float64Array(input.length);
  let low = 0;
  let band = 0;
  for (let i = 0; i < input.length; i += 1) {
    const cutoff = Math.max(20, Math.min(RATE / 2.2, cutoffAt(i / input.length)));
    const f = 2 * Math.sin(Math.PI * cutoff / RATE);
    const damp = Math.min(1.8, 1 / q);
    const high = input[i] - low - damp * band;
    band += f * high;
    low += f * band;
    out[i] = mode === 'low' ? low : mode === 'high' ? high : band;
  }
  return out;
}

function noise(length, seed) {
  const random = rng(seed);
  const out = new Float64Array(length);
  for (let i = 0; i < length; i += 1) out[i] = random();
  return out;
}

// Sinus mit gleitender Frequenz; die Phase wird integriert, sonst entstehen Sprünge.
function sweepTone(length, fromHz, toHz, { curve = 1 } = {}) {
  const out = new Float64Array(length);
  let phase = 0;
  for (let i = 0; i < length; i += 1) {
    const t = Math.pow(i / length, curve);
    const freq = lerp(fromHz, toHz, t);
    phase += (2 * Math.PI * freq) / RATE;
    out[i] = Math.sin(phase);
  }
  return out;
}

function samples(seconds) {
  return Math.floor(seconds * RATE);
}

function mix(target, source, gain = 1) {
  for (let i = 0; i < target.length && i < source.length; i += 1) target[i] += source[i] * gain;
  return target;
}

function applyEnvelope(buffer, options) {
  for (let i = 0; i < buffer.length; i += 1) buffer[i] *= envelope(i, buffer.length, options);
  return buffer;
}

// Auf einen festen Spitzenpegel bringen und die letzten Millisekunden ausblenden.
function finish(buffer, peak = 0.7) {
  let max = 0;
  for (const value of buffer) max = Math.max(max, Math.abs(value));
  const gain = max > 0 ? peak / max : 0;
  const fade = Math.min(buffer.length, samples(0.008));
  for (let i = 0; i < buffer.length; i += 1) {
    let value = buffer[i] * gain;
    const fromEnd = buffer.length - i;
    if (fromEnd < fade) value *= fromEnd / fade;
    buffer[i] = Math.max(-1, Math.min(1, value));
  }
  return buffer;
}

const recipes = {
  'pop': () => {
    const n = samples(0.09);
    const body = applyEnvelope(sweepTone(n, 880, 190, { curve: 0.45 }), { attack: 0.001, decay: 7 });
    const air = applyEnvelope(svf(noise(n, 11), () => 2200, 1.5, 'band'), { attack: 0.0005, decay: 22 });
    return finish(mix(body, air, 0.18));
  },
  'click': () => {
    const n = samples(0.03);
    const tick = applyEnvelope(svf(noise(n, 23), () => 3800, 2.2, 'band'), { attack: 0.0004, decay: 30 });
    const edge = applyEnvelope(sweepTone(n, 2400, 1400, { curve: 0.5 }), { attack: 0.0004, decay: 26 });
    return finish(mix(tick, edge, 0.5), 0.6);
  },
  'tick': () => {
    const n = samples(0.045);
    const wood = applyEnvelope(sweepTone(n, 1500, 700, { curve: 0.4 }), { attack: 0.0006, decay: 20 });
    const grain = applyEnvelope(svf(noise(n, 37), () => 2600, 1.8, 'band'), { attack: 0.0005, decay: 26 });
    return finish(mix(wood, grain, 0.35), 0.6);
  },
  'soft-whoosh': () => {
    const n = samples(0.42);
    // Bandpass fährt hoch und wieder herunter: das ergibt die Vorbeiflug-Bewegung.
    const swept = svf(noise(n, 53), (t) => 320 + 2600 * Math.sin(Math.PI * t), 1.1, 'band');
    for (let i = 0; i < n; i += 1) {
      const t = i / n;
      swept[i] *= Math.sin(Math.PI * t) ** 1.6;
    }
    return finish(swept, 0.55);
  },
  'soft-impact': () => {
    const n = samples(0.26);
    const thump = applyEnvelope(sweepTone(n, 150, 46, { curve: 0.35 }), { attack: 0.002, decay: 9 });
    const dust = applyEnvelope(svf(noise(n, 71), () => 900, 1.2, 'low'), { attack: 0.001, decay: 16 });
    return finish(mix(thump, dust, 0.3));
  },
  'paper': () => {
    const n = samples(0.3);
    const sheet = svf(noise(n, 97), () => 4200, 0.9, 'high');
    // Unregelmäßige Amplitude erzeugt das Rascheln statt eines gleichmäßigen Zischens.
    const flutter = rng(101);
    let level = 0;
    for (let i = 0; i < n; i += 1) {
      level = level * 0.986 + Math.abs(flutter()) * 0.014;
      sheet[i] *= level * Math.sin(Math.PI * (i / n)) ** 0.7;
    }
    return finish(sheet, 0.5);
  },
  'swoosh-reveal': () => {
    const n = samples(0.5);
    const rise = svf(noise(n, 131), (t) => 400 + 3400 * t, 1.3, 'band');
    for (let i = 0; i < n; i += 1) rise[i] *= Math.pow(i / n, 1.4) * (1 - Math.pow(i / n, 6));
    const shimmer = applyEnvelope(sweepTone(n, 1200, 2600, { curve: 1.6 }), { attack: 0.05, decay: 4 });
    return finish(mix(rise, shimmer, 0.22), 0.6);
  },
  'door': () => {
    const n = samples(0.34);
    const thud = applyEnvelope(sweepTone(n, 190, 62, { curve: 0.4 }), { attack: 0.003, decay: 8 });
    const latch = new Float64Array(n);
    const latchStart = samples(0.02);
    const latchLen = samples(0.05);
    const latchTone = applyEnvelope(sweepTone(latchLen, 2100, 1200, { curve: 0.5 }), { attack: 0.0005, decay: 18 });
    for (let i = 0; i < latchLen && latchStart + i < n; i += 1) latch[latchStart + i] = latchTone[i];
    return finish(mix(thud, latch, 0.4));
  },
  'coin': () => {
    const n = samples(0.36);
    const out = new Float64Array(n);
    // Zwei versetzte hohe Töne klingen nach Metall, nicht nach einem Piepser.
    for (const [delay, freq, gain] of [[0, 3150, 1], [0.035, 2450, 0.7], [0.07, 3800, 0.45]]) {
      const start = samples(delay);
      const len = n - start;
      if (len <= 0) continue;
      const tone = applyEnvelope(sweepTone(len, freq, freq * 0.94, { curve: 1 }), { attack: 0.0008, decay: 11 });
      for (let i = 0; i < len; i += 1) out[start + i] += tone[i] * gain;
    }
    return finish(out, 0.55);
  },
  'whoosh-up': () => {
    const n = samples(0.38);
    // Aufsteigender Bandpass: liest sich als Steigerung, ohne lauter zu werden.
    const swept = svf(noise(n, 191), (t) => 300 + 3200 * Math.pow(t, 1.5), 1.2, 'band');
    for (let i = 0; i < n; i += 1) {
      const t = i / n;
      swept[i] *= Math.pow(t, 0.8) * (1 - Math.pow(t, 5));
    }
    return finish(swept, 0.52);
  },
  'whoosh-down': () => {
    const n = samples(0.38);
    const swept = svf(noise(n, 211), (t) => 3200 - 2700 * Math.pow(t, 1.2), 1.2, 'band');
    for (let i = 0; i < n; i += 1) {
      const t = i / n;
      swept[i] *= Math.pow(1 - t, 0.5) * Math.min(1, t * 12);
    }
    return finish(swept, 0.52);
  },
  'soft-swipe': () => {
    const n = samples(0.18);
    // Kurz und trocken: markiert den Schnitt, ohne eine Richtung zu behaupten.
    const swipe = svf(noise(n, 233), (t) => 1400 + 900 * Math.sin(Math.PI * t), 1.4, 'band');
    for (let i = 0; i < n; i += 1) swipe[i] *= Math.sin(Math.PI * (i / n)) ** 1.3;
    return finish(swipe, 0.45);
  },
  'water-drop': () => {
    const n = samples(0.16);
    // Aufwärts-Bend ist das, was ein Tropfen hörbar von einem Pop unterscheidet.
    const drop = applyEnvelope(sweepTone(n, 420, 1650, { curve: 1.9 }), { attack: 0.001, decay: 12 });
    const splash = applyEnvelope(svf(noise(n, 167), () => 3000, 1.6, 'band'), { attack: 0.0006, decay: 26 });
    return finish(mix(drop, splash, 0.16), 0.6);
  }
};

function toWav(buffer) {
  const data = Buffer.alloc(buffer.length * 2);
  for (let i = 0; i < buffer.length; i += 1) data.writeInt16LE(Math.round(buffer[i] * 32767), i * 2);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const force = process.argv.includes('--force');
  const library = JSON.parse(await readFile(path.join(REPO_ROOT, 'config', 'sound-library.json'), 'utf8'));
  const outDirectory = path.join(REPO_ROOT, library.libraryDirectory);
  await mkdir(outDirectory, { recursive: true });

  for (const entry of library.types) {
    const recipe = recipes[entry.type];
    if (!recipe) {
      console.log(`übersprungen: für "${entry.type}" gibt es kein Rezept`);
      continue;
    }

    const target = path.join(outDirectory, entry.file);
    if (!force && (await exists(target))) {
      console.log(`vorhanden:   ${entry.file}`);
      continue;
    }

    const wavPath = `${target}.wav`;
    await writeFile(wavPath, toWav(recipe()));
    await execFileAsync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wavPath, '-codec:a', 'libmp3lame', '-b:a', '192k', target]);
    await rm(wavPath, { force: true });
    console.log(`erzeugt:     ${entry.file}`);
  }
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
