# YouTube

Dieser Bereich ist die eigenständige Produktionspipeline für YouTube-Langvideos. Der Workflow ist getrennt, die visuelle DNA ist mit den Reels geteilt.

Für neue YouTube-Videos gilt:

```text
Visual Policy V5
Design Quality V1
Adaptive Pacing V3
Script Opening V1
Script Quality V1
Scene Illustration V2
Topic Visual Relevance V1
Visual Flexibility V1
Cover Policy V2
Asset Generation Policy V2
serious-minimal-countryball-explainer-youtube-16x9
```

## Kanalfokus

Autonom neue Themen bleiben in Politik/Staatssystemen, Geschichte, Ländern/Geografie/Grenzen, Ideologien/Gesellschaftssystemen und internationalen Beziehungen/Geopolitik. Außerhalb nur bei ausdrücklicher Nutzeranweisung.

## Skript — HARD GATE

Neue Projekte aus dem aktuellen Template tragen `scriptQualityPolicyVersion: 1` und müssen vor der Bildproduktion **Script Quality V1** bestehen. Bestehende Projekte ohne diese Policy bleiben reproduzierbar.

Der Einstieg wird für jedes Thema neu gewählt. Er darf als konkrete Szene/Mini-Geschichte, Moment in der Zeit, überraschender Fakt, Konflikt, Paradox oder starke direkte Frage funktionieren. Es gibt kein festes Kanal-Satzmuster.

Verboten bzw. blockierend:
- wiederkehrende Standardfloskeln wie `Denkst du dir gerade vielleicht.`
- das alte Muster `Frage → Denkst du dir gerade vielleicht → Kurz gesagt`
- `In diesem Video erklären wir ...` / `Heute geht es um ...`
- abstrakte Schulbuch-/Definitionsstarts
- lange reine Ereignislisten ohne Ursache → Reaktion → Folge
- zu wenig konkrete Beispiele, Daten oder nachvollziehbare Fälle
- dauerhaft verschachtelte, schlecht sprechbare Sätze
- Einstieg ohne frühen Bezug zum eigentlichen Videothema

Pflichtziel:
- unterhaltsam **und** informativ
- konkret statt generisch
- verständliche gesprochene Sprache
- Zusammenhänge erklären, nicht nur Fakten aufzählen
- echter Mehrwert durch Ursachen, Folgen, Beispiele und Einordnung

Einzelprüfung:

```bash
npm run validate:youtube-script -- --dir "youtube/<woche>/<thema>"
```

Der normale Phase-1-Gate führt diese Prüfung automatisch mit aus:

```bash
npm run validate:youtube-phase1 -- --dir "youtube/<woche>/<thema>"
```

## Cover V2 — separat, nie im Video

- Cover **3 Kandidaten** generieren, Gewinner `03-export/THUMBNAIL.png`.
- Bild 01 ist **normale erste Videoszene** ohne Headline des Covers.
- Bild 01–NN jeweils einmal generieren, flach unter `00-bildprompts/images/`.
- Cover darf nicht identisch zu Bild 01 sein.
- Bestehende V1-Projekte bleiben unverändert.

## Vier Export-Dateien

`FERTIGES-VIDEO.mp4`, `THUMBNAIL.png`, `YOUTUBE-UPLOAD.txt` (TITEL/BESCHREIBUNG/CAPTION), `YOUTUBE-UNTERTITEL-ZEITABSCHNITTE.txt` (echte Zeitabschnitte).


## Verbindliche Reihenfolge

1. `youtube/YOUTUBE_WORKFLOW.md`
2. `config/youtube-channel-policy.json`
3. `youtube/SCRIPT_QUALITY_V1.md`
4. `youtube/YOUTUBE_VISUAL_WORLD.md`
5. `youtube/PRODUKTIONSSTANDARD_NACH_TESTPHASE.md`
6. `youtube/ADAPTIVE_PACING_V3.md`
7. `youtube/PHASE3_HARD_GATE.md`

## Phase 1

Erstellt werden:
- Thema + Kanalfokus + Duplicate-Check
- Recherche + Titel
- **EIN Google-Flow-Masterprompt**
- **EIN Gesamtskript**
- internes Bild↔Audio-Mapping
- adaptive Bildplanung / A–E-Komplexität
- Renderplan + Kapitel + Upload-Metadaten

Vor Übergabe an Flow:

```bash
npm run validate:youtube-phase1 -- --dir "youtube/<woche>/<thema>"
```

Neue Template-Projekte mit `scriptQualityPolicyVersion: 1` müssen dabei zusätzlich Script Quality V1 bestehen. Alte Projekte ohne dieses Feld bleiben kompatibel und werden nicht rückwirkend auf die neue Schreibregel migriert.

## Phase 2 — Google Flow

Für eine neue Produktion eine frische Flow-Sitzung verwenden, wenn sich die aktive Bildwelt/Policy gegenüber einer alten Sitzung geändert hat.

### Bildproduktion

- Separates Cover exakt 3× → einen Gewinner als THUMBNAIL.png wählen
- Bild 01–NN jeweils genau 1×
- kein vorheriges Bild als Referenz
- maximal fünf aktive Generierungen gleichzeitig
- kein Review-Stop nach 5er-Gruppen
- kein Bild 00

Nach Abschluss:

```bash
npm run validate:youtube-phase2 -- --dir "youtube/<woche>/<thema>"
```

## Visual Policy V5 — Serious Minimal Countryball

Style-ID: `serious-minimal-countryball-explainer-youtube-16x9`

Quell-DNA: `serious-minimal-countryball-explainer`

Verbindlich:
- 16:9 horizontal
- seriöse, cleane 2D-Countryball-Erklärwelt
- Countryballs nur, wenn sie die Aussage verbessern
- Karten, Dokumente, Einzelobjekte, Schemata und volle Szenen je nach Inhalt
- einfache weiße Augen bei Countryballs
- kräftige schwarze Konturen
- flache kontrollierte Farben
- keine normalen illustrierten Menschen
- keine humanoiden Cartoon-Personen
- keine menschlichen Silhouetten oder realistischen Hände
- keine Stickfiguren
- kein Fotorealismus
- kein 3D/Pixar/Clay/Anime
- nicht kindisch, nicht albern

**Inhalt vor Figur. So einfach wie möglich, so komplex wie nötig.**

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

Phase 3 prüft zuerst Script Quality V1, sofern das Projekt die Policy aktiviert hat, danach die bestehende Phase-1-Policy und anschließend den Phase-2-Gate. Dadurch kann ein neues Template-Projekt mit einem nicht freigegebenen Skript nicht gerendert werden.

Danach folgen Audio, Alignment, Timeline, Motion/SFX und Render. Die Timeline beginnt mit Bild 01 bei 0,0 s und der Export kopiert Bild 01 als Thumbnail.

## Export

```text
03-export/
├── FERTIGES-VIDEO.mp4
├── THUMBNAIL.png
├── YOUTUBE-UPLOAD.txt  ← Titel, Beschreibung, Caption
└── YOUTUBE-UNTERTITEL-ZEITABSCHNITTE.txt
```
