# CURRENT WORKFLOW — VERBINDLICHE SINGLE SOURCE OF TRUTH

**Stand: 2026-09-11**

Diese Datei ist die verbindliche Repo-weite Produktionsregel für neue Chats, Codex, Antigravity und andere Repo-Agenten.

## Priorität

1. aktuelle ausdrückliche Nutzeranweisung
2. `CURRENT_WORKFLOW.md`
3. `AGENTS.md`
4. `CODEX_TASK.md`
5. `PRODUCTION_STATUS.md`
6. `docs/` und `knowledge/`
7. ältere Reel-Dateien

## Drei Produktionsphasen

1. **ChatGPT**: Reel anlegen, Script, Bildprompts, Motion-/SFX-Plan, Caption und Quellen fertigstellen.
2. **Arman**: Voice-over und Bilder erzeugen und im Reel-Ordner ablegen.
3. **Antigravity**: Assets zuordnen, Audio optimieren, echte Cue-Zeiten setzen, Motion/SFX binden, QC und Render.

Details: `WORKFLOW_PHASEN.md`.

## 0. Nutzerassets sind unveränderliche Originale

- Keine ZIP-, Bild-, Audio- oder Videodatei aus einem anderen Reel als Ersatz verwenden.
- Nutzerassets niemals zwischen Reels mit `mv` verschieben.
- Nutzerassets niemals per `rm`, `git clean`, `git checkout` oder ähnlichem löschen/zurücksetzen.
- Manuelle Übernahme nur als Kopie; vorhandene Ziele nicht still überschreiben.
- Bevorzugt:

```bash
npm run import:user-asset -- --dir "<reel>" --source "<datei>" --kind images|audio
```

## 1. Reel-Standard

- 55–60 Sekunden Voice-over, Ziel ca. 58 s
- 155–175 deutsche Wörter, Ziel ca. 165
- 8–10 narrative Szenen, Standard 9
- Hook ab Sekunde 0
- ein deutscher Erzähler
- letzte zwei Szenen: Erkenntnis-/Prüffrage → konkrete Lösung/Abschluss
- keine Untertitel, kein aktiver Word-Sync
- **es gibt keinen Untertitel- oder Word-Sync-Schritt** im aktiven Reel-Workflow
- `sync:words` gehört **nicht zum aktiven Workflow** und bleibt Legacy
- keine Hintergrundmusik
- Voice-over 1,10x, Pitch erhalten
- −16 LUFS, höchstens −1,5 dBTP
- harte Cuts, keine Crossfades
- nach dem gesprochenen Inhalt nur 0,5–0,7 s Schlussbild-Hold, Ziel 0,6 s

## 2. Voice-over und Endstille — Hard Gate

Der Vortrag soll natürlich und nicht TTS-flach klingen:
- Hook etwas energischer/neugieriger
- Schlüsselwörter leicht betonen
- keine künstlichen langen Mikropausen
- Erklärteile ruhig, Aha-Momente hörbar akzentuieren

Technische Reihenfolge:

```text
Originalaudio
→ Anfangs-/überlange Pausen straffen
→ Endstille entfernen
→ 1,10x bei erhaltener Tonhöhe
→ −16 LUFS / max. −1,5 dBTP
→ echte Dauer und Lautheit messen
```

Das finale Voice-over darf vor dem separaten Schlussbild-Hold höchstens **0,25 s messbare Endstille** enthalten. Mehrsekündige Endstille blockiert Finalizer und Renderer — auch mit `--force`.

## 3. Eine feste Reel-Bildwelt — Modern Countryball Explainer

Alle neuen Reels verwenden ausschließlich **Modern Countryball Explainer**:

```text
modern-countryball-explainer
```

Verbindlich:
- `knowledge/fixed-visual-world.md`
- `config/image-styles.json`
- `src/shared/fixed-visual-world.js`

YouTube bleibt vollständig getrennt (`youtube/YOUTUBE_WORKFLOW.md`, `youtube/YOUTUBE_VISUAL_WORLD.md`).

