# Codex-Übergabe – Gruppendruck Version 2

## Ziel

Erzeuge aus dem überarbeiteten Paket ein neues Reel mit ungefähr einer Minute Laufzeit. Die alte 39-Sekunden-Version darf nicht wiederverwendet oder nur verlängert werden.

## Verbindliche Werte

- Voice-over: `script/voice-script.txt`
- Textlänge: 168 Wörter
- Ziel: ungefähr 55–60 Sekunden
- Audio: exakt 1,10x, Tonhöhe erhalten
- Lautheit: ungefähr −16 LUFS
- True Peak: höchstens ungefähr −1,5 dBTP
- Szenen: 14
- Untertitel: exakt mittig bei 50 Prozent
- Untertitel: weiß, ohne Gelb und ohne Hintergrundbox
- Übergänge: Hook `none`, danach ausschließlich `cut` mit Dauer 0
- Hintergrundmusik: aus

## Bilder

Erzeuge alle 14 Bilder neu aus den aktuellen Dateien unter `scenes/scene-XX/image-prompt.txt` und lege sie direkt als `scenes/scene-XX/scene-XX.png` ab.

Pflichtprüfung je Bild:

- genau ein klarer Moment
- natürliche zusammenhängende Komposition
- keine mehrfach dargestellte Hauptperson
- kein leerer horizontaler Mittelstreifen
- keine getrennte obere und untere Bildhälfte
- keine unerwünschte Schrift
- das Hauptmotiv darf hinter den mittigen Untertiteln liegen
- keine künstliche Freifläche für Untertitel erzeugen

## Ende

- Szene 13 ist ausschließlich die persönliche Prüfungsfrage.
- Szene 14 ist ausschließlich die ruhige eigene Entscheidung mit einer unterstützenden Vertrauensperson.
- Kein dreistufiges Anleitungspanorama und keine mehrfach kopierte Figur.

## Ablauf

```bash
npm run organize:finder -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert"
npm run export:prompts -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert" --strict
npm run check:content -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert" --strict
npm run trim:pauses -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert"
npm run build:timeline -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert"
npm run sync:audio -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert" --strict
npm run check:visuals -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert" --strict
npm run finalize:reel -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert" --strict
npm run validate:render -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert"
npm run render:reel -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert"
```

Die neue MP4 erst als fertig bezeichnen, wenn Audio, 14 Bilder, mittige Untertitel, visuelle Prüfung und Renderer-Validierung tatsächlich bestanden sind.
