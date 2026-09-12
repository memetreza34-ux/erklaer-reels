# Erklär-Reels

Produktionspipeline für 9:16-Erklär-Reels mit dem Kanal-Fokus **Politik, Geschichte, Geografie und Systeme einfach erklärt** und einer festen Reel-Bildwelt.

**`CURRENT_WORKFLOW.md` ist die Single Source of Truth.**

## Themenfokus

Neue Reels werden autonom vor allem aus diesen Bereichen gewählt:
- Politik und Staatssysteme
- Geschichte und historische Wendepunkte
- Länder, Geografie, Grenzen und Territorien
- Ideologien und Gesellschaftssysteme
- internationale Beziehungen und Geopolitik
- passende Kultur-/Wirtschaftssysteme mit Länder-/Geschichtsbezug

Details: `REEL_THEMENFOKUS.md`. Duplikate: `THEMEN_HISTORIE.md`.

Gesundheit, Psychologie, Alltag und Lifestyle werden nicht autonom gewählt, können aber auf ausdrücklichen Nutzerwunsch erstellt werden.

## Produktionsstandard

- 55–60 Sekunden
- 155–175 deutsche Wörter
- 8–10 narrative Szenen, Standard 9
- Adaptive Dense V2: 19–24 Bilder je nach Szenenzahl
- Hook standardmäßig 2 Bilder; danach 2–3 je Szene nach Inhalt
- Voice-over 1,10x, −16 LUFS, max. −1,5 dBTP
- keine Untertitel
- keine Hintergrundmusik
- harte Cuts
- nach Sprecherende nur 0,5–0,7 s Schlussbild-Hold

## Serious Minimal Countryball Explainer

Alle neuen Reels verwenden ausschließlich **Serious Minimal Countryball Explainer** (`serious-minimal-countryball-explainer`).

- 9:16, Smartphone-first
- dicke schwarze Konturen
- flache kontrollierte Farben und minimale Schatten
- perfekt runde Countryball-artige Figuren, wenn Akteure nötig sind
- Flaggen/Karten/Grenzen/Institutionen natürlich nutzen, wenn sie inhaltlich passen
- 0–3 sinnvolle Requisiten/Symbole
- Wechsel zwischen `minimal-symbolic`, `supported-explainer`, `simple-mini-scene`
- nicht jedes Bild nur Kugel + leerer Hintergrund
- Bild 01 mit deutscher Headline; spätere Bilder dürfen textfrei sein
- Prompts Englisch, sichtbarer Text Deutsch

Verboten: normale illustrierte Menschen, realistische Hände/Räume, Foto+Cartoon, Anime, Clay, glänzendes 3D/Pixar und winzige Deko-Kugeln.

Style-Bibel: `knowledge/fixed-visual-world.md`.

## Google Flow

Einzige Masterdatei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Streng seriell:

```text
1 Bild erzeugen → warten → prüfen → Bild NN.png → ablegen → nächstes
```

Keine Queue, kein Batch, keine Parallelgenerierung.

## Bilddichte

```text
8 Szenen  → 19–21 Bilder
9 Szenen  → 20–22 Bilder
10 Szenen → 21–24 Bilder
```

Ein Bild entspricht einer klaren gesprochenen visuellen Aussage. Technische Untergrenze ca. 2,2 s; häufig gut 2,5–3,8 s; ab ca. 4,8 s Split prüfen.

## Motion / Sound

Jeder Bildmoment wird dezent bewegt. Jeder Szenen-/interne Bildwechsel bekommt einen kurzen SFX aus `config/sound-library.json`.

Richtwerte:
- Szenencut ca. 0,10 s vor Sprachbeginn
- interner Bildcut ca. 0,08 s davor
- SFX ca. 0,04 s vor Cut

## Phase 3 — Simple Mode

Normalerweise nur:

```bash
npm run phase3:reel -- --dir "<reel>"
```

Intern:

```text
Assets finden/automatisch routen
→ schneller visueller Einmal-Check
→ Audio optimieren
→ auto-align:reel
→ Timeline + Sounds
→ Finalizer
→ Render
→ kurzer Endcheck
```

Keine 12 Häkchen pro Bild, keine schriftliche Match-Begründung und kein zweiter Sichtpass. Nummerierte Bilder sind bei vollständiger eindeutiger Folge die chronologische Hauptautorität.

Automatische Bild↔Audio-Grundausrichtung separat:

```bash
npm run auto-align:reel -- --dir "<reel>"
```

Nur echte fehlende/kaputte Assets, unauflösbare Nummernkonflikte, starke Script↔Audio-Abweichungen oder nicht automatisch behebbaren Hard Gates blockieren.

## Reel-Struktur

```text
reel-XX_thema/
├── 00-bildprompts/
├── 01-voice-script/
├── 02-audio/
├── 03-export/
│   ├── FERTIGES-REEL.mp4
│   └── UNIVERSELLE-CAPTION.txt
└── 99-technik/
```

## Quellen

Mindestens zwei echte HTTPS-Quellen auf unterschiedlichen Hosts; möglichst Primär-/offizielle/wissenschaftliche Quelle plus unabhängige Sekundär-/Fachquelle.

## YouTube

YouTube besitzt eine eigene 16:9-Bildwelt und einen eigenen Workflow unter `youtube/`. Reel-Regeln niemals auf YouTube übertragen.

## Tests

```bash
npm test
```

Tests/QC niemals als bestanden melden, wenn sie nicht tatsächlich ausgeführt wurden.
