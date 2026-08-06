# Untertitel- und Sprechtempo-Regeln

## Position

- Zentrale Quelle ist `src/shared/subtitle-style.js`.
- horizontal zentriert
- vertikal exakt 58 % Bildhöhe
- erlaubter Bereich exakt 58–58 %
- abweichende Werte werden auf 58 % zurückgesetzt oder im strengen Lauf blockiert
- normalerweise 3–6 Wörter und höchstens zwei Zeilen
- Untertitel sind ein Overlay; Hauptmotive dürfen natürlich hinter ihnen liegen
- keine künstlich leere horizontale Zone im Bild erzeugen

## Farben und Lesbarkeit

- warmer heller Sandton `#E7C39A`
- keine andersfarbige Wortmarkierung
- keine schwarze Hintergrundbox oder Balken
- dunkle Kontur und dezenter Schatten
- alle Wörter eines Cues gleichfarbig

## Synchronisierung

- kurze Sinnabschnitte an die echte Audiospur anpassen
- Cue-Start und Cue-Ende müssen exakt zum gesprochenen Abschnitt passen
- keine Wort-für-Wort-Karaoke-Animation
- exakte Wortzeiten sind trotzdem verpflichtend
- Codex hört das lokale Voice-over vollständig ab
- gleichmäßig geschätzte oder erfundene Zeiten sind verboten
- finale Cues benötigen `timingStatus: codex-word-synced` und `timingSource: codex-local-audio-review`

## Voice-over optimieren

Zentrale Quelle: `src/shared/audio-pacing-style.js`.

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
```

- Pausen ab ungefähr 0,24 Sekunden kürzen
- kurze natürliche Restpause behalten
- exakt 1,10x bei erhaltener Tonhöhe
- −16 LUFS
- höchstens −1,5 dBTP
- 11 LRA
- immer von der ursprünglichen Audiodatei starten

Danach:

```bash
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
npm run sync:words -- --dir "PFAD-ZUM-REEL"
# production/codex-word-sync-task.md akustisch bearbeiten
npm run sync:words -- --dir "PFAD-ZUM-REEL" --apply --strict
```

## Beispiel

```json
{
  "text": "Wirtschaft für die Gesellschaft",
  "startSeconds": 4.18,
  "endSeconds": 5.72,
  "position": "center",
  "verticalPositionPercent": 58,
  "safeVerticalRangePercent": { "min": 58, "max": 58 },
  "textColor": "#E7C39A",
  "highlightCurrentWord": false,
  "highlightColor": "#E7C39A",
  "backgroundColor": "transparent",
  "timingStatus": "codex-word-synced",
  "timingSource": "codex-local-audio-review",
  "wordTimings": [
    { "text": "Wirtschaft", "startSeconds": 4.18, "endSeconds": 4.62 },
    { "text": "für", "startSeconds": 4.68, "endSeconds": 4.82 },
    { "text": "die", "startSeconds": 4.88, "endSeconds": 5.02 },
    { "text": "Gesellschaft", "startSeconds": 5.08, "endSeconds": 5.62 }
  ]
}
```
