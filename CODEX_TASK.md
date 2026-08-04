# Codex-Hauptauftrag

Dieses Repository produziert vollständige visuelle Erklär-Reels. Der Nutzer erzeugt Voice-over und Bilder extern. Codex übernimmt Planung, Prompt-Sammlung, Prüfung, Audio-Pacing, Synchronisierung und Remotion-Render.

## 1. Neues Reel vorbereiten

Bei einem Thema zuerst ein einfaches deutsches Voice-over-Script mit genau einem Erzähler schreiben.

- 35–44 Sekunden: normalerweise 8–10 Bildmomente
- 45–55 Sekunden: normalerweise 10–12 Bildmomente

```bash
npm run create:reel -- \
  --title "TITEL" \
  --script-file input/script.txt \
  --next-free \
  --scenes 10
```

Danach `production/agent-task.md` vollständig bearbeiten.

Pflichtdateien:

- `script/final-script.txt`
- `script/voice-script.txt`
- `reel.json`
- `scenes/scene-index.json`
- jede `scenes/scene-XX/scene.json`
- jede `scenes/scene-XX/image-prompt.txt`
- `all-image-prompts/all-image-prompts.txt`
- `subtitles/subtitle-plan.json`
- `effects/effects-plan.json`
- Cover, Caption und Quellen

```bash
npm run export:prompts -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

## 2. Kreative Regeln

- bevorzugter Einstieg: `THEMA einfach erklärt:`
- Thema sofort nennen und direkt erklären
- Hook-Bild ab Sekunde 0
- keine schulische Einleitung
- ungefähr alle 3,5–5 Sekunden sichtbare Veränderung
- konsistente Bildwelt innerhalb eines Reels
- politische Inhalte neutral
- Quellen und Unsicherheiten dokumentieren

Jede Szene benötigt `audioCue`, `leadInSeconds`, `subtitleCues`, `subtitlePosition` und `durationSeconds`.

## 3. Bildprompts und Komposition

Bildprompts sind Englisch. Sichtbarer Bildtext ist nur erlaubt, wenn er ausdrücklich nötig ist, und dann ausschließlich korrekt auf Deutsch.

Verboten:

- unerwünschte englische Wörter oder Fantasietext
- Logos und Wasserzeichen
- künstlich leerer horizontaler Mittelstreifen
- voneinander getrennte obere und untere Bildhälfte nur wegen Untertiteln
- riesige leere Baumstämme, Pfeile oder Flächen als Textplatzhalter
- Comicraster, wenn eine einheitliche Szene verlangt wird

Pflicht:

- natürliche zusammenhängende Komposition
- Hauptmotiv darf die Bildmitte nutzen
- Vergleiche möglichst seitlich oder in einer verbundenen Szene
- nur kleine wichtige Details nicht direkt hinter dem unteren Untertitelbereich platzieren

## 4. Untertitel

Zentrale Quelle: `src/shared/subtitle-style.js`.

- Position `lower`
- vertikale Position exakt 76 %
- alle Wörter in weichem Weiß `#F5F7FA`
- keine gelbe Wortmarkierung
- keine schwarze Hintergrundbox oder Balken
- dunkle Kontur und Schatten
- normalerweise 3–6 Wörter
- höchstens zwei Zeilen
- keine Wort-für-Wort-Karaoke-Animation
- Einzelwort-Sync ist ohne Wort-Highlight nicht erforderlich

Der sichtbare Untertitel wird über Cue-Zeiten synchronisiert. `sync:words` ist für diesen Stil kein Pflichtschritt.

## 5. Übergänge, Bewegung und Sound

- Hook: `none`, Dauer 0
- danach nur `cut`, Dauer 0
- keine Fades, Schwarzblenden, Slides, Glitches, Spins oder Flash-Übergänge
- Zoom normalerweise 2–6 %, maximal 8 %
- Schwenk maximal 4 %
- nicht jedes Bild bewegen
- Hintergrundmusik standardmäßig aus
- null bis zwei dezente Soundeffekte pro Szene
- Voice-over hat Vorrang

## 6. Externe Dateien

Bevorzugte direkte Ablage:

```text
scenes/scene-01/scene-01.png
scenes/scene-02/scene-02.png
...
cover/cover.png
audio/<voiceover-datei>
```

In der sichtbaren Finder-Ansicht liegen diese Ziele unter `00-bildprompts` direkt beim jeweiligen Prompt.

Jedes Bild tatsächlich ansehen und mit Sprechertext, Prompt, Metapher und Komposition vergleichen. Unter 0,75 Konfidenz nicht raten.

## 7. Audio optimieren und synchronisieren

Zentrale Quelle: `src/shared/audio-pacing-style.js`.

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
```

Standard:

- immer von der ursprünglichen Voice-over-Datei starten
- Pausen ab ungefähr 0,24 Sekunden kürzen
- kurze natürliche Restpause behalten
- Geschwindigkeit exakt `1.10x`
- Tonhöhe erhalten
- Lautheit auf `-16 LUFS` normalisieren
- True Peak auf `-1,5 dBTP` begrenzen
- bereits optimiertes Audio nicht erneut beschleunigen

In `timeline/audio-sync.json` für jede Szene den echten Zeitpunkt des gesprochenen `audioCue` eintragen.

```bash
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

## 8. Visuelle Qualitätsprüfung

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL"
```

Jedes Bild und Cover ansehen. In `review/visual-inspection.json` prüfen:

- 9:16 und ausreichende Auflösung
- natürliche zusammenhängende Komposition
- kein leerer Mittelstreifen
- keine künstlich getrennten Bildhälften
- kein unerwünschter lesbarer Text oder englische Labels
- Untertitel bei 76 % lesbar
- weißer Text mit Kontur, ohne Gelb und ohne Box
- Zoom und Schwenk schneiden nichts Wichtiges ab
- Stil bleibt konsistent

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
```

## 9. Abschluss und Render

```bash
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:render -- --dir "PFAD-ZUM-REEL"
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Nur rendern, wenn:

- Inhalt bestanden
- Audio-Pacing exakt `1.10x`
- Lautheitsnormalisierung auf `-16 LUFS` und `-1,5 dBTP`
- Audio-Cues synchronisiert
- Wort-Highlight deaktiviert
- Untertitel weiß, transparent und bei 76 %
- visuelle Prüfung bestanden
- alle Übergänge direkte Schnitte sind
- `readyForRenderer: true`

Standardausgabe:

```text
PFAD-ZUM-REEL/output/REEL-ID.mp4
```

Keine simulierte oder nur geplante Stufe als abgeschlossen bezeichnen.
