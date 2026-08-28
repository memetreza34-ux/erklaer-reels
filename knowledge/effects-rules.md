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

### Welcher Sound für welches Ereignis

Der Agent wählt **niemals einen Dateinamen**, sondern ausschließlich einen `type` aus
`config/sound-library.json`. Die Auflösung zur Datei übernimmt `npm run sync:sounds`
bzw. automatisch der Timeline-Bau.

| type | Ereignis im Bild |
|---|---|
| `soft-whoosh` | Bildwechsel mit deutlichem Themensprung, höchstens zweimal pro Reel |
| `pop` | ein Objekt oder eine Figur erscheint sichtbar neu |
| `click` | eine konkrete Zahl oder ein Schlüsselbegriff wird betont |
| `tick` | Zeit, Zählen, Abfolge, Kalender, Uhr |
| `soft-impact` | etwas fällt, trifft auf oder wird sichtbar belastet |
| `paper` | Dokument, Vertrag, Karte, Blättern |
| `swoosh-reveal` | der Aha-Moment, genau einmal pro Reel |
| `door` | Tür, Tor oder Grenze öffnet oder schließt sich sichtbar |
| `coin` | Geld wechselt sichtbar den Besitzer |
| `water-drop` | ein Tropfen oder Wasser trifft sichtbar auf |

**Grundregel:** Ein Sound gehört an ein **sichtbares Ereignis**, nicht an eine Aussage.
Wenn das Voice-over über Geld spricht, im Bild aber keine Münze zu sehen ist, kommt
kein `coin`. Ohne sichtbaren Anlass bleibt `soundEffects` leer.

Jeder Eintrag braucht eine Begründung in `reason` und einen Bezug in `visualEvent`.
Ein Eintrag sieht so aus:

```json
{
  "type": "pop",
  "atPercent": 0.35,
  "visualEvent": "Die zweite Länderkugel erscheint neben der ersten",
  "reason": "Markiert den Moment, in dem der Vergleich sichtbar wird"
}
```

`file` und `volume` trägt das System selbst ein. Der Zeitpunkt kommt wahlweise über
`atPercent` (Anteil der Szenendauer), `offsetSeconds` (ab Szenenbeginn) oder
`timeSeconds` (absolut).
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
