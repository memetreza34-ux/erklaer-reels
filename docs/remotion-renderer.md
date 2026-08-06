# Remotion-Renderer

Der Renderer erzeugt aus `render/render-plan.json` eine fertige MP4 mit 12–14 Szenenbildern, optimiertem Voice-over, leicht tiefer gesetzten Untertiteln, dezenten Bewegungen und optionalen Soundeffekten.

## Vorbereitung

```bash
npm install
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
npm run sync:words -- --dir "PFAD-ZUM-REEL"
# production/codex-word-sync-task.md akustisch vollständig bearbeiten
npm run sync:words -- --dir "PFAD-ZUM-REEL" --apply --strict
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
```

Das Audio wird von der ursprünglichen Datei auf exakt 1,10x verarbeitet, die Tonhöhe erhalten und auf −16 LUFS bei höchstens −1,5 dBTP normalisiert.

## Untertitel

Zentrale Quelle: `src/shared/subtitle-style.js`.

- horizontal zentriert
- vertikal exakt 58 % Bildhöhe
- warmer heller Sandton `#E7C39A`
- keine andersfarbige Wortmarkierung
- transparenter Hintergrund ohne Box oder Balken
- dunkle Kontur und Schatten
- normalerweise 3–6 Wörter, höchstens zwei Zeilen
- `highlightCurrentWord: false`
- trotzdem echte akustisch bestätigte Wortzeiten pro Cue

Der Renderer blockiert die alte Position bei 50 % oder 76 %, weißen Text, Wortmarkierungen, schwarze Hintergründe, geschätzte Cue-Zeiten sowie fehlende `timingSource`- und `wordTimings`-Angaben.

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
- Untertitel exakt bei 58 %, im Sandton und transparent
- `timingStatus: codex-word-synced`
- `timingSource: codex-local-audio-review`
- vollständige gültige Wortzeiten
- finale Freigabe `readyForRenderer: true`

## MP4 erzeugen

```bash
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Standardausgabe:

```text
PFAD-ZUM-REEL/output/REEL-ID.mp4
```

`--force` überspringt nur die finale Freigabeprüfung. Fehlende Assets, unsichere Pfade, falsche Audio- oder Untertitelwerte, fehlende exakte Wortzeiten und verbotene Übergänge bleiben Fehler.

Bei Erfolg schreibt der Renderer `review/render-execution-report.json` und setzt `render: "complete"` in `status.json`.
