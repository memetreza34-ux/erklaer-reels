import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { AUDIO_PACING_STYLE } from '../shared/audio-pacing-style.js';
import { FIXED_VISUAL_STYLE_ID, FIXED_VISUAL_WORLD_LABEL } from '../shared/fixed-visual-world.js';
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
    version: 23,
    reelId: reel.reelId,
    title: reel.title,
    createdAt: new Date().toISOString(),
    phase: 'content-production',
    subtitlesEnabled: false,
    imageCountMode: 'one-hook-two-standard',
    visualWorldMode: 'fixed',
    visualStyleId: FIXED_VISUAL_STYLE_ID,
    tasks: [
      { id: 'script-final', label: 'Voice-over mit 155–175 Wörtern und starkem Ende fertigstellen', status: 'pending' },
      { id: 'visual-world-fixed', label: `Feste Reel-Bildwelt ${FIXED_VISUAL_WORLD_LABEL} für jede Bildphase beibehalten; keine Stilrotation`, status: 'pending' },
      { id: 'visual-world-separated', label: 'YouTube-Bildwelt strikt getrennt halten; keine Stick-Figuren, kein 16:9-Longform-Look in Reels', status: 'pending' },
      { id: 'scene-first-visuals', label: 'Jede Bildphase zuerst als konkrete physische Mini-Szene planen; generische Karten-/Icon-Boards vermeiden', status: 'pending' },
      { id: 'scenes-fill', label: `${scenes.length} narrative Szenen mit klaren Audio-Cues planen`, status: 'pending' },
      { id: 'image-density-plan', label: 'Hook exakt 1 Bildphase, jede weitere Szene exakt 2 Bildphasen; keine dritte Phase', status: 'pending' },
      { id: 'scene-timing-balance', label: `Hook ${timing.hookSeconds.min}–${timing.hookSeconds.max}s, normale Szenen ${timing.standardSeconds.min}–${timing.standardSeconds.max}s und Schlussbild-Nachlauf ${timing.postVoiceHoldSeconds}s planen`, status: 'pending' },
      { id: 'image-text-plan', label: 'Jede einzelne Bildphase bekommt 1–5 deutsche Wörter imageText; kein Bild ohne Text', status: 'pending' },
      { id: 'ending-check', label: 'Prüffrage und einprägsamen Abschlusssatz auf zwei Szenen verteilen', status: 'pending' },
      { id: 'prompts-write', label: `Für jede geplante Bildphase einen vollständigen englischen 9:16-Bildprompt im festen Stil ${FIXED_VISUAL_STYLE_ID} schreiben; konkrete Szene, Handlung, Umgebung und Perspektive angeben`, status: 'pending' },
      { id: 'prompts-export', label: 'Alle Bildphasen in globaler Bildreihenfolge als kompletten seriellen Google-Flow-Gesamtprompt mit globalem und per-Bild Style-Lock exportieren', status: 'pending' },
      { id: 'subtitles-disabled', label: 'Untertitel deaktiviert lassen; keine Subtitle-Cues und keinen Word-Sync erzeugen', status: 'pending' },
      { id: 'effects-write', label: 'Dezente Bewegungen, harte Schnitte und Soundeffekte planen; Sounds nur als type aus config/sound-library.json und nur an sichtbaren Ereignissen', status: 'pending' },
      { id: 'asset-matching-plan', label: `Zweistufige visuelle Zuordnung jeder Bildphase mit mindestens ${matching.minimumConfidence} Konfidenz vorbereiten`, status: 'pending' },
      { id: 'title-image-write', label: 'Szene 1 als Titelbild ausarbeiten: stärkste visuelle Idee, sichtbarer Hook-Text in imageText, in derselben festen Reel-Bildwelt', status: 'pending' },
      { id: 'caption-write', label: 'Caption erstellen', status: 'pending' },
      { id: 'sources-write', label: 'Schema-3-Quellen mit Primär-/Offiziell- und unabhängiger Sekundärrolle dokumentieren', status: 'pending' },
      { id: 'content-check', label: 'npm run check:content --strict erfolgreich ausführen', status: 'pending' }
    ]
  };

  const normalizedDirectory = reelDirectory.split(path.sep).join('/');
  const brief = `# Codex-Produktionsauftrag: ${reel.title}

## Ziel

Erstelle ein vollständiges Erklär-Reel mit ungefähr einer Minute Voice-over-Laufzeit. Bilder und Audio werden extern erzeugt. **Narrative Szenen und Bildanzahl sind getrennt:** Die Hook besitzt exakt einen Bildmoment; jede weitere narrative Szene besitzt exakt zwei aufeinanderfolgende Bildmomente. Das Reel wird vollständig ohne Untertitel produziert und gerendert.

**Verbindliche Reel-Bildwelt: ${FIXED_VISUAL_WORLD_LABEL} (\`${FIXED_VISUAL_STYLE_ID}\`).** Sie gilt für jede Bildphase. Die separate YouTube-Bildwelt darf niemals automatisch auf Reels übertragen werden.

## Ausgangsdaten

- Reel-ID: \`${reel.reelId}\`
- Titel: **${reel.title}**
- narrative Szenen: **${scenes.length}**
- geplante Bilder nach fester Regel: **${currentPlannedImages}**
- Bildanzahl-Modus: **one-hook-two-standard**
- feste Reel-Bildwelt: **${FIXED_VISUAL_WORLD_LABEL} / ${FIXED_VISUAL_STYLE_ID}**
- Voice-over-Zieldauer: **55–60 Sekunden**
- Zieltext: **155–175 Wörter**
- Format: **9:16**
- Voice-over: **Deutsch**
- Bildprompts: **Englisch**
- sichtbarer Bildtext: **Deutsch**
- Hook-Dauer: **${timing.hookSeconds.min}–${timing.hookSeconds.max} Sekunden**
- normale narrative Szenen: **${timing.standardSeconds.min}–${timing.standardSeconds.max} Sekunden**
- Schlussszene inklusive Nachlauf: **${timing.finalSceneSecondsIncludingHold.min}–${timing.finalSceneSecondsIncludingHold.max} Sekunden**
- ruhiger Nachlauf nach Sprecherende: **${timing.postVoiceHoldSeconds} Sekunden**
- Bildzuordnung: **mindestens ${matching.minimumConfidence} Konfidenz, zwei visuelle Durchgänge pro Bildphase**
- Untertitel: **deaktiviert**
- Quellen-QC: **Schema 3 für neu erstellte Reels**
- Audio-Pacing: **exakt ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}x**
- Lautheit: **${AUDIO_PACING_STYLE.loudnessTargetLufs} LUFS, höchstens ${AUDIO_PACING_STYLE.truePeakDbtp} dBTP**
- Hintergrundmusik: **aus**

## Rohscript

> ${rawScript.replace(/\n/g, '\n> ')}

## Verbindlicher Ablauf

1. Lies \`CURRENT_WORKFLOW.md\`, \`AGENTS.md\`, \`CODEX_TASK.md\`, \`knowledge/fixed-visual-world.md\`, \`knowledge/production-rules.md\`, \`config/image-styles.json\` und \`config/production-quality-gates.json\`.
2. Überarbeite das Script auf 155–175 Wörter und ungefähr 55–60 Sekunden bei 1,10x. Szene 1 startet sofort mit Frage, Überraschung oder klarem Kontrast; generische Einleitungen wie „In diesem Video …“ sind verboten.
3. Das Ende benötigt zwei getrennte Stufen: eine persönliche Prüf- oder Erkenntnisfrage und danach eine konkrete Lösung mit kurzem einprägsamem Abschlusssatz.
4. Schreibe denselben finalen Text nach \`script/final-script.txt\` und \`script/voice-script.txt\`.
5. Plane ${scenes.length} **narrative Szenen**. Daraus folgt die Bildanzahl zwingend: 1 + (Szenen − 1) × 2.
6. **Keine Bildwelt auswählen oder rotieren.** Setze und behalte \`visualStyleId: "${FIXED_VISUAL_STYLE_ID}"\`. Reels bleiben 9:16 und verwenden niemals die separate YouTube-Stick-Figure-/16:9-Welt.
7. Die Hook bekommt exakt 1 Bild; jede weitere Szene exakt 2. Eine dritte Bildphase ist im aktiven Standard verboten.
8. Das zweite Bild wird nicht pauschal bei 50 % gesetzt. Gib ihm ein eigenes \`audioCue\`: 2–5 exakt gesprochene Wörter aus der Narration, bei denen der neue Bildmoment beginnen soll.
9. Leite \`startPercent\` aus der Position dieses \`audioCue\` in der Narration ab. Wähle den Cue so, dass beide Bildphasen mindestens 3 Sekunden stehen und der sichtbare Informationsschritt zum gesprochenen Inhalt passt.
10. Die Hook bekommt einen Bildmoment, jede weitere Szene zwei. Schreibe die tatsächliche Summe nach \`reel.json.plannedImageCount\` und setze \`imageCountMode: "one-hook-two-standard"\`.
11. Hinterlege pro Szene \`imageCount\` und \`imagePhases\`. Die erste Phase beginnt mit \`startPercent: 0\`; weitere Phasen liegen streng aufsteigend innerhalb 0–1.
12. Die erste Bildphase nutzt \`image-prompt.txt\`, die zweite \`image-prompt-02.txt\`. Jede Phase bekommt eigene \`visualIdea\`, eine eigene \`rationale\` und **zwingend einen eigenen \`imageText\`** mit 1–5 deutschen Wörtern. Kein Bild bleibt ohne Text, sonst wirkt es im Feed leer.
13. Aktualisiere \`scenes/scene-index.json\` und jede \`scene.json\` synchron.
14. Hook ${timing.hookSeconds.min}–${timing.hookSeconds.max}s, normale narrative Szenen ${timing.standardSeconds.min}–${timing.standardSeconds.max}s, letzte Szene inklusive Nachlauf ${timing.finalSceneSecondsIncludingHold.min}–${timing.finalSceneSecondsIncludingHold.max}s.
15. Schreibe für **jede** geplante Bildphase einen vollständigen englischen 9:16-Bildprompt. Der Prompt muss zuerst den **konkreten physischen Bildmoment** beschreiben: Hauptmotiv, Ort/Umgebung, Handlung, wenige Requisiten und Perspektive. Erst danach Symbole ergänzen. Fordere immer genau den geplanten deutschen \`imageText\` an, nichts anderes.

### Pflichtregeln für die feste Reel-Bildwelt

- scene-first Editorial-Countryball-Erklärstil
- hand-drawn 2D vector-cartoon hybrid
- dicke leicht organische schwarze Konturen
- konkrete Mini-Szene statt sterilem Icon-Board
- ein dominantes Hauptmotiv und eine klare physische Handlung
- nur 1–3 unterstützende Requisiten
- einfache kontextuelle Umgebung, wenn sie die Aussage verbessert
- Close-ups, Off-Center-Kompositionen und einfacher Vorder-/Mittel-/Hintergrund sind erwünscht
- Countryball-ähnliche Figuren nur wenn Akteure sinnvoll personifiziert werden
- Länder-/Regionsflaggen nur bei echter geografischer Relevanz
- bei abstrakten Allgemeinthemen Gegenstand, Mechanismus oder Umgebung einer leeren beige/neutralen Kugel vorziehen
- keine generischen schwebenden Karten, Lob-/Kritik-Karten, Sprechblasenringe, Icon-Gitter oder UI-Boxen als Standardlösung
- keine wiederholte Figur-mittig-plus-Icons-Komposition
- keine doppelte identische Headline oben und unten
- keine realistischen Menschen, kein Fotorealismus, kein Anime, kein Clay, kein glänzendes 3D
- **keine YouTube-Stick-Figuren, kein 16:9-Longform-Look**
- sichtbarer Text ausschließlich Deutsch; Prompts selbst Englisch
- natürliche zusammenhängende Komposition über die volle 9:16-Fläche
- keine künstliche Untertitelzone
- jeder Bildwechsel braucht einen sichtbaren neuen Informationsschritt oder klaren Rhythmusgewinn
- technische Labels wie BILD, TITELBILD, SZENE, BILDPHASE oder DATEINAME dürfen niemals im Bild erscheinen
- Bild 01 ist die erste Szene und zugleich das Titelbild. Sein \`imageText\` ist die **Überschrift des ganzen Reels** und steht im Bild groß im oberen Bereich. Style-Master bleibt trotzdem \`${FIXED_VISUAL_STYLE_ID}\`

16. Exportiere alle geplanten Bildphasen:

\`\`\`bash
npm run export:prompts -- --dir "${normalizedDirectory}" --strict
\`\`\`

Die verbindliche Nutzerdatei ist danach \`00-bildprompts/99-alle-bildprompts.txt\`. Sie enthält den vollständigen seriellen Gesamtprompt sowie den festen Style-Lock global und direkt vor jedem Bildabschnitt.

17. Stelle sicher, dass \`reel.json\` \`subtitlesEnabled: false\` setzt und der Untertitelplan deaktiviert bleibt. Kein \`sync:words\`.
18. Fülle \`effects/effects-plan.json\`: Hook \`none\`, danach nur \`cut\` mit Dauer 0; Zoom maximal 8 %, Schwenk maximal 4 %.
19. Fülle die Caption aus.
20. Fülle \`sources/sources.md\` nach Schema 3 aus: mindestens zwei HTTPS-Quellen auf unterschiedlichen Hosts, mindestens eine Primär-/offizielle oder wissenschaftliche Originalquelle und mindestens eine unabhängige Sekundär-/Fachquelle. Unter \`Belegt\` muss die konkrete gestützte Reel-Aussage stehen.
21. Prüfe streng:

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

Für jedes Bild in \`inbox/asset-map.json\`: sichtbaren Inhalt beschreiben, mit der konkreten Bildphase vergleichen, gegen vorherige und nächste Bildphase prüfen und erst ab ${matching.minimumConfidence} Konfidenz final bestätigen. Zusätzlich sichtbar prüfen, dass die **scene-first Reel-Bildwelt** ${FIXED_VISUAL_WORLD_LABEL} eingehalten wird und keine YouTube-Stick-Figure-/16:9-Abweichung vorliegt. Die laufende Bildnummer ist nur Routing-Hilfe.

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
    checklistFile: path.join(productionDirectory, 'checklist.json')
  };
}
