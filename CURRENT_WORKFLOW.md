# CURRENT WORKFLOW — VERBINDLICHE SINGLE SOURCE OF TRUTH

**Stand: 2026-09-12**

Diese Datei ist die verbindliche Repo-weite Produktionsregel für neue Reels. YouTube besitzt einen eigenen separaten Workflow.

## Priorität

1. aktuelle ausdrückliche Nutzeranweisung
2. `CURRENT_WORKFLOW.md`
3. `WORKFLOW_PHASEN.md`
4. `AGENTS.md`
5. spezialisierte Policy-/Knowledge-Dateien
6. ältere Reel-Dateien

## Drei Phasen

1. **Phase 1 — ChatGPT:** Thema, Recherche, Script, Bildprompts, Bild↔Satz-Struktur, Motion/SFX, Caption und Quellen vorbereiten.
2. **Phase 2 — Arman:** echtes Voice-over und alle finalen Bilder erzeugen.
3. **Phase 3 — Antigravity:** Assets automatisch routen, einmal schnell prüfen, Audio optimieren, Bild↔Audio ausrichten, SFX/Timeline bauen und rendern.

Details: `WORKFLOW_PHASEN.md`.

## Nutzerassets — unveränderliche Originale

- keine Assets aus einem anderen Reel als Ersatz verwenden
- Nutzerassets niemals zwischen Reels mit `mv` verschieben
- Nutzerassets niemals mit `rm -rf`, `git checkout`, `git clean` oder ähnlichen Befehlen löschen/zurücksetzen
- vorhandene Nutzerdateien nicht still überschreiben
- bei manueller Übernahme bevorzugt:

```bash
npm run import:user-asset -- --dir "<reel>" --source "<datei>" --kind images|audio
```

## Themenfokus

Für autonome neue Reel-Themen gilt `config/reel-topic-focus.json` als Hard Gate.

Kern:
- Politik und Staatssysteme
- Geschichte
- Länder, Geografie, Grenzen und Territorien
- Ideologien und Gesellschaftssysteme
- internationale Beziehungen / Geopolitik
- angrenzende Kultur-/Wirtschaftsthemen nur bei natürlichem Länder-, Geschichts- oder Systembezug

Gesundheit, Medizin, Psychologie, allgemeine Alltags-Warum-Fragen, Lifestyle usw. sind autonom pausiert. Der Nutzer kann sie ausdrücklich wieder anfordern.

Vor jeder Themenwahl `THEMEN_HISTORIE.md` prüfen. Keine doppelte Kernfrage in neuer Formulierung.

## Reel-Standard

- 55–60 Sekunden Voice-over, Ziel ca. 58 s
- 155–175 deutsche Wörter, Ziel ca. 165
- 8–10 narrative Szenen, Standard 9
- Hook sofort, kein langer Intro-Block
- keine Untertitel, kein aktiver Word-Sync
- **Für neue Reels gibt es keinen Untertitel- oder Word-Sync-Schritt.**
- `sync:words` bleibt Legacy und gehört nicht in den normalen Workflow
- keine Hintergrundmusik
- Voice-over 1,10x bei erhaltener Tonhöhe
- −16 LUFS, höchstens −1,5 dBTP
- harte Cuts, keine Crossfades
- nach dem letzten gesprochenen Wort 0,5–0,7 s Schlussbild-Hold, Ziel 0,6 s

## Feste Reel-Bildwelt

Alle neuen Reels verwenden ausschließlich:

```text
serious-minimal-countryball-explainer
```

Name: **Serious Minimal Countryball Explainer**.

Verbindlich:
- 9:16, Smartphone-first
- flache seriöse 2D-Illustration
- dicke saubere schwarze Konturen
- perfekt runde Countryball-artige Figuren, wenn ein Akteur gebraucht wird
- keine normalen illustrierten Menschen oder Stick-Figuren
- Flaggen nur bei tatsächlicher Länder-/Regionsrelevanz
- 0–3 passende Zusatzobjekte statt dekorativem Füllmaterial
- drei Kompositionsmodi: `minimal-symbolic`, `supported-explainer`, `simple-mini-scene`
- einfache einfarbige/gedämpfte Hintergründe, optional leichte Textur/Gradient
- keine realistischen Räume, Hände/Haut, Foto-, Anime-, Clay-, 3D-/Pixar-Welt
- kein zufälliger Mini-Countryball im Hintergrund
- Bild 01 mit starker deutscher Headline
- spätere Bilder: deutscher Text optional, max. 4 Wörter
- Prompts Englisch, sichtbarer Text ausschließlich Deutsch

Vor Bild 01 gilt ein globaler World-Lock für das ganze Reel. Einzelprompts ändern Motiv, Requisiten, Hintergrundfarbe und Perspektive, aber nicht die künstlerische Welt.

Vollständige Style-Bibel: `knowledge/fixed-visual-world.md`.

**YouTube bleibt vollständig getrennt** und behält seine eigene 16:9-Langvideo-Bildwelt.

## Adaptive Dense V2 — Bildanzahl

Für neu geplante Reels:

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
- Hook normalerweise 2 Bildmomente
- jede weitere Szene 2 oder 3 Bildmomente nach tatsächlichem Inhalt
- **1 Bild = 1 klare gesprochene visuelle Kernaussage**
- komplexe Ursache→Wirkung-, Vergleichs- oder Systemabschnitte bei echtem Gedankenwechsel splitten
- einfache Aussagen nicht künstlich aufblasen
- jede interne Bildphase besitzt ein eigenes tatsächlich gesprochenes `audioCue`
- `startPercent` ist nur Planung; finales Audio entscheidet
- technische Untergrenze ca. 2,2 s
- häufig guter Bereich 2,5–3,8 s
- ab ca. 4,8 s aktiv prüfen, ob ein sinnvoller zusätzlicher Bildmoment nötig ist

