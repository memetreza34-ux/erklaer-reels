# YOUTUBE WORKFLOW — VERBINDLICHE REGEL FÜR LANGVIDEOS

**Stand: 2026-09-24**

Diese Datei gilt ausschließlich für YouTube-Langvideos. Reel-Code und Reel-Bildwelt werden dadurch nicht verändert.

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

Neue Projekte bekommen keine sichtbaren Script-Parts, Audio-Parts oder 10er-Bildpakete.

## Phase 1 — ChatGPT

Phase 1 erstellt:
- Thema + Duplicate-Check
- Recherche + Quellen
- finalen Titel
- einen Google-Flow-Masterprompt inklusive Bild 00 und aller Szenenbilder
- ein vollständiges Voice-over-Skript
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

Wenn ein einfacher visueller Moment mehr Sprache tragen müsste, wird ein zusätzlicher sinnvoller Bildmoment geplant.

## Phase 2 — Nutzer + Google Flow

Der Nutzer benötigt nur:

```text
00-bildprompts/google-flow-prompt.txt
01-voice-script/voice-script.txt
```

### Google Flow — unabhängige Editorial-Illustrationen + 5er-Wellen

```text
Bild 00 separat
Bild 01 separat
Bild 02–05 separat aus ihren eigenen Textprompts → prüfen
06–10 separat aus ihren eigenen Textprompts → prüfen
11–15 ...
```

### HARD LOCK: kein Referenzbild zwischen Bildern

- **Kein erzeugtes Bild darf als visuelle Vorlage für ein späteres Bild verwendet werden.**
- Bild 01 ist kein Master-Style-Frame.
- Bild 02–NN bekommen Bild 01 nicht als Referenz.
- Kein vorheriges Bild wird an Flow angehängt.
- Jedes Bild entsteht aus seinem eigenen Textprompt.
- Stil-Konsistenz kommt ausschließlich aus dem schriftlichen Style-Lock in `youtube/YOUTUBE_VISUAL_WORLD.md`.

### HARD LOCK: jedes Bild individuell

Jedes Bild braucht eine eigenständige visuelle Lösung. Wiederholungen von Layout, Perspektive, Figurenposition, Hintergrund oder Farbaufbau ohne inhaltlichen Grund sind zu vermeiden.

Verbindlich:
- neue YouTube-Style-ID: `premium-editorial-explainer-illustration-youtube-16x9`
- hochwertige moderne 2D-Editorial-/Erklärillustration
- 16:9 horizontal
- erwachsen, klar, hochwertig, nicht kindisch
- individuelle Komposition pro Bild
- keine generische Clipart-/KI-Template-Wirkung
- keine Stickfiguren als Standardstil
- kein glänzendes 3D/Pixar/Clay/Anime/Fotorealismus
- höchstens 5 aktive Bildgenerierungen gleichzeitig
- niemals zwei Wellen gleichzeitig offen halten
- letzter Block darf 1–5 Bilder enthalten
- Bild 00 bleibt Thumbnail und kommt nie in die Timeline
- Bilder liegen flach unter `00-bildprompts/images/`

Die vollständige Bildregel steht in `youtube/YOUTUBE_VISUAL_WORLD.md`.

### Sichtbarer Text — Deutsch-Hard-Lock

Bei einem deutschen Projekt gilt für jedes Bild:
- jeder lesbare sichtbare Text muss Deutsch sein
- gilt auch für Kartenlabels, Schilder, Legenden, Diagramme, Kalender, Callouts und Hintergrundtext
- Flow darf keine englischen Standardlabels ergänzen
- englischer sichtbarer Text = Hard Fail und Regeneration
- Pseudo-Schrift/unleserlicher Text = Hard Fail oder entfernen
- wenn Text nicht nötig ist, keinen Text erzeugen

### Voice-over

Aus `voice-script.txt` wird eine einzige finale Voice-over-Datei erzeugt und unter `02-audio/` abgelegt. Das Nutzeroriginal wird von Phase 3 niemals überschrieben.

## Verbindliches YouTube-Audio-Pacing

Für alle neuen Single-Audio-V2-YouTube-Videos gelten dieselben zentralen Sprecherregeln wie beim Reel:

- überlange Sprechpausen automatisch kürzen
- kurze natürliche Pausen erhalten
- Anfangsstille straffen
- Endstille entfernen
- Voice-over exakt **1,10x** beschleunigen
- Tonhöhe dabei erhalten
- auf **−16 LUFS** normalisieren
- True Peak höchstens **−1,5 dBTP**
- 48 kHz Produktionsaudio
- Nutzeroriginal unter `02-audio/` niemals verändern

Phase 3 erzeugt dafür ausschließlich eine interne Arbeitsfassung unter:

