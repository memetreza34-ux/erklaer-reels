# RENDER-FEHLERANALYSE — aktueller fehlerhafter Render

Status: **UNGÜLTIG / NEU RENDERN**

Der zuletzt geprüfte Render dieses Projekts darf nicht als finales YouTube-Video verwendet werden.

## Beobachteter Fehler

- Das finale Voice-over wurde nicht als echte Timing-Masterspur verwendet.
- Die Bildabschnitte waren nahezu gleich lang (ungefähr 12,47 s), also faktisch eine starre Slideshow.
- Dadurch drifteten die Bilder gegenüber dem gesprochenen Inhalt immer weiter nach hinten.
- Das geprüfte Video lief ungefähr 19,8 s länger als das Voice-over.
- Der geplante Abschluss mit Bild 60 war im geprüften Render nicht zuverlässig vorhanden.

## Technische Ursache

`BILD_AUDIO_ZUORDNUNG.json` enthielt zwar die richtigen geplanten `startAnchor`/`endAnchor`, aber die entscheidenden Felder waren nicht mit echten Audio-Zeiten befüllt:

```text
actualStartSeconds = null
actualEndSeconds   = null
alignmentConfidence = null
```

Trotzdem wurde gerendert. Genau das ist ab jetzt verboten.

## Verbindliche Korrektur

Antigravity muss den Render vollständig neu aufbauen:

1. finales Voice-over als Masterspur laden
2. für Bild 01–60 jeden `startAnchor` im echten Audio finden
3. `actualStartSeconds` eintragen
4. `actualEndSeconds` = echter Beginn des nächsten Bildabschnitts; letztes Ende = Voice-over-Ende
5. `alignmentConfidence` eintragen; unter 0,95 manuell prüfen
6. `FINAL_TIMELINE.json` aus diesen echten Zeiten erzeugen
7. Bild 01 bei 0:00; spätere Bilder standardmäßig ca. 0,08 s vor ihrem echten Anchor einsetzen
8. keine gleichmäßige Verteilung nach Videolänge/Bildanzahl
9. letztes Bild nach Sprecherende nur ca. 0,60 s stehen lassen
10. Pre-Render-Gate ausführen und nur bei Exit-Code 0 rendern
11. danach Post-Render-Gate ausführen

```bash
npm run validate:youtube-phase3 -- --dir "youtube/2026-KW36_31-08_bis_06-09/warum-hat-ein-tag-24-stunden"

# erst nach bestandenem Gate rendern

npm run validate:youtube-render -- --dir "youtube/2026-KW36_31-08_bis_06-09/warum-hat-ein-tag-24-stunden"
```

## Harte Abbruchbedingungen

Render blockieren, wenn auch nur einer dieser Punkte zutrifft:

- irgendein `actualStartSeconds` ist `null`
- irgendein `actualEndSeconds` ist `null`
- irgendein `alignmentConfidence` ist `null` oder < 0,95
- `FINAL_TIMELINE.json` fehlt
- ein Bild 01–60 fehlt
- Bildnummern sind nicht lückenlos
- Bild 00 taucht in der Videotimeline auf
- Timeline-Zeiten passen nicht zu den Audio-Ankern
- die meisten Bilddauern sind nahezu identisch
- Video läuft nach Voice-over deutlich länger als der erlaubte kurze Schluss-Hold

Der alte fehlerhafte Render ist **keine Grundlage für weitere Schnitte**. Neuaufbau erfolgt ausschließlich aus finalem Audio + korrekten Bildern + Mapping.
