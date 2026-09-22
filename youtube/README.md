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

**Keine sichtbaren 10er-Promptordner, Script-Parts oder Audio-Parts mehr bei neuen Videos.** Technische Zuordnung, Anker und Timing liegen ausschließlich unter `99-technik/` oder werden während Phase 3 berechnet.

## Drei Phasen

```text
Phase 1 — ChatGPT
→ Thema, Recherche, Titel, EIN Google-Flow-Masterprompt,
  EIN vollständiges Voice-over-Skript, internes Bild↔Voice-over-Mapping,
  Edit-Plan und Upload-Metadaten

Phase 2 — Nutzer + Google Flow
→ Masterprompt einmal an Flow geben.
→ Flow erzeugt intern in 5er-Wellen.
→ EIN vollständiges Voice-over erzeugen.

Phase 3 — Repo-CLI
→ echte Whisper-Wortzeiten messen, Bildanker im Gesamtaudio finden,
  FINAL_TIMELINE bauen, Gates prüfen, rendern und Post-QC ausführen
```

## Google Flow — maximal 5 Bilder gleichzeitig

Die 5er-Regel ist **Arbeitslogik, keine Ordnerlogik**.

```text
Bild 00 separat

01–05 gleichzeitig
→ auf alle fünf warten
→ alle prüfen
→ Fehler korrigieren
→ als Bild 01.png bis Bild 05.png ablegen
→ erst dann weiter

06–10
→ prüfen
→ 11–15
→ usw.
```

Verbindlich:
- maximal **5 aktive Bildgenerierungen gleichzeitig**
- niemals das komplette Set gleichzeitig starten
- nächste Welle erst nach vollständiger Prüfung der vorherigen
- letzter Block darf 1–5 Bilder enthalten
- Bild 00 ist nur Thumbnail und nie Teil der Videotimeline
- alle Bilder liegen flach unter `00-bildprompts/images/`

## Adaptive Bilddichte

Neue V2-Videos planen jedes Bild individuell:

- A: sehr einfach → 4–5 s
- B: einfach → 5–7 s
- C: mittel → 7–9 s
- D: komplex → 9–12 s
- E: sehr komplex → 12–15 s

Die Bildanzahl entsteht aus dem Skript. Es gibt keine feste Sollzahl.

## Audio-Synchronisation

Die **eine finale Voice-over-Datei** ist die Timing-Masterquelle. Geschätzte Zeiten oder `Videolänge ÷ Bildanzahl` sind verboten.

Normalstart:

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Phase 3:
1. findet die finale Audiodatei unter `02-audio/`
2. misst echte Whisper-Wortzeitstempel
3. findet jeden `startAnchor` monoton im vollständigen Audio
4. schreibt echte `actualStartSeconds`, `actualEndSeconds`, `alignmentConfidence`
5. bindet die Messung per SHA-256 an genau diese Audiodatei
6. erzeugt `99-technik/YOUTUBE_AUDIO_MASTER.wav`
7. erzeugt `99-technik/FINAL_TIMELINE.json`
8. prüft Adaptive Pacing und Hard-Gates
9. rendert `03-export/FERTIGES-VIDEO.mp4`
10. führt Post-Render-QC aus

Legacy-Projekte mit mehreren Audio-Parts bleiben technisch kompatibel, aber neue Projekte verwenden standardmäßig eine Audiodatei.

## YouTube-Standard

- 16:9, 1920×1080, 30 fps
- Länge je nach Auftrag; kurze Testvideos sind erlaubt
- Bildanzahl nach Inhalt, nicht nach starrer Zielzahl
- `youtube-editorial-stick-explainer`
- subtile Motion
- keine eingebrannten Untertitel standardmäßig
- Hintergrundmusik standardmäßig aus

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
