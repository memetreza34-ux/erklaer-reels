# Alle Bildprompts

`all-image-prompts.txt` ist die verbindliche Google-Flow-Sammeldatei für dieses Reel.

Der Nutzer kopiert die **komplette Datei einmal** in Google Flow und sendet sie ab. Google Flow muss danach streng seriell arbeiten:

**Bild erzeugen → vollständig warten → sofort umbenennen → Umbenennung prüfen → erst dann das nächste Bild starten.**

Zu keinem Zeitpunkt dürfen mehrere Bilder parallel laufen oder spätere Bilder in eine Queue gelegt werden.

## Cover und Stil

`Bild 00.png` ist:
- das echte Cover,
- das Bild mit dem sichtbaren Hook zum Reel-Thema,
- die verbindliche visuelle Master-Vorlage für alle späteren Szenen.

Der Hook-Text des Covers muss exakt und gut lesbar umgesetzt werden. Das fertige `Bild 00.png` dient danach direkt als Style-Referenz für Bild 01 bis Bild 13: gleicher Zeichen-/Renderstil, gleiche Farbwelt, gleiche Figurenmerkmale, Proportionen, Lichtstimmung und Detailqualität.

Der Cover-Hook wird nicht automatisch in Szenen kopiert. Szenentext erscheint nur, wenn der jeweilige Szenenprompt ihn verlangt.

## Nummerierung und Ablage

- Bild 00 = Cover
- Bild 01 = Szene 1
- Bild 02 = Szene 2
- fortlaufend bis Bild 13 = Szene 13

Jedes Bild wird unmittelbar nach seiner vollständigen Erzeugung korrekt umbenannt. Erst wenn **alle** Bilder fertig und geprüft sind, werden sie gemeinsam in `00-bildprompts/00-ALLE-BILDER-HIER-REIN/` beziehungsweise technisch `inbox/numbered-images/` gelegt.
