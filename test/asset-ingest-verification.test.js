# CURRENT WORKFLOW — VERBINDLICHE SINGLE SOURCE OF TRUTH

**Stand: 2026-09-12**

Diese Datei ist die verbindliche Repo-weite Regel für neue Reels, Codex und Antigravity.

## Priorität

1. aktuelle ausdrückliche Nutzeranweisung
2. `CURRENT_WORKFLOW.md`
3. `AGENTS.md`
4. `WORKFLOW_PHASEN.md`
5. weitere Docs/Knowledge-Dateien

## Drei Phasen

1. **ChatGPT** — Thema, Recherche, Script, Bildprompts, Bild↔Audio-Zuordnung, Motion/SFX, Caption, Quellen.
2. **Arman** — echtes Voice-over und echte Bilder.
3. **Antigravity** — Assets automatisch zusammenführen, Audio optimieren, Timing bauen, Motion/SFX, Render und kurze finale QC.

Details: `WORKFLOW_PHASEN.md`.

## Nutzerassets sind unveränderliche Originale

- niemals Assets aus einem anderen Reel als Ersatz verwenden
- niemals Nutzeroriginale zwischen Reels mit `mv` verschieben
- niemals Nutzeroriginale mit `rm`, `rm -rf`, `git clean`, `git checkout` oder ähnlichen Befehlen löschen/zurücksetzen
- niemals still überschreiben
- manuelle Übernahme nur als sichere Kopie
- bevorzugt:

```bash
npm run import:user-asset -- --dir "<reel>" --source "<datei>" --kind images|audio
```

## Themenfokus für neue Reels

Vor jeder autonomen Themenwahl:

1. `THEMEN_HISTORIE.md` auf Duplikate prüfen
2. `REEL_THEMENFOKUS.md` / `config/reel-topic-focus.json` prüfen

Kanal-Kern:

> **Politik, Geschichte, Geografie und Systeme einfach erklärt.**

Bevorzugt: Staatssysteme, Ideologien, Länder/Grenzen/Territorien, historische Wendepunkte, internationale Beziehungen/Geopolitik sowie passende Kultur-/Wirtschaftssysteme.

Gesundheit, Medizin, Psychologie, Alltag, Lifestyle und ähnliche Off-Focus-Themen werden **nicht autonom gewählt**, außer der Nutzer verlangt ausdrücklich ein konkretes Thema daraus.

Politische Inhalte sachlich, neutral und ohne Parteienwerbung/Wahlempfehlung erklären.

## Reel-Standard

- 55–60 s Voice-over, Ziel ca. 58 s
- 155–175 deutsche Wörter, Ziel ca. 165
- 8–10 narrative Szenen, Standard 9
- ein deutscher Erzähler
- keine Untertitel / kein aktiver Word-Sync
- keine Hintergrundmusik
- Voice-over 1,10x, Pitch erhalten
- −16 LUFS, max. −1,5 dBTP
- harte Cuts, keine Crossfades
- Voice-over-Endstille höchstens 0,25 s
- danach nur 0,5–0,7 s Schlussbild-Hold, Ziel 0,6 s

## Feste Reel-Bildwelt

Alle neuen Reels verwenden ausschließlich:

```text
serious-minimal-countryball-explainer
```

**Serious Minimal Countryball Explainer**, 9:16. YouTube bleibt vollständig getrennt.

Verbindlich:
- dicke saubere schwarze Konturen
- flache kontrollierte 2D-Farben, minimale grafische Schatten
- perfekt runde Countryball-artige Akteure, wenn ein Akteur sinnvoll ist
- einfache weiße Augen, seriöse reduzierte Mimik
- Flaggen/Karten/Institutionen natürlich einsetzen, wenn Politik/Geografie/Geschichte es verlangt
- 0–3 sinnvolle Zusatzobjekte
- drei Kompositionsmodi mischen: `minimal-symbolic`, `supported-explainer`, `simple-mini-scene`
- nicht jedes Bild nur Kugel + leerer Hintergrund
- keine normalen illustrierten Menschen, realistischen Räume/Hände/Haut, Foto-, Anime-, Clay- oder 3D/Pixar-Welt
- Prompts Englisch, sichtbarer Text ausschließlich Deutsch
- Bild 01 starke Headline; späterer Text optional und max. 4 Wörter

Vor Bild 01 wird der World-Lock einmal gesetzt und danach nicht neu interpretiert.

## Adaptive Dense V2 — Bildanzahl

Neue Phase-1-Pakete:

```text
imageCountMode: adaptive-dense-v2
visualDensityVersion: 2
```

Ziel:

```text
8 Szenen  → 19–21 Bilder
9 Szenen  → 20–22 Bilder
10 Szenen → 21–24 Bilder
```

