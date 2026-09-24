# Warum gibt es Zeitzonen?

YouTube-V2-Testprojekt · KW39 2026

- Format: YouTube Longform
- Zieldauer: ca. 2:00 min nach Audio-Optimierung
- Sprache: Deutsch
- Voice-Skript: 338 Wörter
- Bildwelt: `premium-editorial-explainer-illustration-youtube-16x9`
- Produktionsregeln: V2
- Bilder: 19 Videobilder + Bild 00 als Thumbnail
- Google Flow: maximal 5 aktive Bildgenerierungen gleichzeitig
- Audio Phase 3: lange Pausen kürzen, Endstille entfernen, 1,10x, Pitch erhalten, −16 LUFS, max. −1,5 dBTP

## Bildwelt-Hard-Lock

Dieses Video nutzt die neue eigenständige YouTube-Bildwelt:
- hochwertige moderne 2D-Editorial-/Erklärillustration
- erwachsene Magazin-/Infografik-Wirkung
- klare vektorartige Formen
- kontrollierte Linienführung
- flache bis leicht geschichtete Farben mit subtiler Tiefe
- dezente Papier-/Korntextur erlaubt
- starke visuelle Hierarchie
- jedes Bild wird speziell für seinen gesprochenen Gedanken komponiert
- kein billiger Cartoon-/Clipart-Look
- kein generisches KI-Template

## Wichtigste Regel: keine Bildvorlagen

**Kein erzeugtes Bild wird als visuelle Referenz für ein späteres Bild verwendet.**

- Bild 01 ist kein Master-Style-Frame.
- Bild 02–19 bekommen Bild 01 nicht als Referenz.
- Kein vorheriges Bild wird an Flow angehängt.
- Jedes Bild entsteht nur aus seinem eigenen Textprompt.
- Stil-Konsistenz kommt aus dem geschriebenen Style-Lock.

## Individualität

Jedes Bild soll sichtbar individuell sein. Je nach Inhalt dürfen und sollen wechseln:
- Perspektive
- Layout
- Hintergrund
- Maßstab
- dominante Formen
- Akzentfarben
- Kompositionsart

Verboten ist eine Copy-Paste-Serie mit immer derselben Figur, demselben Hintergrund oder derselben Symbolanordnung.

## Deutsch-Hard-Lock

Jeder sichtbare lesbare Text muss Deutsch sein. Englischer Text oder Pseudo-Schrift = Hard Fail und Regeneration.

## Sichtbare Struktur

```text
00-bildprompts/
└── google-flow-prompt.txt

01-voice-script/
└── voice-script.txt

02-audio/
└── voiceover-final.*

03-export/
99-technik/
```

Wellenlogik:

`Bild 00 separat → Bild 01 separat → 02–05 einzeln ohne Referenz → prüfen → 06–10 → 11–15 → 16–19`

Die Wellen regeln nur die Anzahl gleichzeitig aktiver Generierungen. Jedes Bild bleibt unabhängig.

## Phase 1 abgeschlossen

Vorbereitet sind:
- Duplicate-Check
- Recherche und Quellen
- finaler Titel
- ein Google-Flow-Masterprompt
- vollständiges 338-Wörter-Voice-over-Skript
- 19 individuell geplante Videobilder
- exakte Textanker für jedes Bild
- A–E-Komplexität
- Motion-/SFX-Plan
- Kapitelplan
- Upload-Metadaten im Produktionsplan

## Phase 2

1. `00-bildprompts/google-flow-prompt.txt` in Google Flow nutzen.
2. Bild 00 separat erzeugen.
3. Bild 01 separat aus seinem Textprompt erzeugen und prüfen.
4. Danach Bilder 02–05 jeweils aus ihrem eigenen Prompt erzeugen — **ohne Bildreferenz**.
5. Danach 06–10, 11–15 und 16–19 genauso.
6. Alle Bilder flach als `Bild NN.png` unter `00-bildprompts/images/` ablegen.
7. `01-voice-script/voice-script.txt` als eine finale Voice-over-Datei aufnehmen/erzeugen.
8. Voice-over als `02-audio/voiceover-final.wav` oder ein anderes unterstütztes Audioformat ablegen.

## Phase 3

```bash
npm run phase3:youtube -- --dir "youtube/2026-KW39_21-09_bis_27-09/warum-gibt-es-zeitzonen"
```

Phase 3 verändert das Nutzeroriginal nicht. Sie erzeugt intern die 1,10x-/Pausen-bereinigte Produktionsfassung, misst danach Whisper-Wortzeiten, baut die Timeline und rendert das fertige Video.
