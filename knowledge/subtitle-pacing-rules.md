# Untertitel- und Sprechtempo-Regeln

## Position

- Zentrale Quelle ist `src/shared/subtitle-style.js`.
- Position `center`
- exakt 50 % Bildhöhe
- erlaubter Bereich exakt 50–50 %
- abweichende Werte werden auf 50 % zurückgesetzt oder im strengen Lauf blockiert
- normalerweise 3–6 Wörter und höchstens zwei Zeilen
- Untertitel sind ein Overlay; Hauptmotive dürfen natürlich hinter ihnen liegen
- keine künstlich leere horizontale Zone im Bild erzeugen

## Farben und Lesbarkeit

- weiches Weiß `#F5F7FA`
- keine gelbe Wortmarkierung
- keine schwarze Hintergrundbox oder Balken
- dunkle Kontur und dezenter Schatten
- alle Wörter eines Cues gleichfarbig

## Synchronisierung

- kurze Sinnabschnitte an die echte Audiospur anpassen
- Cue-Start und Cue-Ende müssen zum gesprochenen Abschnitt passen
- keine Wort-für-Wort-Karaoke-Animation
- Einzelwortzeiten sind ohne Highlight nicht erforderlich

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
```

## Beispiel

```json
{
  "text": "Wirtschaft für die Gesellschaft",
  "startSeconds": 4.18,
  "endSeconds": 5.72,
  "position": "center",
  "verticalPositionPercent": 50,
  "safeVerticalRangePercent": { "min": 50, "max": 50 },
  "textColor": "#F5F7FA",
  "highlightCurrentWord": false,
  "highlightColor": "#F5F7FA",
  "backgroundColor": "transparent",
  "timingStatus": "cue-synced"
}
```
