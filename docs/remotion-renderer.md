# Remotion-Renderer

Der Renderer erzeugt aus `render/render-plan.json` eine fertige MP4 mit Szenenbildern, optimiertem Voice-over, Untertiteln, dezenten Bewegungen und optionalen Soundeffekten.

## Vorbereitung

```bash
npm install
npm run trim:pauses -- --dir "PFAD-ZUM-REEL"
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
```

`review/final-readiness-report.json` muss `readyForRenderer: true` enthalten und `render/render-plan.json` den Status `ready-for-renderer` besitzen.

## Untertitelstil

Zentrale Quelle: `src/shared/subtitle-style.js`.

- Position `lower`
- vertikale Position exakt 76 %
- weiches Weiß `#F5F7FA`
- alle Wörter gleichfarbig
- keine gelbe Wortmarkierung
- transparenter Hintergrund
- keine schwarze Box oder Balken
- dunkle Kontur und dezenter Schatten
- normalerweise 3–6 Wörter, höchstens zwei Zeilen

Der Renderer blockiert eine gelbe Markierung, einen schwarzen Hintergrund oder eine abweichende Position.

## Übergänge

- Hook: `none`, Dauer 0
- jede weitere Szene: `cut`, Dauer 0
- keine Crossfades
- keine Ein- oder Ausblendungen
- keine Schwarzblenden
- keine Slides
- kein schwarzes Zwischenbild

Das neue Bild ist ab dem ersten Schnittframe vollständig sichtbar.

## Renderer-Eingabe prüfen

```bash
npm run validate:render -- --dir "PFAD-ZUM-REEL"
```

Geprüft werden:

- 1080 × 1920 bei 30 FPS
- positive Gesamtdauer
- lückenlose Szenenframes
- direkte Schnitte mit Dauer 0
- bestandener Audio-Pacing-Bericht
- vorhandene Bilder und Voice-over-Datei
- sichere lokale Pfade
- zulässige Zoom- und Schwenkwerte
- Untertitel exakt bei 76 %
- Text und ehemalige Highlight-Farbe beide `#F5F7FA`
- `highlightCurrentWord: false`
- Hintergrund `transparent`
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

Optionen:

```text
--codec h264
--crf 18
--concurrency 4
--force
```

`--force` überspringt nur die finale Freigabeprüfung. Fehlende Assets, unsichere Pfade, ungültige Framedaten, falsche Untertitelwerte oder verbotene Übergänge bleiben Fehler.

## Gerenderte Bestandteile

- Szenenbilder aus dem Render-Plan
- gestrafftes Voice-over
- weiße Untertitel unten mit Kontur und Schatten
- keine Untertitelbox
- keine gelbe Wortanimation
- dezente Zooms und Schwenks
- direkte harte Schnitte
- Soundeffekte mit gültigem lokalem `file`-Pfad

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

Bei Erfolg setzt der Renderer in `status.json` den Wert `render: "complete"`.

## Remotion Studio

```bash
npm run studio
```

## Lizenzhinweis

Vor produktiver oder geschäftlicher Nutzung müssen die aktuellen Remotion-Lizenzbedingungen geprüft werden.
