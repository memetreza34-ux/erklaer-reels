# 00 – Google-Flow-Masterprompt

Für neue YouTube-V2-Projekte gibt es hier **genau einen** sichtbaren Produktionsprompt:

```text
google-flow-prompt.txt
```

Der Masterprompt enthält Bild 00 (Thumbnail) und alle Videobilder in globaler Reihenfolge.

## Verbindliche 5er-Regel

Die Wellen sind Ausführungslogik, keine Ordnerlogik:

```text
Bild 00 separat erzeugen und prüfen

Bild 01–05 gleichzeitig
→ auf alle fünf warten
→ alle fünf prüfen
→ Fehler in derselben Welle korrigieren
→ als Bild 01.png bis Bild 05.png unter images/ ablegen
→ erst danach weiter

Bild 06–10
→ gleicher Ablauf

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

Die Bildzahl wird aus Skript und A–E-Komplexität abgeleitet. Es gibt keine feste Sollzahl.
