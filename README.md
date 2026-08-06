# Erklär-Reels

Produktionspipeline für visuelle Erklär-Reels zu Politik, Gesellschaft, Ländern, Geografie, Geschichte, Psychologie und menschlichem Verhalten.

> Warum Menschen, Länder und Gesellschaften so funktionieren.

## Neuer Standard

- 55–60 Sekunden
- 155–175 deutsche Wörter
- 12–14 Szenen, Standard 13
- genau ein klarer Bildmoment pro Szene
- starkes Ende über mindestens zwei Szenen
- Voice-over exakt 1,10x mit erhaltener Tonhöhe
- −16 LUFS und höchstens −1,5 dBTP
- weiße Untertitel exakt mittig bei 50 %
- keine gelben Wörter und keine schwarze Box
- direkte harte Schnitte
- natürliche Bildkomposition ohne künstliche Untertitelfläche

## Starkes Ende

Die vorletzte Szene stellt eine persönliche Prüf-, Erkenntnis- oder Entscheidungsfrage. Die letzte Szene zeigt eine konkrete Lösung und endet mit einem kurzen einprägsamen Satz. Keine abrupte Aufzählung und kein überladenes Mehrschritt-Bild.

## Bilder

- Hook ab Sekunde 0
- sichtbarer Wechsel ungefähr alle 3,5–5 Sekunden
- Hauptmotive dürfen die exakte Bildmitte nutzen und hinter Untertiteln liegen
- keine leere horizontale Zone, keine getrennten Bildhälften und keine gestapelten Panels
- keine mehrfach dargestellte Hauptperson innerhalb eines Bildes
- keine zufälligen Wörter, Fantasie-Labels, Logos oder Wasserzeichen
- Cover-Prompt steht in der Sammeldatei vor allen Szenenprompts

## Untertitel

- `position: center`
- exakt 50 % Bildhöhe
- Weiß `#F5F7FA`
- dunkle Kontur und Schatten
- transparenter Hintergrund
- 3–6 Wörter, höchstens zwei Zeilen
- kein Wort-Highlight und keine Karaoke-Animation

## Audio und Schnitt

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

Die Verarbeitung startet immer von der ursprünglichen Voice-over-Datei. Pausen werden gestrafft, das Audio auf exakt 1,10x beschleunigt, die Tonhöhe erhalten und die Lautheit normalisiert. Hook ohne Übergang; danach ausschließlich `cut` mit Dauer 0.

## Neues Reel

```bash
npm run create:reel -- \
  --title "Was ist Demokratie?" \
  --script-file input/script.txt \
  --next-free \
  --scenes 13
```

Danach:

```bash
npm run export:prompts -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

## Ordnerstruktur

```text
reel-01_thema/
├── 00-bildprompts/
│   ├── 00-cover/
│   ├── 01-scene-01/
│   ├── ...
│   ├── 13-scene-13/
│   └── 99-alle-bildprompts.txt
├── 01-voice-script/
├── 02-audio/
├── 03-caption/
├── 04-video/
└── 99-technik/
```

Szenenbilder direkt beim passenden Prompt ablegen:

```text
scenes/scene-01/image-prompt.txt
scenes/scene-01/scene-01.png
cover/cover.png
audio/voiceover.mp3
```

## Prüfung und Render

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:render -- --dir "PFAD-ZUM-REEL"
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Die Freigabe blockiert falsche Dauer oder Szenenzahl, ein schwaches Ende, altes 1,05x-Audio, fehlende Lautheitsnormalisierung, falsche Untertitelwerte und nicht geprüfte Bilder.

## Voraussetzungen

- Node.js 20 oder neuer
- FFmpeg und optional `ffprobe`
- Remotion-Pakete in identischer Version
- aktuelle Remotion-Lizenzbedingungen vor geschäftlicher Nutzung prüfen
