# YOUTUBE WORKFLOW — VERBINDLICHE REGEL FÜR LANGVIDEOS

**Stand: 2026-09-22**

Diese Datei gilt ausschließlich für YouTube-Langvideos. Reel-Regeln und Reel-Code werden dadurch nicht verändert.

## Priorität

1. aktuelle ausdrückliche Nutzeranweisung
2. `youtube/YOUTUBE_WORKFLOW.md`
3. `youtube/PHASE3_HARD_GATE.md`
4. `youtube/YOUTUBE_VISUAL_WORLD.md`
5. `youtube/ADAPTIVE_PACING_V2.md` für V2
6. `THEMEN_HISTORIE.md`

## Ordnerlogik

```text
youtube/YYYY-KWNN_DD-MM_bis_DD-MM/themen-slug/
```

## Phase 1 — ChatGPT

Erstellt:
- Thema + Duplicate-Check
- Recherche + Quellen
- finalen Titel
- Bild 00 / Thumbnail-Prompt
- Voice-over-Script
- Bildprompts
- exakte `startAnchor`/`endAnchor`-Zuordnung pro Bild
- Edit-/Motion-/SFX-Plan
- Upload-Metadaten

Kanonische Zuordnung:

```text
99-technik/BILD_AUDIO_ZUORDNUNG.json
```

## Phase 2 — Nutzer + Google Flow

### Neue 5er-Parallelregel

Google Flow arbeitet ab sofort in **kontrollierten 5er-Wellen**.

```text
Bild 01–05 gleichzeitig
→ warten bis alle fünf fertig sind
→ alle fünf prüfen
→ Fehler innerhalb derselben Welle korrigieren
→ umbenennen + ablegen + Vollständigkeit prüfen
→ erst dann Bild 06–10 gleichzeitig
→ danach nächsten 10er-Ordner
```

Harte Regeln:
- höchstens 5 aktive Bildgenerierungen gleichzeitig
- nicht weniger streng werden, wenn der Auftrag „alle Bilder erstellen“ lautet
- nie 10, 20 oder das ganze Set gleichzeitig starten
- nächste 5er-Welle erst nach abgeschlossenem Check der vorherigen
- fehlerhafte Bilder blockieren den Übergang zur nächsten Welle
- 10er-Ordner bleiben Dateistruktur; jeder volle 10er-Ordner besteht aus zwei 5er-Wellen
- letzter Block darf 1–5 Bilder enthalten
- Bild 00 bleibt separat

## Phase 3 — gemessene statt geschätzte Synchronisation

Das finale Audio ist die einzige Timing-Masterquelle.

Verbindlicher Normalstart:

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Technische Reihenfolge:
1. Assets und Mapping laden
2. V1: finale Audiodatei bestimmen; V2: alle Audio-Parts chronologisch bestimmen
3. jede Audiodatei mit Whisper + Wortzeitstempeln messen
4. Messung per SHA-256 an die aktuelle Audiodatei binden
5. jeden `startAnchor` monoton im tatsächlich gesprochenen Wortstrom finden
6. echte `actualStartSeconds`, `actualEndSeconds`, `alignmentConfidence` schreiben
7. interne Master-Audiospur für den Render erzeugen
8. `FINAL_TIMELINE.json` automatisch aus den Messzeiten bauen
9. V2-Pacing prüfen
10. Pre-Render-Hard-Gate bestehen
11. mit eigenem 16:9-YouTube-Renderer rendern
12. Post-Render-Hard-Gate bestehen

### Verboten

- `Videolänge ÷ Bildanzahl`
- gleichmäßige 8/10/12-Sekunden-Holds
- Anchor-Zeiten per Gefühl eintragen
- `alignmentConfidence` erfinden
- Rendern ohne `YOUTUBE_WORD_TIMINGS.json`
- Rendern, wenn Audio-Fingerprint und Messung nicht mehr zusammenpassen
- Rendern ohne `FINAL_TIMELINE.json`

## Messbeleg

Phase 3 erzeugt:

```text
99-technik/YOUTUBE_WORD_TIMINGS.json
99-technik/YOUTUBE_AUDIO_MASTER.wav
```

Der Hard-Gate prüft anschließend nicht nur JSON gegen JSON, sondern:
- Audio-Fingerprint gegen gemessene Datei
- `startAnchor` gegen gespeicherten Wortstrom
- gespeicherten `matchedWordIndex` gegen den Anchor
- `actualStartSeconds` gegen den echten Wortzeitpunkt
- monotone Reihenfolge der Anchor-Treffer

## FINAL_TIMELINE

```text
99-technik/FINAL_TIMELINE.json
```

Regeln:
- Bild 01 beginnt bei 0:00
- spätere Bilder beginnen standardmäßig ca. 0,08 s vor ihrem gemessenen Anchor
- Bild endet am Start des nächsten Bildes
- letztes Bild endet ca. 0,60 s nach Audioende
- Bild 00 kommt nie hinein

## V2

Bei `productionRulesVersion >= 2`:
- Bildzahl entsteht aus Inhalt
- Script-/Audio-Parts bleiben an Bildpakete gekoppelt
- V2-Pacing-Gate wird im normalen Phase-3-Ablauf ausgeführt
- kein Bildhold >=20,0 s

## Definition of Done

Ein YouTube-Video ist nur fertig, wenn:
- Bilder vollständig sind
- finales Audio vorhanden ist
- alle Anchors wirklich gemessen wurden
- Audio-Fingerprints gültig sind
- `FINAL_TIMELINE.json` existiert
- Adaptive Pacing bei V2 bestanden ist
- Pre-Render-Hard-Gate Exit 0 liefert
- `03-export/FERTIGES-VIDEO.mp4` existiert
- Post-Render-Hard-Gate Exit 0 liefert
