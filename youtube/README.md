# YouTube

Dieser Bereich ist die eigenständige Produktionspipeline für YouTube-Langvideos. Reels bleiben vollständig getrennt unter `reels/`.

## Verbindliche Regel

Für YouTube zuerst `youtube/YOUTUBE_WORKFLOW.md` lesen, danach `youtube/YOUTUBE_VISUAL_WORLD.md`.

## Die drei Phasen

```text
Phase 1 — ChatGPT
→ Thema, Recherche, Titel, Thumbnail-Prompt, Script, Bildprompts, 10er-Ordner, Edit-Plan, Upload-Metadaten

Phase 2 — Nutzer
→ echtes Voice-over, Google-Flow-Bilder in 10er-Paketen, Thumbnail

Phase 3 — Antigravity
→ Assets prüfen, Audio-getriebene Timeline bauen, Bilder synchronisieren, Motion/Zoom, SFX, QC und finalen 16:9-Render erzeugen
```

Antigravity darf fehlende Bilder nicht erfinden und keine Assets aus einem anderen Projekt als Ersatz benutzen. Die genaue Phase-3-Anweisung steht in `YOUTUBE_WORKFLOW.md`.

## Ordnerprinzip: Woche → Thema

Produktive YouTube-Videos liegen direkt unter einer Wochenmappe:

```text
youtube/
├── 2026-KW36_31-08_bis_06-09/
│   └── warum-hat-ein-tag-24-stunden/
│       ├── 00-bildprompts/
│       ├── 01-voice-script/
│       ├── 02-audio/
│       ├── 03-export/
│       └── 99-technik/
├── templates/
├── YOUTUBE_WORKFLOW.md
└── YOUTUBE_VISUAL_WORLD.md
```

Verbindlich:
- zuerst die ISO-Kalenderwoche als `YYYY-KWNN_DD-MM_bis_DD-MM`
- darunter direkt der eindeutige Themen-Slug
- keine `projects/`-Zwischenebene
- kein `video-01_`, `video-02_` usw. vor dem Themenordner
- mehrere Videos derselben Woche liegen als mehrere Themenordner nebeneinander

## YouTube-Standard

- mindestens 10 Minuten
- Zielbereich normalerweise ca. 10–12 Minuten
- ungefähr 50–80 Bilder, Standard etwa 60
- Bildwechsel meist alle 6–12 Sekunden, aber final nach Voice-over-Inhalt synchronisiert
- 16:9
- feste Bildwelt `youtube-editorial-stick-explainer`
- jedes Bild mit subtiler Motion/Zoom im Edit
- gezieltes Sounddesign, keine Meme-Sounds
- Hintergrundmusik standardmäßig aus, außer ausdrücklich gewünscht
- eigener starker YouTube-Titel
- eigenes Thumbnail-Konzept und Thumbnail-Prompt

## Bilder: immer in 10er-Paketen

Bei 60 Bildern sieht `00-bildprompts/` so aus:

```text
00-bildprompts/
├── 01_bilder-01-bis-10/
├── 02_bilder-11-bis-20/
├── 03_bilder-21-bis-30/
├── 04_bilder-31-bis-40/
├── 05_bilder-41-bis-50/
├── 06_bilder-51-bis-60/
├── 99-alle-bildprompts.txt
└── THUMBNAIL-PROMPT.txt
```

Ablauf: erst genau ein 10er-Paket erzeugen, Bilder korrekt global nummerieren, prüfen und in seinen Ordner legen. Erst danach beginnt das nächste Paket. Das Thumbnail bleibt separat.

## Phase 3 in Kurzform

Antigravity arbeitet **nicht** einfach nach festen 10-Sekunden-Blöcken. Das echte Voice-over ist die Masterspur:

1. Audio und alle 10er-Bildordner prüfen.
2. Script gegen das echte Audio segmentieren.
3. Bilder passend zu den gesprochenen Abschnitten zuordnen.
4. Bildwechsel inhaltlich setzen; meist 6–12 s, maximal ungefähr 15 s ohne guten Grund.
5. Jedes Bild subtil bewegen: Push-in, Pull-out, Pan oder Ken-Burns.
6. Harte saubere Cuts als Standard.
7. SFX nur gezielt an Kapitelwechseln, Reveals und sichtbaren Ereignissen.
8. Voice-over immer dominant halten.
9. 1920×1080, 30 fps, H.264 + AAC rendern.
10. Dauer, Reihenfolge, Audio-Sync, Standbilder, schwarzes/stilles Ende und Bildwelt prüfen.
11. Erst danach `03-export/FERTIGES-VIDEO.mp4` als fertig markieren.

## Projektstruktur pro Thema

### 00-bildprompts
Vollständiger Google-Flow-Prompt-Satz plus die fertigen 10er-Bildpakete.

### 01-voice-script
Endgültiges Voice-over-Script.

### 02-audio
Echtes Voice-over und tatsächlich verwendete Audiodateien.

### 03-export
Einziger finaler YouTube-Upload-Bereich:

```text
FERTIGES-VIDEO.mp4
THUMBNAIL.png
YOUTUBE-TITEL.txt
YOUTUBE-BESCHREIBUNG.txt
YOUTUBE-KAPITEL.txt
YOUTUBE-TAGS.txt
```

Für YouTube gibt es keine `UNIVERSELLE-CAPTION.txt`.

### 99-technik
Recherche, Szenenplanung, Thumbnail-Plan, Edit-Plan, Status und interne Metadaten.

## Themen-Duplikate

Vor jedem neuen YouTube-Video `THEMEN_HISTORIE.md` prüfen. Bereits verwendete oder nahezu identische Reel- und YouTube-Themen werden nicht erneut gewählt, außer der Nutzer hebt die Sperre ausdrücklich auf.

## Vorlagen

`youtube/templates/video-template/` bleibt die Strukturvorlage. Beim Erstellen eines Videos wird ihr Inhalt in den passenden Wochenordner/Themenordner übernommen; die Vorlage selbst ist kein Produktionsprojekt.
