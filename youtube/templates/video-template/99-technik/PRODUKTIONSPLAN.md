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
- jedes Bild bekommt eine eigenständige, zum Inhalt passende Komposition

A–E:
- A sehr einfach: 4–5 s geplant
- B einfach: 5–7 s
- C mittel: 7–9 s
- D komplex: 9–12 s
- E sehr komplex: 12–15 s

Wenn ein einfacher Moment im gesprochenen Text länger dauert, wird ein weiterer sinnvoller Bildmoment geplant statt ein simples Bild künstlich lange stehen zu lassen.

## Google Flow — unabhängige Bilder

`google-flow-prompt.txt` enthält Bild 00 und alle Szenenbilder.

**HARD LOCK:** Kein erzeugtes Bild darf als visuelle Vorlage oder Image-to-Image-Referenz für ein späteres Bild verwendet werden. Bild 01 ist kein Master-Style-Frame.

```text
Bild 00 separat
Bild 01 separat
Bild 02–05 jeweils separat aus eigenem Textprompt → warten → prüfen → korrigieren
Bild 06–10 erst danach
Bild 11–15 ...
```

Maximal fünf aktive Generierungen. Die Wellen sind nur eine Last-/Ausführungsregel. Stil-Konsistenz kommt aus dem schriftlichen Style-Lock `premium-editorial-explainer-illustration-youtube-16x9`, nicht aus einem Referenzbild.

Bilder flach unter `00-bildprompts/images/`.

## Visual Quality

Für neue YouTube-Projekte:
- hochwertige moderne 2D-Editorial-/Erklärillustration
- 16:9
- erwachsene Magazin-/Infografik-Wirkung
- präzise vektorartige Formen, kontrollierte Linien, subtile Tiefe
- jedes Bild individuell art-direktiert
- Layout/Perspektive/Hintergrund nicht mechanisch wiederholen
- kein generisches KI-Template
- kein Countryball-Zwang
- keine Stickfiguren als Standardstil
- sichtbarer Text in deutschen Projekten ausschließlich Deutsch

## Voice-over

Aus `voice-script.txt` wird eine vollständige finale Voice-over-Datei erzeugt und unter `02-audio/` abgelegt.

Das Nutzeroriginal wird niemals überschrieben. Phase 3 erzeugt daraus intern die optimierte Arbeitsfassung.

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
2. langes Schweigen/Endstille intern kürzen und auf 1,10x bei erhaltener Tonhöhe optimieren
3. −16 LUFS / max. −1,5 dBTP anwenden
4. Whisper-Wortzeiten auf der optimierten Fassung messen
5. alle `startAnchor` monoton im echten Audio finden
6. `FINAL_TIMELINE.json` bauen
7. A–E-Planung gegen die echte Timeline prüfen
8. Hard-Gate
9. Motion + SFX rendern
10. Thumbnail und Upload-Metadaten finalisieren
11. Post-Render-QC

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
