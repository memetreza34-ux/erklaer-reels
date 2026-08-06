import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { SUBTITLE_STYLE } from '../shared/subtitle-style.js';
import { AUDIO_PACING_STYLE } from '../shared/audio-pacing-style.js';

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export async function prepareReelProduction(reelDirectory) {
  const reelPath = path.join(reelDirectory, 'reel.json');
  const sceneIndexPath = path.join(reelDirectory, 'scenes', 'scene-index.json');
  const rawScriptPath = path.join(reelDirectory, 'script', 'raw-script.txt');

  if (!(await exists(reelPath))) throw new Error('reel.json wurde nicht gefunden.');
  if (!(await exists(sceneIndexPath))) throw new Error('scenes/scene-index.json wurde nicht gefunden.');
  if (!(await exists(rawScriptPath))) throw new Error('script/raw-script.txt wurde nicht gefunden.');

  const reel = await readJson(reelPath);
  const scenes = await readJson(sceneIndexPath);
  const rawScript = (await readFile(rawScriptPath, 'utf8')).trim();
  const productionDirectory = path.join(reelDirectory, 'production');
  await mkdir(productionDirectory, { recursive: true });

  const preferredImageTextMinimum = Math.ceil(scenes.length * 0.55);
  const preferredImageTextMaximum = Math.floor(scenes.length * 0.85);

  const checklist = {
    version: 13,
    reelId: reel.reelId,
    title: reel.title,
    createdAt: new Date().toISOString(),
    phase: 'content-production',
    tasks: [
      { id: 'script-final', label: 'Voice-over mit 155–175 Wörtern und starkem Ende fertigstellen', status: 'pending' },
      { id: 'style-select', label: 'Nach dem fertigen Script die passendste Bildwelt auswählen und begründen', status: 'pending' },
      { id: 'scenes-fill', label: `${scenes.length} klare Ein-Moment-Szenen mit Audio-Cues planen`, status: 'pending' },
      { id: 'image-text-plan', label: `In ungefähr ${preferredImageTextMinimum}–${preferredImageTextMaximum} passenden Szenen kurzen deutschen Bildtext mit 1–5 Wörtern planen`, status: 'pending' },
      { id: 'ending-check', label: 'Prüffrage und einprägsamen Abschlusssatz auf zwei Szenen verteilen', status: 'pending' },
      { id: 'prompts-write', label: `${scenes.length} natürliche englische Bildprompts mit exakt angegebenem deutschem Bildtext schreiben`, status: 'pending' },
      { id: 'prompts-export', label: 'Cover und alle Szenenprompts chronologisch exportieren', status: 'pending' },
      { id: 'subtitles-write', label: 'Weiße Untertitel exakt mittig ohne Gelb und ohne Box planen', status: 'pending' },
      { id: 'effects-write', label: 'Dezente Bewegungen, harte Schnitte und Soundeffekte planen', status: 'pending' },
      { id: 'cover-write', label: 'Cover-Idee und Cover-Prompt schreiben', status: 'pending' },
      { id: 'caption-write', label: 'Caption erstellen', status: 'pending' },
      { id: 'sources-write', label: 'Quellen und Unsicherheiten dokumentieren', status: 'pending' },
      { id: 'content-check', label: 'npm run check:content --strict erfolgreich ausführen', status: 'pending' }
    ]
  };

  const normalizedDirectory = reelDirectory.split(path.sep).join('/');
  const brief = `# Codex-Produktionsauftrag: ${reel.title}

## Ziel

Erstelle ein vollständiges Erklär-Reel mit ungefähr einer Minute Laufzeit. Bilder und Audio werden extern erzeugt und direkt in die vorgesehenen Cover-, Szenen- und Audioordner gelegt.

## Ausgangsdaten

- Reel-ID: \`${reel.reelId}\`
- Titel: **${reel.title}**
- Bildmomente: **${scenes.length}**
- Zieldauer: **55–60 Sekunden**
- Zieltext: **155–175 Wörter**
- Format: **9:16**
- Voice-over: **Deutsch**
- Bildprompts: **Englisch**
- geplanter Bildtext: **Deutsch, meistens 1–5 Wörter in ungefähr ${preferredImageTextMinimum}–${preferredImageTextMaximum} passenden Szenen**
- Untertitel: **\`${SUBTITLE_STYLE.position}\`, exakt ${SUBTITLE_STYLE.verticalPositionPercent} % Bildhöhe**
- Untertitelfarbe: **${SUBTITLE_STYLE.textColor}**
- Wortmarkierung: **ausgeschaltet**
- Hintergrundbox: **keine, ${SUBTITLE_STYLE.backgroundColor}**
- Audio-Pacing: **exakt ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}x**
- Lautheit: **${AUDIO_PACING_STYLE.loudnessTargetLufs} LUFS, höchstens ${AUDIO_PACING_STYLE.truePeakDbtp} dBTP**
- Hintergrundmusik: **aus**

## Rohscript

> ${rawScript.replace(/\n/g, '\n> ')}

## Verbindlicher Ablauf

1. Lies \`AGENTS.md\`, \`knowledge/production-rules.md\`, \`knowledge/effects-rules.md\`, \`knowledge/subtitle-pacing-rules.md\` und die Konfigurationen.
2. Überarbeite das Script auf 155–175 Wörter und ungefähr 55–60 Sekunden bei 1,10x. Bevorzugter Einstieg: \`THEMA einfach erklärt:\`.
3. Das Ende benötigt zwei getrennte Stufen: eine persönliche Prüf- oder Erkenntnisfrage und danach eine konkrete Lösung mit kurzem einprägsamem Abschlusssatz.
4. Schreibe denselben finalen Text nach \`script/final-script.txt\` und \`script/voice-script.txt\`.
5. Plane genau ${scenes.length} Bildmomente mit Hook ab Sekunde 0 und sichtbaren Änderungen ungefähr alle 3,5–5 Sekunden.
6. Jede Szene zeigt genau einen klaren Moment. Keine mehrfach kopierte Hauptperson und kein überladenes Anleitungspanorama.
7. Wähle **erst nach dem fertigen Script** die Hauptbildwelt, die diesen konkreten Inhalt am schnellsten erklärt. Trage \`visualStyleId\` sowie \`visualStyleReason\` ein und halte die Welt innerhalb des Reels konsistent.
8. Aktualisiere \`scenes/scene-index.json\` und jede \`scene.json\` synchron.
9. Plane in ungefähr ${preferredImageTextMinimum}–${preferredImageTextMaximum} passenden Szenen einen kurzen deutschen Bildtext. Ein einzelnes Wort oder 1–5 Wörter reichen. Die Größe darf klein, mittel oder groß sein. Geeignet sind Überschriften, Schilder, Etiketten, Karten, Dokumente, Displays, Gegenstände und kurze Schlussaussagen.
10. Trage den exakten Wortlaut in \`scene.imageText\` ein. Lasse \`imageText\` leer, wenn Text die Szene überladen, die Aussage nur doppeln oder die Bildgenerierung verschlechtern würde.
11. Schreibe für jede Szene einen vollständigen englischen 9:16-Bildprompt. Wenn \`imageText\` gesetzt ist, fordere den exakten deutschen Text in Anführungszeichen an.

### Pflichtregeln für Bilder

- natürliche zusammenhängende Komposition
- Hauptmotive dürfen die Bildmitte normal nutzen und hinter dem Untertitel liegen
- keine künstlich leere horizontale Untertitelzone
- keine getrennte obere und untere Bildhälfte
- keine gestapelten Panels oder mehrfach dargestellte Hauptperson
- geplanter sichtbarer Text ausschließlich korrekt auf Deutsch
- Bildtext meistens 1–5 Wörter; nicht unnötig viel Text
- Bildtext darf klein, mittel oder groß sein und natürlich in die Szene eingebaut werden
- Untertitel und Bildtext nicht wortgleich wiederholen
- keine zusätzlichen englischen Wörter, Fantasie-Labels, Logos oder Wasserzeichen
- Text nicht zwanghaft in jede einzelne Szene setzen

12. Exportiere Cover und alle Szenenprompts:

\`\`\`bash
npm run export:prompts -- --dir "${normalizedDirectory}" --strict
\`\`\`

13. Fülle \`subtitles/subtitle-plan.json\` mit den zentralen Werten aus \`src/shared/subtitle-style.js\`: exakt 50 %, weiß, transparent, keine Wortmarkierung, höchstens zwei Zeilen und normalerweise 3–6 Wörter.
14. Fülle \`effects/effects-plan.json\`: Hook \`none\`, danach nur \`cut\` mit Dauer 0; Zoom maximal 8 %, Schwenk maximal 4 %; nicht jede Szene bewegen.
15. Fülle Cover, Caption und Quellen aus.
16. Prüfe streng und behebe alle Fehler:

\`\`\`bash
npm run check:content -- --dir "${normalizedDirectory}" --strict
\`\`\`

## Nach Eintreffen von Bildern und Voice-over

\`\`\`bash
npm run trim:pauses -- --dir "${normalizedDirectory}" --speed ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}
npm run build:timeline -- --dir "${normalizedDirectory}"
npm run sync:audio -- --dir "${normalizedDirectory}" --strict
npm run check:visuals -- --dir "${normalizedDirectory}" --strict
npm run finalize:reel -- --dir "${normalizedDirectory}" --strict
npm run validate:render -- --dir "${normalizedDirectory}"
npm run render:reel -- --dir "${normalizedDirectory}"
\`\`\`

\`trim:pauses\` kürzt Pausen, beschleunigt auf exakt ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}x, erhält die Tonhöhe und normalisiert auf ${AUDIO_PACING_STYLE.loudnessTargetLufs} LUFS bei ${AUDIO_PACING_STYLE.truePeakDbtp} dBTP.

Die MP4 erst als fertig bezeichnen, wenn Inhalt, neues Audio, alle Bilder, geplanter deutscher Bildtext, mittige Untertitel, visuelle Prüfung und Renderer-Validierung tatsächlich bestanden sind.
`;

  await writeFile(path.join(productionDirectory, 'agent-task.md'), `${brief}\n`, 'utf8');
  await writeJson(path.join(productionDirectory, 'checklist.json'), checklist);

  return {
    reelDirectory,
    taskFile: path.join(productionDirectory, 'agent-task.md'),
    checklistFile: path.join(productionDirectory, 'checklist.json'),
    sceneCount: scenes.length
  };
}
