# Codex-Hauptauftrag

Dieses Repository produziert vollständige visuelle Erklär-Reels. Der Nutzer erzeugt Voice-over und Bilder extern. Codex übernimmt Planung, Asset-Zuordnung, Synchronisierung, Qualitätsprüfung und den abschließenden Remotion-Render.

## 1. Neues Reel vorbereiten

Wenn nur ein Thema vorliegt, schreibe zuerst ein einfaches deutsches Voice-over-Script mit genau einem Erzähler.

Bildanzahl:

- 35–44 Sekunden: normalerweise 8–10 Bildmomente
- 45–55 Sekunden: normalerweise 10–12 Bildmomente

Reel anlegen:

```bash
npm run create:reel -- \
  --title "TITEL" \
  --script-file input/script.txt \
  --date YYYY-MM-DD \
  --scenes 10
```

Danach `production/agent-task.md` vollständig bearbeiten.

Verbindliche Dateien:

- `script/final-script.txt`
- `script/voice-script.txt`
- `reel.json`
- `scenes/scene-index.json`
- jede `scenes/scene-XX/scene.json`
- jede `scenes/scene-XX/image-prompt.txt`
- `subtitles/subtitle-plan.json`
- `effects/effects-plan.json`
- `cover/cover.json`
- `cover/cover-prompt.txt`
- `caption/caption.txt`
- `sources/sources.md`

Inhalt prüfen:

```bash
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

Fehler vollständig beheben, bevor der Nutzer Bilder und Voice-over erzeugt.

## 2. Kreative Pflichtregeln

- Hook-Bild ab Sekunde 0
- keine schulische Einleitung
- ungefähr alle 3,5–5 Sekunden eine sichtbare Veränderung
- einfache Bilder dürfen kürzer stehen
- konsistente Bildwelt innerhalb eines Reels
- Bildprompts Englisch, sichtbarer Bildtext Deutsch
- politische Inhalte neutral
- Quellen und Unsicherheiten dokumentieren

Jede Szene benötigt:

- `audioCue`
- `leadInSeconds`, normalerweise 0,1–0,3
- `subtitleCues`
- `subtitlePosition`
- `durationSeconds`

Das Bild beginnt normalerweise 0,1–0,3 Sekunden vor dem gesprochenen `audioCue`.

## 3. Untertitel

- standardmäßig aktiv
- untere Mitte bei ungefähr 65–75 % der Bildhöhe
- normalerweise 3–6 Wörter
- höchstens zwei Zeilen
- Sinnabschnitte statt Wort-für-Wort-Karaoke
- Bildtext nicht identisch wiederholen
- nicht in Bildprompts einbrennen

## 4. Zooms, Übergänge und Sounds

Lies:

- `knowledge/effects-rules.md`
- `config/effects-rules.json`

Pflichtregeln:

- nicht jedes Bild bewegen
- Zoom normalerweise 2–6 %, maximal 8 %
- Schwenk maximal 4 %
- Hook ohne Übergang
- `cut` als Standard
- Crossfade nur 0,1–0,25 Sekunden
- keine auffälligen Glitch-, Spin- oder Flash-Übergänge
- Voice-over hat Vorrang
- Hintergrundmusik standardmäßig aus
- null bis zwei dezente Soundeffekte pro Szene
- Soundeffekt benötigt zum Rendern einen echten lokalen `file`-Pfad

## 5. Externe Dateien zurücknehmen

Bilder unsortiert nach:

```text
inbox/images/
```

Voice-over nach:

```text
inbox/audio/
```

Inventar erstellen:

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL"
```

Jedes Bild tatsächlich ansehen und mit Sprechertext, `imageText`, `visualIdea`, Prompt, Figuren, Objekten, Metaphern und Komposition vergleichen.

`inbox/asset-map.json` erstellen.

Regeln:

- jede Quelle und jedes Ziel nur einmal
- Cover getrennt behandeln
- mindestens 0,75 Konfidenz
- unter 0,75 nicht raten
- `confidence` und `reason` angeben

Zuordnung anwenden:

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL" --apply
```

`review/asset-matching-report.json` prüfen.

## 6. Timeline und Audio synchronisieren

Erster Lauf:

```bash
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
```

Falls `ffprobe` fehlt:

```bash
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --audio-duration 48.7
```

Voice-over abhören. Für jede Szene den tatsächlichen Zeitpunkt von `audioCue` in `timeline/audio-sync.json` als `cueTimeSeconds` eintragen. Unsichere Zeiten nicht erfinden.

Danach:

```bash
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

Prüfen:

- `timeline/timeline-plan.json`
- `render/render-plan.json`
- `review/final-video-report.json`

Pflicht:

- Hook beginnt bei Frame 0
- letzte Szene endet mit dem Voice-over
- keine unbeabsichtigten Lücken oder Überlappungen
- Untertitel überschneiden sich nicht
- Sounds liegen innerhalb ihrer Szene
- Status `audio-synced` nur bei verifizierten Zeiten

## 7. Visuelle Qualitätsprüfung

Lies:

- `knowledge/visual-quality-rules.md`
- `config/visual-quality-rules.json`

Technische Prüfung:

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL"
```

Danach jedes Szenenbild und Cover tatsächlich ansehen. `review/visual-inspection.json` vollständig mit `true` oder `false` ausfüllen.

Prüfen:

- 9:16 und ausreichende Auflösung
- Hauptmotiv sicher positioniert
- Text lesbar und fehlerfrei
- keine Untertitelkollision
- keine Kollision mit Plattform-Bedienelementen
- Zoom und Schwenk schneiden nichts Wichtiges ab
- Stil bleibt konsistent

Strenge Abnahme:

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
```

## 8. Zentrale Abschlussprüfung

```bash
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
```

Nur weiterarbeiten, wenn:

- `review/final-readiness-report.json` enthält `readyForRenderer: true`
- `render/render-plan.json` enthält `status: "ready-for-renderer"`

## 9. Renderer prüfen

```bash
npm run validate:render -- --dir "PFAD-ZUM-REEL"
```

Die Prüfung muss bestehen. Sie kontrolliert:

- 1080 × 1920 bei 30 FPS
- lückenlose Frames
- vorhandene Bilder und Voice-over
- sichere lokale Pfade
- gültige Zoom-, Schwenk- und Crossfade-Werte
- Untertitelzeiten
- optionale Sounddateien
- finale Freigabe

## 10. Fertige MP4 rendern

```bash
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Standardausgabe:

```text
PFAD-ZUM-REEL/output/REEL-ID.mp4
```

Eigener Pfad:

```bash
npm run render:reel -- \
  --dir "PFAD-ZUM-REEL" \
  --output "exports/mein-reel.mp4"
```

Der Renderer setzt um:

- Szenenbilder
- Voice-over
- Untertitel
- Zooms und Schwenks
- Schnitte und Crossfades
- vorhandene Soundeffekt-Dateien

Nach Erfolg prüfen:

- `review/renderer-input-report.json`
- `review/render-execution-report.json`
- MP4-Datei
- `status.json` enthält `render: "complete"`

## Fertig bedeutet

Das Reel ist erst vollständig fertig, wenn:

- Inhaltsprüfung bestanden
- Assets korrekt zugeordnet
- Audio synchronisiert
- visuelle Prüfung bestanden
- Abschlussprüfung freigegeben
- Renderer-Eingabe validiert
- MP4 erfolgreich erzeugt

Keine simulierte oder nur geplante Stufe als abgeschlossen bezeichnen.
