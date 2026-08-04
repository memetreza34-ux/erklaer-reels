# AGENTS.md

## Pflichttrigger: „Mach ein neues Reel“

Wenn der Nutzer sinngemäß schreibt „Mach ein neues Reel“, „Erstelle das nächste Reel“ oder „Produziere ein neues Video“, erstellt Codex selbstständig das vollständige interne Produktionspaket. Nicht nach Datum oder Thema fragen und nicht nach der Ordnererstellung stoppen.

Ablauf:

1. `docs/autonomous-reel.md` und `CODEX_TASK.md` lesen.
2. `npm run next:slot -- --json` ausführen.
3. Wiederholungen vorhandener Themen vermeiden.
4. Ein Thema aus den erlaubten Säulen auswählen.
5. Deutsches Voice-over-Script mit einem Erzähler schreiben.
6. Reel mit `npm run create:reel -- --next-free` anlegen.
7. `production/agent-task.md` vollständig bearbeiten.
8. Szenen, Bildprompts, Prompt-Sammeldatei, Untertitel, Effekte, Cover, Caption und Quellen fertigstellen.
9. `validate:reel` und `check:content --strict` ausführen.
10. Erst bei fehlenden externen Bildern oder Voice-over anhalten.
11. Sind Assets vorhanden, bis zur fertigen MP4 weiterarbeiten.

## Kanal und Themen

Leitidee:

> Warum Menschen, Länder und Gesellschaften so funktionieren.

Erlaubte Säulen:

- Politik und Gesellschaft
- Länder, Geografie und Geschichte
- Psychologie und menschliches Verhalten

Nicht autonom verwenden:

- Körper und Biologie
- Finanzen
- Elektrotechnik
- KI-News
- tägliche politische Nachrichten
- Parteienwerbung

Politische Inhalte neutral erklären. Unsicherheiten und umstrittene Aussagen in `sources/sources.md` dokumentieren.

## Hook und Script

Bevorzugter Einstieg:

> **THEMA einfach erklärt:**

Regeln:

- Thema sofort nennen
- direkt erklären
- einfache, erwachsene und neutrale Sprache
- keine lange Einleitung
- kein leerer Clickbait
- Hook-Bild ab Sekunde 0 vollständig sichtbar
- kein schwarzer Start
- Zielzeit 35–55 Sekunden

## Szenen und Timing

- 35–44 Sekunden: normalerweise 8–10 Bildmomente
- 45–55 Sekunden: normalerweise 10–12 Bildmomente
- sichtbare Veränderung ungefähr alle 3,5–5 Sekunden
- Bildwechsel 0,1–0,3 Sekunden vor dem gesprochenen `audioCue`
- keine mechanisch gleich langen Szenen
- innerhalb eines Reels konsistente Bildwelt
- Build-up nur bei echter schrittweiser Erklärung

## Bildprompts

Jeder Szenenprompt liegt unter:

```text
scenes/scene-XX/image-prompt.txt
```

Danach zwingend:

```bash
npm run export:prompts -- --dir "<reel-ordner>" --strict
```

### Natürliche Komposition

- Hauptmotiv darf die Bildmitte normal nutzen.
- Keine künstlich leere horizontale Zone für Untertitel.
- Kein leerer Streifen quer durch das Bild.
- Keine getrennte obere und untere Bildhälfte nur wegen der Untertitel.
- Keine riesigen leeren Baumstämme, Pfeile oder Flächen als Textplatzhalter.
- Vergleiche möglichst seitlich oder als zusammenhängende Szene darstellen.
- Nur kleine wichtige Details nicht direkt hinter dem unteren Untertitelbereich platzieren.
- Das Bild muss ohne Untertitel vollständig und natürlich wirken.

### Bildtext

- Bildprompts auf Englisch
- sichtbarer Bildtext nur bei redaktioneller Notwendigkeit
- sichtbarer Text dann ausschließlich korrekt auf Deutsch
- keine unerwünschten englischen Wörter
- keine Fantasie-Labels, Logos, Wasserzeichen oder zufällige Schrift

## Untertitel

Die einzige technische Quelle ist:

```text
src/shared/subtitle-style.js
```

Verbindlich:

