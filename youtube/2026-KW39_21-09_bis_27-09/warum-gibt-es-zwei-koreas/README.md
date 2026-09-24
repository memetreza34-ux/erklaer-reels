# Warum gibt es zwei Koreas?

YouTube-Longform · KW39 2026

- Genre: internationale Beziehungen, Geopolitik, Geschichte, Grenzen
- Zieldauer: ca. 2:30 min
- Sprache: Deutsch
- Voice-over: ca. 445 Wörter
- Bilder: 24 Videobilder
- Format: 16:9 horizontal
- Bildwelt: `premium-editorial-explainer-illustration-youtube-16x9`
- Visual Policy: V3
- Cover Policy: V1
- Google Flow: maximal 5 aktive Bildgenerierungen gleichzeitig

## Warum das Thema zum Kanal passt

Das Video sitzt direkt im Kern des Kanals: Staatenbildung, Kalter Krieg, Grenzen, Krieg, internationale Beziehungen und unterschiedliche politische Systeme. Es ist kein allgemeines Alltags-Warum-Thema.

## Cover-Regel

**Bild 01 ist gleichzeitig Cover und erste Videoszene.**

- Bild 01 startet bei 0,0 s.
- Cover-Text: `WARUM ZWEI KOREAS?`
- Bild 01 erklärt gleichzeitig die Hook des Sprechertexts.
- Es gibt kein separates Bild 00.
- `03-export/THUMBNAIL.png` wird später direkt aus `Bild 01.png` kopiert.

## Bildwelt

Verbindlich:
- hochwertige erwachsene 2D-Editorial-/Dokumentar-Erklärillustration
- klare Ursache-Wirkung und räumliche Zusammenhänge
- Karten nur dort, wo Geografie wirklich erklärt werden muss
- historische Szenen, politische Kontraste und militärische Bewegungen abwechslungsreich darstellen
- sinnvolle Tiefe, Richtung, Hierarchie und Licht
- jedes Bild unabhängig aus seinem eigenen Textprompt erzeugen
- kein vorheriges Bild als visuelle Referenz verwenden

Verboten:
- Countryball-Schablone
- Stickfiguren
- kindlicher Cartoon-Look
- generische Icon-Collage
- leere Präsentationskarten
- 3D/Pixar/Clay/Anime/Fotorealismus als Standard
- englischer sichtbarer Text
- Pseudo-Schrift

## Produktionsstruktur

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

## Phase 2

1. frische Google-Flow-Sitzung öffnen
2. `00-bildprompts/google-flow-prompt.txt` vollständig einfügen
3. Bild 01 separat erzeugen und als Cover + erste Szene prüfen
4. Bild 02–05 erzeugen und prüfen
5. danach 06–10, 11–15, 16–20 und 21–24
6. alle Bilder flach unter `00-bildprompts/images/` als `Bild NN.png` ablegen
7. `01-voice-script/voice-script.txt` als ein einziges finales Voice-over erzeugen
8. Audiodatei unter `02-audio/voiceover-final.*` ablegen

## Phase 3

Danach:

```bash
npm run phase3:youtube -- --dir "youtube/2026-KW39_21-09_bis_27-09/warum-gibt-es-zwei-koreas"
```

Phase 3 übernimmt Audio-Optimierung, Whisper-Alignment, reale Bildwechsel, Motion/SFX, Render, Thumbnail-Export aus Bild 01 und die finalen Hard-Gates.
