#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function numeric(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function round(value) {
  return Number(Number(value).toFixed(3));
}

async function readOptionalJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

async function main() {
  const rawDir = arg('--dir');
  if (!rawDir) throw new Error('Nutzung: npm run build:youtube-timeline -- --dir "youtube/<woche>/<thema>"');
  const projectDir = path.resolve(rawDir);
  const techDir = path.join(projectDir, '99-technik');
  const mapping = JSON.parse(await readFile(path.join(techDir, 'BILD_AUDIO_ZUORDNUNG.json'), 'utf8'));
  const meta = await readOptionalJson(path.join(techDir, 'video.json'));
  const images = Array.isArray(mapping.images) ? mapping.images : [];
  if (!images.length) throw new Error('Mapping enthält keine Bilder.');

  const cutLead = numeric(mapping.cutLeadSecondsDefault) ?? 0.08;
  const configuredEndHold = numeric(meta?.renderPolicy?.endHoldSeconds);
  const endHold = configuredEndHold ?? 0.6;
  const schema = Number(meta?.schemaVersion) || 0;

  if (schema >= 12) {
    if (Number(meta?.endHoldPolicyVersion) !== 1) {
      throw new Error('Schema-12+: endHoldPolicyVersion muss 1 sein.');
    }
    if (endHold < 1.2 || endHold > 1.5) {
      throw new Error(`Schema-12+: renderPolicy.endHoldSeconds muss zwischen 1.2 und 1.5 liegen, ist ${endHold}.`);
    }
    if (meta?.endHoldPolicy?.lastImageMustRemainVisibleAfterLastWord !== true) {
      throw new Error('Schema-12+: endHoldPolicy.lastImageMustRemainVisibleAfterLastWord muss true sein.');
    }
  }

  const totalAudio = numeric(mapping.autoAlignment?.totalDurationSeconds);
  if (totalAudio === null) throw new Error('autoAlignment.totalDurationSeconds fehlt. Erst auto-align:youtube ausführen.');

  const timeline = [];
  for (let index = 0; index < images.length; index += 1) {
    const item = images[index];
    const actualStart = numeric(item.actualStartSeconds);
    const confidence = numeric(item.alignmentConfidence);
    if (actualStart === null || confidence === null || confidence < 0.95) {
      throw new Error(`Bild ${item.imageNumber}: kein belastbares gemessenes Alignment.`);
    }
    const start = index === 0 ? 0 : Math.max(0, actualStart - cutLead);
    timeline.push({ imageNumber: Number(item.imageNumber), startSeconds: round(start), endSeconds: null });
  }

  for (let index = 0; index < timeline.length; index += 1) {
    timeline[index].endSeconds = index < timeline.length - 1
      ? timeline[index + 1].startSeconds
      : round(totalAudio + endHold);
    if (timeline[index].endSeconds <= timeline[index].startSeconds) {
      throw new Error(`Bild ${timeline[index].imageNumber}: Timeline-Dauer ist nicht positiv.`);
    }
  }

  const output = {
    schemaVersion: 3,
    generatedAt: new Date().toISOString(),
    source: 'measured-youtube-word-timings',
    audioMaster: mapping.audioMasterFile,
    alignmentEvidence: mapping.alignmentEvidenceFile,
    cutLeadSeconds: cutLead,
    endHoldSeconds: endHold,
    audioDurationSeconds: totalAudio,
    images: timeline
  };
  await mkdir(techDir, { recursive: true });
  await writeFile(path.join(techDir, 'FINAL_TIMELINE.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`FINAL_TIMELINE.json erstellt: ${timeline.length} Bilder, Audio ${totalAudio.toFixed(3)} s, Schluss-Hold ${endHold.toFixed(2)} s.`);
}

main().catch((error) => {
  console.error(`YouTube Timeline: FEHLER — ${error.message}`);
  process.exitCode = 1;
});
