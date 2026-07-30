# Erklär-Reels

KI-gestützte Produktionspipeline für visuelle Erklär-Reels zu Politik, Gesellschaft, Geschichte, Psychologie, Körper und Biologie.

## Ziel von Version 1

Aus einem Thema oder einem fertigen deutschen Sprechertext erzeugt das Projekt einen vollständigen Reel-Arbeitsordner mit:

- finalem Voice-over-Script
- 8–10 klaren Bildmomenten
- einer passenden, innerhalb des Reels konsistenten Bildwelt
- englischen Bildprompts mit deutschem Text im Bild
- Platz für das extern erzeugte Audio
- Platz für extern erzeugte Szenenbilder
- Cover und Cover-Prompt
- Caption, Quellen und Qualitätsbericht

Die Bildideen bleiben kreativ. Ein Reel kann mit menschlichen Cartoonfiguren, Länderfiguren, visuellen Metaphern, Vergleichen oder Build-up-Bildern arbeiten. Es gibt keine starre Bildlogik für alle Themen.

## Tatsächlicher Workflow

```text
Thema oder Script
        ↓
Script prüfen und strukturieren
        ↓
8–10 Bildmomente planen
        ↓
Bildstil für dieses Reel festlegen
        ↓
Voice-Text und Bildprompts erzeugen
        ↓
Nutzer erzeugt Audio und Bilder extern
        ↓
alle Dateien unsortiert in die Inbox legen
        ↓
Agent erkennt die Bildinhalte und ordnet sie den Szenen zu
        ↓
Dateien automatisch kopieren, umbenennen und registrieren
        ↓
Qualitätskontrolle
```

## Themen des Accounts

- Politik und Gesellschaft
- Länder, Geografie und Geschichte
- Psychologie und menschliches Verhalten
- Körper und Biologie

Nicht vorgesehen sind Finanzen, Elektrotechnik, KI-News oder tägliche politische Nachrichten.

## Aktueller Stand

Die erste funktionsfähige Grundlage ist vorhanden:

- feste Wochen-, Wochentags- und Reel-Ordnerstruktur
- automatisch fortlaufende Reel-Nummern
- 8–10 Szenenordner mit stabilen IDs
- Script-, Audio-, Cover-, Caption-, Quellen- und Review-Bereiche
- separate Inbox für unsortierte Bilder und Audiodateien
- Asset-Inventar und semantische Zuordnung über einen Vision-Agenten
- automatisches Kopieren und stabiles Umbenennen zu den richtigen Szenen
- Asset-Manifest und Produktionsstatus
- CLI zum Erstellen eines neuen Reel-Arbeitsordners
- CLI zur Prüfung der Grundstruktur
- zentrale Inhalts-, Bildstil- und Agentenregeln

Der Nutzer muss Bilder nicht in der richtigen Reihenfolge ablegen und nicht selbst in die Szenenordner einsortieren.

## Voraussetzungen

- Node.js 20 oder neuer

Es sind aktuell keine zusätzlichen npm-Pakete erforderlich.

## Neues Reel anlegen

1. Lege dein Script beispielsweise unter `input/script.txt` ab.
2. Führe aus:

```bash
npm run create:reel -- \
  --title "Was bedeutet links und rechts?" \
  --script-file input/script.txt \
  --date 2026-07-30 \
  --scenes 9
```

Das Ergebnis wird automatisch nach Kalenderwoche und Wochentag gespeichert, zum Beispiel:

```text
content/
└── 2026-KW31_27-07_bis_02-08/
    └── donnerstag/
        └── reel-01_was-bedeutet-links-und-rechts/
```

## Extern erzeugte Dateien ablegen

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

## Asset-Inventar erstellen

```bash
npm run organize:assets -- \
  --dir "content/2026-KW31_27-07_bis_02-08/donnerstag/reel-01_was-bedeutet-links-und-rechts"
```

Dadurch entsteht `inbox/asset-inventory.json`. Ein Vision-Agent vergleicht anschließend jedes Bild mit:

- Sprechertext der Szene
- sichtbarem Schlüsseltext
- visueller Idee
- Bildprompt
- Figuren, Gegenständen und Metaphern im Bild

Danach schreibt der Agent die erkannte Zuordnung in `inbox/asset-map.json`. Dateiname und Ablagereihenfolge dürfen nur als schwache Hinweise dienen.

## Erkannte Zuordnung anwenden

```bash
npm run organize:assets -- \
  --dir "content/2026-KW31_27-07_bis_02-08/donnerstag/reel-01_was-bedeutet-links-und-rechts" \
  --apply
```

Das System:

- kopiert jedes Bild in den richtigen Szenenordner
- benennt es stabil nach der Szenen-ID
- erkennt Cover und Audio getrennt
- erhält das echte Dateiformat wie PNG, JPG oder WEBP
- aktualisiert `scene.json`, `scene-index.json`, `status.json` und `assets-manifest.json`
- erstellt `review/asset-matching-report.json`
- lässt unsichere Dateien unter einer Konfidenz von 0,75 unangetastet

## Reel-Struktur prüfen

```bash
npm run validate:reel -- \
  --dir "content/2026-KW31_27-07_bis_02-08/donnerstag/reel-01_was-bedeutet-links-und-rechts"
```

## Wichtige Dateien

- `AGENTS.md` – verbindliche Regeln für Codex und andere Coding-Agenten
- `knowledge/production-rules.md` – inhaltliche und visuelle Produktionsregeln
- `config/content-rules.json` – erlaubte Themen und feste Einschränkungen
- `config/image-styles.json` – verfügbare Bildwelten und Auswahlregel
- `src/core/workspace.js` – Generator für die komplette Reel-Ordnerstruktur
- `src/core/asset-ingest.js` – Inventar, Zuordnungsprüfung und Dateiübernahme
- `src/cli/organize-assets.js` – CLI für unsortierte Nutzer-Assets

## Noch nicht enthalten

- echte Script- und Szenenplanung über ein Sprachmodell
- automatische Audio-Generierung
- automatische Bild-Generierung
- fertiger Remotion-Videoschnitt
- Social-Media-Veröffentlichung
