# Erklär-Reels

Produktionspipeline für 9:16-Erklär-Reels mit fester Reel-Bildwelt und getrenntem YouTube-Workflow.

**`CURRENT_WORKFLOW.md` ist die Single Source of Truth.** Rollen: `WORKFLOW_PHASEN.md`.

## Kanal-Fokus

Für die autonome Reel-Themenwahl gilt `config/reel-topic-focus.json`: Schwerpunkt auf Politik, Geschichte, Geografie, Ideologien/Systemen und internationalen Beziehungen. Bereits vorhandene ältere Gesundheit-/Alltags-Reels bleiben nur Historie.

## Produktionsstandard

- 55–60 Sekunden Voice-over
- 155–175 deutsche Wörter
- 8–10 narrative Szenen, Standard 9
- Adaptive Dense V2 statt starrer 17-Bilder-Formel
- 9 Szenen normalerweise 20–22 Bilder
- ein Bild = eine klare gesprochene visuelle Kernaussage
- Voice-over 1,10x, Pitch erhalten
- −16 LUFS, höchstens −1,5 dBTP
- keine Untertitel / kein aktiver Word-Sync
- keine Hintergrundmusik
- harte Cuts
- Szenencut ca. 0,10 s vor Cue
- interner Bildcut ca. 0,08 s vor Cue
- SFX ca. 0,04 s vor Cut
- 0,5–0,7 s Schlussbild-Hold, Ziel 0,6 s

## Feste Reel-Bildwelt

Alle neuen Reels verwenden ausschließlich:

```text
serious-minimal-countryball-explainer
```

**Serious Minimal Countryball Explainer**:
- 9:16, Smartphone-first
- saubere dicke schwarze Konturen
- flache kontrollierte 2D-Farben
- perfekt runde Countryball-artige Figuren, wenn ein Akteur sinnvoll ist
- 0–3 passende Zusatzobjekte
- drei Kompositionsmodi: minimal-symbolic, supported-explainer, simple-mini-scene
- keine normalen illustrierten Menschen
- keine realistischen Räume/Hände/Haut
- kein Foto-, Anime-, Clay-, 3D-/Pixar-Look
- Bild 01 mit deutscher Headline; spätere Bilder dürfen textfrei sein
- Prompts Englisch, sichtbarer Text ausschließlich Deutsch

Vollständige Style-Bibel: `knowledge/fixed-visual-world.md`.

## YouTube-Bildwelt

YouTube bleibt ein eigener 16:9-Produktionsworkflow, verwendet aber wieder **dieselbe Serious-Minimal-Countryball-Bild-DNA** wie die Reels:

```text
serious-minimal-countryball-explainer-youtube-16x9
```

Die einzige beabsichtigte Formatabweichung ist **16:9 horizontal statt 9:16 vertikal**.

Wichtigste YouTube-Regeln:
- perfekt runde Countryball-Akteure, wenn Akteure sinnvoll sind
- dicke schwarze Konturen, flache kontrollierte 2D-Farben, reduzierte Details
- starke Symbolik statt realistischer Vollszenen
- keine normalen illustrierten Menschen, Stickfiguren oder realistischen Menschen
- keine Foto-, Anime-, Clay-, 3D-/Pixar-Welt
- Bild 01 = Cover + erste Videoszene
- Cover wird exakt 3× generiert, genau ein Gewinner bleibt
- Bild 02–NN jeweils exakt 1×
- maximal 5 aktive Generierungen gleichzeitig, nur als Parallelitätsregel
- alle finalen Bilder flach in `00-bildprompts/images/`
- kein Bild 00
- kein erzeugtes Bild wird als visuelle Referenz für ein späteres Bild verwendet
- sichtbarer Text in deutschen Projekten ausschließlich Deutsch

Die zwischenzeitliche Premium-Editorial-Bildwelt ist für neue Schema-9+-YouTube-Projekte nicht mehr aktiv.

Details: `youtube/YOUTUBE_WORKFLOW.md` und `youtube/YOUTUBE_VISUAL_WORLD.md`.

## Google Flow für Reels

Einzige verbindliche Reel-Masterdatei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Flow arbeitet bei Reels streng seriell:

```text
1 Bild erzeugen → warten → prüfen → Bild NN.png → ablegen → nächstes Bild
```

Keine Queue, kein Batch, keine Parallelgenerierung.

YouTube arbeitet separat: Cover 3×, danach Bild 02–NN jeweils 1×; maximal fünf aktive Generierungen gleichzeitig. Es gibt keine Bild-zu-Bild-Referenzen.

## Sichtbare Reel-Struktur

```text
reel-XX_thema/
├── 00-bildprompts/
│   ├── 99-alle-bildprompts.txt
│   └── 00-ALLE-BILDER-HIER-REIN/
├── 01-voice-script/
├── 02-audio/
├── 03-export/
│   ├── FERTIGES-REEL.mp4
│   └── UNIVERSELLE-CAPTION.txt
└── 99-technik/
```

## Phase 3 — Antigravity Simple Mode

Normaler Start:

```bash
npm run phase3:reel -- --dir "<reel>"
```

Vor jeder Asset- oder Audioänderung laufen automatisch:

```text
Preflight: ffmpeg + ffprobe + unzip + Pflichtconfigs
→ check:content --strict
```

Danach arbeitet Antigravity selbstständig:

```text
Assets finden
→ Bild 01..NN + Voice-over automatisch routen
→ 1 schneller visueller QC-Durchgang
→ Audio optimieren
→ Bild↔Audio automatisch ausrichten
→ SFX binden
→ Timeline
→ Finalizer
→ Render
```

Nach einem Hard Blocker kann gezielt ab dem betroffenen Produktionsschritt weitergemacht werden; Preflight und Inhaltsprüfung werden trotzdem erneut ausgeführt:

```bash
npm run phase3:reel -- --dir "<reel>" --from "Timeline bauen"
npm run phase3:reel -- --list-steps
```

Keine schriftliche Bildbeschreibung pro Bild, keine Match-Begründung pro Bild, keine zweite Zuordnungsprüfung und keine manuelle Freigabe jedes Audio-Ankers.

Rückfragen nur bei echten Hard Blockern wie fehlenden/doppelten Bildern, mehreren unklaren Audio-Dateien, beschädigten Assets, offensichtlicher Fehlzuordnung oder Tool-/Renderfehlern.

## Nutzerassets

Originale niemals aus einem anderen Reel übernehmen, verschieben oder löschen. Antigravity erzeugt keine fehlenden Reel-Bilder selbst. Details: `ANTIGRAVITY_IMAGE_POLICY.md`.

## Quellen

Mindestens zwei nachvollziehbare HTTPS-Quellen auf unterschiedlichen Hosts, möglichst eine Primär-/offizielle oder wissenschaftliche Quelle plus eine unabhängige Sekundär-/Fachquelle.

## Tests

```bash
npm test
```

Tests/QC niemals als bestanden melden, wenn sie nicht tatsächlich ausgeführt wurden.
