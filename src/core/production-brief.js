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
  const editTiming = qualityGates.editTiming ?? {};
  const matching = qualityGates.assetMatching;
  const rawScript = (await readFile(rawScriptPath, 'utf8')).trim();
  const productionDirectory = path.join(reelDirectory, 'production');
  await mkdir(productionDirectory, { recursive: true });

  const currentPlannedImages = plannedImageCount(scenes);
  const imageCueLeadSeconds = Number(editTiming.imageCueLeadSeconds ?? 0.08);
  const sceneCueLeadSeconds = Number(editTiming.sceneCueLeadSeconds ?? 0.1);
  const sfxPreRollSeconds = Number(editTiming.sfxPreRollSeconds ?? 0.04);

  const checklist = {
    version: 24,
    reelId: reel.reelId,
    title: reel.title,
    createdAt: new Date().toISOString(),
    phase: 'content-production',
    subtitlesEnabled: false,
    imageCountMode: 'one-hook-two-standard',
    visualWorldMode: 'fixed',
    visualStyleId: FIXED_VISUAL_STYLE_ID,
    tasks: [
      { id: 'script-final', label: 'Voice-over mit 155–175 Wörtern, natürlicher Betonung und starkem Ende fertigstellen', status: 'pending' },
      { id: 'visual-world-fixed', label: `Feste Reel-Bildwelt ${FIXED_VISUAL_WORLD_LABEL} für jede Bildphase beibehalten; keine Stilrotation`, status: 'pending' },
      { id: 'visual-world-separated', label: 'YouTube-Bildwelt strikt getrennt halten; keine Stick-Figuren, kein 16:9-Longform-Look in Reels', status: 'pending' },
      { id: 'scene-first-visuals', label: 'Jede Bildphase als konkrete lebendige Mini-Szene planen; Posterkarte, Headline-plus-Icon und sterile Icon-Boards vermeiden', status: 'pending' },
      { id: 'visual-depth-variety', label: 'Perspektive, Farbkontrast und einfache Tiefenstaffelung zwischen benachbarten Bildern bewusst variieren', status: 'pending' },
      { id: 'scenes-fill', label: `${scenes.length} narrative Szenen mit klaren Audio-Cues planen`, status: 'pending' },
      { id: 'image-density-plan', label: 'Hook exakt 1 Bildphase, jede weitere Szene exakt 2 Bildphasen; keine dritte Phase', status: 'pending' },
      { id: 'scene-timing-balance', label: `Hook ${timing.hookSeconds.min}–${timing.hookSeconds.max}s, normale Szenen ${timing.standardSeconds.min}–${timing.standardSeconds.max}s und Schlussbild-Nachlauf ${timing.postVoiceHoldSeconds}s planen`, status: 'pending' },
      { id: 'image-text-plan', label: 'Cover mit starkem deutschem Hook-Text; danach imageText nur wenn hilfreich, 0–4 Wörter und viele Bildphasen bewusst ohne Text', status: 'pending' },
      { id: 'ending-check', label: 'Prüffrage und einprägsamen Abschlusssatz auf zwei Szenen verteilen', status: 'pending' },
      { id: 'prompts-write', label: `Für jede Bildphase einen vollständigen englischen 9:16-Prompt im Stil ${FIXED_VISUAL_STYLE_ID} schreiben; Handlung, Umgebung, Perspektive, Tiefe und Farbkontrast konkret angeben`, status: 'pending' },
      { id: 'prompts-export', label: 'Alle Bildphasen in globaler Bildreihenfolge als seriellen Google-Flow-Gesamtprompt exportieren', status: 'pending' },
      { id: 'subtitles-disabled', label: 'Untertitel deaktiviert lassen; keine Subtitle-Cues und keinen Word-Sync erzeugen', status: 'pending' },
      { id: 'effects-write', label: `Harte Cuts, dezente Bewegung auf fast jedem Bildmoment und SFX für jeden Szenen-/internen Bildwechsel planen; Bildschnitt ca. ${imageCueLeadSeconds.toFixed(2)}s vor Cue, SFX weitere ${sfxPreRollSeconds.toFixed(2)}s davor`, status: 'pending' },
      { id: 'asset-matching-plan', label: `Zweistufige visuelle Zuordnung jeder Bildphase mit mindestens ${matching.minimumConfidence} Konfidenz vorbereiten`, status: 'pending' },
      { id: 'title-image-write', label: 'Szene 1 als Titelbild ausarbeiten: stärkste visuelle Idee plus klare Headline, nicht nur Text auf leerer Fläche', status: 'pending' },
      { id: 'caption-write', label: 'Caption erstellen', status: 'pending' },
      { id: 'sources-write', label: 'Schema-3-Quellen mit Primär-/Offiziell- und unabhängiger Sekundärrolle dokumentieren', status: 'pending' },
      { id: 'content-check', label: 'npm run check:content --strict erfolgreich ausführen', status: 'pending' }
    ]
  };

  const normalizedDirectory = reelDirectory.split(path.sep).join('/');
  const brief = `# Codex-Produktionsauftrag: ${reel.title}

## Ziel

Erstelle ein vollständiges Erklär-Reel mit ungefähr einer Minute Voice-over-Laufzeit. Bilder und Audio werden extern erzeugt. **Narrative Szenen und Bildanzahl sind getrennt:** Die Hook besitzt exakt einen Bildmoment; jede weitere narrative Szene besitzt exakt zwei aufeinanderfolgende Bildmomente. Das Reel wird vollständig ohne Untertitel produziert und gerendert.

**Verbindliche Reel-Bildwelt: ${FIXED_VISUAL_WORLD_LABEL} (\`${FIXED_VISUAL_STYLE_ID}\`).** Die Welt bleibt fest, aber die Bilder müssen deutlich lebendiger als statische Lernposter wirken.

## Ausgangsdaten

- Reel-ID: \`${reel.reelId}\`
- Titel: **${reel.title}**
- narrative Szenen: **${scenes.length}**
- geplante Bilder: **${currentPlannedImages}**
- Bildanzahl-Modus: **one-hook-two-standard**
- feste Reel-Bildwelt: **${FIXED_VISUAL_WORLD_LABEL} / ${FIXED_VISUAL_STYLE_ID}**
- Voice-over-Zieldauer: **55–60 Sekunden**
- Zieltext: **155–175 Wörter**
- Format: **9:16**
- Voice-over: **Deutsch**
- Bildprompts: **Englisch**
- sichtbarer Bildtext: **Deutsch, Cover Pflicht; danach optional**
- Hook-Dauer: **${timing.hookSeconds.min}–${timing.hookSeconds.max} Sekunden**
- normale narrative Szenen: **${timing.standardSeconds.min}–${timing.standardSeconds.max} Sekunden**
- Schlussszene inklusive Nachlauf: **${timing.finalSceneSecondsIncludingHold.min}–${timing.finalSceneSecondsIncludingHold.max} Sekunden**
- ruhiger Nachlauf nach Sprecherende: **${timing.postVoiceHoldSeconds} Sekunden**
- Szenen-Cut: **ca. ${sceneCueLeadSeconds.toFixed(2)} s vor dem Szenen-Cue**
- interner Bild-Cut: **ca. ${imageCueLeadSeconds.toFixed(2)} s vor dem Bild-Cue**
- SFX-Start: **ca. ${sfxPreRollSeconds.toFixed(2)} s vor dem Bild-Cut**
- Bildzuordnung: **mindestens ${matching.minimumConfidence} Konfidenz, zwei visuelle Durchgänge pro Bildphase**
- Untertitel: **deaktiviert**
- Quellen-QC: **Schema 3 für neu erstellte Reels**
- Audio-Pacing: **exakt ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}x**
- Lautheit: **${AUDIO_PACING_STYLE.loudnessTargetLufs} LUFS, höchstens ${AUDIO_PACING_STYLE.truePeakDbtp} dBTP**
- Hintergrundmusik: **aus**

## Rohscript

> ${rawScript.replace(/\n/g, '\n> ')}

## Verbindlicher Ablauf

1. Lies \`CURRENT_WORKFLOW.md\`, \`AGENTS.md\`, \`CODEX_TASK.md\`, \`knowledge/fixed-visual-world.md\`, \`knowledge/production-rules.md\`, \`config/image-styles.json\`, \`config/effects-rules.json\` und \`config/production-quality-gates.json\`.
2. Überarbeite das Script auf 155–175 Wörter und ungefähr 55–60 Sekunden bei 1,10x. Szene 1 startet sofort mit Frage, Überraschung oder Kontrast. Schreibe so, dass der Sprecher natürlich betonen kann: kurze klare Sätze, Schlüsselwörter, keine monotone Vorlesekadenz.
3. Das Ende benötigt zwei getrennte Stufen: persönliche Prüf-/Erkenntnisfrage und danach konkrete Lösung mit kurzem einprägsamem Abschlusssatz.
4. Schreibe denselben finalen Text nach \`script/final-script.txt\` und \`script/voice-script.txt\`.
5. Plane ${scenes.length} narrative Szenen. Bildanzahl: 1 + (Szenen − 1) × 2.
6. Setze und behalte \`visualStyleId: "${FIXED_VISUAL_STYLE_ID}"\`. Keine Stilrotation und keine YouTube-Stick-Figure-/16:9-Welt.
7. Hook exakt 1 Bild; jede weitere Szene exakt 2. Eine dritte Bildphase ist verboten.
8. Das zweite Bild bekommt ein eigenes \`audioCue\` aus 2–5 exakt gesprochenen Wörtern. Der Cue wird so gewählt, dass der neue visuelle Gedanke genau zu diesem Sprachmoment passt.
9. \`startPercent\` wird aus der Cue-Position im Text abgeleitet. Im finalen Schnitt wird der Bildwechsel automatisch ca. ${imageCueLeadSeconds.toFixed(2)} s vor dem echten Cue platziert. Beide Bildphasen müssen mindestens 3 Sekunden sichtbar bleiben.
10. Schreibe \`reel.json.plannedImageCount\` und \`imageCountMode: "one-hook-two-standard"\` korrekt.
11. Hinterlege pro Szene \`imageCount\` und \`imagePhases\`. Erste Phase \`startPercent: 0\`, zweite streng danach.
12. Jede Phase bekommt eigene \`visualIdea\` und \`rationale\`. **Nur Bild 01 braucht zwingend imageText.** Für spätere Bildphasen ist \`imageText\` optional; falls verwendet 1–4 deutsche Wörter. Ziel: nur etwa 35–60 % der Nicht-Cover-Bilder mit Text. Ein starkes Bild ohne Text ist erwünscht.
13. Aktualisiere \`scenes/scene-index.json\` und jede \`scene.json\` synchron.
14. Hook ${timing.hookSeconds.min}–${timing.hookSeconds.max}s, Standardszenen ${timing.standardSeconds.min}–${timing.standardSeconds.max}s, letzte Szene inklusive Nachlauf ${timing.finalSceneSecondsIncludingHold.min}–${timing.finalSceneSecondsIncludingHold.max}s.
15. Schreibe für jede Bildphase einen vollständigen englischen 9:16-Prompt.

### Pflichtregeln für die neue lebendige Bildwirkung

- konkrete visuelle Mini-Szene statt Lernposter
- sichtbare Handlung, Reaktion, Veränderung, Ursache-Folge oder räumliche Beziehung
- ein dominantes Hauptmotiv und 1–3 unterstützende Elemente
- einfache kontextuelle Umgebung statt leerer Fläche, wenn sie die Erklärung verbessert
- einfache Tiefe über Vordergrund/Mittelgrund/Hintergrund, Überlagerung, Größenunterschied oder gerichtetes Licht, wenn sinnvoll
- kräftige, kontrollierte Farbkontraste
- Perspektive zwischen benachbarten Bildern wechseln: Close-up, Medium, einfache Weite, Objekt-Detail, Karte, leichte Draufsicht oder Off-Center
- keine zwei direkt aufeinanderfolgenden Bilder mit nahezu derselben Center-Komposition
- keine große Headline plus ein isoliertes Symbol auf leerem Hintergrund als Standard
- Text darf nie das Hauptmotiv ersetzen; das Bild muss auch ohne Text verständlich sein
- Countryball-Figuren nur wenn Akteure sinnvoll personifiziert werden
- Länder-/Regionsflaggen nur bei echter geografischer Relevanz
- keine generischen schwebenden Karten, Icon-Gitter, UI-Boxen oder Figur-mittig-plus-Icons-Komposition
- keine realistischen Menschen, kein Fotorealismus, kein Anime, kein Clay, kein glänzendes 3D
- sichtbarer Text ausschließlich Deutsch; Prompts Englisch
- keine technische Workflow-Beschriftung im Bild
- Bild 01 ist Cover und braucht eine starke deutsche Überschrift im oberen Bereich, aber zusätzlich eine starke Illustration

16. Exportiere die Prompts:

\`\`\`bash
npm run export:prompts -- --dir "${normalizedDirectory}" --strict
\`\`\`

Die verbindliche Nutzerdatei ist \`00-bildprompts/99-alle-bildprompts.txt\`.

17. Untertitel deaktiviert lassen. Kein \`sync:words\`.
18. Fülle \`effects/effects-plan.json\` verbindlich:
   - Hook \`none\`, danach harte \`cut\`-Transitions
   - dezente Kamerabewegung auf fast jedem Bildmoment, auch auf zweiten Bildphasen; Zoom meist 2–4 %, Pan maximal ca. 3 %
   - jeder Szenenwechsel bekommt einen kurzen SFX
   - jeder interne Bildwechsel bekommt einen kurzen SFX oder einen passenden Objekt-Sound
   - interner SFX mit \`targetId\` auf die zweite Bildphase legen
   - Standardlautstärke ca. 0,22, meist 0,18–0,28
   - bei reinen Übergängen SFX ca. ${sfxPreRollSeconds.toFixed(2)} s vor dem Cut starten; akustischer Akzent liegt am Schnitt
   - dieselbe Transition-SFX-Variante nie zweimal hintereinander
19. Fülle die Caption aus.
20. Fülle \`sources/sources.md\` nach Schema 3 aus: mindestens zwei HTTPS-Quellen auf unterschiedlichen Hosts, davon mindestens eine Primär-/offizielle oder wissenschaftliche Quelle und eine unabhängige Sekundär-/Fachquelle.
21. Prüfe streng:

\`\`\`bash
npm run check:content -- --dir "${normalizedDirectory}" --strict
\`\`\`

## Nach Eintreffen von Bildern und Voice-over

### 1. Audio

\`\`\`bash
npm run trim:pauses -- --dir "${normalizedDirectory}" --speed ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}
\`\`\`

Der Audio-Schritt muss Anfangs-/Endstille entfernen, Pausen straffen und Lautheit messen. Das finale Video darf nach dem letzten Wort nicht mehrere Sekunden stumm weiterlaufen.

### 2. Alle Bildphasen zweifach zuordnen

\`\`\`bash
npm run organize:assets -- --dir "${normalizedDirectory}"
\`\`\`

Für jedes Bild: sichtbaren Inhalt beschreiben, konkrete Bildphase prüfen, gegen vorheriges/nächstes Bild vergleichen und erst ab ${matching.minimumConfidence} Konfidenz bestätigen. Zusätzlich prüfen: keine Posterkarte, Text nicht dominant, Perspektive ausreichend abwechslungsreich und ${FIXED_VISUAL_WORLD_LABEL} eingehalten.

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

Die Master-Timeline synchronisiert narrative Szenen und interne Bildphasen mit dem finalen Voice-over. Interne Bilder schneiden standardmäßig ca. ${imageCueLeadSeconds.toFixed(2)} s vor dem tatsächlich gesprochenen Cue, SFX beginnen kurz davor und die letzte Bildphase bleibt nach dem letzten Wort nur ${timing.postVoiceHoldSeconds} Sekunden stehen.
`;

  await writeFile(path.join(productionDirectory, 'agent-task.md'), `${brief}\n`, 'utf8');
  await writeJson(path.join(productionDirectory, 'checklist.json'), checklist);

  return {
    reelDirectory,
    taskFile: path.join(productionDirectory, 'agent-task.md'),
    checklistFile: path.join(productionDirectory, 'checklist.json')
  };
}