- Position `lower`
- exakt 76 % Bildhöhe
- weiches Weiß `#F5F7FA`
- alle Wörter in derselben Farbe
- keine gelbe Wortmarkierung
- keine schwarze Hintergrundbox und kein Balken
- dunkle Kontur und dezenter Schatten für Lesbarkeit
- normalerweise 3–6 Wörter
- höchstens zwei Zeilen
- keine Wort-für-Wort-Karaoke-Animation
- keine Positionsverschiebung
- keine künstliche Freifläche im Bild erzeugen
- Einzelwort-Sync ist ohne Wort-Highlight nicht erforderlich

## Audio

Zentrale technische Quelle:

```text
src/shared/audio-pacing-style.js
```

Vor der Timeline:

```bash
npm run trim:pauses -- --dir "<reel-ordner>" --speed 1.10
```

Standard:

- immer von der ursprünglichen Voice-over-Datei starten
- Pausen ab ungefähr 0,24 Sekunden straffen
- kurze natürliche Restpause behalten
- Geschwindigkeit exakt `1.10x`
- Tonhöhe erhalten
- auf `-16 LUFS` normalisieren
- True Peak auf `-1,5 dBTP` begrenzen
- nicht dieselbe bereits optimierte Datei erneut beschleunigen

Danach Timeline, Szenen-Cues und Untertitel-Cues neu synchronisieren.

## Übergänge, Bewegung und Sounds

- Hook: `none`, Dauer 0
- alle weiteren Szenen: `cut`, Dauer 0
- keine Fades, Schwarzblenden, Slides, Glitches, Spins oder Flash-Übergänge
- kein schwarzes Zwischenbild
- Zoom normalerweise 2–6 %, maximal 8 %
- Schwenk maximal 4 %
- nicht jedes Bild bewegen
- Hintergrundmusik standardmäßig aus
- null bis zwei dezente Soundeffekte pro Szene
- Voice-over hat Vorrang

## Externe Assets

Bevorzugte Ablage:

```text
scenes/scene-XX/scene-XX.png
cover/cover.png
audio/<voiceover-datei>
```

In der sichtbaren Finder-Struktur liegen diese Ziele unter `00-bildprompts/00-cover` und den nummerierten Szenenordnern.

Bilder tatsächlich ansehen und gegen Sprechertext, Prompt, Metapher und Komposition prüfen. Nicht allein nach Dateinamen zuordnen.

## Visuelle Qualitätsprüfung

```bash
npm run check:visuals -- --dir "<reel-ordner>"
npm run check:visuals -- --dir "<reel-ordner>" --strict
```

Pflichtprüfung:

- 9:16, mindestens 720 × 1280, Ziel 1080 × 1920
- Hauptmotiv sicher und natürlich komponiert
- kein leerer Mittelstreifen
- keine künstlich getrennten Bildhälften
- keine unerwünschten lesbaren Wörter oder englischen Labels
- Untertitel unten bei 76 % lesbar
- weißer Text mit Kontur, ohne Gelb und ohne Box
- Stil innerhalb des Reels konsistent
- Bewegung schneidet nichts Wichtiges ab

## Timeline, Abschluss und Render

```bash
npm run build:timeline -- --dir "<reel-ordner>"
npm run sync:audio -- --dir "<reel-ordner>" --strict
npm run finalize:reel -- --dir "<reel-ordner>" --strict
npm run validate:render -- --dir "<reel-ordner>"
npm run render:reel -- --dir "<reel-ordner>"
```

Ein Reel darf nur gerendert werden, wenn Inhalt, Audio-Pacing bei exakt 1.10x, Lautheitsnormalisierung, Audio-Sync, visuelle Prüfung und Renderer-Eingabe bestanden sind. Keine simulierte oder geplante Stufe als abgeschlossen bezeichnen.

## Technische Regeln

- stabile IDs wie `scene-01`
- `scene-index.json` und jede `scene.json` synchron halten
- Rohscript nicht überschreiben
- API-Schlüssel niemals committen
- fehlende Assets sichtbar im Status halten
- Pipeline-Stufen einzeln wiederholbar halten
- zentrale Logik testen
- Remotion-Pakete auf identischer Version halten
- bei nicht startenden GitHub-Actions-Logs ehrlich dokumentieren, dass kein auswertbares Testergebnis vorliegt