Legacy-Reels bleiben renderbar.

## Bild↔Audio-Struktur

Phase 1 erzeugt:

```text
99-technik/BILD_AUDIO_ZUORDNUNG.json
```

Für jeden Bildmoment ist bereits festgelegt, welcher gesprochene Satz-/Teilbereich dazugehört. Phase 3 darf diese Reihenfolge nicht neu erfinden. Echte Sekundenwerte werden aus dem finalen Voice-over automatisch abgeleitet.

Timing-Richtwerte:
- Szenencut ca. 0,10 s vor Szenen-Cue
- interner Bildcut ca. 0,08 s vor Bild-Cue
- SFX ca. 0,04 s vor sichtbarem Cut

## Motion

Jeder Bildmoment bekommt sichtbare, dezente Bewegung. Zulässig sind u. a.:
- `ken-burns`
- `subtle-push-in`, `subtle-pull-out`
- `slow-zoom-in`, `slow-zoom-out`
- `pan-left/right/up/down`

Zoom meist 2–4 %, Pan 1–3 %, weiches Easing. Neue Reels dürfen keine längeren statischen Stillframes enthalten.

## Sounddesign

- jeder Szenenwechsel ab Szene 2: kurzer SFX
- jeder interne Bildwechsel: eigener SFX/Objekt-Sound
- interne Sounds über `targetId` an die konkrete Bildphase binden
- typische Lautstärke 0,18–0,30, Standard ca. 0,22
- ausschließlich Soundtypen aus `config/sound-library.json`
- Stimme bleibt dominant

## Google Flow

Einzige verbindliche Masterdatei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Ausführung streng seriell:

```text
World-Lock lesen
→ genau 1 Bild erzeugen
→ vollständig warten
→ Inhalt + Bildwelt prüfen
→ exakt Bild NN.png benennen
→ in 00-bildprompts/00-ALLE-BILDER-HIER-REIN/ ablegen
→ erst dann nächstes Bild
```

Keine Queue, kein Batch, keine parallele Bildgenerierung.

## Audio

Phase 2 legt genau ein aktuelles Voice-over unter `02-audio/AUDIO-HIER-EINFUEGEN/` ab.

Phase 3:

```text
Anfangs-/überlange Pausen straffen
→ Endstille entfernen
→ 1,10x bei erhaltener Tonhöhe
→ −16 LUFS / max. −1,5 dBTP
→ echte Dauer/Lautheit messen
```

Mehrsekündige Endstille blockiert den Render. Der separate 0,6-s-Schlussbild-Hold kommt erst in der Timeline.

## Phase 3 — Antigravity Simple Mode

**Normaler Einstieg ist genau ein Befehl:**

```bash
npm run phase3:reel -- --dir "<reel>"
```

Danach arbeitet Antigravity selbstständig bis zum Render:

```text
Assets finden
→ Bild 01..NN + Voice-over automatisch routen
→ Assets übernehmen
→ einmalige schnelle visuelle QC
→ Audio optimieren
→ Bild↔Audio automatisch aus Phase-1-Struktur ausrichten
→ SFX-Dateien binden
→ Timeline bauen
→ Finalizer
→ Render
```

Nicht mehr erforderlich:
- schriftliche Bildbeschreibung pro Bild
- Match-Begründung pro Bild
- zweite unabhängige Zuordnungsprüfung
- manuelle Bestätigung jedes Audio-Ankers
- Zwischenfreigabe nach jedem technischen Schritt

### Schnelle visuelle QC

Ein Durchgang prüft:
- Bild vorhanden und lesbar
- 9:16 / technisch brauchbar
- grob passend zum bereits zugeordneten Satz
- Serious-Minimal-Countryball-Welt eingehalten
- Pflichttext korrekt, falls vorgesehen

### Rückfragen nur bei Hard Blockern

Antigravity fragt nur, wenn ein Problem nicht sicher autonom lösbar ist, z. B.:
- Bild fehlt oder Nummer ist doppelt
- mehrere unklare Voice-over-Dateien
- Audio/Bild beschädigt
- offensichtlicher falscher Inhalt/Reihenfolge/Stilbruch
- notwendige SFX-Datei fehlt
- Render-/Toolfehler

Keine allgemeinen Freigabefragen.

Ergebnis:

```text
03-export/FERTIGES-REEL.mp4
03-export/UNIVERSELLE-CAPTION.txt
```

Details: `ANTIGRAVITY_IMAGE_POLICY.md`.

## Quellen

Neue Reels benötigen mindestens zwei echte HTTPS-Quellen auf verschiedenen Hosts, möglichst eine Primär-/offizielle oder wissenschaftliche Quelle plus eine unabhängige Sekundär-/Fachquelle.

## Hard Gates / Wahrheitspflicht

`check:content --strict`, Timeline/Finalizer/Renderer sowie Audio-/SFX-Gates bleiben technische Schutzschichten. `--force` darf echte Quellen-, Audio-, Motion-/SFX- oder Assetfehler nicht verdecken.

Nicht ausgeführte Tests oder QC-Stufen niemals als bestanden melden.