### Globaler World-Lock vor Bild 01

Bevor ein KI-Agent Bild 01 erzeugt, muss er die Bildwelt **einmal für das gesamte Reel festschreiben**. Danach ändern einzelne Bildprompts nur Motiv, Handlung, Perspektive und Umgebung — niemals die künstlerische Welt.

Konstant bleiben insbesondere:
- Konturstärke und Formsprache
- Farbcharakter und grafische Schatten
- Detailgrad und 2D-Rendering
- Tiefenlogik und Social-Media-Lesbarkeit
- Charakterlogik

Der Agent darf nicht für Medizin, Geschichte, Technik oder Alltag jeweils eine neue Unter-Bildwelt erfinden.

### Kugelfiguren sind optional und müssen eine Funktion haben

Wenn ein Akteur vorkommt, ist er eine klar runde Kugelfigur ohne separaten menschlichen Kopf. **Ein Akteur ist nicht in jedem Bild Pflicht.**

Neue Hard-Guidance:
- keine winzige dekorative Kugel nur als Stil-Sticker in Ecke oder Hintergrund
- Kugelfigur nur verwenden, wenn sie Handlung, Reaktion, Vergleich oder Perspektive wirklich verbessert
- bei Anatomie, Mechanismen, Objekten, Karten oder physischen Prozessen das Fachmotiv allein zeigen, wenn es verständlicher ist
- Flaggen nur bei echter geografischer Relevanz; sonst neutrale einfarbige Kugeln
- keine zufälligen Zungen, Grimassen oder Gimmicks ohne inhaltlichen Grund
- wenn eine Kugel vorkommt, muss sie groß genug und klar genug sein, um als bewusster Akteur zu lesen

### Bildwirkung

Jede Bildphase ist eine konkrete visuelle Mini-Szene, keine Lernposterkarte:
- sichtbare Handlung, Reaktion, Veränderung oder Ursache-Folge
- **ein Bild = eine klare gesprochene visuelle Kernaussage**
- ein dominantes Motiv, 1–3 unterstützende Elemente
- einfache Tiefe und Kontext, wenn sinnvoll
- klare Farbkontraste
- Perspektive zwischen benachbarten Bildern variieren
- Smartphone-first, in etwa einer Sekunde erfassbar

Nicht als Standard:
- große Headline + einzelnes Symbol auf leerem Hintergrund
- textdominante Poster
- wiederholte zentrierte Figur-plus-Icons-Komposition
- Floating Cards/UI-Boards
- Fotorealismus, Anime, Clay, glänzendes 3D/Pixar
- humanoide Cartoonmenschen oder Stick-Figuren

## 4. Bildtext

- Prompts: Englisch
- sichtbarer Text: ausschließlich Deutsch
- Bild 01/Cover: starke Headline Pflicht
- spätere Bilder: Text optional
- wenn Nicht-Cover-Text: maximal 4 Wörter
- ungefähr 35–60 % der Nicht-Cover-Bilder dürfen Text tragen
- ein textfreies starkes Bild ist ausdrücklich erwünscht
- `imageText` leer → kein lesbarer Text

## 5. Bildanzahl — Adaptive Dense V2 ab 2026-09-11

Für **neu geplante Reels** gilt nicht mehr die starre 17-Bilder-Formel. Neue Phase-1-Pakete tragen:

```text
imageCountMode: adaptive-dense-v2
visualDensityVersion: 2
```

Zielkorridor:

```text
8 Szenen  → 19–21 Bilder
9 Szenen  → 20–22 Bilder
10 Szenen → 21–24 Bilder
```

