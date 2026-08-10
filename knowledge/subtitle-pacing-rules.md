# Untertitel- und Sprechtempo-Regeln

> Bei Widersprüchen gilt `CURRENT_WORKFLOW.md`.

## Position

- Zentrale Quelle ist `src/shared/subtitle-style.js`.
- horizontal zentriert
- vertikal exakt 58 % Bildhöhe
- erlaubter Bereich exakt 58–58 %
- normalerweise 3–6 Wörter und höchstens zwei Zeilen
- Untertitel sind ein Overlay; Hauptmotive dürfen natürlich hinter ihnen liegen
- keine künstlich leere horizontale Zone im Bild erzeugen

## Farben und Lesbarkeit

- Grundtext: weiches Weiß `#F5F7FA`
- aktuell gesprochenes Wort: warmes Braun `#B7794A`
- nur die Farbe des aktiven Wortes wechselt
- keine schwarze Hintergrundbox oder Balken
- dunkle Kontur und dezenter Schatten
- keine Bounce-, Zoom-, Größen- oder Positionsanimation

## Synchronisierung

- Untertitel werden aus dem tatsächlichen gesprochenen Voice-over synchronisiert
- jedes gesprochene Wort muss echte akustische Start- und Endzeiten besitzen
- `coverage === 1`
- `timedWords === totalWords`
- `unassignedWords === 0`
- die vollständige Untertitel-Wortfolge muss exakt `script/voice-script.txt` entsprechen
- das braune Aktivwort folgt den exakten Wortzeiten des Sprechers
- bei Sprechpausen kein Folgewort vorzeitig markieren
- Codex hört das lokale Voice-over vollständig ab
- gleichmäßig geschätzte oder erfundene Zeiten sind verboten
- finale Cues benötigen `timingStatus: codex-word-synced` und `timingSource: codex-local-audio-review`
- fehlt auch nur ein Wort, ist der Render blockiert

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
# production/codex-word-sync-task.md akustisch vollständig bearbeiten
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
  "textColor": "#F5F7FA",
  "highlightCurrentWord": true,
  "highlightColor": "#B7794A",
  "speakerSyncedWordHighlight": true,
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
