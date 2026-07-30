# Produktionsregeln

## Ziel

Jedes Reel soll einen Begriff, ein System oder einen Zusammenhang so einfach erklären, dass der Zuschauer ihn ohne Vorwissen versteht.

## Script

- ein durchgehender deutscher Erzähler
- direkte Hook ohne lange Einleitung
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
- Position: untere Mitte bei ungefähr 65–75 % der Bildhöhe.
- Nicht exakt mittig und nicht ganz unten im Bereich der Social-Media-Bedienelemente.
- Normalerweise 3–6 Wörter pro Einblendung, höchstens zwei Zeilen.
- Kurze Sinnabschnitte statt Wort-für-Wort-Karaoke.
- Integrierten Bildtext nicht wortgleich als Untertitel wiederholen.
- Bei einer Kollision mit Bildtext oder Hauptmotiv darf die Position innerhalb der sicheren Zone angepasst werden.
- Die Untertitelplanung wird in `subtitles/subtitle-plan.json` gespeichert.
- Nach Einfügen der echten Audiodatei werden Timing und Bildwechsel noch einmal gegen die Audiospur geprüft.

## Stärkste Bildwelten

1. Menschliche Cartoonfiguren für Psychologie und Gesellschaft
2. Runde Länderfiguren für Politik, Länder, Geschichte und Geografie
3. Starke visuelle Metaphern für abstrakte Begriffe und Hooks

Weitere Bildwelten wie Organe, Vergleichspanels oder Build-up-Sequenzen werden nur eingesetzt, wenn sie das Thema besser erklären.

## Qualitätskontrolle

Vor der Freigabe prüfen:

- Ist das Hook-Bild sofort sichtbar?
- Erklärt jedes Bild genau den zugehörigen Satz?
- Stimmt jeder Bildwechsel mit seinem `audioCue` überein?
- Ist sofort erkennbar, was neu oder wichtig ist?
- Bleiben Figuren, Konturen und Proportionen innerhalb des Reels konsistent?
- Enthält das Bild nur sinnvollen Text?
- Gibt es genug Bildwechsel, ohne hektisch zu wirken?
- Verdecken Untertitel weder Bildtext noch Hauptmotiv?
- Wiederholen Untertitel nicht unnötig den Text im Bild?
- Ist der Cover-Titel auf kleiner Ansicht lesbar?
