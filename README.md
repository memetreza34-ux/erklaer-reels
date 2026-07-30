# Erklär-Reels

KI-gestützte Produktionspipeline für visuelle Erklär-Reels zu Politik, Gesellschaft, Geschichte, Psychologie, Körper und Biologie.

## Ziel von Version 1

Aus einem Thema oder einem fertigen deutschen Sprechertext erzeugt das Projekt einen vollständigen Reel-Arbeitsordner mit:

- finalem Voice-over-Script
- 8–10 klaren Bildmomenten
- einer passenden, innerhalb des Reels konsistenten Bildwelt
- englischen Bildprompts mit deutschem Text im Bild
- Audio-Datei
- generierten Szenenbildern
- Cover und Cover-Prompt
- Caption, Quellen und Qualitätsbericht

Die Bildideen bleiben kreativ. Ein Reel kann mit menschlichen Cartoonfiguren, Länderfiguren, visuellen Metaphern, Vergleichen oder Build-up-Bildern arbeiten. Es gibt keine starre Bildlogik für alle Themen.

## Geplanter Ablauf

```text
Thema oder Script
        ↓
Script prüfen und strukturieren
        ↓
8–10 Bildmomente planen
        ↓
Bildstil für dieses Reel festlegen
        ↓
Audio erzeugen
        ↓
Bildprompts schreiben
        ↓
Szenenbilder und Cover generieren
        ↓
Qualitätskontrolle
        ↓
fertiger Reel-Ordner
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
- Asset-Manifest und Produktionsstatus
- CLI zum Erstellen eines neuen Reel-Arbeitsordners
- CLI zur Prüfung der Grundstruktur
- zentrale Inhalts-, Bildstil- und Agentenregeln

Die echten KI-Provider für Szenenplanung, Audio und Bildgenerierung werden als Nächstes angeschlossen.

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

## Noch nicht enthalten

- echte Script- und Szenenplanung über ein Sprachmodell
- Audio-Generierung
- Bild-Generierung
- automatische Qualitätsbewertung der Bilder
- Remotion-Videoschnitt
- Social-Media-Veröffentlichung
