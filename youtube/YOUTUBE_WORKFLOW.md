# YOUTUBE WORKFLOW — VERBINDLICHE REGEL FÜR LANGVIDEOS

**Stand: 2026-08-28**

Diese Datei ist die verbindliche Regelquelle für den YouTube-Langvideo-Bereich dieses Repositories.

## Priorität

Für YouTube gilt:

1. aktuelle ausdrückliche Nutzeranweisung im laufenden Chat
2. `youtube/YOUTUBE_WORKFLOW.md`
3. `youtube/YOUTUBE_VISUAL_WORLD.md` für die feste YouTube-Bildwelt
4. `CURRENT_WORKFLOW.md` nur für repo-weite Sicherheits- und Qualitätsprinzipien
5. sonstige Dokumente und ältere YouTube-Projekte

Reel-spezifische Vorgaben dürfen nicht ungefragt auf Langvideos übertragen werden.

## Grundprinzip

- YouTube-Langvideos liegen ausschließlich unter `youtube/projects/`.
- Jedes Video bekommt einen eigenen Projektordner.
- Der normale sichtbare Projektbereich bleibt bewusst einfach: Bildprompts, Voice-Script, Audio, Export und Technik.
- Recherche, Idee, Szenenplanung, Thumbnail-Plan, Edit-Plan, Status und Metadaten werden intern unter `99-technik/` gesammelt.
- Ein neuer Chat liest zuerst diese Datei und danach `youtube/YOUTUBE_VISUAL_WORLD.md`, bevor er im YouTube-Bereich Änderungen vornimmt.
- Ein einzelnes YouTube-Projekt darf globale YouTube-Regeln nicht nebenbei verändern.

## Aktueller YouTube-Startstandard

- Neue YouTube-Langvideos sollen zunächst **ungefähr 5 bis 6 Minuten** lang sein.
- Die Spanne ist ein Zielkorridor und keine sekundengenaue Pflicht.
- Ein Video darf innerhalb dieses Bereichs natürlich enden; Inhalt wird nicht künstlich gestreckt oder gekürzt, nur um exakt eine Zahl zu treffen.
- Eine andere Dauer gilt nur, wenn der Nutzer sie für ein konkretes Video oder als neuen globalen Standard ausdrücklich festlegt.
- Aus der Dauer werden **keine feste Wortzahl und keine feste Szenenzahl automatisch erfunden**.

## Feste YouTube-Bildwelt

Für alle neuen YouTube-Langvideos gilt global:

```text
visualStyleId = "youtube-editorial-stick-explainer"
visualStyleReason = "Feste YouTube-Bildwelt: hand-drawn editorial stick-figure explainer style für erzählerische Langvideos."
```

Die verbindliche Style-Bibel liegt in:

```text
youtube/YOUTUBE_VISUAL_WORLD.md
```

Die YouTube-Bildwelt ist vollständig von der Reel-Bildwelt getrennt.

- `modern-countryball-explainer` gilt nur für Reels.
- `youtube-editorial-stick-explainer` gilt für YouTube-Langvideos.
- Reel-Countryballs dürfen nicht automatisch in YouTube-Projekte übernommen werden.
- YouTube-Bildprompts werden auf Englisch geschrieben.
- Sichtbarer Bildtext richtet sich nach der Sprache des jeweiligen YouTube-Projekts.
- Standardformat für Szenenbilder ist 16:9.

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
- keine 3D-/Pixar-/Clay-Optik
- keine Countryballs als YouTube-Standard

## Standard-Projektstruktur

