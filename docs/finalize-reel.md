# Reel mit einem Befehl abschließen

`finalize:reel` führt die vorhandenen Prüfungen in der richtigen Reihenfolge zusammen und erzeugt einen zentralen Bereitschaftsbericht.

> Bei Widersprüchen gilt `CURRENT_WORKFLOW.md`.

## Diagnosemodus

```bash
npm run finalize:reel -- --dir "PFAD-ZUM-REEL"
```

Der Diagnosemodus:

1. führt die strenge Inhalts-/Quellenprüfung aus,
2. prüft das reale Audio-Pacing und dessen Dateibindung,
3. baut oder aktualisiert die Master-Timeline,
4. führt die technische und semantische visuelle Prüfung aus,
5. berechnet den vollständigen Reel-Fortschritt,
6. schreibt `review/final-readiness-report.json`,
7. nennt den nächsten notwendigen Schritt.

Fehlende externe Dateien werden im Diagnosemodus dokumentiert, ohne ihre Existenz oder Prüfung zu erfinden.

## Strenge Abschlussprüfung

```bash
npm run finalize:reel -- \
  --dir "PFAD-ZUM-REEL" \
  --strict
```

Wenn `ffprobe` nicht verfügbar ist, darf nur eine **tatsächlich ermittelte** Audiodauer ausdrücklich übergeben werden:

```bash
npm run finalize:reel -- \
  --dir "PFAD-ZUM-REEL" \
  --audio-duration 57.0 \
  --strict
```

Der strenge Modus ist nur erfolgreich, wenn:

- die Inhalts- und verpflichtende Quellenprüfung bestanden ist,
- die Voice-over-Dauer bekannt ist,
- echte Audio-Pacing-/Lautheitsmessungen zum final verwendeten Audio passen,
- alle erforderlichen narrativen Audio-Cues verifiziert sind,
- alle geplanten Bildphasen und das Cover vorhanden sind,
- jede Bildphase die technische und visuelle Zwei-Pass-QC bestanden hat,
- interne Bildphasen korrekt innerhalb ihrer narrativen Szenen liegen,
- der Render-Plan keine Lücken/Überlappungen oder unzulässigen Übergänge enthält,
- Untertitel deaktiviert und die Render-Untertitelspur leer ist,
- `readyForRenderer` wirklich aus den bestandenen Gates resultiert.

**Word-Sync ist keine Voraussetzung.**

## Was niemals zulässig ist

- Messwerte erfinden
- Szenezeiten gleichmäßig verteilen und als verifiziert markieren
- fehlende Assets durch Dateinamen als geprüft behandeln
- `passed: true` oder `readyForRenderer: true` künstlich erzwingen
- Legacy-Subtitle-/Word-Sync-Daten als Voraussetzung für neue Reels verwenden

Der frühere unsichere `force-render-state.js`-Helfer wurde entfernt.

## Bericht

`review/final-readiness-report.json` enthält unter anderem:

- Ergebnis jeder Produktionsstufe
- Quellenstatus
- Audio-/Pacing-Bindung
- Timing- und Render-Status
- visuelle Abnahme aller Bildphasen
- blockierende Fehler
- nächsten konkreten Schritt
- `readyForRenderer` als eindeutige Abschlussentscheidung

Das Kommando rendert noch keine MP4-Datei. Es stellt sicher, dass der Produktionsordner **tatsächlich** für den Renderer vorbereitet ist.
