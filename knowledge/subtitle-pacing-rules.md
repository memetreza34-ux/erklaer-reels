# Untertitel- und Sprechtempo-Regeln

## Position

- Zentrale Quelle ist `src/shared/subtitle-style.js`.
- Die Position ist `lower`.
- Die vertikale Position beträgt exakt 76 % der Bildhöhe.
- Der erlaubte Bereich ist exakt 76–76 %.
- Abweichende Werte werden auf 76 % zurückgesetzt oder im strengen Lauf blockiert.
- Höchstens zwei Zeilen und normalerweise 3–6 Wörter verwenden.
- Die Bildmitte muss nicht freigehalten werden. Hauptmotive dürfen dort natürlich stehen.
- Nur kleine unverzichtbare Details nicht direkt hinter dem unteren Untertitelbereich platzieren.

## Farben und Lesbarkeit

- Jeder Untertitel verwendet weiches Weiß `#F5F7FA`.
- Es gibt keine gelbe Wortmarkierung.
- Es gibt keine schwarze Hintergrundbox und keinen Balken.
- Lesbarkeit entsteht durch eine dunkle Kontur und einen dezenten Schatten.
- Alle Wörter eines Cues haben dieselbe Farbe.

## Synchronisierung

- Untertitel werden als kurze Sinnabschnitte an die echte Audiospur angepasst.
- Cue-Start und Cue-Ende müssen zum gesprochenen Abschnitt passen.
- Eine Wort-für-Wort-Karaoke-Animation ist deaktiviert.
- Deshalb sind Einzelwortzeiten für den sichtbaren Untertitel nicht erforderlich.
- `sync:words` bleibt als optionales technisches Werkzeug erhalten, ist für diesen Stil aber kein Pflichtschritt.

## Voice-over zuerst straffen

Vor Timeline und Untertitel-Cues:

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL"
```

Standardwerte:

- Pausen ab ungefähr 0,24 Sekunden werden gekürzt.
- Nur eine kurze natürliche Restpause bleibt erhalten.
- Das Voice-over läuft mit ungefähr `1.05x`.
- Die Tonhöhe bleibt erhalten.
- Eine stärkere Beschleunigung als `1.10x` ist nicht erlaubt.

## Reihenfolge nach einer Audioänderung

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL"
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

Danach Untertitel-Cues, Bildwechsel und Audio-Cues gegen die optimierte Audiodatei kontrollieren.

## Beispiel

```json
{
  "text": "Wirtschaft für die Gesellschaft",
  "startSeconds": 4.18,
  "endSeconds": 5.72,
  "position": "lower",
  "verticalPositionPercent": 76,
  "safeVerticalRangePercent": { "min": 76, "max": 76 },
  "textColor": "#F5F7FA",
  "highlightCurrentWord": false,
  "highlightColor": "#F5F7FA",
  "backgroundColor": "transparent",
  "timingStatus": "cue-synced"
}
```
