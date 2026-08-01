# AGENTS.md

## Projektauftrag

Baue und betreibe einen KI-Workflow, der aus einem Thema oder einem fertigen deutschen Sprechertext ein vollständiges visuelles Erklär-Reel erzeugt.

Der Nutzer erzeugt Voice-over und Szenenbilder außerhalb des Repositories. Codex übernimmt Planung, Qualitätsprüfung, Zuordnung, lokale Audio-Prüfung, Synchronisierung und den abschließenden Remotion-Render.

## Sprache

- Benutzeroberfläche, Scripts, Untertitel und sichtbare Bildtexte: Deutsch
- Bildprompts: Englisch
- Code, IDs und Dateinamen: technisch eindeutig

## Themenbereich

Erlaubt:

- Politik und Gesellschaft
- Länder, Geografie und Geschichte
- Psychologie und menschliches Verhalten
- Körper und Biologie

Nicht als eigene Content-Säulen verwenden:

- Finanzen
- Elektrotechnik
- KI-News
- tägliche politische Nachrichten
- Parteienwerbung

Politische Inhalte werden neutral erklärt. Unsicherheiten und umstrittene Aussagen müssen kenntlich gemacht und in `sources/sources.md` dokumentiert werden.

## Produktionsumfang

Ein vollständiger Reel-Ordner enthält:

1. geprüftes deutsches Voice-over-Script
2. 8–12 Bildmomente abhängig von der Audiolänge
3. eine konsistente Bildwelt innerhalb des Reels
4. englische Bildprompts mit optionalem deutschem Schlüsseltext
5. Untertitelplan mit durch Codex akustisch bestätigten Wortzeiten
6. Effektplan für Zooms, Schwenks, Übergänge und Soundeffekte
7. Master-Timeline und Audio-Synchronisierung
8. renderer-neutralen Render-Plan
9. technische und visuelle Qualitätsprüfung
10. Cover, Caption und Quellen
11. unsortierte Asset-Inbox und automatische Zuordnung
12. fertige MP4-Datei über Remotion

Eine automatische Social-Media-Veröffentlichung gehört noch nicht zum Projekt.

## Kreativregeln

- Erkläre einfach, direkt und visuell.
- Keine schulische Einleitung.
- Beginne mit einer klaren Frage, einem Widerspruch oder einer überraschenden Beobachtung.
- Das Hook-Bild ist ab Sekunde 0 vollständig sichtbar.
- Kein schwarzer Start und keine unnötige Einblendeverzögerung.
- 35–44 Sekunden: normalerweise 8–10 visuelle Momente.
- 45–55 Sekunden: normalerweise 10–12 visuelle Momente.
- Ungefähr alle 3,5–5 Sekunden erfolgt ein Bildwechsel oder eine deutliche Ergänzung.
- Einfache Bilder dürfen kürzer stehen als komplexere Bilder.
- Keine mechanisch gleich langen Szenen erzwingen.
- Innerhalb eines Reels bleibt die Bildwelt konsistent.
- Zwischen verschiedenen Reels darf die Bildwelt stark wechseln.
- Build-up-Sequenzen nur verwenden, wenn wirklich eine schrittweise Entwicklung erklärt wird.

## Audio-Cues und Bildwechsel

Jede Szene benötigt:

- `audioCue`: gesprochenes Wort oder kurze Phrase für den Bildbeginn
- `leadInSeconds`: normalerweise 0,1–0,3 Sekunden, Standard 0,2
- `durationSeconds`

Das neue Bild beginnt normalerweise 0,1–0,3 Sekunden vor dem zugehörigen `audioCue`.

Unsichere Cue-Zeitpunkte dürfen nicht erfunden werden. Verifizierte Zeiten gehören nach `timeline/audio-sync.json` und erhalten eine realistische `confidence`.

## Untertitel und Codex-Wortzeiten

- Untertitel sind standardmäßig aktiv.
- Planung in `subtitles/subtitle-plan.json`, nicht in Bildprompts einbrennen.
- Standardposition: `safe-lower-middle` bei 79,5 % der Bildhöhe.
- Erlaubter vertikaler Bereich: 76,5–80,5 %.
- Normalerweise 3–6 Wörter und höchstens zwei Zeilen pro Cue.
- Integrierten Bildtext nicht wortgleich wiederholen.
- Das aktuell gesprochene Wort wird mit `#FFD84D` gelb markiert.
- Die gelbe Markierung darf ausschließlich akustisch bestätigten Wortzeiten folgen.
- Gleichmäßiges Verteilen der Wörter über die Cue-Dauer ist verboten.
- Ohne gültige Wortzeiten bleibt der komplette Untertitel weiß.

