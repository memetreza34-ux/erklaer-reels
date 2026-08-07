# Technische Codex-Übergabe – Version 2

Der erste Render wurde vollständig analysiert. Script und Grundstil bleiben erhalten; Bilder, Untertitel und Audioexport werden verbessert.

## 1. Neue Bilder

Verwende ausschließlich die aktualisierten Prompts unter `scenes/scene-XX/image-prompt.txt`.

Pflicht-Neuerzeugung:

- `scene-01.png`
- `scene-05.png`
- `scene-07.png`
- `scene-09.png`
- `scene-10.png`

Lege jedes Bild direkt in den passenden Szenenordner. Prüfe auch die übrigen fünf Bilder. Neu erzeugen, sobald eines dieser Probleme sichtbar ist:

- leerer horizontaler Mittelstreifen
- getrennte obere und untere Bildhälfte
- zufällige oder englische Schrift
- unnatürlich große leere Flächen
- Comicraster statt einer zusammenhängenden Szene

## 2. Untertitel

Verbindlicher Stil:

- Position unten bei exakt 76 Prozent
- alle Wörter weiß
- keine gelbe Wortmarkierung
- keine schwarze Box oder Hintergrundfläche
- dunkle Kontur und dezenter Schatten
- höchstens zwei Zeilen

`sync:words` ist ohne Wort-Highlight nicht erforderlich.

## 3. Audio

Das Voice-over muss erneut von der ursprünglichen Audiodatei verarbeitet werden:

```bash
npm run trim:pauses -- --dir "content/2026-KW32_03-08_bis_09-08/dienstag/reel-01_sozialismus-einfach-erklaert" --speed 1.10
```

Pflichtwerte:

- Geschwindigkeit exakt `1.10x`
- Tonhöhe erhalten
- lange Pausen kürzen
- Ziellautheit `-16 LUFS`
- True Peak `-1,5 dBTP`
- nicht die bereits beschleunigte Datei erneut beschleunigen

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

Version 2 ist erst freigegeben, wenn neue Bilder, weiße Untertitel ohne Box, `1.10x`-Audio und die strenge visuelle Prüfung bestanden sind.
