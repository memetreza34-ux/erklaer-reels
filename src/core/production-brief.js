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
    version: 5,
    reelId: reel.reelId,
    title: reel.title,
    createdAt: new Date().toISOString(),
    phase: 'content-production',
    tasks: [
      { id: 'script-final', label: 'Finales Voice-over-Script prüfen und schreiben', status: 'pending' },
      { id: 'style-select', label: 'Passende Bildwelt auswählen und in reel.json eintragen', status: 'pending' },
      { id: 'scenes-fill', label: `${scenes.length} Szenen mit Audio-Cues vollständig planen`, status: 'pending' },
      { id: 'prompts-write', label: `${scenes.length} englische Bildprompts schreiben`, status: 'pending' },
      { id: 'subtitles-write', label: 'Tiefe Untertitel für spätere Gemini-Wortzeiten planen', status: 'pending' },
      { id: 'effects-write', label: 'Zooms, Kamerabewegungen, Übergänge und Soundeffekte planen', status: 'pending' },
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
- Gelbe Wortmarkierung: **nach dem Voice-over automatisch über Gemini**
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
    - die finalen Cues werden später von \`sync:words\` aus dem echten Voice-over neu erzeugt
11. Fülle \`effects/effects-plan.json\` vollständig aus. Nicht jede Szene braucht Bewegung oder Sound. Zoom maximal 8 %, Schwenk maximal 4 %, \`cut\` als Standard.
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

2. Timeline und Szenen-Cues synchronisieren:

\`\`\`bash
npm run build:timeline -- --dir "${normalizedDirectory}"
npm run sync:audio -- --dir "${normalizedDirectory}" --strict
\`\`\`

3. Exakte Wortzeiten automatisch mit Gemini erzeugen:

\`\`\`bash
npm run sync:words -- --dir "${normalizedDirectory}" --strict
\`\`\`

4. Prüfe \`review/word-sync-report.json\`. Mindestens 98 % Wortabdeckung und keine leere Szene.
5. Nach einer Pausenkürzung oder neuer Audiodatei \`sync:audio\` und \`sync:words\` erneut ausführen.
6. Danach visuelle Prüfung, \`finalize:reel --strict\`, \`validate:render\` und \`render:reel\` ausführen.

## Kreative Leitplanken

- schwierige Dinge sehr einfach und visuell erklären
- keine schulische Einleitung
- Hook-Bild sofort sichtbar
- innerhalb des Reels konsistente Bildwelt
- Bildwechsel am Sprechertext ausrichten
- Untertitel tief, aber nicht im Plattform-Bedienfeld
- keine Bewegung nur um der Bewegung willen
- keine auffälligen Übergänge und kein Whoosh bei jedem Schnitt

## Übergabe an den Nutzer

Nach bestandener Inhaltsprüfung nur mitteilen:

- Pfad des Reel-Ordners
- Anzahl der Bildprompts
- gewählte Bildwelt
- Untertitel- und Effektplan vorhanden
- Voice-over und Bilder können extern erzeugt werden
- Dateien dürfen unsortiert nach \`inbox/audio/\` und \`inbox/images/\`
- nach dem Upload werden Audio-Cues und gelbe Wortmarkierung automatisch synchronisiert
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
