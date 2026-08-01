# AGENTS.md

## Pflichttrigger: „Mach ein neues Reel“

Wenn der Nutzer sinngemäß schreibt:

- „Mach ein neues Reel.“
- „Erstelle das nächste Reel.“
- „Weiter mit dem nächsten Reel.“
- „Produziere ein neues Video.“

bedeutet das immer: **Codex soll selbstständig den nächsten freien Produktionstag wählen und das vollständige interne Produktionspaket erstellen.**

Codex darf dann nicht nur einen Ordner anlegen, nicht nur einen Plan schreiben und nicht nach Datum, Thema oder Titel fragen.

Verbindlicher Ablauf:

1. Lies `docs/autonomous-reel.md` und `CODEX_TASK.md`.
2. Führe `npm run next:slot -- --json` aus.
3. Prüfe vorhandene Reel-Titel und Themen, damit keine Wiederholung entsteht.
4. Wähle selbstständig ein passendes langfristiges Thema aus den erlaubten Themenbereichen.
5. Schreibe selbstständig ein vollständiges deutsches Voice-over-Script mit genau einem Erzähler.
6. Erstelle den Reel-Ordner mit `npm run create:reel -- --next-free`.
7. Bearbeite `production/agent-task.md` sofort vollständig.
8. Erzeuge Script, Szenen, Bildprompts, Untertitelplan, Effektplan, Cover, Caption und Quellen.
9. Führe `validate:reel` und `check:content --strict` aus und behebe alle Fehler.
10. Halte erst an, wenn externe Bilder oder das Voice-over fehlen.
11. Sind externe Assets bereits vorhanden, arbeite ohne Rückfrage bis zur fertigen MP4 weiter.

Ein bloßer Satz wie „Reel-Ordner erstellt“ ist keine vollständige Ausführung.

## Projektauftrag

Dieses Repository produziert vollständige visuelle Erklär-Reels. Der Nutzer erzeugt Voice-over und Szenenbilder normalerweise außerhalb des Repositories. Codex übernimmt Planung, Qualitätsprüfung, Zuordnung, lokale Audio-Prüfung, Synchronisierung und den abschließenden Remotion-Render.

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

## Vollständiges Produktionspaket

Vor dem externen Asset-Schritt müssen vorhanden und ausgefüllt sein:

1. geprüftes deutsches Voice-over-Script
2. 8–12 Bildmomente passend zur erwarteten Audiolänge
3. eine konsistente Bildwelt innerhalb des Reels
4. vollständige englische Bildprompts
5. Untertitelplan
6. Effektplan für Zooms, Schwenks, Übergänge und Soundeffekte
7. Cover-Idee und Cover-Prompt
8. Caption
9. Quellen und Unsicherheiten
10. bestandene strenge Inhaltsprüfung

Nach Eingang der externen Assets kommen hinzu:

- inhaltsbasierte Asset-Zuordnung
- Master-Timeline und Audio-Synchronisierung
- durch Codex akustisch bestätigte Wortzeiten
- renderer-neutraler Render-Plan
- technische und visuelle Qualitätsprüfung
- fertige MP4-Datei über Remotion

## Termin- und Ordnerlogik

Für ein neues autonomes Reel wird niemals ein Datum geraten oder manuell aus dem Gedächtnis gewählt.

```bash
npm run next:slot -- --json
```

Regeln:

- neuesten vorhandenen Wochenordner verwenden
- darin Montag bis Sonntag chronologisch prüfen
- ersten Tag ohne `reel-*`-Ordner auswählen
- wenn die Woche voll ist, nächsten Montag auswählen
- belegte Tage niemals überschreiben
- `create:reel` mit `--next-free` ausführen

## Kreativregeln

- schwierige Inhalte einfach, direkt und visuell erklären
- keine schulische Einleitung
- mit klarer Frage, Widerspruch oder überraschender Beobachtung starten
- Hook-Bild ab Sekunde 0 vollständig sichtbar
- kein schwarzer Start
- 35–44 Sekunden: normalerweise 8–10 Bildmomente
- 45–55 Sekunden: normalerweise 10–12 Bildmomente
- ungefähr alle 3,5–5 Sekunden sichtbare Veränderung
- einfache Bilder dürfen kürzer stehen als komplexe Bilder
- keine mechanisch gleich langen Szenen
- innerhalb eines Reels konsistente Bildwelt
- zwischen Reels darf der Stil wechseln
- Build-up nur bei echter schrittweiser Erklärung

## Audio-Cues und Bildwechsel

Jede Szene benötigt:

- `audioCue`
- `leadInSeconds`, normalerweise 0,1–0,3 Sekunden
- `durationSeconds`

Das neue Bild beginnt normalerweise 0,1–0,3 Sekunden vor dem zugehörigen gesprochenen Cue. Unsichere Zeiten dürfen nicht erfunden werden.

## Untertitel

