# AGENTS.md

## Pflichttrigger: „Mach ein neues Reel“

Bei „Mach ein neues Reel“, „Erstelle das nächste Reel“ oder sinngleichen Imperativen erstellt Codex selbstständig das vollständige Produktionspaket. Nicht nach Datum oder Thema fragen und nicht nach der Ordnererstellung stoppen.

1. `docs/autonomous-reel.md` und `CODEX_TASK.md` lesen.
2. `npm run next:slot -- --json` ausführen.
3. Wiederholungen vermeiden und ein Thema aus den erlaubten Säulen wählen.
4. Ein deutsches Voice-over mit genau einem Erzähler schreiben.
5. Reel mit `npm run create:reel -- --next-free` anlegen.
6. `production/agent-task.md` vollständig bearbeiten.
7. Cover, 12–14 Szenen, Bildprompts, Sammeldatei, Untertitel, Effekte, Caption und Quellen fertigstellen.
8. `validate:reel` und `check:content --strict` ausführen.
9. Erst bei fehlenden externen Bildern oder Voice-over anhalten.
10. Sind Assets vorhanden, bis zur geprüften MP4 weiterarbeiten.

## Kanal und Themen

Leitidee: **Warum Menschen, Länder und Gesellschaften so funktionieren.**

Erlaubt:

- Politik und Gesellschaft
- Länder, Geografie und Geschichte
- Psychologie und menschliches Verhalten

Nicht autonom verwenden: Körper und Biologie, Finanzen, Elektrotechnik, KI-News, tägliche politische Nachrichten und Parteienwerbung. Politische Inhalte neutral erklären und Unsicherheiten in `sources/sources.md` dokumentieren.

## Script, Bildwelt und Ende

Bevorzugter Einstieg: **THEMA einfach erklärt:**

Verbindlich:

- Thema sofort nennen und direkt erklären
- einfache, erwachsene und neutrale Sprache
- 155–175 Wörter
- 55–60 Sekunden nach Audiooptimierung
- Geschwindigkeit exakt 1,10x
- Hook-Bild ab Sekunde 0
- kein schwarzer Start
- kein leerer Clickbait

**Erst das vollständige Script schreiben, danach die passendste Bildwelt auswählen.** Die runde Kugelwelt, menschliche Editorial-Welt, Objekt-/Metapherwelt, isometrische Szenenwelt oder eine ernstere Symbolwelt werden nur eingesetzt, wenn sie zum konkreten Script passen. Innerhalb eines Reels bleibt die gewählte Hauptwelt konsistent.

Die letzten zwei Szenen bilden ein starkes Ende:

1. persönliche Prüf-, Erkenntnis- oder Entscheidungsfrage
2. konkrete Lösung und kurzer einprägsamer Abschlusssatz

Kein abruptes Ende nach einer Aufzählung und keine schulische Standardschlussformel.

## Szenen und Bilder

- 12–14 Szenen, Standard 13
- sichtbarer Wechsel ungefähr alle 3,5–5 Sekunden
- Bildwechsel 0,1–0,3 Sekunden vor dem gesprochenen `audioCue`
- jede Szene zeigt genau einen klaren Moment
- keine mehrfach kopierte Hauptperson innerhalb eines Bildes
- kein überladenes mehrstufiges Anleitungspanorama
- konsistente Bildwelt innerhalb eines Reels

Jeder Prompt liegt unter `scenes/scene-XX/image-prompt.txt`. Danach zwingend:

```bash
npm run export:prompts -- --dir "<reel-ordner>" --strict
```

Die Sammeldatei enthält zuerst den Cover-Prompt und danach alle Szenenprompts.

### Deutscher Bildtext

Wo es zur Aussage passt, soll ein kurzer deutscher Text direkt in die Illustration integriert werden.

- bevorzugt in ungefähr 55–85 % der Szenen
- meistens 1–5 Wörter; ein einzelnes Wort ist vollständig ausreichend
- Größe je nach Szene klein, mittel oder groß
- mögliche Formen: kurze Überschrift, Schild, Etikett, Dokument, Karte, Display, Gegenstandsaufschrift oder Schlussaussage
- `scene.imageText` enthält den exakten deutschen Wortlaut
- der Bildprompt nennt diesen Wortlaut exakt in Anführungszeichen
- Bildtext und Untertitel dürfen nicht wortgleich dieselbe Aussage wiederholen
- kein englischer sichtbarer Text, keine Fantasieschrift und keine zufälligen Wörter
- Text weglassen, wenn er die Szene überladen, die Aussage doppeln oder die Bildgenerierung verschlechtern würde
- nicht zwanghaft Text in jede einzelne Szene setzen

