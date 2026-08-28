# YouTube

Dieser Bereich ist die **eigenständige Produktionspipeline für YouTube-Langvideos**. Reels und Kurzvideos bleiben vollständig getrennt unter `reels/`.

## Verbindliche Regel

Für YouTube zuerst **`youtube/YOUTUBE_WORKFLOW.md`** lesen. Reel-spezifische Werte aus `CURRENT_WORKFLOW.md` wie 55–60 Sekunden, 13 Szenen, Reel-Captions oder Reel-Untertitelregeln gelten **nicht automatisch** für YouTube-Langvideos.

Aktueller Startstandard: Neue YouTube-Langvideos zielen zunächst auf **ungefähr 5 bis 6 Minuten**. Die genaue Dauer darf innerhalb dieses Korridors natürlich variieren.

## Sichtbare Projektstruktur

Jedes neue YouTube-Langvideo liegt unter `youtube/projects/` in einem eigenen Projektordner und verwendet nur diese sichtbaren Arbeitsbereiche:

```text
video-XX_thema/
├── 00-bildprompts/
├── 01-voice-script/
├── 02-audio/
├── 03-export/
└── 99-technik/
```

### 00-bildprompts

Hier liegen die vollständigen Bildprompts für die YouTube-Szenenbilder.

### 01-voice-script

Hier liegt das endgültige Voice-over-Script.

### 02-audio

Hier liegen Voice-over und weitere tatsächlich verwendete Audiodateien.

### 03-export

Das ist der **einzige finale YouTube-Upload-Bereich**. Am Ende gehören dort hinein:

```text
FERTIGES-VIDEO.mp4
THUMBNAIL.png
YOUTUBE-TITEL.txt
YOUTUBE-BESCHREIBUNG.txt
YOUTUBE-KAPITEL.txt
YOUTUBE-TAGS.txt
```

Für YouTube-Langvideos gibt es **keine `UNIVERSELLE-CAPTION.txt`**. Die universelle Caption gehört ausschließlich zum Reel-/Kurzvideo-Workflow.

### 99-technik

Recherche, Idee, Szenenplanung, Thumbnail-Plan, Edit-Plan, Status und interne Metadaten liegen hier, damit der normale sichtbare Workflow übersichtlich bleibt.

## Vorlagen

Neue Projekte verwenden `youtube/templates/video-template/` als Vorlage. Die interne Planung darf umfangreich sein, aber die sichtbare Projektstruktur bleibt auf die fünf Bereiche oben begrenzt.
