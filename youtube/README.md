# YouTube

Dieser Bereich ist die eigenständige Produktionspipeline für YouTube-Langvideos. Reels bleiben getrennt unter `reels/`.

## Verbindliche Regel

Für YouTube zuerst `youtube/YOUTUBE_WORKFLOW.md` lesen, danach `youtube/YOUTUBE_VISUAL_WORLD.md`.

## Drei Phasen

```text
Phase 1 — ChatGPT
→ Thema, Recherche, Titel, Bild 00/Thumbnail, Script, Bildprompts, 10er-Ordner,
  exakte Bild↔Voice-over-Zuordnung, Edit-Plan und Upload-Metadaten

Phase 2 — Nutzer
→ Voice-over, Bild 00 als Thumbnail und Google-Flow-Videobilder in 10er-Paketen

Phase 3 — Antigravity
→ Assets prüfen, echte Audio-Anker messen, Timeline exakt danach bauen,
  Motion/Zoom, SFX, QC und finalen 16:9-Render erzeugen
```

## Ordnerprinzip

```text
youtube/YYYY-KWNN_DD-MM_bis_DD-MM/themen-slug/
```

Keine `projects/`-Zwischenebene und kein `video-01_`-Präfix.

## Bild 00

**Bild 00 ist immer das Thumbnail.** Es gehört nie in die Videotimeline und nie in ein 10er-Paket.

```text
00-bildprompts/
├── 00_thumbnail/
│   ├── Bild 00 - Thumbnail.txt
│   └── Bild 00.png
├── 01_bilder-01-bis-10/
├── 02_bilder-11-bis-20/
├── 03_bilder-21-bis-30/
├── ...
└── 99-alle-bildprompts.txt
```

Die eigentlichen Videobilder beginnen immer mit **Bild 01**.

## Bild↔Voice-over-Zuordnung

Die wichtigste Datei für den späteren Schnitt ist:

```text
99-technik/BILD_AUDIO_ZUORDNUNG.json
```

Sie legt für jedes `Bild NN` fest:
- exakten `startAnchor` aus dem gesprochenen Script
- `endAnchor` = Start des nächsten Bildes
- Bilddatei und 10er-Ordner
- visuellen Zweck
- später die echten Audio-Zeitstempel
- Alignment-Sicherheit

Dadurch weiß Antigravity exakt, **welcher Satz/Satzteil zu welchem Bild gehört**.

## Phase 3 — entscheidende Timing-Regel

Das echte Voice-over ist die Masterspur. Antigravity schneidet **nicht nach pauschalen 8/10/12 Sekunden**.

- Startanker im finalen Audio finden
- echten Zeitstempel messen
- Bildwechsel standardmäßig ca. 0,08 s vor diesem Anker setzen
- Bild bleibt bis zum Start des nächsten Bildes aktiv
- bei unsicherem Match nicht raten
- bei zu langer Bildphase Mapping neu aufteilen, statt den Cut künstlich zu verschieben

Ziel: Wenn der neue Satz beginnt, ist genau das passende Bild bereits minimal vorher sichtbar — weder deutlich zu früh noch zu spät.

## YouTube-Standard

- mindestens 10 Minuten
- normalerweise 10–12 Minuten
- 50–80 Videobilder, Bildanzahl nach Scriptbedarf
- meist 6–12 s pro Bild, normal höchstens ca. 15 s
- 16:9
- `youtube-editorial-stick-explainer`
- subtile Motion auf jedem Bild
- gezielte SFX, keine Meme-Sounds
- Hintergrundmusik standardmäßig aus
- starker Titel + eigenes Thumbnail

## 10er-Paketregel

Immer nur ein Paket gleichzeitig:

```text
Bild 01–10 → prüfen → benennen → Ordner 1 → kontrollieren
Bild 11–20 → erst danach
...
```

Jeder 10er-Ordner darf zusätzlich `ZUORDNUNG.md` mit seinen zehn Voice-over-Ankern enthalten.

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

Für YouTube gibt es keine `UNIVERSELLE-CAPTION.txt`.

## Themen-Duplikate

Vor jedem neuen Video `THEMEN_HISTORIE.md` prüfen. Bereits verwendete oder nahezu identische Kernfragen werden nicht erneut verwendet, außer der Nutzer hebt die Sperre ausdrücklich auf.
