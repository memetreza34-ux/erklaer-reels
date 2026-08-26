# Erklär-Reels

Produktionspipeline für visuelle Erklär-Reels mit **offenem Themenuniversum und aktuell bewusst nicht festgelegter Bildwelt**.

Themen können unter anderem aus Alltag, Psychologie, Verhalten, Beziehungen, Gesellschaft, Kultur, Wissenschaft, Technik, Internet, Lernen, Arbeit, Wirtschaft, Gesundheit, Ernährung, Sprache, Geschichte, Politik, Ländern, Geografie, Mythen und kuriosen Warum-Fragen kommen.

## Verbindliche Regeln

**`CURRENT_WORKFLOW.md` ist die Single Source of Truth.**

## Produktionsstandard

- 55–60 Sekunden Voice-over
- 155–175 deutsche Wörter
- 12–14 **narrative Szenen**, Standard 13
- genau ein klarer Erklärschritt pro narrativer Szene
- **aktuell keine feste Bildwelt**
- die Themenwahl ist offen und wird nicht durch alte Pillars begrenzt
- **Bildanzahl individuell pro Reel**
- pro narrativer Szene 1, 2 oder selten 3 Bildphasen
- keine starre Gleichsetzung `13 Szenen = 13 Bilder`
- Voice-over exakt 1,10x mit erhaltener Tonhöhe
- −16 LUFS, höchstens −1,5 dBTP
- keine Untertitel
- kein aktiver Word-Sync-Workflow
- ausschließlich harte Schnitte
- keine Hintergrundmusik
- Schlussbild 0,7 Sekunden nach dem letzten gesprochenen Wort halten

## Bildwelt — zurückgesetzt

Seit 2026-08-26 ist die frühere feste Bildwelt vollständig aus dem aktiven Workflow entfernt.

Für neue Reels gilt:

```text
visualStyleId = null
visualStyleReason = ""
```

Aktuell **nicht** automatisch verwenden:

- `round-country-characters`
- Countryball-/Kugel-Geometrie
- Golden References aus alten Länder-Reels
- `human-editorial-cartoon`
- `visual-metaphor`
- feste Augen-/Mund-/Körperregeln
- feste Farbpalette
- Papiertextur
- alter Premium-Editorial-Look
- alte Reel-Prompts als Stilvorlage

Historische Reels bleiben als Archiv erhalten, definieren aber keine neue Produktion mehr.

Eine neue feste Bildwelt wird erst eingeführt, wenn der Nutzer sie ausdrücklich festlegt.

`Bild 00` ist momentan nur das Cover und **nicht automatisch ein Style-Master**.

## Themenwahl

Bei autonomen neuen Reels gibt es keine feste Themenquote und keine starre Rotation.

Gute Themen erfüllen möglichst viele dieser Punkte:
- starker Hook in der ersten Sekunde
- klarer Aha-Moment
- faktisch sauber erklärbar
- visuell klar umsetzbar
- abwechslungsreich gegenüber den letzten Reels
- teilbar, überraschend oder alltagsrelevant

## Individuelle Bilddichte

Für jede Szene wird separat entschieden, wie viele Bilder wirklich sinnvoll sind.

- **1 Bild:** starkes Motiv trägt den ganzen Gedanken
- **2 Bilder:** z. B. Überblick → Detail, Ursache → Folge oder Ausgangslage → Auflösung
- **3 Bilder:** nur selten bei echten dreistufigen Erklärungen

Wenn ein Still-Bild ungefähr 3,5–4 Sekunden oder länger stehen würde, wird eine zweite Bildphase aktiv geprüft. Sie wird nur hinzugefügt, wenn sie das Reel tatsächlich verbessert.

Technisch:

```text
reel.json.imageCountMode = individual-per-reel
reel.json.plannedImageCount = tatsächliche Bildsumme
scene.imageCount = 1..3
scene.imagePhases[]
```

Erste Phase einer Szene:

```text
image-prompt.txt
```

Zusätzliche Phasen:

```text
image-prompt-02.txt
image-prompt-03.txt
```

## Bildprompts

Jeder Bildprompt beschreibt aktuell ausschließlich die konkrete Szene. Der Repo-Workflow fügt keine feste Figurenform, Palette, Textur oder historische Stilreferenz hinzu.

Neutral verbindlich bleiben:

- 9:16
- konkrete Komposition und Handlung
- exakt erlaubter deutscher Bildtext, falls vorgesehen
- kein unerwarteter lesbarer Text
- keine Workflow-Labels im Bild
- volle Bildfläche ohne künstliche Untertitelzone

## Google Flow

Repo-Agenten erzeugen Script, Szenen, Bildphasen und Prompts, aber keine Reel-Bilder.

Die **verbindliche Nutzerdatei** für Google Flow ist:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Technische Spiegeldatei:

```text
all-image-prompts/all-image-prompts.txt
```

Flow arbeitet streng seriell:

```text
Bild erzeugen → vollständig warten → gegen aktuellen Prompt prüfen → umbenennen → nächstes Bild
```

Keine Queue, kein Batch und keine Parallelgenerierung.

Danach bezeichnet die Nummer die **globale Bildreihenfolge**. Sie entspricht bei mehreren Bildphasen nicht automatisch der Szenennummer.

## Quellen-QC

Neue Reels verwenden das aktuelle Quellen-Schema. Mindestens zwei nachvollziehbare Quellen mit unterschiedlichen Hosts sind Pflicht. Für neue Reels soll zusätzlich die Quellenrolle dokumentiert werden, sodass möglichst mindestens eine Primär-/offizielle bzw. wissenschaftliche Originalquelle und eine unabhängige Sekundärquelle vorhanden sind.

Die Quellen-QC ersetzt keine inhaltliche Prüfung: Die angegebenen Quellen müssen die verwendeten Aussagen tatsächlich belegen.

## Sichtbare Reel-Struktur

```text
reel-01_thema/
├── 00-bildprompts/
├── 01-voice-script/
├── 02-audio/
├── 03-caption/
├── 04-video/
└── 99-technik/
```

Finales Video:

```text
04-video/FERTIGES-VIDEO/
```

## Fehlende Assets suchen

Vor einer Meldung, dass Bilder oder Audio fehlen:

```bash
npm run discover:assets -- --dir "PFAD-ZUM-REEL"
```

Die Discovery richtet sich nach der individuell geplanten Bildzahl.

## Sichere Bildzuordnung

Dateinummern sind nur Routing-Hilfe. Jedes Bild wird gegen seine konkrete Bildphase geprüft und anschließend gegen vorherige und nächste Bildphase gegengeprüft. Unter 0,90 Konfidenz wird nicht geraten.

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL"
npm run organize:assets -- --dir "PFAD-ZUM-REEL" --apply
```

## Audio und Render

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:render -- --dir "PFAD-ZUM-REEL"
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Narrative Szenen werden mit dem finalen Voice-over synchronisiert. Zusätzliche Bildphasen wechseln innerhalb einer Szene anhand ihrer relativen `startPercent`-Positionen.

Keine geplante oder nicht ausgeführte Stufe als bestanden ausgeben.

## Legacy-Werkzeuge

Alte Word-Sync-/Subtitle-Helfer bleiben höchstens für historische Diagnosezwecke erhalten und gehören **nicht** in den aktiven Produktionsworkflow. Siehe `LEGACY_TOOLS.md`.

## Voraussetzungen

- Node.js 20 oder neuer
- FFmpeg und optional `ffprobe`
- Remotion-Pakete in identischer Version
