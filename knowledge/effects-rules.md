# Bewegungs- und Soundregeln

## Grundsatz

Zooms, Kamerabewegungen und Soundeffekte sollen das Verständnis unterstützen. Sie dürfen nicht vom Voice-over oder vom Bildinhalt ablenken.

## Zooms und Kamerabewegungen

- Nicht jedes Bild braucht Bewegung.
- Standard ist ein ruhiges Bild oder ein sehr dezenter Effekt.
- Für statische Bilder eignen sich langsame Zooms, leichte Push-ins, Pull-outs oder kleine Schwenks.
- Ein Zoom verändert die Bildgröße normalerweise nur um ungefähr 2–6 Prozent; niemals mehr als 8 Prozent.
- Ein Schwenk bewegt das Bild normalerweise höchstens 4 Prozent der Bildbreite oder Bildhöhe.
- Die Hook darf einen dezenten Push-in erhalten, wenn dadurch die Aufmerksamkeit steigt.
- Keine schnellen, pumpenden oder wiederholten Zooms.
- Wichtiger Bildtext, Gesichter, Symbole und Untertitel müssen während der gesamten Bewegung in der sicheren Zone bleiben.
- Ein Effekt benötigt immer eine kurze Begründung. Ohne inhaltlichen Nutzen bleibt `cameraMotion.type` auf `none`.

## Übergänge

- Das Hook-Bild beginnt ohne Übergang ab Sekunde 0.
- Zwischen allen weiteren Szenen wird ausschließlich ein direkter harter Schnitt verwendet.
- Keine Crossfades, Schwarzblenden, Dip-to-dark-, Slide-, Glitch-, Spin-, Flash- oder 3D-Übergänge.
- Kein schwarzes Zwischenbild und keine Ein- oder Ausblendung am Szenenwechsel.
- Der neue Bildmoment ist ab dem ersten Frame des Schnitts vollständig sichtbar.
- Das Tempo entsteht durch gute Bildauswahl, passende Bildwechsel und das Voice-over, nicht durch Übergangsanimationen.

## Soundeffekte

- Das Voice-over hat immer Vorrang.
- Hintergrundmusik ist standardmäßig ausgeschaltet.
- Pro Szene normalerweise null bis zwei Soundeffekte.
- Soundeffekte nur an einem konkreten visuellen Ereignis oder `audioCue` einsetzen.
- Geeignet sind dezente Whooshes, Pops, Klicks, Ticks, weiche Impacts, Papiergeräusche oder objektbezogene Geräusche.
- Nicht jeden Bildwechsel mit einem Whoosh versehen.
- Keine lauten Meme-Sounds, Jumpscares oder übertriebenen Effekte.
- Lautstärke normalerweise zwischen 0,12 und 0,30; Standard 0,20 relativ zur Voice-over-Mischung.
- Soundeffekte dürfen wichtige Wörter des Voice-overs nicht verdecken.
- Keine urheberrechtlich geschützte Musik oder ungeklärten Audioausschnitte verwenden.

## Audio-Pacing

Nach dem Einfügen des echten Voice-overs wird das Audio vor der Timeline optimiert:

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL"
```

Standardwerte:

- Pausen ab ungefähr 0,24 Sekunden werden gekürzt.
- Nur eine sehr kurze natürliche Restpause bleibt erhalten.
- Das Voice-over wird mit `1.05x` leicht beschleunigt.
- Die Tonhöhe bleibt erhalten.
- Danach müssen Timeline, Audio-Cues und Codex-Wortzeiten neu synchronisiert werden.

## Planung

Die Planung wird getrennt von den Bildprompts in `effects/effects-plan.json` gespeichert. Jeder Szeneneintrag enthält:

- `sceneId`
- `transitionIn`
- `cameraMotion`
- `soundEffects`
- eine kurze Begründung

Für Szene 1 gilt `transitionIn.type: "none"`. Für jede weitere Szene gilt `transitionIn.type: "cut"` und `durationSeconds: 0`.
