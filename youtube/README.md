# YouTube

Dieser Bereich ist die **eigenständige Produktionspipeline für YouTube-Langvideos**. Reels und Kurzvideos bleiben vollständig getrennt unter `reels/`.

## Verbindliche Regel

Für YouTube zuerst **`youtube/YOUTUBE_WORKFLOW.md`** lesen. Reel-spezifische Werte aus `CURRENT_WORKFLOW.md` wie 55–60 Sekunden, 13 Szenen oder Reel-Untertitelregeln gelten **nicht automatisch** für YouTube-Langvideos.

Aktueller Startstandard: Neue YouTube-Langvideos zielen zunächst auf **ungefähr 5 bis 6 Minuten**. Die genaue Dauer darf innerhalb dieses Korridors natürlich variieren.

## Struktur

```text
youtube/
├── README.md
├── YOUTUBE_WORKFLOW.md
├── projects/
│   └── README.md
└── templates/
    └── video-template/
        ├── video.json
        ├── status.json
        ├── 00-idee/
        ├── 01-recherche/
        ├── 02-script/
        ├── 03-szenen/
        ├── 04-bildprompts/
        ├── 05-assets/
        ├── 06-audio/
        ├── 07-thumbnail/
        ├── 08-edit/
        ├── 09-upload/
        └── 10-output/
```

Neue Langvideos werden unter `youtube/projects/` als eigener Projektordner angelegt. Skript, Recherche, Szenen, Prompts, Assets, Thumbnail, Audio, Schnitt, Upload-Daten und finales Video bleiben dadurch sauber getrennt.
