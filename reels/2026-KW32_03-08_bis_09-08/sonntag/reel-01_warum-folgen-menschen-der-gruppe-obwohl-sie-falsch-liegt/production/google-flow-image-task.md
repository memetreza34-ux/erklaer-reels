# Google-Flow-Produktionsauftrag

## Reel
**Warum folgen Menschen der Gruppe, obwohl die Gruppe falsch liegt?**

## Bildgenerierung
Verwende ausschließlich `all-image-prompts/all-image-prompts.txt` als chronologische Bildliste.

Direkt bei jedem Prompt stehen:
- Bildnummer
- Ziel
- exakter Dateiname
- Einzelbild-Anweisung

Arbeite strikt einzeln:

**einen Prompt lesen → genau ein Bild mit Image 3 erzeugen → dieses Bild sofort korrekt umbenennen → erst dann den nächsten Prompt lesen.**

Reihenfolge:
- Bild 00 = Cover
- Bild 01 = Szene 1
- Bild 02 = Szene 2
- Bild 03 = Szene 3
- fortlaufend bis Bild 13 = Szene 13

Erst wenn Bild 00 bis Bild 13 vollständig erzeugt UND korrekt benannt sind, alle 14 Bilder gemeinsam in `00-bildprompts/00-ALLE-BILDER-HIER-REIN/` beziehungsweise technisch `inbox/numbered-images/` legen.

Nicht vorher mehrere unbenannte Bilder sammeln. Nicht auf einzelne Szenenordner verteilen.

## Danach
Die bestehende Pipeline übernimmt die Nummern nur als Zielvorschlag. Jedes Bild muss weiterhin tatsächlich visuell geprüft werden. Unter 0,90 Konfidenz nicht raten.

Das Voice-over ist noch extern zu erzeugen. Audio-Pacing, Word-Sync, finale visuelle QC und Render bleiben bis dahin offen.
