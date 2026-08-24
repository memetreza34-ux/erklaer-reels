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

Die Themenwahl ist **nicht mehr auf feste Säulen beschränkt**.

Bei einem autonomen neuen Reel darf Codex aus jedem geeigneten Erklärbereich wählen, zum Beispiel Psychologie, Alltag, Verhalten, Beziehungen, Gesellschaft, Kultur, Geschichte, Länder, Geografie, Politik, Wissenschaft, Naturphänomene, Technik, Internet, Social Media, Lernen, Arbeit, Wirtschaft, Gesundheit, Ernährung, Sprache, Kommunikation, Denkfehler, Mythen und kuriose „Warum?“-Fragen.

Die Liste ist nicht abschließend. Entscheidend sind:
- starke Neugier/Hook
- klarer Aha-Moment
- faktische Erklärbarkeit
- visuelle Stärke in der Kugel-Welt
- Abwechslung gegenüber den zuletzt produzierten Reels
- Teilbarkeit oder Alltagsrelevanz

Keine feste Pillar-Quote und keine automatische Rotation. Die Kugel-Welt darf nicht dazu führen, dass neue Themen automatisch immer Länder-, Grenzen-, Hauptstadt-, Geschichts- oder Politikthemen sind.

## Bildanzahl: immer individuell

Die Anzahl der Bilder ist **nicht** an die Szenenzahl gekoppelt.

Für jede narrative Szene separat entscheiden:
- 1 Bild, wenn ein starkes Motiv reicht
- 2 Bilder bei echtem Mehrwert durch Überblick/Detail, Karte/Zoom, Ursache/Folge, Figur/Mechanismus oder Ausgangslage/Auflösung
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

## Quellen-QC

Neue Reels verwenden `sourceQualitySchemaVersion: 3`.

Pflicht:
- mindestens zwei echte HTTPS-Quellen
- unterschiedliche Hosts/Domains
- vollständige Felder `Titel/Institution`, `URL`, `Datum/Zugriff`, `Quellentyp`, `Belegt`
- mindestens eine Primär-/offizielle Quelle oder wissenschaftliche Originalquelle
- mindestens eine davon unabhängige Sekundär-/Fachquelle
- `Belegt` muss konkret die jeweilige Reel-Aussage benennen

Die formale Prüfung ersetzt keine inhaltliche Quellenbewertung. Bei Gesundheit, Wissenschaft, Wirtschaft, Politik oder aktuellen technischen Fakten besonders auf Primärquellen, Aktualität und tatsächliche Belegbarkeit achten.

Bestehende Schema-2-Reels bleiben rückwärtskompatibel.

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

Die verbindliche Nutzerdatei ist `00-bildprompts/99-alle-bildprompts.txt` mit dem vollständigen seriellen Gesamtprompt. `all-image-prompts/all-image-prompts.txt` ist nur die identische technische Spiegeldatei.

Flow arbeitet streng seriell: ein Bild → vollständig warten → umbenennen → prüfen → automatisch nächstes Bild. Keine Queue, kein Batch, kein Parallelisieren und kein weiteres `Go`.

Der frühere separate `google-flow-controller.txt` ist deaktiviert.

## Bildwelt

Bis zur ausdrücklichen Reaktivierung anderer Welten gilt ausschließlich:

`round-country-characters`

Die Kugel-Welt ist **für alle Themen** zuständig, nicht nur für Länder und Geschichte.

- Länderrollen → vollständige runde Kugel mit vereinfachtem Flaggenmuster
- nicht-länderspezifische Personen/Rollen → neutrale runde Kugel mit Farbe/Symbol
- Gruppen, Systeme, Gedanken, Gewohnheiten, Emotionen oder abstrakte Kräfte dürfen ebenfalls durch runde Kugelfiguren dargestellt werden
- Karten und Länderumrisse bleiben gesichtslose Erklärgrafik
- keine menschlichen Köpfe/Torsi als Hauptwelt
- keine map-shaped characters

Keine feste Bildsumme aufgrund des Themas erzwingen.

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

Jede einzelne Bildphase muss die visuelle Zwei-Pass-QC bestehen. Die letzte Bildphase bleibt nach dem letzten gesprochenen Wort 0,7 Sekunden stehen.

Keine geplante Stufe als abgeschlossen bezeichnen und keine nicht ausgeführten Tests als bestanden melden.
