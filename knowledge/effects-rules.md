# Bewegungs- und Soundregeln

> Bei Widersprüchen gilt `CURRENT_WORKFLOW.md`.

## Grundsatz

Für neue Reels sind Zoom/Kamerabewegung und SFX keine optionale Dekoration mehr. Sie gehören zum verbindlichen Schnittsystem:

- **jeder Bildmoment bewegt sich sichtbar, aber dezent**
- **jeder Szenenwechsel nach der Hook besitzt einen SFX**
- **jeder interne Bildwechsel besitzt einen eigenen SFX oder passenden Objekt-Sound**
- Stimme bleibt immer dominant

Ab 2026-09-02 werden diese Punkte technisch als Hard Gates geprüft.

## Bewegung/Zoom — kein statischer Stillframe

Ein Bild darf nicht mehrere Sekunden wie eine unbewegte Slide stehen. Hook, erste Bildphase und zweite Bildphase erhalten Bewegung.

### Kanonische Typen

| Typ | Wirkung |
|---|---|
| `ken-burns` | leichter Zoom plus kleiner Schwenk; hochwertiger Standard |
| `subtle-push-in` | ruhiges Herangehen |
| `subtle-pull-out` | Kontext öffnet sich |
| `slow-zoom-in` | etwas stärkeres Heranfahren |
| `slow-zoom-out` | ruhiger Rückzug |
| `pan-left` / `pan-right` | horizontaler Fokuswechsel |
| `pan-up` / `pan-down` | vertikaler Fokuswechsel |

`none` bleibt nur für Legacy-Kompatibilität im Schema. Für neue Reels blockiert der Hard Gate statische Motion.

Bekannte ältere/beschreibende Aliase werden vor der Ausführung kanonisch aufgelöst, damit sie nicht versehentlich statisch rendern, z. B. `gentle-pan` → `ken-burns`. Wirklich unbekannte Typen blockieren.

### Richtwerte

- Zoomänderung normalerweise 2–4 %
- erlaubter sicherer Scale-Bereich 0,94–1,06
- Pan normalerweise 1–3 %, maximal 3 %
- Standard-Easing `ease-in-out`
- keine schnellen, pumpenden oder hektischen Zooms
- Bewegung darf wichtigen Bildtext oder das Hauptmotiv nicht aus dem Frame schieben
- benachbarte Bilder möglichst nicht immer identisch bewegen

Der Renderer besitzt zusätzlich einen Safety-Fallback: Fehlt Motion im Renderplan oder steht dort `none`, wird ein dezenter Push-in/Pull-out gerendert. Das ersetzt nicht den Planungs-Hard-Gate, sondern verhindert einen statischen Ausreißer als letzte Sicherheitsstufe.

## Übergänge und Cue-Timing

- Hook beginnt ab Sekunde 0
- danach nur harte Cuts
- kein Crossfade, Dip-to-dark, Slide, Glitch, Spin oder schwarzes Zwischenbild
- Szenenwechsel ca. **0,10 s vor dem gesprochenen Szenen-Cue**
- interne Bildwechsel ca. **0,08 s vor dem gesprochenen Bild-Cue**
- bei 30 fps entspricht 0,08 s ungefähr 2–3 Frames

Ziel: Das neue Bild ist schon sichtbar, wenn das Schlüsselwort gesprochen wird.

## Soundeffekte — jeder Wechsel klingt

Der Agent plant niemals beliebige Dateinamen, sondern nur einen `type` aus `config/sound-library.json`. `sync:sounds --strict` löst Typ → Datei auf und kopiert die benötigte Datei in den Reel-Ordner.

### Pflicht-Coverage

- Szene 1 startet ohne Übergangs-SFX vor dem Video.
- Jede narrative Szene ab Szene 2 braucht mindestens einen nicht zielgebundenen Übergangs-SFX.
- Jede zweite Bildphase braucht einen SFX mit `targetId` auf genau diese Bildphase.
- Der interne SFX trägt denselben `audioCue` wie die Bildphase.
- `visualEvent` und `reason` sind Pflicht.
- Maximal drei SFX pro narrativer Szene.

### Timing und Lautstärke

- SFX startet standardmäßig **0,04 s vor dem sichtbaren Cut**.
- Der hörbare Akzent soll am Schnitt liegen.
- typische Lautstärke 0,18–0,30
- Standard ungefähr 0,22
- Voice-over darf niemals verdeckt werden
- dieselbe Transition-Variante nicht direkt zweimal hintereinander

### Zentrale Soundtypen

| type | Einsatz |
|---|---|
| `soft-whoosh` | deutlicher Themensprung |
| `whoosh-up` | Steigerung/Zuspitzung |
| `whoosh-down` | Auflösung/Einordnung |
| `soft-swipe` | neutraler Szenenwechsel |
| `pop` | neues Objekt/Element erscheint |
| `click` | kleiner klarer Fokuswechsel |
| `tick` | Zeit/Schritt/Abfolge |
| `soft-impact` | sichtbare Belastung/Aufprall/Gewicht |
| `paper` | Papier, Dokument, Karte |
| `swoosh-reveal` | Aha-/Reveal-Moment, höchstens einmal |
| `door` | Tür/Tor/Barriere öffnet oder schließt |
| `coin` | sichtbares Geld/Kostenereignis |
| `water-drop` | sichtbarer Tropfen/Wasserereignis |

Inhaltlich passender Sound ist besser als ein generischer Whoosh. Wenn kein spezielles Objektgeräusch passt, wird trotzdem ein kurzer sauberer Transition-/Informations-SFX verwendet — ein sichtbarer Wechsel bleibt nicht stumm.

## Warum Sounds früher verschwinden konnten

Zwischen Effektplan, Timeline und Renderplan kann ein `file`-Feld verloren gehen. Deshalb gelten jetzt mehrere Sicherheitsstufen:

1. `sync:sounds --strict` bindet jeden bekannten `type` an seine echte Library-Datei.
2. Motion-/SFX-Hard-Gate prüft Typ, Coverage und Metadaten.
3. Finalizer und Renderer synchronisieren die Soundbibliothek erneut.
4. `ReelComposition.jsx` kann einen bekannten Soundtyp als letzten Safety-Fallback erneut auf `sfx/<datei>` auflösen.

Unbekannte Typen oder fehlende Library-Dateien blockieren den Render.

## Audio-Pacing und Endstille

```bash
npm run trim:pauses -- --dir "<reel>" --speed 1.10
```

Verbindlich:
- Anfangs- und überlange Pausen straffen
- Endstille entfernen
- exakt 1,10x, Pitch erhalten
- −16 LUFS
- max. −1,5 dBTP
- echte Nachmessung

Das finale Voice-over darf höchstens **0,25 s Endstille** besitzen. Danach folgt nur der separate visuelle Schluss-Hold von 0,5–0,7 s, Ziel 0,6 s. Finalizer und Renderer messen/prüfen dies als Hard Gate.

## Verbindliche Phase-3-Reihenfolge

```bash
npm run trim:pauses -- --dir "<reel>" --speed 1.10
npm run sync:sounds -- --dir "<reel>" --strict
npm run build:timeline -- --dir "<reel>" --strict
npm run finalize:reel -- --dir "<reel>" --strict
npm run validate:render -- --dir "<reel>"
npm run render:reel -- --dir "<reel>"
```

`--force` darf die Motion/SFX-, Soundbibliothek-, Audio-Dateibindungs- und Endstille-Hard-Gates nicht umgehen.
