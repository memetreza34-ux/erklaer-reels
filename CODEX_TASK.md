# Codex-Hauptauftrag

`CURRENT_WORKFLOW.md` ist bei Widersprüchen maßgeblich.

Dieses Repository produziert vollständige visuelle Erklär-Reels. Der Nutzer erzeugt Voice-over und Bilder extern. Codex übernimmt Planung, individuelle Bilddichte, Prompts, Quellen, Asset-Suche, QC, Audio-Pacing, sichere Bildzuordnung, Timeline und Remotion-Render.

## Reel-Standard

- 55–60 Sekunden Voice-over
- 155–175 deutsche Wörter
- 12–14 **narrative Szenen**, Standard 13
- genau ein deutscher Erzähler
- Voice-over exakt 1,10x
- −16 LUFS, max. −1,5 dBTP
- keine Untertitel
- kein aktiver Word-Sync-Workflow
- harte Schnitte
- 0,7 Sekunden Schlussbild-Nachlauf

## Themenuniversum: offen

Die Themenwahl ist **nicht auf feste Säulen beschränkt**.

Bei einem autonomen neuen Reel darf Codex aus jedem geeigneten Erklärbereich wählen, zum Beispiel Psychologie, Alltag, Verhalten, Beziehungen, Gesellschaft, Kultur, Geschichte, Länder, Geografie, Politik, Wissenschaft, Naturphänomene, Technik, Internet, Social Media, Lernen, Arbeit, Wirtschaft, Gesundheit, Ernährung, Sprache, Kommunikation, Denkfehler, Mythen und kuriose „Warum?“-Fragen.

Entscheidend sind:
- starke Neugier/Hook
- klarer Aha-Moment
- faktische Erklärbarkeit
- visuelle Klarheit
- Abwechslung gegenüber den zuletzt produzierten Reels
- Teilbarkeit oder Alltagsrelevanz

Keine feste Pillar-Quote und keine automatische Rotation.

## Bildwelt: aktuell keine feste Vorgabe

Seit 2026-08-26 ist die frühere feste Bildwelt aus dem aktiven Workflow entfernt.

Für neue Reels gilt standardmäßig:

```text
visualStyleId = null
visualStyleReason = ""
```

Codex darf **keine** frühere Bildwelt automatisch reaktivieren oder aus alten Reels ableiten. Insbesondere nicht automatisch:

- `round-country-characters`
- Countryball-/Kugel-Geometrie
- alte Golden References
- `human-editorial-cartoon`
- `visual-metaphor`
- feste Figuren-, Augen-, Mund- oder Körperregeln
- feste Farbpalette oder Papiertextur
- früheren Premium-Editorial-Look

Historische Reel-Prompts bleiben Archivmaterial. Eine neue feste Bildwelt wird erst verwendet, nachdem der Nutzer sie ausdrücklich definiert hat.

## Bildanzahl: immer individuell

Die Anzahl der Bilder ist **nicht** an die Szenenzahl gekoppelt.

Für jede narrative Szene separat entscheiden:
- 1 Bild, wenn ein starkes Motiv reicht
- 2 Bilder bei echtem Mehrwert durch Überblick/Detail, Ursache/Folge, Mechanismus/Auswirkung oder Ausgangslage/Auflösung
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

`--scenes` bezeichnet **narrative Szenen**, nicht die endgültige Bildanzahl.

Danach `production/agent-task.md` vollständig bearbeiten. Besonders die Aufgabe `image-density-plan` ist verpflichtend.

```bash
npm run export:prompts -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

## Bildprompts

Jeder Bildprompt beschreibt nur den konkreten Bildmoment. Keine alte Repo-Bildwelt automatisch voranstellen oder ergänzen.

Neutral verbindlich:

- 9:16
- klare konkrete Szene und Komposition
- exakt geplanter deutscher Bildtext, falls vorhanden
- kein unerwarteter lesbarer Text
- keine Workflow-Metadaten als Bildinhalt
- volle Bildfläche ohne künstliche Untertitelzone

`Bild 00` ist aktuell nur das Cover und nicht automatisch ein Style-Master.

## Quellen-QC

Neue Reels verwenden `sourceQualitySchemaVersion: 3`.

Pflicht:
- mindestens zwei echte HTTPS-Quellen
- unterschiedliche Hosts/Domains
- vollständige Felder `Titel/Institution`, `URL`, `Datum/Zugriff`, `Quellentyp`, `Belegt`
- mindestens eine Primär-/offizielle Quelle oder wissenschaftliche Originalquelle
- mindestens eine davon unabhängige Sekundär-/Fachquelle
- `Belegt` muss konkret die jeweilige Reel-Aussage benennen

Die formale Prüfung ersetzt keine inhaltliche Quellenbewertung. Bestehende Schema-2-Reels bleiben rückwärtskompatibel.

## Google Flow

`Bild 00` = Cover.

Danach folgen alle Bildphasen in globaler Reihenfolge. Die Bildnummer ist nicht automatisch die Szenennummer.

Die verbindliche Nutzerdatei ist `00-bildprompts/99-alle-bildprompts.txt` mit dem vollständigen seriellen Gesamtprompt. `all-image-prompts/all-image-prompts.txt` ist nur die identische technische Spiegeldatei.

Flow arbeitet streng seriell: ein Bild → vollständig warten → gegen den aktuellen Bildprompt prüfen → umbenennen → nächstes Bild. Keine Queue, kein Batch, kein Parallelisieren und kein weiteres `Go`.

Der frühere separate `google-flow-controller.txt` ist deaktiviert.

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

Keine geschätzten Szenenanker. Keine Untertitel. `sync:words` ist nicht erforderlich und im aktiven Produktionsworkflow verboten; historische Helfer liegen nur noch unter dem Legacy-Namensraum.

## Visuelle Prüfung und Render

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL" --apply
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:render -- --dir "PFAD-ZUM-REEL"
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Jede einzelne Bildphase muss die visuelle Zwei-Pass-QC gegen ihren konkreten Inhalt und Prompt bestehen. Die letzte Bildphase bleibt nach dem letzten gesprochenen Wort 0,7 Sekunden stehen.

Keine geplante Stufe als abgeschlossen bezeichnen und keine nicht ausgeführten Tests als bestanden melden.
