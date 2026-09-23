# YOUTUBE WORKFLOW — VERBINDLICHE REGEL FÜR LANGVIDEOS

**Stand: 2026-09-23**

Diese Datei gilt ausschließlich für YouTube-Langvideos. Reel-Regeln und Reel-Code werden dadurch nicht verändert.

## Priorität

1. aktuelle ausdrückliche Nutzeranweisung
2. `youtube/YOUTUBE_WORKFLOW.md`
3. `youtube/PHASE3_HARD_GATE.md`
4. `youtube/YOUTUBE_VISUAL_WORLD.md`
5. `youtube/ADAPTIVE_PACING_V2.md` für V2
6. `THEMEN_HISTORIE.md`

## Sichtbare Struktur neuer Videos

```text
youtube/YYYY-KWNN_DD-MM_bis_DD-MM/themen-slug/
├── 00-bildprompts/
│   ├── google-flow-prompt.txt
│   └── images/Bild NN.png
├── 01-voice-script/
│   └── voice-script.txt
├── 02-audio/
│   └── voiceover-final.*
├── 03-export/
└── 99-technik/
```

Neue Projekte bekommen **keine sichtbaren** Script-Parts, Audio-Parts oder 10er-Bildpakete.

## Phase 1 — ChatGPT

Phase 1 erstellt:
- Thema + Duplicate-Check
- Recherche + Quellen
- finalen Titel
- **einen** Google-Flow-Masterprompt inklusive Bild 00 und aller Szenenbilder
- **ein** vollständiges Voice-over-Skript
- `99-technik/BILD_AUDIO_ZUORDNUNG.json`
- A–E-Komplexität für jedes Bild
- `99-technik/YOUTUBE_RENDER_PLAN.json`
- `99-technik/YOUTUBE_CHAPTERS.json`
- Upload-Metadaten

### Bildplanung

Die Bildanzahl ist niemals vorab fest. Ein Bild hat genau einen klaren visuellen Zweck.

```text
A = sehr einfach → 4–5 s geplant
B = einfach      → 5–7 s
C = mittel       → 7–9 s
D = komplex      → 9–12 s
E = sehr komplex → 12–15 s
```

Wenn ein einfacher visueller Moment mehr Sprache tragen müsste, wird ein zusätzlicher sinnvoller Bildmoment geplant. Komplexität darf nicht künstlich erhöht werden, nur um ein Bild länger stehen zu lassen.

### Interne Mapping-Felder

Jeder Bildmoment enthält mindestens:
- `imageNumber`
- `imageFile`
- `batchFolder: "images"`
- `startAnchor`
- `endAnchor`
- `visualPurpose`
- `complexityLevel`
- `complexityReason`
- `plannedHoldSeconds`

Echte Sekundenwerte entstehen erst aus dem finalen Audio.

## Phase 2 — Nutzer + Google Flow

Der Nutzer benötigt nur:

```text
00-bildprompts/google-flow-prompt.txt
01-voice-script/voice-script.txt
```

### Google Flow

```text
Bild 00 separat
01–05 gleichzeitig → warten → prüfen → korrigieren → ablegen
06–10 erst danach
11–15 ...
```

Harte Regeln:
- höchstens 5 aktive Bildgenerierungen gleichzeitig
- niemals zwei Wellen gleichzeitig offen halten
- letzter Block darf 1–5 Bilder enthalten
- Bild 00 bleibt Thumbnail und kommt nie in die Timeline
- Bilder liegen flach unter `00-bildprompts/images/`

### Voice-over

Aus `voice-script.txt` wird **eine einzige finale Voice-over-Datei** erzeugt und unter `02-audio/` abgelegt.

Das Nutzeroriginal wird von Phase 3 nicht überschrieben.

## Phase 3 — gemessene Produktion

