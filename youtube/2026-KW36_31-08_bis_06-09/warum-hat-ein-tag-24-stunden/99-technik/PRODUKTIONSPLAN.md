# PRODUKTIONSPLAN — Warum hat ein Tag 24 Stunden – und nicht 10?

## Kern

- Woche: `2026-KW36_31-08_bis_06-09`
- Thema: `warum-hat-ein-tag-24-stunden`
- Format: YouTube Longform, 16:9
- Mindestlänge: 10:00
- Ziel: ca. 10:30–11:15
- Script: ca. 1.529 Wörter
- Videobilder: 60
- Bild 00: ausschließlich Thumbnail
- Bildwelt: `youtube-editorial-stick-explainer`
- Status: Phase 1 fertig, Phase 2 beim Nutzer, Phase 3 wartet auf echte Assets

## Phase 1 — ChatGPT — fertig

Vorbereitet:
- Thema + Duplicate-Check
- Recherche + Quellen
- finaler Titel
- **Bild 00 / Thumbnail-Prompt** unter `00-bildprompts/00_thumbnail/Bild 00 - Thumbnail.txt`
- vollständiges Voice-over-Script
- 60 Video-Bildprompts
- sechs 10er-Ordner
- pro 10er-Ordner `ZUORDNUNG.md`
- **kanonische Datei `99-technik/BILD_AUDIO_ZUORDNUNG.json`**
- Upload-Metadaten
- Motion-/SFX-Grundplan

## Phase 2 — Nutzer

Der Nutzer erzeugt:
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

## Phase 3 — Antigravity — exakte Audio-Synchronisierung

Antigravity benutzt **nicht** eine starre Bilddauer. Das finale Voice-over ist die Masterspur.

Pflichtablauf:
1. `YOUTUBE_WORKFLOW.md`, `YOUTUBE_VISUAL_WORLD.md`, `status.json` und `BILD_AUDIO_ZUORDNUNG.json` lesen.
2. Bild 00 vom Videoschnitt ausschließen.
3. Alle Bilder 01–60 und deren 10er-Ordner prüfen.
4. Bildinhalt gegen Prompt und zugeordneten Voice-over-Bereich prüfen.
5. Finales Audio analysieren.
6. Für jedes Bild den in `BILD_AUDIO_ZUORDNUNG.json` gespeicherten **exakten `startAnchor`** im echten Audio finden.
7. Tatsächlichen Zeitstempel des gesprochenen Ankers messen.
8. Bildwechsel standardmäßig ca. 0,08 s vor diesem echten Anker setzen.
9. Bild bleibt bis zum nächsten Bildanker aktiv.
10. Keine Schnitte nur aufgrund geschätzter 8/10/12-Sekunden-Dauern setzen.
11. Bei Alignment-Sicherheit unter 0,95 nicht raten, sondern manuell prüfen.
12. Wenn ein Voice-over-Bereich deutlich über ca. 15 s liegt, Mapping/Prompts neu aufteilen; den Cut nicht künstlich verschieben.
13. Danach subtile Motion, gezielte SFX und finale QC.
14. Export erst nach bestandener Prüfung.

### Warum diese Zuordnung wichtig ist

Beispiel:

```text
Bild 17
startAnchor: "Doch je komplexer Gesellschaften wurden"
endAnchor:   "Im alten Ägypten entstanden deshalb frühe Formen von Sonnenuhren und Schattenuhren."
```

Damit ist eindeutig: **Der komplette gesprochene Bereich zwischen diesen beiden Ankern gehört zu Bild 17.** Sobald der nächste Anker beginnt, muss Bild 18 bereits minimal vorher sichtbar sein.

## Timing-QC

- Ziel meist 6–12 s pro Bild
- normal höchstens etwa 15 s
- Inhalt/Cue hat Vorrang vor einer Zielsekundenzahl
- kein Bild mehrere Wörter oder Sätze zu früh
- kein Bildwechsel erst nach Beginn des neuen Gedankens
- Start standardmäßig ca. 0,08 s vor nächstem echten Audio-Anker
- finale Zeiten werden erst nach Vorliegen des echten Voice-overs eingetragen

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

## Fakten-QC

- Fingerglieder-Erklärung für Zwölf nur als mögliche Erklärung, nicht als Gewissheit.
- Siderischer Tag und mittlerer Sonnentag getrennt erklären.
- 24 Stunden sind menschliche Unterteilung, keine Naturkonstante.
- Basis 60 als historisch/mathematisch praktisch beschreiben, ohne unsichere Ursprungsbehauptung.

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

Erst nach realem Audio-Alignment, Motion/SFX und QC als fertig markieren.
