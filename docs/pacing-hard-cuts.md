# Straffes Audio-Pacing und direkte Schnitte

> Bei Widersprüchen gilt `CURRENT_WORKFLOW.md`.

## Ziel

Die Reels sollen ohne künstliche Verzögerungen wirken. Das Tempo kommt aus dem Sprechertext, kurzen natürlichen Pausen und sofortigen Bildwechseln.

## Voice-over

Vor dem Aufbau der finalen Timeline:

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
```

Standardwerte:

```text
Pausenerkennung:      ab ungefähr 0,24 Sekunden
Restpause im Filter:  0,05 Sekunden
Sprechtempo:          exakt 1,10x
Tonhöhe:              bleibt erhalten
Lautheit:              −16 LUFS
True Peak:             höchstens −1,5 dBTP
```

`retainedPauseSeconds` ist der FFmpeg-Filterwert. Die hörbare Pause kann durch Erkennungsfenster und Wortausklänge etwas länger sein. Ziel ist eine kurze natürliche Trennung, nicht ein ununterbrochener Wortstrom.

Optionale Parameter dürfen die verbindliche Geschwindigkeit von 1,10x nicht still verändern.

Ergebnis typischerweise:

```text
audio/voiceover-tight.m4a
review/audio-pacing-report.json
```

Danach sind alte Szenen-Cue-Zeiten ungültig. Deshalb anschließend:

```bash
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

Kein `sync:words` im aktiven Produktionsworkflow.

## Narrative Szenen und interne Bildphasen

Narrative Szenen werden am finalen Voice-over über echte `audioCue`-Zeitpunkte synchronisiert.

Hat eine narrative Szene mehrere `imagePhases`, werden diese innerhalb der bestätigten Szenendauer über `startPercent` verteilt. Auch diese internen Wechsel sind harte Schnitte.

## Bildwechsel

Final erlaubt sind nur:

```json
{ "type": "none", "durationSeconds": 0 }
```

für den ersten visuellen Shot und:

```json
{ "type": "cut", "durationSeconds": 0 }
```

für alle weiteren Bildwechsel.

Nicht erlaubt:

- Crossfade
- Fade-out oder Fade-in
- Schwarzblende oder Dip-to-dark
- Slide
- Flash, Glitch, Spin oder 3D-Übergang
- schwarzes Zwischenbild

Der neue Bildmoment muss am Schnittframe sofort vollständig sichtbar sein. Der Remotion-Renderer überblendet Shots nicht und legt keine Übergangsframes übereinander.

## Finale Prüfungen

`finalize:reel --strict` blockiert fehlendes oder unzureichendes Audio-Pacing.

`validate:render` blockiert unter anderem:

- andere Übergangstypen als `none` und `cut`
- Übergangsdauern größer als null
- fehlenden oder nicht zum Audio passenden Audio-Pacing-Bericht
- nicht real gemessene Lautheit
- unbestätigte narrative Szenenanker
- fehlende Bildphasen

## Qualitätsgrenze

Das Voice-over darf trotz Straffung nicht hektisch oder künstlich klingen. Der verbindliche Produktionswert ist **1,10x**. Bei problematischer Aussprache muss das Voice-over neu erzeugt oder die Rohaufnahme verbessert werden, statt QC-Gates zu umgehen oder Messwerte zu erfinden.
