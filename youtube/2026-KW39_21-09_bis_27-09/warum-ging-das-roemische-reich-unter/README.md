# Warum ging das Römische Reich wirklich unter?

YouTube Golden-V2-Testprojekt · KW39 2026

- Format: YouTube Longform
- Zieldauer: ca. 5:20 min
- Sprache: Deutsch
- Bildwelt: `universal-editorial-stickman-v1.2`
- Produktionsregeln: V2
- Bilder: 38 Videobilder + Bild 00 als Thumbnail
- Bildanzahl: aus Inhalt und A–E-Komplexität abgeleitet
- Google Flow: maximal 5 aktive Bildgenerierungen gleichzeitig

## Bildwelt-Hard-Lock

Dieses Video nutzt die **Universal Editorial Stickman World v1.2**:
- hochwertige digitale 2D-Editorial-Illustration
- jeder sichtbare Mensch ist minimalistischer Stickman, auch Hintergrundfiguren
- reichere glaubwürdige Umgebungen mit natürlicher Lichtwirkung und subtiler 2D-Schattierung
- moderate bis kräftige szenengerechte Farben
- kein beige/sepia Historien-Cartoon-/Pergament-Look
- keine normalen oder semi-realistischen Cartoon-Menschen

Bild 01 wird separat als Master-Style-Frame erzeugt. Ab Bild 02 wird Bild 01 bei jeder weiteren Generierung als visuelle Referenz angehängt.

## Deutsch-Hard-Lock

Bei diesem deutschen Video muss **jeder sichtbare lesbare Text Deutsch sein**. Das gilt auch für Kartenlabels, Schilder, Legenden, Diagramme, Kalender und Callouts.

Englischer sichtbarer Text oder Pseudo-Schrift = Hard Fail → Bild regenerieren. Wenn Text nicht nötig ist, keinen Text erzeugen.

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

Die Unterteilung in Wellen ist **keine sichtbare Dateistruktur**:

`Bild 00 → Bild 01 Master → 02–05 → prüfen → 06–10 → prüfen → 11–15 → ... → 36–38`

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
- korrigierter Bildwelt-Lock
- Deutsch-Hard-Lock für jeden sichtbaren Bildtext

Phase 2:
1. `google-flow-prompt.txt` an Google Flow geben.
2. Bild 00 separat erzeugen.
3. Bild 01 separat erzeugen, prüfen und als Master-Style-Frame festlegen.
4. Bild 02–05 mit Bild 01 als Referenz erzeugen und prüfen.
5. Danach in maximal 5 aktiven Generierungen pro Welle fortfahren.
6. Das vollständige `voice-script.txt` einmal als finales Voice-over erzeugen.
7. Die eine finale Audiodatei in `02-audio/` ablegen.

Phase 3 übernimmt Synchronisation, technische Unterteilung, Timeline und Render automatisch im Hintergrund.
