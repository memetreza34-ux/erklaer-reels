# YOUTUBE WORKFLOW — VERBINDLICHE REGEL FÜR LANGVIDEOS

**Stand: 2026-09-05**

Diese Datei ist die verbindliche Regelquelle für den YouTube-Langvideo-Bereich dieses Repositories.

## Priorität

1. aktuelle ausdrückliche Nutzeranweisung
2. `youtube/YOUTUBE_WORKFLOW.md`
3. `youtube/YOUTUBE_VISUAL_WORLD.md`
4. `THEMEN_HISTORIE.md`
5. `CURRENT_WORKFLOW.md` nur für repo-weite Sicherheitsprinzipien
6. ältere YouTube-Projekte

Reel-Regeln werden nicht automatisch auf YouTube übertragen.

## Ordnerlogik

```text
youtube/YYYY-KWNN_DD-MM_bis_DD-MM/themen-slug/
```

Unter `youtube/` kommt zuerst die Woche und darunter direkt das Thema. Keine `projects/`-Ebene und kein `video-01_`-Präfix.

## Drei Produktionsphasen

### Phase 1 — ChatGPT

ChatGPT erstellt das vollständige Produktionspaket:
- Thema + Duplicate-Check
- Recherche + Quellen
- finaler Titel
- Thumbnail-Konzept
- **Bild 00 = Thumbnail-Prompt**
- mindestens 10 Minuten Voice-over-Script
- 50–80 Videobilder, Standard etwa 60
- Google-Flow-Prompts
- 10er-Bildordner
- **exakte Bild↔Voice-over-Zuordnung für jedes Bild**
- Edit-, Motion- und SFX-Plan
- Beschreibung, Kapitel und Tags

Phase 1 ist erst vollständig, wenn `99-technik/BILD_AUDIO_ZUORDNUNG.json` existiert und lückenlos definiert, welcher gesprochene Abschnitt zu welchem `Bild NN` gehört.

### Phase 2 — Nutzer / Arman

Der Nutzer erstellt die echten Assets:
- Voice-over aus `01-voice-script/voice-script.txt`
- **Bild 00 = Thumbnail**
- Videobilder ab **Bild 01**
- Google-Flow-Bilder immer paketweise erzeugen
- jedes Paket vollständig umbenennen, prüfen und ablegen, bevor das nächste beginnt

Bei 60 Videobildern:

```text
00-bildprompts/
├── 00_thumbnail/
│   ├── Bild 00 - Thumbnail.txt
│   └── Bild 00.png                # sobald erzeugt
├── 01_bilder-01-bis-10/
├── 02_bilder-11-bis-20/
├── 03_bilder-21-bis-30/
├── 04_bilder-31-bis-40/
├── 05_bilder-41-bis-50/
└── 06_bilder-51-bis-60/
```

Bild 00 zählt **niemals** zu den Videobildern und niemals zu einem 10er-Paket.

### Phase 3 — Antigravity

Antigravity baut aus den echten Assets das fertige Video. **Die Voice-over-Spur ist die Masterspur.** Antigravity darf Bildwechsel niemals nur nach geschätzten Sekunden oder nach Gefühl setzen.

Verbindliche Reihenfolge:
1. `YOUTUBE_WORKFLOW.md`, `YOUTUBE_VISUAL_WORLD.md`, `PRODUKTIONSPLAN.md`, `status.json` und `BILD_AUDIO_ZUORDNUNG.json` lesen.
2. Bild 00 als Thumbnail erkennen und **niemals** in die Videotimeline einbauen.
3. Alle 10er-Ordner prüfen: richtige Bildnummern, keine Lücke, kein Duplikat.
4. Bildinhalt gegen den geplanten Prompt und den zugeordneten Voice-over-Abschnitt prüfen.
5. Finales Voice-over laden und echte Audiodauer bestimmen.
6. Für jeden Eintrag in `BILD_AUDIO_ZUORDNUNG.json` den `startAnchor` im **tatsächlich gesprochenen finalen Audio** suchen.
7. Echten Zeitstempel des ersten gesprochenen Wortes dieses Ankers bestimmen und als `actualStartSeconds` übernehmen.
8. `Bild NN` beginnt standardmäßig ca. **0,08 s vor** diesem echten Startanker. Bild 01 beginnt bei 0:00, sofern sein Anker direkt der erste Satz ist.
9. `Bild NN` endet exakt dort, wo das nächste Bild beginnt. Das letzte Bild endet mit dem gesprochenen Inhalt plus kurzem sauberen Endhold.
10. Niemals einen Cut verschieben, nur damit ein geschätzter Sekundenwert erreicht wird. **Inhalt/Cue schlägt Schätzung.**
11. Wenn ein Anker im Audio nicht mit hoher Sicherheit gefunden wird, nicht raten: Stelle markieren und manuell prüfen.
12. Danach Motion, SFX und finale QC durchführen.

