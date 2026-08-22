import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

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
  const qualityGates = await readJson(path.resolve('config', 'production-quality-gates.json'));
  const timing = qualityGates.sceneTiming;
  const matching = qualityGates.assetMatching;
  const rawScript = (await readFile(rawScriptPath, 'utf8')).trim();
  const productionDirectory = path.join(reelDirectory, 'production');
  await mkdir(productionDirectory, { recursive: true });

  const preferredImageTextMinimum = Math.ceil(scenes.length * 0.55);
  const preferredImageTextMaximum = Math.floor(scenes.length * 0.85);

  const checklist = {
    version: 18,
    reelId: reel.reelId,
    title: reel.title,
    createdAt: new Date().toISOString(),
    phase: 'content-production',
    subtitlesEnabled: false,
    tasks: [
      { id: 'script-final', label: 'Voice-over mit 155–175 Wörtern und starkem Ende fertigstellen', status: 'pending' },
      { id: 'style-select', label: 'Nach dem fertigen Script die passendste Bildwelt auswählen und begründen', status: 'pending' },
      { id: 'scenes-fill', label: `${scenes.length} klare Ein-Moment-Szenen mit Audio-Cues planen`, status: 'pending' },
      { id: 'scene-timing-balance', label: `Hook ${timing.hookSeconds.min}–${timing.hookSeconds.max}s, normale Szenen ${timing.standardSeconds.min}–${timing.standardSeconds.max}s und Schlussbild-Nachlauf ${timing.postVoiceHoldSeconds}s planen`, status: 'pending' },
      { id: 'image-text-plan', label: `In ungefähr ${preferredImageTextMinimum}–${preferredImageTextMaximum} passenden Szenen kurzen deutschen Bildtext mit 1–5 Wörtern planen`, status: 'pending' },
      { id: 'ending-check', label: 'Prüffrage und einprägsamen Abschlusssatz auf zwei Szenen verteilen', status: 'pending' },
      { id: 'prompts-write', label: `${scenes.length} natürliche englische Bildprompts mit exakt angegebenem deutschem Bildtext schreiben`, status: 'pending' },
      { id: 'prompts-export', label: 'Cover und alle Szenenprompts chronologisch exportieren', status: 'pending' },
      { id: 'subtitles-disabled', label: 'Untertitel deaktiviert lassen; keine Subtitle-Cues und keinen Word-Sync erzeugen', status: 'pending' },
      { id: 'effects-write', label: 'Dezente Bewegungen, harte Schnitte und Soundeffekte planen', status: 'pending' },
      { id: 'asset-matching-plan', label: `Zweistufige visuelle Bildzuordnung mit mindestens ${matching.minimumConfidence} Konfidenz vorbereiten`, status: 'pending' },
      { id: 'cover-write', label: 'Cover-Idee und Cover-Prompt schreiben', status: 'pending' },
      { id: 'caption-write', label: 'Caption erstellen', status: 'pending' },
      { id: 'sources-write', label: 'Quellen und Unsicherheiten dokumentieren', status: 'pending' },
      { id: 'content-check', label: 'npm run check:content --strict erfolgreich ausführen', status: 'pending' }
    ]
  };

  const normalizedDirectory = reelDirectory.split(path.sep).join('/');
  const brief = `# Codex-Produktionsauftrag: ${reel.title}

## Ziel

Erstelle ein vollständiges Erklär-Reel mit ungefähr einer Minute Voice-over-Laufzeit. Bilder und Audio werden extern erzeugt. Vor dem Render muss jedes Bild zweifach visuell gegen seine konkrete Szene geprüft werden. **Das Reel wird vollständig ohne Untertitel produziert und gerendert.**

## Ausgangsdaten

- Reel-ID: \`${reel.reelId}\`
- Titel: **${reel.title}**
- Bildmomente: **${scenes.length}**
- Voice-over-Zieldauer: **55–60 Sekunden**
- Zieltext: **155–175 Wörter**
- Format: **9:16**
- Voice-over: **Deutsch**
- Bildprompts: **Englisch**
- geplanter Bildtext: **Deutsch, meistens 1–5 Wörter in ungefähr ${preferredImageTextMinimum}–${preferredImageTextMaximum} passenden Szenen**
- Hook-Dauer: **${timing.hookSeconds.min}–${timing.hookSeconds.max} Sekunden**
- normale Szenen: **${timing.standardSeconds.min}–${timing.standardSeconds.max} Sekunden**
- Schlussszene inklusive Nachlauf: **${timing.finalSceneSecondsIncludingHold.min}–${timing.finalSceneSecondsIncludingHold.max} Sekunden**
- ruhiger Nachlauf nach Sprecherende: **${timing.postVoiceHoldSeconds} Sekunden**
- Bildzuordnung: **mindestens ${matching.minimumConfidence} Konfidenz, zwei visuelle Durchgänge**
- Untertitel: **deaktiviert**
- Word-Sync: **nicht erforderlich**
- Audio-Pacing: **exakt ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}x**
- Lautheit: **${AUDIO_PACING_STYLE.loudnessTargetLufs} LUFS, höchstens ${AUDIO_PACING_STYLE.truePeakDbtp} dBTP**
- Hintergrundmusik: **aus**

## Rohscript

> ${rawScript.replace(/\n/g, '\n> ')}

## Verbindlicher Ablauf

1. Lies \`CURRENT_WORKFLOW.md\`, \`AGENTS.md\`, \`CODEX_TASK.md\`, \`knowledge/production-rules.md\` und \`config/production-quality-gates.json\`.
2. Überarbeite das Script auf 155–175 Wörter und ungefähr 55–60 Sekunden bei 1,10x. Bevorzugter Einstieg: \`THEMA einfach erklärt:\`.
3. Das Ende benötigt zwei getrennte Stufen: eine persönliche Prüf- oder Erkenntnisfrage und danach eine konkrete Lösung mit kurzem einprägsamem Abschlusssatz.
4. Schreibe denselben finalen Text nach \`script/final-script.txt\` und \`script/voice-script.txt\`.
5. Plane genau ${scenes.length} Bildmomente. Hook ${timing.hookSeconds.min}–${timing.hookSeconds.max}s, normale Szenen ${timing.standardSeconds.min}–${timing.standardSeconds.max}s, letzte Szene inklusive Nachlauf ${timing.finalSceneSecondsIncludingHold.min}–${timing.finalSceneSecondsIncludingHold.max}s. Kein Erklärmoment unter ${timing.standardSeconds.min}s.
6. Der Dauersprung zwischen benachbarten Szenen darf höchstens ${timing.maximumAdjacentDifferenceSeconds}s betragen.
7. Jede Szene zeigt genau einen klaren Moment. Keine mehrfach kopierte Hauptperson und kein überladenes Anleitungspanorama.
8. Wähle erst nach dem fertigen Script die Hauptbildwelt und halte sie konsequent ein.
9. Aktualisiere \`scenes/scene-index.json\` und jede \`scene.json\` synchron.
10. Plane in ungefähr ${preferredImageTextMinimum}–${preferredImageTextMaximum} passenden Szenen kurzen deutschen Bildtext. Trage den exakten Wortlaut in \`scene.imageText\` ein.
11. Schreibe für jede Szene einen vollständigen englischen 9:16-Bildprompt. Wenn \`imageText\` gesetzt ist, fordere den exakten deutschen Text in Anführungszeichen an.

### Pflichtregeln für Bilder

- natürliche zusammenhängende Komposition über die volle 9:16-Fläche
- Hauptmotive dürfen die Bildmitte normal nutzen
- keine künstlich leere horizontale Zone für Untertitel
- keine getrennte obere und untere Bildhälfte
- keine gestapelten Panels oder mehrfach dargestellte Hauptperson
- geplanter sichtbarer Text ausschließlich korrekt auf Deutsch
- keine zusätzlichen englischen Wörter, Fantasie-Labels, Logos oder Wasserzeichen
- gewählte Hauptbildwelt, Figurenform, Konturen und Farbwelt durchgehend beibehalten

12. Exportiere Cover und alle Szenenprompts:

\`\`\`bash
npm run export:prompts -- --dir "${normalizedDirectory}" --strict
\`\`\`

13. Stelle sicher, dass \`reel.json\` \`subtitlesEnabled: false\` setzt und \`subtitles/subtitle-plan.json\` deaktiviert bleibt. Keine Cues erzeugen.
14. Fülle \`effects/effects-plan.json\`: Hook \`none\`, danach nur \`cut\` mit Dauer 0; Zoom maximal 8 %, Schwenk maximal 4 %.
15. Fülle Cover, Caption und Quellen aus.
16. Prüfe streng:

\`\`\`bash
npm run check:content -- --dir "${normalizedDirectory}" --strict
\`\`\`

## Nach Eintreffen von Bildern und Voice-over

### 1. Audio

\`\`\`bash
npm run trim:pauses -- --dir "${normalizedDirectory}" --speed ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}
\`\`\`

### 2. Bilder zweifach zuordnen

\`\`\`bash
npm run organize:assets -- --dir "${normalizedDirectory}"
\`\`\`

Für jedes Bild in \`inbox/asset-map.json\`: sichtbaren Inhalt beschreiben, mit Szene vergleichen, gegen Nachbarszenen prüfen und erst ab ${matching.minimumConfidence} Konfidenz final bestätigen. Dateinummern sind nur Routing-Hilfe.

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

Es gibt keinen \`sync:words\`-Schritt mehr. Vor dem Render müssen alle Szenenanker aus der finalen Audiodatei bestätigt sein. Die Timeline hängt nach dem letzten gesprochenen Wort automatisch ${timing.postVoiceHoldSeconds} Sekunden Schlussbild an. Die MP4 erst als fertig bezeichnen, wenn alle echten QC-Gates tatsächlich bestanden sind.
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
