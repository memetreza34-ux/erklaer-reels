# 00 – Google-Flow-Masterprompt

Für neue YouTube-Projekte gibt es hier **genau einen** sichtbaren Produktionsprompt:

```text
google-flow-prompt.txt
```

Der Masterprompt enthält alle Videobilder in globaler Reihenfolge, beginnend mit **Bild 01**.

## FIRST SCENE = COVER HARD LOCK

- **Bild 01 ist Cover und erste Videoszene zugleich.**
- Bild 01 beginnt bei 0,0 s in der Timeline.
- Bild 01 enthält eine starke kurze deutsche Cover-Überschrift und passt zur ersten gesprochenen Aussage.
- `03-export/THUMBNAIL.png` wird aus `Bild 01.png` kopiert.
- Es gibt **kein Bild 00** und kein separates Thumbnail-Bild für neue Projekte.

## COVER = 3 CANDIDATES HARD LOCK

Nur das Cover wird mehrfach erzeugt:

```text
Bild 01 → genau 3 temporäre Kandidaten
→ genau 1 Gewinner auswählen
→ Gewinner genau einmal zu Bild 01.png umbenennen
→ andere 2 Kandidaten vollständig verwerfen
```

Die verworfenen Kandidaten dürfen **nicht** unter `00-bildprompts/images/` liegen bleiben.

## NON-COVER = SINGLE GENERATION HARD LOCK

Für jedes Bild ab Bild 02 gilt:

- genau **eine** Generierung
- keine zweite Version
- keine manuelle Prüfung nach 5er-Wellen
- kein Stop nach 02–05, 06–10 usw.
- keine standardmäßige Regeneration
- finales Bild genau einmal zu `Bild NN.png` benennen
- maximal fünf aktive Generierungen gleichzeitig

Die 5er-Grenze ist ausschließlich Parallelitäts-/Lastlogik.

## FINAL IMAGE FOLDER HARD LOCK

Nach der Bildproduktion gibt es genau einen flachen finalen Bildordner:

```text
00-bildprompts/images/
├── Bild 01.png
├── Bild 02.png
├── Bild 03.png
└── ... bis Bild NN.png
```

Verboten im finalen Ordner:
- Unterordner
- `Bild 00.png`
- Cover-Versionen A/B/C
- verworfene Varianten
- zusätzliche PNG-Dateien

Danach prüfen mit:

```bash
npm run validate:youtube-phase2 -- --dir "youtube/<woche>/<thema>"
```

## Verbindliche Bildregel

Jedes Bild wird unabhängig aus seinem eigenen Textprompt erzeugt.

HARD LOCK:
- kein vorheriges Bild als visuelle Vorlage
- Bild 01 ist Cover, aber **kein Master-Style-Frame**
- keine Image-to-Image-Stilvererbung
- jedes Bild braucht eine eigenständige, zum Inhalt passende Komposition
- Stil-Konsistenz kommt ausschließlich aus dem schriftlichen Style-Lock in `youtube/YOUTUBE_VISUAL_WORLD.md`

Die Bildzahl wird aus Skript und A–E-Komplexität abgeleitet. Es gibt keine feste Sollzahl.
