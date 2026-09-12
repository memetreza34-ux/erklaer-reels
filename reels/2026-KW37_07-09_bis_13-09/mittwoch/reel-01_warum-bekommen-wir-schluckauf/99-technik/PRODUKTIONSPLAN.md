# PRODUKTIONSPLAN — Warum bekommen wir Schluckauf?

## Phase 1

- Slot: Mittwoch, 09.09.2026 · KW37
- Format: Reel 9:16
- Bildwelt: `serious-minimal-countryball-explainer`
- Dichte: `adaptive-dense-v2`
- Szenen: 9
- Bildmomente: 21
- Voice-over: 174 Wörter
- Ziel: 55–60 s
- Untertitel: aus
- Hintergrundmusik: aus
- harte Cuts
- Bildwechsel später am echten Voice-over-Cue, nicht in gleichmäßigen Sekundenblöcken

## Bilddichte

```text
Szene 01 → Bild 01–02
Szene 02 → Bild 03–04
Szene 03 → Bild 05–06
Szene 04 → Bild 07–08
Szene 05 → Bild 09–10
Szene 06 → Bild 11–13
Szene 07 → Bild 14–16
Szene 08 → Bild 17–18
Szene 09 → Bild 19–21
```

Jeder zusätzliche Bildmoment beginnt an einem echten gesprochenen Gedankenwechsel. Keine künstlichen Zwischenbilder nur für Tempo.

## World-Lock

Vor Bild 01 setzt Flow die neue feste Reel-Welt einmal und hält sie bis Bild 21 unverändert.

Pflicht für dieses Reel:
- cleane, seriöse, minimalistische 2D-Countryball-Welt
- dicke schwarze Konturen, flache Farben, minimale grafische Schatten
- neutrale einfarbige Kugeln; keine Flaggen
- keine normalen gezeichneten Menschen
- Kugeln groß und funktional, niemals Mini-Deko
- Fachmotive wie Zwerchfell, Stimmritze, Nervenweg und Magen dürfen allein dominieren
- pro Bild 0–3 passende Zusatzobjekte
- zwischen minimal-symbolisch, supported-explainer und einfacher Mini-Szene wechseln
- keine detaillierten realistischen Räume, kein Foto-/3D-Look

## Motion-Plan — jeder Bildmoment bewegt sich

```text
Bild 01 → subtle-push-in
Bild 02 → pan-right
Bild 03 → slow-zoom-in
Bild 04 → pan-down
Bild 05 → subtle-push-in
Bild 06 → slow-zoom-in
Bild 07 → subtle-pull-out
Bild 08 → ken-burns
Bild 09 → pan-down
Bild 10 → subtle-push-in
Bild 11 → pan-left
Bild 12 → slow-zoom-in
Bild 13 → subtle-pull-out
Bild 14 → pan-right
Bild 15 → slow-zoom-in
Bild 16 → subtle-pull-out
Bild 17 → ken-burns
Bild 18 → subtle-push-in
Bild 19 → slow-zoom-in
Bild 20 → pan-left
Bild 21 → slow-zoom-out
```

Richtwerte: Zoom 2–4 %, Pan 1–3 %, weiches Easing. `none` ist nicht zulässig.

## SFX-Plan — jeder sichtbare Wechsel bekommt einen Sound

```text
Bild 02 → soft-whoosh  | interner Hook-Wechsel
Bild 03 → soft-swipe   | neue Szene: Zwerchfell
Bild 04 → click        | Kontraktion
Bild 05 → soft-impact  | neue Szene: Luft strömt ein
Bild 06 → click        | Stimmritze schließt
Bild 07 → pop          | neue Szene: Hicks entsteht
Bild 08 → soft-whoosh  | Reflexbogen erscheint
Bild 09 → soft-swipe   | neue Szene: Hirnstamm/Nerven
Bild 10 → tick         | mehrere Auslöser
Bild 11 → soft-impact  | neue Szene: schnelles Essen
Bild 12 → click        | voller Magen/Kohlensäure
Bild 13 → pop          | Temperaturwechsel
Bild 14 → soft-swipe   | neue Szene: Zweck des Reflexes
Bild 15 → swoosh-reveal| wissenschaftliche Unsicherheit, einziges Reveal
Bild 16 → soft-whoosh  | Reflex stoppt von selbst
Bild 17 → soft-impact  | neue Szene: Hausmittel
Bild 18 → click        | Wirkung nicht zuverlässig
Bild 19 → tick         | neue Szene: 48-Stunden-Grenze
Bild 20 → soft-whoosh  | Frage: kommt es aus dem Magen?
Bild 21 → soft-impact  | finale Erklärung
```

Alle Typen stammen aus der zentralen Sound-Library. SFX später ca. 0,04 s vor dem sichtbaren Cut; Stimme bleibt dominant.

## Bildtext

- Bild 01: Covertext Pflicht
- Nicht-Cover-Bilder mit Text: 11 von 20 = 55 %
- maximal kurze deutsche Begriffe/Headlines
- übrige Bilder bewusst textfrei

## Phase 2 — Arman

1. Voice-over aus `01-voice-script/voice-script.txt` erzeugen und unter `02-audio/` ablegen.
2. `00-bildprompts/99-alle-bildprompts.txt` in Google Flow verwenden.
3. Bilder streng seriell erzeugen: ein Bild → warten → World-Lock + Inhalt prüfen → exakt `Bild NN.png` benennen → ablegen → erst dann nächstes Bild.
4. Alle 21 Bilder vollständig im aktuellen Reel-Projekt ablegen.

## Phase 3 — Antigravity

1. ausschließlich echte Assets dieses Reels prüfen
2. Voice-over Pausen/Endstille optimieren, 1,10x, −16 LUFS, max. −1,5 dBTP
3. `BILD_AUDIO_ZUORDNUNG.json` gegen das finale Audio auflösen
4. `actualStartSeconds` / `actualEndSeconds` aus echten gesprochenen Ankern setzen
5. Szenencut ca. 0,10 s vor Cue; interner Cut ca. 0,08 s vor Cue
6. Motion und SFX binden; SFX ca. 0,04 s vor Cut
7. keine Crossfades, keine Untertitel, keine Hintergrundmusik
8. Endstille entfernen; danach nur 0,5–0,7 s Schlussbild-Hold, Ziel 0,6 s
9. visuelle QC, Render-QC und finaler Export

Nicht nach pauschaler Bilddauer schneiden. Fehlende Nutzerassets niemals durch Dateien aus anderen Reels ersetzen.

## Validierungsstatus

Die inhaltliche Phase-1-Struktur ist vorbereitet. `npm test` und `npm run check:content --strict` wurden über den GitHub-Connector nicht ausgeführt und dürfen daher nicht als bestanden gelten.
