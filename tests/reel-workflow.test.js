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

test('erstellt standardmäßig ein Ein-Minuten-Reel mit tiefen Sprecher-Untertiteln', async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-reels-'));
  const result = await createReelWorkspace({
    title: 'Was bedeutet links und rechts?',
    script: 'Dieses Rohscript wird durch Codex zu einem vollständigen Ein-Minuten-Reel ausgebaut.',
    date: new Date('2026-07-30T12:00:00'),
    outputRoot: temporaryRoot
  });

  assert.equal(result.reel.sceneCount, 13);
  assert.equal(result.reel.targetDurationSeconds, 58);

  const production = await prepareReelProduction(result.reelDirectory);
  const task = await readFile(production.taskFile, 'utf8');
  const subtitlePlan = JSON.parse(await readFile(path.join(result.reelDirectory, 'subtitles', 'subtitle-plan.json'), 'utf8'));

  assert.match(task, /55–60 Sekunden/);
  assert.match(task, /155–175 Wörter/);
  assert.match(task, /starkem Ende|Prüf-/);
  assert.equal(subtitlePlan.position, 'center');
  assert.equal(subtitlePlan.verticalPositionPercent, 58);
  assert.equal(subtitlePlan.textColor, '#F5F7FA');
  assert.equal(subtitlePlan.highlightCurrentWord, true);
  assert.equal(subtitlePlan.highlightColor, '#B7794A');
  assert.equal(subtitlePlan.backgroundColor, 'transparent');
  assert.equal(subtitlePlan.exactWordTimingsRequired, true);
});

