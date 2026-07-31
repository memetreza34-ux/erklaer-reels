# Reel mit einem Befehl abschließen

`finalize:reel` führt die vorhandenen Prüfungen in der richtigen Reihenfolge zusammen und erzeugt einen zentralen Bereitschaftsbericht.

## Diagnosemodus

```bash
npm run finalize:reel -- --dir "PFAD-ZUM-REEL"
```

Der Diagnosemodus:

1. führt die strenge Inhaltsprüfung aus,
2. baut oder aktualisiert die Master-Timeline,
3. führt die technische visuelle Prüfung aus,
4. berechnet den vollständigen Reel-Fortschritt,
5. schreibt `review/final-readiness-report.json`,
6. nennt den nächsten notwendigen Schritt.

Fehlende externe Dateien werden im Diagnosemodus dokumentiert, ohne den Befehl unnötig abzubrechen.

## Strenge Abschlussprüfung

```bash
npm run finalize:reel -- \
  --dir "PFAD-ZUM-REEL" \
  --strict
```

Wenn `ffprobe` nicht verfügbar ist:

```bash
npm run finalize:reel -- \
  --dir "PFAD-ZUM-REEL" \
  --audio-duration 48.7 \
  --strict
```

Der strenge Modus ist nur erfolgreich, wenn:

- die Inhaltsprüfung bestanden ist,
- die Voice-over-Dauer bekannt ist,
- alle Audio-Cues verifiziert sind,
- der Render-Plan `ready-for-renderer` meldet,
- Timeline und Untertitel keine strukturellen Fehler besitzen,
- alle Szenenbilder und das Cover vorhanden sind,
- die technische Bildprüfung bestanden ist,
- `review/visual-inspection.json` vollständig ausgefüllt ist,
- die visuelle Abnahme im strengen Modus bestanden ist,
- der Gesamtfortschritt 100 % erreicht.

## Bericht

`review/final-readiness-report.json` enthält:

- Ergebnis jeder Produktionsstufe,
- Timing- und Render-Status,
- visuelle Abnahme,
- Gesamtfortschritt,
- blockierende Fehler,
- nächsten konkreten Schritt,
- `readyForRenderer` als eindeutige Abschlussentscheidung.

Das Kommando rendert noch keine MP4-Datei. Es stellt sicher, dass der Produktionsordner technisch eindeutig für einen späteren Renderer vorbereitet ist.
