# Erklär-Reels

KI-gestützte Produktionspipeline für visuelle Erklär-Reels zu Politik, Gesellschaft, Geschichte, Psychologie, Körper und Biologie.

Aus einem Thema oder deutschen Rohscript entsteht ein vollständiges Reel mit:

- geprüftem Voice-over-Script
- 8–12 Bildmomenten
- englischen Bildprompts
- tief positionierten Untertiteln
- exakt synchronisierter gelber Wortmarkierung
- Zooms, Schwenks, Übergängen und Sounds
- Master-Timeline und Audio-Synchronisierung
- technischer und visueller Qualitätsprüfung
- automatischer Zuordnung unsortierter Bilder und Audiodateien
- fertiger MP4-Datei über Remotion

Der Nutzer erzeugt Voice-over und Bilder extern. Das Repository übernimmt den restlichen Produktionsablauf.

## Voraussetzungen

- Node.js 20 oder neuer
- `npm install`
- optional `ffprobe` für automatische Audiodauer
- aktuelle Remotion-Lizenzbedingungen vor geschäftlicher Nutzung prüfen

## Produktionsregeln

- Hook-Bild ab Sekunde 0
- 35–44 Sekunden: normalerweise 8–10 Bildmomente
- 45–55 Sekunden: normalerweise 10–12 Bildmomente
- sichtbare Veränderung ungefähr alle 3,5–5 Sekunden
- Bildwechsel ungefähr 0,1–0,3 Sekunden vor dem passenden `audioCue`
- Untertitel standardmäßig bei 77 % der Bildhöhe
- sichere Untertitelzone 73–79 %
- 3–6 Wörter, höchstens zwei Zeilen
- aktuell gesprochenes Wort gelb mit `#FFD84D`
- gelbe Markierung nur anhand verifizierter `wordTimings`
- ohne exakte Wortzeiten bleibt der Cue vollständig weiß
- Zoom normalerweise 2–6 %, maximal 8 %
- Schwenk maximal 4 %
- sauberer Schnitt als Standard
- Voice-over hat Vorrang
- Hintergrundmusik standardmäßig ausgeschaltet
- Ausgabeformat 1080 × 1920 bei 30 FPS

## Vollständiger Ablauf

```text
Thema oder Rohscript
        ↓
Script, Szenen, Bildprompts, Untertitel und Effekte planen
        ↓
Inhalt streng prüfen
        ↓
Voice-over und Bilder extern erzeugen
        ↓
Dateien unsortiert in die Inbox legen
        ↓
Bilder, Cover und Audio inhaltsbasiert zuordnen
        ↓
Timeline, Audio-Cues und Wortzeiten synchronisieren
        ↓
Bilder technisch und visuell prüfen
        ↓
Reel vollständig freigeben
        ↓
Remotion rendert die fertige MP4
```

## 1. Neues Reel anlegen

```bash
npm run create:reel -- \
  --title "Was bedeutet links und rechts?" \
  --script-file input/script.txt \
  --date 2026-07-30 \
  --scenes 10
```

Danach bearbeitet Codex `production/agent-task.md` und führt aus:

```bash
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

## 2. Externe Dateien unsortiert ablegen

```text
reel-ordner/
└── inbox/
    ├── images/
    │   ├── beliebiges-bild.png
    │   ├── download-final.jpg
    │   └── cover-version3.webp
    └── audio/
        └── voice-final.mp3
```

Dateinamen und Reihenfolge sind egal.

## 3. Assets erkennen und übernehmen

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL"
npm run organize:assets -- --dir "PFAD-ZUM-REEL" --apply
```

Codex betrachtet jedes Bild und ordnet es anhand von Sprechertext, Bildtext, Motiv, Metapher und Komposition zu. Unter 0,75 Konfidenz wird nicht geraten.

## 4. Timeline, Audio und Wortzeiten synchronisieren

```bash
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
```

Ohne `ffprobe`:

```bash
npm run sync:audio -- \
  --dir "PFAD-ZUM-REEL" \
  --audio-duration 48.7
```

