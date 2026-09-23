# Interner YouTube-Produktionsplan — V2

**Für neue Projekte mit `productionRulesVersion >= 2`.**

Verbindlich zusätzlich lesen: `youtube/YOUTUBE_WORKFLOW.md`, `youtube/YOUTUBE_VISUAL_WORLD.md`, `youtube/ADAPTIVE_PACING_V2.md`.

## Thema + Recherche

- Thema/Kernfrage
- Duplicate-Check gegen `THEMEN_HISTORIE.md`
- belastbare Quellen
- klare Unsicherheiten/Einordnungen
- finaler klickbarer, aber sachlich korrekter Titel

## Sichtbare Nutzerstruktur

Neue Projekte haben genau diese produktionsrelevanten Nutzerdokumente:

```text
00-bildprompts/google-flow-prompt.txt
01-voice-script/voice-script.txt
02-audio/voiceover-final.*
```

Keine sichtbaren Script-Parts, Audio-Parts oder 10er-Bildordner.

## Bildplanung

- Bild 00 = ausschließlich Thumbnail
- danach Bild 01 bis Bild NN
- **1 Bild = 1 klarer visueller Zweck**
- Bildanzahl entsteht aus Skript und visueller Komplexität
- keine feste Sollzahl

A–E:
- A sehr einfach: 4–5 s geplant
- B einfach: 5–7 s
- C mittel: 7–9 s
- D komplex: 9–12 s
- E sehr komplex: 12–15 s

Wenn ein einfacher Moment im gesprochenen Text länger dauert, wird ein weiterer sinnvoller Bildmoment geplant statt ein simples Bild künstlich lange stehen zu lassen.

## Google Flow

`google-flow-prompt.txt` enthält Bild 00 und alle Szenenbilder.

```text
Bild 00 separat
01–05 gleichzeitig → warten → prüfen → korrigieren → ablegen
06–10 erst danach
11–15 ...
```

Maximal fünf aktive Generierungen. Bilder flach unter `00-bildprompts/images/`.

## Voice-over

Aus `voice-script.txt` wird eine vollständige finale Voice-over-Datei erzeugt und unter `02-audio/` abgelegt.

Das Nutzeroriginal wird niemals überschrieben. Phase 3 erzeugt daraus intern `99-technik/YOUTUBE_AUDIO_MASTER.wav`.

## Mapping

`99-technik/BILD_AUDIO_ZUORDNUNG.json` enthält pro Bild:
- `imageNumber`
- `imageFile`
- `batchFolder: "images"`
- `startAnchor`
- `endAnchor`
- `visualPurpose`
- `complexityLevel`
- `complexityReason`
- `plannedHoldSeconds`

Erst Phase 3 ergänzt echte Audiozeiten und Konfidenz.

## Motion + SFX

`99-technik/YOUTUBE_RENDER_PLAN.json` ist die maschinenlesbare Quelle für Rendergestaltung.

- Motion wird standardmäßig aus A–E abgeleitet
- Projekt kann pro Bild `motionOverride` setzen
- SFX nur gezielt auf ausgewählten Bildern
- SFX-Typen stammen aus der zentralen `config/sound-library.json`
- keine Hintergrundmusik standardmäßig
- Voice-over bleibt dominant

## Phase 3

Normalstart:

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Ablauf:
1. eine finale Audiodatei und alle Bilder prüfen
2. Whisper-Wortzeiten messen
3. überlange Endstille für das interne Master-Audio automatisch kürzen
4. alle `startAnchor` monoton im echten Audio finden
5. `FINAL_TIMELINE.json` bauen
6. A–E-Planung gegen die echte Timeline prüfen
7. Hard-Gate
8. Motion + SFX rendern
9. Thumbnail und Upload-Metadaten finalisieren
10. Post-Render-QC

## Export

Am Ende müssen existieren:

```text
03-export/FERTIGES-VIDEO.mp4
03-export/THUMBNAIL.png
03-export/YOUTUBE-TITEL.txt
03-export/YOUTUBE-BESCHREIBUNG.txt
03-export/YOUTUBE-KAPITEL.txt
03-export/YOUTUBE-TAGS.txt
```
