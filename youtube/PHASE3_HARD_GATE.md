# YouTube Phase 3 — NICHT UMGANGBARES RENDER-HARD-GATE

Diese Datei verhindert starre Slideshows, geschätzte Bildwechsel, alte Audio-Messungen, falsche Cover-Zuordnungen und unvollständige Uploadpakete.

## Grundsatz

**Das finale Voice-over ist die einzige Timing-Masterspur.**

Für neue Projekte mit Cover Policy V1 gilt zusätzlich:
- **Bild 01 ist Cover + erste Videoszene.**
- Bild 01 beginnt bei 0,0 s.
- `THUMBNAIL.png` muss direkt aus `Bild 01.png` stammen.
- kein separates Bild 00.

Verboten sind insbesondere `Videolänge ÷ Bildanzahl`, pauschal gleiche Bilddauern, geschätzte Anchor-Zeiten, erfundene Alignment-Konfidenz und Rendern mit altem Audio-Messbeleg.

## Vor jedem Render zwingend

1. Phase-1-/Cover-Policy prüfen
2. finale Voice-over-Datei bestimmen
3. Audio intern optimieren
4. Whisper-Wortzeitstempel auf der optimierten Fassung messen
5. SHA-256-Fingerprint speichern
6. für jedes Bild den echten `startAnchor` finden
7. `actualStartSeconds`, `actualEndSeconds`, `alignmentConfidence` schreiben
8. `FINAL_TIMELINE.json` erzeugen; Bild 01 muss bei 0,0 s beginnen
9. A–E-Pacing prüfen
10. Pre-Render-Gate ausführen

```bash
npm run validate:youtube-phase3 -- --dir "youtube/<woche>/<thema>"
```

Nur Exit-Code 0 erlaubt den Render.

## Blocker

Der Gate blockiert unter anderem:
- fehlendes Mapping
- fehlende oder falsch nummerierte Bilder
- bei neuen Projekten: Cover/Thumbnail-Quelle ungleich Bild 01
- bei neuen Projekten: separate Bild-00-Regel
- Timeline beginnt nicht mit Bild 01 bei 0,0 s
- fehlende reale Start-/Endzeiten
- Konfidenz <0,95
- ungültige Audio-Fingerprints
- fehlende/geänderte Master-Audiodatei
- Lücken/Überlappungen
- fehlende `FINAL_TIMELINE.json`
- verdächtig gleichmäßige Slideshow-Holds
- A–E-Bilddauer über dem klassenabhängigen Hard-Max
- globalen Hold >=20,0 s
- falsches Ende relativ zum Master-Audio

Alte Legacy-Projekte vor Cover Policy V1 bleiben rückwärtskompatibel; die neue Regel gilt verbindlich für neue Projekte und das aktuelle Zeitzonen-Testvideo.

## A–E reale Hard-Max-Werte

```text
A: 6,5 s
B: 8,5 s
C: 10,5 s
D: 13,5 s
E: 16,0 s
```

Der zusätzliche 0,6-s-Schluss-Hold des letzten Bilds zählt nicht als gesprochene Bilddauer.

## Motion + SFX

Der Render verwendet A–E-abhängige Motion aus `complexity-v1`, optionale Overrides aus `99-technik/YOUTUBE_RENDER_PLAN.json`, nur bekannte SFX-Typen und standardmäßig keine Hintergrundmusik.

## FINAL_TIMELINE.json

Regeln:
- **Bild 01 beginnt bei 0:00 und ist das Cover.**
- spätere Bilder beginnen standardmäßig ca. 0,08 s vor ihrem gemessenen Anchor
- jedes Bild endet am Start des nächsten
- bei neuen Projekten existiert kein Bild 00
- letztes Bild endet ca. 0,60 s nach dem internen Master-Audio

## Nach dem Render

Phase 3 finalisiert zuerst den Uploadsatz und prüft danach:

```bash
npm run validate:youtube-render -- --dir "youtube/<woche>/<thema>"
```

Pflichtdateien:

```text
03-export/FERTIGES-VIDEO.mp4
03-export/THUMBNAIL.png
03-export/YOUTUBE-TITEL.txt
03-export/YOUTUBE-BESCHREIBUNG.txt
03-export/YOUTUBE-KAPITEL.txt
03-export/YOUTUBE-TAGS.txt
```

Bei Cover Policy V1 prüft der Post-Gate zusätzlich per SHA-256, dass `THUMBNAIL.png` **byte-identisch zu `00-bildprompts/images/Bild 01.png`** ist.

## Definition of Done

Phase 3 ist erst fertig, wenn beide Gates Exit-Code 0 liefern, der vollständige Uploadsatz vorhanden ist und für neue Projekte Bild 01 gleichzeitig Cover, erste Timeline-Szene und Thumbnail-Quelle ist.
