## Zweck / belegbares Problem

Was funktioniert bisher nicht gut, und warum verbessert dieser PR die **nächsten Produktionen**?

## Minimaler Umfang und Risiken

Welche zentralen Dateien wurden verändert? Welche bestehenden Funktionen und anderen Pipelines bleiben unverändert?

## Prüfergebnis

- [ ] Änderung hat klaren wiederverwendbaren Mehrwert.
- [ ] Bestehende Videoordner bleiben unangetastet (Ausnahme nur mit konkretem Nutzerauftrag unten).
- [ ] Kein unbeabsichtigter Einfluss auf Reels/YouTube oder Legacy-Projekte.
- [ ] Passende Regressionstests und `npm test` durchgeführt.
- [ ] Diff vor Merge auf unerwünschte Änderungen geprüft.

## Nur bei ausdrücklich beauftragter Änderung eines bestehenden Videos

Falls zutreffend, im PR-Text zusätzlich die exakte freigegebene Projektwurzel und das **wörtliche** Nutzerzitat in folgendem Format nennen:

```text
EXPLICIT_VIDEO_EDIT_APPROVAL: youtube/<woche>/<projekt>
USER_REQUEST_QUOTE: <wörtliche ausdrückliche Nutzeranweisung>
```

Wenn es keinen solchen Auftrag gibt: keine Änderungen an bestehenden Videoprojekten.
