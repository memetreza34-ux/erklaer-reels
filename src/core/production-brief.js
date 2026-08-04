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

  const checklist = {
    version: 11,
    reelId: reel.reelId,
    title: reel.title,
    createdAt: new Date().toISOString(),
    phase: 'content-production',
    tasks: [
      { id: 'script-final', label: 'Finales Voice-over-Script prüfen und schreiben', status: 'pending' },
      { id: 'style-select', label: 'Passende Bildwelt auswählen und in reel.json eintragen', status: 'pending' },
      { id: 'scenes-fill', label: `${scenes.length} Szenen mit Audio-Cues vollständig planen`, status: 'pending' },
      { id: 'prompts-write', label: `${scenes.length} natürliche englische Bildprompts ohne leeren Mittelstreifen schreiben`, status: 'pending' },
      { id: 'prompts-export', label: 'Alle Szenenprompts chronologisch exportieren', status: 'pending' },
      { id: 'subtitles-write', label: 'Weiße Untertitel unten ohne Gelb und ohne Hintergrundbox planen', status: 'pending' },
      { id: 'effects-write', label: 'Dezente Bewegungen, harte Schnitte und Soundeffekte planen', status: 'pending' },
      { id: 'cover-write', label: 'Cover-Idee und Cover-Prompt schreiben', status: 'pending' },
      { id: 'caption-write', label: 'Caption erstellen', status: 'pending' },
      { id: 'sources-write', label: 'Quellen und Unsicherheiten dokumentieren', status: 'pending' },
      { id: 'content-check', label: 'npm run check:content erfolgreich ausführen', status: 'pending' }
    ]
  };

  const normalizedDirectory = reelDirectory.split(path.sep).join('/');
  const brief = `# Codex-Produktionsauftrag: ${reel.title}

## Ziel

Erstelle aus dem deutschen Rohscript ein vollständiges Produktionspaket. Bilder und Audio werden extern erzeugt und anschließend direkt in die vorgesehenen Cover-, Szenen- und Audioordner gelegt.

## Ausgangsdaten

- Reel-ID: \`${reel.reelId}\`
- Titel: **${reel.title}**
- Bildmomente: **${scenes.length}**
- Format: **9:16**
- Voice-over: **Deutsch**
- Bildprompts: **Englisch**
- Untertitel: **\`${SUBTITLE_STYLE.position}\`, exakt ${SUBTITLE_STYLE.verticalPositionPercent} % Bildhöhe**
- Untertitelfarbe: **${SUBTITLE_STYLE.textColor}**
- Wortmarkierung: **ausgeschaltet**
- Hintergrundbox: **keine, ${SUBTITLE_STYLE.backgroundColor}**
- Übergänge: **Hook ohne Übergang, danach nur harte Schnitte**
- Audio-Pacing: **Pausen kürzen und exakt ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}x**
- Lautheit: **${AUDIO_PACING_STYLE.loudnessTargetLufs} LUFS, höchstens ${AUDIO_PACING_STYLE.truePeakDbtp} dBTP**
- Hintergrundmusik: **aus**

## Rohscript

> ${rawScript.replace(/\n/g, '\n> ')}

## Verbindlicher Ablauf

1. Lies \`AGENTS.md\`, \`knowledge/production-rules.md\`, \`knowledge/effects-rules.md\`, \`knowledge/subtitle-pacing-rules.md\` und die Konfigurationen.
2. Überarbeite das Script auf ungefähr 35–55 Sekunden. Bevorzugter Einstieg: \`THEMA einfach erklärt:\`.
3. Schreibe den finalen Text nach \`script/final-script.txt\` und \`script/voice-script.txt\`.
4. Plane genau ${scenes.length} Bildmomente mit Hook ab Sekunde 0 und sichtbaren Änderungen ungefähr alle 3,5–5 Sekunden.
5. Wähle eine Hauptbildwelt und trage \`visualStyleId\` sowie \`visualStyleReason\` ein.
6. Aktualisiere \`scenes/scene-index.json\` und jede \`scene.json\` synchron.
7. Jede Szene benötigt Titel, Sprechertext, visuelle Idee, Kontinuitätsnotizen, Audio-Cue, Lead-in, Untertitel-Cues, Untertitelposition, Dauer und erwarteten Bildnamen.
8. Schreibe für jede Szene einen vollständigen englischen 9:16-Bildprompt.

### Pflichtregeln für Bilder

- natürliche zusammenhängende Komposition
- Hauptmotive dürfen die Bildmitte normal nutzen
- kein künstlich leerer horizontaler Mittelstreifen
- keine getrennte obere und untere Bildhälfte nur wegen Untertiteln
- keine riesigen leeren Bäume, Pfeile oder Flächen als Textplatzhalter
- keine unerwünschten englischen Wörter, Fantasie-Labels, Logos oder Wasserzeichen
- sichtbarer Text nur bei ausdrücklicher Notwendigkeit und dann korrekt auf Deutsch
- nur kleine unverzichtbare Details nicht direkt hinter dem unteren Untertitelbereich platzieren

9. Exportiere alle Szenenprompts:

\`\`\`bash
npm run export:prompts -- --dir "${normalizedDirectory}" --strict
\`\`\`

10. Fülle \`subtitles/subtitle-plan.json\` mit:

- \`position: "${SUBTITLE_STYLE.position}"\`
- \`verticalPositionPercent: ${SUBTITLE_STYLE.verticalPositionPercent}\`
- \`textColor: "${SUBTITLE_STYLE.textColor}"\`
- \`highlightCurrentWord: false\`
- \`highlightColor: "${SUBTITLE_STYLE.highlightColor}"\`
- \`backgroundColor: "${SUBTITLE_STYLE.backgroundColor}"\`
- 3–6 Wörter und höchstens zwei Zeilen
- keine Einzelwortzeiten erforderlich

11. Fülle \`effects/effects-plan.json\`:

- Szene 1: \`none\`, Dauer 0
- danach: \`cut\`, Dauer 0
- keine Fades, Schwarzblenden oder Slides
- Zoom maximal 8 %, Schwenk maximal 4 %
- nicht jede Szene braucht Bewegung oder Sound

12. Fülle Cover, Caption und Quellen aus.
13. Prüfe streng:

\`\`\`bash
npm run check:content -- --dir "${normalizedDirectory}" --strict
\`\`\`

14. Behebe alle Fehler und markiere die Checkliste als erledigt.

## Nach Eintreffen von Bildern und Voice-over

Bevorzugte Ablage:

\`\`\`text
scenes/scene-01/scene-01.png
scenes/scene-02/scene-02.png
...
cover/cover.png
audio/<voiceover-datei>
\`\`\`

Danach:

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

\`sync:words\` ist ohne Wort-Highlight nicht erforderlich.

## Übergabe an den Nutzer

Nach bestandener Inhaltsprüfung mitteilen:

- Pfad des Reel-Ordners
- Anzahl der Bildprompts
- Prompt-Sammeldatei vorhanden
- gewählte Bildwelt
- Voice-Script, Caption, Cover- und Untertitelplan vorhanden
- Bilder direkt in die passenden Szenenordner legen
- Voice-over in den Audioordner legen
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
