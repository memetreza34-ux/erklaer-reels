# Codex-Hauptauftrag

Dieses Repository produziert vollständige visuelle Erklär-Reels. Der Nutzer erzeugt Voice-over und Bilder extern. Codex übernimmt Planung, Asset-Zuordnung, Audio-Pacing, lokale Audio-Prüfung, Synchronisierung, Qualitätsprüfung und den abschließenden Remotion-Render.

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
  --next-free \
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

Jede Szene benötigt `audioCue`, `leadInSeconds`, `subtitleCues`, `subtitlePosition` und `durationSeconds`.

Das Bild beginnt normalerweise 0,1–0,3 Sekunden vor dem gesprochenen `audioCue`.

## 3. Untertitel

- standardmäßig aktiv
- Position `safe-middle`
- Standardhöhe 68 %
- erlaubter Bereich 64–72 %
- nicht exakt bei 50 %, weil dort häufig Gesichter und Hauptmotive liegen
- normalerweise 3–6 Wörter
- höchstens zwei Zeilen
- Bildtext nicht identisch wiederholen
- normaler Text in weichem Weiß `#F5F7FA`
- aktuell gesprochenes Wort in Warmgelb `#FFD84D`
- dunkle halbtransparente Hintergrundbox mit ungefähr 72 % Deckkraft
- warmgelbe Markierung ausschließlich mit akustisch bestätigten Wortzeiten
- ohne exakte Wortzeiten bleibt der komplette Cue in weichem Weiß
- innerhalb 64–72 % darf die Position verschoben werden, wenn ein wichtiges Motiv verdeckt wird

Die finalen Wortzeiten werden nicht mathematisch geschätzt und nicht über Gemini erzeugt. Codex übernimmt die lokale Audio-Prüfung.

## 4. Zooms, direkte Schnitte und Sounds

Lies `knowledge/effects-rules.md` und `config/effects-rules.json`.

Pflichtregeln:

- nicht jedes Bild bewegen
- Zoom normalerweise 2–6 %, maximal 8 %
- Schwenk maximal 4 %
- Hook: `transitionIn.type: "none"`, Dauer 0
- jede weitere Szene: `transitionIn.type: "cut"`, Dauer 0
- keine Crossfades, Schwarzblenden, Dip-to-dark-, Slide-, Glitch-, Spin- oder Flash-Übergänge
- kein schwarzes Zwischenbild
- neues Bild ab dem ersten Schnittframe vollständig sichtbar
- Voice-over hat Vorrang
- Hintergrundmusik standardmäßig aus
- null bis zwei dezente Soundeffekte pro Szene
- Soundeffekt benötigt zum Rendern einen echten lokalen `file`-Pfad

## 5. Externe Dateien zurücknehmen

Bilder unsortiert nach `inbox/images/`, Voice-over nach `inbox/audio/`.

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

## 6. Voice-over-Pacing optimieren

Vor der Timeline verpflichtend:

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL"
```

Standardwirkung:

- Pausen ab ungefähr 0,24 Sekunden werden deutlich gekürzt.
- Nur eine kurze natürliche Restpause bleibt erhalten.
- Das Voice-over wird mit ungefähr `1.05x` leicht beschleunigt.
- Die Tonhöhe bleibt erhalten.

Prüfe `review/audio-pacing-report.json`. Die Stufe muss bestanden sein. Nach jeder Änderung an der Audiodatei diesen Schritt erneut ausführen.

## 7. Timeline und Audio synchronisieren

Erst mit der optimierten Audiodatei:

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

## 8. Wortzeiten durch Codex synchronisieren

Zuerst vorbereiten:

```bash
npm run sync:words -- --dir "PFAD-ZUM-REEL"
```

Dadurch entstehen:

- `subtitles/codex-word-sync.json`
- `production/codex-word-sync-task.md`
- `review/word-sync-report.json`

Codex muss danach das optimierte lokale Voice-over vollständig anhören und in `subtitles/codex-word-sync.json` für jedes Wort eintragen:

- absolute `startSeconds`
- absolute `endSeconds`
- `confidence` zwischen 0 und 1
- `reviewed: true` erst nach akustischer Kontrolle

Verboten:

- Wörter gleichmäßig über die Satzdauer verteilen
- Zeiten erfinden
- das Audio an einen externen Transkriptionsdienst senden
- einen externen API-Schlüssel für diesen Schritt verwenden

Danach anwenden:

```bash
npm run sync:words -- \
  --dir "PFAD-ZUM-REEL" \
  --apply \
  --strict
```

Prüfen:

- `review/word-sync-report.json` enthält `passed: true`
- mindestens 98 % Wortabdeckung
- im strengen Lauf mindestens 0,85 Konfidenz pro Wort
- jede Szene besitzt bestätigte Wörter
- Cue-Text und Wortliste stimmen vollständig überein
- `timingProvider` ist `codex-local-audio-review`
- `verticalPositionPercent` liegt zwischen 64 und 72, Standard 68
- `textColor` ist `#F5F7FA`
- `highlightColor` ist `#FFD84D`

Nach Änderungen am Audio müssen Audio-Pacing, `sync:audio` und der Codex-Wort-Sync erneut ausgeführt werden.

## 9. Visuelle Qualitätsprüfung

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL"
```

Danach jedes Szenenbild und Cover tatsächlich ansehen. `review/visual-inspection.json` vollständig ausfüllen.

Prüfen:

- 9:16 und ausreichende Auflösung
- Hauptmotiv sicher positioniert
- Text lesbar und fehlerfrei
- Untertitelzone 64–72 % verdeckt keine Gesichter, Schlüsselsymbole oder wichtigen Bildtexte
- weiches Weiß und Warmgelb bleiben auf der dunklen Box klar unterscheidbar
- keine Kollision mit Plattform-Bedienelementen
- Zoom und Schwenk schneiden nichts Wichtiges ab
- Stil bleibt konsistent

Strenge Abnahme:

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
```

## 10. Zentrale Abschlussprüfung

```bash
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
```

Nur weiterarbeiten, wenn:

- `review/final-readiness-report.json` enthält `readyForRenderer: true`
- Stufe `audioPacing` ist bestanden
- Stufe `wordSync` ist bestanden
- `render/render-plan.json` enthält `status: "ready-for-renderer"`

## 11. Renderer prüfen und MP4 erzeugen

```bash
npm run validate:render -- --dir "PFAD-ZUM-REEL"
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Die Renderer-Prüfung blockiert jeden Fade oder Übergang mit Dauer. Erlaubt sind ausschließlich `none` für die Hook und `cut` für die folgenden Szenen. Zusätzlich werden Untertitelposition und Farbpalette streng geprüft.

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
- Audio-Pacing bestanden
- Audio synchronisiert
- Codex-Wortzeiten akustisch bestätigt und streng validiert
- Untertitelposition und Farbpalette validiert
- alle Szenen direkte harte Schnitte verwenden
- visuelle Prüfung bestanden
- Abschlussprüfung freigegeben
- Renderer-Eingabe validiert
- MP4 erfolgreich erzeugt

Keine simulierte oder nur geplante Stufe als abgeschlossen bezeichnen.