```text
99-technik/YOUTUBE_AUDIO_OPTIMIZED.wav
99-technik/YOUTUBE_AUDIO_PACING.json
```

**Wichtig:** Die Wortzeitmessung darf niemals auf dem langsameren Nutzeroriginal stattfinden. Zuerst wird das Audio optimiert; erst danach misst Whisper die 1,10x-/Pausen-bereinigte Fassung. Nur diese Zeiten dürfen Bildanker und Timeline steuern.

## Phase 3 — gemessene Produktion

Normalstart:

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Reihenfolge:
1. aktuelle Bilder, Mapping und genau eine finale Nutzerstimme bestimmen
2. internes Voice-over erzeugen: lange Pausen kürzen, Endstille entfernen, 1,10x bei erhaltener Tonhöhe, −16 LUFS / max. −1,5 dBTP
3. `YOUTUBE_AUDIO_PACING.json` mit Fingerprints schreiben
4. **erst auf dieser optimierten Fassung** Whisper + Wortzeitstempel messen
5. Messung per SHA-256 an die optimierte Audiodatei binden
6. jeden `startAnchor` monoton im gesprochenen Wortstrom finden
7. echte `actualStartSeconds`, `actualEndSeconds`, `alignmentConfidence` schreiben
8. YouTube-Audio-Pacing-Hard-Gate bestehen
9. `99-technik/FINAL_TIMELINE.json` bauen
10. A–E-Planung gegen die echte Timeline prüfen
11. Pre-Render-Hard-Gate bestehen
12. 16:9-YouTube-Renderer mit A–E-Motion + gezielten SFX ausführen
13. Thumbnail + Upload-Dateien finalisieren
14. Audio-Pacing erneut gegen Fingerprints prüfen
15. Post-Render-Hard-Gate bestehen

### Verboten

- `Videolänge ÷ Bildanzahl`
- gleichmäßige pauschale Holds
- Anchor-Zeiten per Gefühl eintragen
- `alignmentConfidence` erfinden
- simples A-/B-Bild deutlich länger halten, statt sinnvoll zu splitten
- Rendern ohne gemessene Wortzeiten
- Wortzeiten am unoptimierten Original messen und danach auf 1,10x beschleunigen
- Rendern mit anderer Geschwindigkeit als 1,10x bei neuen V2-Videos
- Rendern mit ungeprüften langen Pausen oder langer Endstille
- Rendern nach Änderung des optimierten Audios mit altem Messbeleg
- Nutzer-Voice-over überschreiben
- Rendern ohne `FINAL_TIMELINE.json`
- ein generiertes YouTube-Bild als Stil-/Image-to-Image-Referenz für ein späteres Bild verwenden
- identische Kompositionsschablonen durch ein ganzes Video wiederholen

## A–E-Gate gegen echte Zeiten

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
- D: langsamer Scan/Pull
- E: besonders ruhige Übersicht

## SFX

Gezielte Sounds stehen ausschließlich in `99-technik/YOUTUBE_RENDER_PLAN.json` und verwenden nur Typen aus `config/sound-library.json`.

- selektiv
- leiser als Voice-over
- keine Hintergrundmusik standardmäßig

## Kapitel

`99-technik/YOUTUBE_CHAPTERS.json` bindet Kapitel an Bildnummern. Finale Zeitstempel kommen aus `FINAL_TIMELINE.json`.

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

Ein neues YouTube-Video ist erst fertig, wenn:
- alle Bilder + Thumbnail vorhanden sind
- jedes Videobild unabhängig aus seinem eigenen Textprompt erzeugt wurde
- kein vorheriges Bild als visuelle Referenz verwendet wurde
- jedes Bild eine inhaltlich passende, eigenständige Komposition besitzt
- die Premium-Editorial-Illustrationsqualität durchgehend eingehalten wird
- bei deutschem Projekt jeder sichtbare Text Deutsch ist
- genau eine finale Nutzerstimme vorhanden ist
- Nutzeroriginal unverändert geblieben ist
- internes Audio lange Pausen und Endstille entfernt hat
- internes Audio exakt 1,10x bei erhaltener Tonhöhe läuft
- −16 LUFS / max. −1,5 dBTP als Produktionsziel angewendet wird
- alle Anchors **nach** der Audio-Optimierung real gemessen wurden
- Audio-Pacing- und Alignment-Fingerprints gültig sind
- A–E-Pacing mit der echten Timeline bestanden ist
- `FINAL_TIMELINE.json` existiert
- Pre-Render-Gate Exit 0 liefert
- Motion/SFX-Render erfolgreich ist
- kompletter Uploadsatz existiert
- Post-Render-Hard-Gate Exit 0 liefert
