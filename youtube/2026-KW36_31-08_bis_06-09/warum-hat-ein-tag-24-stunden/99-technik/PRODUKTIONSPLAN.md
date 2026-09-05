# PRODUKTIONSPLAN — Warum hat ein Tag 24 Stunden – und nicht 10?

## Kern

- Woche: `2026-KW36_31-08_bis_06-09`
- Thema: `warum-hat-ein-tag-24-stunden`
- Format: YouTube Longform, 16:9
- Mindestlänge: 10:00
- Script: ca. 1.529 Wörter
- Videobilder: 60
- Bild 00: ausschließlich Thumbnail
- Bildwelt: `youtube-editorial-stick-explainer`
- Status: **Phase 3 muss neu aufgebaut werden; zuletzt geprüfter Render ist ungültig**
- Fehlerdetails: `99-technik/RENDER_FEHLERANALYSE.md`

## Phase 1 — ChatGPT — fertig

Vorbereitet:
- Thema + Duplicate-Check
- Recherche + Quellen
- finaler Titel
- Bild 00 / Thumbnail-Prompt
- vollständiges Voice-over-Script
- 60 Video-Bildprompts
- sechs 10er-Ordner
- pro 10er-Ordner Voice-over-Zuordnung
- kanonische Datei `99-technik/BILD_AUDIO_ZUORDNUNG.json`
- Upload-Metadaten
- Motion-/SFX-Grundplan

## Phase 2 — Nutzer

Benötigte echte Assets:
- finales Voice-over aus `01-voice-script/voice-script.txt`
- `Bild 00.png` als Thumbnail
- `Bild 01.png` bis `Bild 60.png` als Videobilder
- immer nur ein 10er-Paket vollständig, dann das nächste

```text
00-bildprompts/
├── 00_thumbnail/                # Bild 00
├── 01_bilder-01-bis-10/
├── 02_bilder-11-bis-20/
├── 03_bilder-21-bis-30/
├── 04_bilder-31-bis-40/
├── 05_bilder-41-bis-50/
└── 06_bilder-51-bis-60/
```

Bild 00 gehört nie in die Videotimeline.

## Phase 3 — Antigravity — kompletter Neuaufbau erforderlich

Der zuletzt geprüfte Render ist **nicht verwendbar**. Antigravity darf ihn nicht weiterbearbeiten oder nur teilweise korrigieren.

Neuaufbau erfolgt ausschließlich aus:
- finalem Voice-over
- Bild 01–60
- `BILD_AUDIO_ZUORDNUNG.json`

### Schritt 1 — echte Audio-Anker messen

Für **jedes Bild 01–60**:
1. `startAnchor` aus `BILD_AUDIO_ZUORDNUNG.json` im finalen Audio finden
2. exakte Startzeit messen
3. als `actualStartSeconds` eintragen
4. `actualEndSeconds` auf den echten Start des nächsten Bildbereichs setzen
5. beim letzten Bild `actualEndSeconds` auf das Voice-over-Ende setzen
6. `alignmentConfidence` eintragen
7. bei < 0,95 manuell prüfen und nicht raten

**Keiner dieser Werte darf beim Render noch `null` sein.**

### Schritt 2 — FINAL_TIMELINE.json erzeugen

Pflichtdatei:

```text
99-technik/FINAL_TIMELINE.json
```

Regeln:
- genau 60 Einträge: Bild 01–60
- Bild 00 ausgeschlossen
- Bild 01 startet bei 0:00
- Bild 02–60 starten standardmäßig ca. 0,08 s vor ihrem echten Audio-Anker
- jedes Bild endet exakt beim Start des nächsten Bildes
- letztes Bild endet ca. 0,60 s nach Voice-over-Ende
- keine pauschalen gleichen Holds

### Schritt 3 — PRE-RENDER-HARD-GATE

Vor dem Render zwingend:

```bash
npm run validate:youtube-phase3 -- --dir "youtube/2026-KW36_31-08_bis_06-09/warum-hat-ein-tag-24-stunden"
```

**Exit-Code 0 ist Pflicht. Bei Fehler: kein Render.**

