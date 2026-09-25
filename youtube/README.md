# YouTube

Dieser Bereich ist die eigenständige Produktionspipeline für YouTube-Langvideos. Der Workflow ist getrennt, die visuelle DNA ist wieder mit den Reels geteilt.

Für neue YouTube-Videos gilt:

```text
Visual Policy V4
Cover Policy V1
Asset Generation Policy V1
serious-minimal-countryball-explainer-youtube-16x9
```

## Kanalfokus

Autonom neue Themen bleiben in Politik/Staatssystemen, Geschichte, Ländern/Geografie/Grenzen, Ideologien/Gesellschaftssystemen und internationalen Beziehungen/Geopolitik. Außerhalb nur bei ausdrücklicher Nutzeranweisung.

## Cover-Regel — HARD LOCK

- **Bild 01 ist immer Cover UND erste Videoszene.**
- Bild 01 beginnt bei 0,0 s.
- Bild 01 trägt eine starke kurze deutsche Cover-Überschrift und erklärt zugleich den ersten Sprecherabschnitt.
- `THUMBNAIL.png` wird direkt aus `Bild 01.png` exportiert.
- kein Bild 00
- kein separates Thumbnail außerhalb der Timeline
- Bild 01 ist kein Master-Style-Frame und keine Referenz für spätere Bilder.

## Asset Generation Policy V1

- Bild 01 / Cover exakt **3×** generieren.
- genau 1 Gewinner auswählen.
- Gewinner einmal final zu `Bild 01.png` umbenennen.
- andere 2 Cover-Kandidaten verwerfen.
- Bild 02–NN jeweils **exakt 1×** generieren.
- keine manuellen Prüfstopps nach 5er-Blöcken.
- maximal fünf aktive Generierungen gleichzeitig = nur Last-/Parallelitätsregel.
- alle finalen Bilder flach in `00-bildprompts/images/`.

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

Neue Schema-9+-Projekte müssen Visual Policy V4 und die Serious-Minimal-Countryball-Bildwelt verwenden. Die zwischenzeitliche Premium-Editorial-Bildwelt ist dort nicht mehr aktiv.

## Phase 2 — Google Flow

Da die Bildwelt auf V4 zurückgesetzt wurde, für aktuelle/neue Produktionen eine **frische Flow-Sitzung** verwenden.

```text
STOP bei alter Premium-Editorial-Sitzung
→ frische Flow-Sitzung / frisches Flow-Projekt
→ aktuellen google-flow-prompt.txt vollständig neu einfügen
```

### Bildproduktion

- Bild 01 exakt 3× → einen Gewinner wählen
- Bild 02–NN jeweils genau 1×
- kein vorheriges Bild als Referenz
- maximal fünf aktive Generierungen gleichzeitig
- kein Review-Stop nach 5er-Gruppen
- kein Bild 00

Nach Abschluss:

```bash
npm run validate:youtube-phase2 -- --dir "youtube/<woche>/<thema>"
```

## Visual Policy V4 — Serious Minimal Countryball

Style-ID: `serious-minimal-countryball-explainer-youtube-16x9`

Quell-DNA: `serious-minimal-countryball-explainer`

Verbindlich:
- 16:9 horizontal
- seriöse, cleane, minimalistische 2D-Countryball-Erklärwelt
- perfekt runde Countryball-Akteure, wenn Akteure sinnvoll sind
- einfache weiße Augen
- dicke schwarze Konturen
- flache kontrollierte Farben
- geringe bis mittlere Detaildichte
- normalerweise 0–3 sinnvolle Zusatzobjekte
- starke Symbolik statt realistischer Vollszenen
- keine normalen illustrierten Menschen
- keine humanoiden Cartoon-Personen
- keine Stickfiguren
- kein Fotorealismus
- kein 3D/Pixar/Clay/Anime
- nicht kindisch, nicht albern

Historische Inhalte werden in diese reduzierte Formsprache übersetzt; keine realistischen Konferenz-, Kriegs- oder Menschenszenen als Standard.

## Anti-Lifeless — HARD LOCK

Minimal bleibt minimal, aber nicht leer: keine winzigen Motive auf riesiger Leerfläche, keine sinnlose Icon-Collage und keine mechanisch identische Countryball-Anordnung in jedem Bild.

**Clean ≠ leer. Minimal ≠ leblos.**

## Sichtbarer Text

Bei deutschen Projekten muss jeder lesbare sichtbare Text Deutsch sein. Englischer Text oder Pseudo-Schrift = Hard Fail in der Promptplanung.

## Audio

Phase 3 arbeitet mit internem Produktionsaudio:
- überlange Sprechpausen automatisch kürzen
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

Phase 3 beginnt mit Phase-1- und Phase-2-Gates. Danach Audio, Alignment, Timeline, Motion/SFX und Render. Die Timeline beginnt mit Bild 01 bei 0,0 s und der Export kopiert Bild 01 als Thumbnail.

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
