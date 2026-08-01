# Remotion-Renderer

Der Renderer erzeugt aus `render/render-plan.json` eine fertige MP4-Datei. Er verwendet die geplanten Bilder, das optimierte Voice-over, Untertitel, dezente Zooms und Schwenks sowie optional vorhandene Sounddateien.

## Voraussetzungen

```bash
npm install
```

Remotion und alle `@remotion/*`-Pakete sind absichtlich auf dieselbe exakte Version festgelegt.

Vor dem Rendern muss der Reel-Ordner vollständig vorbereitet sein:

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL"
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
npm run sync:words -- --dir "PFAD-ZUM-REEL"
# Codex bearbeitet die Wortzeiten
npm run sync:words -- --dir "PFAD-ZUM-REEL" --apply --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
```

`review/final-readiness-report.json` muss `readyForRenderer: true` enthalten und `render/render-plan.json` muss den Status `ready-for-renderer` besitzen.

## Übergänge

Der finale Renderer verwendet keine Übergangsanimationen.

- Hook: `none`, Dauer 0
- jede weitere Szene: `cut`, Dauer 0
- keine Crossfades
- keine Ein- oder Ausblendungen
- keine Schwarzblenden
- keine Slides
- kein schwarzes Zwischenbild

Das neue Bild ist ab dem ersten Frame des Schnitts vollständig sichtbar. Die Remotion-Komposition legt Szenen nicht für Fades übereinander und verändert ihre Deckkraft nicht.

## Renderer-Eingabe prüfen

```bash
npm run validate:render -- --dir "PFAD-ZUM-REEL"
```

Geprüft werden unter anderem:

- 1080 × 1920 bei 30 FPS
- positive Gesamtdauer
- lückenlose Szenenframes
- `none` für die Hook und ausschließlich `cut` für weitere Szenen
- Übergangsdauer immer 0
- bestandener Audio-Pacing-Bericht
- leicht beschleunigtes Voice-over im sicheren Zielbereich
- vorhandene Bilder und Voice-over-Datei
- sichere lokale Pfade
- zulässige Zoom- und Schwenkwerte
- gültige Untertitel- und Wortzeiten
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

`--force` überspringt ausschließlich die finale Freigabeprüfung. Fehlende Bilder, unsichere Pfade, ungültige Framedaten oder verbotene Übergänge bleiben blockierende Fehler.

## Gerenderte Bestandteile

- alle Szenenbilder aus `render/render-plan.json`
- gestrafftes Voice-over
- Untertitel bei ungefähr 79,5 %
- exakt synchronisierte gelbe Wortmarkierung
- dezente Zooms und Schwenks
- sofortige harte Schnitte
- Soundeffekte, sofern ein gültiges Feld `file` vorhanden ist

Ein geplanter Soundeffekt ohne tatsächliche Datei wird als Warnung gemeldet und nicht gerendert.

## Berichte

Vor dem Rendering:

```text
review/audio-pacing-report.json
review/renderer-input-report.json
```

Nach dem Rendering:

```text
review/render-execution-report.json
```

Bei Erfolg aktualisiert der Renderer außerdem `status.json` mit `render: "complete"`.

## Remotion Studio

Für eine visuelle Vorschau:

```bash
npm run studio
```

Für den automatischen Produktionsablauf ist `npm run render:reel` der verbindliche Befehl.

## Lizenzhinweis

Vor produktiver oder geschäftlicher Nutzung müssen die aktuellen Remotion-Lizenzbedingungen geprüft werden. Das Repository trifft keine Lizenzentscheidung für den Nutzer.