Nach bestandener Szenen-Audio-Synchronisierung führt Codex zuerst aus:

```bash
npm run sync:words -- --dir "<reel-ordner>"
```

Dadurch entstehen:

- `subtitles/codex-word-sync.json`
- `production/codex-word-sync-task.md`
- `review/word-sync-report.json`

Danach hört Codex das lokale Voice-over vollständig ab und füllt für jedes Wort in `subtitles/codex-word-sync.json`:

- absolute `startSeconds`
- absolute `endSeconds`
- realistische `confidence`
- `reviewed: true` erst nach akustischer Kontrolle

Anschließend:

```bash
npm run sync:words -- --dir "<reel-ordner>" --apply --strict
```

Pflichtregeln:

- kein Gemini-Aufruf und kein externer Transkriptionsdienst
- kein API-Schlüssel für den Wort-Sync
- Audiodatei nicht extern hochladen
- mindestens 98 % Wortabdeckung
- im strengen Lauf mindestens 0,85 Konfidenz pro Wort
- Wortreihenfolge und sichtbarer Wortlaut bleiben unverändert
- jede Szene besitzt bestätigte Wörter
- nach `trim:pauses` oder einer neuen Audiodatei den Codex-Wort-Sync erneut ausführen
- der finale Renderer-Check blockiert fehlende oder fehlerhafte Wortzeiten

Details stehen in `docs/codex-word-sync.md`.

## Zooms, Schwenks, Übergänge und Sounds

Lies zusätzlich:

- `knowledge/effects-rules.md`
- `config/effects-rules.json`

Planung erfolgt in `effects/effects-plan.json`.

- Nicht jedes Bild braucht Bewegung.
- Ohne klaren Nutzen bleibt `cameraMotion.type` auf `none`.
- Zoom normalerweise 2–6 %, maximal 8 %.
- Schwenk maximal 4 % der Bildbreite oder Bildhöhe.
- Hook ohne Übergang; optional dezenter Push-in.
- Standardübergang: `cut`.
- Crossfade nur 0,1–0,25 Sekunden und nur mit Begründung.
- Keine Glitch-, Spin-, Flash- oder übertriebenen 3D-Übergänge.
- Voice-over hat Vorrang.
- Hintergrundmusik ist standardmäßig ausgeschaltet.
- Pro Szene normalerweise null bis zwei dezente Soundeffekte.
- Nicht jeden Schnitt mit einem Whoosh vertonen.
- Soundeffekte benötigen für den Renderer einen tatsächlichen lokalen `file`-Pfad.

## Visuelle Qualitätsprüfung

Lies zusätzlich:

- `knowledge/visual-quality-rules.md`
- `config/visual-quality-rules.json`

Technische Zielwerte:

- 1080 × 1920 Pixel
- Seitenverhältnis 9:16
- Mindestauflösung 720 × 1280 Pixel
- wichtige Motive und Texte mindestens 6 % von den Seiten entfernt
- mindestens 8 % Abstand nach oben
- mindestens 18 % Abstand nach unten

Ablauf:

1. `npm run check:visuals -- --dir "<reel-ordner>"`
2. jedes Szenenbild und Cover tatsächlich ansehen
3. `review/visual-inspection.json` vollständig mit `true` oder `false` ausfüllen
4. Fehler konkret dokumentieren und `needs-fix` setzen
5. `npm run check:visuals -- --dir "<reel-ordner>" --strict`

## Unsortierte Nutzer-Assets

- Bilder nach `inbox/images/`
- Voice-over nach `inbox/audio/`
- Dateiname und Reihenfolge sind keine zuverlässigen Signale

Ablauf:

```bash
npm run organize:assets -- --dir "<reel-ordner>"
```

Danach betrachtet Codex jedes Bild und vergleicht es mit Sprechertext, `imageText`, `visualIdea`, Bildprompt, Figuren, Objekten, Metaphern und Komposition.

Codex schreibt `inbox/asset-map.json`.

Regeln:

