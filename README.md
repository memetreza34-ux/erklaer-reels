# Erklär-Reels

KI-gestützte Produktionspipeline für visuelle Erklär-Reels zu Politik, Gesellschaft, Geschichte, Psychologie, Körper und Biologie.

## Ziel von Version 1

Aus einem Thema oder einem deutschen Rohscript entsteht ein vollständiger Reel-Arbeitsordner mit:

- geprüftem Voice-over-Script
- 8–12 Bildmomenten abhängig von der Länge
- einer konsistenten Bildwelt pro Reel
- englischen Bildprompts mit optionalem deutschem Schlüsseltext
- Audio-Cues für synchronisierte Bildwechsel
- getrenntem Untertitelplan
- getrenntem Plan für Zooms, Kamerabewegungen, Übergänge und Soundeffekte
- Cover-Plan und Cover-Prompt
- Caption und Quellen
- strenger Inhaltsprüfung
- Inbox für extern erzeugte Bilder und Audio
- automatischer Zuordnung unsortierter Dateien zu den richtigen Szenen

Der Nutzer erzeugt Voice-over und Bilder außerhalb des Repositories. Das Repository plant, organisiert und prüft die Produktion. Ein fertiges Video wird in Version 1 noch nicht gerendert.

## Wichtigste Produktionsregeln

- Hook-Bild ab Sekunde 0 sichtbar
- 35–44 Sekunden: normalerweise 8–10 Bildmomente
- 45–55 Sekunden: normalerweise 10–12 Bildmomente
- sichtbare Veränderung ungefähr alle 3,5–5 Sekunden
- Bildwechsel normalerweise 0,1–0,3 Sekunden vor dem passenden `audioCue`
- Untertitel in der unteren Mitte bei ungefähr 65–75 % der Bildhöhe
- Untertitel normalerweise 3–6 Wörter und höchstens zwei Zeilen
- Bewegung nur mit klarem Nutzen; nicht jedes Bild benötigt einen Zoom
- Zoom normalerweise 2–6 %, maximal 8 %
- Schwenk maximal 4 % der Bildbreite oder Bildhöhe
- sauberer Schnitt als Standardübergang
- Crossfade nur kurz und begründet
- null bis zwei dezente Soundeffekte pro Szene
- Voice-over hat Vorrang
- Hintergrundmusik standardmäßig ausgeschaltet

## Produktionsablauf

```text
Thema oder Rohscript
        ↓
Reel-Arbeitsordner erstellen
        ↓
Codex-Auftrag automatisch erzeugen
        ↓
Script, Szenen, Audio-Cues und Bildprompts ausfüllen
        ↓
Untertitel- und Effektplan erstellen
        ↓
Cover, Caption und Quellen erstellen
        ↓
strenge Inhaltsprüfung
        ↓
Nutzer erzeugt Voice-over und Bilder extern
        ↓
alle Dateien unsortiert in die Inbox legen
        ↓
Codex erkennt Bildinhalte und ordnet sie den Szenen zu
        ↓
Bildwechsel, Untertitel, Zooms und Sounds gegen die echte Audiospur prüfen
        ↓
Dateien automatisch kopieren, umbenennen und registrieren
```

## Voraussetzungen

- Node.js 20 oder neuer
- keine zusätzlichen npm-Pakete erforderlich

## 1. Neues Reel anlegen

```bash
npm run create:reel -- \
  --title "Was bedeutet links und rechts?" \
  --script-file input/script.txt \
  --date 2026-07-30 \
  --scenes 10
```

`--scenes` unterstützt Werte von 8 bis 12. Ohne Angabe werden 10 Bildmomente angelegt.

Beispielstruktur:

```text
content/
└── 2026-KW31_27-07_bis_02-08/
    └── donnerstag/
        └── reel-01_was-bedeutet-links-und-rechts/
            ├── script/
            ├── scenes/
            ├── subtitles/
            ├── effects/
            ├── cover/
            ├── caption/
            ├── sources/
            ├── review/
            ├── production/
            └── inbox/
```

Der Befehl erzeugt automatisch `production/agent-task.md` und `production/checklist.json`.

## 2. Dateien, die Codex bearbeitet

