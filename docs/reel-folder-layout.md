# Übersichtliche Reel-Ordnerstruktur

Im macOS Finder sind nur die Bereiche sichtbar, die du für die tägliche Produktion brauchst:

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

Cover und Szenen liegen gemeinsam in einem klaren Bereich. Zusätzlich gibt es einen Sammelordner für den schnellen Bildimport:

```text
00-bildprompts/
├── 00-ALLE-BILDER-HIER-REIN/
├── 00-cover/
├── 01-scene-01/
├── 02-scene-02/
├── ...
├── 10-scene-10/
└── 99-alle-bildprompts.txt
```

### Schneller Bildimport

**Diese Nummerierung ist der allgemeine Benutzerstandard für jedes Reel und ist an kein bestimmtes Bildtool oder keinen bestimmten Agenten gebunden.** Egal womit die Bilder erzeugt werden: Du legst am Ende alle fertigen Bilder gemeinsam in `00-ALLE-BILDER-HIER-REIN`.

Die bevorzugte feste Benennung lautet:

```text
Bild 00.png  → Cover
Bild 01.png  → Szene 1
Bild 02.png  → Szene 2
Bild 03.png  → Szene 3
...
Bild 13.png  → Szene 13
```

Die Nummerierung folgt immer der chronologischen Szenenreihenfolge und läuft dynamisch bis zur letzten vorhandenen Szene. Du musst Cover und Szenenbilder nicht einzeln in die Szenenordner ziehen.

Zusätzlich werden aus Kompatibilitätsgründen auch Namen wie `00.png`, `bild-00.png`, `bild_01.png`, `Bild 02.webp` oder `03-meine-szene.jpg` erkannt. Unterstützt werden PNG, JPG, JPEG und WEBP. Der empfohlene Standard bleibt jedoch `Bild 00`, `Bild 01`, `Bild 02` usw.

Der normale Befehl erkennt diesen Sammelordner automatisch:

```bash
npm run organize:assets -- --dir "reels/.../reel-01_thema"
```

Die Nummer bestimmt dabei nur das vorgeschlagene Ziel. Die bestehende visuelle Qualitätskontrolle bleibt erhalten: Die KI muss jedes Bild öffnen, gegen Szene und Prompt prüfen und erst danach mit `--apply` endgültig übernehmen.

`99-alle-bildprompts.txt` enthält zuerst den vollständigen Cover-Prompt und danach alle Szenenprompts in chronologischer Reihenfolge. Ganz am Ende steht automatisch noch einmal die feste Zuordnung `Bild 00 = Cover`, `Bild 01 = Szene 1`, `Bild 02 = Szene 2` usw. bis zur letzten Szene.

Jeder Szenenordner ist direkt mit dem echten technischen Szenenordner verbunden. Darin liegen:

- `image-prompt.txt`
- später direkt das passende Bild, zum Beispiel `scene-01.png`

Dadurch ist sofort sichtbar, welches Bild zu welcher Szene gehört. Das Cover funktioniert gleich: Im Ordner `00-cover` liegt der Cover-Prompt und dort wird später `cover.png` abgelegt.

## Weitere Ordner

- `01-voice-script`: endgültiger Voice-over-Text
- `02-audio`: unbearbeitetes und optimiertes Voice-over
- `03-caption`: fertige Social-Media-Caption
- `04-video`: finale MP4-Ausgabe
- `99-technik`: Quellen, Prüfberichte, Untertitel, Effekte, Produktionsdateien und JSON-Daten; normalerweise nicht öffnen

Die technische Pipeline bleibt unverändert. Die sichtbaren Ordner sind Verknüpfungen zu den echten Dateien, deshalb werden Inhalte nicht doppelt gespeichert.

## Bestehendes Reel aufräumen

```bash
npm run organize:finder -- --dir "reels/.../reel-01_thema"
```

Auf macOS werden die ursprünglichen technischen Einträge anschließend im Finder ausgeblendet. Dazu gehören auch die technischen `timeline`- und `render`-Ordner. Codex, Node, Git und Remotion können weiterhin darauf zugreifen.

Neue Reels erhalten diese kompakte Ansicht automatisch über `npm run create:reel`.
