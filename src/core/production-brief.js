import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { AUDIO_PACING_STYLE } from '../shared/audio-pacing-style.js';
import { FIXED_VISUAL_STYLE_ID, FIXED_VISUAL_WORLD_LABEL } from '../shared/fixed-visual-world.js';
import { plannedImageCount } from '../shared/visual-moments.js';

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function imageTargetForScenes(sceneCount) {
  if (sceneCount === 8) return '19–21';
  if (sceneCount === 9) return '20–22';
  if (sceneCount === 10) return '21–24';
  return 'inhaltlich passend';
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
  const rawScript = (await readFile(rawScriptPath, 'utf8')).trim();
  const productionDirectory = path.join(reelDirectory, 'production');
  await mkdir(productionDirectory, { recursive: true });

  const currentPlannedImages = plannedImageCount(scenes);
  const targetImages = imageTargetForScenes(scenes.length);
  const imageCueLeadSeconds = Number(editTiming.imageCueLeadSeconds ?? 0.08);
  const sceneCueLeadSeconds = Number(editTiming.sceneCueLeadSeconds ?? 0.10);
  const sfxPreRollSeconds = Number(editTiming.sfxPreRollSeconds ?? 0.04);

  const checklist = {
    version: 25,
    reelId: reel.reelId,
    title: reel.title,
    createdAt: new Date().toISOString(),
    phase: 'content-production',
    subtitlesEnabled: false,
    imageCountMode: 'adaptive-dense-v2',
    visualDensityVersion: 2,
    visualWorldMode: 'fixed',
    visualStyleId: FIXED_VISUAL_STYLE_ID,
    tasks: [
      { id: 'topic-focus', label: 'Thema gegen THEMEN_HISTORIE.md und REEL_THEMENFOKUS.md prüfen', status: 'pending' },
      { id: 'script-final', label: 'Voice-over mit 155–175 Wörtern und direktem Hook fertigstellen', status: 'pending' },
      { id: 'visual-world-fixed', label: `Feste Reel-Bildwelt ${FIXED_VISUAL_WORLD_LABEL} für alle Bildmomente beibehalten`, status: 'pending' },
      { id: 'image-density-plan', label: `${scenes.length} Szenen auf Adaptive Dense V2 planen; Ziel ${targetImages} Bilder, 2 Hook-Bilder und danach 2–3 je Szene nach Inhalt`, status: 'pending' },
      { id: 'image-audio-map', label: 'Jeden Bildmoment genau einem gesprochenen Textbereich und audioCue zuordnen', status: 'pending' },
      { id: 'image-text-plan', label: 'Bild 01 mit deutscher Headline; spätere imageText optional, max. 4 Wörter', status: 'pending' },
      { id: 'prompts-write', label: `Für jeden Bildmoment einen ausführlichen englischen 9:16-Prompt im Stil ${FIXED_VISUAL_STYLE_ID} schreiben`, status: 'pending' },
      { id: 'prompts-export', label: 'Seriellen Google-Flow-Masterprompt exportieren', status: 'pending' },
      { id: 'effects-write', label: 'Dezente Motion für jeden Bildmoment und SFX für jeden sichtbaren Wechsel planen', status: 'pending' },
      { id: 'caption-write', label: 'Plattformneutrale Caption erstellen', status: 'pending' },
      { id: 'sources-write', label: 'Mindestens zwei hochwertige HTTPS-Quellen mit konkreter Belegzuordnung dokumentieren', status: 'pending' },
      { id: 'content-check', label: 'check:content --strict tatsächlich ausführen und nur bei Erfolg als bestanden markieren', status: 'pending' }
    ]
  };

  const normalizedDirectory = reelDirectory.split(path.sep).join('/');
  const brief = `# Produktionsauftrag: ${reel.title}

## Priorität

Lies zuerst \`CURRENT_WORKFLOW.md\`, \`REEL_THEMENFOKUS.md\`, \`THEMEN_HISTORIE.md\`, \`knowledge/fixed-visual-world.md\` und \`config/production-quality-gates.json\`.

## Phase 1 — Inhalt

- Thema muss zum Fokus **Politik, Geschichte, Geografie und Systeme einfach erklärt** passen, außer der Nutzer verlangt ausdrücklich etwas anderes.
- 55–60 Sekunden Voice-over, 155–175 deutsche Wörter, ein Erzähler.
- ${scenes.length} narrative Szenen; neue Pakete verwenden \`adaptive-dense-v2\` / \`visualDensityVersion: 2\`.
- Ziel für ${scenes.length} Szenen: **${targetImages} Bilder**.
- Hook standardmäßig 2 Bildmomente; weitere Szenen 2 oder 3 nur bei echtem neuen visuellen Gedanken.
- **Ein Bild = eine klare gesprochene visuelle Kernaussage.**
- Jede interne Bildphase besitzt ein eigenes tatsächlich gesprochenes \`audioCue\`.
- technische Mindestdauer später ca. ${timing.minimumImagePhaseSeconds ?? 2.2}s; häufig gut 2,5–3,8s; ab ca. ${timing.splitReviewThresholdSeconds ?? 4.8}s Split prüfen.

Der aktuelle Scaffold enthält momentan ${currentPlannedImages} Bildmomente. Falls er noch aus einem Legacy-Workspace stammt, muss er vor Phase-1-Abschluss auf Adaptive Dense V2 umgebaut werden.

## Bildwelt

Verbindlich: **${FIXED_VISUAL_WORLD_LABEL}** (\`${FIXED_VISUAL_STYLE_ID}\`).

- 9:16, clean, serious, minimal 2D Countryball Explainer
- dicke schwarze Konturen, flache kontrollierte Farben, minimale Schatten
- perfekt runde Kugelfiguren nur wenn ein Akteur sinnvoll ist
- bei Politik/Geografie dürfen passende Flaggen, Karten, Grenzen, Parlamente, Dokumente, Kronen, Verträge, Geld-/Handelssymbole usw. natürlich eingesetzt werden
- 0–3 passende Zusatzobjekte, jedes mit inhaltlichem Grund
- zwischen minimal-symbolic, supported-explainer und simple-mini-scene variieren
- keine normalen illustrierten Menschen, realistischen Räume, Foto-/3D-/Pixar-/Anime-Welten oder winzigen Deko-Kugeln
- Prompts Englisch, sichtbarer Text Deutsch
- Bild 01 braucht eine starke Headline; spätere Bilder dürfen textfrei sein und haben bei Text max. 4 Wörter

Die Prompts dürfen etwas länger und konkreter sein: Hauptmotiv, Requisiten, räumliche Anordnung, Hintergrund, Perspektive, gewünschte Aussage und klare Negativregeln beschreiben.

## Bild↔Audio

Vor Phase 2 muss \`99-technik/BILD_AUDIO_ZUORDNUNG.json\` jeden Bildmoment chronologisch einem exakten \`spokenText\`-Bereich zuordnen. Reale Sekunden bleiben bis Phase 3 offen.

Phase 3 fragt nicht jeden Anchor einzeln ab. Nach dem finalen Voice-over erzeugt \`auto-align:reel\` automatisch monotone Startwerte aus Reihenfolge, gesprochenen Textbereichen und echter Audiodauer. Der finale Render wird kurz auf sichtbar falsche Cuts geprüft; nur echte Script↔Audio-Konflikte blockieren.

## Motion / SFX

- jeder Bildmoment sichtbar, aber dezent bewegt
- harte Cuts
- Szenencut ca. ${sceneCueLeadSeconds.toFixed(2)}s vor dem Sprachbeginn
- interner Bildcut ca. ${imageCueLeadSeconds.toFixed(2)}s davor
- SFX ca. ${sfxPreRollSeconds.toFixed(2)}s vor sichtbarem Cut
- nur Soundtypen aus \`config/sound-library.json\`
- keine Hintergrundmusik

## Phase-1-Abschluss

\`\`\`bash
npm run export:prompts -- --dir "${normalizedDirectory}" --strict
npm run check:content -- --dir "${normalizedDirectory}" --strict
\`\`\`

Nicht ausgeführte Checks niemals als bestanden melden.

## Phase 3 — Simple Mode nach Nutzerassets

Ein Auftrag reicht:

\`\`\`bash
npm run phase3:reel -- --dir "${normalizedDirectory}"
\`\`\`

Intern: Assets → schneller Einmal-Check → Audio 1,10x/−16 LUFS → Auto-Alignment → Timeline/SFX → Finalizer → Render → kurzer Endcheck. Keine schriftliche QC-Begründung und kein zweiter Bild-Prüfpass pro Asset.

Audio: ${AUDIO_PACING_STYLE.playbackRate.toFixed(2)}x, Pitch erhalten, ${AUDIO_PACING_STYLE.loudnessTargetLufs} LUFS, max. ${AUDIO_PACING_STYLE.truePeakDbtp} dBTP, höchstens 0,25s Endstille plus separater 0,5–0,7s Schlussbild-Hold.

## Rohscript

> ${rawScript.replace(/\n/g, '\n> ')}
`;

  await writeFile(path.join(productionDirectory, 'agent-task.md'), `${brief}\n`, 'utf8');
  await writeJson(path.join(productionDirectory, 'checklist.json'), checklist);

  return {
    reelDirectory,
    taskFile: path.join(productionDirectory, 'agent-task.md'),
    checklistFile: path.join(productionDirectory, 'checklist.json')
  };
}