```text
video-XX_slug/
├── 00-bildprompts/
│   └── 99-alle-bildprompts.txt
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

Es gibt keinen separaten sichtbaren `09-upload/`- oder `10-output/`-Bereich mehr. Upload-Metadaten und finale Artefakte werden gemeinsam unter `03-export/` gesammelt.

## Produktionsphasen

1. **Idee und Recherche:** Thema, Kernfrage, Zielgruppe, Nutzen und belastbare Quellen intern unter `99-technik/` planen.
2. **Script:** endgültiges Voice-over nach `01-voice-script/voice-script.txt` schreiben; interne Outline kann in `99-technik/PRODUKTIONSPLAN.md` bleiben.
3. **Szenen und Bildprompts:** Szenen intern planen und den vollständigen Prompt-Satz unter `00-bildprompts/` ablegen.
4. **Audio:** Voice-over und tatsächlich verwendete Audiodateien unter `02-audio/` verwalten.
5. **Thumbnail und Edit:** Konzept, Schnitt, Timing, SFX und sonstige interne Produktionsentscheidungen unter `99-technik/` dokumentieren.
6. **Upload-Metadaten:** genau einen finalen YouTube-Titel, die finale Beschreibung, Kapitel und optionale Tags für `03-export/` vorbereiten.
7. **Export:** finale Videodatei und finales Thumbnail ebenfalls nach `03-export/` legen.

## YouTube-Export — verbindlich

`03-export/` ist der einzige finale Upload-Bereich eines YouTube-Langvideos.

Pflicht bzw. vorgesehene Dateien:

- `FERTIGES-VIDEO.mp4` – finale geprüfte Videodatei
- `THUMBNAIL.png` – finales Thumbnail
- `YOUTUBE-TITEL.txt` – genau ein finaler Upload-Titel
- `YOUTUBE-BESCHREIBUNG.txt` – finale YouTube-Beschreibung
- `YOUTUBE-KAPITEL.txt` – finale Kapitel mit Zeitstempeln, wenn sinnvoll
- `YOUTUBE-TAGS.txt` – optionale passende Tags

Für YouTube-Langvideos gibt es ausdrücklich **keine `UNIVERSELLE-CAPTION.txt`**. Reel-/Shorts-Captions dürfen nicht in YouTube-Projekte übernommen werden.

## Interner Technikbereich

`99-technik/` enthält alles, was für Planung und Status wichtig ist, aber im normalen Upload-Workflow nicht als eigener sichtbarer Hauptbereich benötigt wird. Dazu gehören insbesondere:

- Idee und Recherche
- Szenenplanung
- Thumbnail-Plan
- Edit-Plan
- Produktionsstatus
- interne Video-Metadaten

`99-technik/status.json` ist die kanonische Statusdatei des Projekts. `99-technik/video.json` ist die kanonische interne Projektmetadatei. Diese Dateien werden nicht zusätzlich noch einmal im Projektwurzelverzeichnis gespiegelt.

## Noch nicht global festgelegt

Folgende Werte werden **nicht erfunden**, solange der Nutzer sie nicht ausdrücklich festlegt:

- feste Wortzahl
- feste Szenenzahl
- feste Upload-Frequenz
- feste Thumbnail-Formel
- feste Untertitelposition
- feste Sprecherstimme
- feste Musikregel

Die **Bildwelt ist jetzt global festgelegt** und gehört nicht mehr in diese offene Liste.

## Sicherheit gegen neue Chats

Neue Chats dürfen nicht:

- Reel-Regeln automatisch auf YouTube übertragen
- die Reel-Bildwelt `modern-countryball-explainer` als YouTube-Standard verwenden
- die feste YouTube-Bildwelt ohne ausdrückliche Nutzerentscheidung ersetzen
- die vereinfachte sichtbare YouTube-Projektstruktur ohne ausdrückliche Nutzerentscheidung wieder auf viele Hauptordner aufteilen
- `09-upload/` oder `10-output/` wieder als parallele aktive Bereiche einführen
- eine `UNIVERSELLE-CAPTION.txt` für YouTube-Langvideos erzeugen
- globale YouTube-Regeln aus einem einzelnen Projekt ableiten
- Quellenstatus, Audio-, Bild- oder Renderstatus als fertig markieren, wenn die Stufe nicht tatsächlich erledigt wurde
- fehlende Assets oder Tests erfinden

Bei Unsicherheit zuerst `youtube/YOUTUBE_WORKFLOW.md`, danach `youtube/YOUTUBE_VISUAL_WORLD.md` und anschließend `99-technik/status.json` des jeweiligen Projekts lesen.
