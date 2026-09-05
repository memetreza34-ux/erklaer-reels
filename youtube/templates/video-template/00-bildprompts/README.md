# 00 – Bildprompts und Bildpakete

Hier liegen der vollständige Prompt-Satz für die YouTube-Szenenbilder sowie die fertig erzeugten Bildpakete.

## Verbindliche 10er-Regel

Bilder werden immer in Blöcken von maximal 10 produziert.

Beispiel bei 60 Bildern:

```text
01_bilder-01-bis-10/
02_bilder-11-bis-20/
03_bilder-21-bis-30/
04_bilder-31-bis-40/
05_bilder-41-bis-50/
06_bilder-51-bis-60/
```

Innerhalb jedes Pakets:
1. Bilder nacheinander erzeugen.
2. Jedes Bild prüfen.
3. Global fortlaufend benennen: `Bild 01.png` bis `Bild 60.png`.
4. Nach 10 Bildern das Paket vollständig in seinen Bereichsordner legen.
5. Erst danach mit dem nächsten Paket beginnen.

Nicht alle Bilder zuerst erzeugen und später sortieren. Kein zweites 10er-Paket anfangen, solange das vorherige nicht vollständig benannt, geprüft und abgelegt ist.

Die vollständigen Bildregeln kommen aus `youtube/YOUTUBE_WORKFLOW.md` und `youtube/YOUTUBE_VISUAL_WORLD.md`.