- Ziele: `scene-01` bis letzte Szene, `cover`, `audio`
- jede Quelle und jedes Ziel höchstens einmal
- Cover nie automatisch als Hook-Bild behandeln
- jede Zuweisung benötigt `confidence` und `reason`
- unter 0,75 Konfidenz nicht raten; Datei bleibt `unmatched`

Danach:

```bash
npm run organize:assets -- --dir "<reel-ordner>" --apply
```

## Master-Timeline und Audio-Synchronisierung

Nach dem Asset-Import:

```bash
npm run build:timeline -- --dir "<reel-ordner>"
```

Wenn `ffprobe` fehlt:

```bash
npm run sync:audio -- --dir "<reel-ordner>" --audio-duration 48.7
```

Codex hört das Voice-over ab und trägt für jede Szene `cueTimeSeconds` und `confidence` ein. Danach:

```bash
npm run sync:audio -- --dir "<reel-ordner>" --strict
npm run sync:words -- --dir "<reel-ordner>"
```

Codex bearbeitet anschließend `production/codex-word-sync-task.md` und führt aus:

```bash
npm run sync:words -- --dir "<reel-ordner>" --apply --strict
```

Verbindliche Dateien:

- `timeline/audio-sync.json`
- `subtitles/codex-word-sync.json`
- `subtitles/subtitle-plan.json`
- `timeline/timeline-plan.json`
- `render/render-plan.json`
- `review/final-video-report.json`
- `review/word-sync-report.json`

Die Hook beginnt bei Frame 0. Die letzte Szene endet exakt mit dem Voice-over. Szenen und Untertitel dürfen keine unbeabsichtigten Lücken oder Überlappungen erzeugen.

## Zentrale Abschlussprüfung

```bash
npm run finalize:reel -- --dir "<reel-ordner>" --strict
```

Ein Reel darf nur gerendert werden, wenn:

- `readyForRenderer` auf `true` steht
- Stufe `wordSync` bestanden ist
- `render/render-plan.json` den Status `ready-for-renderer` besitzt
- Audio-Sync und visuelle Prüfung bestanden sind
- alle Bilder und das Voice-over vorhanden sind

## Remotion-Renderer

Vorprüfung:

```bash
npm run validate:render -- --dir "<reel-ordner>"
```

MP4 erzeugen:

```bash
npm run render:reel -- --dir "<reel-ordner>"
```

Der Renderer muss umsetzen:

- Szenenbilder
- Voice-over
- tiefe Untertitel bei 79,5 %
- exakt synchronisierte gelbe Wortmarkierung
- Zooms und Schwenks
- harte Schnitte und kurze Crossfades
- vorhandene Soundeffekt-Dateien

Der Renderer darf niemals Pfade außerhalb des Reel-Ordners laden. Fehlende Pflichtassets blockieren den Render.

## Neues Reel produzieren

1. Lies `CODEX_TASK.md`.
2. Erstelle den Reel-Ordner mit `npm run create:reel`.
3. Bearbeite `production/agent-task.md` vollständig.
4. Führe `check:content --strict` aus.
5. Nutzer erzeugt Bilder und Voice-over extern.
6. Ordne die Assets inhaltsbasiert zu.
7. Synchronisiere Timeline und Audio.
8. Bereite den Codex-Wort-Sync vor, höre das Audio ab und wende die bestätigten Zeiten an.
9. Führe die visuelle Prüfung aus.
10. Führe `finalize:reel --strict` aus.
11. Validiere den Renderer.
12. Rendere die MP4-Datei.

## Technische Regeln

- stabile IDs wie `scene-01`
- feste erwartete Dateinamen
- nie nur alphabetische Reihenfolge verwenden
- `scene-index.json` und jede `scene.json` synchron halten
- Rohscript nicht verändern; überarbeitete Versionen nach `final-script.txt` und `voice-script.txt`
- API-Schlüssel nie committen
- fehlende Assets in Status und Manifest sichtbar machen
- Pipeline-Stufen einzeln erneut ausführbar halten
- zentrale Logik mit Tests abdecken
- Remotion- und `@remotion/*`-Pakete immer auf exakt dieselbe Version setzen
- keine simulierte Integration als fertig bezeichnen

## Arbeitsweise

- kleine, nachvollziehbare Änderungen
- vorhandene Architektur prüfen, bevor neue parallele Strukturen entstehen
- README und relevante Dokumentation aktualisieren
- GitHub Actions müssen vor dem Merge erfolgreich sein
