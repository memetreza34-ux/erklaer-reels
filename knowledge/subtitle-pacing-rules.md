# Untertitel- und Sprechtempo-Regeln

## Position

- Standardposition ist 79,5 % der Bildhöhe.
- Erlaubter Bereich ist 76,5–80,5 %.
- Untertitel liegen damit sichtbar weiter unten, bleiben aber oberhalb der unteren Plattform-Bedienelemente.
- Höchstens zwei Zeilen und kurze Sinnabschnitte verwenden.
- Bei einer Kollision mit wichtigem Bildinhalt darf innerhalb der sicheren Zone leicht nach oben verschoben werden.

## Gelbe Wortmarkierung

- Der vollständige Untertitel bleibt weiß sichtbar.
- Nur das gerade gesprochene Wort wird gelb (`#FFD84D`) markiert.
- Die gelbe Markierung darf ausschließlich echten, verifizierten Wortzeiten folgen.
- Exakte Wortzeiten können in `cue.wordTimings` oder `cue.words` stehen:

```json
{
  "text": "Der Tisch bekommt neuen Wert",
  "startSeconds": 4.2,
  "endSeconds": 6.1,
  "wordTimings": [
    { "text": "Der", "startSeconds": 4.2, "endSeconds": 4.45 },
    { "text": "Tisch", "startSeconds": 4.45, "endSeconds": 4.9 },
    { "text": "bekommt", "startSeconds": 4.96, "endSeconds": 5.32 },
    { "text": "neuen", "startSeconds": 5.39, "endSeconds": 5.67 },
    { "text": "Wert", "startSeconds": 5.72, "endSeconds": 6.02 }
  ]
}
```

- Die Wörter müssen vollständig zum sichtbaren Cue-Text passen.
- Zeiten müssen chronologisch sortiert sein und innerhalb der Cue-Zeit liegen.
- Ohne exakte Wortzeiten bleibt der gesamte Cue weiß. Der Renderer darf keine gelbe Schätzung anzeigen.
- Der finale Renderer-Check blockiert die Freigabe, wenn die Wortmarkierung aktiv ist, aber exakte Wortzeiten fehlen.
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
