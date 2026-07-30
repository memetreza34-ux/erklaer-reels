# AGENTS.md

## Projektauftrag

Baue einen KI-Agenten, der aus einem Thema oder einem fertigen deutschen Sprechertext einen vollständigen Produktionsordner für ein visuelles Erklär-Reel erstellt.

## Sprache

- Benutzeroberfläche, Scripts und sichtbare Bildtexte: Deutsch
- Bildprompts: Englisch
- Code, Dateinamen und IDs: Englisch oder technisch eindeutiges Deutsch

## Version 1

Version 1 erzeugt:

1. geprüftes Voice-over-Script
2. 8–10 Bildmomente
3. eine begründete Stilentscheidung für das gesamte Reel
4. englische Bildprompts
5. deutsches Audio
6. Szenenbilder
7. Cover und Cover-Prompt
8. Caption
9. Quellenliste
10. Qualitätsbericht

Version 1 erzeugt noch kein fertiges Video und veröffentlicht nichts automatisch.

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
- Beginne mit einer klaren Frage, einem Widerspruch oder einer überraschenden Beobachtung.
- Plane normalerweise 8–10 Bilder für 35–55 Sekunden.
- Erzeuge ungefähr alle 4–6 Sekunden eine sichtbare Veränderung.
- Halte den Zeichenstil innerhalb eines Reels konsistent.
- Erlaube zwischen Reels unterschiedliche Bildwelten.
- Erzwinge keine Build-up-Sequenz, wenn einzelne Metaphern besser funktionieren.
- Integriere kurze deutsche Schlüsselwörter dort, wo sie die Bildaussage verbessern.
- Verwende keine klassischen Untertitel als Pflichtbestandteil.

## Bevorzugte Bildwelten

1. menschliche 2D-Cartoonfiguren für Psychologie und Gesellschaft
2. runde Länderfiguren für Politik, Geschichte und Geografie
3. starke visuelle Metaphern für abstrakte Begriffe und Hooks
4. personifizierte Organe und Zellen für Körper und Biologie
5. Vergleichspanels für klare Gegenüberstellungen
6. Build-up-Sequenzen nur für echte schrittweise Entwicklungen

## Technische Regeln

- Nutze stabile IDs wie `scene-01` und feste erwartete Dateinamen.
- Verlasse dich nie nur auf die alphabetische Dateireihenfolge.
- Jede Szene benötigt `scene.json`, `image-prompt.txt` und einen erwarteten Bildpfad.
- Provider für Text, Audio und Bilder müssen austauschbar bleiben.
- API-Schlüssel dürfen nie in das Repository geschrieben werden.
- Fehlende Assets müssen im Status und Manifest erkennbar sein.
- Jede Pipeline-Stufe muss einzeln erneut ausführbar sein.

## Arbeitsweise

- Ändere kleine, nachvollziehbare Einheiten.
- Prüfe vorhandene Dateien, bevor du Architektur duplizierst.
- Aktualisiere README und Roadmap bei wichtigen Änderungen.
- Füge für zentrale Logik Tests hinzu.
- Markiere Platzhalter klar und behaupte nicht, eine echte Provider-Integration sei fertig, solange sie nur simuliert wird.
