# Codex-Wort-Synchronisierung

`sync:words` ist für jedes Reel mit Untertiteln ein verbindlicher Produktionsschritt. Die sichtbare Wort-für-Wort-Markierung bleibt deaktiviert, echte Wortzeiten werden aber technisch benötigt, damit jeder Cue exakt mit der Stimme beginnt und endet.

Der aktuelle Standardstil verwendet:

- warmen hellen Sandton `#E7C39A`
- keine andersfarbige Wortmarkierung
- keine Karaoke-Animation
- keine schwarze Hintergrundbox
- Position bei 58 % Bildhöhe, leicht unterhalb der Mitte

## Verbindlicher Workflow

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
npm run sync:words -- --dir "PFAD-ZUM-REEL"
```

Danach hört Codex das lokale Voice-over vollständig ab und füllt `subtitles/codex-word-sync.json` mit echten absoluten Start- und Endzeiten für jedes Wort. Anschließend:

```bash
npm run sync:words -- \
  --dir "PFAD-ZUM-REEL" \
  --apply \
  --strict
```

Der Render-Plan muss pro Cue enthalten:

```json
{
  "position": "center",
  "verticalPositionPercent": 58,
  "textColor": "#E7C39A",
  "highlightCurrentWord": false,
  "highlightColor": "#E7C39A",
  "backgroundColor": "transparent",
  "timingStatus": "codex-word-synced",
  "timingSource": "codex-local-audio-review",
  "wordTimings": [
    {
      "text": "Beispiel",
      "startSeconds": 1.24,
      "endSeconds": 1.58
    }
  ]
}
```

## Verbindliche Regeln

- keine gleichmäßige, geschätzte oder erfundene Zeitverteilung
- echte akustische Kontrolle des vollständigen Voice-overs
- Start und Ende auf ungefähr 0,01–0,03 Sekunden genau eintragen
- `reviewed: true` erst nach dem Anhören setzen
- im strengen Lauf mindestens 0,85 Konfidenz
- Wortlaut und Reihenfolge unverändert lassen
- Pausen nicht künstlich als Wortdauer verlängern
- das letzte Wort darf nicht nach der Audiodauer enden
- ohne bestandenen Wort-Sync keine finale Renderfreigabe

## Datenschutz

- kein Gemini-Aufruf
- kein externer Transkriptionsdienst
- kein zusätzlicher API-Schlüssel
- Voice-over bleibt lokal

## Designgrenze

`highlightCurrentWord` bleibt `false`. Die Wortzeiten dienen ausschließlich der genauen Cue-Synchronisierung und erzeugen keine sichtbare Karaoke-Animation.
