# Untertitel- und Sprechtempo-Regeln

## Position

- Standardposition ist 77 % der Bildhöhe.
- Erlaubter Bereich ist 74–79 %.
- Untertitel liegen damit deutlich tiefer als zuvor, bleiben aber oberhalb der unteren Plattform-Bedienelemente.
- Höchstens zwei Zeilen und kurze Sinnabschnitte verwenden.

## Gelbe Wortmarkierung

- Der vollständige Untertitel bleibt weiß sichtbar.
- Nur das gerade gesprochene Wort wird gelb (`#FFD400`) markiert.
- Bevorzugt werden exakte Wortzeiten in `cue.words`:

```json
{
  "text": "Der Tisch bekommt neuen Wert",
  "startSeconds": 4.2,
  "endSeconds": 6.1,
  "words": [
    { "text": "Der", "startSeconds": 4.2, "endSeconds": 4.45 },
    { "text": "Tisch", "startSeconds": 4.45, "endSeconds": 4.9 }
  ]
}
```

- Ohne Wortzeiten verwendet der Renderer nur eine gewichtete Schätzung. Das ist ein Fallback und keine bestätigte Sprachsynchronisation.
- Nach Änderungen an der Audiodatei müssen Wortzeiten neu berechnet oder neu geprüft werden.

## Pausen

- Lange Satzpausen ab ungefähr 0,25 Sekunden dürfen automatisch gekürzt werden.
- Etwa 0,12 Sekunden natürliche Pause bleiben erhalten.
- Vor der Pausenkürzung bleibt die Originaldatei im Manifest dokumentiert.
- Nach `trim:pauses` müssen Timeline, Audio-Cues und Untertitel neu synchronisiert werden.

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL"
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```
