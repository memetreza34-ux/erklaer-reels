# Untertitel- und Sprechtempo-Regeln

## Position

- Zentrale Quelle ist `src/shared/subtitle-style.js`.
- Die Position ist `center`.
- Die vertikale Position beträgt exakt 50 % der Bildhöhe.
- Der erlaubte Bereich ist ebenfalls exakt 50–50 %.
- Abweichende Positionswerte werden auf 50 % zurückgesetzt oder im strengen Lauf blockiert.
- Höchstens zwei Zeilen und normalerweise 3–6 Wörter verwenden.
- Bei einer Kollision wird nicht die Untertitelposition verschoben. Stattdessen muss die Bildkomposition so angepasst werden, dass Gesichter, Bildtexte und zentrale Erklärmotive die feste mittige Untertitelzone freihalten.

## Farben und Lesbarkeit

- Normaler Untertiteltext verwendet weiches Weiß `#F5F7FA`.
- Reines Weiß wird vermieden, weil es auf hellen Bildern stärker blendet und weniger ruhig wirkt.
- Das aktuell gesprochene Wort wird warmgelb `#FFD84D` markiert.
- Beide Farben liegen auf einer dunklen halbtransparenten Box mit ungefähr 72 % Deckkraft.
- Die Box erhält einen sehr dezenten hellen Rand und einen kräftigen Schatten.
- Diese Palette bleibt auf warmen, kalten, hellen und dunklen Bildwelten gut lesbar.

## Synchronisierte Wortmarkierung

- Der vollständige Untertitel bleibt in weichem Weiß sichtbar.
- Nur das gerade gesprochene Wort wird warmgelb markiert.
- Die Markierung darf ausschließlich akustisch bestätigten Wortzeiten folgen.
- Gleichmäßige oder gewichtete Schätzungen sind verboten.
- Ohne exakte Wortzeiten bleibt der gesamte Cue in weichem Weiß.
- Der finale Renderer-Check blockiert fehlende, überlappende oder unvollständige Wortzeiten.

## Voice-over zuerst straffen

Vor Timeline und Wortzeiten:

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL"
```

Standardwerte:

- Pausen ab ungefähr 0,24 Sekunden werden gekürzt.
- Der Filter behält nur eine sehr kurze Restpause von 0,05 Sekunden; durch Wortausklänge kann die hörbare Pause etwas länger sein.
- Das Voice-over läuft mit `1.05x` leicht schneller.
- Die Tonhöhe bleibt erhalten.
- Eine stärkere Beschleunigung als 1.10x ist nicht erlaubt.

Die Untertitel- und Wortzeiten werden ausschließlich auf Basis der optimierten Audiodatei erstellt.

## Lokale Wortzeiten durch Codex

Nach bestandener Szenen-Audio-Synchronisierung zuerst vorbereiten:

```bash
npm run sync:words -- --dir "PFAD-ZUM-REEL"
```

Dadurch entstehen `subtitles/codex-word-sync.json` und `production/codex-word-sync-task.md`.

Codex hört anschließend das lokale optimierte Voice-over vollständig ab und füllt pro Wort:

- absolute `startSeconds`
- absolute `endSeconds`
- realistische `confidence`
- `reviewed: true` erst nach akustischer Kontrolle

Danach:

```bash
npm run sync:words -- \
  --dir "PFAD-ZUM-REEL" \
  --apply \
  --strict
```

Pflichtwerte:

- mindestens 98 % Wortabdeckung
- im strengen Lauf mindestens 0,85 Konfidenz pro Wort
- keine Szene ohne bestätigte Wörter
- Cue-Text stimmt vollständig mit der Wortliste überein
- chronologische Start- und Endzeiten
- `review/word-sync-report.json` enthält `passed: true`
- kein externer Audio-Upload

Beispiel:

```json
{
  "text": "Der Tisch bekommt neuen Wert",
  "startSeconds": 4.18,
  "endSeconds": 6.12,
  "position": "center",
  "verticalPositionPercent": 50,
  "safeVerticalRangePercent": { "min": 50, "max": 50 },
  "textColor": "#F5F7FA",
  "backgroundColor": "rgba(0, 0, 0, 0.72)",
  "highlightCurrentWord": true,
  "highlightColor": "#FFD84D",
  "timingStatus": "codex-word-synced",
  "timingSource": "codex-local-audio-review",
  "wordTimings": [
    { "text": "Der", "startSeconds": 4.2, "endSeconds": 4.45, "confidence": 0.97 },
    { "text": "Tisch", "startSeconds": 4.45, "endSeconds": 4.9, "confidence": 0.98 },
    { "text": "bekommt", "startSeconds": 4.96, "endSeconds": 5.32, "confidence": 0.96 },
    { "text": "neuen", "startSeconds": 5.39, "endSeconds": 5.67, "confidence": 0.95 },
    { "text": "Wert", "startSeconds": 5.72, "endSeconds": 6.02, "confidence": 0.98 }
  ]
}
```

## Reihenfolge nach einer Audioänderung

Nach einer neuen Voice-over-Datei oder einer erneuten Pacing-Optimierung müssen alle Zeitdaten neu entstehen:

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL"
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
npm run sync:words -- --dir "PFAD-ZUM-REEL"
# Codex hört das optimierte Audio ab und füllt die Arbeitsdatei
npm run sync:words -- --dir "PFAD-ZUM-REEL" --apply --strict
```
