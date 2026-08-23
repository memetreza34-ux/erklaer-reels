# Produktionsstatus

**Status: PRODUKTIONSBEREIT**

## Verbindliche Quelle

`CURRENT_WORKFLOW.md` ist die Single Source of Truth.

## Aktueller Reel-Standard

- 55–60 Sekunden Voice-over
- 155–175 deutsche Wörter
- 12–14 **narrative Szenen**, Standard 13
- Hook ab Sekunde 0
- Voice-over exakt 1,10x, Pitch erhalten
- −16 LUFS, max. −1,5 dBTP
- keine Untertitel und kein Word-Sync
- harte Schnitte
- 0,7 Sekunden Schlussbild-Nachlauf

## Bildanzahl — seit 23.08.2026 individuell

Die alte Gleichsetzung `13 Szenen = 13 Bilder` ist aufgehoben.

Ab sofort:
- jede narrative Szene besitzt 1, 2 oder selten 3 Bildphasen
- die Gesamtzahl der Bilder wird pro Reel individuell gewählt
- keine fixe Sollzahl pro Reel oder Bildwelt
- ein Stillstand von ungefähr 3,5–4 Sekunden ist ein Trigger, eine zweite Bildphase zu prüfen, aber keine automatische Pflicht
- jedes Zusatzbild braucht einen echten Informations-, Fokus- oder Rhythmusgewinn

Technisch:
- `imageCountMode: "individual-per-reel"`
- `plannedImageCount`
- `scene.imageCount`
- `scene.imagePhases[]`
- zusätzliche Prompts als `image-prompt-02.txt`, `image-prompt-03.txt`

## Google Flow

`Bild 00.png` bleibt Cover und Style-Master.

Danach bezeichnet die Nummer die **globale Bildreihenfolge**, nicht mehr automatisch die Szenennummer. Beispiel: Szene 2 kann Bild 02 und Bild 03 besitzen.

Flow arbeitet weiterhin streng seriell: genau ein Bild erzeugen, vollständig warten, umbenennen, prüfen, nächstes Bild starten. Kein Batch, keine Queue, kein Parallelisieren.

## Qualitätsprinzip

Ein Reel ist erst fertig, wenn:
- alle individuell geplanten Bildphasen vorhanden sind
- jede Bildphase zweifach visuell geprüft wurde
- das finale Voice-over gemessen wurde
- narrative Szenen am finalen Audio synchronisiert sind
- interne Bildphasen passend innerhalb der Szenen liegen
- Finalizer und Renderer-Prüfung tatsächlich bestanden sind
- die echte MP4 erzeugt wurde

Nicht ausgeführte Tests oder geplante Produktionsstufen niemals als bestanden melden.

## Infrastruktur

Die GitHub-Actions-CI hatte zuletzt weiterhin Läufe mit leerer Step-Liste bzw. nicht abrufbaren Logs. Ein grüner CI-Status darf nur gemeldet werden, wenn ein Lauf tatsächlich erfolgreich abgeschlossen wurde.