Regeln:
- Hook standardmäßig **2 Bildphasen** statt eines langen Standbilds
- jede weitere Szene **2 oder 3 Bildphasen**, abhängig vom gesprochenen Inhalt
- dritte Bildphase nur, wenn innerhalb der Szene ein echter neuer visueller Gedanke beginnt
- komplexe Ursache→Wirkung-, Anatomie-, Technik-, Studien- oder Vergleichsabschnitte bevorzugt splitten
- einfache Aussagen nicht künstlich aufblasen
- **1 Bild = 1 klare gesprochene Kernaussage**
- jede zusätzliche Bildphase braucht ein eigenes `audioCue` aus tatsächlich gesprochenen Wörtern
- `startPercent` ist nur Planungswert; nach dem echten Voice-over entscheidet das reale Cue-Timing
- Bildwechsel dürfen nicht in gleichmäßige starre Sekundenblöcke gepresst werden

Timing-Richtwerte für V2:
- harte technische Untergrenze: ca. **2,2 s** pro Bildphase
- häufig guter Bereich: **2,5–3,8 s**
- ab ungefähr **4,8 s** aktiv prüfen, ob der gesprochene Inhalt sinnvoll auf einen zusätzlichen Bildmoment geteilt werden sollte
- kein pauschales Maximaltempo: Inhalt und Audio entscheiden; weder hektisch noch unnötig statisch

Legacy-Reels mit `one-hook-two-standard` bleiben unverändert und dürfen weiter mit ihrer alten Struktur gerendert werden. Das aktuelle bzw. bereits produzierte Reel wird durch diese Regel nicht umgebaut.

## 6. Schnitt-Timing

- Szenencut ca. **0,10 s vor dem Szenen-Cue**
- interner Bildcut ca. **0,08 s vor dem Bild-Cue**
- bei 30 fps ca. 2–3 Frames vor dem Schlüsselwort
- harter Cut
- Mindestdauer der Bildphase hat Vorrang

Ziel: Das neue Bild ist bereits sichtbar, wenn das Cue-Wort fällt.

## 7. Bewegung/Zoom — ab 2026-09-02 Hard Gate

**Jeder einzelne Bildmoment muss sichtbar, aber dezent bewegt sein. Kein längerer statischer Stillframe.**

Erlaubte kanonische Typen:
- `ken-burns`
- `subtle-push-in`
- `subtle-pull-out`
- `slow-zoom-in`
- `slow-zoom-out`
- `pan-left`, `pan-right`, `pan-up`, `pan-down`

Bekannte beschreibende Aliase wie `gentle-pan` werden kanonisch aufgelöst, damit sie nicht versehentlich statisch werden. Wirklich unbekannte Motion-Typen blockieren den Workflow.

Richtwerte:
- Zoomänderung meist 2–4 %
- Pan meist 1–3 %
- weiches `ease-in-out`
- Hook bewegt sich ebenfalls dezent
- **jede interne Bildphase** bewegt sich ebenfalls
- `none` ist für neue Reels nicht zulässig; nur Legacy-Kompatibilität

Der Renderer besitzt zusätzlich einen Motion-Fallback, damit ein unvollständiger Plan nicht still als Standbild gerendert wird. Der Hard Gate bleibt trotzdem verpflichtend.

## 8. Sounddesign — ab 2026-09-02 Hard Gate

**Kein visueller Informationswechsel darf stumm durchrutschen.**

Pflicht:
- jeder Szenenwechsel nach der Hook: ein kurzer SFX
- jeder interne Bildwechsel: ein eigener kurzer SFX oder passender Objekt-Sound
- SFX beginnt ca. **0,04 s vor dem sichtbaren Cut**
- Stimme bleibt dominant
- typische Lautstärke 0,18–0,30, Standard ca. 0,22
- `visualEvent` und `reason` sind Pflicht
- interne SFX werden über `targetId` an die **konkrete interne Bildphase** gebunden — auch an eine dritte Phase
- `audioCue` des internen SFX muss zum Bildphasen-Cue passen

Der Agent verwendet **nur `type` aus `config/sound-library.json`**, niemals erfundene Dateinamen. `sync:sounds` löst Typ → Datei auf und kopiert die Datei in den Reel-Ordner.

