# Interner Shorts-Produktionsplan

**Format:** YouTube Shorts / Instagram Reels / TikTok (9:16 vertikal, 1080x1920)
**Zieldauer:** 55–60 Sekunden (~155–175 Wörter)

## Aufbau der Ordnerstruktur (Identisch zu YouTube)
```text
shorts/YYYY-KWNN_DD-MM_bis_DD-MM/<thema-slug>/
├── 00-bildprompts/
│   ├── google-flow-prompt.txt      (Prompts für Google Flow, 5er-Batches)
│   └── images/                     (Bild 01.png ... Bild NN.png)
├── 01-voice-script/
│   └── voice-script.txt            (Sprechtext)
├── 02-audio/
│   └── voiceover-final.wav         (Studio-Mastering, vollautomatisch in Phase 1)
├── 03-export/
│   ├── THUMBNAIL.png               (Separates 9:16 Cover)
│   ├── SHORTS-UPLOAD.txt           (Titel, Beschreibung mit Hashtags)
│   └── <thema-slug>.mp4            (Final gerendertes Video)
└── 99-technik/
    ├── status.json
    ├── video.json
    ├── EDITORIAL_BRIEF.json
    ├── BILD_AUDIO_ZUORDNUNG.json
    └── voiceover-raw.wav
```

## Ablauf
1. **Phase 1 (Antigravity):** Recherche, Skript, vollautomatische Sprachgenerierung (`voiceover-final.wav`), Flow-Prompts, Mapping.
2. **Phase 2 (Arman):** Nur Bilder in Google Flow (`images/Bild 01.png` ... `Bild NN.png`) und Cover (`03-export/THUMBNAIL.png`).
3. **Phase 3 (Antigravity):** Alignment, Timeline, SFX, Motion und 9:16 Render nach `03-export/`.
