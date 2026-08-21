# YouTube

Dieser Bereich ist die **eigenständige Produktionspipeline für YouTube-Langvideos**. Reels und Kurzvideos bleiben vollständig getrennt unter `reels/`.

## Verbindliche Regel

Für YouTube zuerst **`youtube/YOUTUBE_WORKFLOW.md`** lesen. Reel-spezifische Werte aus `CURRENT_WORKFLOW.md` wie 55–60 Sekunden, 13 Szenen oder Reel-Untertitelregeln gelten **nicht automatisch** für YouTube-Langvideos.

Aktueller Standard: deutsche, quellenbasierte 16:9-Erklärgeschichten mit **8 bis 12 Minuten**, Ziel ungefähr 10 Minuten. Sie bestehen nur aus Bildern, deutschem Voice-over und sparsamen Soundeffekten. Im Video gibt es keine Untertitel oder Textkarten.

Eigene Bildwelt: **`german-simple-explainer-cartoon`** aus `youtube/YOUTUBE_VISUAL_WORLD.md`.

```bash
npm run create:youtube -- --title "TITEL"
npm run verify:youtube-handoff -- --dir "youtube/projects/video-XX_slug"
npm run validate:youtube-render -- --dir "youtube/projects/video-XX_slug"
npm run render:youtube -- --dir "youtube/projects/video-XX_slug"
npm run validate:youtube-output -- --dir "youtube/projects/video-XX_slug"
```

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
