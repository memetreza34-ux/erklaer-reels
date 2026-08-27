# YOUTUBE WORKFLOW — VERBINDLICHE REGEL FÜR LANGVIDEOS

**Stand: 2026-08-27**

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
- Recherche, Script, Szenen, Bildprompts, Assets, Audio, Thumbnail, Schnitt, Upload-Metadaten und Output werden getrennt gespeichert.
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
├── video.json
├── status.json
├── 00-idee/
│   └── brief.md
├── 01-recherche/
│   └── sources.md
├── 02-script/
│   ├── outline.md
│   ├── script.txt
│   └── voice-script.txt
├── 03-szenen/
│   └── scene-plan.md
├── 04-bildprompts/
│   └── all-image-prompts.txt
├── 05-assets/
│   └── README.md
├── 06-audio/
│   └── README.md
├── 07-thumbnail/
│   ├── thumbnail-brief.md
│   └── thumbnail-prompt.txt
├── 08-edit/
│   └── edit-plan.md
├── 09-upload/
│   ├── title-options.txt
│   ├── description.txt
│   └── chapters.txt
└── 10-output/
    └── README.md
```

## Produktionsphasen

1. **Idee:** Thema, Kernfrage, Zielgruppe und Nutzen festhalten.
2. **Recherche:** belastbare Quellen sammeln und Aussagen prüfen.
3. **Script:** Outline, vollständiges Script und endgültiges Voice-Script erstellen.
4. **Szenenplanung:** Script in klare visuelle Abschnitte zerlegen.
5. **Bildprompts:** benötigte Bilder/Illustrationen präzise in der festen YouTube-Bildwelt vorbereiten.
6. **Assets:** Bilder, Grafiken, Screenshots und sonstige Medien sammeln.
7. **Audio:** Voice-over und SFX verwalten.
8. **Thumbnail:** eigenes Thumbnail-Konzept getrennt vom Video entwickeln, aber in derselben grundlegenden Zeichenwelt.
9. **Edit:** Schnitt-, Timing-, Text- und Effektplan festhalten.
10. **Upload:** Titel, Beschreibung, Kapitel und weitere Veröffentlichungsdaten vorbereiten.
11. **Output:** finale Videodatei und finale Exportartefakte ablegen.

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
- vorhandene YouTube-Projektstruktur löschen oder umbenennen
- globale YouTube-Regeln aus einem einzelnen Projekt ableiten
- Quellenstatus, Audio-, Bild- oder Renderstatus als fertig markieren, wenn die Stufe nicht tatsächlich erledigt wurde
- fehlende Assets oder Tests erfinden

Bei Unsicherheit zuerst `youtube/YOUTUBE_WORKFLOW.md`, danach `youtube/YOUTUBE_VISUAL_WORLD.md` und anschließend das jeweilige `status.json` des Projekts lesen.
