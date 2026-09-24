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

## Eigene YouTube-Bildwelt

YouTube hat einen getrennten 16:9-Produktionsworkflow und für **neue Videos ab 2026-09-24** eine eigene Bildwelt:

```text
premium-editorial-explainer-illustration-youtube-16x9
```

Wichtigste YouTube-Regeln:
- hochwertige moderne 2D-Editorial-/Erklärillustration
- jedes Bild bekommt eine eigenständige Komposition
- **kein erzeugtes Bild wird als visuelle Referenz für ein späteres Bild verwendet**
- Bild 01 ist kein Master-Style-Frame
- Stil-Konsistenz kommt aus einem schriftlichen Style-Lock
- keine wiederkehrende Copy-Paste-Schablone
- sichtbarer Text in deutschen Projekten ausschließlich Deutsch

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

YouTube nutzt dagegen kontrollierte 5er-Wellen, aber **jedes Bild bleibt eine unabhängige Text-to-Image-Generierung ohne Bildreferenz**.

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
