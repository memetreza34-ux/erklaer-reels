# YouTube

Dieser Bereich ist die eigenständige Produktionspipeline für YouTube-Langvideos. Reels bleiben getrennt unter `reels/`.

## Verbindliche Regeln

Für YouTube zuerst lesen:

1. `youtube/YOUTUBE_WORKFLOW.md`
2. `youtube/PHASE3_HARD_GATE.md`
3. `youtube/YOUTUBE_VISUAL_WORLD.md`
4. **für neue Projekte mit `productionRulesVersion >= 2`: `youtube/ADAPTIVE_PACING_V2.md`**

Wichtig: `ADAPTIVE_PACING_V2.md` gilt nur für kommende V2-Projekte. Das bestehende Projekt `youtube/2026-KW36_31-08_bis_06-09/warum-hat-ein-tag-24-stunden/` bleibt unverändert.

## Drei Phasen

```text
Phase 1 — ChatGPT
→ Thema, Recherche, Titel, Bild 00/Thumbnail, Script, Bildprompts, 10er-Ordner,
  exakte Bild↔Voice-over-Zuordnung, Edit-Plan und Upload-Metadaten

Phase 2 — Nutzer
→ Voice-over, Bild 00 als Thumbnail und Google-Flow-Videobilder in 10er-Paketen

Phase 3 — Antigravity
→ Assets prüfen, echte Audio-Anker messen, FINAL_TIMELINE.json daraus bauen,
  Pre-Render-Hard-Gate bestehen, rendern, Post-Render-Hard-Gate bestehen
```

Bei neuen V2-Projekten wird das Voice-over zusätzlich in Script-/Audio-Parts aufgeteilt, wobei jeder Part exakt zu einem 10er-Bildpaket gehört.

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

Kanonische Datei:

```text
99-technik/BILD_AUDIO_ZUORDNUNG.json
```

Sie legt für jedes `Bild NN` fest:
- exakten `startAnchor`
- `endAnchor`
- Bilddatei und 10er-Ordner
- visuellen Zweck
- später `actualStartSeconds`
- später `actualEndSeconds`
- später `alignmentConfidence`

Für V2 kommt zusätzlich die eindeutige Zuordnung zu `scriptPartFile`, `audioPartFile` und `audioPartId` dazu.

## Entscheidend: Phase 3 darf keine Slideshow bauen

Das echte finale Voice-over ist die Timing-Masterspur.

**Verboten:**

```text
Videolänge ÷ Bildanzahl = feste Bilddauer
```

Also keine pauschalen 8-, 10-, 12- oder anderen gleichmäßigen Holds.

Antigravity muss zuerst alle echten Audio-Anker messen und daraus erzeugen:

```text
99-technik/FINAL_TIMELINE.json
```

Erst danach darf gerendert werden.

## Nicht umgehbare Render-Gates

### Vor Render

```bash
npm run validate:youtube-phase3 -- --dir "youtube/<woche>/<thema>"
```

Nur **Exit-Code 0** erlaubt den Render.

Der Gate blockiert u. a.:
- fehlende Bilddateien
- fehlende/falsche Bildnummern
- `actualStartSeconds`, `actualEndSeconds` oder `alignmentConfidence` = `null`
- Alignment unter 0,95
- fehlende/falsche `FINAL_TIMELINE.json`
- Timeline, die nicht den echten Audio-Ankern folgt
- verdächtig gleichmäßige Slideshow-Dauern

Für V2-Projekte kommt zusätzlich der adaptive Pacing-Check hinzu.

### Nach Render

```bash
npm run validate:youtube-render -- --dir "youtube/<woche>/<thema>"
```

Auch dieser Befehl muss Exit-Code 0 liefern. Ein langer stiller Nachlauf nach dem Voice-over ist verboten.

## YouTube-Standard

- mindestens 10 Minuten
- normalerweise 10–12 Minuten
- Bildanzahl **nach Scriptbedarf**, nicht als feste Zielzahl
- für neue V2-Projekte ungefähr 50–90 Bilder nur als Orientierung
- meist 5–12 s pro Bild als Planungsbereich
- 12–14 s bei ruhigen Momenten okay
- ab 14 s bewusst prüfen
- ab 16 s starke Split-Prüfung
- **20,0 s oder länger ist bei V2 ein Hard Fail**
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

Bei V2 ist die 10er-Struktur **nur Produktionsstruktur**. Sie darf die inhaltlich nötige Gesamtbildzahl nicht künstlich auf 60 festlegen.

Passend dazu wird das Script geteilt:

```text
01_part-bilder-01-bis-10.txt
02_part-bilder-11-bis-20.txt
...
```

und der Nutzer erzeugt die Audios ebenfalls partweise. Details stehen in `youtube/ADAPTIVE_PACING_V2.md`.

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

Ein Video ist erst final, wenn **Pre-Render- und Post-Render-Hard-Gate tatsächlich bestanden wurden**.

## Themen-Duplikate

Vor jedem neuen Video `THEMEN_HISTORIE.md` prüfen. Bereits verwendete oder nahezu identische Kernfragen werden nicht erneut verwendet, außer der Nutzer hebt die Sperre ausdrücklich auf.
