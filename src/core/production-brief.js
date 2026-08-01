import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

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

  const checklist = {
    version: 7,
    reelId: reel.reelId,
    title: reel.title,
    createdAt: new Date().toISOString(),
    phase: 'content-production',
    tasks: [
      { id: 'script-final', label: 'Finales Voice-over-Script prüfen und schreiben', status: 'pending' },
      { id: 'style-select', label: 'Passende Bildwelt auswählen und in reel.json eintragen', status: 'pending' },
      { id: 'scenes-fill', label: `${scenes.length} Szenen mit Audio-Cues vollständig planen`, status: 'pending' },
      { id: 'prompts-write', label: `${scenes.length} englische Bildprompts schreiben`, status: 'pending' },
      { id: 'subtitles-write', label: 'Tiefe Untertitel für spätere Codex-Wortzeiten planen', status: 'pending' },
      { id: 'effects-write', label: 'Dezente Bewegungen, ausschließlich harte Schnitte und Soundeffekte planen', status: 'pending' },
      { id: 'cover-write', label: 'Cover-Idee und Cover-Prompt schreiben', status: 'pending' },
      { id: 'caption-write', label: 'Caption erstellen', status: 'pending' },
      { id: 'sources-write', label: 'Quellen und Unsicherheiten dokumentieren', status: 'pending' },
      { id: 'content-check', label: 'npm run check:content erfolgreich ausführen', status: 'pending' }
    ]
  };

  const normalizedDirectory = reelDirectory.split(path.sep).join('/');
  const brief = `# Codex-Produktionsauftrag: ${reel.title}

## Ziel

Erstelle aus dem vorhandenen deutschen Rohscript ein vollständiges Produktionspaket für ein visuelles Erklär-Reel. Erzeuge keine Bilder und kein Audio. Der Nutzer erzeugt diese extern und legt sie später unsortiert in \`inbox/\` ab.

## Ausgangsdaten

- Reel-ID: \`${reel.reelId}\`
- Titel: **${reel.title}**
- Geplante Bildmomente: **${scenes.length}**
- Format: **9:16**
- Voice-over: **Deutsch**
- Bildprompts: **Englisch**
- Untertitel: **79,5 % der Bildhöhe, sichere Zone 76,5–80,5 %**
- Gelbe Wortmarkierung: **nach dem Voice-over durch lokale Codex-Audio-Prüfung**
- Übergänge: **keine Fades; Hook ohne Übergang, danach nur direkte harte Schnitte**
- Audio-Pacing: **Pausen kürzen und Voice-over mit 1.05x leicht beschleunigen**
- Externer Transkriptionsdienst: **nicht verwenden**
- Hintergrundmusik: **standardmäßig ausgeschaltet**

## Rohscript

> ${rawScript.replace(/\n/g, '\n> ')}

## Verbindlicher Ablauf

1. Lies \`AGENTS.md\`, \`knowledge/production-rules.md\`, \`knowledge/effects-rules.md\`, \`knowledge/subtitle-pacing-rules.md\`, \`config/content-rules.json\`, \`config/effects-rules.json\` und \`config/image-styles.json\`.
2. Überarbeite das Rohscript zu einem einfachen Voice-over von ungefähr 35–55 Sekunden.
3. Schreibe denselben finalen Text nach \`script/final-script.txt\` und \`script/voice-script.txt\`.
4. Nutze für 35–44 Sekunden normalerweise 8–10 und für 45–55 Sekunden normalerweise 10–12 Bildmomente.
5. Wähle genau eine Hauptbildwelt und trage \`visualStyleId\` sowie \`visualStyleReason\` ein.
6. Plane genau ${scenes.length} Bildmomente. Hook ab Sekunde 0, danach ungefähr alle 3,5–5 Sekunden eine sichtbare Veränderung.
7. Aktualisiere \`scenes/scene-index.json\` und jede passende \`scene.json\` synchron.
8. Jede Szene benötigt \`title\`, \`narration\`, \`imageText\`, \`visualIdea\`, \`continuityNotes\`, \`audioCue\`, \`leadInSeconds\`, \`subtitleCues\`, \`subtitlePosition\`, \`durationSeconds\` und \`expectedImageFileName\`.
9. Schreibe für jede Szene einen vollständigen englischen 9:16-Bildprompt.
10. Fülle \`subtitles/subtitle-plan.json\` zunächst als Plan aus:
    - Position \`safe-lower-middle\`
    - Höhe 79,5 %
    - normalerweise 3–6 Wörter, höchstens zwei Zeilen
    - \`highlightCurrentWord: true\`
    - \`highlightColor: "#FFD84D"\`
    - keine geschätzten gelben Wortzeiten eintragen
    - die finalen Cues werden später aus akustisch bestätigten Codex-Wortzeiten neu erzeugt
11. Fülle \`effects/effects-plan.json\` vollständig aus:
    - Szene 1: \`transitionIn.type: "none"\`, \`durationSeconds: 0\`
    - jede weitere Szene: \`transitionIn.type: "cut"\`, \`durationSeconds: 0\`
    - keine Crossfades, Schwarzblenden, Slides oder sonstigen Übergangsanimationen
    - kein schwarzes Zwischenbild
    - nicht jede Szene braucht Bewegung oder Sound
    - Zoom maximal 8 %, Schwenk maximal 4 %
12. Fülle Cover, Caption und Quellen aus.
13. Führe aus:

\`\`\`bash
npm run check:content -- --dir "${normalizedDirectory}" --strict
\`\`\`

14. Behebe alle Fehler und markiere die Aufgaben in \`production/checklist.json\` als \`done\`.

## Nach Eintreffen von Bildern und Voice-over

1. Assets zuordnen:

\`\`\`bash
npm run organize:assets -- --dir "${normalizedDirectory}"
npm run organize:assets -- --dir "${normalizedDirectory}" --apply
\`\`\`

2. Voice-over vor jeder Timeline straffen:

\`\`\`bash
npm run trim:pauses -- --dir "${normalizedDirectory}"
\`\`\`

Standard: lange Pausen deutlich kürzen und die Stimme mit 1.05x leicht beschleunigen, ohne die Tonhöhe zu verändern. Prüfe \`review/audio-pacing-report.json\`.

3. Timeline und Szenen-Cues mit der optimierten Audiodatei synchronisieren:

\`\`\`bash
npm run build:timeline -- --dir "${normalizedDirectory}"
npm run sync:audio -- --dir "${normalizedDirectory}" --strict
\`\`\`

4. Codex-Wort-Sync vorbereiten:

\`\`\`bash
npm run sync:words -- --dir "${normalizedDirectory}"
\`\`\`

5. Bearbeite \`production/codex-word-sync-task.md\`: Voice-over lokal anhören und in \`subtitles/codex-word-sync.json\` für jedes Wort echte absolute Start- und Endzeiten, realistische Konfidenz und \`reviewed: true\` eintragen.
6. Keine gleichmäßige Verteilung, keine erfundenen Zeiten und kein externer Audio-Upload.
7. Anwenden:

\`\`\`bash
npm run sync:words -- --dir "${normalizedDirectory}" --apply --strict
\`\`\`

8. Prüfe \`review/word-sync-report.json\`: mindestens 98 % Wortabdeckung, mindestens 0,85 Konfidenz und keine leere Szene.
9. Nach einer neuen Audiodatei \`trim:pauses\`, \`sync:audio\` und den Codex-Wort-Sync erneut ausführen.
10. Danach visuelle Prüfung, \`finalize:reel --strict\`, \`validate:render\` und \`render:reel\` ausführen.

## Kreative Leitplanken

- schwierige Dinge sehr einfach und visuell erklären
- keine schulische Einleitung
- Hook-Bild sofort sichtbar
- innerhalb des Reels konsistente Bildwelt
- Bildwechsel am Sprechertext ausrichten
- direkte harte Schnitte ohne Verzögerung oder Schwarzbild
- Untertitel tief, aber nicht im Plattform-Bedienfeld
- keine Bewegung nur um der Bewegung willen
- kein Whoosh bei jedem Schnitt

## Übergabe an den Nutzer

Nach bestandener Inhaltsprüfung nur mitteilen:

- Pfad des Reel-Ordners
- Anzahl der Bildprompts
- gewählte Bildwelt
- Untertitel- und Effektplan vorhanden
- Voice-over und Bilder können extern erzeugt werden
- Dateien dürfen unsortiert nach \`inbox/audio/\` und \`inbox/images/\`
- nach dem Upload strafft Codex zuerst das Audio und prüft anschließend Audio-Cues und Wortzeiten lokal
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
