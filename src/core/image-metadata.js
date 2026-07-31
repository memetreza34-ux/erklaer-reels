import { readFile } from 'node:fs/promises';
import path from 'node:path';

function pngMetadata(buffer) {
  const signature = '89504e470d0a1a0a';
  if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== signature) return null;
  return {
    format: 'png',
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function jpegMetadata(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  const startOfFrameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3,
    0xc5, 0xc6, 0xc7,
    0xc9, 0xca, 0xcb,
    0xcd, 0xce, 0xcf
  ]);

  let offset = 2;
  while (offset + 3 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset];
    offset += 1;

    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 1 >= buffer.length) break;

    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) break;

    if (startOfFrameMarkers.has(marker) && length >= 7) {
      return {
        format: 'jpeg',
        width: buffer.readUInt16BE(offset + 5),
        height: buffer.readUInt16BE(offset + 3)
      };
    }
    offset += length;
  }
  return null;
}

function webpMetadata(buffer) {
  if (
    buffer.length < 30 ||
    buffer.subarray(0, 4).toString('ascii') !== 'RIFF' ||
    buffer.subarray(8, 12).toString('ascii') !== 'WEBP'
  ) return null;

  const type = buffer.subarray(12, 16).toString('ascii');
  const dataOffset = 20;

  if (type === 'VP8X' && buffer.length >= 30) {
    return {
      format: 'webp',
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3)
    };
  }

  if (type === 'VP8 ' && buffer.length >= dataOffset + 10) {
    return {
      format: 'webp',
      width: buffer.readUInt16LE(dataOffset + 6) & 0x3fff,
      height: buffer.readUInt16LE(dataOffset + 8) & 0x3fff
    };
  }

  if (type === 'VP8L' && buffer.length >= dataOffset + 5 && buffer[dataOffset] === 0x2f) {
    const bits = buffer.readUInt32LE(dataOffset + 1);
    return {
      format: 'webp',
      width: 1 + (bits & 0x3fff),
      height: 1 + ((bits >>> 14) & 0x3fff)
    };
  }

  return null;
}

export function parseImageMetadata(buffer, fileName = '') {
  const metadata = pngMetadata(buffer) ?? jpegMetadata(buffer) ?? webpMetadata(buffer);
  if (!metadata) return null;
  const extension = path.extname(fileName).toLowerCase().replace('.', '');
  return {
    ...metadata,
    extension,
    aspectRatio: metadata.width / metadata.height
  };
}

export async function readImageMetadata(filePath) {
  const buffer = await readFile(filePath);
  return parseImageMetadata(buffer, filePath);
}
