# YOUTUBE WORKFLOW — VERBINDLICHE REGEL FÜR LANGVIDEOS

**Stand: 2026-08-21**

Diese Datei ist die verbindliche Regelquelle für deutsche YouTube-Langvideos in diesem Repository.

## Priorität

1. aktuelle ausdrückliche Nutzeranweisung
2. `youtube/YOUTUBE_WORKFLOW.md`
3. `youtube/YOUTUBE_VISUAL_WORLD.md`
4. `config/youtube-production.json`
5. `CURRENT_WORKFLOW.md` nur für repo-weite Sicherheitsprinzipien
6. ältere YouTube-Projekte und sonstige Dokumente

Reel-spezifische Werte wie 9:16, 55–60 Sekunden, 13 Szenen und Reel-Untertitel gelten nicht für YouTube.

## Kanalpositionierung

Deutschsprachige, quellenbasierte Erklärgeschichten über Menschen und die Welt, in der sie leben. Komplexe Themen werden unterhaltsam, verständlich und visuell erzählt.

Erlaubte Säulen:

- Menschheitsgeschichte und Alltag früherer Menschen
- Psychologie, Verhalten und Wahrnehmung
- Gesellschaft, Kultur und historische Entwicklungen
- Wissenschaft hinter alltäglichen menschlichen Fragen

Keine tagespolitischen Nachrichten, Parteienwerbung oder ungeprüfte Sensationsbehauptungen.

## Verbindlicher YouTube-Standard

- 16:9, 1920 × 1080, 30 FPS
- 8–12 Minuten, Ziel ungefähr 10 Minuten
- genau ein deutscher Erzähler
- ungefähr 145 gesprochene Wörter pro Minute
- 60–90 visuelle Szenen, Standard 72
- Bildwechsel meistens alle 5–12 Sekunden
- ausschließlich Bilder, Voice-over und sparsame Soundeffekte
- keine eingebrannten Untertitel
- keine Karaoke-Wörter, Textkarten oder redaktionellen Texteinblendungen im Video
- keine Hintergrundmusik
- harte Schnitte; nur dezente Bewegung innerhalb eines Standbildes
- Quellenpflicht für alle wichtigen Tatsachenbehauptungen
- Thumbnail separat, mit höchstens 1–3 deutschen Wörtern

## Eigene Bildwelt

Für neue Langvideos gilt ausschließlich `german-simple-explainer-cartoon`.

Die vollständige Definition steht in `youtube/YOUTUBE_VISUAL_WORLD.md`. Sie ist von handgezeichneten Education-Formaten inspiriert, kopiert aber keine Figuren, Thumbnails oder Markenmerkmale eines bestehenden Kanals.

## Verbindliche drei Phasen

### Phase 1 — normales ChatGPT

ChatGPT erstellt:

- Thema, Kernfrage und Nutzenversprechen
- belastbare Recherche und Quellen
- Outline und deutsches Voice-Script
- 30-Sekunden-Hook aus Grab, Promise und Stakes
- Kapitel mit Micro-Summary und Forward-Hook
- visuelle Aufmerksamkeitswechsel alle 60–90 Sekunden
- 60–90 Szenen mit Narration, Audio-Cue, Visual-Idee und Prompt
- Google-Flow-Sammeldatei für `Bild 00` bis `Bild XX`
- Thumbnail-Brief und Thumbnail-Prompt
- Titeloptionen, Beschreibung und Kapitel

### Phase 2 — Arman

Arman erzeugt extern:

- `Bild 00` als Thumbnail
- `Bild 01` bis `Bild XX` als vollständige Szenenserie mit Google Flow
- das deutsche Voice-over-Audio

Alle Bilder werden erst nach Abschluss gemeinsam in `05-assets/numbered-images/` gelegt. Das Audio kommt nach `06-audio/inbox/`.

### Phase 3 — Antigravity

Antigravity übernimmt danach alles technisch:

- Übergabe prüfen und fehlende Dateien zuerst suchen
- Bilder tatsächlich visuell in zwei Durchgängen prüfen
- Thumbnail und Szenen sicher zuordnen
- Audio straffen und auf −16 LUFS / maximal −1,5 dBTP normalisieren
- Bildwechsel an echte gesprochene Audio-Cues binden
- Edit- und Renderplan ohne Untertitel erstellen
- alle Inhalts-, Quellen-, Bild-, Audio- und Render-Gates ausführen
- 16:9-MP4 rendern und vollständig prüfen

Antigravity erstellt keine fehlenden Scripts, Prompts, Bilder oder Voice-over-Dateien selbst.

Nach dem Render sieht und hört Antigravity die vollständige MP4, setzt `finalVideoQcPassed` nur nach echter Prüfung und führt anschließend aus:

```bash
npm run validate:youtube-output -- --dir "youtube/projects/video-XX_slug"
```

Erst dieser bestandene Lauf erlaubt die Fertigmeldung.

Vor Phase 3:

```bash
npm run verify:youtube-handoff -- --dir "youtube/projects/video-XX_slug"
```

## Startsignal und Kommunikation

`Antigravity los, erstelle das YouTube-Video`, `Antigravity los` und sinngleiche eindeutige Aufträge starten Phase 3.

Danach gilt stiller Durchlauf: keine Zwischenstände und keine Routinefragen. Antigravity meldet sich erst bei einem nach sicheren Eigenlösungen weiterhin blockierenden Fehler oder mit dem Pfad zur vollständig geprüften MP4.

## Script- und Retention-Struktur

1. **0:00–0:05 Grab:** stärkste Frage, Gefahr oder überraschende Beobachtung.
2. **0:05–0:15 Promise:** was der Zuschauer konkret verstehen wird.
3. **0:15–0:30 Stakes:** warum das Wissen relevant oder überraschend ist.
4. **Kapitel:** jedes Kapitel beginnt mit neuem visuellen Blickwinkel und endet mit Micro-Summary plus Forward-Hook.
5. **Etwa 25 %:** kurze natürliche Kanal-CTA, höchstens 10–15 Sekunden.
6. **Etwa 60 %:** zweiter starker Re-Hook auf den wichtigsten verbleibenden Punkt.
7. **Schluss:** klare Erkenntnis, nächste Frage und Endscreen-Übergang ohne langes Verabschieden.

## Projektstruktur

```text
video-XX_slug/
├── video.json
├── status.json
├── 00-idee/
├── 01-recherche/
├── 02-script/
├── 03-szenen/
├── 04-bildprompts/
├── 05-assets/numbered-images/
├── 06-audio/inbox/
├── 07-thumbnail/
├── 08-edit/
├── 09-upload/
└── 10-output/
```

## Finale Regeln

- kein Render mit Untertiteln oder Textkarten
- kein Render ohne vollständige eindeutige Bildserie und Voice-over
- keine Bildzuordnung nur nach Dateinummer; visuelle Zwei-Pass-QC bleibt Pflicht
- keine Quellen oder QC-Ergebnisse erfinden
- `Bild 00` ist Thumbnail und kein Videoszenenbild
- finale MP4 liegt sichtbar unter `10-output/`
