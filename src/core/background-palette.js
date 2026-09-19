/**
 * Misst die Hintergrundfarbe eines gelieferten Bildes und prüft sie gegen die
 * feste Palette der Bildwelt.
 *
 * Der World-Lock hat "solid or muted colour field" verlangt, aber keine Farben
 * genannt. Im Vetorecht-Reel wanderten die Hintergründe deshalb über 64 Sekunden
 * durch Navy, Creme, Schiefer, Violett, Rosa, Lachs, Hellblau, Oliv und Mint —
 * die Serie wirkt dadurch zusammengewürfelt statt wie ein Kanal.
 *
 * Eine Palette im Prompt ist eine Bitte. Erst diese Messung macht sie
 * verbindlich.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const SAMPLE_GRID = 8;

function hexToRgb(hex) {
  const value = String(hex).replace('#', '');
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
}

function toLinear(channel) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function rgbToLab([r, g, b]) {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const x = (0.4124 * lr + 0.3576 * lg + 0.1805 * lb) / 0.95047;
  const y = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  const z = (0.0193 * lr + 0.1192 * lg + 0.9505 * lb) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function deltaE(rgbA, rgbB) {
  const a = rgbToLab(rgbA);
  const b = rgbToLab(rgbB);
  return Math.sqrt(a.reduce((sum, value, index) => sum + (value - b[index]) ** 2, 0));
}

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[middle - 1] + sorted[middle]) / 2) : sorted[middle];
};

/**
 * Liest die dominante Randfarbe. Der Rand statt der Bildmitte, weil dort das
 * Motiv sitzt; der Median statt des Mittelwerts, damit ein Objekt, das bis an
 * den Rand reicht, das Ergebnis nicht verzieht.
 */
export async function readBackgroundColour(imagePath) {
  let raw;
  try {
    const { stdout } = await execFileAsync(
      'ffmpeg',
      ['-v', 'error', '-i', imagePath, '-vf', `scale=${SAMPLE_GRID}:${SAMPLE_GRID}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
      { timeout: 60_000, maxBuffer: 1024 * 1024, encoding: 'buffer' }
    );
    raw = stdout;
  } catch (error) {
    return { available: false, reason: `Die Hintergrundfarbe konnte nicht gelesen werden: ${error.message}` };
  }

  if (!raw || raw.length < SAMPLE_GRID * SAMPLE_GRID * 3) {
    return { available: false, reason: 'ffmpeg hat keine auswertbaren Bildpunkte geliefert.' };
  }

  const ring = [];
  for (let row = 0; row < SAMPLE_GRID; row += 1) {
    for (let column = 0; column < SAMPLE_GRID; column += 1) {
      const onBorder = row === 0 || column === 0 || row === SAMPLE_GRID - 1 || column === SAMPLE_GRID - 1;
      if (!onBorder) continue;
      const offset = (row * SAMPLE_GRID + column) * 3;
      ring.push([raw[offset], raw[offset + 1], raw[offset + 2]]);
    }
  }

  const rgb = [0, 1, 2].map((channel) => median(ring.map((pixel) => pixel[channel])));
  const hex = `#${rgb.map((value) => value.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
  return { available: true, rgb, hex };
}

/**
 * @returns {Promise<{available: boolean, reason?: string, hex?: string, nearest?: string, deltaE?: number, withinPalette?: boolean}>}
 */
export async function checkBackgroundPalette(imagePath, paletteRules = {}) {
  const colours = Array.isArray(paletteRules.colours) ? paletteRules.colours : [];
  if (colours.length === 0) return { available: false, reason: 'Für die Bildwelt ist keine Hintergrundpalette definiert.' };

  const measured = await readBackgroundColour(imagePath);
  if (!measured.available) return measured;

  const maximumDeltaE = Number(paletteRules.maximumDeltaE ?? 12);
  let nearest = null;
  let smallest = Number.POSITIVE_INFINITY;
  for (const colour of colours) {
    const distance = deltaE(measured.rgb, hexToRgb(colour.hex));
    if (distance < smallest) {
      smallest = distance;
      nearest = colour;
    }
  }

  return {
    available: true,
    hex: measured.hex,
    nearest: nearest?.name ?? null,
    nearestHex: nearest?.hex ?? null,
    deltaE: Number(smallest.toFixed(1)),
    maximumDeltaE,
    withinPalette: smallest <= maximumDeltaE
  };
}
