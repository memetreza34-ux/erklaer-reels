# Erklär-Reels

KI-gestützte Produktionspipeline für visuelle Erklär-Reels zu Politik, Gesellschaft, Geschichte, Psychologie, Körper und Biologie.

## Ziel von Version 1

Aus einem Thema oder einem deutschen Rohscript entsteht ein vollständiger Reel-Arbeitsordner mit:

- geprüftem Voice-over-Script
- 8–12 klaren Bildmomenten, abhängig von der Länge
- einer passenden Bildwelt für das gesamte Reel
- englischen Bildprompts mit optionalem deutschem Schlüsseltext
- Audio-Cues für synchronisierte Bildwechsel
- getrenntem Untertitelplan
- Cover-Plan und Cover-Prompt
- Caption und Quellen
- strenger Inhaltsprüfung
- Inbox für extern erzeugte Bilder und Audio
- automatischer Zuordnung unsortierter Dateien zu den richtigen Szenen

Der Nutzer erzeugt Audio und Bilder außerhalb des Repositories. Das Repository organisiert, prüft und registriert diese Dateien anschließend.

## Themen des Accounts

- Politik und Gesellschaft
- Länder, Geografie und Geschichte
- Psychologie und menschliches Verhalten
- Körper und Biologie

Nicht vorgesehen sind Finanzen, Elektrotechnik, KI-News, tägliche politische Nachrichten oder Parteienwerbung.

## Produktionsregeln

- Hook-Bild ab Sekunde 0 sichtbar
- 35–44 Sekunden: normalerweise 8–10 Bildmomente
- 45–55 Sekunden: normalerweise 10–12 Bildmomente
- sichtbare Veränderung ungefähr alle 3,5–5 Sekunden
- Bildwechsel normalerweise 0,1–0,3 Sekunden vor dem passenden gesprochenen `audioCue`
- einfache Bilder dürfen kürzer stehen als komplexere Bilder
- Untertitel standardmäßig in der unteren Mitte bei ungefähr 65–75 % der Bildhöhe
- Untertitel normalerweise 3–6 Wörter, höchstens zwei Zeilen
- kein Wort-für-Wort-Karaoke und keine unnötige Wiederholung von Text, der bereits im Bild steht

## Produktionsablauf

```text
Thema oder Rohscript
        ↓
Reel-Arbeitsordner erstellen
        ↓
Codex-Auftrag automatisch erzeugen
        ↓
Script, Szenen, Audio-Cues, Bildprompts und Untertitelplan ausfüllen
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
Bildwechsel und Untertitel gegen die echte Audiospur prüfen
        ↓
Dateien automatisch kopieren, umbenennen und registrieren
```

## Voraussetzungen

- Node.js 20 oder neuer
- keine zusätzlichen npm-Pakete erforderlich

## 1. Neues Reel anlegen

Lege ein Rohscript beispielsweise unter `input/script.txt` ab und führe aus:

```bash
npm run create:reel -- \
  --title "Was bedeutet links und rechts?" \
  --script-file input/script.txt \
  --date 2026-07-30 \
  --scenes 10
```

`--scenes` unterstützt Werte von 8 bis 12. Ohne Angabe werden 10 Bildmomente angelegt.

Das Ergebnis wird automatisch nach Kalenderwoche und Wochentag gespeichert:

```text
content/
└── 2026-KW31_27-07_bis_02-08/
    └── donnerstag/
        └── reel-01_was-bedeutet-links-und-rechts/
```

Der Befehl erzeugt zusätzlich automatisch:

```text
production/
├── agent-task.md
└── checklist.json
```

`production/agent-task.md` ist der vollständige reel-spezifische Arbeitsauftrag für Codex.

## 2. Codex lässt das Inhaltspaket entstehen

Codex liest und bearbeitet:

- `script/final-script.txt`
- `script/voice-script.txt`
- `reel.json`
- `scenes/scene-index.json`
- jede `scenes/scene-XX/scene.json`
- jede `scenes/scene-XX/image-prompt.txt`
- `subtitles/subtitle-plan.json`
- `cover/cover.json`
- `cover/cover-prompt.txt`
- `caption/caption.txt`
- `sources/sources.md`

Jede Szene enthält zusätzlich:

- `audioCue` – gesprochenes Wort oder Phrase für den Bildwechsel
- `leadInSeconds` – normalerweise 0,1 bis 0,3 Sekunden
- `subtitleCues` – kurze Untertitel-Sinnabschnitte
- `subtitlePosition` – normalerweise `lower-middle`

Der Auftrag kann bei Bedarf neu erzeugt werden:

```bash
npm run prepare:reel -- \
  --dir "content/2026-KW31_27-07_bis_02-08/donnerstag/reel-01_was-bedeutet-links-und-rechts"
```

## 3. Inhaltspaket prüfen

Grundstruktur prüfen:

