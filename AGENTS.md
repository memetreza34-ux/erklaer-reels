# AGENTS.md

## Projektauftrag

Baue und betreibe einen KI-Workflow, der aus einem Thema oder einem fertigen deutschen Sprechertext einen vollständigen Produktionsordner für ein visuelles Erklär-Reel erstellt.

## Sprache

- Benutzeroberfläche, Scripts und sichtbare Bildtexte: Deutsch
- Bildprompts: Englisch
- Code, Dateinamen und IDs: Englisch oder technisch eindeutiges Deutsch

## Version 1

Version 1 erzeugt im Repository:

1. geprüftes Voice-over-Script
2. 8–10 Bildmomente
3. eine begründete Stilentscheidung für das gesamte Reel
4. englische Bildprompts
5. Cover-Prompt und Cover-Plan
6. Caption
7. Quellenliste
8. Qualitäts- und Bereitschaftsberichte
9. eine Inbox für extern erzeugte Bilder und Audio
10. eine automatische, inhaltsbasierte Zuordnung der unsortierten Assets

Der Nutzer erzeugt Audio und Bilder außerhalb des Repositories. Version 1 erzeugt noch kein fertiges Video und veröffentlicht nichts automatisch.

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

## Kreativregeln

- Erkläre Dinge einfach, direkt und visuell.
- Schreibe keine schulische Einleitung.
- Beginne mit einer verständlichen Frage, einem Widerspruch oder einer überraschenden Beobachtung.
- Plane normalerweise 8–10 Bilder für 35–55 Sekunden.
- Erzeuge ungefähr alle 4–6 Sekunden eine sichtbare Veränderung.
- Halte den Zeichenstil innerhalb eines Reels konsistent.
- Erlaube zwischen Reels unterschiedliche Bildwelten.
- Erzwinge keine Build-up-Sequenz, wenn einzelne Metaphern besser funktionieren.
- Integriere kurze deutsche Schlüsselwörter dort, wo sie die Bildaussage verbessern.
- Verwende keine klassischen Untertitel als Pflichtbestandteil.
- Politische Themen werden neutral erklärt und nicht als Meinungswerbung formuliert.

## Bevorzugte Bildwelten

1. menschliche 2D-Cartoonfiguren für Psychologie und Gesellschaft
2. runde Länderfiguren für Politik, Geschichte und Geografie
3. starke visuelle Metaphern für abstrakte Begriffe und Hooks
4. personifizierte Organe und Zellen für Körper und Biologie
5. Vergleichspanels für klare Gegenüberstellungen
6. Build-up-Sequenzen nur für echte schrittweise Entwicklungen

## Neues Reel produzieren

- Lies zuerst `CODEX_TASK.md`.
- Erstelle den Reel-Ordner mit `npm run create:reel`.
- Der Befehl erzeugt automatisch `production/agent-task.md`.
- Arbeite diesen reel-spezifischen Auftrag vollständig ab.
- Fülle `reel.json`, alle `scene.json`-Dateien, alle `image-prompt.txt`-Dateien, Cover, Caption und Quellen aus.
- Führe danach `npm run check:content -- --dir "<reel-ordner>" --strict` aus.
- Ein Inhaltspaket darf erst als fertig bezeichnet werden, wenn die strenge Prüfung keine Fehler mehr meldet.

## Unsortierte Nutzer-Assets

Der Nutzer erzeugt Audio und Bilder außerhalb dieses Repositories und legt sie anschließend unsortiert in den Reel-Ordner.

- Bilder kommen nach `inbox/images/`.
- Audio kommt nach `inbox/audio/`.
- Dateinamen und Ablagereihenfolge sind keine zuverlässigen Zuordnungssignale.
- Der Agent muss zuerst `npm run organize:assets -- --dir "<reel-ordner>"` ausführen.
- Danach muss der Agent alle Bilder visuell prüfen und mit `scene-index.json`, jeder `scene.json`, dem Sprechertext und den Bildprompts vergleichen.
- Sichtbarer deutscher Schlüsseltext, dargestellte Figuren, Objekte, Metaphern und Komposition sind die wichtigsten Signale.
- Der Agent schreibt die Zuordnung in `inbox/asset-map.json`.
- Erlaubte Ziele sind `scene-01` bis zur letzten Szene, `cover` und `audio`.
- Jede Quelle und jedes Ziel darf nur einmal zugewiesen werden.
- Das Cover ist ein eigenes Asset und darf nicht automatisch als Hook-Bild behandelt werden.
- Jede Zuweisung benötigt `confidence` zwischen 0 und 1 sowie eine kurze `reason`.
- Unter 0.75 Konfidenz darf nicht geraten werden; die Datei bleibt in `unmatched`.
- Nach der Zuordnung führt der Agent `npm run organize:assets -- --dir "<reel-ordner>" --apply` aus.
- Das Anwenden kopiert die Dateien in die richtigen Szenenordner, benennt sie stabil um und aktualisiert Manifest, Status und Szenendaten.

Beispiel für `inbox/asset-map.json`:

```json
{
  "version": 1,
  "generatedBy": "codex-vision",
  "assignments": [
    {
      "source": "images/IMG_8241.png",
      "target": "scene-03",
      "confidence": 0.96,
      "reason": "Das Bild zeigt die Plattformen und den Text MEHR GLEICHHEIT."
    },
    {
      "source": "images/final-cover.jpg",
      "target": "cover",
      "confidence": 0.93,
      "reason": "Große Titelkomposition im Thumbnail-Stil."
    },
    {
      "source": "audio/voice-final.mp3",
      "target": "audio",
      "confidence": 1,
      "reason": "Einzige Audiodatei im Audio-Inbox-Ordner."
    }
  ],
  "unmatched": []
}
```

## Technische Regeln

- Nutze stabile IDs wie `scene-01` und feste erwartete Dateinamen.
- Verlasse dich nie nur auf die alphabetische Dateireihenfolge.
- Jede Szene benötigt `scene.json`, `image-prompt.txt` und einen erwarteten Bildpfad.
- API-Schlüssel dürfen nie in das Repository geschrieben werden.
- Fehlende Assets müssen im Status und Manifest erkennbar sein.
- Jede Pipeline-Stufe muss einzeln erneut ausführbar sein.
- Schreibe denselben Szenenstand in `scene-index.json` und in die jeweilige `scene.json`.
- Verändere das Rohscript nicht; überarbeitete Fassungen gehören nach `final-script.txt` und `voice-script.txt`.

## Arbeitsweise

- Ändere kleine, nachvollziehbare Einheiten.
- Prüfe vorhandene Dateien, bevor du Architektur duplizierst.
- Aktualisiere README und Roadmap bei wichtigen Änderungen.
- Füge für zentrale Logik Tests hinzu.
- Markiere Platzhalter klar und behaupte nicht, eine echte Provider-Integration sei fertig, solange sie nur simuliert wird.
