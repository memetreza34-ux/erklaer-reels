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

Für neue Videos ist die sichtbare Struktur bewusst minimal:

```text
00-bildprompts/google-flow-prompt.txt
00-bildprompts/images/Bild NN.png
01-voice-script/voice-script.txt
02-audio/voiceover-final.*
03-export/
99-technik/
```

### Harte Strukturregel

Neue Projekte bekommen **keine sichtbaren**:
- `01_part-bilder-...txt`
- `02_part-bilder-...wav`
- `01_bilder-01-bis-10/`
- `02_bilder-11-bis-20/`
- sonstigen Paketdateien für den Nutzer

Wenn technische Segmentierung nötig ist, wird sie aus Mapping und Sprachankern intern abgeleitet und unter `99-technik/` behandelt.

## Phase 1 — ChatGPT

Erstellt:
- Thema + Duplicate-Check
- Recherche + Quellen
- finalen Titel
- **einen** Google-Flow-Masterprompt inklusive Bild 00 und aller Szenenbilder
- **ein** vollständiges Voice-over-Skript
- exakte `startAnchor`/`endAnchor`-Zuordnung pro Bild intern
- A–E-Komplexitätsklasse pro Bild
- geplante Bilddauer passend zur Komplexität
- Edit-/Motion-/SFX-Plan
- Upload-Metadaten

Kanonische technische Zuordnung:

```text
99-technik/BILD_AUDIO_ZUORDNUNG.json
```

### Phase-1-Pacing ist inhaltsgetrieben

Die Bildanzahl wird niemals vorab festgesetzt. Für jeden Bildmoment gilt:

```text
A = sehr einfach → 4–5 s
B = einfach      → 5–7 s
C = mittel       → 7–9 s
D = komplex      → 9–12 s
E = sehr komplex → 12–15 s
```

Wenn ein einfacher visueller Moment länger gesprochen würde, wird ein zusätzlicher sinnvoller Bildmoment eingeplant. Komplexe Bilder dürfen länger stehen, wenn ihre Inhalte echte Betrachtungszeit brauchen.

Jeder Mapping-Eintrag neuer V2-Projekte enthält:
- `complexityLevel`
- `complexityReason`
- `plannedHoldSeconds`

Die exakte finale Dauer bestimmt Phase 3 aus dem echten Audio.

## Phase 2 — Nutzer + Google Flow

Der Nutzer arbeitet mit **einer einzigen Datei**:

```text
00-bildprompts/google-flow-prompt.txt
```

Der Prompt enthält selbst die 5er-Steuerung:

```text
Bild 00 separat
01–05 gleichzeitig → warten → prüfen → korrigieren → ablegen
06–10 gleichzeitig → warten → prüfen → korrigieren → ablegen
11–15 ...
```

Harte Regeln:
- höchstens 5 aktive Bildgenerierungen gleichzeitig
- nie zwei 5er-Wellen gleichzeitig offen halten
- nächste Welle erst nach abgeschlossenem Check
- letzter Block darf 1–5 Bilder enthalten
- Bild 00 bleibt separat
- Bilder werden flach unter `00-bildprompts/images/` gespeichert
- keine 10er-Unterordner als sichtbare Arbeitsstruktur

### Voice-over

Der Nutzer erzeugt aus:

```text
01-voice-script/voice-script.txt
```

**eine einzige finale Voice-over-Datei** und legt sie unter `02-audio/` ab.

Neue Projekte sollen nicht mehrere Audio-Parts verlangen. Legacy-Projekte mit Parts bleiben technisch lesbar.

## Phase 3 — gemessene statt geschätzte Synchronisation

Das finale Audio ist die einzige Timing-Masterquelle.

Verbindlicher Normalstart:

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Technische Reihenfolge:
1. Assets und Mapping laden
2. genau eine finale Audiodatei unter `02-audio/` bevorzugen
3. Audio mit Whisper + Wortzeitstempeln messen
4. Messung per SHA-256 an die aktuelle Audiodatei binden
5. jeden `startAnchor` monoton im vollständigen gesprochenen Wortstrom finden
6. echte `actualStartSeconds`, `actualEndSeconds`, `alignmentConfidence` schreiben
7. interne Master-Audiospur für den Render erzeugen
8. `FINAL_TIMELINE.json` automatisch aus den Messzeiten bauen
9. V2-Pacing prüfen
10. Pre-Render-Hard-Gate bestehen
11. mit eigenem 16:9-YouTube-Renderer rendern
12. Post-Render-Hard-Gate bestehen

Falls ein altes Projekt mehrere Audio-Parts besitzt und keine einzelne finale Datei vorhanden ist, darf die Legacy-Mehrpart-Logik weiterhin verwendet werden.

### Verboten

- `Videolänge ÷ Bildanzahl`
- gleichmäßige 8/10/12-Sekunden-Holds
- Anchor-Zeiten per Gefühl eintragen
- `alignmentConfidence` erfinden
- sichtbare Paketdateien nur aus technischen Gründen erzeugen
- Rendern ohne `YOUTUBE_WORD_TIMINGS.json`
- Rendern, wenn Audio-Fingerprint und Messung nicht mehr zusammenpassen
- Rendern ohne `FINAL_TIMELINE.json`

## Messbeleg

Phase 3 erzeugt:

```text
99-technik/YOUTUBE_WORD_TIMINGS.json
99-technik/YOUTUBE_AUDIO_MASTER.wav
```

Der Hard-Gate prüft:
- Audio-Fingerprint gegen gemessene Datei
- `startAnchor` gegen gespeicherten Wortstrom
- `matchedWordIndex` gegen den Anchor
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
- A–E-Komplexität steuert Phase-1-Anchor-Dichte
- ein Masterprompt + ein Gesamtskript + eine finale Stimme sind Standard
- technische Segmentierung bleibt intern
- V2-Pacing-Gate läuft im normalen Phase-3-Ablauf
- kein Bildhold >=20,0 s

## Definition of Done

Ein YouTube-Video ist nur fertig, wenn:
- Bilder vollständig sind
- finales Audio vorhanden ist
- alle Anchors wirklich gemessen wurden
- Audio-Fingerprints gültig sind
- `FINAL_TIMELINE.json` existiert
- Adaptive Pacing bestanden ist
- Pre-Render-Hard-Gate Exit 0 liefert
- `03-export/FERTIGES-VIDEO.mp4` existiert
- Post-Render-Hard-Gate Exit 0 liefert
