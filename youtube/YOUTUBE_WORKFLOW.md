# YOUTUBE WORKFLOW — VERBINDLICHE REGEL FÜR LANGVIDEOS

**Stand: 2026-09-05**

Diese Datei ist die verbindliche Regelquelle für den YouTube-Langvideo-Bereich dieses Repositories.

## Priorität

Für YouTube gilt:

1. aktuelle ausdrückliche Nutzeranweisung im laufenden Chat
2. `youtube/YOUTUBE_WORKFLOW.md`
3. `youtube/YOUTUBE_VISUAL_WORLD.md`
4. `THEMEN_HISTORIE.md` für die formatübergreifende Duplicate-Prüfung
5. `CURRENT_WORKFLOW.md` nur für repo-weite Sicherheits- und Qualitätsprinzipien
6. ältere YouTube-Projekte

Reel-spezifische Gestaltungsregeln dürfen nicht ungefragt auf Langvideos übertragen werden.

## Ordnerlogik — verbindlich

Jedes produktive YouTube-Langvideo liegt nach diesem Muster:

```text
youtube/YYYY-KWNN_DD-MM_bis_DD-MM/themen-slug/
```

Beispiel:

```text
youtube/2026-KW36_31-08_bis_06-09/warum-hat-ein-tag-24-stunden/
```

Regeln:
- Die Wochenmappe entspricht Montag bis Sonntag und verwendet dasselbe Namensprinzip wie `reels/`.
- Unter der Woche kommt **direkt das Thema** als kurzer eindeutiger Slug.
- Es gibt keine `youtube/projects/`-Zwischenebene.
- Es gibt keinen `video-01_`-, `video-02_`- oder ähnlichen Nummernpräfix im Themenordner.
- Mehrere YouTube-Videos derselben Woche liegen als Geschwister-Themenordner in derselben Wochenmappe.
- `youtube/templates/`, `youtube/YOUTUBE_WORKFLOW.md` und `youtube/YOUTUBE_VISUAL_WORLD.md` bleiben globale Infrastruktur und gehören nicht in eine Woche.

Vor jeder neuen Anlage wird zuerst `THEMEN_HISTORIE.md` geprüft und danach die passende Kalenderwoche bestimmt.

## YouTube-Längenstandard

- Neue YouTube-Langvideos sind **mindestens 10 Minuten** lang.
- Normaler Zielbereich: ungefähr 10–12 Minuten.
- Inhalt wird nicht künstlich gestreckt; wenn mehr Erklärung nötig ist, darf ein Video länger werden.
- Als Startwert sind ungefähr 50–80 Szenenbilder sinnvoll, Standard etwa 60.
- Bildwechsel meist alle 6–12 Sekunden; ein normales Einzelbild sollte in der Regel nicht länger als ca. 15 Sekunden unverändert stehen.
- Jedes Szenenbild erhält dezente Bewegung wie Push-in, Pull-out, Pan oder Ken-Burns, damit keine lange Diashow-Wirkung entsteht.

## Feste YouTube-Bildwelt

Für alle neuen YouTube-Langvideos gilt:

```text
visualStyleId = "youtube-editorial-stick-explainer"
```

Verbindliche Style-Bibel:

```text
youtube/YOUTUBE_VISUAL_WORLD.md
```

Kernmerkmale:
- 16:9
- hand-drawn 2D editorial explainer style
- einfache Stick-Figure-ähnliche Menschen
- runde oder leicht ovale Köpfe
- minimale Gesichtszüge
- klare schwarze Linien
- warme, leicht gedämpfte Farben
- ruhige erzählerische Komposition
- einfache historische, natürliche oder reduzierte Umgebungen
- keine fotorealistischen Menschen
- keine 3D-/Pixar-/Clay-Optik
- keine Countryballs als YouTube-Standard

Prompts werden auf Englisch geschrieben. Sichtbarer Text richtet sich nach der Projektsprache.

## Standardstruktur eines Themenordners

```text
themen-slug/
├── 00-bildprompts/
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
    ├── PRODUKTIONSPLAN.md
    ├── status.json
    └── video.json
```

## Produktionsphasen

1. **Themenprüfung:** `THEMEN_HISTORIE.md` lesen; keine gleiche oder nahezu gleiche Kernfrage wiederverwenden.
2. **Woche bestimmen:** passende ISO-Wochenmappe nach dem Reel-Namensprinzip wählen oder anlegen.
3. **Recherche:** wichtige Aussagen mit belastbaren Quellen prüfen und intern dokumentieren.
4. **Script:** endgültiges Voice-over unter `01-voice-script/voice-script.txt` schreiben.
5. **Bilder:** viele visuell klare Abschnitte planen und vollständige Flow-Prompts unter `00-bildprompts/` ablegen.
6. **Thumbnail:** eigenes starkes Cover-Konzept plus finalen Thumbnail-Prompt erstellen.
7. **Edit:** Schnitt, Bildwechsel, Zoom/Pan, SFX und Timing intern in `99-technik/` planen.
8. **Upload-Metadaten:** genau einen finalen Titel, Beschreibung, Kapitel und optionale Tags vorbereiten.
9. **Export:** finale MP4 und finales Thumbnail nach `03-export/` legen.

## Google Flow

- Szenenbilder 16:9.
- Alle Bilder behalten dieselbe feste YouTube-Bildwelt.
- Bildprompts einzeln und klar formulieren.
- Keine unnötigen Labels oder Untertitel in normalen Szenenbildern.
- Bildgenerierung bevorzugt seriell: Bild erzeugen → prüfen → korrekt benennen/ablegen → nächstes Bild.

## Thumbnail

Jedes Video braucht:
- einen finalen Upload-Titel
- ein eigenes Thumbnail-Konzept
- einen fertigen Thumbnail-Prompt
- später ein tatsächliches `03-export/THUMBNAIL.png`

Thumbnail darf stärker, kontrastreicher und fokussierter als normale Szenenbilder sein, bleibt aber in der gleichen Figuren-/Zeichenwelt.

## YouTube-Export

`03-export/` ist der einzige finale Upload-Bereich. Für YouTube-Langvideos gibt es ausdrücklich **keine `UNIVERSELLE-CAPTION.txt`**.

## Interner Status

`99-technik/status.json` ist die kanonische Statusdatei. `99-technik/video.json` enthält die internen Projektmetadaten. Nichts als fertig markieren, was nicht tatsächlich erzeugt oder geprüft wurde.

## Schutz gegen Struktur-Rückfall

Neue Chats und Agenten dürfen nicht:
- `youtube/projects/` wieder als aktive Produktionsstruktur einführen
- Themenordner wieder mit `video-01_`, `video-02_` usw. nummerieren
- Wochenordner überspringen
- die Reel-Bildwelt automatisch auf YouTube übertragen
- den 10-Minuten-Mindeststandard ohne ausdrückliche Nutzerentscheidung wieder auf 5–6 Minuten zurücksetzen
- eine `UNIVERSELLE-CAPTION.txt` für YouTube erzeugen
- fehlende Bilder, Audio, Thumbnail oder Renderstatus als fertig melden

Bei Unsicherheit zuerst diese Datei, danach `YOUTUBE_VISUAL_WORLD.md`, `THEMEN_HISTORIE.md` und anschließend `99-technik/status.json` des aktuellen Themenprojekts lesen.