Regeln:
- Hook standardmäßig 2 Bildmomente
- weitere Szenen 2 oder 3 je nach tatsächlichem gesprochenem Gedanken
- 1 Bild = 1 klare gesprochene visuelle Kernaussage
- jede interne Phase hat eigenes gesprochenes `audioCue`
- technische Untergrenze ca. 2,2 s
- häufig gut 2,5–3,8 s
- ab ca. 4,8 s aktiv Split prüfen
- keine starren gleich langen Bildblöcke

Legacy-Reels bleiben renderbar.

## Google Flow

Einzige Nutzerdatei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Streng seriell:

```text
World-Lock lesen
→ genau 1 Bild erzeugen
→ warten
→ prüfen
→ Bild NN.png benennen
→ ablegen
→ erst dann nächstes Bild
```

Keine Queue, kein Batch, keine Parallelgenerierung.

## Motion und SFX

Jeder Bildmoment bewegt sich dezent. Erlaubt u. a. `ken-burns`, `subtle-push-in/out`, `slow-zoom-in/out`, `pan-*`.

- Zoom meist 2–4 %, Pan 1–3 %
- Szenencut ca. 0,10 s vor neuem Sprachbereich
- interner Cut ca. 0,08 s davor
- kurzer SFX ca. 0,04 s vor sichtbarem Cut
- jeder Szenen-/interne Bildwechsel bekommt einen passenden SFX
- nur Typen aus `config/sound-library.json`
- Stimme bleibt dominant

## Bild↔Audio-Zuordnung

Phase 1 erzeugt:

```text
99-technik/BILD_AUDIO_ZUORDNUNG.json
```

Sie legt für Bild 01→NN bereits chronologisch den exakten `spokenText`-Bereich fest. Phase 3 erfindet keine neue Reihenfolge.

Nach dem finalen Audio erzeugt:

```bash
npm run auto-align:reel -- --dir "<reel>"
```

eine automatische monotone Grundausrichtung aus finaler Audiodauer und den festgelegten Sprachbereichen. **Keine Einzel-Rückfragen zu jedem Anchor.** Im finalen Reel nur sichtbar schlechte Cuts selbst korrigieren. Blockieren nur bei echtem Script↔Audio-Konflikt.

## Phase 3 — Simple Mode

Normalerweise genau ein Befehl:

```bash
npm run phase3:reel -- --dir "<reel>"
```

Ablauf:

```text
Assets finden
→ nummerierte Bilder automatisch routen
→ schneller visueller Einmal-Check
→ Voice-over optimieren
→ Bild↔Audio automatisch grundausrichten
→ Timeline + Sounds
→ Finalizer
→ Render
→ finalen Export kurz ansehen
```

### Schnelle visuelle QC

Nicht mehr pro Bild:
- keine 12 Häkchen
- keine schriftliche Bildbeschreibung
- keine Match-Begründung
- kein zweiter Prüfpass

Nur prüfen:
- Bild vorhanden / lesbar / 9:16
- Nummer/Reihenfolge eindeutig
- kein offensichtlicher Inhaltsfehler
- kein offensichtlicher Bruch der festen Bildwelt
- Pflichttext korrekt, falls vorhanden

Nummerierte `Bild 01.png` → `Bild NN.png` sind nach vollständigem Import die chronologische Hauptautorität.

### Antigravity fragt nur bei echten Blockern

Nur stoppen, wenn z. B.:
- Reel-Ziel wirklich unklar
- Audio oder Pflichtbild fehlt/beschädigt
- Bildnummern doppelt/mehrdeutig und nicht sicher lösbar
- Voice-over lässt ganze Scriptteile aus oder stellt sie stark um
- Nutzeroriginal müsste destruktiv verändert werden
- ein technischer Hard Gate bleibt nach automatischer Reparatur bestehen
- externe kostenpflichtige/irreversible Aktion wäre nötig

Kleine Style-Abweichungen, ein nicht wortgenau gefundener Anchor oder neu berechenbare Timeline/SFX sind **keine** Gründe für eine Nutzerfrage.

## Quellen

Mindestens zwei echte HTTPS-Quellen auf unterschiedlichen Hosts, davon möglichst eine Primär-/offizielle/wissenschaftliche Quelle plus unabhängige Sekundär-/Fachquelle. Konkrete Belegzuordnung dokumentieren.

## Definition of Done

Fertig erst wenn:
- Script/Quellen geprüft
- alle erwarteten Bilder und echtes Audio vorhanden
- Bildwelt grob konsistent und keine echten visuellen Hard Fails
- Motion/SFX-Coverage vollständig
- Audio 1,10x / −16 LUFS / max. −1,5 dBTP / Endstille ≤0,25 s
- Bildreihenfolge und Audio-Timing im finalen Reel plausibel
- kein schwarzer/langer stiller Nachlauf
- `03-export/FERTIGES-REEL.mp4` und Caption existieren

Nicht ausgeführte Tests/QC niemals als bestanden melden.