### Natürliche Komposition

- Hauptmotive dürfen die exakte Bildmitte normal verwenden und hinter den Untertiteln liegen.
- Untertitel sind ein Overlay; die Illustration darf dafür nicht künstlich umgebaut werden.
- Keine leere horizontale Untertitelzone, kein Mittelstreifen und keine getrennten Bildhälften.
- Keine gestapelten Panels, leeren Bäume, Pfeile oder großen Platzhalterflächen.
- Keine zufälligen Wörter, englischen Labels, Fantasieschrift, Logos oder Wasserzeichen.
- Geplanter sichtbarer Bildtext ist korrektes Deutsch und wird exakt im Prompt angegeben.

## Untertitel

Einzige technische Quelle: `src/shared/subtitle-style.js`.

- Position `center`
- exakt 50 % Bildhöhe
- weiches Weiß `#F5F7FA`
- keine gelbe Wortmarkierung
- keine schwarze Box und kein Balken
- dunkle Kontur und dezenter Schatten
- normalerweise 3–6 Wörter, höchstens zwei Zeilen
- keine Karaoke-Animation und kein erforderlicher Einzelwort-Sync
- Position nicht verschieben
- keine künstliche Freifläche im Bild erzeugen

## Audio

Zentrale Quelle: `src/shared/audio-pacing-style.js`.

```bash
npm run trim:pauses -- --dir "<reel-ordner>" --speed 1.10
```

- immer von der ursprünglichen Voice-over-Datei starten
- Pausen ab ungefähr 0,24 Sekunden straffen
- Geschwindigkeit exakt 1,10x, Tonhöhe erhalten
- auf −16 LUFS normalisieren
- True Peak auf höchstens −1,5 dBTP begrenzen
- bereits optimiertes Audio nicht erneut beschleunigen
- danach Timeline, Szenen-Cues und Untertitel-Cues neu synchronisieren

## Schnitt und Effekte

- Hook: `none`, Dauer 0
- danach ausschließlich `cut`, Dauer 0
- keine Fades, Schwarzblenden, Slides, Glitches, Spins oder Flash-Übergänge
- Zoom normalerweise 2–6 %, maximal 8 %
- Schwenk maximal 4 %
- nicht jedes Bild bewegen
- Hintergrundmusik standardmäßig aus
- null bis zwei dezente Soundeffekte pro Szene; Voice-over hat Vorrang

## Externe Assets und Prüfung

```text
scenes/scene-XX/scene-XX.png
cover/cover.png
audio/<voiceover-datei>
```

Jedes Bild tatsächlich ansehen und prüfen:

- 9:16, Ziel 1080 × 1920
- genau ein klarer Moment
- keine mehrfach dargestellte Hauptperson
- natürliche Komposition ohne leere Mitte
- geplanter Bildtext vollständig, korrekt und ausschließlich auf Deutsch
- keine zusätzlichen erfundenen Wörter
- mittige weiße Untertitel bei 50 % bleiben lesbar
- Bewegung schneidet nichts Wichtiges ab

```bash
npm run check:visuals -- --dir "<reel-ordner>" --strict
npm run build:timeline -- --dir "<reel-ordner>"
npm run sync:audio -- --dir "<reel-ordner>" --strict
npm run finalize:reel -- --dir "<reel-ordner>" --strict
npm run validate:render -- --dir "<reel-ordner>"
npm run render:reel -- --dir "<reel-ordner>"
```

Ein Reel darf nur als fertig gelten, wenn Inhalt, 1,10x-Audio, Lautheit, Audio-Sync, alle Bilder, visuelle Prüfung und Renderer-Eingabe tatsächlich bestanden sind.

## Technische Regeln

- stabile IDs wie `scene-01`
- `scene-index.json` und jede `scene.json` synchron halten
- Rohscript nicht überschreiben
- API-Schlüssel niemals committen
- fehlende Assets sichtbar im Status halten
- Pipeline-Stufen einzeln wiederholbar halten
- zentrale Logik testen
- bei nicht startenden GitHub-Actions-Schritten ehrlich dokumentieren, dass kein auswertbares Testergebnis vorliegt
