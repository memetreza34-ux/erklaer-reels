# Übersichtliche Reel-Ordnerstruktur

> Bei Widersprüchen gilt `CURRENT_WORKFLOW.md`.

Im normalen Arbeitsbereich sind nur die fünf Bereiche sichtbar, die für die tägliche Produktion wichtig sind:

```text
reel-01_thema/
├── 00-bildprompts/
├── 01-voice-script/
├── 02-audio/
├── 03-export/
└── 99-technik/
```

Es gibt keinen separaten sichtbaren Caption- oder Video-Ordner mehr.

## 00-bildprompts

Die narrativen Szenen liegen gemeinsam in einem klaren Bereich. Ein separates Cover gibt es nicht: Szene 1 ist zugleich das Titelbild. Zusätzlich gibt es einen Sammelordner für den schnellen Bildimport:

```text
00-bildprompts/
├── 00-ALLE-BILDER-HIER-REIN/
├── 01-scene-01/
├── 02-scene-02/
├── ...
└── 99-alle-bildprompts.txt
```

### Verbindliche Google-Flow-Datei

Für Google Flow wird genau diese eine Datei verwendet:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Sie enthält den vollständigen seriellen Gesamtprompt mit **allen individuell geplanten Bildphasen**. Der Nutzer schickt die Datei einmal vollständig an den Google-Flow-Agenten.

`all-image-prompts/all-image-prompts.txt` ist die identische technische Spiegeldatei.

### Verbindlicher serieller Flow-Ablauf

Der Gesamtprompt muss Flow dazu anweisen, den Lauf selbstständig vollständig abzuarbeiten, aber immer nur **ein Bild gleichzeitig**:

```text
einen gemeinsamen Ausgabeordner für das Reel anlegen
→ nur Bild 01 erzeugen
→ vollständig warten
→ Ergebnis prüfen
→ exakt als Bild 01.png umbenennen
→ in den gemeinsamen Ausgabeordner legen
→ Ablage prüfen
→ erst dann Bild 02 erzeugen
→ ...
→ bis zum letzten geplanten Bild
```

Keine Queue, kein Batch, keine Parallelgenerierung und keine Mehrfachvarianten. Alle Bilder eines Reel-Laufs bleiben zusammen in genau einem Flow-Ausgabeordner.

### Schneller Bildimport

Die Nummerierung ist die **globale Bildreihenfolge**, nicht automatisch die Szenennummer.

Beispiel bei zusätzlichen Bildphasen:

```text
Bild 01.png  → Szene 1 / Phase 1 (zugleich Titelbild)
Bild 02.png  → Szene 2 / Phase 1
Bild 03.png  → Szene 2 / Phase 2
Bild 04.png  → Szene 3 / Phase 1
...
```

Die Reihe läuft dynamisch bis zum letzten geplanten Bild. `reel.json.plannedImageCount` beschreibt die Zahl der Szenenbilder.

Nach dem Flow-Lauf kommen alle fertigen Bilder gemeinsam nach:

```text
00-bildprompts/00-ALLE-BILDER-HIER-REIN/
```

Der empfohlene Standard bleibt `Bild 01.png`, `Bild 02.png`, `Bild 03.png` usw.

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

## 01-voice-script

Hier liegt der endgültige Voice-over-Text:

```text
01-voice-script/voice-script.txt
```

## 02-audio

Hier liegen der sichtbare Audio-Eingang und die finale optimierte Audiofassung:

```text
02-audio/
├── AUDIO-HIER-EINFUEGEN/
└── FINAL-AUDIO/
```

## 03-export

Das ist der einzige sichtbare finale Upload-Bereich eines Reels:

```text
03-export/
├── FERTIGES-REEL.mp4
└── UNIVERSELLE-CAPTION.txt
```

Die Universal-Caption ist individuell zum konkreten Reel geschrieben und plattformneutral für die unterstützten Kurzvideo-Social-Media-Accounts. Die verbindlichen Regeln stehen in `UNIVERSAL_CAPTION_POLICY.md`.

## 99-technik

Hier liegen Quellen, Prüfberichte, Effekte, Produktionsdateien, Timeline-/Renderdaten und JSON-Metadaten. Diesen Bereich muss der Nutzer im normalen Produktionsablauf nicht öffnen.

Untertitel sind global deaktiviert. Historische `subtitles/`-Dateien dürfen als technische Kompatibilitätsmetadaten existieren, enthalten für neue Reels aber keine aktiven Cues.

## Bestehendes Reel aufräumen

```bash
npm run organize:finder -- --dir "reels/.../reel-01_thema"
```

Auf macOS werden die ursprünglichen technischen Einträge anschließend im Finder ausgeblendet. Codex, Node, Git und Remotion können weiterhin darauf zugreifen.

Neue Reels erhalten diese kompakte Ansicht automatisch über `npm run create:reel`.