Der Gate prüft insbesondere:
- alle 60 Bilder vorhanden
- lückenlose Nummerierung
- Audio-Mapping vollständig
- keine `null`-Zeitwerte
- Alignment ≥ 0,95
- `FINAL_TIMELINE.json` vorhanden und passend
- Anti-Slideshow-Prüfung: keine nahezu identischen Dauern für den Großteil der Bilder
- letztes Mapping-Ende passt zum echten Voice-over-Ende

### Schritt 4 — Edit

Erst nach bestandenem Gate:
- subtile Motion auf jedem Bild
- harte saubere Cuts
- gezielte SFX
- Voice-over dominant
- keine Hintergrundmusik, solange nicht ausdrücklich gewünscht
- keine eingebrannten Untertitel

### Schritt 5 — Render

- 1920×1080
- 30 fps
- H.264
- AAC

Der Render darf **nicht** aus einer Formel wie `Gesamtdauer / 60 Bilder` gebaut werden.

### Schritt 6 — POST-RENDER-HARD-GATE

Nach dem Render zwingend:

```bash
npm run validate:youtube-render -- --dir "youtube/2026-KW36_31-08_bis_06-09/warum-hat-ein-tag-24-stunden"
```

Nur Exit-Code 0 bedeutet fertig.

Post-Render-QC blockiert insbesondere einen langen Nachlauf nach dem Voice-over. Erlaubt ist nur ein kurzer Schluss-Hold.

## Bekannter Fehler des alten Renders

Der geprüfte fehlerhafte Render zeigte ein typisches Slideshow-Muster:
- fast gleich lange Bildphasen
- Bildwechsel nicht an echten gesprochenen Satzwechseln
- zunehmender Audio/Bild-Versatz
- ungefähr 19,8 s Video-Nachlauf nach Voice-over
- Abschlussbild nicht zuverlässig korrekt ausgespielt

Dieser Zustand darf durch die neuen Gates nicht mehr renderbar sein.

## Timing-QC

- Inhalt/Cue hat Vorrang vor Zielsekunden
- keine Bilddauer wird künstlich auf 8/10/12 s gebracht
- ein Bild darf nicht mehrere Wörter/Sätze zu früh erscheinen
- ein Bildwechsel darf nicht erst nach Beginn des neuen Gedankens kommen
- bei zu langem Voice-over-Bereich Mapping/Bildplanung korrigieren, nicht Timeline fälschen

## Motion / Zoom

Jedes Videobild erhält subtile Bewegung:
- slow push-in 2–4 %
- gentle pan 1–3 %
- subtle pull-out 2–4 %
- Ken-Burns mit kleiner Bewegung

Keine langen statischen Slides, keine hektischen Reel-Zooms.

## Sounddesign

- gezielte SFX bei Kapitelwechseln, Zahlen-/Diagramm-Reveals und sichtbaren Ereignissen
- nicht jeder Cut braucht zwingend einen Sound
- keine Meme-Sounds
- Voice-over bleibt dominant
- Hintergrundmusik standardmäßig aus

## Quellen

- NIST — Timekeeping and Clocks FAQs: https://www.nist.gov/pml/time-and-frequency-division/timekeeping-and-clocks-faqs
- NIST / Michael A. Lombardi — Why is a minute divided into 60 seconds...: https://www.nist.gov/publications/why-minute-divided-60-seconds-hour-60-minutes-and-only-24-hours-day
- Metropolitan Museum of Art — Telling Time in Ancient Egypt: https://www.metmuseum.org/essays/telling-time-in-ancient-egypt
- NASA — How Long Is One Day on Other Planets?: https://spaceplace.nasa.gov/days/en/
- NASA — Reference Systems / Rotation and Revolution: https://science.nasa.gov/learn/basics-of-space-flight/chapter2-1/
- NIST — Second: Introduction / The Past: https://www.nist.gov/si-redefinition/second-introduction

## Finaler Export

```text
03-export/
├── FERTIGES-VIDEO.mp4
├── THUMBNAIL.png
├── YOUTUBE-TITEL.txt
├── YOUTUBE-BESCHREIBUNG.txt
├── YOUTUBE-KAPITEL.txt
└── YOUTUBE-TAGS.txt
```

Erst nach **bestandenem Pre-Render-Gate + neuem Render + bestandenem Post-Render-Gate** als fertig markieren.
