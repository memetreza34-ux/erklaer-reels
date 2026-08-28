# Bewegungs- und Soundregeln

> Bei Widersprüchen gilt `CURRENT_WORKFLOW.md`.

## Grundsatz

Zooms, Kamerabewegungen und Soundeffekte sollen das Verständnis unterstützen. Sie dürfen nicht vom Voice-over oder vom Bildinhalt ablenken.

## Zooms und Kamerabewegungen

- nicht jedes Bild braucht Bewegung
- Standard ist ein ruhiges Bild oder ein sehr dezenter Effekt
- für statische Bilder eignen sich langsame Zooms, leichte Push-ins, Pull-outs oder kleine Schwenks
- Zoom normalerweise ungefähr 2–6 %, niemals mehr als 8 %
- Schwenk höchstens 4 % der Bildbreite oder Bildhöhe
- **Hook standardmäßig `cameraMotion.type: "none"`**, damit sie sofort klar und stabil lesbar ist
- keine schnellen, pumpenden oder wiederholten Zooms
- wichtiger Bildtext, Kugelfiguren und Symbole müssen während der gesamten Bewegung sicher bleiben
- ein Effekt benötigt immer eine kurze Begründung; ohne inhaltlichen Nutzen bleibt `cameraMotion.type` auf `none`

## Übergänge

- Hook-Bild beginnt ohne Übergang ab Sekunde 0
- zwischen allen weiteren visuellen Shots ausschließlich direkter harter Schnitt
- keine Crossfades, Schwarzblenden, Dip-to-dark-, Slide-, Glitch-, Spin-, Flash- oder 3D-Übergänge
- kein schwarzes Zwischenbild und keine Ein-/Ausblendung am Bildwechsel
- neuer Bildmoment ist ab dem ersten Frame des Schnitts vollständig sichtbar
- auch interne `imagePhases` innerhalb derselben narrativen Szene wechseln per hartem Schnitt

## Soundeffekte

- Voice-over hat immer Vorrang
- Hintergrundmusik ist ausgeschaltet
- pro narrativer Szene normalerweise null bis zwei Soundeffekte
- Soundeffekte nur an einem konkreten visuellen Ereignis oder passenden Audio-Cue einsetzen
- geeignet sind dezente Whooshes, Pops, Klicks, Ticks, weiche Impacts, Papiergeräusche oder objektbezogene Geräusche
- nicht jeden Bildwechsel mit einem Whoosh versehen
- keine lauten Meme-Sounds, Jumpscares oder übertriebenen Effekte
- Lautstärke normalerweise zwischen 0,12 und 0,30; Standard ungefähr 0,20 relativ zur Voice-over-Mischung
- Soundeffekte dürfen wichtige Wörter des Voice-overs nicht verdecken
- keine urheberrechtlich geschützte Musik oder ungeklärten Audioausschnitte verwenden

## Audio-Pacing

Nach dem Einfügen des echten Voice-overs wird das Audio vor der finalen Timeline optimiert:

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
```

Verbindlich:

- Pausen ab ungefähr 0,24 Sekunden kürzen
- kurze natürliche Restpause behalten
- Voice-over exakt auf 1,10x beschleunigen
- Tonhöhe erhalten
- auf −16 LUFS integrierte Lautheit normalisieren
- höchstens −1,5 dBTP True Peak
- immer von der ursprünglichen Audiodatei ausgehen

Danach müssen Timeline und narrative Audio-Cues neu synchronisiert werden:

```bash
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

Kein Word-Sync- oder Untertitelschritt.

## Planung

Die Planung wird getrennt von den Bildprompts in `effects/effects-plan.json` gespeichert. Ein Eintrag bezieht sich auf die jeweilige narrative Szene bzw. den vorgesehenen visuellen Shot und enthält:

- `sceneId`
- `transitionIn`
- `cameraMotion`
- `soundEffects`
- kurze Begründung

Für den ersten visuellen Shot gilt `transitionIn.type: "none"`. Für alle weiteren Wechsel gilt `transitionIn.type: "cut"` und `durationSeconds: 0`.
