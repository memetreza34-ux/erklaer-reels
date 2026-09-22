# Warum ging das Römische Reich wirklich unter?

YouTube Golden-V2-Testprojekt · KW39 2026

- Format: YouTube Longform
- Zieldauer: ca. 5:20 min
- Sprache: Deutsch
- Bildwelt: `youtube-editorial-stick-explainer`
- Produktionsregeln: V2
- Bilder: 38 Videobilder + Bild 00 als Thumbnail
- Bildanzahl: aus Inhalt und A–E-Komplexität abgeleitet
- Google Flow: maximal 5 Bilder gleichzeitig

## Einfache sichtbare Struktur

Für die normale Arbeit brauchst du nur:

```text
00-bildprompts/
└── google-flow-prompt.txt   ← EIN Prompt-Dokument für Thumbnail + alle Bilder

01-voice-script/
└── voice-script.txt         ← EIN komplettes Voice-over-Skript

02-audio/
└── voiceover-final.*        ← später EINE finale Audiodatei

03-export/                   ← fertiges Video + Upload-Dateien
99-technik/                  ← interne Zuordnung, Timing, Recherche und QC
```

Die Unterteilung in 5er-Wellen ist **keine sichtbare Dateistruktur**. Sie steht nur als Arbeitslogik im Master-Prompt und wird von der Produktion selbst abgearbeitet:

`01–05 → prüfen → 06–10 → prüfen → 11–15 → ... → 36–38`

Alle fertigen Bilder werden flach als `Bild 00.png` bis `Bild 38.png` unter `00-bildprompts/images/` abgelegt. Es gibt keine 10er-Promptordner und keine sichtbaren Script-Parts mehr.

## Status

Phase 1 ist vorbereitet:
- Recherche und Quellen
- Titel
- ein Thumbnail-/Bild-Masterprompt
- ein vollständiges Voice-over-Skript
- 38 individuell geplante Videobilder
- A–E-Komplexität pro Bild
- internes Bild↔Audio-Mapping
- Edit-/Motion-/SFX-Plan
- Upload-Metadaten

Phase 2:
1. `google-flow-prompt.txt` an Google Flow geben.
2. Flow arbeitet selbstständig in maximal fünf Bildern gleichzeitig.
3. Das vollständige `voice-script.txt` einmal als finales Voice-over erzeugen.
4. Die eine finale Audiodatei in `02-audio/` ablegen.

Phase 3 übernimmt Synchronisation, technische Unterteilung, Timeline und Render automatisch im Hintergrund.