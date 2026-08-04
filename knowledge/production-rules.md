# Produktionsregeln

## Ziel

Jedes Reel soll einen Begriff, ein System oder einen Zusammenhang so einfach erklären, dass der Zuschauer ihn ohne Vorwissen versteht.

## Script

- ein durchgehender deutscher Erzähler
- direkte, verständliche Hook ohne lange Einleitung
- Thema möglichst sofort nennen und direkt mit der Erklärung beginnen
- einfache Wörter und kurze Sätze
- ungefähr 35–55 Sekunden
- keine Dialogrollen
- politische Inhalte neutral und ohne Parteienwerbung
- Unsicherheit und umstrittene Aussagen klar kennzeichnen

## Bilder und Timing

- Das Hook-Bild ist ab Sekunde 0 vollständig sichtbar.
- Für 35–44 Sekunden normalerweise 8–10 visuelle Momente.
- Für 45–55 Sekunden normalerweise 10–12 visuelle Momente.
- Sichtbare Veränderung ungefähr alle 3,5–5 Sekunden.
- Einfache Bilder dürfen kürzer stehen; komplexere Bilder dürfen etwas länger stehen.
- Bilder dürfen neu sein oder sinnvoll aufeinander aufbauen.
- Nicht künstlich jede Szene als Build-up erzwingen.
- Pro Reel eine zusammenhängende Bildwelt.
- Zwischen Reels dürfen die Bildwelten stark wechseln.
- Englische Bildprompts, sichtbare Schlüsselwörter im Bild auf Deutsch.
- Text kann oben, unten, seitlich, diagonal oder auf einem Objekt stehen.
- Jeder Bildmoment erhält ein `audioCue`: das Wort oder die Phrase, zu der er gehört.
- Ein neues Bild erscheint normalerweise 0,1–0,3 Sekunden vor seinem `audioCue`.
- Bildwechsel werden nach Sinnabschnitten geplant und nicht nach starren, identischen Zeitblöcken.

## Untertitel

- Untertitel sind standardmäßig vorgesehen und werden getrennt von den Bildern geplant.
- Zentrale Quelle ist `src/shared/subtitle-style.js`.
- Position: `center`.
- Vertikale Position: exakt 50 % der Bildhöhe.
- Der erlaubte Bereich ist ebenfalls exakt 50–50 %; abweichende Werte werden nicht akzeptiert.
- Normalerweise 3–6 Wörter pro Einblendung, höchstens zwei Zeilen.
- Kurze Sinnabschnitte statt Wort-für-Wort-Karaoke.
- Integrierten Bildtext nicht wortgleich als Untertitel wiederholen.
- Hauptmotive und wichtige Bildtexte müssen bereits bei der Bildplanung so angeordnet werden, dass die feste mittige Untertitelbox frei bleibt.
- Die Untertitelposition darf wegen visueller Kollisionen nicht verschoben werden; stattdessen muss das Bildmotiv angepasst werden.
- Die Untertitelplanung wird in `subtitles/subtitle-plan.json` gespeichert.
- Nach Einfügen der echten Audiodatei werden Timing und Bildwechsel noch einmal gegen die Audiospur geprüft.

## Bewegung, Übergänge und Sound

- Die Planung wird in `effects/effects-plan.json` gespeichert und bleibt von den Bildprompts getrennt.
- Nicht jede Szene benötigt Bewegung.
- Dezente Zooms verändern die Bildgröße normalerweise um 2–6 Prozent und höchstens um 8 Prozent.
- Kleine Schwenks bewegen das Bild höchstens 4 Prozent der Bildbreite oder Bildhöhe.
- Der Hook darf einen dezenten Push-in erhalten, startet aber ohne Einblendung ab Sekunde 0.
- Die Hook verwendet `none` mit Dauer 0.
- Danach sind ausschließlich direkte harte Schnitte mit `cut` und Dauer 0 erlaubt.
- Keine Crossfades, Schwarzblenden, Slides, Glitch-, Spin-, Flash- oder aufdringlichen 3D-Übergänge.
- Kein schwarzes Zwischenbild.
- Das Voice-over hat immer Vorrang.
- Hintergrundmusik ist standardmäßig ausgeschaltet.
- Pro Szene normalerweise null bis zwei dezente Soundeffekte.
- Soundeffekte nur an konkreten visuellen Ereignissen oder `audioCue`-Punkten verwenden.
- Nicht jeden Bildwechsel mit einem Whoosh versehen.
- Keine Meme-Sounds, Jumpscares oder ungeklärte urheberrechtlich geschützte Musik.
- Bewegung und Effekte dürfen Bildtext, Hauptmotiv oder Untertitel nicht verdecken.
- Nach Einfügen des echten Voice-overs werden alle Effektzeitpunkte noch einmal geprüft.

## Stärkste Bildwelten

1. Menschliche Cartoonfiguren für Psychologie und Gesellschaft
2. Runde Länderfiguren für Politik, Länder, Geschichte und Geografie
3. Starke visuelle Metaphern für abstrakte Begriffe und Hooks

Vergleichspanels oder Build-up-Sequenzen werden nur eingesetzt, wenn sie das Thema besser erklären.

## Qualitätskontrolle

Vor der Freigabe prüfen:

- Ist das Hook-Bild sofort sichtbar?
- Erklärt jedes Bild genau den zugehörigen Satz?
- Stimmt jeder Bildwechsel mit seinem `audioCue` überein?
- Ist sofort erkennbar, was neu oder wichtig ist?
- Bleiben Figuren, Konturen und Proportionen innerhalb des Reels konsistent?
- Enthält das Bild nur sinnvollen Text?
- Gibt es genug Bildwechsel, ohne hektisch zu wirken?
- Stehen alle Untertitel exakt bei 50 % der Bildhöhe?
- Bleibt die feste mittige Untertitelzone frei von unverzichtbaren Motiven und Bildtexten?
- Wiederholen Untertitel nicht unnötig den Text im Bild?
- Sind Zooms und Schwenks dezent und begründet?
- Bleiben Texte und Motive während der Bewegung in der sicheren Zone?
- Sind Soundeffekte sparsam und leiser als das Voice-over?
- Werden ausschließlich direkte harte Schnitte verwendet?
- Ist der Cover-Titel auf kleiner Ansicht lesbar?
