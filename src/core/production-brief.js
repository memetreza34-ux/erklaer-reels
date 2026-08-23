import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { AUDIO_PACING_STYLE } from '../shared/audio-pacing-style.js';
import { plannedImageCount } from '../shared/visual-moments.js';

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
  const qualityGates = await readJson(path.resolve('config', 'production-quality-gates.json'));
  const timing = qualityGates.sceneTiming;
  const matching = qualityGates.assetMatching;
  const rawScript = (await readFile(rawScriptPath, 'utf8')).trim();
  const productionDirectory = path.join(reelDirectory, 'production');
  await mkdir(productionDirectory, { recursive: true });

  const preferredImageTextMinimum = Math.ceil(scenes.length * 0.55);
  const preferredImageTextMaximum = Math.floor(scenes.length * 0.85);
  const currentPlannedImages = plannedImageCount(scenes);

  const checklist = {
    version: 19,
    reelId: reel.reelId,
    title: reel.title,
    createdAt: new Date().toISOString(),
    phase: 'content-production',
    subtitlesEnabled: false,
    imageCountMode: 'individual-per-reel',
    tasks: [
      { id: 'script-final', label: 'Voice-over mit 155–175 Wörtern und starkem Ende fertigstellen', status: 'pending' },
      { id: 'style-select', label: 'Nach dem fertigen Script die passendste Bildwelt auswählen und begründen', status: 'pending' },
      { id: 'scenes-fill', label: `${scenes.length} narrative Szenen mit klaren Audio-Cues planen`, status: 'pending' },
      { id: 'image-density-plan', label: 'Für jede Szene individuell 1, 2 oder selten 3 Bildphasen festlegen; keine starre Gleichsetzung Szenenanzahl = Bildanzahl', status: 'pending' },
      { id: 'scene-timing-balance', label: `Hook ${timing.hookSeconds.min}–${timing.hookSeconds.max}s, normale Szenen ${timing.standardSeconds.min}–${timing.standardSeconds.max}s und Schlussbild-Nachlauf ${timing.postVoiceHoldSeconds}s planen`, status: 'pending' },
      { id: 'image-text-plan', label: `In ungefähr ${preferredImageTextMinimum}–${preferredImageTextMaximum} passenden narrativen Szenen kurzen deutschen Bildtext planen`, status: 'pending' },
      { id: 'ending-check', label: 'Prüffrage und einprägsamen Abschlusssatz auf zwei Szenen verteilen', status: 'pending' },
      { id: 'prompts-write', label: 'Für jede geplante Bildphase einen vollständigen englischen 9:16-Bildprompt schreiben', status: 'pending' },
      { id: 'prompts-export', label: 'Cover und alle Bildphasen in globaler Bildreihenfolge für Google Flow exportieren', status: 'pending' },
      { id: 'subtitles-disabled', label: 'Untertitel deaktiviert lassen; keine Subtitle-Cues und keinen Word-Sync erzeugen', status: 'pending' },
      { id: 'effects-write', label: 'Dezente Bewegungen, harte Schnitte und Soundeffekte planen', status: 'pending' },
      { id: 'asset-matching-plan', label: `Zweistufige visuelle Zuordnung jeder Bildphase mit mindestens ${matching.minimumConfidence} Konfidenz vorbereiten`, status: 'pending' },
      { id: 'cover-write', label: 'Cover-Idee und Cover-Prompt schreiben', status: 'pending' },
      { id: 'caption-write', label: 'Caption erstellen', status: 'pending' },
      { id: 'sources-write', label: 'Quellen und Unsicherheiten dokumentieren', status: 'pending' },
      { id: 'content-check', label: 'npm run check:content --strict erfolgreich ausführen', status: 'pending' }
    ]
  };

  const normalizedDirectory = reelDirectory.split(path.sep).join('/');
  const brief = `# Codex-Produktionsauftrag: ${reel.title}

## Ziel

Erstelle ein vollständiges Erklär-Reel mit ungefähr einer Minute Voice-over-Laufzeit. Bilder und Audio werden extern erzeugt. **Narrative Szenen und Bildanzahl sind ab jetzt getrennt:** Eine Szene kann ein, zwei oder selten drei aufeinanderfolgende Bilder besitzen. Die Bilddichte wird für jedes Reel individuell entschieden. Das Reel wird vollständig ohne Untertitel produziert und gerendert.

## Ausgangsdaten

- Reel-ID: \`${reel.reelId}\`
- Titel: **${reel.title}**
- narrative Szenen: **${scenes.length}**
- aktuell initialisierte Bilder: **${currentPlannedImages}**; diese Zahl ist ausdrücklich noch nicht automatisch final
- Bildanzahl-Modus: **individuell pro Reel**
- Voice-over-Zieldauer: **55–60 Sekunden**
- Zieltext: **155–175 Wörter**
- Format: **9:16**
- Voice-over: **Deutsch**
- Bildprompts: **Englisch**
- Hook-Dauer: **${timing.hookSeconds.min}–${timing.hookSeconds.max} Sekunden**
- normale narrative Szenen: **${timing.standardSeconds.min}–${timing.standardSeconds.max} Sekunden**
- Schlussszene inklusive Nachlauf: **${timing.finalSceneSecondsIncludingHold.min}–${timing.finalSceneSecondsIncludingHold.max} Sekunden**
- ruhiger Nachlauf nach Sprecherende: **${timing.postVoiceHoldSeconds} Sekunden**
- Bildzuordnung: **mindestens ${matching.minimumConfidence} Konfidenz, zwei visuelle Durchgänge pro Bildphase**
- Untertitel: **deaktiviert**
- Audio-Pacing: **exakt ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}x**
- Lautheit: **${AUDIO_PACING_STYLE.loudnessTargetLufs} LUFS, höchstens ${AUDIO_PACING_STYLE.truePeakDbtp} dBTP**
- Hintergrundmusik: **aus**

## Rohscript

> ${rawScript.replace(/\n/g, '\n> ')}

## Verbindlicher Ablauf

1. Lies \`CURRENT_WORKFLOW.md\`, \`AGENTS.md\`, \`CODEX_TASK.md\`, \`knowledge/production-rules.md\` und \`config/production-quality-gates.json\`.
2. Überarbeite das Script auf 155–175 Wörter und ungefähr 55–60 Sekunden bei 1,10x.
3. Das Ende benötigt zwei getrennte Stufen: eine persönliche Prüf- oder Erkenntnisfrage und danach eine konkrete Lösung mit kurzem einprägsamem Abschlusssatz.
4. Schreibe denselben finalen Text nach \`script/final-script.txt\` und \`script/voice-script.txt\`.
5. Plane ${scenes.length} **narrative Szenen**. Diese Zahl bestimmt nicht mehr automatisch die Bildanzahl.
6. Plane danach die Bilddichte **für jede Szene einzeln**. Jede Szene bekommt:
   - normalerweise 1 Bild,
   - 2 Bilder, wenn ein zweiter visueller Schritt Verständnis, Rhythmus oder Abwechslung klar verbessert,
   - 3 Bilder nur selten bei wirklich mehrstufigen Erklärungen.
7. Wenn ein einziges Still-Bild ungefähr 3,5–4 Sekunden oder länger stehen würde, prüfe aktiv eine zweite Bildphase. Das ist ein Prüftrigger, **keine starre Pflicht**. Ein starkes Einzelbild darf länger tragen, wenn es visuell sinnvoll ist.
8. Wähle Bildphasen nach Inhalt, nicht nach Quote. Typische sinnvolle Wechsel:
   - Länder-Welt: Überblickskarte → Zoom/Detail → Vergleich/Nachbar,
   - Köpfe-Welt: dominantes Gesicht → Gedanken-/Detailansicht,
   - Metaphern-Welt: Ausgangsmetapher → sichtbare Folge/Auflösung.
9. Keine feste Gesamtzahl wie 13, 16 oder 18 erzwingen. Schreibe die tatsächlich gewählte Summe nach \`reel.json.plannedImageCount\` und setze \`imageCountMode: "individual-per-reel"\`.
10. Hinterlege pro Szene \`imageCount\` und \`imagePhases\`. Die erste Phase beginnt mit \`startPercent: 0\`; weitere Phasen liegen streng aufsteigend innerhalb 0–1.
11. Die erste Bildphase nutzt \`image-prompt.txt\`. Zusätzliche Phasen nutzen \`image-prompt-02.txt\`, \`image-prompt-03.txt\`. Jede Phase bekommt eine eigene \`visualIdea\`, optional eigenen \`imageText\` und einen kurzen \`rationale\`-Grund für den zusätzlichen Bildwechsel.
12. Aktualisiere \`scenes/scene-index.json\` und jede \`scene.json\` synchron.
13. Hook ${timing.hookSeconds.min}–${timing.hookSeconds.max}s, normale narrative Szenen ${timing.standardSeconds.min}–${timing.standardSeconds.max}s, letzte Szene inklusive Nachlauf ${timing.finalSceneSecondsIncludingHold.min}–${timing.finalSceneSecondsIncludingHold.max}s. Der Szenenwechsel bleibt am echten Voice-over-Cue; zusätzliche Bildphasen wechseln innerhalb der Szene über \`startPercent\`.
14. Schreibe für **jede** geplante Bildphase einen vollständigen englischen 9:16-Bildprompt. Wenn \`imageText\` gesetzt ist, fordere den exakten deutschen Text an.

### Pflichtregeln für Bilder

- natürliche zusammenhängende Komposition über die volle 9:16-Fläche
- keine künstlich leere horizontale Zone für Untertitel
- kein zusätzliches Bild nur um eine Zahl zu erfüllen
- jeder Bildwechsel muss einen sichtbaren neuen Informationsschritt, Detailfokus oder klaren Rhythmusgewinn liefern
- gewählte Hauptbildwelt, Figurenform, Konturen und Farbwelt durchgehend beibehalten
- Bild 00 bleibt Cover und Style-Master

15. Exportiere Cover und alle geplanten Bildphasen:

\`\`\`bash
npm run export:prompts -- --dir "${normalizedDirectory}" --strict
\`\`\`

Die Google-Flow-Nummerierung ist danach **globale Bildreihenfolge**: Bild 00 = Cover, danach Bild 01 bis zum letzten geplanten Bild. Bei mehreren Bildern in einer Szene ist Bildnummer nicht gleich Szenennummer.

16. Stelle sicher, dass \`reel.json\` \`subtitlesEnabled: false\` setzt und der Untertitelplan deaktiviert bleibt.
17. Fülle \`effects/effects-plan.json\`: Hook \`none\`, danach nur \`cut\` mit Dauer 0; Zoom maximal 8 %, Schwenk maximal 4 %.
18. Fülle Cover, Caption und Quellen aus.
19. Prüfe streng:

\`\`\`bash
npm run check:content -- --dir "${normalizedDirectory}" --strict
\`\`\`

## Nach Eintreffen von Bildern und Voice-over

### 1. Audio

\`\`\`bash
npm run trim:pauses -- --dir "${normalizedDirectory}" --speed ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}
\`\`\`

### 2. Alle Bildphasen zweifach zuordnen

\`\`\`bash
npm run organize:assets -- --dir "${normalizedDirectory}"
\`\`\`

Für jedes Bild in \`inbox/asset-map.json\`: sichtbaren Inhalt beschreiben, mit der konkreten Bildphase vergleichen, gegen vorherige und nächste Bildphase prüfen und erst ab ${matching.minimumConfidence} Konfidenz final bestätigen. Die laufende Bildnummer ist nur Routing-Hilfe.

Danach:

\`\`\`bash
npm run organize:assets -- --dir "${normalizedDirectory}" --apply
\`\`\`

### 3. Timeline, visuelle Prüfung und Render

\`\`\`bash
npm run build:timeline -- --dir "${normalizedDirectory}"
npm run sync:audio -- --dir "${normalizedDirectory}" --strict
npm run check:visuals -- --dir "${normalizedDirectory}" --strict
npm run finalize:reel -- --dir "${normalizedDirectory}" --strict
npm run validate:render -- --dir "${normalizedDirectory}"
npm run render:reel -- --dir "${normalizedDirectory}"
\`\`\`

Die Master-Timeline synchronisiert weiterhin die narrativen Szenen mit dem finalen Voice-over. Innerhalb einer Szene werden die geplanten Bildphasen als harte Schnitte an ihren relativen Positionen gerendert. Die letzte sichtbare Bildphase bleibt nach dem letzten gesprochenen Wort automatisch ${timing.postVoiceHoldSeconds} Sekunden stehen.
`;

  await writeFile(path.join(productionDirectory, 'agent-task.md'), `${brief}\n`, 'utf8');
  await writeJson(path.join(productionDirectory, 'checklist.json'), checklist);

  return {
    reelDirectory,
    taskFile: path.join(productionDirectory, 'agent-task.md'),
    checklistFile: path.join(productionDirectory, 'checklist.json'),
    sceneCount: scenes.length,
    plannedImageCount: currentPlannedImages
  };
}
