# Untertitel- und Sprechtempo-Regeln

## Position

- Standardposition ist 79,5 % der Bildhöhe.
- Erlaubter Bereich ist 76,5–80,5 %.
- Untertitel liegen sichtbar weit unten, bleiben aber oberhalb der Plattform-Bedienelemente.
- Höchstens zwei Zeilen und normalerweise 3–6 Wörter verwenden.
- Bei einer Kollision mit wichtigem Bildinhalt darf innerhalb der sicheren Zone leicht nach oben verschoben werden.

## Gelbe Wortmarkierung

- Der vollständige Untertitel bleibt weiß sichtbar.
- Nur das gerade gesprochene Wort wird gelb (`#FFD84D`) markiert.
- Die Markierung darf ausschließlich echten Wortzeitstempeln folgen.
- Gleichmäßige oder gewichtete Schätzungen sind verboten.
- Ohne exakte Wortzeiten bleibt der gesamte Cue weiß.
- Der finale Renderer-Check blockiert fehlende, überlappende oder unvollständige Wortzeiten.

## Automatische Wortzeiten mit Gemini

Nach bestandener Szenen-Audio-Synchronisierung:

```bash
npm run sync:words -- --dir "PFAD-ZUM-REEL" --strict
```

Der Befehl:

1. sendet das Voice-over an die Gemini Interactions API
2. fordert deutsche Wort-Zeitstempel an
3. ordnet die Wörter den Szenen der Master-Timeline zu
4. erstellt kurze Untertitel-Cues
5. schreibt absolute `wordTimings`
6. aktualisiert Timeline und Render-Plan

Pflichtwerte:

- mindestens 98 % Wortabdeckung
- keine Szene ohne erkannte Wörter
- Cue-Text stimmt vollständig mit der Wortliste überein
- chronologische Start- und Endzeiten
- `review/word-sync-report.json` enthält `passed: true`

Beispiel:

```json
{
  "text": "Der Tisch bekommt neuen Wert",
  "startSeconds": 4.18,
  "endSeconds": 6.12,
  "position": "safe-lower-middle",
  "verticalPositionPercent": 79.5,
  "highlightCurrentWord": true,
  "highlightColor": "#FFD84D",
  "timingStatus": "gemini-word-synced",
  "timingSource": "gemini-interactions-asr",
  "wordTimings": [
    { "text": "Der", "startSeconds": 4.2, "endSeconds": 4.45 },
    { "text": "Tisch", "startSeconds": 4.45, "endSeconds": 4.9 },
    { "text": "bekommt", "startSeconds": 4.96, "endSeconds": 5.32 },
    { "text": "neuen", "startSeconds": 5.39, "endSeconds": 5.67 },
    { "text": "Wert", "startSeconds": 5.72, "endSeconds": 6.02 }
  ]
}
```

## Pausen

- Lange Satzpausen ab ungefähr 0,25 Sekunden dürfen automatisch gekürzt werden.
- Etwa 0,12 Sekunden natürliche Pause bleiben erhalten.
- Vor der Pausenkürzung bleibt die Originaldatei im Manifest dokumentiert.
- Nach `trim:pauses` müssen Timeline, Audio-Cues und Gemini-Wortzeiten neu erzeugt werden.

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL"
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
npm run sync:words -- --dir "PFAD-ZUM-REEL" --strict
```
