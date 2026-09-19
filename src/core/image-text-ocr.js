/**
 * Liest den sichtbar gerenderten Text aus gelieferten Reel-Bildern.
 *
 * Ohne diesen Schritt prüft die Pipeline nur, ob der geplante Bildtext im PROMPT
 * steht — nie, ob er auch im BILD steht. Genau daran ist das Vetorecht-Cover
 * gescheitert: Plan und Prompt verlangten "WAS IST EIN VETORECHT?", geliefert und
 * gerendert wurde "ENTSCHEIDET DIE MEHRHEIT?", und jede Prüfung meldete bestanden.
 *
 * Das Swift-Hilfsprogramm wird einmal kompiliert und danach aus dem Cache benutzt.
 * Ist die Toolchain nicht da (kein macOS, kein swiftc), meldet dieses Modul das
 * ehrlich als "nicht verfügbar" statt stillschweigend zu bestehen.
 */

import { execFile } from 'node:child_process';
import { access, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const SOURCE_FILE = path.resolve('tools', 'ocr', 'reel-ocr.swift');
const BINARY_FILE = path.resolve('node_modules', '.cache', 'reel-ocr', 'reel-ocr');
const BATCH_SIZE = 12;

let cachedBinary;

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Vergleichsform für geplanten und erkannten Text: Groß-/Kleinschreibung,
 * Zeilenumbrüche und Satzzeichen sollen keinen Fehlalarm auslösen, Umlaute
 * dagegen sehr wohl unterschieden werden.
 */
export function normalizeImageText(value) {
  return String(value ?? '')
    .toUpperCase()
    .replace(/[^0-9A-ZÄÖÜß]+/gu, ' ')
    .trim()
    .replace(/\s+/gu, ' ');
}

async function buildBinary() {
  if (process.platform !== 'darwin') {
    return { available: false, reason: 'Die Bildtext-Prüfung nutzt das macOS-Vision-Framework und läuft nur auf macOS.' };
  }
  if (!(await exists(SOURCE_FILE))) {
    return { available: false, reason: `${path.relative(process.cwd(), SOURCE_FILE)} fehlt.` };
  }

  const sourceStat = await stat(SOURCE_FILE);
  const binaryStat = (await exists(BINARY_FILE)) ? await stat(BINARY_FILE) : null;
  if (binaryStat && binaryStat.mtimeMs >= sourceStat.mtimeMs) {
    return { available: true, binary: BINARY_FILE };
  }

  await mkdir(path.dirname(BINARY_FILE), { recursive: true });
  try {
    await execFileAsync('swiftc', ['-O', '-o', BINARY_FILE, SOURCE_FILE], { timeout: 180_000 });
    return { available: true, binary: BINARY_FILE };
  } catch (error) {
    return { available: false, reason: `Das OCR-Hilfsprogramm ließ sich nicht bauen: ${error.message}` };
  }
}

async function resolveBinary() {
  cachedBinary ??= await buildBinary();
  return cachedBinary;
}

/**
 * Liest die Textzeilen mehrerer Bilder.
 *
 * @returns {Promise<{available: boolean, reason?: string, byFile: Map<string, {lines: string[], text: string, error?: string}>}>}
 */
export async function readImageTexts(filePaths) {
  const unique = [...new Set(filePaths.filter(Boolean))];
  const byFile = new Map();
  if (unique.length === 0) return { available: true, byFile };

  const tool = await resolveBinary();
  if (!tool.available) return { available: false, reason: tool.reason, byFile };

  for (let index = 0; index < unique.length; index += BATCH_SIZE) {
    const batch = unique.slice(index, index + BATCH_SIZE);
    let stdout = '';
    try {
      ({ stdout } = await execFileAsync(tool.binary, batch, { timeout: 120_000, maxBuffer: 8 * 1024 * 1024 }));
    } catch (error) {
      return { available: false, reason: `Die Bildtext-Prüfung brach ab: ${error.message}`, byFile };
    }

    for (const line of stdout.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let parsed;
      try { parsed = JSON.parse(trimmed); } catch { continue; }
      const lines = Array.isArray(parsed.lines) ? parsed.lines : [];
      byFile.set(parsed.file, {
        lines,
        // Normalisierte Lage jedes Textstücks, Ursprung oben links, 0..1.
        boxes: Array.isArray(parsed.boxes) ? parsed.boxes : [],
        text: normalizeImageText(lines.join(' ')),
        ...(parsed.error ? { error: parsed.error } : {})
      });
    }
  }

  return { available: true, byFile };
}
