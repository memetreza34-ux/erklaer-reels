# Codex-Übergabe – Warum haben Länder Grenzen?

## Ziel

Erzeuge aus diesem vollständigen Produktionspaket ein Reel mit ungefähr einer Minute Laufzeit. Inhalt und Bildprompts sind fertig und sollen nicht grundlegend neu geschrieben werden.

## Verbindliche Werte

- Voice-over: `script/voice-script.txt`
- Textlänge: 165 Wörter
- Zielzeit: ungefähr 55–60 Sekunden
- Audio: exakt 1,10x, Tonhöhe erhalten
- Lautheit: ungefähr −16 LUFS
- True Peak: höchstens ungefähr −1,5 dBTP
- Szenen: 13
- Untertitel: exakt mittig bei 50 Prozent
- Untertitel: weiß, ohne Gelb und ohne Hintergrundbox
- Hook: `none`, danach ausschließlich `cut` mit Dauer 0
- Hintergrundmusik: aus

## Externe Dateien

Lege die 13 Bilder direkt als `scenes/scene-XX/scene-XX.png`, das Cover als `cover/cover.png` und das Original-Voice-over in `audio/` ab.

Jedes Bild tatsächlich ansehen. Ablehnen bei unerwünschter Schrift, Flaggen, realen Politikern, leerem Mittelstreifen, künstlich getrennten Bildhälften, mehrfach dargestellter Hauptfigur oder falscher Metapher.

## Danach lokal ausführen

```bash
npm run export:prompts -- --dir "content/2026-KW32_03-08_bis_09-08/montag/reel-01_warum-haben-laender-grenzen" --strict
npm run check:content -- --dir "content/2026-KW32_03-08_bis_09-08/montag/reel-01_warum-haben-laender-grenzen" --strict
npm run trim:pauses -- --dir "content/2026-KW32_03-08_bis_09-08/montag/reel-01_warum-haben-laender-grenzen" --speed 1.10
npm run build:timeline -- --dir "content/2026-KW32_03-08_bis_09-08/montag/reel-01_warum-haben-laender-grenzen"
npm run sync:audio -- --dir "content/2026-KW32_03-08_bis_09-08/montag/reel-01_warum-haben-laender-grenzen" --strict
npm run check:visuals -- --dir "content/2026-KW32_03-08_bis_09-08/montag/reel-01_warum-haben-laender-grenzen" --strict
npm run finalize:reel -- --dir "content/2026-KW32_03-08_bis_09-08/montag/reel-01_warum-haben-laender-grenzen" --strict
npm run validate:render -- --dir "content/2026-KW32_03-08_bis_09-08/montag/reel-01_warum-haben-laender-grenzen"
npm run render:reel -- --dir "content/2026-KW32_03-08_bis_09-08/montag/reel-01_warum-haben-laender-grenzen"
```

Die MP4 erst als fertig bezeichnen, wenn alle lokalen Prüfungen und der Render tatsächlich bestanden sind.
