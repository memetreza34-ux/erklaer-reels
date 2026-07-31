# Remotion-Renderer

Der Renderer erzeugt aus `render/render-plan.json` eine fertige MP4-Datei. Er verwendet die bereits geplanten Bilder, das Voice-over, Untertitel, Zooms, Schwenks, Übergänge und optional vorhandene Sounddateien.

## Voraussetzungen

```bash
npm install
```

Remotion und alle `@remotion/*`-Pakete sind absichtlich auf dieselbe exakte Version festgelegt.

Vor dem Rendern muss der Reel-Ordner vollständig vorbereitet sein:

```bash
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
```

`review/final-readiness-report.json` muss `readyForRenderer: true` enthalten und `render/render-plan.json` muss den Status `ready-for-renderer` besitzen.

## Renderer-Eingabe prüfen

```bash
npm run validate:render -- --dir "PFAD-ZUM-REEL"
```

Geprüft werden unter anderem:

- 1080 × 1920 bei 30 FPS
- positive Gesamtdauer
- lückenlose Szenenframes
- vorhandene Bilder und Voice-over-Datei
- sichere lokale Pfade ohne Verlassen des Reel-Ordners
- unterstützte Bild- und Audioformate
- zulässige Crossfade-, Zoom- und Schwenkwerte
- gültige Untertitelzeiten
- vorhandene optionale Sounddateien
- finale Renderer-Freigabe

## MP4 erzeugen

```bash
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Standardausgabe:

```text
PFAD-ZUM-REEL/output/REEL-ID.mp4
```

Eigener Ausgabepfad:

```bash
npm run render:reel -- \
  --dir "PFAD-ZUM-REEL" \
  --output "exports/mein-reel.mp4"
```

Weitere Optionen:

```text
--codec h264
--crf 18
--concurrency 4
--force
```

`--force` überspringt ausschließlich die finale Freigabeprüfung. Fehlende Bilder, unsichere Pfade oder ungültige Framedaten bleiben blockierende Fehler.

## Gerenderte Bestandteile

- alle Szenenbilder aus `render/render-plan.json`
- Voice-over mit der dort festgelegten Lautstärke
- Untertitel in der unteren sicheren Mitte
- dezente Zooms und Schwenks
- harte Schnitte und kurze Crossfades
- Soundeffekte, sofern ein gültiges Feld `file` vorhanden ist

Ein geplanter Soundeffekt ohne tatsächliche Datei wird als Warnung gemeldet und nicht gerendert.

Beispiel:

```json
{
  "id": "scene-03-sfx-1",
  "type": "click",
  "file": "audio/sfx/click.wav",
  "timeSeconds": 8.4,
  "volume": 0.18
}
```

## Berichte

Vor dem Rendering:

```text
review/renderer-input-report.json
```

Nach dem Rendering:

```text
review/render-execution-report.json
```

Bei Erfolg aktualisiert der Renderer außerdem `status.json`:

```json
{
  "render": "complete",
  "renderedFile": "output/reel-01_thema.mp4",
  "qualityControl": "render-complete"
}
```

## Remotion Studio

Für eine visuelle Vorschau kann das Studio gestartet werden:

```bash
npm run studio
```

Für den automatischen Produktionsablauf ist `npm run render:reel` der verbindliche Befehl.

## Lizenzhinweis

Vor produktiver oder geschäftlicher Nutzung müssen die aktuellen Remotion-Lizenzbedingungen geprüft werden. Das Repository trifft keine Lizenzentscheidung für den Nutzer.
