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

## Verbindliche Bildregel

Jedes Bild wird unabhängig aus seinem eigenen Textprompt erzeugt.

HARD LOCK:
- kein vorheriges Bild als visuelle Vorlage
- Bild 01 ist Cover, aber **kein Master-Style-Frame**
- keine Image-to-Image-Stilvererbung
- jedes Bild braucht eine eigenständige, zum Inhalt passende Komposition
- Stil-Konsistenz kommt ausschließlich aus dem schriftlichen Style-Lock in `youtube/YOUTUBE_VISUAL_WORLD.md`

## Verbindliche 5er-Regel

Die Wellen sind nur Ausführungslogik:

```text
Bild 01 separat erzeugen und streng prüfen: COVER + ERSTE SZENE
Bild 02–05 jeweils aus eigenem Textprompt
→ auf die Welle warten
→ alle Bilder einzeln prüfen
→ Fehler in derselben Welle korrigieren
→ als Bild 01.png bis Bild 05.png unter images/ ablegen
→ erst danach weiter

Bild 06–10
→ gleicher Ablauf, weiterhin ohne Referenzbild

11–15
→ usw.
```

Harte Regeln:
- maximal fünf aktive Bildgenerierungen gleichzeitig
- niemals zwei Wellen gleichzeitig offen halten
- nächste Welle erst nach vollständigem Check der aktuellen
- letzter Block darf 1–5 Bilder enthalten
- **kein Bild 00**
- `Bild 01.png` ist Cover + erste Timeline-Szene + spätere Thumbnail-Quelle
- alle fertigen Bilder liegen flach unter `00-bildprompts/images/`
- keine 10er-Unterordner
- keine separaten Promptdateien pro Paket
- keine Bild-zu-Bild-Referenzen

Die Bildzahl wird aus Skript und A–E-Komplexität abgeleitet. Es gibt keine feste Sollzahl.
