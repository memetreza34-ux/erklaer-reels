# Technische Codex-Übergabe – Version 2

Der erste Render wurde visuell analysiert. Script, Audio-Pacing und Grundstil sind brauchbar; Untertitel und mehrere Szenenbilder müssen korrigiert werden.

## 1. Repo und Finder aktualisieren

```bash
npm run organize:finder -- --dir "content/2026-KW32_03-08_bis_09-08/dienstag/reel-01_sozialismus-einfach-erklaert"
```

## 2. Neue Bildregeln

Verwende ausschließlich die aktualisierten Prompts unter `scenes/scene-XX/image-prompt.txt`.

Pflicht-Neuerzeugung:

- `scene-01.png`
- `scene-05.png`
- `scene-07.png`
- `scene-09.png`
- `scene-10.png`

Lege jedes Bild direkt in seinen passenden Szenenordner. Prüfe auch die übrigen fünf Bilder auf leere Mittelstreifen, getrennte obere/untere Bildhälften und unerwünschte Schrift. Fehlerhafte Bilder ebenfalls neu erzeugen.

## 3. Untertitel

Der neue Stil ist verbindlich:

- Position unten bei exakt 76 Prozent
- alle Wörter weiß
- keine gelbe Wortmarkierung
- keine schwarze Box oder Hintergrundfläche
- dunkle Kontur und Schatten

`sync:words` ist ohne Wort-Highlight nicht erforderlich.

## 4. Prüfung und Render

```bash
npm run export:prompts -- --dir "content/2026-KW32_03-08_bis_09-08/dienstag/reel-01_sozialismus-einfach-erklaert" --strict
npm run check:content -- --dir "content/2026-KW32_03-08_bis_09-08/dienstag/reel-01_sozialismus-einfach-erklaert" --strict
npm run build:timeline -- --dir "content/2026-KW32_03-08_bis_09-08/dienstag/reel-01_sozialismus-einfach-erklaert"
npm run sync:audio -- --dir "content/2026-KW32_03-08_bis_09-08/dienstag/reel-01_sozialismus-einfach-erklaert" --strict
npm run check:visuals -- --dir "content/2026-KW32_03-08_bis_09-08/dienstag/reel-01_sozialismus-einfach-erklaert" --strict
npm run finalize:reel -- --dir "content/2026-KW32_03-08_bis_09-08/dienstag/reel-01_sozialismus-einfach-erklaert" --strict
npm run validate:render -- --dir "content/2026-KW32_03-08_bis_09-08/dienstag/reel-01_sozialismus-einfach-erklaert"
npm run render:reel -- --dir "content/2026-KW32_03-08_bis_09-08/dienstag/reel-01_sozialismus-einfach-erklaert"
```

Beim finalen Audioexport die Lautheit möglichst auf ungefähr `-16 LUFS` und den True Peak auf höchstens ungefähr `-1,5 dBTP` bringen.