Normalstart:

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Reihenfolge:
1. aktuelle Bilder, Mapping und genau eine finale Stimme bestimmen
2. Voice-over mit Whisper + Wortzeitstempeln messen
3. überlange Endstille anhand des letzten gesprochenen Worts erkennen
4. nur das interne `99-technik/YOUTUBE_AUDIO_MASTER.wav` kürzen; Nutzeroriginal unverändert lassen
5. Messung per SHA-256 an die aktuelle Audiodatei binden
6. jeden `startAnchor` monoton im gesprochenen Wortstrom finden
7. echte `actualStartSeconds`, `actualEndSeconds`, `alignmentConfidence` schreiben
8. `99-technik/FINAL_TIMELINE.json` bauen
9. A–E-Planung gegen die **echte** Timeline prüfen
10. Pre-Render-Hard-Gate bestehen
11. 16:9-YouTube-Renderer mit A–E-Motion + gezielten SFX ausführen
12. Thumbnail + Upload-Dateien finalisieren
13. Post-Render-Hard-Gate bestehen

### Verboten

- `Videolänge ÷ Bildanzahl`
- gleichmäßige pauschale Holds
- Anchor-Zeiten per Gefühl eintragen
- `alignmentConfidence` erfinden
- simples A-/B-Bild deutlich länger halten, statt sinnvoll zu splitten
- Rendern ohne gemessene Wortzeiten
- Rendern nach Änderung des Audios mit altem Messbeleg
- Rendern ohne `FINAL_TIMELINE.json`
- Nutzer-Voice-over beim Endstille-Trim überschreiben

## A–E-Gate gegen echte Zeiten

Zusätzlich zur Phase-1-Zielzeit gelten tolerante Hard-Max-Werte für die gemessene Timeline:

```text
A: 6,5 s
B: 8,5 s
C: 10,5 s
D: 13,5 s
E: 16,0 s
```

Darüber muss ein zusätzlicher Bildmoment geplant werden. Global bleiben 20,0 s oder länger immer Hard Fail.

## Motion

Standard `complexity-v1`:
- A: sehr leichte Push-Bewegung
- B: ruhiger Pan
- C: narrativer Pan/Push
- D: langsamer Scan/Pull für Karten oder komplexe Szenen
- E: besonders ruhige Übersicht

Optional kann `YOUTUBE_RENDER_PLAN.json` einzelne Bilder überschreiben.

## SFX

Gezielte Sounds stehen ausschließlich in `99-technik/YOUTUBE_RENDER_PLAN.json` und verwenden nur Typen aus `config/sound-library.json`.

- selektiv, nicht bei jedem Bildwechsel
- leiser als Voice-over
- keine Hintergrundmusik standardmäßig

## Kapitel

`99-technik/YOUTUBE_CHAPTERS.json` bindet Kapitel an Bildnummern. Beim finalen Export kommen die Zeitstempel aus `FINAL_TIMELINE.json`; Phase-1-Schätzzeiten werden nicht als finale Kapitelzeiten übernommen.

## Finaler Export

```text
03-export/FERTIGES-VIDEO.mp4
03-export/THUMBNAIL.png
03-export/YOUTUBE-TITEL.txt
03-export/YOUTUBE-BESCHREIBUNG.txt
03-export/YOUTUBE-KAPITEL.txt
03-export/YOUTUBE-TAGS.txt
```

## Definition of Done

Ein Video ist erst fertig, wenn:
- alle Bilder + Thumbnail vorhanden sind
- genau eine finale Stimme vorhanden ist
- alle Anchors real gemessen wurden
- Audio-Fingerprints gültig sind
- Endstille-Policy auf dem internen Master erfüllt ist
- A–E-Pacing mit der echten Timeline bestanden ist
- `FINAL_TIMELINE.json` existiert
- Pre-Render-Gate Exit 0 liefert
- Motion/SFX-Render erfolgreich ist
- kompletter Uploadsatz existiert
- Post-Render-Gate Exit 0 liefert
