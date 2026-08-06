# Codex-Übergabe: Warum schließen Länder Bündnisse?

## Fertiger Inhalt

- 175 Wörter
- 13 Szenen
- runde Länder- und Kugelfiguren-Welt
- 11 Szenen mit kurzem deutschem Bildtext
- Cover-Prompt plus 13 Szenenprompts
- mittige weiße Untertitel
- harte Schnitte
- starkes Ende über Szene 12 und 13

## Externe Dateien

Lege die Dateien direkt ab:

```text
content/2026-KW32_03-08_bis_09-08/donnerstag/reel-01_warum-schliessen-laender-buendnisse/audio/voiceover-original.wav
content/2026-KW32_03-08_bis_09-08/donnerstag/reel-01_warum-schliessen-laender-buendnisse/cover/cover.png
content/2026-KW32_03-08_bis_09-08/donnerstag/reel-01_warum-schliessen-laender-buendnisse/scenes/scene-01/scene-01.png
...
content/2026-KW32_03-08_bis_09-08/donnerstag/reel-01_warum-schliessen-laender-buendnisse/scenes/scene-13/scene-13.png
```

## Pflichtprüfung der Bilder

Kein Bild nur wegen seines Dateinamens übernehmen. Jedes Bild öffnen, sichtbaren Inhalt beschreiben, mit Sprechertext, Audio-Cue, Bildidee, Bildtext und Prompt vergleichen und danach gegen Vor- und Nachbarszene prüfen. `review/scene-asset-verification.json` vollständig ausfüllen. Unter 0,90 Konfidenz nicht raten.

## Audio und Render

```bash
npm run trim:pauses -- --dir "content/2026-KW32_03-08_bis_09-08/donnerstag/reel-01_warum-schliessen-laender-buendnisse" --speed 1.10
npm run build:timeline -- --dir "content/2026-KW32_03-08_bis_09-08/donnerstag/reel-01_warum-schliessen-laender-buendnisse"
npm run sync:audio -- --dir "content/2026-KW32_03-08_bis_09-08/donnerstag/reel-01_warum-schliessen-laender-buendnisse" --strict
npm run check:content -- --dir "content/2026-KW32_03-08_bis_09-08/donnerstag/reel-01_warum-schliessen-laender-buendnisse" --strict
npm run check:visuals -- --dir "content/2026-KW32_03-08_bis_09-08/donnerstag/reel-01_warum-schliessen-laender-buendnisse" --strict
npm run finalize:reel -- --dir "content/2026-KW32_03-08_bis_09-08/donnerstag/reel-01_warum-schliessen-laender-buendnisse" --strict
npm run validate:render -- --dir "content/2026-KW32_03-08_bis_09-08/donnerstag/reel-01_warum-schliessen-laender-buendnisse"
npm run render:reel -- --dir "content/2026-KW32_03-08_bis_09-08/donnerstag/reel-01_warum-schliessen-laender-buendnisse"
```

Ziel: −16 LUFS, höchstens −1,5 dBTP, Tonhöhe erhalten. Nach dem letzten gesprochenen Wort bleibt das Schlussbild 0,7 Sekunden ohne neuen Untertitel sichtbar.
