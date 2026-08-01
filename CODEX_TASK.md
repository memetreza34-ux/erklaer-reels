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
- Position `safe-lower-middle`
- Standardhöhe 79,5 %
- erlaubter Bereich 76,5–80,5 %
- normalerweise 3–6 Wörter
- höchstens zwei Zeilen
- Bildtext nicht identisch wiederholen
- aktuell gesprochenes Wort gelb mit `#FFD84D`
- gelbe Markierung ausschließlich mit verifizierten Wortzeiten
- ohne exakte Wortzeiten bleibt der komplette Cue weiß

Die finalen Wortzeiten werden nicht manuell geschätzt. Nach dem Audio-Sync muss Codex ausführen:

```bash
npm run sync:words -- --dir "PFAD-ZUM-REEL" --strict
```

Der Befehl verwendet die Gemini Interactions API, erzeugt `wordTimings`, baut Untertitel-Cues neu und aktualisiert Timeline sowie Render-Plan.

Voraussetzungen:

- `GEMINI_API_KEY` steht nur lokal in `.env`
- Szenengrenzen wurden zuvor mit `sync:audio --strict` geprüft
- nach Änderungen am Audio oder nach `trim:pauses` wird `sync:words` erneut ausgeführt

Prüfen:

- `review/word-sync-report.json` enthält `passed: true`
- Wortabdeckung beträgt mindestens 98 %
- jede Szene besitzt erkannte Wörter
- Cue-Text und Wortliste stimmen vollständig überein

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

Bilder unsortiert nach `inbox/images/`, Voice-over nach `inbox/audio/`.

Inventar erstellen:

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL"
```

Jedes Bild tatsächlich ansehen und mit Sprechertext, `imageText`, `visualIdea`, Prompt, Figuren, Objekten, Metaphern und Komposition vergleichen.

`inbox/asset-map.json` erstellen. Regeln:

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

## 6. Timeline, Audio und Wortzeiten synchronisieren

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
npm run sync:words -- --dir "PFAD-ZUM-REEL" --strict
```

Prüfen:

- `timeline/timeline-plan.json`
- `render/render-plan.json`
- `review/final-video-report.json`
- `review/gemini-transcript.json`
- `review/word-sync-report.json`

Pflicht:

- Hook beginnt bei Frame 0
- letzte Szene endet mit dem Voice-over
- keine unbeabsichtigten Lücken oder Überlappungen
- Untertitel überschneiden sich nicht
- gelbe Wortmarkierung folgt echten Gemini-Wortzeiten
- Untertitel liegen standardmäßig bei 79,5 %
- Status `audio-synced` und Wort-Sync `complete`

## 7. Visuelle Qualitätsprüfung

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL"
```

Danach jedes Szenenbild und Cover tatsächlich ansehen. `review/visual-inspection.json` vollständig ausfüllen.

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
- Stufe `wordSync` ist bestanden
- `render/render-plan.json` enthält `status: "ready-for-renderer"`

## 9. Renderer prüfen

```bash
npm run validate:render -- --dir "PFAD-ZUM-REEL"
```

Die Prüfung muss bestehen. Sie kontrolliert Pflichtassets, sichere Pfade, Frames, Untertitelposition, exakte Wortzeiten, Cue-Text, Zooms, Schwenks, Übergänge und Sounddateien.

## 10. Fertige MP4 rendern

```bash
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Standardausgabe:

```text
PFAD-ZUM-REEL/output/REEL-ID.mp4
```

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
- automatische Gemini-Wortzeiten bestanden
- visuelle Prüfung bestanden
- Abschlussprüfung freigegeben
- Renderer-Eingabe validiert
- MP4 erfolgreich erzeugt

Keine simulierte oder nur geplante Stufe als abgeschlossen bezeichnen.
