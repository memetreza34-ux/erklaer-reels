# Straffes Audio-Pacing und direkte Schnitte

## Ziel

Die Reels sollen ohne künstliche Verzögerungen wirken. Das Tempo kommt aus dem Sprechertext, kurzen natürlichen Pausen und sofortigen Bildwechseln.

## Voice-over

Vor dem Aufbau der finalen Timeline:

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL"
```

Standardwerte:

```text
Pausenerkennung:      ab ungefähr 0,24 Sekunden
Restpause im Filter:  0,05 Sekunden
Sprechtempo:          1.05x
Tonhöhe:              bleibt erhalten
```

`retainedPauseSeconds` ist der FFmpeg-Filterwert. Die hörbare Pause kann durch Erkennungsfenster und Wortausklänge etwas länger sein. Ziel ist eine kurze natürliche Trennung, nicht ein ununterbrochener Wortstrom.

Optionale Anpassung:

```bash
npm run trim:pauses -- \
  --dir "PFAD-ZUM-REEL" \
  --minimum-pause 0.24 \
  --keep-pause 0.05 \
  --speed 1.05
```

Ergebnis:

```text
audio/voiceover-tight.m4a
review/audio-pacing-report.json
```

Nach diesem Schritt sind alte Cue- und Wortzeiten ungültig. Deshalb anschließend immer:

```bash
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
npm run sync:words -- --dir "PFAD-ZUM-REEL"
# Codex hört das optimierte Audio ab
npm run sync:words -- --dir "PFAD-ZUM-REEL" --apply --strict
```

## Bildwechsel

Final erlaubt sind nur:

```json
{ "type": "none", "durationSeconds": 0 }
```

für die Hook und:

```json
{ "type": "cut", "durationSeconds": 0 }
```

für alle weiteren Szenen.

Nicht erlaubt:

- Crossfade
- Fade-out oder Fade-in
- Schwarzblende oder Dip-to-dark
- Slide
- Flash, Glitch, Spin oder 3D-Übergang
- schwarzes Zwischenbild

Der neue Bildmoment muss am Schnittframe sofort vollständig sichtbar sein. Der Remotion-Renderer überblendet Szenen deshalb nicht mehr und legt keine Übergangsframes übereinander.

## Finale Prüfungen

`finalize:reel --strict` blockiert fehlendes oder unzureichendes Audio-Pacing.

`validate:render` blockiert:

- andere Übergangstypen als `none` und `cut`
- Übergangsdauern größer als null
- fehlenden Audio-Pacing-Bericht
- ein Voice-over außerhalb des leicht beschleunigten Zielbereichs

## Qualitätsgrenze

Das Voice-over darf trotz Straffung nicht hektisch oder künstlich klingen. Der Standardwert `1.05x` ist bewusst gering. Bei problematischer Aussprache muss das Audio neu erzeugt werden, statt die Geschwindigkeit stark zu erhöhen.
