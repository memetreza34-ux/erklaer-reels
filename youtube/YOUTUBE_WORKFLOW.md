# YOUTUBE WORKFLOW — VERBINDLICHE REGEL FÜR LANGVIDEOS

**Stand: 2026-09-04**

Diese Datei ist die verbindliche Regelquelle für den YouTube-Langvideo-Bereich dieses Repositories.

## Priorität

1. aktuelle ausdrückliche Nutzeranweisung im laufenden Chat
2. `youtube/YOUTUBE_WORKFLOW.md`
3. `youtube/YOUTUBE_VISUAL_WORLD.md`
4. `THEMEN_HISTORIE.md` für die globale Duplicate-Prüfung
5. `CURRENT_WORKFLOW.md` nur für repo-weite Sicherheits- und Qualitätsprinzipien
6. ältere YouTube-Projekte

Reel-spezifische Bildwelt-Regeln dürfen nicht ungefragt auf Langvideos übertragen werden.

## Grundprinzip

YouTube ist ein eigenes Longform-Format: inhaltlich ähnlich klar und visuell dicht wie ein Reel, aber deutlich länger, ruhiger erzählt und ausschließlich in der eigenen YouTube-Bildwelt.

- alle YouTube-Langvideos liegen unter `youtube/projects/`
- jedes Video bekommt einen eigenen Projektordner
- vor jeder Themenwahl `THEMEN_HISTORIE.md` prüfen
- ein bereits verwendetes oder nahezu identisches Thema ist formatübergreifend gesperrt
- Titel und Thumbnail sind Pflichtbestandteile jedes Projekts, nicht nachträgliche Extras
- Script, Szenen und Bildprompts werden vollständig vorbereitet, bevor Nutzerassets als fertig markiert werden

## Neuer YouTube-Startstandard

Ab 2026-09-04 gilt global:

- **mindestens 10 Minuten** finales Voice-over
- Startziel für neue Videos: ungefähr **10–12 Minuten**
- keine künstliche Streckung; das Thema muss die Länge inhaltlich tragen
- viele visuelle Wechsel statt minutenlanger Standbilder
- für 10–12 Minuten standardmäßig ungefähr **50–80 eigenständige Bildmomente**, Zielwert etwa 60
- Bildwechsel normalerweise alle **6–12 Sekunden**; einzelne Erklärbilder dürfen bewusst bis ungefähr 15 Sekunden stehen, wenn Motion/Zoom und Inhalt es rechtfertigen
- jedes Bild erhält dezente Bewegung im Edit: Push-in, Pull-out, Pan oder Ken-Burns
- keine hektische Reel-Schnittfrequenz, aber auch keine statische Slideshow
- 16:9
- finales Thumbnail ebenfalls 16:9
- keine Hintergrundmusik als automatische Pflicht; Sounddesign wird projektbezogen entschieden

## Feste YouTube-Bildwelt

Für alle neuen YouTube-Langvideos gilt global:

```text
visualStyleId = "youtube-editorial-stick-explainer"
visualStyleReason = "Feste YouTube-Bildwelt: hand-drawn editorial stick-figure explainer style für erzählerische Langvideos."
```

Verbindliche Style-Bibel:

```text
youtube/YOUTUBE_VISUAL_WORLD.md
```

Die YouTube-Bildwelt ist vollständig von der Reel-Bildwelt getrennt.

- `modern-countryball-explainer` gilt nur für Reels
- `youtube-editorial-stick-explainer` gilt für YouTube-Langvideos
- Prompts werden auf Englisch geschrieben
- sichtbarer Bildtext richtet sich nach der Projektsprache
- Szenenbilder 16:9

Kernmerkmale:
- hand-drawn 2D editorial explainer style
- einfache Stick-Figure-ähnliche Menschen
- runde oder leicht ovale Köpfe
- minimale Gesichtszüge
- klare schwarze Linien
- warme, leicht gedämpfte Farben
- ruhige erzählerische Komposition
- einfache historische, natürliche oder reduzierte Umgebungen
- keine fotorealistischen Menschen
- kein 3D/Pixar/Clay
- keine Countryballs

## Standard-Projektstruktur

