# YouTube Adaptive Pacing V3

Gültig für neue YouTube-Projekte mit `schemaVersion >= 10`.

## Ziel

Die Bildanzahl folgt dem Inhalt, nicht einer festen Zielzahl. **Es gibt keine feste Bildzahl.** **Mehr Bilder sind ausdrücklich erwünscht, wenn ein Abschnitt mehrere klar unterscheidbare visuelle Gedanken enthält.** Füllbilder bleiben verboten.

## Kernregel

**1 Bild = 1 klare visuelle Kernaussage.**

Neues Bild planen bei:
- neuem Kerngedanken
- Ursache → Folge
- Vorher → Nachher
- Ortswechsel
- Epochenwechsel
- Perspektivwechsel
- neuem Akteur
- eigenständigem Karten-/Grenzschritt
- eigenständiger Zahl oder Datenidee
- Wechsel zwischen Erklärung und Beispiel
- einem Sprachabschnitt, der visuell zu lange auf demselben einfachen Bild hängen würde

## Timing-Ziele

| Klasse | Typ | Zielbereich | Split spätestens ernsthaft prüfen |
| --- | --- | ---: | ---: |
| A | sehr einfach | 3,0–4,5 s | > 5,5 s |
| B | einfach | 4,0–6,0 s | > 7,0 s |
| C | mittel | 5,5–7,5 s | > 8,5 s |
| D | komplex | 7,0–9,5 s | > 10,5 s |
| E | sehr komplex | 8,5–11,0 s | > 12,0 s |

Globale Regeln:
- Ziel für durchschnittliche Bilddauer: **4,5–7,5 s**
- ab **9 s** jeden Bildmoment bewusst prüfen
- ab **11 s** Split stark bevorzugen
- **16 s = globaler Hard-Max**
- unter **2,5 s** nur bei bewusstem schnellen Reveal/Übergang

## Mehr Bilder statt überladener Bilder

Wenn eine Passage zwei oder mehr eigenständige Schritte erklärt, nicht alles in ein Bild pressen.

Beispiel:

```text
„Die Grenze wurde gezogen, Menschen wurden umgesiedelt und später wurde aus der Binnengrenze eine internationale Grenze.“
```

Nicht ein überladenes Bild, sondern typischerweise:
1. Grenzziehung
2. Umsiedlung
3. spätere Staatsgrenze

## Premium-Pacing

Mehr Bildmomente sollen auch die visuelle Qualität erhöhen:
- ein Bild muss nicht gleichzeitig Karte + Dokument + fünf Akteure + Zeitstrahl erklären
- komplexe Information wird in mehrere sauber komponierte Frames aufgeteilt
- jeder Frame bekommt genug Platz für klare Hierarchie und hochwertige Gestaltung

## Kein künstliches Aufblasen

Verboten:
- zusätzliche Bilder ohne neue Aussage
- dasselbe Motiv nur leicht verschoben als neuer Bildmoment
- künstliche Bildwechsel nur um eine Zahl zu erreichen
- redundante Wiederholung derselben Karte ohne neuen Informationsschritt

## Cover

Bild 01 zählt normal zur Timeline und ist zugleich Cover. Es startet bei 0,0 s und muss sowohl Thumbnail-Hierarchie als auch ersten gesprochenen Gedanken tragen.

## Phase 1

Für jedes Bild im Mapping:
- `startAnchor`
- `endAnchor`
- `complexityLevel`
- `complexityReason`
- `plannedHoldSeconds`
- `visualPurpose`

Zusätzlich für Schema 10+:
- `splitReason` wenn ein Abschnitt bewusst in mehrere Bilder geteilt wurde
- `compositionMode`

## Phase 2

Die größere Bildzahl ändert die Generierungsregel nicht:
- Bild 01 exakt 3× als Cover-Kandidaten
- genau 1 Gewinner
- Bild 02–NN jeweils exakt 1×
- maximal 5 aktive Generierungen gleichzeitig
- keine manuellen Prüfstopps zwischen Wellen
- alle finalen Bilder in `00-bildprompts/images/`

## Phase 3

Phase 3 richtet die tatsächlichen Bildwechsel am optimierten Voice-over aus. Ein Bild darf seine geplante Zeit leicht verfehlen, aber lange Holds müssen begründet sein und dürfen den globalen Hard-Max nicht überschreiten.
