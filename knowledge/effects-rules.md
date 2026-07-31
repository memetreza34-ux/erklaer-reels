# Bewegungs- und Soundregeln

## Grundsatz

Zooms, Kamerabewegungen, Übergänge und Soundeffekte sollen das Verständnis unterstützen. Sie dürfen nicht vom Voice-over oder vom Bildinhalt ablenken.

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

- Der normale Übergang ist ein sauberer Schnitt.
- Crossfades von ungefähr 0,1–0,25 Sekunden nur verwenden, wenn zwei Gedanken weich ineinander übergehen.
- Dezente Slides nur einsetzen, wenn eine räumliche oder logische Richtung erklärt wird.
- Keine auffälligen Glitch-, Spin-, Flash- oder 3D-Übergänge.
- Nicht denselben Spezialübergang zwischen jeder Szene wiederholen.
- Das Hook-Bild beginnt ohne Übergang ab Sekunde 0.

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

## Planung

Die Planung wird getrennt von den Bildprompts in `effects/effects-plan.json` gespeichert. Jeder Szeneneintrag enthält:

- `sceneId`
- `transitionIn`
- `cameraMotion`
- `soundEffects`
- eine kurze Begründung

Nach Einfügen des echten Voice-overs prüft Codex alle Zeitpunkte erneut gegen die Audiospur. Die Planung erzeugt noch kein fertiges Video; sie ist die verbindliche Vorlage für den späteren Schnitt oder ein Remotion-Rendering.