```text
video-XX_slug/
├── 00-bildprompts/
│   ├── 99-alle-bildprompts.txt
│   └── THUMBNAIL-PROMPT.txt
├── 01-voice-script/
│   └── voice-script.txt
├── 02-audio/
│   └── README.md
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

1. **Thema + Duplicate-Prüfung:** Themen-Historie lesen, neues Thema reservieren.
2. **Recherche:** belastbare Primär-/Fachquellen prüfen und Kernbehauptungen dokumentieren.
3. **Packaging:** finalen YouTube-Titel und Thumbnail-Konzept festlegen.
4. **Script:** mindestens 10 Minuten tragfähiges Voice-over nach `01-voice-script/voice-script.txt`.
5. **Bildplanung:** viele einzelne Story-Bilder in der festen YouTube-Welt; vollständiger Prompt-Satz nach `00-bildprompts/99-alle-bildprompts.txt`.
6. **Audio + Bilder:** echte Nutzerassets unter `02-audio/` bzw. im Projekt ablegen; nichts als fertig markieren, bevor es existiert.
7. **Edit:** Bildwechsel, Motion, Zoom, SFX und Timing unter `99-technik/PRODUKTIONSPLAN.md` umsetzen.
8. **Upload-Metadaten:** genau ein finaler Titel, Beschreibung, Kapitel und optionale Tags unter `03-export/`.
9. **Export:** `FERTIGES-VIDEO.mp4` und `THUMBNAIL.png` unter `03-export/`.

## Titel-Regel

Jedes Projekt braucht genau einen finalen Upload-Titel in `03-export/YOUTUBE-TITEL.txt`.

Der Titel soll:
- die Kernfrage sofort verständlich machen
- Neugier erzeugen, ohne falsche Behauptung
- möglichst kurz und mobil lesbar sein
- mit dem Thumbnail zusammenarbeiten statt denselben Satz unnötig zu wiederholen

## Thumbnail-Regel

Jedes Projekt braucht bereits in Phase 1 ein Thumbnail-Konzept und einen fertigen Prompt.

- 16:9
- ein dominantes Motiv
- maximal wenige große Elemente
- hohe Lesbarkeit auf Smartphone-Größe
- wenn Text: sehr kurz, normalerweise 2–4 Wörter
- stärkerer Kontrast als normale Szenenbilder
- dieselbe YouTube-Figuren-/Zeichenwelt darf verwendet werden
- kein überladenes Infografik-Thumbnail

## Bilddichte und Motion

Für 10–12 Minuten werden standardmäßig rund 60 eigenständige Bildmomente geplant.

- kein einzelnes Bild minutenlang halten
- neue Bilder müssen echte Story-/Erklärfortschritte darstellen, nicht nur kosmetische Varianten
- Perspektive, Entfernung und Fokus variieren
- jedes Bild im Edit dezent bewegen
- Motion darf das Bild nicht hektisch machen
- bei Diagramm-/Prozessbildern sind kürzere Wechsel sinnvoll
- bei ruhigen Story-Momenten dürfen Bilder länger wirken

## Google Flow

`00-bildprompts/99-alle-bildprompts.txt` ist die Masterdatei.

Flow arbeitet streng seriell:

```text
aktuellen Prompt verwenden
→ genau 1 Bild erzeugen
→ vollständig warten
→ gegen Szene + feste YouTube-Bildwelt prüfen
→ exakt benennen
→ ablegen
→ erst dann nächstes Bild
```

Keine Queue, kein Batch, keine Parallelgenerierung.

## YouTube-Export

`03-export/` ist der einzige finale Upload-Bereich.

Vorgesehen:
- `FERTIGES-VIDEO.mp4`
- `THUMBNAIL.png`
- `YOUTUBE-TITEL.txt`
- `YOUTUBE-BESCHREIBUNG.txt`
- `YOUTUBE-KAPITEL.txt`
- `YOUTUBE-TAGS.txt`

Es gibt für YouTube keine `UNIVERSELLE-CAPTION.txt`.

## Sicherheit

Neue Chats dürfen nicht:
- ein Thema auswählen, ohne vorher `THEMEN_HISTORIE.md` zu prüfen
- ein Reel-Thema für YouTube wiederholen, wenn dieselbe Kernfrage bereits verwendet wurde
- die Reel-Bildwelt auf YouTube anwenden
- ein Video unter 10 Minuten als neuen Standard planen
- wenige lange Standbilder als ausreichende Bildplanung behandeln
- Thumbnail oder finalen Titel vergessen
- Assets, Renderstatus oder Tests als fertig melden, wenn sie nicht tatsächlich vorliegen

Bei Unsicherheit zuerst `youtube/YOUTUBE_WORKFLOW.md`, danach `youtube/YOUTUBE_VISUAL_WORLD.md`, `THEMEN_HISTORIE.md` und anschließend `99-technik/status.json` des Projekts lesen.
