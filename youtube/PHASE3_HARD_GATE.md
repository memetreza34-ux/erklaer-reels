# YouTube Phase 3 — NICHT UMGANGBARES RENDER-HARD-GATE

Diese Datei verhindert starre Slideshows, geschätzte Bildwechsel, alte Audio-Messungen und unvollständige Uploadpakete.

## Grundsatz

**Das finale Voice-over ist die einzige Timing-Masterspur.**

Verboten sind insbesondere:
- `Videolänge ÷ Bildanzahl`
- pauschal gleiche Bilddauern
- per Gefühl eingetragene Anchor-Zeiten
- erfundene Alignment-Konfidenz
- Rendern nach Audioänderung mit altem Messbeleg

## Vor jedem Render zwingend

1. finale Voice-over-Datei bestimmen
2. Whisper-Wortzeitstempel messen
3. SHA-256-Fingerprint der gemessenen Audiodatei speichern
4. überlange Endstille anhand des letzten gesprochenen Worts erkennen
5. nur das interne `YOUTUBE_AUDIO_MASTER.wav` kürzen; Nutzeroriginal unverändert lassen
6. für jedes Bild den echten `startAnchor` finden
7. `actualStartSeconds`, `actualEndSeconds`, `alignmentConfidence` schreiben
8. `FINAL_TIMELINE.json` erzeugen
9. A–E-Pacing gegen die echte Timeline prüfen
10. Pre-Render-Gate ausführen

```bash
npm run validate:youtube-phase3 -- --dir "youtube/<woche>/<thema>"
```

Nur Exit-Code 0 erlaubt den Render.

## Blocker

Der Gate blockiert unter anderem:
- fehlendes Mapping
- fehlende oder falsch nummerierte Bilder
- Bild 00 in der Videotimeline
- fehlende reale Start-/Endzeiten
- Konfidenz <0,95
- ungültige Audio-Fingerprints
- fehlende oder geänderte Master-Audiodatei
- Lücken/Überlappungen
- fehlende `FINAL_TIMELINE.json`
- verdächtig gleichmäßige Slideshow-Holds
- A–E-Bilddauer über dem klassenabhängigen Hard-Max
- globalen Hold >=20,0 s
- falsches Ende relativ zum gekürzten Master-Audio

## A–E reale Hard-Max-Werte

Standard:

```text
A: 6,5 s
B: 8,5 s
C: 10,5 s
D: 13,5 s
E: 16,0 s
```

Wenn ein Bild länger wäre, muss die Phase-1-Struktur sinnvoll gesplittet werden. Der zusätzliche 0,6-s-Schluss-Hold des allerletzten Bilds wird bei dieser Inhaltsprüfung nicht als gesprochene Bilddauer gezählt.

## Motion + SFX

Der eigentliche Render verwendet:
- A–E-abhängige Motion aus `complexity-v1`
- optionale Overrides aus `99-technik/YOUTUBE_RENDER_PLAN.json`
- nur bekannte SFX-Typen aus `config/sound-library.json`
- keine Hintergrundmusik standardmäßig

Unbekannte Soundtypen oder fehlende Sounddateien brechen den Render ab.

## FINAL_TIMELINE.json

Regeln:
- Bild 01 beginnt bei 0:00
- spätere Bilder beginnen standardmäßig ca. 0,08 s vor ihrem gemessenen Anchor
- jedes Bild endet am Start des nächsten
- Bild 00 kommt nie hinein
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

Der Post-Gate prüft außerdem die MP4-Dauer gegen das interne Master-Audio. Erlaubt ist nur der kurze geplante Schluss-Hold.

## Definition of Done

Phase 3 ist erst fertig, wenn **beide** Gates Exit-Code 0 liefern und der vollständige Uploadsatz vorhanden ist.
