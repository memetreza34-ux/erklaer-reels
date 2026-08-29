# Bewegungs- und Soundregeln

> Bei Widersprüchen gilt `CURRENT_WORKFLOW.md`.

## Grundsatz

Zooms, Kamerabewegungen und Soundeffekte sollen das Verständnis unterstützen. Sie dürfen nicht vom Voice-over oder vom Bildinhalt ablenken.

## Zooms und Kamerabewegungen

**Bewegung ist der Normalfall.** Ein Standbild ohne jede Bewegung wirkt auf einem
Smartphone tot. Etwa jede vierte Szene bleibt trotzdem bewusst ruhig, damit die
Bewegung nicht zum Dauerzustand wird.

### Bevorzugt: `ken-burns`

Kombiniert einen leichten Zoom mit einem leichten Schwenk. Das wirkt deutlich
lebendiger als ein reiner Zoom, ohne mehr Bewegung ins Bild zu bringen. Ohne eigene
Werte fährt er von Skalierung 1,02 auf 1,06 und schwenkt dabei um 3 % der Bildbreite.

### Alle Typen

| Typ | Wirkung |
|---|---|
| `ken-burns` | Zoom plus Schwenk, der hochwertigste Standard |
| `subtle-push-in` | ruhiges Herangehen, gut bei Gesichtern und Details |
| `subtle-pull-out` | Kontext öffnet sich, gut beim Einordnen |
| `slow-zoom-in` | etwas stärkeres Heranfahren für einen Höhepunkt |
| `slow-zoom-out` | Rückzug, gut vor einem Themenwechsel |
| `pan-left` / `pan-right` | horizontale Bewegung, gut bei Karten und Vergleichen |
| `pan-up` / `pan-down` | vertikale Bewegung, gut bei Höhe, Tiefe oder Schichten |
| `none` | bewusste Ruhe |

### Grenzen

- Zoom normalerweise 2–6 %, niemals mehr als 8 %
- Schwenk höchstens 4 % der Bildbreite oder Bildhöhe
- **Hook bleibt `none`**, damit sie sofort klar und stabil lesbar ist
- keine schnellen, pumpenden oder wiederholten Zooms
- wichtiger Bildtext, Kugelfiguren und Symbole müssen während der gesamten Bewegung sicher bleiben
- nicht dieselbe Bewegung über viele Szenen hintereinander

### Weiches Ein- und Auslaufen

Jede Bewegung läuft standardmäßig mit `ease-in-out`: Sie beschleunigt sanft an und
läuft weich aus. Eine lineare Fahrt startet und stoppt hart und wirkt dadurch
mechanisch — das ist der häufigste Grund, warum Zooms billig aussehen.

Über das Feld `easing` sind auch `ease-out`, `ease-in`, `ease` und `linear` möglich.
Ohne Angabe gilt `ease-in-out`.

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
- **jeder Szenenwechsel bekommt einen Sound** — der harte Schnitt wird dadurch hörbar markiert
- höchstens drei Soundeffekte pro Szene
- geeignet sind dezente Whooshes, Pops, Klicks, Ticks, weiche Impacts, Papiergeräusche oder objektbezogene Geräusche

### Welcher Sound am Schnitt

**Erste Wahl ist immer ein inhaltlich passender Effekt** zum sichtbaren Ereignis der
neuen Szene: erscheint ein Objekt, kommt `pop`; wechselt Geld den Besitzer, `coin`;
öffnet sich eine Tür, `door`.

Nur wenn kein sichtbares Ereignis passt, kommt eine der vier Transition-Varianten:

| Typ | wann |
|---|---|
| `whoosh-up` | die neue Szene steigert oder spitzt zu |
| `whoosh-down` | die neue Szene löst auf oder ordnet ein |
| `soft-whoosh` | deutlicher Themensprung |
| `soft-swipe` | neutraler Schnitt ohne eigene Aussage |

**Dieselbe Transition-Variante darf nie zweimal hintereinander stehen.** Sonst klingt
das Reel nach Vorlage. Zwischen den vier Varianten wird bewusst gewechselt.
- keine lauten Meme-Sounds, Jumpscares oder übertriebenen Effekte
- Lautstärke normalerweise zwischen 0,12 und 0,30; Standard ungefähr 0,20 relativ zur Voice-over-Mischung
- Soundeffekte dürfen wichtige Wörter des Voice-overs nicht verdecken

### Welcher Sound für welches Ereignis

Der Agent wählt **niemals einen Dateinamen**, sondern ausschließlich einen `type` aus
`config/sound-library.json`. Die Auflösung zur Datei übernimmt `npm run sync:sounds`
bzw. automatisch der Timeline-Bau.

| type | Ereignis im Bild |
|---|---|
| `soft-whoosh` | Szenenwechsel mit deutlichem Themensprung |
| `whoosh-up` | Szenenwechsel, der steigert oder zuspitzt |
| `whoosh-down` | Szenenwechsel, der auflöst oder einordnet |
| `soft-swipe` | neutraler Szenenwechsel ohne eigene Aussage |
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
