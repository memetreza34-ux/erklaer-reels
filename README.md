# Erklär-Reels

KI-gestützte Produktionspipeline für visuelle Erklär-Reels zu Politik, Gesellschaft, Ländern, Geografie, Geschichte, Psychologie und menschlichem Verhalten.

## Inhaltlicher Fokus

> Warum Menschen, Länder und Gesellschaften so funktionieren.

Erlaubte Content-Säulen:

1. Politik und Gesellschaft
2. Länder, Geografie und Geschichte
3. Psychologie und menschliches Verhalten

## Ergebnis

Aus einem Thema oder Rohscript entsteht ein vollständiges Reel mit:

- geprüftem deutschem Voice-over-Script
- 8–12 Bildmomenten
- englischen Bildprompts
- natürlicher, zusammenhängender Bildkomposition
- gestrafftem und leicht beschleunigtem Voice-over
- weißen Untertiteln ohne Box und ohne gelbe Wortmarkierung
- direkten harten Schnitten
- dezenten Zooms, Schwenks und Soundeffekten
- Audio-Synchronisierung und visueller Qualitätsprüfung
- fertiger MP4 über Remotion

## Wichtigste Regeln

### Bilder

- Hook-Bild ab Sekunde 0
- ungefähr alle 3,5–5 Sekunden sichtbare Veränderung
- innerhalb eines Reels konsistente Bildwelt
- Hauptmotive dürfen die Bildmitte normal nutzen
- kein künstlich leerer horizontaler Mittelstreifen
- keine getrennte obere und untere Bildhälfte nur wegen Untertiteln
- keine unerwünschten englischen Wörter, Fantasie-Labels, Logos oder Wasserzeichen
- sichtbarer Bildtext nur bei redaktioneller Notwendigkeit und dann korrekt auf Deutsch

### Untertitel

- Position `lower`
- exakt 76 % Bildhöhe
- durchgehend weiches Weiß `#F5F7FA`
- dunkle Kontur und dezenter Schatten
- keine gelbe Wortmarkierung
- keine schwarze Hintergrundbox oder Balken
- normalerweise 3–6 Wörter
- höchstens zwei Zeilen
- kein Wort-für-Wort-Karaoke
- Einzelwort-Sync ist ohne Wort-Highlight nicht erforderlich

### Audio und Schnitt

- Voice-over vor der Timeline mit `trim:pauses` straffen
- Standardtempo ungefähr `1.05x`, Tonhöhe erhalten
- Hook ohne Übergang
- danach ausschließlich `cut` mit Dauer 0
- keine Fades, Schwarzblenden oder schwarzen Zwischenframes
- Hintergrundmusik standardmäßig aus
- Ausgabe 1080 × 1920 bei 30 FPS

## Übersichtliche Reel-Struktur

```text
reel-01_thema/
├── 00-bildprompts/
│   ├── 00-cover/
│   ├── 01-scene-01/
│   ├── 02-scene-02/
│   ├── ...
│   └── 99-alle-bildprompts.txt
├── 01-voice-script/
├── 02-audio/
├── 03-caption/
├── 04-video/
└── 99-technik/
```

Das jeweilige Bild wird direkt beim passenden Prompt abgelegt:

```text
scenes/scene-01/
├── image-prompt.txt
└── scene-01.png
```

## Neues Reel

```bash
npm run create:reel -- \
  --title "Was ist Demokratie?" \
  --script-file input/script.txt \
  --next-free \
  --scenes 10
```

Danach:

```bash
npm run export:prompts -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

## Externe Dateien

Bevorzugte Ablage:

```text
scenes/scene-01/scene-01.png
scenes/scene-02/scene-02.png
...
cover/cover.png
audio/voiceover.mp3
```

## Audio und Timeline

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL"
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

Für jede Szene wird der echte Zeitpunkt des gesprochenen `audioCue` in `timeline/audio-sync.json` eingetragen.

## Visuelle Prüfung

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL"
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
```

Geprüft werden unter anderem:

- 9:16 und ausreichende Auflösung
- natürliche zusammenhängende Komposition
- kein leerer Mittelstreifen
- keine künstlich getrennten Bildhälften
- keine unerwünschten lesbaren Wörter
- weiße Untertitel ohne Box bei 76 %
- sichere Zooms und Schwenks
- Stilkonsistenz

## Abschluss und Render

```bash
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:render -- --dir "PFAD-ZUM-REEL"
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Standardausgabe:

```text
PFAD-ZUM-REEL/output/REEL-ID.mp4
```

## Voraussetzungen

- Node.js 20 oder neuer
- `npm install`
- FFmpeg und optional `ffprobe`
- aktuelle Remotion-Lizenzbedingungen vor geschäftlicher Nutzung prüfen

## Wichtige Dateien

- `AGENTS.md` – verbindliche Agent-Regeln
- `CODEX_TASK.md` – vollständiger Produktionsablauf
- `knowledge/production-rules.md` – kreative und technische Produktionsregeln
- `config/content-rules.json` – zentrale Inhalts- und Untertitelregeln
- `config/visual-quality-rules.json` – visuelle Abnahmekriterien
- `src/shared/subtitle-style.js` – zentraler Untertitelstil
- `src/renderer/ReelComposition.jsx` – Remotion-Komposition

## Noch nicht enthalten

- automatische Bild- oder Voice-over-Erzeugung
- automatische Social-Media-Veröffentlichung
