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
2. 8–12 Bildmomente, abhängig von der tatsächlichen Audiolänge
3. eine begründete Stilentscheidung für das gesamte Reel
4. englische Bildprompts
5. Cover-Prompt und Cover-Plan
6. einen Untertitelplan
7. einen Plan für Zooms, Kamerabewegungen, Übergänge und Soundeffekte
8. Caption
9. Quellenliste
10. Qualitäts- und Bereitschaftsberichte
11. eine Inbox für extern erzeugte Bilder und Audio
12. eine automatische, inhaltsbasierte Zuordnung der unsortierten Assets

Der Nutzer erzeugt Audio und Bilder außerhalb des Repositories. Version 1 plant Schnitt, Bewegung und Sound, erzeugt aber noch kein fertiges Video und veröffentlicht nichts automatisch.

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
- Das erste Hook-Bild muss ab Sekunde 0 sichtbar sein. Kein schwarzer Start, kein leerer Aufbau und keine unnötige Einblendeverzögerung.
- Plane für 35–44 Sekunden normalerweise 8–10 visuelle Momente.
- Plane für 45–55 Sekunden normalerweise 10–12 visuelle Momente.
- Erzeuge ungefähr alle 3,5–5 Sekunden einen Bildwechsel oder eine deutlich sichtbare Ergänzung.
- Ein leicht verständliches Bild darf kürzer stehen als ein komplexes Bild. Verwende keine starre Dauer für alle Szenen.
- Richte jeden Bildwechsel am Sprechertext aus. Jede Szene benötigt ein eindeutiges `audioCue`: das Wort oder die kurze Phrase, an der das Bild inhaltlich beginnt.
- Das neue Bild soll normalerweise 0,1–0,3 Sekunden vor dem zugehörigen `audioCue` erscheinen.
- Halte den Zeichenstil innerhalb eines Reels konsistent.
- Erlaube zwischen Reels unterschiedliche Bildwelten.
- Erzwinge keine Build-up-Sequenz, wenn einzelne Metaphern besser funktionieren.
- Integriere kurze deutsche Schlüsselwörter dort, wo sie die Bildaussage verbessern.
- Politische Themen werden neutral erklärt und nicht als Meinungswerbung formuliert.

## Untertitelregeln

- Untertitel sind standardmäßig vorgesehen, werden aber getrennt von den Bildern geplant.
- Position: untere Mitte, ungefähr bei 65–75 % der Bildhöhe; nicht exakt in der Bildschirmmitte und nicht ganz unten im Bereich der Plattform-Bedienelemente.
- Pro Untertitel-Einblendung normalerweise 3–6 Wörter und höchstens zwei Zeilen.
- Verwende kurze Sinnabschnitte statt Wort-für-Wort-Karaoke.
- Untertitel müssen zum tatsächlichen Voice-over passen und später an der Audiospur fein synchronisiert werden.
- Wiederhole keinen integrierten Bildtext wortgleich als Untertitel.
- Wenn wichtiger Bildtext oder ein zentrales Motiv im unteren Bereich liegt, verschiebe den Untertitel innerhalb der sicheren Zone.
- Untertitel gehören in `subtitles/subtitle-plan.json`, nicht in die Bildprompts.

## Bewegungs-, Übergangs- und Soundregeln

- Lies zusätzlich `knowledge/effects-rules.md` und `config/effects-rules.json`.
- Plane alle Effekte getrennt in `effects/effects-plan.json`; sie gehören nicht in die Bildprompts.
- Nicht jedes Bild braucht Bewegung. Ohne klaren Nutzen bleibt `cameraMotion.type` auf `none`.
- Dezente Zooms verändern die Bildgröße normalerweise um 2–6 Prozent und niemals um mehr als 8 Prozent.
- Kleine Schwenks bewegen das Bild höchstens um 4 Prozent der Bildbreite oder Bildhöhe.
- Die Hook darf einen dezenten Push-in erhalten, beginnt aber ohne Übergang ab Sekunde 0.
- Standardübergang ist ein sauberer Schnitt. Crossfades von 0,1–0,25 Sekunden nur bei sinnvoller weicher Verbindung.
- Keine Glitch-, Spin-, Flash- oder übertriebenen 3D-Übergänge.
- Das Voice-over hat immer Vorrang. Hintergrundmusik ist standardmäßig ausgeschaltet.
- Pro Szene normalerweise null bis zwei dezente Soundeffekte.
- Soundeffekte nur an einem konkreten `audioCue` oder visuellen Ereignis einsetzen; nicht jeden Schnitt mit einem Whoosh versehen.
- Keine Meme-Sounds, Jumpscares oder urheberrechtlich ungeklärte Musik.
- Bewegung darf Bildtext, Motive und Untertitel nie aus der sicheren Zone schieben.
- Nach Einfügen der echten Audiodatei müssen Effektzeitpunkte noch einmal überprüft werden.

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
- Fülle `reel.json`, alle `scene.json`-Dateien, alle `image-prompt.txt`-Dateien, `subtitles/subtitle-plan.json`, `effects/effects-plan.json`, Cover, Caption und Quellen aus.
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
- Sobald die echte Audiodatei vorliegt, prüft Codex Bildwechsel, Untertitel, Zooms, Übergänge und Soundeffekte gegen die Audiospur und korrigiert erkennbare Abweichungen.

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
- Jede Szene benötigt außerdem `audioCue`, `leadInSeconds` und passende `subtitleCues`.
- `leadInSeconds` liegt normalerweise zwischen 0,1 und 0,3 Sekunden.
- `effects/effects-plan.json` benötigt genau einen Eintrag pro Szene mit `transitionIn`, `cameraMotion` und `soundEffects`.
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
