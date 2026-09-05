# YouTube

Dieser Bereich ist die **eigenständige Produktionspipeline für YouTube-Langvideos**. Reels bleiben vollständig getrennt unter `reels/`.

## Verbindliche Regel

Für YouTube zuerst `youtube/YOUTUBE_WORKFLOW.md` lesen, danach `youtube/YOUTUBE_VISUAL_WORLD.md`.

## Ordnerprinzip: Woche → Thema

Produktive YouTube-Videos liegen direkt unter einer Wochenmappe. Die Struktur folgt demselben Kalenderprinzip wie bei den Reels:

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
- **keine `projects/`-Zwischenebene**
- **kein `video-01_`, `video-02_` usw. vor dem Themenordner**
- mehrere Videos derselben Woche liegen als mehrere Themenordner nebeneinander

`templates/` und die globalen YouTube-Regeldateien bleiben als Infrastruktur direkt unter `youtube/`.

## YouTube-Standard

- mindestens 10 Minuten
- Zielbereich normalerweise ca. 10–12 Minuten
- ungefähr 50–80 Bilder, Standard etwa 60
- Bildwechsel meist alle 6–12 Sekunden, normale Einzelbilder höchstens ca. 15 Sekunden
- 16:9
- feste Bildwelt `youtube-editorial-stick-explainer`
- eigener starker YouTube-Titel
- eigenes Thumbnail-Konzept und Thumbnail-Prompt

## Projektstruktur pro Thema

```text
00-bildprompts/
01-voice-script/
02-audio/
03-export/
99-technik/
```

### 00-bildprompts
Vollständiger Google-Flow-Prompt-Satz für die YouTube-Szenenbilder.

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

`youtube/templates/video-template/` bleibt die Strukturvorlage. Beim Erstellen eines Videos wird ihr Inhalt in den passenden **Wochenordner/Themenordner** übernommen; die Vorlage selbst ist kein Produktionsprojekt.
