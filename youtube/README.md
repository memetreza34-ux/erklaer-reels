# YouTube

Dieser Bereich ist die eigenständige Produktionspipeline für YouTube-Langvideos. Reel-Code und Reel-Bildwelt bleiben getrennt.

Für neue YouTube-Videos gilt:

```text
Visual Policy V3
Cover Policy V1
premium-editorial-explainer-illustration-youtube-16x9
```

## Kanalfokus

Autonom neue Themen bleiben in Politik/Staatssystemen, Geschichte, Ländern/Geografie/Grenzen, Ideologien/Gesellschaftssystemen und internationalen Beziehungen/Geopolitik. Außerhalb nur bei ausdrücklicher Nutzeranweisung.

## Cover-Regel — HARD LOCK

- **Bild 01 ist immer Cover UND erste Videoszene.**
- Bild 01 beginnt bei 0,0 s.
- Bild 01 trägt eine starke kurze deutsche Cover-Überschrift und erklärt zugleich den ersten Sprecherabschnitt.
- `THUMBNAIL.png` wird direkt aus `Bild 01.png` exportiert.
- Für neue Projekte gibt es **kein Bild 00** und kein separates Thumbnail außerhalb der Timeline.
- Bild 01 ist kein Master-Style-Frame und keine Referenz für spätere Bilder.

## Verbindliche Reihenfolge

1. `youtube/YOUTUBE_WORKFLOW.md`
2. `config/youtube-channel-policy.json`
3. `youtube/YOUTUBE_VISUAL_WORLD.md`
4. `youtube/PHASE3_HARD_GATE.md`
5. `youtube/ADAPTIVE_PACING_V2.md`

## Phase 1

Erstellt werden:
- Thema + Kanalfokus + Duplicate-Check
- Recherche + Titel
- **EIN Google-Flow-Masterprompt**
- **EIN Gesamtskript**
- internes Bild↔Audio-Mapping
- A–E-Pacing
- Renderplan + Kapitel + Upload-Metadaten

Vor Übergabe an Flow:

```bash
npm run validate:youtube-phase1 -- --dir "youtube/<woche>/<thema>"
```

Das Gate blockiert alte Countryball-/Master-Reference-Regeln, falsche Style-ID, fehlende Policy-Marker sowie bei neuen Projekten ein separates Bild 00.

## Phase 2 — Google Flow

Wenn eine bestehende Flow-Sitzung alte Stil- oder Coverregeln enthält, wird sie nicht weiterverwendet:

```text
STOP
→ frische Flow-Sitzung / frisches Flow-Projekt
→ aktuellen google-flow-prompt.txt vollständig neu einfügen
```

### Unabhängige Bilder

- Bild 01 separat als **Cover + erste Szene**
- Bild 02–NN jeweils aus eigenem Textprompt
- keine Bild-zu-Bild-Referenzen
- **5er-Wellen** nur als Ausführungsregel
- kein Bild 00

## Visual Policy V3

Style-ID: `premium-editorial-explainer-illustration-youtube-16x9`

Verbindlich:
- hochwertige 2D-Editorial-/Dokumentar-Erklärillustration
- 16:9 horizontal
- szenenspezifische Art Direction
- erwachsene Magazin-/Dokumentarwirkung
- geschichtete Tiefe
- kontrollierte Farbpaletten und Lichtakzente
- klare visuelle Hierarchie
- Ursache/Wirkung, Bewegung, Kontrast oder räumliche Beziehung sichtbar, wenn relevant
- keine Countryballs als Standard
- keine Stickfiguren
- kein generisches KI-Template
- nicht kindisch
- kein 3D/Pixar/Clay/Anime/Fotorealismus als Standard

## Anti-Lifeless — HARD LOCK

Regenerieren, wenn ein Bild leer oder steril wirkt, nur ein kleines Objekt mittig zeigt, wie eine Präsentationskarte/Icon-Collage wirkt, fast dieselbe Komposition wiederholt oder trotz geeignetem Inhalt keine Tiefe, Richtung, Beziehung oder Spannung zeigt.

**Clean ≠ leer. Minimal ≠ leblos.**

## Sichtbarer Text

Bei deutschen Projekten muss jeder lesbare sichtbare Text Deutsch sein. Englischer Text oder Pseudo-Schrift = Hard Fail.

## Audio

Phase 3 arbeitet mit internem Produktionsaudio:
- lange Pausen kürzen
- Endstille entfernen
- exakt 1,10x
- Tonhöhe erhalten
- −16 LUFS
- max. −1,5 dBTP
- Whisper erst danach

Nutzeroriginal bleibt unverändert.

## Phase 3

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Phase 3 beginnt mit Policy-Gates. Danach Audio, Alignment, Timeline, Motion/SFX und Render. Für neue Projekte muss die Timeline mit Bild 01 bei 0,0 s beginnen und der Export kopiert Bild 01 als Thumbnail.

## Export

```text
03-export/
├── FERTIGES-VIDEO.mp4
├── THUMBNAIL.png        ← Kopie von Bild 01.png
├── YOUTUBE-TITEL.txt
├── YOUTUBE-BESCHREIBUNG.txt
├── YOUTUBE-KAPITEL.txt
└── YOUTUBE-TAGS.txt
```
