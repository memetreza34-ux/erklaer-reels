# Technische Codex-Übergabe

Das kreative Produktionspaket für **Gruppendruck einfach erklärt** ist vollständig. Inhalt nicht neu schreiben, sondern technisch prüfen und nach Eintreffen der externen Assets fertigstellen.

## Assets

Lege die Dateien direkt hier ab:

```text
cover/cover.png
scenes/scene-01/scene-01.png
...
scenes/scene-10/scene-10.png
audio/voiceover.mp3
```

Jedes Szenenbild muss den zugehörigen `image-prompt.txt` erfüllen. Bilder mit unerwünschter Schrift, leerem Mittelstreifen, getrennter oberer und unterer Bildhälfte oder unnatürlichen Figuren ablehnen.

## Audio

Immer von `audio/voiceover.mp3` starten:

```bash
npm run trim:pauses -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert" --speed 1.10
```

Pflichtwerte: exakt 1.10x, Tonhöhe erhalten, -16 LUFS, -1,5 dBTP und 48 kHz. Danach alle Szenen- und Untertitel-Cues neu synchronisieren.

## Prüfung und Render

```bash
npm run export:prompts -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert" --strict
npm run validate:reel -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert"
npm run check:content -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert" --strict
npm run trim:pauses -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert" --speed 1.10
npm run build:timeline -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert"
npm run sync:audio -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert" --strict
npm run check:visuals -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert" --strict
npm run finalize:reel -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert" --strict
npm run validate:render -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert"
npm run render:reel -- --dir "content/2026-KW32_03-08_bis_09-08/mittwoch/reel-01_gruppendruck-einfach-erklaert"
```

`sync:words` ist nicht erforderlich, weil keine gelbe Wortmarkierung verwendet wird.
