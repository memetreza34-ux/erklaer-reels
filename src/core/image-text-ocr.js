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
  try { await access(filePath); return true; } catch { return false; }
}

export function normalizeImageText(value) {
  return String(value ?? '')
    .toUpperCase()
    .replace(/[^0-9A-ZÄÖÜẞ]+/gu, ' ')
    .trim()
    .replace(/\s+/gu, ' ');
}

async function buildBinary() {
  if (process.platform !== 'darwin') {
    return { available: false, reason: 'Die echte Bildtext-Prüfung nutzt macOS Vision und muss auf dem Produktions-Mac laufen.' };
  }
  if (!(await exists(SOURCE_FILE))) return { available: false, reason: `${path.relative(process.cwd(), SOURCE_FILE)} fehlt.` };

  const sourceStat = await stat(SOURCE_FILE);
  const binaryStat = (await exists(BINARY_FILE)) ? await stat(BINARY_FILE) : null;
  if (binaryStat && binaryStat.mtimeMs >= sourceStat.mtimeMs) return { available: true, binary: BINARY_FILE };

  await mkdir(path.dirname(BINARY_FILE), { recursive: true });
  try {
    await execFileAsync('swiftc', ['-O', '-o', BINARY_FILE, SOURCE_FILE], { timeout: 180_000 });
    return { available: true, binary: BINARY_FILE };
  } catch (error) {
    return { available: false, reason: `OCR-Hilfsprogramm konnte nicht gebaut werden: ${error.message}` };
  }
}

async function resolveBinary() {
  cachedBinary ??= await buildBinary();
  return cachedBinary;
}

export async function readImageTexts(filePaths) {
  const unique = [...new Set(filePaths.filter(Boolean).map((file) => path.resolve(file)))];
  const byFile = new Map();
  if (!unique.length) return { available: true, byFile };

  const tool = await resolveBinary();
  if (!tool.available) return { available: false, reason: tool.reason, byFile };

  for (let index = 0; index < unique.length; index += BATCH_SIZE) {
    const batch = unique.slice(index, index + BATCH_SIZE);
    let stdout = '';
    try {
      ({ stdout } = await execFileAsync(tool.binary, batch, { timeout: 120_000, maxBuffer: 8 * 1024 * 1024 }));
    } catch (error) {
      return { available: false, reason: `Bildtext-Prüfung brach ab: ${error.message}`, byFile };
    }

    for (const line of stdout.split('\n')) {
      if (!line.trim()) continue;
      let parsed;
      try { parsed = JSON.parse(line); } catch { continue; }
      const lines = Array.isArray(parsed.lines) ? parsed.lines : [];
      byFile.set(path.resolve(parsed.file), {
        lines,
        boxes: Array.isArray(parsed.boxes) ? parsed.boxes : [],
        text: normalizeImageText(lines.join(' ')),
        ...(parsed.error ? { error: parsed.error } : {})
      });
    }
  }
  return { available: true, byFile };
}
