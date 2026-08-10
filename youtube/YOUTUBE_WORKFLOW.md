# YOUTUBE WORKFLOW — VERBINDLICHE REGEL FÜR LANGVIDEOS

**Stand: 2026-08-10**

Diese Datei ist die verbindliche Regelquelle für den YouTube-Langvideo-Bereich dieses Repositories.

## Priorität

Für YouTube gilt:

1. aktuelle ausdrückliche Nutzeranweisung im laufenden Chat
2. `youtube/YOUTUBE_WORKFLOW.md`
3. `CURRENT_WORKFLOW.md` nur für repo-weite Sicherheits- und Qualitätsprinzipien
4. sonstige Dokumente und ältere YouTube-Projekte

Reel-spezifische Vorgaben dürfen nicht ungefragt auf Langvideos übertragen werden.

## Grundprinzip

- YouTube-Langvideos liegen ausschließlich unter `youtube/projects/`.
- Jedes Video bekommt einen eigenen Projektordner.
- Recherche, Script, Szenen, Bildprompts, Assets, Audio, Thumbnail, Schnitt, Upload-Metadaten und Output werden getrennt gespeichert.
- Ein neuer Chat liest zuerst diese Datei, bevor er im YouTube-Bereich Änderungen vornimmt.
- Ein einzelnes YouTube-Projekt darf globale YouTube-Regeln nicht nebenbei verändern.

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
5. **Bildprompts:** benötigte Bilder/Illustrationen präzise vorbereiten.
6. **Assets:** Bilder, Grafiken, Screenshots und sonstige Medien sammeln.
7. **Audio:** Voice-over und SFX verwalten.
8. **Thumbnail:** eigenes Thumbnail-Konzept getrennt vom Video entwickeln.
9. **Edit:** Schnitt-, Timing-, Text- und Effektplan festhalten.
10. **Upload:** Titel, Beschreibung, Kapitel und weitere Veröffentlichungsdaten vorbereiten.
11. **Output:** finale Videodatei und finale Exportartefakte ablegen.

## Noch nicht global festgelegt

Folgende Werte werden **nicht erfunden**, solange der Nutzer sie nicht ausdrücklich festlegt:

- feste Videolänge
- feste Wortzahl
- feste Szenenzahl
- feste Upload-Frequenz
- feste Thumbnail-Formel
- feste Untertitelposition
- feste Bildwelt
- feste Sprecherstimme
- feste Musikregel

Diese Punkte werden pro Projekt festgelegt oder später ausdrücklich als globaler YouTube-Standard ergänzt.

## Sicherheit gegen neue Chats

Neue Chats dürfen nicht:

- Reel-Regeln automatisch auf YouTube übertragen
- vorhandene YouTube-Projektstruktur löschen oder umbenennen
- globale YouTube-Regeln aus einem einzelnen Projekt ableiten
- Quellenstatus, Audio-, Bild- oder Renderstatus als fertig markieren, wenn die Stufe nicht tatsächlich erledigt wurde
- fehlende Assets oder Tests erfinden

Bei Unsicherheit zuerst `youtube/YOUTUBE_WORKFLOW.md` und danach das jeweilige `status.json` des Projekts lesen.
