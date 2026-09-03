# Codex-Hauptauftrag

`CURRENT_WORKFLOW.md` ist bei Widersprüchen maßgeblich.

Codex übernimmt **Phase 1**: Slot, Thema, Script, Szenen, Bildprompts, Motion-/SFX-Plan, Caption und Quellen. Audio, Bilder und finaler Render gehören nicht zu Phase 1.

## Reel-Standard

- 55–60 Sekunden
- 155–175 deutsche Wörter
- 8–10 narrative Szenen, Standard 9
- Hook ab Sekunde 0
- keine Untertitel
- keine Hintergrundmusik
- Voice-over später exakt 1,10x / −16 LUFS / max. −1,5 dBTP
- Schluss-Hold später 0,5–0,7 s, Ziel 0,6 s

## Bildwelt

Für jedes neue Reel ausschließlich:

```text
visualStyleId = "modern-countryball-explainer"
```

Style-Bibel: `knowledge/fixed-visual-world.md`.

Bilder müssen konkrete lebendige Mini-Szenen sein. Keine textdominanten Lernposter, keine wiederholten Center-Figur-plus-Icons-Kompositionen. Perspektive und räumlicher Aufbau zwischen benachbarten Bildern sichtbar variieren.

Prompts Englisch, sichtbarer Text ausschließlich Deutsch. Bild 01 braucht eine starke Headline; späterer Text ist optional und auf maximal 4 Wörter begrenzt.

## Bildanzahl

```text
Bilder = 1 + (Szenen − 1) × 2
```

- Hook exakt 1 Bild
- jede weitere Szene exakt 2
- 9 Szenen = 17 Bilder
- keine dritte Bildphase
- jede Bildphase mindestens 3 Sekunden
- zweite Bildphase mit eigenem `audioCue` aus gesprochenen Wörtern

## Motion ist Pflicht

Für neue Reels darf kein Bildmoment statisch geplant werden.

Kanonische Motion-Typen:
- `ken-burns`
- `subtle-push-in`
- `subtle-pull-out`
- `slow-zoom-in`
- `slow-zoom-out`
- `pan-left`, `pan-right`, `pan-up`, `pan-down`

Richtwert: Zoom 2–4 %, Pan 1–3 %, weiches Easing. Hook und zweite Bildphase bewegen sich ebenfalls. `none` ist nicht zulässig.

Bekannte Aliasnamen können vom Runtime-Layer kanonisch aufgelöst werden, aber neue Pakete sollen bevorzugt direkt die kanonischen Typen verwenden.

## Soundeffekte sind Pflicht

Nur `type` aus `config/sound-library.json` verwenden.

Für jede Szene ab Szene 2:
1. ein kurzer Szenenwechsel-SFX ohne `targetId`
2. ein eigener interner SFX für Bildphase 2 mit `targetId`

Interner SFX:
- `targetId` = konkrete zweite Bildphase
- `audioCue` = derselbe Cue wie die Bildphase
- `visualEvent` Pflicht
- `reason` Pflicht

Typische Lautstärke 0,18–0,30. Stimme bleibt später dominant.

Bevorzugte Übergangstypen: `soft-whoosh`, `soft-swipe`, `whoosh-up`, `whoosh-down`. Kleine Informationswechsel: `click`, `pop`, `tick`. Inhaltliche Objekt-Sounds bevorzugen, wenn passend.

## Schnitt-Timing für Phase 3 vorbereiten

- Szenencut später ca. 0,10 s vor Szenen-Cue
- interner Bildcut später ca. 0,08 s vor Bild-Cue
- SFX später ca. 0,04 s vor sichtbarem Cut

Phase 1 liefert dafür eindeutige Cues; Phase 3 setzt die echten Zeitwerte aus dem finalen Voice-over.

## Quellen

Neue Reels brauchen:
- mindestens zwei echte HTTPS-Quellen
- unterschiedliche Hosts
- mindestens eine Primär-/offizielle oder wissenschaftliche Originalquelle
- mindestens eine unabhängige Sekundär-/Fachquelle
- konkrete `Belegt`-/`supports`-Zuordnung

## Google Flow

Verbindliche Datei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Flow arbeitet strikt seriell: genau ein Bild erzeugen → warten → prüfen → `Bild NN.png` → ablegen → prüfen → nächstes Bild. Kein Batch, keine Parallelgenerierung.

## Phase-1-Abschluss

Vor Übergabe an den Nutzer:

```bash
npm run check:content -- --dir "<reel>" --strict
npm run export:prompts -- --dir "<reel>" --strict
```

`check:content --strict` muss insbesondere das **Motion-/SFX-Hard-Gate** bestehen. Ein Reel mit statischer Szene, fehlendem Wechsel-SFX, unbekanntem Motion-Typ oder unbekanntem Soundtyp ist nicht Phase-1-fertig.

Nicht ausgeführte Prüfungen niemals als bestanden melden.
