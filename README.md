# Erklär-Reels

Produktionspipeline für visuelle Erklär-Reels zu Politik, Gesellschaft, Ländern, Geografie, Geschichte, Psychologie und menschlichem Verhalten.

> Warum Menschen, Länder und Gesellschaften so funktionieren.

## Verbindliche Regeln

**`CURRENT_WORKFLOW.md` ist die Single Source of Truth.**

## Produktionsstandard

- 55–60 Sekunden Voice-over
- 155–175 deutsche Wörter
- 12–14 **narrative Szenen**, Standard 13
- genau ein klarer Erklärschritt pro narrativer Szene
- Bildwelt erst nach dem fertigen Script auswählen
- **Bildanzahl individuell pro Reel**
- pro narrativer Szene 1, 2 oder selten 3 Bildphasen
- keine starre Gleichsetzung `13 Szenen = 13 Bilder`
- Voice-over exakt 1,10x mit erhaltener Tonhöhe
- −16 LUFS, höchstens −1,5 dBTP
- keine Untertitel
- ausschließlich harte Schnitte
- keine Hintergrundmusik
- Schlussbild 0,7 Sekunden nach dem letzten gesprochenen Wort halten

## Individuelle Bilddichte

Für jede Szene wird separat entschieden, wie viele Bilder wirklich sinnvoll sind.

- **1 Bild:** starkes Motiv trägt den ganzen Gedanken
- **2 Bilder:** z. B. Überblick → Detail, Karte → Zoom, Ursache → Folge, Gesicht → Gedanke
- **3 Bilder:** nur selten bei echten dreistufigen Erklärungen

Wenn ein Still-Bild ungefähr 3,5–4 Sekunden oder länger stehen würde, wird eine zweite Bildphase aktiv geprüft. Sie wird nur hinzugefügt, wenn sie das Reel tatsächlich verbessert.

Technisch:

```text
reel.json.imageCountMode = individual-per-reel
reel.json.plannedImageCount = tatsächliche Bildsumme
scene.imageCount = 1..3
scene.imagePhases[]
```

Erste Phase einer Szene:

```text
image-prompt.txt
```

Zusätzliche Phasen:

```text
image-prompt-02.txt
image-prompt-03.txt
```

## Google Flow

Repo-Agenten erzeugen Script, Szenen, Bildphasen und Prompts, aber keine Bilder.

Der Nutzer sendet einmal:

```text
all-image-prompts/all-image-prompts.txt
```

an Google Flow.

Flow arbeitet danach streng seriell:

```text
Bild erzeugen → vollständig warten → umbenennen → prüfen → nächstes Bild
```

`Bild 00.png` ist Cover und Style-Master.

Danach bezeichnet die Nummer die **globale Bildreihenfolge**. Sie entspricht bei mehreren Bildphasen nicht automatisch der Szenennummer.

Beispiel:

```text
Bild 01 = Szene 1 / Phase 1
Bild 02 = Szene 2 / Phase 1
Bild 03 = Szene 2 / Phase 2
Bild 04 = Szene 3 / Phase 1
```

## Sichtbare Reel-Struktur

```text
reel-01_thema/
├── 00-bildprompts/
├── 01-voice-script/
├── 02-audio/
├── 03-caption/
├── 04-video/
└── 99-technik/
```

Finales Video:

```text
04-video/FERTIGES-VIDEO/
```

## Fehlende Assets suchen

Vor einer Meldung, dass Bilder oder Audio fehlen:

```bash
npm run discover:assets -- --dir "PFAD-ZUM-REEL"
```

Die Discovery richtet sich nach der individuell geplanten Bildzahl.

## Sichere Bildzuordnung

Dateinummern sind nur Routing-Hilfe. Jedes Bild wird gegen seine konkrete Bildphase geprüft und anschließend gegen vorherige und nächste Bildphase gegengeprüft. Unter 0,90 Konfidenz wird nicht geraten.

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL"
npm run organize:assets -- --dir "PFAD-ZUM-REEL" --apply
```

## Audio und Render

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:render -- --dir "PFAD-ZUM-REEL"
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Narrative Szenen werden mit dem finalen Voice-over synchronisiert. Zusätzliche Bildphasen wechseln innerhalb einer Szene anhand ihrer relativen `startPercent`-Positionen.

Keine geplante oder nicht ausgeführte Stufe als bestanden ausgeben.

## Voraussetzungen

- Node.js 20 oder neuer
- FFmpeg und optional `ffprobe`
- Remotion-Pakete in identischer Version
