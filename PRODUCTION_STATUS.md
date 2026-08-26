# Produktionsstatus

**Status: PRODUKTIONSLOGIK BEREIT — BILDWELT ZURÜCKGESETZT — E2E-PRODUKTIONSTEST AUSSTEHEND**

## Verbindliche Quelle

`CURRENT_WORKFLOW.md` ist die Single Source of Truth.

## Aktueller Reel-Standard

- 55–60 Sekunden Voice-over
- 155–175 deutsche Wörter
- 12–14 **narrative Szenen**, Standard 13
- Hook ab Sekunde 0
- Voice-over exakt 1,10x, Pitch erhalten
- −16 LUFS, max. −1,5 dBTP
- keine Untertitel und kein aktiver Word-Sync
- harte Schnitte
- 0,7 Sekunden Schlussbild-Nachlauf

## Themen und Bildwelt

Die Themenwahl ist offen. Es gibt keine feste Pillar-Quote mehr.

Die frühere feste Bildwelt wurde am 2026-08-26 aus dem aktiven Produktionssystem entfernt.

Aktueller Zustand:

```text
visualWorldMode: unassigned
visualStyleId: null
visualStyleReason: ""
```

Es gibt derzeit **keine** aktive Countryball-/Kugel-Welt, keine Golden References, keine feste Figuren-Geometrie, keine feste Palette und keinen verbindlichen historischen Editorial-Look.

Alte Reels bleiben als Archiv erhalten, steuern neue Produktionen aber nicht mehr.

## Bildanzahl — individuell

Die alte Gleichsetzung `13 Szenen = 13 Bilder` ist aufgehoben.

Ab sofort:
- jede narrative Szene besitzt 1, 2 oder selten 3 Bildphasen
- die Gesamtzahl der Bilder wird pro Reel individuell gewählt
- keine fixe Sollzahl pro Reel
- ein Stillstand von ungefähr 3,5–4 Sekunden ist ein Trigger, eine zweite Bildphase zu prüfen, aber keine automatische Pflicht
- jedes Zusatzbild braucht einen echten Informations-, Fokus- oder Rhythmusgewinn

Technisch:
- `imageCountMode: "individual-per-reel"`
- `plannedImageCount`
- `scene.imageCount`
- `scene.imagePhases[]`
- zusätzliche Prompts als `image-prompt-02.txt`, `image-prompt-03.txt`

## Google Flow

Verbindliche Nutzerdatei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

`Bild 00.png` ist aktuell nur das Cover und nicht automatisch ein Style-Master.

Danach bezeichnet die Nummer die **globale Bildreihenfolge**, nicht automatisch die Szenennummer.

Flow arbeitet streng seriell: genau ein Bild erzeugen, vollständig warten, gegen den aktuellen Bildprompt prüfen, umbenennen, nächstes Bild starten. Kein Batch, keine Queue, kein Parallelisieren.

Der separate `google-flow-controller.txt` ist deaktiviert.

## Quellen-QC

Neue Reels verwenden Quellen-Schema 3:
- mindestens zwei echte HTTPS-Quellen mit unterschiedlichen Hosts
- vollständige Quellenfelder inklusive `Quellentyp`
- mindestens eine Primär-/offizielle bzw. wissenschaftliche Originalquelle
- mindestens eine unabhängige Sekundär-/Fachquelle
- konkrete Zuordnung unter `Belegt`

Bestehende Schema-2-Reels bleiben rückwärtskompatibel.

## Qualitätsprinzip

Ein Reel ist erst fertig, wenn:
- Script und Quellen tatsächlich geprüft wurden
- alle individuell geplanten Bildphasen vorhanden sind
- jede Bildphase zweifach visuell gegen ihren konkreten Inhalt und Prompt geprüft wurde
- das finale Voice-over real gemessen wurde
- narrative Szenen am finalen Audio synchronisiert sind
- interne Bildphasen passend innerhalb der Szenen liegen
- Finalizer und Renderer-Prüfung tatsächlich bestanden sind
- die echte MP4 erzeugt wurde

Nicht ausgeführte Tests oder geplante Produktionsstufen niemals als bestanden melden. Messwerte und Readiness-Reports dürfen niemals künstlich erzeugt oder erzwungen werden.

## Runtime-/E2E-Validierung

Die Produktionslogik ist implementiert. Nach dem Zurücksetzen der Bildwelt muss der nächste vollständige E2E-Test insbesondere prüfen:

- neuer Workspace startet mit `visualStyleId: null` und leerem `visualStyleReason`
- keine alte Countryball-/Kugel-/Golden-Reference-Regel wird automatisch injiziert
- individuelle Bildphasen werden korrekt geplant und exportiert
- Google-Flow-Gesamtprompt bleibt vollständig und seriell strukturiert
- `Bild 00` wird nicht automatisch als Style-Master erzwungen
- echte Bilder werden visuell zugeordnet und zweifach gegen konkrete Prompts geprüft
- echtes Voice-over wird verarbeitet, gemessen und als einzige Timeline-Quelle verwendet
- Finalizer und Render-Validator blockieren fehlende oder ungeprüfte Voraussetzungen
- finale MP4 wird tatsächlich erzeugt

Erst nach diesem vollständigen Durchlauf darf der Status wieder als vollständig produktionsvalidiert bezeichnet werden.

## Legacy

`sync:words` gehört nicht zum aktiven Workflow. Historische Word-Sync-Helfer sind nur unter dem expliziten Legacy-Namensraum zulässig. Historische Reel-Bildprompts definieren ebenfalls keine aktive Bildwelt.

## Infrastruktur

Die GitHub-Actions-CI hatte zuletzt Läufe mit leerer Step-Liste bzw. nicht abrufbaren Logs. Ein grüner CI-Status darf nur gemeldet werden, wenn ein Lauf tatsächlich erfolgreich abgeschlossen wurde.
