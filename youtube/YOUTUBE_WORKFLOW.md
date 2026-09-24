# YOUTUBE WORKFLOW — VERBINDLICHE REGEL FÜR LANGVIDEOS

**Stand: 2026-09-24**  
**Visual Policy Version: 3**

Diese Datei gilt ausschließlich für YouTube-Langvideos. Reel-Code und Reel-Bildwelt werden dadurch nicht verändert.

## Priorität

1. aktuelle ausdrückliche Nutzeranweisung
2. `youtube/YOUTUBE_WORKFLOW.md`
3. `config/youtube-channel-policy.json`
4. `youtube/YOUTUBE_VISUAL_WORLD.md`
5. `youtube/PHASE3_HARD_GATE.md`
6. `youtube/ADAPTIVE_PACING_V2.md`
7. `THEMEN_HISTORIE.md`

## Kanalfokus — HARD LOCK

Autonom gewählte YouTube-Themen bleiben in diesen Kernbereichen:
- Politik und Staatssysteme
- Geschichte
- Länder, Geografie, Grenzen und Territorien
- Ideologien und Gesellschaftssysteme
- internationale Beziehungen und Geopolitik

Gesundheit, Medizin, Psychologie, Lifestyle und allgemeine Alltags-Warum-Themen ohne Länder-, Geschichts- oder Systembezug werden **nicht autonom gewählt**. Außerhalb des Fokus nur bei ausdrücklicher Nutzeranweisung.

Jedes neue Projekt dokumentiert in `99-technik/video.json`:
- `topicCategory`
- `topicCoreLink`
- `explicitUserRequestedOutsideFocus`

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

## Phase 1 — ChatGPT

Phase 1 erstellt:
- Thema + Duplicate-Check
- Kanalfokus-Klassifikation
- Recherche + Quellen
- finalen Titel
- einen Google-Flow-Masterprompt inklusive Bild 00 und aller Szenenbilder
- ein vollständiges Voice-over-Skript
- `99-technik/BILD_AUDIO_ZUORDNUNG.json`
- A–E-Komplexität für jedes Bild
- `99-technik/YOUTUBE_RENDER_PLAN.json`
- `99-technik/YOUTUBE_CHAPTERS.json`
- Upload-Metadaten

### Phase-1-Policy-Gate

Vor Übergabe des Flow-Prompts muss gelten:

```bash
npm run validate:youtube-phase1 -- --dir "youtube/<woche>/<thema>"
```

Das Gate blockiert:
- veraltete Countryball-/Master-Reference-Prompts
- falsche/fehlende Visual-Policy-Version
- falsche Style-ID
- fehlenden Kanalfokus-Bezug
- fehlende Session-Reset-Regel
- fehlende Anti-Lifeless-/Visual-Storytelling-Regeln

## Bildplanung

Die Bildanzahl ist nicht starr. Ein Bild hat genau einen klaren visuellen Zweck.

```text
A = sehr einfach → 4–5 s geplant
B = einfach      → 5–7 s
C = mittel       → 7–9 s
D = komplex      → 9–12 s
E = sehr komplex → 12–15 s
```

## Phase 2 — Nutzer + Google Flow

### SESSION RESET HARD LOCK

Wenn die Visual Policy geändert wurde oder die bestehende Flow-Sitzung alte Stilregeln enthält:

**STOP → frische Flow-Sitzung / frisches Flow-Projekt öffnen → aktuellen Masterprompt vollständig neu einfügen.**

Eine alte Sitzung darf nicht weiterlaufen, wenn dort noch Regeln stehen wie:
- `serious-minimal-countryball-explainer-youtube-16x9`
- Bild 01 als Master-Style-Frame
- Bild 01 als Referenz für Bild 02–NN
- Stickman als aktive YouTube-Bildwelt

### Google Flow — unabhängige Bilder + 5er-Wellen

```text
Bild 00 separat
Bild 01 separat
Bild 02–05 separat aus ihren eigenen Textprompts → prüfen
06–10 separat aus ihren eigenen Textprompts → prüfen
11–15 ...
```

Maximal fünf aktive Generierungen gleichzeitig. Wellen sind nur Last-/Arbeitslogik.

### HARD LOCK: kein Referenzbild

- Kein erzeugtes Bild dient einem späteren Bild als visuelle Vorlage.
- Bild 01 ist kein Master-Style-Frame.
- kein vorheriges Bild an Flow anhängen
- Konsistenz nur durch geschriebenen Style-Lock

### HARD LOCK: Premium Editorial + Visual Storytelling

Aktive Style-ID:

`premium-editorial-explainer-illustration-youtube-16x9`

Verbindlich:
- hochwertige 2D-Editorial-/Dokumentar-Erklärillustration
- erwachsen, klar, hochwertig
- jedes Bild szenenspezifisch art-directed
- Ursache/Wirkung, Bewegung, Kontrast oder räumliche Beziehung sichtbar, wenn relevant
- für narrative Szenen sinnvolle Tiefenstaffelung bevorzugen
- Perspektive, Layout, Farbgewichtung und Kompositionsmodus bewusst variieren
- keine Countryballs als Standard
- keine Stickfiguren
- kein generisches KI-Template
- kein 3D/Pixar/Clay/Anime/Fotorealismus als Standard

### ANTI-LIFELESS HARD LOCK

Regenerieren, wenn ein Bild:
- leer oder steril wirkt
- nur ein kleines Objekt mittig auf leerem Grund zeigt
- wie eine Präsentationskarte/Icon-Collage wirkt
- praktisch dieselbe Komposition wie das vorherige Bild wiederholt
- keinen klaren Fokus hat
- trotz passendem Inhalt keine visuelle Beziehung, Tiefe, Richtung oder Spannung zeigt, obwohl der Inhalt das ermöglicht

**Clean ≠ leer. Minimal ≠ leblos.**

### Sichtbarer Text — Deutsch-Hard-Lock

Bei deutschen Projekten:
- jeder lesbare Text Deutsch
- englischer Text = Hard Fail
- Pseudo-Schrift = Hard Fail
- wenn Text nicht nötig ist: keinen Text erzeugen

## Verbindliches YouTube-Audio-Pacing

- überlange Sprechpausen automatisch kürzen
- kurze natürliche Pausen erhalten
- Anfangsstille straffen
- Endstille entfernen
- Voice-over exakt **1,10x**
- Tonhöhe erhalten
- **−16 LUFS**
- True Peak höchstens **−1,5 dBTP**
- 48 kHz
- Nutzeroriginal nie verändern

**Whisper misst erst die optimierte 1,10x-/Pausen-bereinigte Fassung.**

## Phase 3 — gemessene Produktion

Normalstart:

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Reihenfolge:
1. `validate-youtube-phase1-policy.js` — Kanalfokus + Visual Policy V3 + stale-prompt gate
2. aktuelle Bilder, Mapping und genau eine finale Nutzerstimme bestimmen
3. internes Voice-over erzeugen: Pausen kürzen, Endstille entfernen, 1,10x, −16 LUFS / max. −1,5 dBTP
4. erst danach Whisper-Wortzeiten messen
5. echte Bildanker finden
6. YouTube-Audio-Pacing-Hard-Gate
7. `FINAL_TIMELINE.json`
8. A–E-Pacing prüfen
9. Pre-Render-Hard-Gate
10. Motion + SFX rendern
11. Export finalisieren
12. Post-Render-Hard-Gate

### Verboten

- Wortzeiten am unoptimierten Original messen
- Render mit anderer Geschwindigkeit als 1,10x
- Render mit langer Endstille
- Nutzer-Voice-over überschreiben
- Render ohne `FINAL_TIMELINE.json`
- altes Flow-Projekt mit widersprüchlichen Stilregeln weiterverwenden
- generiertes Bild als Stil-/Image-to-Image-Referenz für spätere Bilder verwenden
- identische Kompositionsschablonen durch ein ganzes Video wiederholen
- leere, leblose Präsentationskarten als fertige Illustration akzeptieren

## Motion

Standard `complexity-v1`:
- A: sehr leichte Push-Bewegung
- B: ruhiger Pan
- C: narrativer Pan/Push
- D: langsamer Scan/Pull
- E: besonders ruhige Übersicht

## SFX

Nur Typen aus `config/sound-library.json`, selektiv, leiser als Voice-over, keine Hintergrundmusik standardmäßig.

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
- Thema den Kanalfokus erfüllt oder ausdrücklich vom Nutzer angefordert wurde
- Visual Policy V3 bestanden ist
- Flow-Sitzung keine Legacy-Stilregeln enthält
- kein Bild ein vorheriges Bild als Referenz benutzt
- jedes Bild eigenständig und szenenspezifisch art-directed ist
- keine leblose/sterile Template-Komposition akzeptiert wurde
- deutscher Text korrekt ist
- Audio 1,10x / −16 LUFS / max. −1,5 dBTP besteht
- alle Anchors nach Audio-Optimierung gemessen wurden
- `FINAL_TIMELINE.json` existiert
- Pre-Render- und Post-Render-Gates Exit 0 liefern