test('strenge Inhaltsprüfung akzeptiert 12 vollständige Szenen mit starkem Ende', async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'erklaer-reels-ready-'));
  const finalScript = 'Demokratie einfach erklärt: In einer Demokratie dürfen Bürger politische Macht mitbestimmen und Regierungen friedlich austauschen. Das geschieht vor allem durch freie, faire und regelmäßige Wahlen. Doch Wahlen allein reichen nicht. Grundrechte schützen Menschen auch dann, wenn ihre Meinung unpopulär ist. Parlamente beschließen Gesetze, Regierungen führen sie aus und unabhängige Gerichte kontrollieren, ob Regeln eingehalten werden. Freie Medien machen Entscheidungen öffentlich und Opposition bietet politische Alternativen. Wichtig ist außerdem, dass niemand dauerhaft alle Macht kontrolliert. Deshalb werden Aufgaben verteilt und Institutionen kontrollieren sich gegenseitig. Demokratie bedeutet aber nicht, dass jede Entscheidung allen gefällt. Sie schafft Verfahren, mit denen Konflikte ohne Gewalt ausgetragen und Fehler korrigiert werden können. Problematisch wird es, wenn Wahlen manipuliert, Medien eingeschüchtert oder Gerichte abhängig werden. Dann bleibt vielleicht der Name Demokratie, während echte Kontrolle verschwindet. Die entscheidende Frage lautet deshalb: Können Bürger die Mächtigen wirklich kritisieren und abwählen? Wenn das möglich ist und Grundrechte geschützt bleiben, funktioniert demokratische Kontrolle. Demokratie lebt nicht nur vom Wählen, sondern davon, dass Macht begrenzt und überprüfbar bleibt.';
  const result = await createReelWorkspace({
    title: 'Was ist eine Demokratie?',
    script: finalScript,
    date: new Date('2026-07-30T12:00:00'),
    sceneCount: 12,
    outputRoot: temporaryRoot
  });

  const reelPath = path.join(result.reelDirectory, 'reel.json');
  const reel = JSON.parse(await readFile(reelPath, 'utf8'));
  reel.topicArea = 'Politik und Gesellschaft';
  reel.visualStyleId = 'human-editorial-cartoon';
  reel.visualStyleReason = 'Vereinfachte menschliche Figuren zeigen Wahlen, Beteiligung und Machtkontrolle verständlich.';
  reel.targetDurationSeconds = 57.6;
  await writeJson(reelPath, reel);
  await writeFile(path.join(result.reelDirectory, 'script', 'final-script.txt'), `${finalScript}\n`, 'utf8');
  await writeFile(path.join(result.reelDirectory, 'script', 'voice-script.txt'), `${finalScript}\n`, 'utf8');

  const scenes = [];
  for (let index = 1; index <= 12; index += 1) {
    const sceneId = `scene-${String(index).padStart(2, '0')}`;
    const isQuestion = index === 11;
    const isFinal = index === 12;
    const scene = {
      sceneId,
      order: index,
      title: index === 1 ? 'Hook' : isQuestion ? 'Prüffrage' : isFinal ? 'Abschluss' : `Erklärung ${index}`,
      narration: isQuestion
        ? 'Können Bürger die Mächtigen wirklich kritisieren und abwählen?'
        : isFinal
          ? 'Demokratie lebt davon, dass Macht begrenzt und überprüfbar bleibt.'
          : `Dieser Sprecherabschnitt erklärt den demokratischen Bildmoment Nummer ${index} besonders einfach.`,
      imageText: '',
      visualIdea: isQuestion
        ? 'Ein Bürger prüft ruhig eine Wahlurne und blickt zu kontrollierten Regierungsgebäuden.'
        : isFinal
          ? 'Eine ausgewogene Waage verbindet Bürger, Parlament und Gericht als klare Schlussmetapher.'
          : `Eine klare handgezeichnete Metapher zeigt den demokratischen Bestandteil Nummer ${index} als einen einzigen Moment.`,
      continuityNotes: 'Gleiche Figuren und Konturen, natürliche Komposition, genau ein Moment, keine künstlich freie Mitte.',
      audioCue: isQuestion ? 'wirklich kritisieren' : isFinal ? 'Macht begrenzt' : `Bildmoment ${index}`,
      leadInSeconds: 0.2,
      subtitleCues: [{ text: isFinal ? 'Macht bleibt überprüfbar' : `Demokratischer Punkt ${index}` }],
      subtitlePosition: SUBTITLE_STYLE.position,
      durationSeconds: 4.8,
      expectedImageFileName: `${sceneId}.png`,
      promptStatus: 'ready',
      imageStatus: 'missing',
      status: 'prompt-ready'
    };
    scenes.push(scene);
    await writeJson(path.join(result.reelDirectory, 'scenes', sceneId, 'scene.json'), scene);
    const prompt = `Vertical 9:16 adult hand-drawn 2D editorial cartoon. Show one clear democratic visual moment for scene ${index}, using consistent human characters, thick dark outlines, flat colors and subtle paper texture. The main subject may occupy the exact center behind subtitle overlays. Do not create an empty horizontal band, disconnected halves, repeated main characters, labels, logos, watermark or 3D rendering.`;
    await writeFile(path.join(result.reelDirectory, 'scenes', sceneId, 'image-prompt.txt'), `${prompt}\n`, 'utf8');
  }
  await writeJson(path.join(result.reelDirectory, 'scenes', 'scene-index.json'), scenes);

  const subtitlePath = path.join(result.reelDirectory, 'subtitles', 'subtitle-plan.json');
  const subtitlePlan = JSON.parse(await readFile(subtitlePath, 'utf8'));
  subtitlePlan.cues = scenes.map((scene) => ({ sceneId: scene.sceneId, texts: scene.subtitleCues.map((cue) => cue.text) }));
  await writeJson(subtitlePath, subtitlePlan);

  await writeJson(path.join(result.reelDirectory, 'cover', 'cover.json'), {
    headline: 'DEMOKRATIE EINFACH ERKLÄRT',
    visualIdea: 'Eine Wahlurne verbindet Bürger, Parlament und Gericht in einer klaren Titelkomposition.'
  });
  await writeFile(path.join(result.reelDirectory, 'cover', 'cover-prompt.txt'), 'Vertical 9:16 adult educational cover in a hand-drawn 2D editorial cartoon style. Show a large transparent ballot box surrounded by simplified citizens, parliament and a balanced court scale. Display the exact German headline "DEMOKRATIE EINFACH ERKLÄRT" in large readable letters. Strong focal point, thick outlines, flat colors, no party logos, no real politicians, no watermark and no 3D rendering.\n', 'utf8');
  await writeFile(path.join(result.reelDirectory, 'caption', 'caption.txt'), 'Demokratie bedeutet mehr als Wahlen. Grundrechte, Gerichte, Medien und politische Alternativen sorgen gemeinsam dafür, dass Macht kontrollierbar und friedlich austauschbar bleibt. #Politik #Demokratie #EinfachErklärt #Wissen\n', 'utf8');
  await writeFile(path.join(result.reelDirectory, 'sources', 'sources.md'), '# Quellen\n\n- Grundgesetz und neutrale institutionelle Grundlagen der parlamentarischen Demokratie.\n- Begriffe bewusst vereinfacht; keine Parteienbewertung.\n', 'utf8');

  const report = await validateReelContent(result.reelDirectory, { strict: true });
  assert.equal(report.passed, true, JSON.stringify(report.checks.filter((check) => !check.passed), null, 2));
});
