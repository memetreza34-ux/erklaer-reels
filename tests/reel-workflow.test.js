import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createReelWorkspace } from '../src/core/workspace.js';
import { prepareReelProduction } from '../src/core/production-brief.js';
import { validateReelContent } from '../src/core/content-validator.js';
import { SUBTITLE_STYLE } from '../src/shared/subtitle-style.js';

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

test('erstellt einen vollständigen Reel-Arbeitsordner mit Codex-Auftrag', async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-reels-'));
  const result = await createReelWorkspace({
    title: 'Was bedeutet links und rechts?',
    script: 'Warum nennt man politische Ideen links oder rechts? Dieses Rohscript wird später durch Codex überarbeitet und in klare Bildmomente aufgeteilt.',
    date: new Date('2026-07-30T12:00:00'),
    sceneCount: 9,
    outputRoot: temporaryRoot
  });

  assert.match(result.reelDirectory, /2026-KW31_27-07_bis_02-08/);
  assert.match(result.reelDirectory, /donnerstag/);

  const production = await prepareReelProduction(result.reelDirectory);
  const task = await readFile(production.taskFile, 'utf8');
  const inboxReadme = await readFile(path.join(result.reelDirectory, 'inbox', 'README.md'), 'utf8');

  assert.match(task, /Was bedeutet links und rechts\?/);
  assert.match(task, /Geplante Bildmomente: \*\*9\*\*/);
  assert.match(inboxReadme, /Reihenfolge ist egal/);
});

test('strenge Inhaltsprüfung akzeptiert ein vollständig ausgefülltes Produktionspaket', async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-reels-ready-'));
  const result = await createReelWorkspace({
    title: 'Was ist eine Demokratie?',
    script: 'Eine Demokratie ist ein politisches System, in dem Bürgerinnen und Bürger politische Entscheidungen beeinflussen und ihre Vertreter in freien Wahlen bestimmen können.',
    date: new Date('2026-07-30T12:00:00'),
    sceneCount: 8,
    outputRoot: temporaryRoot
  });

  const reelPath = path.join(result.reelDirectory, 'reel.json');
  const reel = JSON.parse(await readFile(reelPath, 'utf8'));
  reel.topicArea = 'Politik und Gesellschaft';
  reel.visualStyleId = 'human-editorial-cartoon';
  reel.visualStyleReason = 'Vereinfachte menschliche Figuren zeigen Wahlen, Beteiligung und Machtkontrolle besonders verständlich.';
  reel.status = 'content-ready';
  await writeJson(reelPath, reel);

  const finalScript = 'Warum dürfen Bürger in einer Demokratie mitentscheiden? Eine Demokratie verteilt politische Macht auf mehrere Institutionen. Bürger wählen Vertreter, Gerichte kontrollieren Regeln und Medien können Entscheidungen öffentlich prüfen. Keine einzelne Person soll allein bestimmen. Wahlen reichen aber nicht aus: Sie müssen frei, fair und regelmäßig sein. Außerdem brauchen Menschen Grundrechte und echte politische Alternativen. So bleibt die Regierung kontrollierbar und kann friedlich ausgewechselt werden.';
  await writeFile(path.join(result.reelDirectory, 'script', 'final-script.txt'), `${finalScript}\n`, 'utf8');
  await writeFile(path.join(result.reelDirectory, 'script', 'voice-script.txt'), `${finalScript}\n`, 'utf8');

  const scenes = [];
  for (let index = 1; index <= 8; index += 1) {
    const sceneId = `scene-${String(index).padStart(2, '0')}`;
    const imageText = `PUNKT ${index}`;
    const scene = {
      sceneId,
      order: index,
      title: index === 1 ? 'Hook' : `Erklärung ${index}`,
      narration: `Dieser Sprechertext erklärt den politischen Bildmoment Nummer ${index} besonders einfach.`,
      imageText,
      visualIdea: `Eine klare handgezeichnete Metapher zeigt den demokratischen Bestandteil Nummer ${index} ohne unnötige Details.`,
      continuityNotes: 'Gleiche runde Figuren, gleiche Konturen und dieselbe flache 2D-Bildwelt wie in allen anderen Szenen.',
      subtitlePosition: SUBTITLE_STYLE.position,
      durationSeconds: 5,
      expectedImageFileName: `${sceneId}.png`,
      promptStatus: 'ready',
      imageStatus: 'missing',
      status: 'prompt-ready'
    };
    scenes.push(scene);
    await writeJson(path.join(result.reelDirectory, 'scenes', sceneId, 'scene.json'), scene);
    const prompt = `Vertical 9:16 hand-drawn 2D editorial cartoon for an educational reel. Show a simple democratic visual metaphor for scene ${index}, using the same rounded human characters, identical white oval eyes, thick uneven black outlines, flat colors, subtle paper texture, minimal shading and consistent proportions throughout the reel. Integrate the exact German text "${imageText}" naturally into the composition. Keep the message immediately understandable, centered and uncluttered. No logos, no watermark, no realistic politicians, no 3D rendering.`;
    await writeFile(path.join(result.reelDirectory, 'scenes', sceneId, 'image-prompt.txt'), `${prompt}\n`, 'utf8');
  }
  await writeJson(path.join(result.reelDirectory, 'scenes', 'scene-index.json'), scenes);

  await writeJson(path.join(result.reelDirectory, 'cover', 'cover.json'), {
    headline: 'DEMOKRATIE EINFACH ERKLÄRT',
    visualIdea: 'Eine Wahlurne steht zwischen Bürgern, Parlament, Gericht und Medien und verbindet alle Elemente sichtbar.',
    expectedImageFileName: 'cover.png',
    promptStatus: 'ready',
    imageStatus: 'missing',
    status: 'prompt-ready'
  });
  await writeFile(path.join(result.reelDirectory, 'cover', 'cover-prompt.txt'), 'Vertical 9:16 viral educational reel cover in the same hand-drawn 2D editorial cartoon style. Show a large transparent ballot box in the center, surrounded by simplified citizens, a parliament building, a balanced court scale and a newspaper. Use thick uneven black outlines, flat vibrant colors, subtle paper texture, strong expressions and a clean thumbnail composition. Display the exact German headline "DEMOKRATIE EINFACH ERKLÄRT" in very large readable letters. No party logos, no real politicians, no watermark, no 3D rendering.\n', 'utf8');
  await writeFile(path.join(result.reelDirectory, 'caption', 'caption.txt'), 'Demokratie bedeutet mehr als nur wählen. Das Reel zeigt einfach, wie Wahlen, Grundrechte, Gerichte, Medien und politische Alternativen gemeinsam Macht kontrollieren. Welche politische Erklärung soll als Nächstes kommen? #Politik #Demokratie #EinfachErklärt #Wissen #Gesellschaft\n', 'utf8');
  await writeFile(path.join(result.reelDirectory, 'sources', 'sources.md'), '# Quellen\n\n- Grundgesetz und neutrale institutionelle Grundlagen zur parlamentarischen Demokratie.\n- Begriffe bewusst vereinfacht; keine Parteienbewertung.\n', 'utf8');

  const report = await validateReelContent(result.reelDirectory, { strict: true });
  assert.equal(report.passed, true, JSON.stringify(report.checks.filter((check) => !check.passed), null, 2));
  assert.equal(report.summary.failedChecks, 0);
});
