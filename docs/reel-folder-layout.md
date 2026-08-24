# Übersichtliche Reel-Ordnerstruktur

> Bei Widersprüchen gilt `CURRENT_WORKFLOW.md`.

Im macOS Finder sind nur die Bereiche sichtbar, die für die tägliche Produktion wichtig sind:

```text
reel-01_thema/
├── 00-bildprompts/
├── 01-voice-script/
├── 02-audio/
├── 03-caption/
├── 04-video/
└── 99-technik/
```

## 00-bildprompts

Cover und narrative Szenen liegen gemeinsam in einem klaren Bereich. Zusätzlich gibt es einen Sammelordner für den schnellen Bildimport:

```text
00-bildprompts/
├── 00-ALLE-BILDER-HIER-REIN/
├── 00-cover/
├── 01-scene-01/
├── 02-scene-02/
├── ...
└── 99-alle-bildprompts.txt
```

### Verbindliche Google-Flow-Datei

Für Google Flow wird normalerweise genau diese Datei verwendet:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Sie enthält den vollständigen seriellen Gesamtprompt mit Cover und **allen individuell geplanten Bildphasen**.

`all-image-prompts/all-image-prompts.txt` ist die identische technische Spiegeldatei. Einzelprompt-Dateien unter `all-image-prompts/image-prompts/` sind nur interne Sicherung.

### Schneller Bildimport

Die Nummerierung ist die **globale Bildreihenfolge**, nicht automatisch die Szenennummer.

Beispiel bei zusätzlichen Bildphasen:

```text
Bild 00.png  → Cover
Bild 01.png  → Szene 1 / Phase 1
Bild 02.png  → Szene 2 / Phase 1
Bild 03.png  → Szene 2 / Phase 2
Bild 04.png  → Szene 3 / Phase 1
...
```

Die Reihe läuft dynamisch bis zum letzten geplanten Bild. `reel.json.plannedImageCount` beschreibt die Zahl der Szenenbilder ohne Cover.

Alle fertigen Bilder können gemeinsam in

```text
00-bildprompts/00-ALLE-BILDER-HIER-REIN/
```

gelegt werden.

Zusätzlich werden aus Kompatibilitätsgründen verschiedene Nummerierungsformen erkannt. Der empfohlene Standard bleibt `Bild 00.png`, `Bild 01.png`, `Bild 02.png` usw.

Der normale Befehl erkennt diesen Sammelordner automatisch:

```bash
npm run organize:assets -- --dir "reels/.../reel-01_thema"
```

**Wichtig:** Die Nummer bestimmt nur das vorgeschlagene Routing-Ziel. Die KI/der Agent muss jedes Bild tatsächlich öffnen, gegen die konkrete Bildphase prüfen und erst nach der visuellen Zwei-Pass-QC mit `--apply` übernehmen. `filename-only` ist verboten.

## Szenenordner und Bildphasen

Ein narrativer Szenenordner enthält mindestens:

```text
image-prompt.txt
scene.json
```

Bei mehreren Bildphasen zusätzlich zum Beispiel:

```text
image-prompt-02.txt
image-prompt-03.txt
```

Die finale technische Asset-Zuordnung kann daher mehrere Bilder zu derselben narrativen Szene enthalten.

## Weitere Ordner

- `01-voice-script`: endgültiger Voice-over-Text
- `02-audio`: unbearbeitetes und optimiertes Voice-over
- `03-caption`: fertige Social-Media-Caption
- `04-video`: finale MP4-Ausgabe
- `99-technik`: Quellen, Prüfberichte, deaktivierte Kompatibilitätsmetadaten für Untertitel, Effekte, Produktionsdateien, Timeline, Renderdaten und JSON-Dateien; normalerweise nicht öffnen

Untertitel sind global deaktiviert. Historische `subtitles/`-Dateien dürfen als Kompatibilitätsmetadaten existieren, enthalten für neue Reels aber keine aktiven Cues.

## Bestehendes Reel aufräumen

```bash
npm run organize:finder -- --dir "reels/.../reel-01_thema"
```

Auf macOS werden die ursprünglichen technischen Einträge anschließend im Finder ausgeblendet. Codex, Node, Git und Remotion können weiterhin darauf zugreifen.

Neue Reels erhalten diese kompakte Ansicht automatisch über `npm run create:reel`.
