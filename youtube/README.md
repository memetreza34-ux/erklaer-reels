# YouTube

Dieser Bereich ist die eigenständige Produktionspipeline für YouTube-Langvideos. **Reels bleiben vollständig getrennt unter `reels/` und werden dadurch nicht verändert.**

## Verbindliche Reihenfolge

1. `youtube/YOUTUBE_WORKFLOW.md`
2. `youtube/PHASE3_HARD_GATE.md`
3. `youtube/YOUTUBE_VISUAL_WORLD.md`
4. bei `productionRulesVersion >= 2`: `youtube/ADAPTIVE_PACING_V2.md`

## Sichtbare Projektstruktur — absichtlich einfach

Für neue YouTube-Projekte gilt:

```text
youtube/<woche>/<thema>/
├── 00-bildprompts/
│   ├── google-flow-prompt.txt   ← EIN Masterprompt
│   └── images/                  ← Bild 00, Bild 01, Bild 02 ...
├── 01-voice-script/
│   └── voice-script.txt         ← EIN Gesamtskript
├── 02-audio/
│   └── voiceover-final.*        ← EINE finale Stimme
├── 03-export/
└── 99-technik/                  ← interne Dateien
```

Keine sichtbaren 10er-Promptordner, Script-Parts oder Audio-Parts mehr bei neuen Videos.

## Drei Phasen

```text
Phase 1 — ChatGPT
→ Thema, Recherche, Titel, EIN Google-Flow-Masterprompt,
  EIN vollständiges Voice-over-Skript, internes Bild↔Voice-over-Mapping,
  A–E-Pacing, Renderplan, Kapitelplan und Upload-Metadaten

Phase 2 — Nutzer + Google Flow
→ Masterprompt einmal an Flow geben
→ Flow erzeugt intern in 5er-Wellen
→ EIN vollständiges Voice-over erzeugen

Phase 3 — Repo-CLI
→ echte Whisper-Wortzeiten messen
→ überlange Endstille nur im internen Master kürzen
→ Bildanker im Gesamtaudio finden
→ FINAL_TIMELINE bauen
→ A–E gegen echte Zeiten prüfen
→ Motion + SFX rendern
→ Export finalisieren
→ Post-QC
```

## Google Flow — maximal 5 Bilder gleichzeitig

Die 5er-Regel ist Arbeitslogik, keine Ordnerlogik.

```text
Bild 00 separat
01–05 gleichzeitig → warten → prüfen → korrigieren → ablegen
06–10 erst danach
11–15 ...
```

Verbindlich:
- maximal **5 aktive Bildgenerierungen gleichzeitig**
- niemals zwei 5er-Wellen gleichzeitig offen halten
- letzter Block darf 1–5 Bilder enthalten
- Bild 00 ist nur Thumbnail und nie Teil der Videotimeline
- alle Bilder liegen flach unter `00-bildprompts/images/`

## Adaptive Bilddichte

Neue V2-Videos planen jedes Bild individuell:

- A: sehr einfach → 4–5 s geplant
- B: einfach → 5–7 s
- C: mittel → 7–9 s
- D: komplex → 9–12 s
- E: sehr komplex → 12–15 s

Die Bildanzahl entsteht aus dem Skript. Es gibt keine feste Sollzahl.

Phase 3 prüft zusätzlich die **echte** gemessene Bilddauer. Ein simples Bild darf nicht nur deshalb lange stehen, weil der zugehörige Sprachblock zu lang geplant wurde; dann muss ein weiterer sinnvoller Bildmoment entstehen.

## Audio-Synchronisation + Endstille

Die eine finale Voice-over-Datei ist die Timing-Masterquelle. Geschätzte Zeiten oder `Videolänge ÷ Bildanzahl` sind verboten.

Das Nutzeroriginal unter `02-audio/` wird nicht verändert. Phase 3 misst mit Whisper das letzte gesprochene Wort. Überlange abschließende Stille wird nur im internen `99-technik/YOUTUBE_AUDIO_MASTER.wav` gekürzt.

## Motion + SFX

- Motion wird standardmäßig aus der A–E-Komplexität abgeleitet
- A/B: ruhig und leicht
- C: normaler narrativer Pan/Push
- D: langsamere Scan-/Pull-Bewegung für komplexe Szenen
- E: besonders ruhige Übersicht
- gezielte SFX stehen in `99-technik/YOUTUBE_RENDER_PLAN.json`
- Soundtypen müssen aus `config/sound-library.json` stammen
- keine Hintergrundmusik standardmäßig
- Stimme bleibt dominant

## Normalstart Phase 3

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Der Lauf erledigt Alignment, Timeline, Pacing-Gate, Hard-Gate, Render, Export-Finalisierung und Post-Render-QC.

## Finaler Export

```text
03-export/
├── FERTIGES-VIDEO.mp4
├── THUMBNAIL.png
├── YOUTUBE-TITEL.txt
├── YOUTUBE-BESCHREIBUNG.txt
├── YOUTUBE-KAPITEL.txt
└── YOUTUBE-TAGS.txt
```

Kapitel können über `99-technik/YOUTUBE_CHAPTERS.json` an Bildnummern gebunden werden. Der Finalizer nimmt dann die echten Startzeiten aus `FINAL_TIMELINE.json` statt geschätzter Phase-1-Zeitstempel.
