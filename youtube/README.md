# YouTube

Dieser Bereich ist die eigenständige Produktionspipeline für YouTube-Langvideos. Reel-Code und Reel-Bildwelt bleiben getrennt.

Für neue YouTube-Videos gilt:

```text
Visual Policy V3
premium-editorial-explainer-illustration-youtube-16x9
```

## Kanalfokus

Autonom neue Themen bleiben in:
- Politik und Staatssysteme
- Geschichte
- Länder, Geografie, Grenzen und Territorien
- Ideologien und Gesellschaftssysteme
- internationale Beziehungen und Geopolitik

Außerhalb nur bei ausdrücklicher Nutzeranweisung.

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
- EIN Google-Flow-Masterprompt
- EIN Gesamtskript
- internes Bild↔Audio-Mapping
- A–E-Pacing
- Renderplan + Kapitel + Upload-Metadaten

Vor Übergabe an Flow:

```bash
npm run validate:youtube-phase1 -- --dir "youtube/<woche>/<thema>"
```

Das Gate blockiert alte Countryball-/Master-Reference-Prompts, falsche Style-ID, fehlende Policy-V3-Marker und fehlenden Kanalfokus-Bezug.

## Phase 2 — Google Flow

### Session Reset

Wenn eine bestehende Flow-Sitzung noch alte Regeln enthält, wird sie **nicht weiterverwendet**.

```text
STOP
→ frische Flow-Sitzung / frisches Flow-Projekt
→ aktuellen google-flow-prompt.txt vollständig neu einfügen
```

Veraltet und verboten sind u. a.:
- YouTube = Countryball-Stil
- Bild 01 = Master-Style-Frame
- Bild 01 als Referenz für Bild 02–NN
- Stickman als aktive Bildwelt

### Unabhängige Bilder

- Bild 00 separat
- Bild 01 separat
- Bild 02–NN jeweils aus eigenem Textprompt
- keine Bild-zu-Bild-Referenzen
- 5er-Wellen nur als Ausführungsregel

## Visual Policy V3

Style-ID:

`premium-editorial-explainer-illustration-youtube-16x9`

Verbindlich:
- hochwertige 2D-Editorial-/Dokumentar-Erklärillustration
- 16:9 horizontal
- szenenspezifische Art Direction
- erwachsene Magazin-/Dokumentarwirkung
- geschichtete Tiefe
- kontrollierte, reichere Farbpaletten
- bewusste Lichtakzente
- klare visuelle Hierarchie
- Ursache/Wirkung, Bewegung, Kontrast oder räumliche Beziehung sichtbar, wenn relevant
- keine Countryballs als Standard
- keine Stickfiguren
- kein generisches KI-Template
- kein 3D/Pixar/Clay/Anime/Fotorealismus als Standard

## Anti-Lifeless — HARD LOCK

Regenerieren, wenn ein Bild:
- leer oder steril wirkt
- nur ein kleines Objekt mittig auf leerem Grund zeigt
- wie eine Präsentationskarte/Icon-Collage wirkt
- fast dieselbe Komposition wie das vorige Bild wiederholt
- trotz geeignetem Inhalt keine Tiefe, Richtung, Beziehung oder Spannung zeigt

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

Phase 3 beginnt erneut mit dem Visual-Policy-V3-Gate, erst danach Audio, Alignment, Timeline, Motion/SFX und Render.

## Export

```text
03-export/
├── FERTIGES-VIDEO.mp4
├── THUMBNAIL.png
├── YOUTUBE-TITEL.txt
├── YOUTUBE-BESCHREIBUNG.txt
├── YOUTUBE-KAPITEL.txt
└── YOUTUBE-TAGS.txt
```
