# Erklär-Reels

KI-gestützte Produktionspipeline für visuelle Erklär-Reels zu Politik, Gesellschaft, Geschichte, Psychologie, Körper und Biologie.

Aus einem Thema oder deutschen Rohscript entsteht ein vollständiges Reel mit:

- geprüftem Voice-over-Script
- 8–12 Bildmomenten
- englischen Bildprompts
- tief positionierten Untertiteln
- automatisch synchronisierter gelber Wortmarkierung
- Zooms, Schwenks, Übergängen und Sounds
- Master-Timeline und Audio-Synchronisierung
- technischer und visueller Qualitätsprüfung
- automatischer Zuordnung unsortierter Bilder und Audiodateien
- fertiger MP4-Datei über Remotion

Der Nutzer erzeugt Voice-over und Bilder extern. Das Repository übernimmt den restlichen Produktionsablauf.

## Voraussetzungen

- Node.js 20 oder neuer
- `npm install`
- Gemini-API-Key für automatische Wortzeitstempel
- optional `ffprobe` für automatische Audiodauer
- aktuelle Remotion-Lizenzbedingungen vor geschäftlicher Nutzung prüfen

Gemini einrichten:

```bash
cp .env.example .env
```

Danach nur lokal eintragen:

```env
GEMINI_API_KEY=dein_schluessel
GEMINI_TRANSCRIBE_MODEL=gemini-3.6-flash
```

`.env` wird nicht nach GitHub hochgeladen.

## Produktionsregeln

- Hook-Bild ab Sekunde 0
- 35–44 Sekunden: normalerweise 8–10 Bildmomente
- 45–55 Sekunden: normalerweise 10–12 Bildmomente
- sichtbare Veränderung ungefähr alle 3,5–5 Sekunden
- Bildwechsel ungefähr 0,1–0,3 Sekunden vor dem passenden `audioCue`
- Untertitel standardmäßig bei 79,5 % der Bildhöhe
- sichere Untertitelzone 76,5–80,5 %
- 3–6 Wörter, höchstens zwei Zeilen
- aktuell gesprochenes Wort gelb mit `#FFD84D`
- gelbe Markierung nur anhand verifizierter Wortzeiten
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
Timeline und Audio-Cues synchronisieren
        ↓
Gemini erzeugt exakte Wortzeitstempel
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

## 4. Timeline und Audio synchronisieren

```bash
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
```

Ohne `ffprobe`:

```bash
npm run sync:audio -- \
  --dir "PFAD-ZUM-REEL" \
  --audio-duration 48.7
```

Danach werden die echten Szenen-Cues in `timeline/audio-sync.json` eingetragen und geprüft:

```bash
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

## 5. Wortzeiten automatisch mit Gemini erzeugen

```bash
npm run sync:words -- \
  --dir "PFAD-ZUM-REEL" \
  --strict
```

Der Befehl:

- transkribiert das Voice-over auf Deutsch
- fordert Start- und Endzeiten für jedes Wort an
- ordnet die Wörter anhand der Master-Timeline den Szenen zu
- erstellt automatisch kurze Untertitelblöcke
- setzt die Untertitel auf 79,5 % der Bildhöhe
- erzeugt exakte `wordTimings` für die gelbe Markierung
- baut Timeline und Render-Plan danach neu

Erzeugte Berichte:

```text
review/
├── gemini-transcript.json
├── word-sync-report.json
└── subtitle-plan-before-word-sync.json
```

Mindestens 98 % der Wörter müssen einer Szene zugeordnet werden. Der strenge Lauf schlägt fehl, wenn Szenen oder Wörter nicht sicher erfasst wurden.

Dry-Run:

```bash
npm run sync:words -- --dir "PFAD-ZUM-REEL" --dry-run
```

Nach `trim:pauses` muss `sync:words` erneut ausgeführt werden.

Details: `docs/gemini-word-sync.md`.

## 6. Bilder prüfen

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

## 7. Zentrale Abschlussprüfung

```bash
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
```

`review/final-readiness-report.json` muss enthalten:

```json
{
  "readyForRenderer": true
}
```

Die Freigabe wird jetzt auch blockiert, wenn die automatische Wort-Synchronisierung fehlt oder fehlerhaft ist.

## 8. Renderer prüfen

```bash
npm run validate:render -- --dir "PFAD-ZUM-REEL"
```

Die Prüfung kontrolliert:

- Frames und Pflichtassets
- sichere lokale Pfade
- Untertitelzeiten
- Untertitelposition zwischen 76,5 und 80,5 %
- vollständige und chronologisch sortierte Wortzeiten
- Übereinstimmung zwischen Cue-Text und Wortliste
- Zooms, Schwenks und Übergänge
- optionale Sounddateien

## 9. Fertige MP4 erzeugen

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
- tiefe Untertitel bei ungefähr 79,5 %
- exakt synchronisierte gelbe Wortmarkierung
- Zooms und Schwenks
- Schnitte und kurze Crossfades
- Soundeffekte mit vorhandenem lokalem `file`-Pfad

## Befehle

```bash
npm run create:reel
npm run prepare:reel
npm run validate:reel
npm run check:content
npm run organize:assets
npm run trim:pauses
npm run build:timeline
npm run sync:audio
npm run sync:words
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
- `knowledge/subtitle-pacing-rules.md` – Untertitelposition und Sprechtempo
- `docs/gemini-word-sync.md` – automatische Wortzeitstempel
- `docs/remotion-renderer.md` – Renderer-Dokumentation
- `src/core/gemini-word-sync.js` – Gemini-Transkription und Cue-Erzeugung
- `src/renderer/subtitle-timing.js` – Prüfung und Darstellung exakter Wortzeiten
- `src/core/timeline.js` – Timeline und Render-Plan
- `src/core/render-validator.js` – Renderer-Vorprüfung
- `src/core/remotion-renderer.js` – automatischer MP4-Render

## Noch nicht enthalten

- automatische Bild- oder Voice-over-Erzeugung
- automatische Social-Media-Veröffentlichung

Die Wortzeiten werden automatisch über Gemini erzeugt. Beim ersten echten Reel muss das Ergebnis trotzdem akustisch kontrolliert werden, weil automatische Spracherkennung nie fehlerfrei garantiert werden kann.
