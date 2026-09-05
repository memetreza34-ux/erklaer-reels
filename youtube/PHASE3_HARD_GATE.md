# YouTube Phase 3 — NICHT UMGANGBARES RENDER-HARD-GATE

Diese Datei verhindert genau den Fehler einer starren Bild-Diashow, bei der Bild 01–60 zwar chronologisch liegen, aber nicht zum tatsächlich gesprochenen Voice-over passen.

## Grundsatz

**Das finale Voice-over ist die einzige Timing-Masterspur.**

Antigravity darf niemals aus Videolänge ÷ Bildanzahl eine Bilddauer berechnen und darf keine pauschalen 8-, 10-, 12- oder sonstigen Sekundenblöcke auf alle Bilder anwenden.

## Vor jedem Render zwingend

1. finales Voice-over eindeutig bestimmen
2. `99-technik/BILD_AUDIO_ZUORDNUNG.json` laden
3. für **jedes** Videobild den echten `startAnchor` im finalen Audio finden
4. `actualStartSeconds`, `actualEndSeconds` und `alignmentConfidence` eintragen
5. `alignmentConfidence >= 0.95` für jedes Bild; sonst manuell prüfen
6. aus diesen echten Audio-Zeiten `99-technik/FINAL_TIMELINE.json` erzeugen
7. Bild 01 beginnt bei 0:00, alle späteren Bilder standardmäßig etwa 0,08 s vor ihrem echten Audio-Anker
8. jedes Bild endet am Start des nächsten Bildes
9. letztes Bild bleibt nach Voice-over-Ende nur kurz stehen: Ziel 0,60 s
10. danach zwingend ausführen:

```bash
npm run validate:youtube-phase3 -- --dir "youtube/<woche>/<thema>"
```

**Nur Exit-Code 0 erlaubt einen Render.**

## Was der Hard-Gate blockiert

Der Validator blockiert den Render unter anderem, wenn:

- `BILD_AUDIO_ZUORDNUNG.json` fehlt
- auch nur ein `actualStartSeconds` / `actualEndSeconds` / `alignmentConfidence` fehlt
- Alignment-Konfidenz unter 0,95 liegt
- Bildnummern fehlen, doppelt sind oder falsch sortiert sind
- ein erwartetes `Bild NN.png` fehlt
- `Bild 00` nicht eindeutig aus der Timeline ausgeschlossen ist
- Mapping-Zeiten Lücken oder Überlappungen enthalten
- `FINAL_TIMELINE.json` fehlt
- `FINAL_TIMELINE.json` nicht zu den echten Audio-Ankern passt
- die Timeline verdächtig gleichmäßige Bilddauern hat (Slideshow-Muster)
- letztes Mapping-Ende nicht zum echten Voice-over-Ende passt

## FINAL_TIMELINE.json

Antigravity muss vor dem Render eine Datei dieser Form erzeugen:

```json
{
  "schemaVersion": 1,
  "audioMaster": "02-audio/<finale-datei>",
  "endHoldSeconds": 0.6,
  "images": [
    {
      "imageNumber": 1,
      "startSeconds": 0,
      "endSeconds": 6.42
    },
    {
      "imageNumber": 2,
      "startSeconds": 6.42,
      "endSeconds": 14.18
    }
  ]
}
```

Die Werte sind **Beispielwerte**. Reale Projekte müssen die tatsächlich gemessenen Audio-Anker verwenden.

## Nach jedem Render zwingend

```bash
npm run validate:youtube-render -- --dir "youtube/<woche>/<thema>"
```

Post-Render-QC prüft zusätzlich die echte MP4-Dauer. Das fertige Video darf nicht noch viele Sekunden nach dem Voice-over weiterlaufen. Erlaubt ist nur ein kurzer sauberer Schluss-Hold.

## Nicht erlaubt

- "60 Bilder auf 12 Minuten verteilen"
- jede Bilddauer auf denselben Wert setzen
- Bildwechsel nur anhand der Dateinummern setzen
- `startPercent` oder geschätzte Lesedauer als finale Zeit verwenden
- Anchor-Felder auf `null` lassen und trotzdem rendern
- `FINAL_TIMELINE.json` umgehen
- einen fehlgeschlagenen Validator ignorieren
- einen alten fehlerhaften Render als `FERTIGES-VIDEO.mp4` stehen lassen

## Definition of Done für Phase 3

Phase 3 ist erst fertig, wenn **beide** Befehle tatsächlich Exit-Code 0 liefern:

```bash
npm run validate:youtube-phase3 -- --dir "<projekt>"
npm run validate:youtube-render -- --dir "<projekt>"
```

Nicht ausgeführte oder fehlgeschlagene Gates dürfen niemals als bestanden gemeldet werden.
