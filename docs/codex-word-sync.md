# Codex-Wort-Synchronisierung

`sync:words` ist für jedes Reel mit Untertiteln ein verbindlicher Produktionsschritt. **`CURRENT_WORKFLOW.md` ist bei Widersprüchen maßgeblich.**

Der aktuelle Standardstil verwendet:

- Grundtext `#F5F7FA`
- aktuell gesprochenes Wort `#B7794A`
- Farbwechsel exakt nach echten akustischen Wortzeiten
- keine Bounce-/Zoom-/Größenanimation
- keine schwarze Hintergrundbox
- Position bei exakt 58 % Bildhöhe
- 100 % des gesprochenen Voice-Scripts als Untertitel

## Verbindlicher Workflow

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
npm run sync:words -- --dir "PFAD-ZUM-REEL"
```

Danach wird das lokale Voice-over vollständig abgehört und `subtitles/codex-word-sync.json` mit echten absoluten Start- und Endzeiten **für jedes Wort** gefüllt. Anschließend:

```bash
npm run sync:words -- \
  --dir "PFAD-ZUM-REEL" \
  --apply \
  --strict
```

Vor Freigabe müssen gelten:

```text
coverage === 1
timedWords === totalWords
unassignedWords === 0
```

Zusätzlich muss die vollständige gerenderte Untertitel-Wortfolge exakt `script/voice-script.txt` entsprechen. Fehlt ein Wort, ist die Renderfreigabe verboten.

Der Render-Plan muss pro Cue enthalten:

```json
{
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
- bei einer Pause darf kein nächstes Wort vorzeitig braun werden
- das letzte Wort darf nicht nach der Audiodauer enden
- `unassignedWords` muss 0 sein
- ohne vollständigen Wort-Sync keine finale Renderfreigabe

## Datenschutz

- kein externer Transkriptionsdienst
- kein zusätzlicher API-Schlüssel
- Voice-over bleibt lokal

## Designgrenze

Die Markierung ist ausschließlich ein **Farbwechsel des aktuell gesprochenen Wortes** von `#F5F7FA` auf `#B7794A`. Es gibt keine Spring-, Zoom-, Skalierungs- oder Box-Animation.
