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
    version: 3,
    reelId: reel.reelId,
    title: reel.title,
    createdAt: new Date().toISOString(),
    phase: 'content-production',
    tasks: [
      { id: 'script-final', label: 'Finales Voice-over-Script prüfen und schreiben', status: 'pending' },
      { id: 'style-select', label: 'Passende Bildwelt auswählen und in reel.json eintragen', status: 'pending' },
      { id: 'scenes-fill', label: `${scenes.length} Szenen mit Audio-Cues vollständig planen`, status: 'pending' },
      { id: 'prompts-write', label: `${scenes.length} englische Bildprompts schreiben`, status: 'pending' },
      { id: 'subtitles-write', label: 'Untertitelplan mit kurzen Sinnabschnitten erstellen', status: 'pending' },
      { id: 'effects-write', label: 'Zooms, Kamerabewegungen, Übergänge und Soundeffekte planen', status: 'pending' },
      { id: 'cover-write', label: 'Cover-Idee und Cover-Prompt schreiben', status: 'pending' },
      { id: 'caption-write', label: 'Caption erstellen', status: 'pending' },
      { id: 'sources-write', label: 'Quellen und Unsicherheiten dokumentieren', status: 'pending' },
      { id: 'content-check', label: 'npm run check:content erfolgreich ausführen', status: 'pending' }
    ]
  };

  const brief = `# Codex-Produktionsauftrag: ${reel.title}

## Ziel

Erstelle aus dem vorhandenen deutschen Rohscript ein vollständiges Produktionspaket für ein visuelles Erklär-Reel. Erzeuge **keine Bilder und kein Audio**. Der Nutzer erzeugt diese extern und legt sie später unsortiert in \`inbox/\` ab. Plane zusätzlich Zooms, Kamerabewegungen, Übergänge und Soundeffekte als Vorlage für den späteren Schnitt.

## Ausgangsdaten

- Reel-ID: \`${reel.reelId}\`
- Titel: **${reel.title}**
- Geplante Bildmomente: **${scenes.length}**
- Format: **9:16**
- Sprache des Voice-overs: **Deutsch**
- Sprache der Bildprompts: **Englisch**
- Untertitel: **standardmäßig aktiv, getrennt von den Bildern**
- Hintergrundmusik: **standardmäßig ausgeschaltet**
- Bewegungs- und Soundplan: **verbindlich in effects/effects-plan.json**

## Rohscript

> ${rawScript.replace(/\n/g, '\n> ')}

## Verbindlicher Ablauf

1. Lies zuerst \`AGENTS.md\`, \`knowledge/production-rules.md\`, \`knowledge/effects-rules.md\`, \`config/content-rules.json\`, \`config/effects-rules.json\` und \`config/image-styles.json\`.
2. Überarbeite das Rohscript zu einem einfachen, flüssigen Voice-over von ungefähr 35–55 Sekunden.
3. Schreibe denselben finalen Text nach \`script/final-script.txt\` und \`script/voice-script.txt\`.
4. Prüfe, ob die Bildanzahl zur erwarteten Dauer passt:
   - 35–44 Sekunden: normalerweise 8–10 Bildmomente
   - 45–55 Sekunden: normalerweise 10–12 Bildmomente
5. Wähle genau eine Hauptbildwelt für dieses Reel. Trage deren ID in \`reel.json.visualStyleId\` ein und ergänze \`visualStyleReason\`.
6. Plane genau ${scenes.length} Bildmomente. Das Hook-Bild muss ab Sekunde 0 sichtbar sein. Danach soll ungefähr alle 3,5–5 Sekunden ein Bildwechsel oder eine deutliche sichtbare Ergänzung erfolgen.
7. Teile nicht mechanisch in gleich lange Blöcke. Einfache Bilder dürfen kürzer stehen, komplexere Bilder etwas länger.
8. Aktualisiere für jede Szene sowohl \`scenes/scene-index.json\` als auch die jeweilige \`scenes/scene-XX/scene.json\`.
9. Jede Szene benötigt mindestens:
   - \`title\`
   - \`narration\`
   - \`imageText\` (leer lassen, wenn kein integrierter Text sinnvoll ist)
   - \`visualIdea\`
   - \`continuityNotes\`
   - \`audioCue\`: das gesprochene Wort oder die kurze Phrase, an der der Bildmoment inhaltlich beginnt
   - \`leadInSeconds\`: normalerweise 0.1 bis 0.3; Standard 0.2
   - \`subtitleCues\`: kurze Untertitel-Sinnabschnitte für diese Szene
   - \`subtitlePosition\`: normalerweise \`lower-middle\`
   - \`durationSeconds\`
   - \`expectedImageFileName\`
10. Schreibe für jede Szene einen vollständigen englischen Prompt nach \`scenes/scene-XX/image-prompt.txt\`.
11. Die Prompts müssen eigenständig verständlich sein, aber dieselbe Figurenlogik, Strichart und Bildwelt innerhalb des Reels beibehalten.
12. Nutze kurze deutsche Schlüsselwörter im Bild nur dann, wenn sie die Erklärung verbessern. Schreibe den exakten sichtbaren Text im Prompt aus.
13. Untertitel und spätere Bewegungseffekte dürfen nicht in die Bildprompts eingebrannt werden.
14. Fülle \`subtitles/subtitle-plan.json\` aus:
    - Position ungefähr bei 70 % der Bildhöhe, sichere Zone 65–75 %
    - normalerweise 3–6 Wörter pro Einblendung
    - höchstens zwei Zeilen
    - Sinnabschnitte statt Wort-für-Wort-Karaoke
    - integrierten Bildtext nicht wortgleich wiederholen
    - jeden Cue einer \`sceneId\` und einem \`audioCue\` zuordnen
    - Timing zunächst schätzen und als noch nicht final markieren, bis die echte Audiodatei vorliegt
15. Fülle \`effects/effects-plan.json\` vollständig aus. Genau ein Eintrag pro Szene:
    - \`sceneId\`
    - \`transitionIn\` mit Typ, Dauer und Begründung
    - \`cameraMotion\` mit Typ, Start-/Endskalierung, optionalem Schwenk, Easing und Begründung
    - \`soundEffects\` mit Typ, passendem \`audioCue\` oder visuellem Ereignis, geschätztem Zeitpunkt, Lautstärke und Begründung
    - nicht jede Szene braucht Bewegung oder Sound
    - Zoom normalerweise 2–6 Prozent, niemals mehr als 8 Prozent
    - Schwenk höchstens 4 Prozent
    - Hook ohne Übergang; optional dezenter Push-in
    - sauberer Schnitt als Standard, Crossfade nur kurz und begründet
    - null bis zwei Soundeffekte pro Szene
    - Hintergrundmusik ausgeschaltet lassen, sofern kein ausdrücklicher Grund vorliegt
    - Voice-over darf nie verdeckt werden
    - Timing zunächst als geschätzt markieren
16. Fülle \`cover/cover.json\` aus und schreibe \`cover/cover-prompt.txt\`. Das Cover muss auf kleiner Ansicht sofort lesbar sein.
17. Schreibe eine kopierbare Caption nach \`caption/caption.txt\`.
18. Dokumentiere verwendete Quellen und Unsicherheiten in \`sources/sources.md\`. Bei Politik, Geschichte, Psychologie, Körper und Biologie keine unbelegten Tatsachen erfinden.
19. Führe anschließend aus:

\`\`\`bash
npm run check:content -- --dir "${reelDirectory.split(path.sep).join('/')}" --strict
\`\`\`

20. Behebe alle gemeldeten Fehler. Markiere danach die Aufgaben in \`production/checklist.json\` als \`done\`.

## Kreative Leitplanken

- Ziel des Accounts: schwierige Dinge sehr einfach und visuell erklären.
- Keine schulische Einleitung und kein künstlich dramatischer Hook.
- Das erste Bild darf keine Einblendeverzögerung haben.
- Nicht jede Szene muss gleich aufgebaut sein.
- Innerhalb dieses Reels bleibt die Bildwelt konsistent.
- Zwischen unterschiedlichen Reels dürfen Stil und Figuren stark wechseln.
- Build-up-Bilder nur einsetzen, wenn eine echte schrittweise Entwicklung erklärt wird.
- Bildwechsel müssen zum gesprochenen Inhalt passen und normalerweise 0,1–0,3 Sekunden vor dem jeweiligen \`audioCue\` beginnen.
- Untertitel stehen in der unteren Mitte, nicht exakt mittig und nicht ganz unten.
- Zooms und Schwenks bleiben dezent und dürfen keine wichtigen Texte oder Motive abschneiden.
- Keine Bewegung nur um der Bewegung willen.
- Keine auffälligen Übergänge und nicht jeden Schnitt mit einem Whoosh vertonen.
- Keine realen Politiker oder Parteilogos, außer sie sind für eine sachliche historische Erklärung zwingend erforderlich.

## Übergabe an den Nutzer

Wenn die Inhaltsprüfung erfolgreich ist, teile dem Nutzer nur Folgendes mit:

- Pfad des Reel-Ordners
- Anzahl der Bildprompts
- gewählte Bildwelt
- dass Untertitel- und Effektplan vorhanden sind
- dass er nun das Voice-over und die Bilder extern erzeugen kann
- dass alle Dateien anschließend unsortiert nach \`inbox/audio/\` und \`inbox/images/\` dürfen
- dass Codex nach Einfügen der echten Audiodatei Bildwechsel, Untertitel, Zooms, Übergänge und Soundeffekte noch einmal synchron prüft
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