Codex trägt anschließend die echten Cue-Zeitpunkte in `timeline/audio-sync.json` ein.

Zusätzlich bekommt jeder Untertitel-Cue in `subtitles/subtitle-plan.json` exakte absolute Wortzeiten:

```json
{
  "id": "scene-01-subtitle-01",
  "text": "Warum holen manche Menschen",
  "startSeconds": 0.12,
  "endSeconds": 2.34,
  "verticalPositionPercent": 77,
  "highlightMode": "word",
  "highlightColor": "#FFD84D",
  "wordTimings": [
    { "text": "Warum", "startSeconds": 0.12, "endSeconds": 0.42 },
    { "text": "holen", "startSeconds": 0.48, "endSeconds": 0.72 },
    { "text": "manche", "startSeconds": 0.79, "endSeconds": 1.12 },
    { "text": "Menschen", "startSeconds": 1.18, "endSeconds": 1.63 }
  ]
}
```

Die gelbe Markierung wird nicht gleichmäßig über den Satz verteilt. Sie folgt ausschließlich den echten gesprochenen Wortanfängen. Fehlen gültige Wortzeiten, bleibt der Text weiß.

Danach:

```bash
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

Erzeugte Dateien:

- `timeline/timeline-plan.json`
- `render/render-plan.json`
- `review/final-video-report.json`

## 5. Bilder prüfen

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL"
```

Codex betrachtet jedes Szenenbild und Cover, füllt `review/visual-inspection.json` aus und startet danach:

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
```

Geprüft werden unter anderem:

- 9:16 und ausreichende Auflösung
- Textlesbarkeit und Textfehler
- sichere Position von Hauptmotiven
- Untertitel- und Plattform-UI-Kollisionen
- Zoom- und Schwenksicherheit
- Stilkonsistenz

## 6. Zentrale Abschlussprüfung

```bash
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
```

`review/final-readiness-report.json` muss enthalten:

```json
{
  "readyForRenderer": true
}
```

## 7. Renderer prüfen

```bash
npm run validate:render -- --dir "PFAD-ZUM-REEL"
```

Die Prüfung kontrolliert:

- Frames und Pflichtassets
- sichere lokale Pfade
- Untertitelzeiten
- Untertitelposition zwischen 73 und 79 %
- vollständige und chronologisch sortierte `wordTimings`
- Übereinstimmung zwischen Cue-Text und Wortliste
- Zooms, Schwenks und Übergänge
- optionale Sounddateien

## 8. Fertige MP4 erzeugen

```bash
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Standardausgabe:

```text
PFAD-ZUM-REEL/output/REEL-ID.mp4
```

Eigener Ausgabepfad:

```bash
npm run render:reel -- \
  --dir "PFAD-ZUM-REEL" \
  --output "exports/mein-reel.mp4"
```

Der Remotion-Renderer setzt um:

- Szenenbilder
- Voice-over
- tiefe Untertitel bei ungefähr 77 %
- exakt synchronisierte gelbe Wortmarkierung
- Zooms und Schwenks
- Schnitte und kurze Crossfades
- Soundeffekte mit vorhandenem lokalem `file`-Pfad

Berichte:

- `review/renderer-input-report.json`
- `review/render-execution-report.json`

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
npm run finalize:reel
npm run validate:render
npm run render:reel
npm run studio
npm run status:reel
npm test
```

## Wichtige Dateien

- `AGENTS.md` – verbindliche Regeln für Codex
- `CODEX_TASK.md` – vollständiger Produktionsablauf
- `docs/remotion-renderer.md` – Renderer-Dokumentation
- `src/core/subtitle-timing.js` – sichere Position und exakte Wortzeitlogik
- `src/core/timeline.js` – Timeline und Render-Plan
- `src/core/render-validator.js` – Renderer-Vorprüfung
- `src/core/remotion-renderer.js` – automatischer MP4-Render
- `src/renderer/ReelComposition.jsx` – visuelle Remotion-Komposition

## Noch nicht enthalten

- automatische Bild- oder Voice-over-Erzeugung
- automatisches Forced Alignment der Wortzeiten
- automatische Social-Media-Veröffentlichung
