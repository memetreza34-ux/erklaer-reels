# Produktionsregeln

> Bei Widersprüchen gilt immer `CURRENT_WORKFLOW.md`.

## Ziel

Jedes Reel erklärt einen Begriff, ein System, ein Verhalten oder einen Zusammenhang ohne Vorwissen verständlich. Themenwelt offen, Bildwelt fest: `modern-countryball-explainer`.

## Script

- ein deutscher Erzähler
- direkte Hook
- 155–175 Wörter
- 55–60 s finales Voice-over
- einfache erwachsene Sprache
- letzte zwei Szenen: Prüf-/Erkenntnisfrage → konkrete Lösung/Abschluss

## Bildwelt

Neue Reels verwenden ausschließlich `modern-countryball-explainer`.

- 9:16
- runde Kugelfiguren, wenn Akteure sinnvoll sind
- konkrete Handlung oder Ursache-Folge
- dicke schwarze Konturen
- kontrollierte Farben
- einfache Tiefe und kontextuelle Umgebung
- niedrige bis mittlere Detaildichte
- Perspektiven zwischen benachbarten Bildern variieren
- keine textdominanten Poster, Floating Cards oder wiederholten Center-Layouts
- keine realistischen Menschen, Stick-Figuren, Anime-, Clay- oder glossy-3D-Welt

Ein Objekt/Mechanismus/Karte/Dokument darf die Szene ohne Kugelfigur tragen, wenn es klarer erklärt.

## Bildprompts und Bildtext

- Bildprompts Englisch
- sichtbarer Text ausschließlich Deutsch
- Bild 01: starke Headline Pflicht
- spätere Bilder: `imageText` optional, maximal 4 Wörter
- ungefähr 35–60 % der Nicht-Cover-Bilder dürfen Text tragen
- textfreie starke Bilder sind erwünscht
- kein zusätzlicher lesbarer Text, keine Logos/Wasserzeichen

## Bildanzahl

Feste Formel:

```text
Bilder = 1 + (Szenen − 1) × 2
```

- 8 Szenen = 15 Bilder
- 9 Szenen = 17 Bilder
- 10 Szenen = 19 Bilder
- Hook genau 1 Bildphase
- jede weitere Szene genau 2
- keine dritte Bildphase
- mindestens 3 s pro Bildphase

Die zweite Bildphase besitzt einen eigenen `audioCue`. `startPercent` ist Planungswert; das finale Voice-over liefert später den echten Cue-Zeitpunkt.

## Schnitt

- Szenencut ca. 0,10 s vor dem Szenen-Cue
- interner Bildcut ca. 0,08 s vor dem Bild-Cue
- harter Cut, kein Crossfade
- SFX ca. 0,04 s vor dem sichtbaren Cut

## Bewegung/Zoom — Hard Gate

**Jeder Bildmoment eines neuen Reels bewegt sich sichtbar.**

Kanonische Typen:
- `ken-burns`
- `subtle-push-in`, `subtle-pull-out`
- `slow-zoom-in`, `slow-zoom-out`
- `pan-left/right/up/down`

Richtwerte:
- Zoom meist 2–4 %
- Scale sicher 0,94–1,06
- Pan 1–3 %, max. 3 %
- weiches Easing
- Hook und zweite Bildphase bewegen sich ebenfalls
- `none` ist für neue Reels nicht zulässig

Bekannte ältere Aliasnamen werden kanonisch aufgelöst, damit sie nicht versehentlich statisch rendern. Unbekannte Typen blockieren. Renderer-Safety-Fallback verhindert zusätzlich statische Ausreißer.

## SFX — Hard Gate

- jeder Szenenwechsel ab Szene 2 braucht einen SFX
- jeder interne Bildwechsel braucht eigenen zielgebundenen SFX
- ausschließlich `type` aus `config/sound-library.json`
- `targetId`, `visualEvent` und `reason` korrekt setzen
- interner `audioCue` soll dem Cue der Bildphase entsprechen
- typische Lautstärke 0,18–0,30
- maximal drei SFX pro narrativer Szene
- Hintergrundmusik aus
- Voice-over bleibt dominant

`sync:sounds --strict` bindet Typen an echte Dateien. Unbekannte Typen oder fehlende Dateien blockieren. Der Renderer kann bekannte Typen als letzte Sicherheitsstufe erneut zur kanonischen Datei auflösen, falls ein Zwischenplan das `file`-Feld verliert.

Details: `knowledge/effects-rules.md`.

## Audio

- Originalaudio verarbeiten
- Anfangs-/überlange Pausen und Endstille straffen
- exakt 1,10x, Pitch erhalten
- −16 LUFS
- max. −1,5 dBTP
- echte Nachmessung
- danach Timeline/Cues neu synchronisieren

Das finale Voice-over darf höchstens **0,25 s Endstille** enthalten. Danach folgt ausschließlich der separate visuelle Schluss-Hold von 0,5–0,7 s, Ziel 0,6 s.

## Google Flow

Einzige Nutzerdatei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Strikt seriell: ein Bild → warten → prüfen → korrekt benennen/ablegen → prüfen → nächstes. Kein Batch/Parallelisieren.

## Quellen

Neue Reels verwenden Quellen-Schema 3:
- mindestens zwei HTTPS-Quellen
- unterschiedliche Hosts
- mindestens eine Primär-/offizielle oder wissenschaftliche Originalquelle
- mindestens eine unabhängige Sekundär-/Fachquelle
- konkrete Aussage-Zuordnung unter `Belegt`

## Bildzuordnung

Dateinummer nur als Routing-Hilfe. Tatsächlichen sichtbaren Inhalt gegen Narration, Bildphase, Prompt und feste Bildwelt prüfen. Unter 0,90 Konfidenz nicht raten.

## Untertitel

Global deaktiviert. Kein aktiver Word-Sync und keine Subtitle-Safe-Zone.

## Hard-Gate-Kette

```bash
npm run check:content -- --dir "<reel>" --strict
npm run trim:pauses -- --dir "<reel>" --speed 1.10
npm run sync:sounds -- --dir "<reel>" --strict
npm run build:timeline -- --dir "<reel>" --strict
npm run check:visuals -- --dir "<reel>" --strict
npm run finalize:reel -- --dir "<reel>" --strict
npm run validate:render -- --dir "<reel>"
npm run render:reel -- --dir "<reel>"
```

Motion/SFX-, Quellen-, Audio-Dateibindungs- und Endstille-Gates dürfen nicht per `--force` umgangen werden.

## Definition of Done

- Script/Quellen geprüft
- alle Bildphasen vorhanden und visuell freigegeben
- jede Bildphase sichtbar bewegt
- jeder Szenen-/interne Bildwechsel mit gerendertem SFX
- echtes finales Voice-over gemessen
- Endstille <= 0,25 s
- echte Cue-Zeiten gesetzt
- Schluss-Hold 0,5–0,7 s
- Finalizer/Renderer tatsächlich bestanden
- MP4 + Caption unter `03-export/`

Nicht ausgeführte Prüfungen niemals als bestanden melden.
