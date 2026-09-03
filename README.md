# Erklär-Reels

Produktionspipeline für visuelle 9:16-Erklär-Reels mit offenem Themenuniversum und **einer einzigen festen Reel-Bildwelt**.

**`CURRENT_WORKFLOW.md` ist die Single Source of Truth.**

## Produktionsstandard

- 55–60 Sekunden Voice-over
- 155–175 deutsche Wörter
- 8–10 narrative Szenen, Standard 9
- Hook 1 Bild, jede weitere Szene 2
- 9 Szenen = 17 Bilder
- Voice-over 1,10x, Pitch erhalten
- −16 LUFS, höchstens −1,5 dBTP
- keine Untertitel
- keine Hintergrundmusik
- harte Cuts
- Szenencut ca. 0,10 s vor Cue
- interner Bildcut ca. 0,08 s vor Cue
- SFX ca. 0,04 s vor Cut
- nach Sprecherende nur 0,5–0,7 s Schlussbild-Hold, Ziel 0,6 s

## Modern Countryball Explainer

Alle neuen Reels verwenden ausschließlich **Modern Countryball Explainer** (`modern-countryball-explainer`).

- 9:16, Smartphone-first
- klare runde Kugelfiguren, wenn ein Akteur nötig ist
- keine Kugelfigur nur zur Dekoration erzwingen
- dicke schwarze Konturen
- einfache 2D-Formen
- lebendige Mini-Szene statt statischer Posterkarte
- sichtbare Handlung/Reaktion/Ursache-Folge
- einfache Tiefe und Kontext
- Perspektiven zwischen benachbarten Bildern variieren
- Bild 01 mit deutscher Headline; spätere Bilder dürfen textfrei sein
- Prompts Englisch, sichtbarer Text ausschließlich Deutsch

Keine realistischen Menschen, humanoiden Cartoonmenschen, Stick-Figuren, Anime-, Clay- oder glänzende 3D/Pixar-Welt.

Vollständige Style-Bibel: `knowledge/fixed-visual-world.md`.

## Motion/Zoom — Hard Gate

Für neue Reels ab 2026-09-02 ist **jeder Bildmoment sichtbar bewegt**. Keine längeren statischen Slides.

Kanonische Typen:
- `ken-burns`
- `subtle-push-in`, `subtle-pull-out`
- `slow-zoom-in`, `slow-zoom-out`
- `pan-left/right/up/down`

Zoom meist 2–4 %, Pan 1–3 %, weiches Easing. Hook und zweite Bildphasen bewegen sich ebenfalls. `none` ist für neue Reels nicht zulässig.

Bekannte Motion-Aliase werden kanonisch aufgelöst; unbekannte Typen blockieren. Der Renderer besitzt zusätzlich einen Safety-Fallback gegen statische Frames.

## Sounddesign — Hard Gate

Kein visueller Wechsel darf stumm durchrutschen:
- jeder Szenenwechsel ab Szene 2 braucht SFX
- jeder interne Bildwechsel braucht eigenen SFX/Objekt-Sound
- SFX beginnt ca. 0,04 s vor dem Cut
- typische Lautstärke 0,18–0,30, Standard ca. 0,22
- nur `type` aus `config/sound-library.json`
- interne SFX über `targetId` an die konkrete Bildphase binden

`sync:sounds --strict` bindet die Typen an echte Dateien. Finalizer und Renderer prüfen die Soundbibliothek erneut. Falls ein Zwischenplan ein `file`-Feld verliert, kann der Renderer einen bekannten Typ als Safety-Fallback erneut auf die kanonische SFX-Datei auflösen.

## Audio-Ende — Hard Gate

`trim:pauses` entfernt auch Endstille. Das finale Voice-over darf höchstens **0,25 s Endstille** enthalten. Danach folgt ausschließlich der separate 0,5–0,7-s-Schlussbild-Hold.

Mehrsekündige Endstille blockiert Finalizer und Renderer — auch mit `--force`.

## Google Flow

Einzige verbindliche Masterdatei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Flow arbeitet strikt seriell:

```text
1 Bild erzeugen → warten → prüfen → Bild NN.png → ablegen → prüfen → nächstes Bild
```

Keine Queue, kein Batch, keine Parallelgenerierung.

## Sichtbare Reel-Struktur

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

Mindestens zwei nachvollziehbare HTTPS-Quellen mit unterschiedlichen Hosts; möglichst eine Primär-/offizielle oder wissenschaftliche Quelle plus eine unabhängige Sekundär-/Fachquelle.

## Phase 3

```bash
npm run discover:assets -- --dir "<reel>"
npm run organize:assets -- --dir "<reel>" --apply
npm run check:visuals -- --dir "<reel>" --strict
npm run trim:pauses -- --dir "<reel>" --speed 1.10
npm run sync:sounds -- --dir "<reel>" --strict
npm run build:timeline -- --dir "<reel>" --strict
npm run finalize:reel -- --dir "<reel>" --strict
npm run validate:render -- --dir "<reel>"
npm run render:reel -- --dir "<reel>"
```

Motion/SFX-, Quellen-, Audio-Dateibindungs- und Endstille-Hard-Gates dürfen nicht mit `--force` umgangen werden.

## Tests

```bash
npm test
```

Tests/QC niemals als bestanden melden, wenn sie nicht tatsächlich ausgeführt wurden.
