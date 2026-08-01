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
- Die Markierung darf ausschließlich akustisch bestätigten Wortzeiten folgen.
- Gleichmäßige oder gewichtete Schätzungen sind verboten.
- Ohne exakte Wortzeiten bleibt der gesamte Cue weiß.
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
  "position": "safe-lower-middle",
  "verticalPositionPercent": 79.5,
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
