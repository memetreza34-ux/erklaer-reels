# Erklär-Reels

KI-gestützte Produktionspipeline für visuelle Erklär-Reels zu Politik, Gesellschaft, Geschichte, Psychologie, Körper und Biologie.

## Ziel von Version 1

Aus einem Thema oder deutschen Rohscript entsteht ein vollständiger Produktionsordner mit:

- geprüftem Voice-over-Script
- 8–12 Bildmomenten abhängig von der Länge
- einer konsistenten Bildwelt pro Reel
- englischen Bildprompts mit optionalem deutschem Schlüsseltext
- Audio-Cues für synchronisierte Bildwechsel
- Untertitelplan
- Effektplan für Zooms, Kamerabewegungen, Übergänge und Sounds
- Master-Timeline
- renderer-neutralem Render-Plan in Sekunden und Frames
- technischer Bildprüfung und manueller visueller Abnahme
- Cover, Caption, Quellen und Qualitätsberichten
- Inbox für extern erzeugte Bilder und Audio
- automatischer Zuordnung unsortierter Dateien

Der Nutzer erzeugt Voice-over und Bilder außerhalb des Repositories. Das Repository plant, organisiert, synchronisiert und prüft die Produktion. Eine fertige MP4-Datei wird noch nicht gerendert.

## Wichtigste Produktionsregeln

- Hook-Bild ab Sekunde 0
- 35–44 Sekunden: normalerweise 8–10 Bildmomente
- 45–55 Sekunden: normalerweise 10–12 Bildmomente
- sichtbare Veränderung ungefähr alle 3,5–5 Sekunden
- Bildwechsel normalerweise 0,1–0,3 Sekunden vor dem passenden `audioCue`
- Untertitel in der unteren Mitte bei ungefähr 65–75 % der Bildhöhe
- Untertitel normalerweise 3–6 Wörter und höchstens zwei Zeilen
- Zoom normalerweise 2–6 %, maximal 8 %
- Schwenk maximal 4 %
- sauberer Schnitt als Standard
- null bis zwei dezente Soundeffekte pro Szene
- Voice-over hat Vorrang
- Hintergrundmusik standardmäßig ausgeschaltet
- Zielformat 1080 × 1920, Mindestauflösung 720 × 1280
- wichtige Motive mindestens 6 % von den Seiten, 8 % von oben und 18 % von unten entfernt

## Produktionsablauf

```text
Thema oder Rohscript
        ↓
Reel-Arbeitsordner erstellen
        ↓
Codex plant Script, Szenen, Prompts, Untertitel und Effekte
        ↓
strenge Inhaltsprüfung
        ↓
Nutzer erzeugt Voice-over und Bilder extern
        ↓
alle Dateien unsortiert in die Inbox legen
        ↓
Codex ordnet Bilder, Cover und Audio zu
        ↓
Master-Timeline erzeugen
        ↓
echte Audio-Cues eintragen und synchronisieren
        ↓
technische Bildprüfung
        ↓
Codex prüft jedes Bild visuell und füllt die Prüfliste
        ↓
strenge visuelle Abnahme
        ↓
Render-Plan freigeben
```

## Voraussetzungen

- Node.js 20 oder neuer
- optional: `ffprobe` für automatische Ermittlung der Audiodauer
- keine zusätzlichen npm-Pakete erforderlich

## 1. Neues Reel anlegen

```bash
npm run create:reel -- \
  --title "Was bedeutet links und rechts?" \
  --script-file input/script.txt \
  --date 2026-07-30 \
  --scenes 10
```

`--scenes` unterstützt 8 bis 12. Ohne Angabe werden 10 Bildmomente angelegt.

Codex bearbeitet anschließend insbesondere:

- `script/final-script.txt`
- `script/voice-script.txt`
- `scenes/scene-index.json`
- jede `scenes/scene-XX/scene.json`
- jede `scenes/scene-XX/image-prompt.txt`
- `subtitles/subtitle-plan.json`
- `effects/effects-plan.json`
- `cover/cover.json`
- `cover/cover-prompt.txt`
- `caption/caption.txt`
- `sources/sources.md`

## 2. Inhalt prüfen

```bash
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

Die Prüfung kontrolliert unter anderem Szenen-IDs, Stilwahl, Voice-over, Audio-Cues, Untertitel, Bildprompts, Zoomgrenzen, Übergänge, Sounds, Cover, Caption und Quellen.

## 3. Externe Dateien unsortiert ablegen

```text
reel-ordner/
└── inbox/
    ├── images/
    │   ├── IMG_8241.png
    │   ├── download-final.jpg
    │   ├── bild-neu-2.webp
    │   └── cover-version3.png
    └── audio/
        └── voice-final.mp3
```

Dateinamen und Reihenfolge sind egal.

## 4. Assets erkennen und übernehmen

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL"
npm run organize:assets -- --dir "PFAD-ZUM-REEL" --apply
```

Das System kopiert erkannte Bilder in die passenden Szenenordner, benennt sie stabil um und behandelt Cover und Audio getrennt. Dateien unter 0,75 Konfidenz bleiben unangetastet.

## 5. Master-Timeline erzeugen

```bash
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
```

Der Befehl:

- sucht die übernommene Voice-over-Datei
- liest mit `ffprobe` automatisch die Audiodauer, sofern verfügbar
- erzeugt bei Bedarf `timeline/audio-sync.json`
- verteilt Szenen zunächst anhand der geplanten Dauer
- führt Untertitel, Übergänge, Kamerabewegungen und Sounds zusammen
- schreibt `timeline/timeline-plan.json`
- schreibt `render/render-plan.json`
- schreibt `review/final-video-report.json`
- aktualisiert `status.json`