## Bild↔Voice-over-Zuordnung — Hard Gate

Für **jedes einzelne Videobild** muss Phase 1 vor Asset-Erstellung festlegen, welcher Teil des Scripts dazu gehört.

Kanonische Datei:

```text
99-technik/BILD_AUDIO_ZUORDNUNG.json
```

Jeder Eintrag enthält mindestens:

```json
{
  "imageNumber": 17,
  "imageFile": "Bild 17.png",
  "batchFolder": "02_bilder-11-bis-20",
  "startAnchor": "Doch je komplexer Gesellschaften wurden",
  "endAnchor": "Im alten Ägypten entstanden deshalb frühe Formen",
  "visualPurpose": "Gesellschaft wird komplexer; grobe Sonnenhinweise reichen nicht mehr.",
  "actualStartSeconds": null,
  "actualEndSeconds": null,
  "alignmentConfidence": null
}
```

Bedeutung:
- `startAnchor` = **exakt gesprochene Wörter** aus `voice-script.txt`, an denen dieses Bild beginnt.
- `endAnchor` = Startanker des nächsten Bildes. Der zu Bild NN gehörende Sprachbereich endet unmittelbar davor.
- Der Text zwischen `startAnchor` und `endAnchor` gehört eindeutig zu diesem Bild.
- Keine Paraphrasen als Anchor verwenden.
- Reihenfolge der Anchors muss exakt der Script-Reihenfolge entsprechen.
- Das gesamte Voice-over muss von Bild 01 bis zum letzten Bild **lückenlos und ohne Überlappung** abgedeckt sein.
- Bild 00 besitzt keine Voice-over-Zuordnung.

Zusätzlich darf pro 10er-Ordner eine lesbare `ZUORDNUNG.md` mit denselben zehn Einträgen liegen.

## Timing-Regeln gegen zu frühe/zu späte Bildwechsel

- Masterquelle ist **das finale Audio**, nicht die geschätzte Script-Lesedauer.
- Standard-Cut: etwa 0,08 s vor dem ersten Phonem des nächsten `startAnchor`.
- Das neue Bild soll bereits minimal sichtbar sein, wenn sein Schlüsselwort beginnt.
- Keine langen Vorwegnahmen: ein Bild darf nicht mehrere Wörter/Sätze zu früh erscheinen.
- Keine verspäteten Wechsel: wenn der neue Satz/Abschnitt beginnt, muss das passende Bild bereits da sein.
- Zielbereich pro Bild meist 6–12 s.
- Normaler Maximalwert etwa 15 s.
- Wird ein zugeordneter Abschnitt deutlich länger, **nicht den Cut künstlich verschieben**. Mapping/Prompts müssen neu aufgeteilt oder ein zusätzlicher Bildmoment eingeplant werden.
- Sehr kurze Abschnitte werden ebenfalls in Phase 1 korrigiert statt im Edit zufällig verlängert.

### Alignment-QC

Antigravity dokumentiert nach Audioanalyse:
- `actualStartSeconds`
- `actualEndSeconds`
- `alignmentConfidence`

Bei `alignmentConfidence < 0.95` wird die Stelle manuell geprüft. Nicht raten.

Falls das tatsächliche Voice-over vom Script abweicht, gilt das echte Audio. Die Abweichung wird dokumentiert und die Zuordnung angepasst, bevor gerendert wird.

## YouTube-Längenstandard

- mindestens 10 Minuten
- normal ca. 10–12 Minuten
- 50–80 Videobilder, Standard etwa 60
- Ziel meist 6–12 s pro Bild
- ein Bild normalerweise nicht länger als etwa 15 s
- Bildanzahl wird **nach Script und Zuordnung** bestimmt, nicht blind vorher erzwungen

