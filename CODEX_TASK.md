# Codex-Hauptauftrag

Dieses Repository produziert vollständige visuelle Erklär-Reels. Der Nutzer erzeugt Voice-over und Bilder extern. Codex übernimmt Planung, Prompt-Sammlung, Prüfung, Audio-Pacing, Synchronisierung und Remotion-Render.

## Neues Reel

- genau ein deutscher Erzähler
- 155–175 Wörter
- 55–60 Sekunden nach Audiooptimierung
- 12–14 Bildmomente, Standard 13
- Geschwindigkeit exakt 1,10x

```bash
npm run create:reel -- \
  --title "TITEL" \
  --script-file input/script.txt \
  --next-free \
  --scenes 13
```

Danach `production/agent-task.md` vollständig bearbeiten. Pflichtdateien sind Script, `reel.json`, Szenendaten, alle Bildprompts, Cover, Prompt-Sammeldatei, Untertitel, Effekte, Caption und Quellen.

```bash
npm run export:prompts -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

## Aufbau

- bevorzugter Einstieg: `THEMA einfach erklärt:`
- Thema sofort nennen und direkt erklären
- Hook-Bild ab Sekunde 0
- sichtbare Veränderung ungefähr alle 3,5–5 Sekunden
- jede Szene zeigt genau einen klaren Moment
- keine mehrfach kopierte Hauptperson oder überladene Mehrschritt-Grafik
- politische Inhalte neutral; Quellen und Unsicherheiten dokumentieren

Das Ende besteht aus mindestens zwei getrennten Szenen:

1. persönliche Prüf-, Erkenntnis- oder Entscheidungsfrage
2. konkrete Lösung und kurzer einprägsamer Abschlusssatz

## Bildprompts

Bildprompts sind Englisch. Sichtbarer Bildtext ist nur bei redaktioneller Notwendigkeit erlaubt und dann korrekt auf Deutsch.

Verboten:

- unerwünschte Wörter, Fantasietext, Logos oder Wasserzeichen
- künstlich leere horizontale Untertitelzone
- getrennte obere und untere Bildhälfte
- gestapelte Panels oder mehrfach dargestellte Hauptperson
- große leere Bäume, Pfeile oder Flächen als Textplatzhalter

Pflicht:

- natürliche zusammenhängende Komposition
- Hauptmotiv darf die exakte Bildmitte nutzen und hinter dem Untertitel liegen
- Untertitel sind ein Overlay; das Bild wird dafür nicht künstlich freigeräumt
- Prompt-Sammeldatei enthält zuerst das Cover und danach alle Szenen

## Untertitel

Zentrale Quelle: `src/shared/subtitle-style.js`.

- Position `center`
- exakt 50 % Bildhöhe
- weiches Weiß `#F5F7FA`
- keine gelbe Wortmarkierung
- keine schwarze Box oder Balken
- dunkle Kontur und Schatten
- normalerweise 3–6 Wörter, höchstens zwei Zeilen
- keine Karaoke-Animation; Einzelwort-Sync nicht erforderlich

## Schnitt, Bewegung und Audio

- Hook: `none`, Dauer 0
- danach nur `cut`, Dauer 0
- keine Fades oder schwarzen Zwischenbilder
- Zoom normalerweise 2–6 %, maximal 8 %
- Schwenk maximal 4 %
- nicht jedes Bild bewegen
- Hintergrundmusik aus; Voice-over hat Vorrang

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

Audio-Standard:

- ursprüngliche Voice-over-Datei verwenden
- Pausen ab ungefähr 0,24 Sekunden kürzen
- exakt 1,10x bei erhaltener Tonhöhe
- −16 LUFS und höchstens −1,5 dBTP
- optimierte Datei nicht erneut beschleunigen

## Visuelle Prüfung und Render

Jedes Bild tatsächlich ansehen. Prüfen: 9:16, ein klarer Moment, natürliche Komposition, keine kopierte Hauptperson, keine unerwünschte Schrift, mittige Untertitel lesbar und sichere Bewegung.

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:render -- --dir "PFAD-ZUM-REEL"
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Nur rendern, wenn Inhalt, 1,10x-Audio, Lautheit, Audio-Sync, alle 12–14 Bilder, mittige Untertitel, visuelle Prüfung, direkte Schnitte und `readyForRenderer: true` tatsächlich vorliegen. Keine geplante Stufe als abgeschlossen bezeichnen.