- standardmäßig aktiv
- Planung in `subtitles/subtitle-plan.json`
- Position `safe-lower-middle`
- Standardhöhe 79,5 %
- erlaubter Bereich 76,5–80,5 %
- normalerweise 3–6 Wörter
- höchstens zwei Zeilen
- aktuell gesprochenes Wort gelb mit `#FFD84D`
- gelbe Markierung nur mit akustisch bestätigten Wortzeiten
- ohne gültige Wortzeiten bleibt der Cue vollständig weiß
- keine gleichmäßige oder gewichtete Wortzeitschätzung

## Codex-Wortzeiten

Nach bestandener Szenen-Audio-Synchronisierung:

```bash
npm run sync:words -- --dir "<reel-ordner>"
```

Codex hört das lokale Voice-over vollständig ab und füllt `subtitles/codex-word-sync.json` mit:

- `startSeconds`
- `endSeconds`
- realistischer `confidence`
- `reviewed: true` erst nach akustischer Kontrolle

Danach:

```bash
npm run sync:words -- --dir "<reel-ordner>" --apply --strict
```

Pflicht:

- kein externer Transkriptionsdienst
- kein Audio-Upload
- mindestens 98 % Wortabdeckung
- im strengen Lauf mindestens 0,85 Konfidenz pro Wort
- jede Szene besitzt bestätigte Wörter
- nach neuer Audiodatei oder `trim:pauses` erneut ausführen

Details: `docs/codex-word-sync.md`.

## Zooms, Übergänge und Sounds

- nicht jedes Bild bewegen
- Zoom normalerweise 2–6 %, maximal 8 %
- Schwenk maximal 4 %
- Hook ohne Übergang
- `cut` als Standard
- Crossfade nur 0,1–0,25 Sekunden und nur begründet
- keine Glitch-, Spin- oder Flash-Übergänge
- Voice-over hat Vorrang
- Hintergrundmusik standardmäßig aus
- normalerweise null bis zwei dezente Soundeffekte pro Szene
- Soundeffekte benötigen einen tatsächlichen lokalen `file`-Pfad

## Externe Assets

Bilder nach:

```text
inbox/images/
```

Voice-over nach:

```text
inbox/audio/
```

Codex ordnet nicht nur nach Dateinamen oder alphabetischer Reihenfolge zu. Jedes Bild wird tatsächlich betrachtet und mit Sprechertext, Bildtext, Prompt, Motiv, Metapher und Komposition verglichen.

Unter 0,75 Konfidenz wird nicht geraten.

## Visuelle Qualitätsprüfung

Zielwerte:

- 1080 × 1920
- 9:16
- mindestens 720 × 1280
- wichtige Motive und Texte mindestens 6 % von den Seiten entfernt
- mindestens 8 % Abstand nach oben
- mindestens 18 % Abstand nach unten

Ablauf:

```bash
npm run check:visuals -- --dir "<reel-ordner>"
npm run check:visuals -- --dir "<reel-ordner>" --strict
```

Jedes Bild und das Cover müssen tatsächlich visuell geprüft werden.

## Timeline, Abschluss und Renderer

Nach dem Asset-Import:

```bash
npm run build:timeline -- --dir "<reel-ordner>"
npm run sync:audio -- --dir "<reel-ordner>" --strict
npm run sync:words -- --dir "<reel-ordner>"
npm run sync:words -- --dir "<reel-ordner>" --apply --strict
npm run finalize:reel -- --dir "<reel-ordner>" --strict
npm run validate:render -- --dir "<reel-ordner>"
npm run render:reel -- --dir "<reel-ordner>"
```

Ein Reel darf nur gerendert werden, wenn:

- `readyForRenderer` auf `true` steht
- Audio-Sync bestanden ist
- Codex-Wortzeiten bestanden sind
- visuelle Prüfung bestanden ist
- alle Pflichtassets vorhanden sind

## Erlaubter Haltepunkt

Bei „Mach ein neues Reel“ darf Codex erst stoppen, wenn das komplette interne Produktionspaket fertig und streng geprüft ist und nur noch externe Dateien fehlen.

Dann nennt Codex:

- automatisch gewählten Tag
- Reel-Ordner
- Anzahl der Bildprompts
- gewählte Bildwelt
- benötigte externe Dateien
- Inbox-Pfade

Sind die Dateien schon vorhanden, gibt es keinen Haltepunkt vor dem fertigen Render.

## Technische Regeln

- stabile IDs wie `scene-01`
- `scene-index.json` und jede `scene.json` synchron halten
- Rohscript nicht überschreiben; finale Fassungen getrennt speichern
- API-Schlüssel niemals committen
- fehlende Assets sichtbar im Status halten
- Pipeline-Stufen einzeln erneut ausführbar halten
- zentrale Logik testen
- Remotion-Pakete immer auf exakt derselben Version halten
- keine geplante oder simulierte Stufe als abgeschlossen bezeichnen

## Arbeitsweise

- kleine nachvollziehbare Änderungen
- vorhandene Architektur zuerst prüfen
- relevante Dokumentation aktualisieren
- Tests ausführen
- bei fehlenden oder nicht startenden GitHub-Actions-Logs den Zustand ehrlich dokumentieren
