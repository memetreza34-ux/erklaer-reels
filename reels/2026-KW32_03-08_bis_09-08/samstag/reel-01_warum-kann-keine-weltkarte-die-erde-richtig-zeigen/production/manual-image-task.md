# Google-Flow-Bildauftrag

Kopiere `all-image-prompts/all-image-prompts.txt` vollständig und sende sie genau **einmal** in Google Flow. Dieses einmalige Absenden ist die vollständige Freigabe für alle Bilder.

## Harte serielle Regel
Immer nur ein Bild aktiv: `Bild erzeugen → vollständig warten → sofort umbenennen → Dateinamen prüfen → automatisch nächstes Bild`. Kein Batch, keine Queue, kein paralleles Erzeugen und kein Warten auf `Go`, `Weiter` oder `OK`.

## Cover
`Bild 00.png` ist echtes Cover und Style-Master. Der sichtbare Hook lautet exakt: `WARUM IST JEDE WELTKARTE VERZERRT?`. Alle späteren Szenen verwenden das fertige `Bild 00.png` direkt als visuelle Referenz. Cover-Hook nicht automatisch in Szenen kopieren.

## Abschluss
Erst nach `Bild 13.png` die Nummerierung prüfen und dann alle 14 Dateien gemeinsam in `inbox/numbered-images/` legen. Danach visuelle Zwei-Pass-QC; die Nummer allein bestätigt nie den Inhalt.
