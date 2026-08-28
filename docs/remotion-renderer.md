# Remotion-Renderer

> Bei Widersprüchen gilt `CURRENT_WORKFLOW.md`.

Der Renderer erzeugt aus `render/render-plan.json` eine fertige MP4 mit 12–14 narrativen Szenen, **individuell vielen visuellen Shots/Bildphasen**, optimiertem Voice-over, harten Schnitten, dezenten Bewegungen und optionalen Soundeffekten.

Untertitel und Word-Sync sind im aktuellen Renderpfad deaktiviert.

## Vorbereitung

```bash
npm ci
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
```

Das Audio wird von der ursprünglichen Datei auf exakt 1,10x verarbeitet, die Tonhöhe erhalten und auf −16 LUFS bei höchstens −1,5 dBTP normalisiert. Die Messung muss zum final verwendeten Audio gebunden sein.

## Bilder und visuelle Shots

- `Bild 01` ist die erste Szene und zugleich das Titelbild
- 12–14 narrative Szenen bleiben die Erzählstruktur
- jede Szene besitzt 1, 2 oder selten 3 Bildphasen
- der Renderer verarbeitet die daraus entstehenden `visualShots`
- interne Bildphasen wechseln innerhalb der narrativen Szene über ihre `startPercent`-Position
- Dateinummern sind keine semantische Abnahme; jede Bildphase muss vorher visuell geprüft sein

## Untertitel

Global deaktiviert:

- keine Subtitle-Komponente im Renderer
- keine Cue-Layer
- keine Wortmarkierung
- keine Word-Timings als Render-Voraussetzung
- keine künstliche Untertitel-Safe-Zone

Historische Untertiteldateien dürfen aus Kompatibilitätsgründen existieren, müssen für neue Reels aber deaktiviert und cue-frei sein.

## Übergänge

- erster visueller Shot: `none`, Dauer 0
- jeder weitere Shot: `cut`, Dauer 0
- keine Crossfades, Einblendungen, Schwarzblenden oder Slides

## Renderer-Eingabe prüfen

```bash
npm run validate:render -- --dir "PFAD-ZUM-REEL"
```

Geprüft werden unter anderem:

- 1080 × 1920 bei 30 FPS
- lückenlose Frames und direkte harte Schnitte
- Audio exakt 1,10x
- reale Lautheitsmessung um −16 LUFS und höchstens −1,5 dBTP
- Audio-Pacing-Report passt zur finalen Audiodatei
- vorhandenes Voice-over
- alle geplanten Bildphasen vorhanden
- sichere lokale Pfade
- zulässige Zoom- und Schwenkwerte
- Untertitel in Reel/Renderplan deaktiviert
- verifizierte narrative Audio-Cues
- interne Visual-Shots liegen innerhalb der narrativen Szenen
- finale Freigabe `readyForRenderer: true` beruht auf real bestandenen QC-Gates

## MP4 und Caption erzeugen

```bash
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Kanonische technische Exportdateien:

```text
PFAD-ZUM-REEL/export/
├── FERTIGES-REEL.mp4
└── UNIVERSELLE-CAPTION.txt
```

Sichtbare Nutzeransicht derselben finalen Dateien:

```text
PFAD-ZUM-REEL/03-export/
├── FERTIGES-REEL.mp4
└── UNIVERSELLE-CAPTION.txt
```

Die Caption wird aus `caption/caption.txt` übernommen und vor dem finalen Render gegen die verbindlichen Regeln aus `UNIVERSAL_CAPTION_POLICY.md` geprüft. Eine fehlende oder ungültige Universal-Caption blockiert den finalen Export.

`--output` kann zusätzlich einen weiteren MP4-Ausgabepfad setzen; der kanonische Export unter `export/FERTIGES-REEL.mp4` wird trotzdem geschrieben.

`--force` darf harte Asset-, Quellen-, Audio-, Timing-, Caption- oder visuelle Sicherheitsprüfungen nicht umgehen.

Bei Erfolg schreibt der Renderer `review/render-execution-report.json` und setzt den Renderstatus nur dann auf vollständig, wenn die echte MP4 erzeugt wurde und der finale Export geschrieben ist.

## Verbotene Abkürzungen

- keine erfundenen Audio-Messwerte
- keine gleichmäßig verteilten Szenen-Timings als „verifiziert“
- keine fehlenden Bilder durch Fake-Reports überspringen
- keine Wiederaktivierung von `sync:words`

Der frühere `force-render-state.js`-Helfer wurde deshalb aus dem aktiven Repo entfernt.
