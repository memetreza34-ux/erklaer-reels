# Codex-Hauptauftrag

`CURRENT_WORKFLOW.md` ist bei Widersprüchen maßgeblich.

Dieses Repository produziert vollständige visuelle Erklär-Reels. Der Nutzer erzeugt Voice-over und Bilder extern. Codex übernimmt Planung, individuelle Bilddichte, Prompts, Asset-Suche, QC, Audio-Pacing, sichere Bildzuordnung, Timeline und Remotion-Render.

## Reel-Standard

- 55–60 Sekunden Voice-over
- 155–175 deutsche Wörter
- 12–14 **narrative Szenen**, Standard 13
- genau ein deutscher Erzähler
- Voice-over exakt 1,10x
- −16 LUFS, max. −1,5 dBTP
- keine Untertitel
- harte Schnitte
- 0,7 Sekunden Schlussbild-Nachlauf

## Bildanzahl: immer individuell

Die Anzahl der Bilder ist **nicht** mehr an die Szenenzahl gekoppelt.

Für jede narrative Szene separat entscheiden:
- 1 Bild, wenn ein starkes Motiv reicht
- 2 Bilder bei echtem Mehrwert durch Überblick/Detail, Karte/Zoom, Ursache/Folge, Gesicht/Gedanke oder Metapher/Auflösung
- 3 Bilder nur selten

Wenn ein einzelnes Still-Bild ungefähr 3,5–4 Sekunden oder länger stehen würde, eine zweite Bildphase aktiv prüfen. Keine Bildphase nur zur Erfüllung einer Quote hinzufügen.

Pflichtfelder:

```text
reel.json.imageCountMode = individual-per-reel
reel.json.plannedImageCount = tatsächliche Bildsumme
scene.imageCount = 1..3
scene.imagePhases[]
```

Erste Phase: `image-prompt.txt`.
Zusätzliche Phasen: `image-prompt-02.txt`, `image-prompt-03.txt`.

`startPercent` bestimmt den internen Bildwechsel innerhalb der bestätigten narrativen Szenendauer.

## Neues Reel

```bash
npm run create:reel -- \
  --title "TITEL" \
  --script-file input/script.txt \
  --next-free \
  --scenes 13
```

Danach `production/agent-task.md` vollständig bearbeiten. Besonders die Aufgabe `image-density-plan` ist verpflichtend.

```bash
npm run export:prompts -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

## Google Flow

`Bild 00` = Cover + Style-Master.

Danach folgen alle Bildphasen in globaler Reihenfolge. Die Bildnummer ist nicht automatisch die Szenennummer.

Beispiel:

```text
Bild 01 = Szene 1 / Phase 1
Bild 02 = Szene 2 / Phase 1
Bild 03 = Szene 2 / Phase 2
Bild 04 = Szene 3 / Phase 1
```

Flow arbeitet streng seriell: ein Bild → vollständig warten → umbenennen → prüfen → automatisch nächstes Bild. Keine Queue, kein Batch, kein Parallelisieren und kein weiteres `Go`.

## Bildwelten

- `human-editorial-cartoon`: Köpfe-Welt, große Gesichter, Close-ups, wenig Körper
- `round-country-characters`: Länder-Welt, Karten/Zooms/Vergleiche; oft besonders geeignet für zusätzliche Bildphasen
- `visual-metaphor`: starke zentrale Metapher; Zusatzbild nur für echten zweiten Erklärungsschritt

Keine feste Bildsumme pro Bildwelt erzwingen.

## Fehlende Assets

```bash
npm run discover:assets -- --dir "PFAD-ZUM-REEL"
```

Die Discovery erwartet automatisch `Bild 00` bis zur letzten **geplanten Bildphase**.

Vor `--apply` jede Bildphase sichtbar prüfen. Dateinummern sind nur Routing-Hilfe.

## Audio und Timeline

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

Narrative Szenen werden mit echten akustisch bestätigten Audio-Cues synchronisiert. Zusätzliche Bildphasen werden innerhalb der Szene anhand `startPercent` als harte Schnitte verteilt.

Keine geschätzten Szenenanker. Keine Untertitel und kein `sync:words`.

## Visuelle Prüfung und Render

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL" --apply
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:render -- --dir "PFAD-ZUM-REEL"
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Jede einzelne Bildphase muss die visuelle Zwei-Pass-QC bestehen. Die letzte Bildphase bleibt nach dem letzten gesprochenen Wort 0,7 Sekunden stehen.

Keine geplante Stufe als abgeschlossen bezeichnen und keine nicht ausgeführten Tests als bestanden melden.
