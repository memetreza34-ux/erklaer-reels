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
    version: 22,
    reelId: reel.reelId,
    title: reel.title,
    createdAt: new Date().toISOString(),
    phase: 'content-production',
    subtitlesEnabled: false,
    imageCountMode: 'individual-per-reel',
    visualWorldMode: 'fixed',
    visualStyleId: FIXED_VISUAL_STYLE_ID,
    tasks: [
      { id: 'script-final', label: 'Voice-over mit 155–175 Wörtern und starkem Ende fertigstellen', status: 'pending' },
      { id: 'visual-world-fixed', label: `Feste Bildwelt ${FIXED_VISUAL_WORLD_LABEL} für Cover und jede Bildphase beibehalten; keine Stilrotation`, status: 'pending' },
      { id: 'scenes-fill', label: `${scenes.length} narrative Szenen mit klaren Audio-Cues planen`, status: 'pending' },
      { id: 'image-density-plan', label: 'Für jede Szene individuell 1, 2 oder selten 3 Bildphasen festlegen; keine starre Gleichsetzung Szenenanzahl = Bildanzahl', status: 'pending' },
      { id: 'scene-timing-balance', label: `Hook ${timing.hookSeconds.min}–${timing.hookSeconds.max}s, normale Szenen ${timing.standardSeconds.min}–${timing.standardSeconds.max}s und Schlussbild-Nachlauf ${timing.postVoiceHoldSeconds}s planen`, status: 'pending' },
      { id: 'image-text-plan', label: `In ungefähr ${preferredImageTextMinimum}–${preferredImageTextMaximum} passenden narrativen Szenen kurzen deutschen Bildtext planen`, status: 'pending' },
      { id: 'ending-check', label: 'Prüffrage und einprägsamen Abschlusssatz auf zwei Szenen verteilen', status: 'pending' },
      { id: 'prompts-write', label: `Für jede geplante Bildphase einen vollständigen englischen 9:16-Bildprompt im festen Stil ${FIXED_VISUAL_STYLE_ID} schreiben; sichtbarer Text ausschließlich Deutsch`, status: 'pending' },
      { id: 'prompts-export', label: 'Cover und alle Bildphasen in globaler Bildreihenfolge als kompletten seriellen Google-Flow-Gesamtprompt mit globalem und per-Bild Style-Lock exportieren', status: 'pending' },
      { id: 'subtitles-disabled', label: 'Untertitel deaktiviert lassen; keine Subtitle-Cues und keinen Word-Sync erzeugen', status: 'pending' },
      { id: 'effects-write', label: 'Dezente Bewegungen, harte Schnitte und Soundeffekte planen', status: 'pending' },
      { id: 'asset-matching-plan', label: `Zweistufige visuelle Zuordnung jeder Bildphase mit mindestens ${matching.minimumConfidence} Konfidenz vorbereiten`, status: 'pending' },
      { id: 'cover-write', label: 'Cover-Idee und Cover-Prompt in derselben festen Bildwelt schreiben', status: 'pending' },
      { id: 'caption-write', label: 'Caption erstellen', status: 'pending' },
      { id: 'sources-write', label: 'Schema-3-Quellen mit Primär-/Offiziell- und unabhängiger Sekundärrolle dokumentieren', status: 'pending' },
      { id: 'content-check', label: 'npm run check:content --strict erfolgreich ausführen', status: 'pending' }
    ]
  };

  const normalizedDirectory = reelDirectory.split(path.sep).join('/');
  const brief = `# Codex-Produktionsauftrag: ${reel.title}

## Ziel

Erstelle ein vollständiges Erklär-Reel mit ungefähr einer Minute Voice-over-Laufzeit. Bilder und Audio werden extern erzeugt. **Narrative Szenen und Bildanzahl sind getrennt:** Eine Szene kann ein, zwei oder selten drei aufeinanderfolgende Bilder besitzen. Die Bilddichte wird für jedes Reel individuell entschieden. Das Reel wird vollständig ohne Untertitel produziert und gerendert.

**Verbindliche Bildwelt: ${FIXED_VISUAL_WORLD_LABEL} (\`${FIXED_VISUAL_STYLE_ID}\`).** Diese Bildwelt gilt für jedes neue Thema, jedes Cover und jede Bildphase. Inhalt, Symbolik und Hintergrundfarbe dürfen wechseln; die Formsprache bleibt fest.

## Ausgangsdaten

- Reel-ID: \`${reel.reelId}\`
- Titel: **${reel.title}**
- narrative Szenen: **${scenes.length}**
- aktuell initialisierte Bilder: **${currentPlannedImages}**; diese Zahl ist ausdrücklich noch nicht automatisch final
- Bildanzahl-Modus: **individuell pro Reel**
- feste Bildwelt: **${FIXED_VISUAL_WORLD_LABEL} / ${FIXED_VISUAL_STYLE_ID}**
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
2. Überarbeite das Script auf 155–175 Wörter und ungefähr 55–60 Sekunden bei 1,10x.
3. Das Ende benötigt zwei getrennte Stufen: eine persönliche Prüf- oder Erkenntnisfrage und danach eine konkrete Lösung mit kurzem einprägsamem Abschlusssatz.
4. Schreibe denselben finalen Text nach \`script/final-script.txt\` und \`script/voice-script.txt\`.
5. Plane ${scenes.length} **narrative Szenen**. Diese Zahl bestimmt nicht automatisch die Bildanzahl.
6. **Keine Bildwelt auswählen oder rotieren.** Setze und behalte \`visualStyleId: "${FIXED_VISUAL_STYLE_ID}"\`. Alle neuen Bilder folgen derselben festen Bildwelt, unabhängig davon, ob das Thema Politik, Wirtschaft, Gesundheit, Technik, Psychologie, Geschichte, Wissenschaft oder Alltag betrifft.
7. Plane danach die Bilddichte **für jede Szene einzeln**. Jede Szene bekommt:
   - normalerweise 1 Bild,
   - 2 Bilder, wenn ein zweiter visueller Schritt Verständnis, Rhythmus oder Abwechslung klar verbessert,
   - 3 Bilder nur selten bei wirklich mehrstufigen Erklärungen.
8. Wenn ein einziges Still-Bild ungefähr 3,5–4 Sekunden oder länger stehen würde, prüfe aktiv eine zweite Bildphase. Das ist ein Prüftrigger, **keine starre Pflicht**. Ein starkes Einzelbild darf länger tragen, wenn es visuell sinnvoll ist.
9. Wähle Bildphasen nach Inhalt, nicht nach Quote. Sinnvolle Wechsel sind z. B. Überblick → Detail, Ursache → Folge, Ausgangslage → Vergleich oder äußere Handlung → Mechanismus-Detail.
10. Keine feste Gesamtzahl wie 13, 16 oder 18 erzwingen. Schreibe die tatsächlich gewählte Summe nach \`reel.json.plannedImageCount\` und setze \`imageCountMode: "individual-per-reel"\`.
11. Hinterlege pro Szene \`imageCount\` und \`imagePhases\`. Die erste Phase beginnt mit \`startPercent: 0\`; weitere Phasen liegen streng aufsteigend innerhalb 0–1.
12. Die erste Bildphase nutzt \`image-prompt.txt\`. Zusätzliche Phasen nutzen \`image-prompt-02.txt\`, \`image-prompt-03.txt\`. Jede Phase bekommt eine eigene \`visualIdea\`, optional eigenen \`imageText\` und einen kurzen \`rationale\`-Grund für den zusätzlichen Bildwechsel.
13. Aktualisiere \`scenes/scene-index.json\` und jede \`scene.json\` synchron.
14. Hook ${timing.hookSeconds.min}–${timing.hookSeconds.max}s, normale narrative Szenen ${timing.standardSeconds.min}–${timing.standardSeconds.max}s, letzte Szene inklusive Nachlauf ${timing.finalSceneSecondsIncludingHold.min}–${timing.finalSceneSecondsIncludingHold.max}s. Der Szenenwechsel bleibt am echten Voice-over-Cue; zusätzliche Bildphasen wechseln innerhalb der Szene über \`startPercent\`.
15. Schreibe für **jede** geplante Bildphase einen vollständigen englischen 9:16-Bildprompt. Der Prompt beschreibt die konkrete Szene und bleibt mit der festen Bildwelt \`${FIXED_VISUAL_STYLE_ID}\` kompatibel. Wenn \`imageText\` gesetzt ist, fordere nur den exakten deutschen Text an. Der Exporter ergänzt zusätzlich automatisch einen verbindlichen globalen und per-Bild Style-Lock.

### Pflichtregeln für die feste Bildwelt

- moderner minimalistischer Countryball-inspirierter Erklärgrafik-Stil
- runde Kugelfiguren für Personen, Gruppen, Institutionen und Länder
- Länder-/Regionsflaggen nur wenn diese Identität inhaltlich relevant ist; sonst neutrale einfarbige Kugeln
- einfache weiße expressive Augen, minimale Gesichtselemente
- dicke saubere schwarze Konturen
- flacher sauberer 2D-Vektor-/Comic-Look
- dezente weiche Schatten, höchstens sehr leichte Textur
- ein dominantes Hauptmotiv und nur wenige unterstützende Requisiten
- einfarbiger oder sanft texturierter Hintergrund; Hintergrundfarbe darf zum Thema passen
- klare visuelle Metapher, innerhalb ungefähr einer Sekunde verständlich
- keine realistischen Menschen, kein Fotorealismus, kein Anime, kein Clay, kein glänzendes 3D, keine Stockfoto-Ästhetik
- sichtbarer Text ausschließlich Deutsch; Prompts selbst Englisch
- natürliche zusammenhängende Komposition über die volle 9:16-Fläche
- keine künstlich leere horizontale Zone für Untertitel
- kein zusätzliches Bild nur um eine Zahl zu erfüllen
- jeder Bildwechsel muss einen sichtbaren neuen Informationsschritt, Detailfokus oder klaren Rhythmusgewinn liefern
- technische Labels wie BILD, COVER, SZENE, BILDPHASE oder DATEINAME dürfen niemals im Bild erscheinen
- Bild 00 ist das Cover, aber nicht der alleinige Style-Master; der globale Style-Master ist \`${FIXED_VISUAL_STYLE_ID}\`

16. Exportiere Cover und alle geplanten Bildphasen:

\`\`\`bash
npm run export:prompts -- --dir "${normalizedDirectory}" --strict
\`\`\`

Die verbindliche Nutzerdatei ist danach \`00-bildprompts/99-alle-bildprompts.txt\`. Sie enthält den vollständigen seriellen Gesamtprompt sowie den festen Style-Lock global und direkt vor jedem Bildabschnitt. Die Google-Flow-Nummerierung ist globale Bildreihenfolge: Bild 00 = Cover, danach Bild 01 bis zum letzten geplanten Bild. Bei mehreren Bildern in einer Szene ist Bildnummer nicht gleich Szenennummer.

17. Stelle sicher, dass \`reel.json\` \`subtitlesEnabled: false\` setzt und der Untertitelplan deaktiviert bleibt. Kein \`sync:words\`.
18. Fülle \`effects/effects-plan.json\`: Hook \`none\`, danach nur \`cut\` mit Dauer 0; Zoom maximal 8 %, Schwenk maximal 4 %.
19. Fülle Cover und Caption aus.
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

Für jedes Bild in \`inbox/asset-map.json\`: sichtbaren Inhalt beschreiben, mit der konkreten Bildphase vergleichen, gegen vorherige und nächste Bildphase prüfen und erst ab ${matching.minimumConfidence} Konfidenz final bestätigen. Zusätzlich sichtbar prüfen, dass die Bildwelt ${FIXED_VISUAL_WORLD_LABEL} eingehalten wird. Die laufende Bildnummer ist nur Routing-Hilfe.

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
