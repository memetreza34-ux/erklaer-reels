# YouTube

Dieser Bereich ist die eigenständige Produktionspipeline für YouTube-Langvideos. Reel-Code bleibt unter `reels/` getrennt und wird dadurch nicht verändert. Die **Bildwelt** ist dagegen bewusst dieselbe wie bei den aktiven Reels.

## Verbindliche Reihenfolge

1. `youtube/YOUTUBE_WORKFLOW.md`
2. `youtube/PHASE3_HARD_GATE.md`
3. `youtube/YOUTUBE_VISUAL_WORLD.md`
4. bei `productionRulesVersion >= 2`: `youtube/ADAPTIVE_PACING_V2.md`

## Sichtbare Projektstruktur

```text
youtube/<woche>/<thema>/
├── 00-bildprompts/
│   ├── google-flow-prompt.txt
│   └── images/
├── 01-voice-script/
│   └── voice-script.txt
├── 02-audio/
│   └── voiceover-final.*
├── 03-export/
└── 99-technik/
```

Keine sichtbaren 10er-Promptordner, Script-Parts oder Audio-Parts bei neuen Videos.

## Drei Phasen

```text
Phase 1 — ChatGPT
→ Thema, Recherche, Titel, EIN Google-Flow-Masterprompt,
  EIN Gesamtskript als vollständiges Voice-over-Skript, internes Bild↔Voice-over-Mapping,
  A–E-Pacing, Renderplan, Kapitelplan und Upload-Metadaten

Phase 2 — Nutzer + Google Flow
→ Bild 00 separat
→ Bild 01 separat als Countryball-Master-Style-Frame
→ ab Bild 02 Bild 01 als Referenz anhängen
→ danach kontrollierte 5er-Wellen
→ EIN vollständiges Voice-over erzeugen

Phase 3 — Repo-CLI
→ echte Whisper-Wortzeiten messen
→ Endstille nur im internen Master kürzen
→ Bildanker finden
→ FINAL_TIMELINE bauen
→ A–E prüfen
→ Motion + SFX rendern
→ Export finalisieren
→ Post-QC
```

## Feste YouTube-Bildwelt

Quellwelt der aktiven Reels: `serious-minimal-countryball-explainer`

YouTube-Style-ID: `serious-minimal-countryball-explainer-youtube-16x9`

**Es ist dieselbe künstlerische Welt wie bei den Reels. Die einzige Formatänderung ist 16:9 statt 9:16.**

Verbindlich:
- perfekt runde Countryball-artige Akteure, wenn ein Akteur sinnvoll ist
- einfache weiße Augen
- dicke saubere schwarze Konturen
- flache kontrollierte 2D-Farben
- minimale grafische Schattierung
- geringe bis mittlere Detaildichte
- ein dominantes Motiv
- normalerweise 0–3 sinnvolle Zusatzobjekte
- einfache Farbflächen, leichte Verläufe oder subtile Textur als Hintergrund
- starke Symbolik statt realistischer Vollszenen
- seriös, clean, nicht kindisch
- keine Stickfiguren
- keine normalen Cartoon-Menschen
- keine realistischen Menschen
- kein 3D/Pixar/Clay/Fotorealismus

Bild 01 wird als Master-Style-Frame verwendet. Motiv und Hintergrundfarbe dürfen wechseln; die Countryball-Formsprache nicht.

## Sichtbarer Text in deutschen Videos

Jeder sichtbare lesbare Text muss Deutsch sein. Das gilt auch für Kartenlabels, Schilder, Legenden, Diagramme, Callouts, Kalender und Hintergrundtext.

Englischer Text oder Pseudo-Schrift = Hard Fail und Regeneration. Wenn Text nicht nötig ist, keinen Text erzeugen.

## Google Flow — maximal 5 Bilder gleichzeitig

```text
Bild 00 separat
Bild 01 separat → Countryball-Stil prüfen → Master-Referenz
02–05 mit Bild 01 als Referenz → prüfen
06–10 erst danach
11–15 ...
```

Verbindlich:
- maximal 5 aktive Bildgenerierungen gleichzeitig
- niemals zwei Wellen gleichzeitig offen halten
- letzter Block darf 1–5 Bilder enthalten
- Bild 00 ist nur Thumbnail
- alle Bilder liegen flach unter `00-bildprompts/images/`

## Adaptive Bilddichte

- A: 4–5 s geplant
- B: 5–7 s
- C: 7–9 s
- D: 9–12 s
- E: 12–15 s

Die Bildanzahl entsteht aus dem Skript und der visuellen Komplexität.

## Audio-Synchronisation + Endstille

Die eine finale Voice-over-Datei ist die Timing-Masterquelle. Das Nutzeroriginal unter `02-audio/` wird nicht verändert. Phase 3 misst das letzte gesprochene Wort und kürzt unnötige Endstille nur im internen Master.

## Motion + SFX

- Motion wird aus A–E abgeleitet
- gezielte SFX stehen in `99-technik/YOUTUBE_RENDER_PLAN.json`
- keine Hintergrundmusik standardmäßig
- Stimme bleibt dominant

## Normalstart Phase 3

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

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
