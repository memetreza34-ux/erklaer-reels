# YouTube

Dieser Bereich ist die **eigenständige Produktionspipeline für YouTube-Langvideos**. Reels und Kurzvideos bleiben vollständig getrennt unter `reels/`.

## Verbindliche Regel

Für YouTube zuerst **`youtube/YOUTUBE_WORKFLOW.md`** lesen, danach `youtube/YOUTUBE_VISUAL_WORLD.md` und `THEMEN_HISTORIE.md`.

Reel-spezifische Dauer-, Bildwelt- oder Caption-Regeln gelten nicht automatisch für YouTube.

## Aktueller Standard

Ab 2026-09-04:

- mindestens **10 Minuten** finales YouTube-Video
- Startziel ungefähr **10–12 Minuten**
- viele einzelne Bildmomente statt langer Standbilder
- für 10–12 Minuten standardmäßig ungefähr **50–80 Bilder**, Zielwert etwa 60
- visueller Wechsel meist alle 6–12 Sekunden
- jedes Bild erhält im Edit subtile Motion/Zoom
- feste YouTube-Bildwelt `youtube-editorial-stick-explainer`
- 16:9
- guter finaler Titel und starkes Thumbnail sind bei jedem Projekt Pflicht
- vor jeder Themenwahl `THEMEN_HISTORIE.md` prüfen; keine doppelte Kernfrage über Reel/YouTube hinweg

## Sichtbare Projektstruktur

Jedes neue YouTube-Langvideo liegt unter `youtube/projects/` in einem eigenen Projektordner:

```text
video-XX_thema/
├── 00-bildprompts/
├── 01-voice-script/
├── 02-audio/
├── 03-export/
└── 99-technik/
```

### 00-bildprompts

Hier liegen:

```text
99-alle-bildprompts.txt
THUMBNAIL-PROMPT.txt
```

Google Flow erzeugt die Bilder streng seriell: genau ein Bild → prüfen → speichern → nächstes Bild.

### 01-voice-script

Hier liegt das endgültige Voice-over-Script für mindestens 10 Minuten.

### 02-audio

Hier liegen Voice-over und weitere tatsächlich verwendete Audiodateien.

### 03-export

Das ist der **einzige finale YouTube-Upload-Bereich**:

```text
FERTIGES-VIDEO.mp4
THUMBNAIL.png
YOUTUBE-TITEL.txt
YOUTUBE-BESCHREIBUNG.txt
YOUTUBE-KAPITEL.txt
YOUTUBE-TAGS.txt
```

Für YouTube-Langvideos gibt es **keine `UNIVERSELLE-CAPTION.txt`**.

### 99-technik

Recherche, Quellen, Szenenplanung, Thumbnail-Plan, Edit-Plan, Status und interne Metadaten liegen hier.

## Erstes Projekt

```text
youtube/projects/video-01_warum-hat-ein-tag-24-stunden/
```

Das Projekt enthält bereits Script, 60 Google-Flow-Bildprompts, Thumbnail-Prompt, Titel, Beschreibung, Kapitel, Tags, Recherche und Produktionsplan. Echte Bilder, Audio, Thumbnail-PNG und MP4 bleiben bis zur tatsächlichen Erstellung als ausstehend markiert.

## Vorlagen

Neue Projekte verwenden `youtube/templates/video-template/` als Strukturvorlage. Die globale Dauer- und Bilddichte kommt immer aus `youtube/YOUTUBE_WORKFLOW.md`.
