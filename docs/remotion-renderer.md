# Remotion-Renderer

Der Renderer erzeugt aus `render/render-plan.json` eine fertige MP4 mit 12–14 Szenenbildern, optimiertem Voice-over, mittigen Untertiteln, dezenten Bewegungen und optionalen Soundeffekten.

## Vorbereitung

```bash
npm install
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
```

Das Audio wird von der ursprünglichen Datei auf exakt 1,10x verarbeitet, die Tonhöhe erhalten und auf −16 LUFS bei höchstens −1,5 dBTP normalisiert.

## Untertitel

Zentrale Quelle: `src/shared/subtitle-style.js`.

- Position `center`
- exakt 50 % Bildhöhe
- Weiß `#F5F7FA`
- keine gelbe Wortmarkierung
- transparenter Hintergrund ohne Box oder Balken
- dunkle Kontur und Schatten
- normalerweise 3–6 Wörter, höchstens zwei Zeilen

Der Renderer blockiert die alte Position bei 76 %, gelbe Markierungen, schwarze Hintergründe und andere Abweichungen.

## Übergänge

- Hook `none`, Dauer 0
- jede weitere Szene `cut`, Dauer 0
- keine Crossfades, Einblendungen, Schwarzblenden, Slides oder schwarzen Zwischenbilder

## Renderer-Eingabe prüfen

```bash
npm run validate:render -- --dir "PFAD-ZUM-REEL"
```

Geprüft werden unter anderem:

- 1080 × 1920 bei 30 FPS
- lückenlose Szenenframes und direkte Schnitte
- Audio exakt 1,10x
- −16 LUFS und höchstens −1,5 dBTP
- vorhandene Bilder und Voice-over-Datei
- sichere lokale Pfade
- zulässige Zoom- und Schwenkwerte
- Untertitel exakt bei 50 %, weiß und transparent
- finale Freigabe `readyForRenderer: true`

## MP4 erzeugen

```bash
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Standardausgabe:

```text
PFAD-ZUM-REEL/output/REEL-ID.mp4
```

`--force` überspringt nur die finale Freigabeprüfung. Fehlende Assets, unsichere Pfade, falsche Audio- oder Untertitelwerte und verbotene Übergänge bleiben Fehler.

Bei Erfolg schreibt der Renderer `review/render-execution-report.json` und setzt `render: "complete"` in `status.json`.
