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

**YouTube verwendet weiterhin seine eigene separate 16:9-Bildwelt.**

## Google Flow

Einzige verbindliche Masterdatei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Flow arbeitet streng seriell:

```text
1 Bild erzeugen → warten → prüfen → Bild NN.png → ablegen → nächstes Bild
```

Keine Queue, kein Batch, keine Parallelgenerierung.

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

Nur ein normaler Startbefehl:

```bash
npm run phase3:reel -- --dir "<reel>"
```

Danach läuft Antigravity selbstständig:

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