- `script/final-script.txt`
- `script/voice-script.txt`
- `reel.json`
- `scenes/scene-index.json`
- jede `scenes/scene-XX/scene.json`
- jede `scenes/scene-XX/image-prompt.txt`
- `subtitles/subtitle-plan.json`
- `effects/effects-plan.json`
- `cover/cover.json`
- `cover/cover-prompt.txt`
- `caption/caption.txt`
- `sources/sources.md`

### Untertitelplan

`subtitles/subtitle-plan.json` enthält kurze Sinnabschnitte, Position und geschätztes Timing. Die exakten Zeiten werden nach Einfügen des echten Voice-overs korrigiert.

### Effektplan

`effects/effects-plan.json` enthält pro Szene:

```json
{
  "sceneId": "scene-03",
  "transitionIn": {
    "type": "cut",
    "durationSeconds": 0,
    "reason": "Neuer Gedanke beginnt direkt."
  },
  "cameraMotion": {
    "type": "slow-zoom-in",
    "startScale": 1,
    "endScale": 1.05,
    "panXPercent": 0,
    "panYPercent": 0,
    "easing": "ease-in-out",
    "reason": "Fokus langsam auf das zentrale Symbol lenken."
  },
  "soundEffects": [
    {
      "type": "click",
      "audioCue": "ständigen Blick auf die Uhr",
      "estimatedTimeSeconds": 14.2,
      "volume": 0.18,
      "reason": "Der Klick betont das Uhrenmotiv."
    }
  ]
}
```

Nicht jede Szene muss Bewegung oder Sound enthalten.

## 3. Inhaltspaket prüfen

Grundstruktur:

```bash
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
```

Strenge Inhaltsprüfung:

```bash
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

Geprüft werden unter anderem:

- 8–12 stabile Szenen-IDs
- Stilwahl und Begründung
- Voice-over, Szenenideen und Dauer
- Audio-Cues und Untertitel
- ausführliche 9:16-Bildprompts
- vollständiger Effektplan mit genau einem Eintrag pro Szene
- zulässige Zoom- und Schwenkwerte
- höchstens zwei Soundeffekte pro Szene
- Voice-over-Priorität und ausgeschaltete Hintergrundmusik
- Cover, Caption und Quellen

Der Bericht wird unter `review/content-readiness.json` gespeichert.

## 4. Extern erzeugte Dateien unsortiert ablegen

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

## 5. Assets erkennen und übernehmen

Inventar erstellen:

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL"
```

Zuordnung nach visueller Prüfung anwenden:

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL" --apply
```

Das System kopiert erkannte Bilder in die passenden Szenenordner, benennt sie stabil um und behandelt Cover und Audio getrennt. Dateien unter 0,75 Konfidenz bleiben unangetastet.

Nach Einfügen des Voice-overs prüft Codex zusätzlich Bildwechsel, Untertitel, Zooms, Übergänge und Soundeffekte gegen die echte Audiospur.

## Tests

```bash
npm test
```

## Wichtige Dateien

- `CODEX_TASK.md` – kompletter Start- und Übergabeworkflow für Codex
- `AGENTS.md` – verbindliche Projektregeln
- `knowledge/production-rules.md` – allgemeine Produktionsregeln
- `knowledge/effects-rules.md` – Zoom-, Übergangs- und Soundregeln
- `config/content-rules.json` – Themen-, Timing- und Untertitelregeln
- `config/effects-rules.json` – maschinenlesbare Effektgrenzen
- `config/image-styles.json` – verfügbare Bildwelten
- `src/core/workspace.js` – Reel-Ordnergenerator
- `src/core/production-brief.js` – dynamischer Codex-Auftrag
- `src/core/content-validator.js` – Inhalts-, Timing- und Effektprüfung
- `src/core/asset-ingest.js` – Inventar und Dateiübernahme

## Noch nicht enthalten

- automatische Bild- oder Audioerzeugung im Repository
- fertiges Remotion-Rendering
- automatische Social-Media-Veröffentlichung

Der Effektplan ist bereits verbindlich vorhanden und kann später direkt als Vorlage für Remotion oder einen anderen Videoschnitt dienen.