Ohne `ffprobe` kann die Audiodauer direkt angegeben werden:

```bash
npm run sync:audio -- \
  --dir "PFAD-ZUM-REEL" \
  --audio-duration 48.7
```

## 6. Audio-Cues exakt synchronisieren

Nach dem ersten Timeline-Lauf ergänzt Codex `timeline/audio-sync.json`:

```json
{
  "audioDurationSeconds": 48.7,
  "cueTimings": [
    {
      "sceneId": "scene-03",
      "audioCue": "Beim Warten",
      "cueTimeSeconds": 8.4,
      "leadInSeconds": 0.2,
      "confidence": 0.98
    }
  ]
}
```

Das Bild beginnt in diesem Beispiel bei 8,2 Sekunden. Anschließend:

```bash
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

### Timing-Status

- `estimated` – nur geplante Szenendauern bekannt
- `audio-duration-synced` – echte Audiodauer bekannt, aber noch nicht alle Cues exakt markiert
- `audio-synced` – Audiodauer und alle relevanten Audio-Cues verifiziert

## 7. Technische Bildprüfung

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL"
```

Der Befehl liest PNG-, JPG-, JPEG- und WEBP-Metadaten ohne zusätzliche Pakete und prüft:

- Bilddatei vorhanden
- Format lesbar und unterstützt
- Hochformat
- Seitenverhältnis 9:16
- Mindestauflösung 720 × 1280
- empfohlene Auflösung 1080 × 1920
- Untertitelposition in der sicheren Zone
- ob Zoom und Schwenk zu viel Rand abschneiden könnten

Er erzeugt:

```text
review/
├── visual-inspection.json
└── visual-quality-report.json
```

## 8. Manuelle visuelle Abnahme durch Codex

Codex öffnet jedes Szenenbild und das Cover und füllt in `review/visual-inspection.json` diese Punkte aus:

- `mainSubjectSafe`
- `textReadable`
- `textAccurate`
- `subtitleCollisionFree`
- `platformUiSafe`
- `motionSafe`
- `styleConsistent`

Nur vollständig bestandene Bilder erhalten:

```json
{
  "reviewer": "codex-vision",
  "status": "passed"
}
```

Bei einem Fehler wird `status` auf `needs-fix` gesetzt und eine konkrete Notiz ergänzt. Danach:

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
```

Der strenge Modus besteht erst, wenn alle Szenenbilder und das Cover vorhanden, technisch geeignet und manuell freigegeben sind.

## 9. Render-Plan

`render/render-plan.json` enthält:

- Format `1080 × 1920`
- `30 FPS`
- gesamte Dauer in Sekunden und Frames
- Voice-over-Datei
- Bildpfad pro Szene
- Start- und Endzeit pro Szene
- Start- und Endframe
- Übergang
- Zoom oder Schwenk
- Untertitel
- Soundeffekte

Der Status lautet erst `ready-for-renderer`, wenn Voice-over und alle Szenenbilder bereit sind. Die tatsächliche Produktionsfreigabe erfolgt zusätzlich erst nach bestandener strenger visueller Abnahme.

## 10. Qualitätsberichte

`review/final-video-report.json` prüft die zeitliche und strukturelle Timeline. `review/visual-quality-report.json` prüft die technischen Bilddaten und den Status der visuellen Einzelabnahme.

Geprüft werden unter anderem:

- Hook beginnt bei Sekunde 0
- jede Szene besitzt eine positive Dauer
- keine unbeabsichtigten Lücken oder Überlappungen
- Untertitel überlappen sich nicht
- echte Audiodauer ist bekannt
- Audio-Cues sind synchronisiert
- alle Szenenbilder sind vorhanden
- Bilder besitzen das richtige Format und Seitenverhältnis
- wichtige Inhalte bleiben trotz Untertiteln, Plattform-UI und Bewegung sichtbar

## Befehle

```bash
npm run create:reel
npm run prepare:reel
npm run validate:reel
npm run check:content
npm run organize:assets
npm run build:timeline
npm run sync:audio
npm run check:visuals
npm run status:reel
npm test
```

## Wichtige Dateien

- `CODEX_TASK.md` – kompletter Codex-Workflow
- `AGENTS.md` – verbindliche Projektregeln
- `knowledge/production-rules.md` – Produktionsregeln
- `knowledge/effects-rules.md` – Zoom-, Übergangs- und Soundregeln
- `knowledge/timeline-rules.md` – Master-Timeline und Audio-Sync
- `knowledge/visual-quality-rules.md` – sichere Zonen und manuelle Bildabnahme
- `config/visual-quality-rules.json` – maschinenlesbare Bildgrenzen
- `src/core/asset-ingest.js` – Asset-Zuordnung
- `src/core/timeline.js` – Timeline-, Audio-Sync-, Render- und QC-Logik
- `src/core/image-metadata.js` – Bildmaß-Erkennung
- `src/core/visual-qc.js` – technische und manuelle visuelle Qualitätsprüfung
- `src/cli/check-visuals.js` – CLI für die Bildabnahme

## Noch nicht enthalten

- automatische Bild- oder Audioerzeugung
- automatisches Forced Alignment gesprochener Phrasen
- vollständig automatische inhaltliche Bilderkennung ohne Codex-Vision
- fertiges Remotion-Rendering
- automatische Social-Media-Veröffentlichung

Die technischen Bilddaten werden automatisch geprüft. Lesbarkeit, Textfehler, Motivposition und Stilkonsistenz erfordern weiterhin eine echte visuelle Betrachtung durch Codex; das Repository erfindet dafür keine Ergebnisse.
