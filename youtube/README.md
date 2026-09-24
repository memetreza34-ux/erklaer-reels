# YouTube

Dieser Bereich ist die eigenständige Produktionspipeline für YouTube-Langvideos. Reel-Code und Reel-Bildwelt bleiben getrennt.

Für **neue YouTube-Videos ab 2026-09-24** gilt eine eigene hochwertige 16:9-Editorial-Bildwelt:

```text
premium-editorial-explainer-illustration-youtube-16x9
```

Ältere bereits angelegte YouTube-Projekte dürfen ihren damaligen Stil behalten. Das aktuelle Zeitzonen-Projekt wurde ausdrücklich auf den neuen Standard migriert.

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
  EIN Gesamtskript, internes Bild↔Voice-over-Mapping,
  A–E-Pacing, Renderplan, Kapitelplan und Upload-Metadaten

Phase 2 — Nutzer + Google Flow
→ Bild 00 separat
→ jedes Bild 01..NN separat aus dem eigenen Textprompt
→ KEIN vorheriges Bild als visuelle Referenz
→ kontrollierte 5er-Wellen nur als Ausführungsregel
→ EIN vollständiges Voice-over erzeugen

Phase 3 — Repo-CLI
→ Audio intern optimieren: lange Pausen kürzen, Endstille entfernen, 1,10x, Pitch erhalten
→ echte Whisper-Wortzeiten auf der optimierten Fassung messen
→ Bildanker finden
→ FINAL_TIMELINE bauen
→ A–E prüfen
→ Motion + SFX rendern
→ Export finalisieren
→ Post-QC
```

## Feste YouTube-Bildwelt

Neue YouTube-Style-ID:

```text
premium-editorial-explainer-illustration-youtube-16x9
```

Verbindlich:
- hochwertige moderne 2D-Editorial-/Erklärillustration
- 16:9 horizontal
- raffinierte, erwachsene Magazin-/Infografik-Wirkung
- präzise vektorartige Formen und kontrollierte Linien
- flache bis leicht geschichtete Farben mit subtiler Tiefe
- dezente Textur erlaubt
- jedes Bild bekommt eine eigene Komposition für genau seinen Inhalt
- Perspektive, Hintergrund, Maßstab und Anordnung dürfen bewusst wechseln
- keine generische Clipart-/KI-Schablone
- kein glänzendes 3D/Pixar/Clay/Anime/Fotorealismus als Standard
- Stickfiguren sind kein Standardstil
- Countryballs sind kein wiederkehrender Standardcharakter

## Unabhängige Bilder — HARD LOCK

**Kein erzeugtes Bild wird als visuelle Vorlage für ein späteres Bild verwendet.**

- Bild 01 ist kein Master-Style-Frame.
- Bild 02–NN bekommen Bild 01 nicht als Referenz.
- Kein vorheriges Bild wird an Google Flow angehängt.
- Stil-Konsistenz kommt aus dem geschriebenen Style-Lock, nicht aus Image-to-Image-Vererbung.
- Wiederholte Layouts/Perspektiven ohne inhaltlichen Grund gelten als Qualitätsfehler.

## Sichtbarer Text in deutschen Videos

Jeder sichtbare lesbare Text muss Deutsch sein. Das gilt auch für Kartenlabels, Schilder, Legenden, Diagramme, Callouts, Kalender und Hintergrundtext.

Englischer Text oder Pseudo-Schrift = Hard Fail und Regeneration. Wenn Text nicht nötig ist, keinen Text erzeugen.

## Google Flow — maximal 5 Bilder gleichzeitig

```text
Bild 00 separat
Bild 01 separat
02–05 jeweils separat aus eigenem Textprompt → prüfen
06–10 erst danach
11–15 ...
```

Verbindlich:
- maximal 5 aktive Bildgenerierungen gleichzeitig
- niemals zwei Wellen gleichzeitig offen halten
- letzter Block darf 1–5 Bilder enthalten
- **keine Bild-zu-Bild-Referenzen innerhalb oder zwischen Wellen**
- Bild 00 ist nur Thumbnail
- alle Bilder liegen flach unter `00-bildprompts/images/`

## Adaptive Bilddichte

- A: 4–5 s geplant
- B: 5–7 s
- C: 7–9 s
- D: 9–12 s
- E: 12–15 s

Die Bildanzahl entsteht aus dem Skript und der visuellen Komplexität.

## Audio-Synchronisation + Pacing

Die eine finale Voice-over-Datei ist die Timing-Quelle. Das Nutzeroriginal unter `02-audio/` wird nicht verändert.

Phase 3 erzeugt intern:
- lange Pausen gekürzt
- Endstille entfernt
- exakt 1,10x Geschwindigkeit
- Tonhöhe erhalten
- −16 LUFS
- max. −1,5 dBTP

Whisper misst **erst danach** die Wortzeiten.

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