## Feste YouTube-Bildwelt

```text
visualStyleId = "youtube-editorial-stick-explainer"
```

Verbindlich: `youtube/YOUTUBE_VISUAL_WORLD.md`.

Kern:
- 16:9
- hand-drawn 2D editorial explainer
- einfache Stick-Figure-ähnliche Menschen
- klare schwarze Linien
- warme leicht gedämpfte Farben
- ruhige erzählerische Komposition
- kein Fotorealismus
- kein 3D/Pixar/Clay
- keine Countryballs als YouTube-Standard

## Standardstruktur

```text
themen-slug/
├── 00-bildprompts/
│   ├── 00_thumbnail/
│   │   └── Bild 00 - Thumbnail.txt
│   ├── 01_bilder-01-bis-10/
│   │   └── ZUORDNUNG.md
│   ├── 02_bilder-11-bis-20/
│   │   └── ZUORDNUNG.md
│   ├── ...
│   └── 99-alle-bildprompts.txt
├── 01-voice-script/
│   └── voice-script.txt
├── 02-audio/
├── 03-export/
│   ├── FERTIGES-VIDEO.mp4
│   ├── THUMBNAIL.png
│   ├── YOUTUBE-TITEL.txt
│   ├── YOUTUBE-BESCHREIBUNG.txt
│   ├── YOUTUBE-KAPITEL.txt
│   └── YOUTUBE-TAGS.txt
└── 99-technik/
    ├── BILD_AUDIO_ZUORDNUNG.json
    ├── PRODUKTIONSPLAN.md
    ├── status.json
    └── video.json
```

## 10-Bilder-Paketregel

- immer nur ein Paket gleichzeitig
- Bild 01–10 fertig → umbenennen → ablegen → prüfen
- erst dann Bild 11–20
- globale Nummerierung nie zurücksetzen
- fehlerhaftes Bild ersetzen, bevor Paket abgeschlossen wird
- letzter Ordner darf weniger als 10 Bilder haben
- Bild 00/Thumbnail bleibt separat

## Edit / Motion / Sound

- Voice-over führt die Timeline
- jedes Bild subtile Bewegung: Push-in, Pull-out, Pan oder Ken-Burns
- keine langen statischen Slides
- harte saubere Cuts als Standard
- SFX gezielt bei Kapitelwechseln, Reveals, Zahlen oder sichtbaren Ereignissen
- anders als Reels muss **nicht jeder Cut** einen SFX haben
- keine Meme-Sounds
- Stimme dominant
- Hintergrundmusik standardmäßig aus, außer ausdrücklich gewünscht
- keine eingebrannten Untertitel, außer ausdrücklich gewünscht

## Export

- 16:9
- 1920×1080
- 30 fps
- H.264
- AAC-Audio
- keine langen stillen oder schwarzen Enden
- `03-export/` ist der einzige finale Upload-Bereich

## Definition of Done

Ein YouTube-Video ist erst fertig, wenn:
- Phase 1 vollständig ist
- Bild 00 als Thumbnail vorhanden ist
- alle Videobilder paketweise vollständig sind
- finales Voice-over vorhanden ist
- jedes Bild eine eindeutige Script-/Audio-Zuordnung besitzt
- alle Anchor-Zeitstempel gegen das echte Audio geprüft sind
- kein Bildwechsel zu früh oder zu spät gesetzt wurde
- Motion/SFX/QC tatsächlich durchgeführt wurden
- ≥10 Minuten Laufzeit erreicht sind
- MP4 + Thumbnail + Upload-Metadaten tatsächlich existieren

## Schutz gegen Rückfall

Neue Chats/Agenten dürfen nicht:
- Woche → Thema überspringen
- `youtube/projects/` wieder einführen
- Bild 00 als Videobild behandeln
- Bilder außerhalb der 10er-Pakete durcheinander erzeugen
- Phase 1/2/3 vermischen
- Bildwechsel nach pauschalen Sekundenwerten statt nach Voice-over-Anchor setzen
- `BILD_AUDIO_ZUORDNUNG.json` ignorieren
- fehlende Assets erfinden
- nicht ausgeführte QC als bestanden melden
