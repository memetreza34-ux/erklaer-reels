# Interner YouTube-Produktionsplan — V2

**Für neue Projekte mit `productionRulesVersion >= 2`.**

Verbindlich zusätzlich lesen: `youtube/ADAPTIVE_PACING_V2.md`.

## Thema + Duplicate-Prüfung

- Arbeitstitel:
- Kernfrage:
- `THEMEN_HISTORIE.md` geprüft: ja/nein
- Thema reserviert: ja/nein
- Zielgruppe:
- Nutzen/Aha-Punkt:
- Hook/Ansatz:

## Mindeststandard

- mindestens 10 Minuten finales Voice-over
- Ziel normalerweise 10–12 Minuten
- Bildanzahl **adaptiv nach Scriptbedarf**, ungefähr 50–90 nur als Orientierung
- kein fixes Ziel wie „immer 60 Bilder“
- jedes Bild im Edit subtil bewegen
- 16:9
- feste Bildwelt `youtube-editorial-stick-explainer`

## Recherche

Für jede wichtige Aussage Quelle, Datum und kurze Begründung dokumentieren. Unsicherheiten klar markieren. Mindestens eine hochwertige Primär-/offizielle/Fachquelle verwenden.

## Titel

- finaler Upload-Titel:
- warum klickbar, aber sachlich korrekt:
- Zusammenspiel mit Thumbnail:

## Thumbnail

- Bild 00 = ausschließlich Thumbnail
- Thumbnail-Text:
- Hauptmotiv:
- Kontrastidee:
- fertiger Prompt unter `00-bildprompts/00_thumbnail/`
- fertiges `Bild 00.png` erst als vorhanden markieren, wenn wirklich erzeugt

## Script-Planung

- Outline:
- Dramaturgie:
- Schluss/Auflösung:
- Wortzahl:
- erwartete Sprechdauer:

### Adaptive Bildplanung

Script zuerst in echte visuelle Gedanken zerlegen. **1 Bild = 1 klarer visueller Zweck.**

Neues Bild einplanen bei:
- neuem Kerngedanken
- neuem Beispiel
- Ursache→Folge-Wechsel
- neuer Epoche / neuem Ort / neuer Perspektive
- Vergleich oder Reveal
- Abschnitt wäre sonst zu lang oder müsste mehrere Erklärjobs gleichzeitig tragen

Die Bildanzahl ergibt sich erst danach.

### Pacing-Ziel

- 5–12 s normal
- 12–14 s bei ruhigem/einfachem Moment okay
- ab 14 s Split prüfen
- ab 16 s starke Split-Prüfung
- **20,0 s oder länger verboten**
- unter 4 s auf unnötige Hektik prüfen

Nicht alle Bilder künstlich gleich lang machen.

## Script-Parts passend zu 10er-Bildpaketen

Neben `voice-script.txt` muss Phase 1 einzelne Script-Parts erstellen:

```text
01-voice-script/
├── voice-script.txt
├── 01_part-bilder-01-bis-10.txt
├── 02_part-bilder-11-bis-20.txt
├── 03_part-bilder-21-bis-30.txt
└── ...
```

Regeln:
- jeder Part gehört genau zu seinem Bildpaket
- keine Textlücke
- keine Textüberlappung
- Part-Grenze an natürlicher Satz-/Gedankengrenze
- letzter Part darf weniger als 10 Bilder abdecken
- Master-Script = chronologische Zusammensetzung aller Parts

## Bildplanung / Google Flow

Masterdatei: `00-bildprompts/99-alle-bildprompts.txt`.

10er-Pakete sind nur Produktionsstruktur:

```text
Bild 01–10 → vollständig erzeugen/prüfen/benennen/ablegen
Bild 11–20 → erst danach
...
```

Die Gesamtbildzahl wird nicht auf eine durch zehn teilbare Zahl erzwungen.

## Audio — Nutzer darf in Parts arbeiten

Passend zu jedem Script-Part wird ein Audio-Part erzeugt:

```text
02-audio/
├── 01_part-bilder-01-bis-10.<audio>
├── 02_part-bilder-11-bis-20.<audio>
├── 03_part-bilder-21-bis-30.<audio>
└── ...
```

Eine einzige lange Nutzer-Audiodatei ist **nicht erforderlich**.

## Bild↔Script↔Audio-Mapping

`99-technik/BILD_AUDIO_ZUORDNUNG.json` muss pro Bild zusätzlich enthalten:
- `audioPartId`
- `scriptPartFile`
- `audioPartFile`
- `startAnchor`
- `endAnchor`
- später echte lokale/globale Audiozeiten

Damit ist eindeutig, welches Bild zu welchem gesprochenen Abschnitt und Audio-Part gehört.

## Phase 3 — Antigravity

Antigravity:
1. prüft alle Bild- und Audio-Parts
2. analysiert jeden Audio-Part gegen den passenden Script-Part
3. entfernt überlange Randstille
4. misst Bild-Anker innerhalb des richtigen Audio-Parts
5. setzt die Parts chronologisch zu einer Master-Timeline zusammen
6. lässt keine ungeplante Part-Grenzen-Stille über 0,25 s zu
7. baut `FINAL_TIMELINE.json` ausschließlich aus echten Audio-Ankern
8. prüft adaptive Bilddauern
9. rendert erst nach bestandenem Hard-Gate

## Adaptive Pacing QC

Vor Render für V2 zwingend:

```bash
npm run validate:youtube-pacing-v2 -- --dir "youtube/<woche>/<thema>"
```

Nur Exit-Code 0 erlaubt bei V2 den Render.

Zusätzlich bleiben die normalen YouTube-Gates Pflicht:

```bash
npm run validate:youtube-phase3 -- --dir "youtube/<woche>/<thema>"
npm run validate:youtube-render -- --dir "youtube/<woche>/<thema>"
```

## Edit

- Motion/Zoom auf jedem Bild
- keine hektischen Reel-Zooms
- keine langen statischen Slides
- keine starre Slideshow mit identischen Bilddauern
- Kapitelwechsel-SFX gezielt
- Objekt-/Informations-SFX gezielt
- Hintergrundmusik standardmäßig aus
- Voice-over bleibt dominant

## Assets

Nur tatsächlich verwendete Bilder, Grafiken und Audios dokumentieren. Fehlende Assets nicht als vorhanden markieren.

## Upload

Der Upload verwendet ausschließlich die finalen Dateien aus `03-export/`: YouTube-Titel, Beschreibung, Kapitel, optionale Tags, Thumbnail und Video.