Bevorzugte Typen:
- Übergang: `soft-whoosh`, `soft-swipe`, `whoosh-up`, `whoosh-down`
- kleiner Informationswechsel: `click`, `pop`, `tick`
- inhaltlich passend: `soft-impact`, `paper`, `door`, `coin`, `water-drop`
- Aha-Moment: `swoosh-reveal` höchstens einmal

Der Renderer kann einen bekannten Typ notfalls erneut auf die kanonische Datei auflösen, falls ein Zwischenplan das `file`-Feld verliert. Unbekannte Typen und fehlende Library-Dateien blockieren vor Render.

## 9. Hard-Gates müssen auf jedem Einstiegspfad gelten

Für neue Reels werden Bilddichte, Motion/SFX und Endstille nicht nur dokumentiert, sondern technisch geprüft:

- `check:content --strict`: Bildstruktur + Motion-/SFX-Coverage
- `build:timeline --strict`: Motion-/SFX-Coverage + Soundbibliothek
- `finalize:reel`: Motion-/SFX-Coverage + Soundbibliothek + Audio-Endstille
- `validate:render` / `render:reel`: dieselben Gates erneut
- `finalizeReel()` und `renderReel()` Core-Pfade: dieselben Gates erneut

`--force` darf Quellen-, Motion/SFX-, Audio-Dateibindungs- oder Endstille-Gates nicht umgehen.

## 10. Google Flow / KI-Agent

Einzige verbindliche Nutzerdatei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

**Vor Bild 01 muss der Agent zuerst den globalen World-Lock aus dieser Datei lesen und für das komplette Projekt beibehalten.** Er darf den Stil nicht bei jedem Einzelprompt neu interpretieren.

Flow arbeitet streng seriell:

```text
Globalen World-Lock einmal festsetzen
→ aktuellen Bildabschnitt verwenden
→ genau 1 Bild erzeugen
→ vollständig warten
→ Inhalt + feste Bildwelt + Anti-Poster-QC prüfen
→ Kugelfigur nur akzeptieren, wenn sie eine echte Funktion hat
→ exakt Bild NN.png benennen
→ in gemeinsamen Reel-Ausgabeordner legen
→ Ablage prüfen
→ erst dann nächstes Bild
```

Keine Queue, kein Batch, keine Parallelgenerierung, keine Mehrfachvarianten.

## 11. Quellen-QC

Neue Reels:
- mindestens zwei echte HTTPS-Quellen
- unterschiedliche Hosts
- mindestens eine Primär-/offizielle oder wissenschaftliche Originalquelle
- mindestens eine unabhängige Sekundär-/Fachquelle
- konkret dokumentieren, welche Reel-Aussage belegt wird

## 12. Phase-3-Reihenfolge

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

Nicht ausgeführte Tests/QC-Schritte niemals als bestanden melden.

## 13. Sichtbarer finaler Export

```text
03-export/
├── FERTIGES-REEL.mp4
└── UNIVERSELLE-CAPTION.txt
```

Universal-Caption:
- 60–130 Wörter
- klarer Einstieg
- 3–6 passende Hashtags
- plattformneutral

## 14. Definition of Done

Ein Reel ist erst fertig, wenn:
- Script und Quellen geprüft sind
- bei V2 die adaptive Bilddichte zum Inhalt passt und der Zielkorridor erreicht ist
- alle Bildphasen vorhanden und visuell geprüft sind
- feste Bildwelt eingehalten ist
- unnötige/dekorative Mini-Kugelfiguren entfernt sind
- **jede Bildphase sichtbar bewegt wird**
- **jeder Szenen- und interne Bildwechsel einen gerenderten SFX besitzt**
- finales Voice-over 1,10x / −16 LUFS / max. −1,5 dBTP geprüft ist
- **Endstille im Voice-over höchstens 0,25 s** beträgt
- finale Cue-Zeiten gesetzt sind
- nach Sprecherende nur 0,5–0,7 s Schlussbild-Hold folgt
- Finalizer und Renderer-Validierung tatsächlich bestanden sind
- MP4 und Caption unter `03-export/` existieren