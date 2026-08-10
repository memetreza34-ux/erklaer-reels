# Remotion-Renderer

Der Renderer erzeugt aus `render/render-plan.json` eine fertige MP4 mit 12–14 Szenenbildern, optimiertem Voice-over, sprecher-synchronen Untertiteln, dezenten Bewegungen und optionalen Soundeffekten. Bei Widersprüchen gilt `CURRENT_WORKFLOW.md`.

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
- Grundtext `#F5F7FA`
- das aktuell gesprochene Wort wird anhand echter Wortzeiten in Braun `#B7794A` markiert
- transparenter Hintergrund ohne Box oder Balken
- dunkle Kontur und Schatten
- normalerweise 3–6 Wörter, höchstens zwei Zeilen
- keine Bounce-/Zoom-/Skalierungsanimation; nur der Farbwechsel des aktiven Wortes
- 100 % des gesprochenen Voice-Scripts müssen enthalten sein

Vor einem finalen Render müssen gelten:

```text
coverage === 1
timedWords === totalWords
unassignedWords === 0
```

Zusätzlich muss die vollständige Wortfolge aller gerenderten Untertitel exakt `script/voice-script.txt` entsprechen.

Der Renderer blockiert:
- Positionen außerhalb 58 %
- falsche Grund- oder Highlightfarben
- schwarze Hintergründe
- geschätzte Cue-/Wortzeiten
- fehlende `timingSource`- oder `wordTimings`-Angaben
- fehlende, doppelte oder falsch angeordnete gesprochene Wörter

## Übergänge

- Hook `none`, Dauer 0
- jede weitere Szene `cut`, Dauer 0
- keine Crossfades, Einblendungen, Schwarzblenden oder Slides

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
- Untertitel exakt bei 58 %, Grundtext `#F5F7FA`, Aktivwort `#B7794A`, transparenter Hintergrund
- `timingStatus: codex-word-synced`
- `timingSource: codex-local-audio-review`
- vollständige gültige Wortzeiten
- exakte 100-%-Wortfolge des Voice-Scripts
- finale Freigabe `readyForRenderer: true`

## MP4 erzeugen

```bash
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Technische Standardausgabe:

```text
PFAD-ZUM-REEL/output/REEL-ID.mp4
```

Sichtbare Nutzeransicht:

```text
PFAD-ZUM-REEL/04-video/FERTIGES-VIDEO/
```

`--force` darf die harten Asset-, Audio- und Untertitel-Sicherheitsprüfungen nicht umgehen. Bei Erfolg schreibt der Renderer `review/render-execution-report.json` und setzt den Renderstatus auf vollständig.
