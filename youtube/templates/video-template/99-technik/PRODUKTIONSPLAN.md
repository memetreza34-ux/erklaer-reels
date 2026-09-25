# Interner YouTube-Produktionsplan — V4

**Für neue Schema-9+-Projekte.**

Verbindlich zusätzlich lesen: `youtube/YOUTUBE_WORKFLOW.md`, `youtube/YOUTUBE_VISUAL_WORLD.md`, `youtube/ADAPTIVE_PACING_V2.md`.

## Thema + Recherche

- Thema zuerst durch Themen-Editor
- Duplicate-Check gegen Historie, Register und bestehende Projekte
- belastbare Quellen
- klare Unsicherheiten/Einordnungen
- finaler klickbarer, aber sachlich korrekter Titel

## Sichtbare Nutzerstruktur

```text
00-bildprompts/google-flow-prompt.txt
01-voice-script/voice-script.txt
02-audio/voiceover-final.*
```

Keine sichtbaren Script-Parts, Audio-Parts oder 10er-Bildordner.

## Bildplanung

- **Bild 01 = Cover + erste Videoszene**
- kein Bild 00
- Bild 01 bis Bild NN bilden die komplette Timeline
- 1 Bild = 1 klarer visueller Zweck
- Bildanzahl entsteht aus Skript und visueller Komplexität
- keine feste Sollzahl

A–E:
- A sehr einfach: 4–5 s geplant
- B einfach: 5–7 s
- C mittel: 7–9 s
- D komplex: 9–12 s
- E sehr komplex: 12–15 s

## Visual Policy V4

Aktive YouTube-Style-ID:

```text
serious-minimal-countryball-explainer-youtube-16x9
```

Quelle:

```text
serious-minimal-countryball-explainer
```

Verbindlich:
- dieselbe Serious-Minimal-Countryball-DNA wie die Reels
- 16:9 horizontal
- perfekt runde Countryball-Akteure, wenn Akteure nötig sind
- einfache weiße Augen, dicke schwarze Konturen
- flache kontrollierte Farben
- geringe bis mittlere Detaildichte
- 0–3 sinnvolle Zusatzobjekte
- starke Symbolik statt realistischer Vollszenen
- keine normalen illustrierten Menschen
- keine humanoiden Cartoon-Personen
- keine Stickfiguren
- kein Fotorealismus
- kein 3D/Pixar/Clay/Anime
- sichtbarer Text im deutschen Projekt ausschließlich Deutsch

Historische Inhalte werden in dieselbe reduzierte Formsprache übersetzt.

## Google Flow — Asset Generation Policy V1

`google-flow-prompt.txt` enthält Bild 01 bis Bild NN.

Cover:

```text
Bild 01 exakt 3× erzeugen
→ genau 1 Gewinner auswählen
→ Gewinner einmal zu Bild 01.png umbenennen
→ andere 2 Kandidaten verwerfen
```

Nicht-Cover:

```text
Bild 02–NN jeweils exakt 1×
→ keine Varianten
→ keine manuellen Review-Stopps nach 5er-Gruppen
→ jedes Bild einmal korrekt benennen
```

Maximal fünf aktive Generierungen gleichzeitig. Das ist nur Parallelitäts-/Lastlogik.

**HARD LOCK:** Kein erzeugtes Bild darf als visuelle Vorlage oder Image-to-Image-Referenz für ein späteres Bild verwendet werden. Bild 01 ist kein Master-Style-Frame.

Alle finalen Bilder flach unter:

```text
00-bildprompts/images/
```

Dort nur `Bild 01.png` bis `Bild NN.png`, keine Cover-Kandidaten, keine Extras, keine Unterordner.

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

- Motion standardmäßig aus A–E
- Projekt kann pro Bild `motionOverride` setzen
- SFX nur gezielt auf ausgewählten Bildern
- SFX-Typen aus `config/sound-library.json`
- keine Hintergrundmusik standardmäßig
- Voice-over bleibt dominant

## Phase 3

Normalstart:

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Ablauf:
1. Phase-1-Policy-Gate
2. Phase-2-Asset-Gate
3. eine finale Audiodatei bestimmen
4. langes Schweigen/Endstille intern kürzen
5. exakt 1,10x bei erhaltener Tonhöhe
6. −16 LUFS / max. −1,5 dBTP
7. Whisper auf der optimierten Fassung
8. Audioanker bestimmen
9. `FINAL_TIMELINE.json`
10. A–E-Pacing-Gate
11. Render + SFX
12. `THUMBNAIL.png` direkt aus `Bild 01.png`
13. Post-Render-QC

## Export

```text
03-export/FERTIGES-VIDEO.mp4
03-export/THUMBNAIL.png
03-export/YOUTUBE-TITEL.txt
03-export/YOUTUBE-BESCHREIBUNG.txt
03-export/YOUTUBE-KAPITEL.txt
03-export/YOUTUBE-TAGS.txt
```