```bash
npm run validate:reel -- \
  --dir "content/2026-KW31_27-07_bis_02-08/donnerstag/reel-01_was-bedeutet-links-und-rechts"
```

Script, Szenen, Prompts, Untertitelplan, Cover, Caption und Quellen streng prüfen:

```bash
npm run check:content -- \
  --dir "content/2026-KW31_27-07_bis_02-08/donnerstag/reel-01_was-bedeutet-links-und-rechts" \
  --strict
```

Die Prüfung kontrolliert unter anderem:

- 8–12 stabile Szenen-IDs
- ausgewählte Bildwelt und Begründung
- vollständige Sprechertexte
- visuelle Idee und Kontinuitätsnotizen pro Szene
- geschätzte Gesamtdauer
- empfohlenen Bildrhythmus
- `audioCue` und `leadInSeconds`
- Untertitelposition und Untertitelplan
- ausführliche englische 9:16-Bildprompts
- exakte Übernahme geplanter Bildtexte in die Prompts
- Cover-Idee und Cover-Prompt
- Caption und Quellen

Der Bericht wird unter `review/content-readiness.json` gespeichert.

## 4. Extern erzeugte Dateien unsortiert ablegen

Alle Szenenbilder und das Cover dürfen beliebige Dateinamen haben und in beliebiger Reihenfolge abgelegt werden:

```text
reel-01_was-bedeutet-links-und-rechts/
└── inbox/
    ├── images/
    │   ├── IMG_8241.png
    │   ├── download-final.jpg
    │   ├── bild-neu-2.webp
    │   └── cover-version3.png
    └── audio/
        └── voice-final.mp3
```

Die Bilder müssen nicht `scene-01.png`, `scene-02.png` usw. heißen.

## 5. Asset-Inventar erstellen

```bash
npm run organize:assets -- \
  --dir "content/2026-KW31_27-07_bis_02-08/donnerstag/reel-01_was-bedeutet-links-und-rechts"
```

Dadurch entsteht `inbox/asset-inventory.json`. Codex vergleicht jedes Bild anschließend mit:

- Sprechertext der Szene
- sichtbarem Schlüsseltext
- visueller Idee
- Bildprompt
- Figuren, Gegenständen und Metaphern
- Komposition und Cover-Aufbau

Danach schreibt Codex die erkannte Zuordnung in `inbox/asset-map.json`. Dateiname und Ablagereihenfolge dürfen nur schwache Hinweise sein.

## 6. Erkannte Zuordnung anwenden

```bash
npm run organize:assets -- \
  --dir "content/2026-KW31_27-07_bis_02-08/donnerstag/reel-01_was-bedeutet-links-und-rechts" \
  --apply
```

Das System:

- kopiert jedes erkannte Bild in den richtigen Szenenordner
- benennt es stabil nach der Szenen-ID
- behandelt Cover und Audio getrennt
- erhält PNG, JPG, JPEG oder WEBP
- aktualisiert `scene.json`, `scene-index.json`, `status.json` und `assets-manifest.json`
- erstellt `review/asset-matching-report.json`
- lässt Dateien unter 0,75 Konfidenz unangetastet
- verhindert doppelte Verwendung einer Quelle oder eines Ziels

Nach Einfügen der echten Audiodatei prüft Codex zusätzlich, ob die geplanten Bildwechsel und Untertitel zum tatsächlichen Voice-over passen.

## Tests

```bash
npm test
```

Die Tests prüfen:

- Wochen-, Tages- und Reel-Ordner
- Codex-Produktionsauftrag
- strenge Inhaltsbereitschaft
- Asset-Inventar
- Übernahme von unsortierten Szenenbildern, Cover und Audio
- Schutz vor unsicheren Zuweisungen

GitHub Actions führt die Tests bei Pushes und Pull Requests automatisch mit Node.js 20 aus.

## Wichtige Dateien

- `CODEX_TASK.md` – kompletter Start- und Übergabeworkflow für Codex
- `AGENTS.md` – verbindliche Projektregeln
- `knowledge/production-rules.md` – inhaltliche, visuelle und Untertitelregeln
- `config/content-rules.json` – maschinenlesbare Themen-, Timing- und Untertitelregeln
- `config/image-styles.json` – verfügbare Bildwelten
- `src/core/workspace.js` – Reel-Ordnergenerator
- `src/core/production-brief.js` – dynamischer Codex-Auftrag
- `src/core/content-validator.js` – Inhalts-, Timing- und Promptprüfung
- `src/core/asset-ingest.js` – Inventar und Dateiübernahme

## Noch nicht enthalten

- automatische Bild- oder Audioerzeugung im Repository
- fertiger Remotion-Videoschnitt
- automatische Social-Media-Veröffentlichung

Diese Punkte sind für Version 1 bewusst nicht erforderlich. Der aktuelle Workflow ist darauf ausgelegt, dass der Nutzer Bilder und Voice-over extern erzeugt und anschließend unsortiert zurückgibt.
