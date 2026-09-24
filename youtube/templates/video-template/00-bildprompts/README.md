# 00 – Google-Flow-Masterprompt

Für neue YouTube-V2-Projekte gibt es hier **genau einen** sichtbaren Produktionsprompt:

```text
google-flow-prompt.txt
```

Der Masterprompt enthält Bild 00 (Thumbnail) und alle Videobilder in globaler Reihenfolge.

## Verbindliche Bildregel

Jedes Bild wird **unabhängig aus seinem eigenen Textprompt** erzeugt.

HARD LOCK:
- kein vorheriges Bild als visuelle Vorlage
- kein Bild 01 als Master-Style-Frame
- keine Image-to-Image-Stilvererbung zwischen Videobildern
- jedes Bild braucht eine eigenständige, zum Inhalt passende Komposition
- Stil-Konsistenz kommt ausschließlich aus dem schriftlichen Style-Lock in `youtube/YOUTUBE_VISUAL_WORLD.md`

## Verbindliche 5er-Regel

Die Wellen sind nur Ausführungslogik, keine Ordner- oder Stilreferenzlogik:

```text
Bild 00 separat erzeugen und prüfen

Bild 01 separat erzeugen
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
- Bild 00 ist ausschließlich Thumbnail und nie Teil der Videotimeline
- alle fertigen Bilder liegen flach unter `00-bildprompts/images/`
- keine 10er-Unterordner
- keine separaten Promptdateien pro Paket
- keine Bild-zu-Bild-Referenzen

Die Bildzahl wird aus Skript und A–E-Komplexität abgeleitet. Es gibt keine feste Sollzahl.
