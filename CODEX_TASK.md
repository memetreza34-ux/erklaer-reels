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
visualStyleId = "serious-minimal-countryball-explainer"
```

Style-Bibel: `knowledge/fixed-visual-world.md`.

Die frühere `modern-countryball-explainer`-Welt ist für neue Reels ersetzt. YouTube bleibt vollständig getrennt.

Verbindliche Wirkung:
- seriöse cleane minimalistische 2D-Countryball-Bildsprache
- dicke schwarze Konturen, flache kontrollierte Farben, minimale grafische Schatten
- Hintergrund meist einfache Farbfläche, leichter Verlauf oder subtile Textur
- perfekt runde Kugeln bei Akteuren; Flaggen nur bei echter geografischer/politischer/kultureller Relevanz
- keine normalen illustrierten Menschen
- keine realistischen/detaillierten Innenräume
- keine kleinen dekorativen Kugeln
- 0–3 passende Zusatzobjekte, wenn sie die Aussage verbessern

Drei Kompositionsmodi gezielt mischen:
1. `minimal-symbolic`
2. `supported-explainer`
3. `simple-mini-scene`

Nicht jedes Bild nur Kugel + leerer Hintergrund. Passende Requisiten wie Thermometer, Tür, Buch, Spotlight, Grabstein, Maske, Musiknote, Gehirnsymbol, Screen, Dokument oder einfache Karte sind erwünscht, wenn sie inhaltlich nötig sind. Keine dekorative Überladung.

Prompts Englisch, sichtbarer Text ausschließlich Deutsch. Bild 01 braucht eine starke Headline; späterer Text ist optional und auf maximal 4 Wörter begrenzt.

## Bildanzahl — Adaptive Dense V2

Neue Pakete setzen:

```json
{
  "imageCountMode": "adaptive-dense-v2",
  "visualDensityVersion": 2
}
```

Zielkorridor:

```text
8 Szenen  → 19–21 Bilder
9 Szenen  → 20–22 Bilder
10 Szenen → 21–24 Bilder
```

- Hook exakt 2 Bilder
- jede weitere Szene 2 oder 3 Bilder
- dritte Phase nur bei einem echten neuen visuellen Gedanken
- ein Bild = eine klare gesprochene visuelle Kernaussage
- jede interne Bildphase mit eigenem `audioCue` aus gesprochenen Wörtern
- technische Untergrenze ca. 2,2 s; häufig guter Bereich 2,5–3,8 s
- ab ca. 4,8 s aktiv prüfen, ob ein zusätzlicher Bildmoment nötig ist
- keine starren gleich langen Bildblöcke

Legacy-Reels mit `one-hook-two-standard` bleiben renderbar, sind aber nicht mehr Standard für neue Phase-1-Pakete.

## Motion ist Pflicht

Für neue Reels darf kein Bildmoment statisch geplant werden.

Kanonische Motion-Typen:
- `ken-burns`
- `subtle-push-in`
- `subtle-pull-out`
- `slow-zoom-in`
- `slow-zoom-out`
- `pan-left`, `pan-right`, `pan-up`, `pan-down`

Richtwert: Zoom 2–4 %, Pan 1–3 %, weiches Easing. Hook und alle internen Bildphasen bewegen sich ebenfalls. `none` ist nicht zulässig.

Bekannte Aliasnamen können vom Runtime-Layer kanonisch aufgelöst werden, aber neue Pakete sollen bevorzugt direkt die kanonischen Typen verwenden.

## Soundeffekte sind Pflicht

Nur `type` aus `config/sound-library.json` verwenden.

Für jede Szene ab Szene 2:
1. ein kurzer Szenenwechsel-SFX ohne `targetId`
2. für **jede** interne Bildphase ein eigener SFX mit `targetId`

Interner SFX:
- `targetId` = konkrete Bildphase
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

Vor Bild 01 die **Serious Minimal Countryball Explainer**-Welt festsetzen. Flow arbeitet strikt seriell: genau ein Bild erzeugen → warten → prüfen → `Bild NN.png` → ablegen → prüfen → nächstes Bild. Kein Batch, keine Parallelgenerierung.

Visuelle Ablehnung insbesondere bei:
- normalen illustrierten Menschen
- realistischen Räumen/Händen/Haut
- 3D/Pixar/Anime/Mixed Media
- winzigen Deko-Kugeln
- unnötig überladener Komposition
- Stilwechsel gegenüber den bereits akzeptierten Bildern

## Phase-1-Abschluss

Vor Übergabe an den Nutzer:

```bash
npm run check:content -- --dir "<reel>" --strict
npm run export:prompts -- --dir "<reel>" --strict
```

`check:content --strict` muss insbesondere Bildstruktur und **Motion-/SFX-Hard-Gate** bestehen. Ein Reel mit statischer Bildphase, fehlendem Wechsel-SFX, unbekanntem Motion-Typ oder unbekanntem Soundtyp ist nicht Phase-1-fertig.

Nicht ausgeführte Prüfungen niemals als bestanden melden.
