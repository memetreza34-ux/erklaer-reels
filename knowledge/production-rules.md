# Produktionsregeln

## Ziel

Jedes Reel erklärt einen Begriff, ein System oder einen Zusammenhang so einfach, dass Zuschauer ihn ohne Vorwissen verstehen.

## Script

- ein durchgehender deutscher Erzähler
- direkte Hook ohne lange Einleitung
- 155–175 Wörter
- 55–60 Sekunden Voice-over nach Optimierung auf exakt 1,10x
- einfache, erwachsene und neutrale Sprache
- keine Dialogrollen
- politische Inhalte neutral und ohne Parteienwerbung
- Unsicherheit klar kennzeichnen

## Bildwelt erst nach dem Script wählen

Zuerst das vollständige Voice-over schreiben. Danach die Welt auswählen, die den Inhalt am schnellsten erklärt:

- runde Länder- oder Kugelfiguren für Länder, Politik, Geschichte und passende Symbolthemen
- menschliche Editorial-Figuren für Psychologie, Gesellschaft und Verhalten
- Objekt- oder Metapherwelt für abstrakte Mechanismen
- isometrische Mini-Szenen für Abläufe und mehrere klar verbundene Teilbereiche
- ernstere Symbolwelt für schwere historische oder emotionale Themen

Ein Reel bleibt anschließend konsequent in einer Hauptwelt.

Bei der Kugelwelt bestehen Figuren vollständig aus runden Kugelkörpern mit weißen Augen und höchstens kleinen Armen und Beinen. Reine Karten, Landschaften und Objekte dürfen vorkommen, müssen aber dieselben Konturen, Farben und dieselbe Bildsprache behalten.

## Starkes Ende

Die letzten zwei Szenen müssen eine echte Auflösung bilden:

1. persönliche Prüf-, Erkenntnis- oder Entscheidungsfrage
2. konkrete Lösung und kurzer einprägsamer Abschlusssatz

Nach dem letzten gesprochenen Wort bleibt das Schlussbild 0,7 Sekunden ohne neuen Untertitel stehen. Verboten sind ein abruptes Ende, eine schulische Zusammenfassung und ein einziges überladenes Bild mit mehreren Handlungsschritten.

## Szenenrhythmus

Zentrale Quelle: `config/production-quality-gates.json`.

- Hook-Bild ab Sekunde 0
- 12–14 visuelle Momente, Standard 13
- Hook 4,2–5,5 Sekunden
- normale Szenen 3,2–5,5 Sekunden
- letzte Szene inklusive Schlussbild-Nachlauf 4,0–6,5 Sekunden
- kein Erklärmoment unter 3,2 Sekunden
- Dauersprung zwischen Nachbarszenen höchstens 2,5 Sekunden
- Bildwechsel 0,1–0,3 Sekunden vor dem zugehörigen Audio-Cue
- Untertitel enden mit dem Voice-over und nicht erst nach dem Nachlauf
- jede Szene zeigt genau einen klaren Moment
- keine mehrfach dargestellte Hauptperson innerhalb eines Bildes

## Deutscher Text im Bild

Wo es zur Szene passt, wird kurzer deutscher Text direkt in das Bild integriert.

- Zielbereich ungefähr 55–85 % der Szenen
- normalerweise 1–5 Wörter; ein einzelnes Wort reicht
- klein, mittel oder groß je nach Szene
- geeignete Formen: Überschrift, Schild, Etikett, Karte, Dokument, Display, Gegenstandsbeschriftung oder Schlussaussage
- `imageText` enthält den exakten deutschen Wortlaut
- der englische Prompt fordert genau diesen Wortlaut in Anführungszeichen an
- Bildtext darf den Untertitel nicht wortgleich wiederholen
- kein englischer sichtbarer Text und keine erfundene Schrift
- Text nicht erzwingen, wenn das Motiv ohne Text klarer ist

## Natürliche Komposition

- Hauptmotive dürfen die exakte Bildmitte normal nutzen und hinter Untertiteln liegen.
- Untertitel sind ein Overlay; das Bild wird dafür nicht künstlich freigeräumt.
- Keine leere horizontale Untertitelzone, kein Mittelstreifen und keine getrennten Bildhälften.
- Keine gestapelten Panels, leeren Bäume, Pfeile oder großen Textplatzhalter.
- Die Illustration muss auch ohne Untertitel vollständig und natürlich wirken.

## Sichere Bildzuordnung

Bilder niemals nach Dateiname, laufender Nummer, Upload-Reihenfolge, Erstellungszeit oder Finder-Position zuordnen.

### Erster Durchgang

- Bild tatsächlich öffnen
- sichtbaren Inhalt neutral in `visibleSummary` beschreiben
- mit `narration`, `audioCue`, `visualIdea`, `imageText` und `imagePrompt` vergleichen
- konkrete `reason` mit sichtbaren Objekten und Handlungen schreiben

### Zweiter Durchgang

- gewählte Szene gegen vorherige und nächste Szene prüfen
- ausschließen, dass das Bild besser zu einer Nachbarszene passt
- `confirmedTarget` und `confirmedSceneOrder` exakt eintragen
- erst danach `sceneOrderConfirmed` und `secondPassConfirmed` bestätigen
- unter 0,90 Konfidenz nicht raten, sondern unmatched lassen

Erlaubte Methoden sind `visual-content-review` und `visual-text-and-content-review`. `filename-only` ist verboten.

Nach Zuordnung müssen `review/scene-asset-verification.json` und `review/visual-inspection.json` vollständig bestanden sein.

## Untertitel

Zentrale Quelle: `src/shared/subtitle-style.js`.

- Position `center`
- exakt 50 % Bildhöhe
- weiches Weiß `#F5F7FA`
- keine gelbe Wortmarkierung
- keine schwarze Hintergrundbox oder Balken
- dunkle Kontur und dezenter Schatten
- normalerweise 3–6 Wörter, höchstens zwei Zeilen
- keine Karaoke-Animation
- exakte Einzelwortzeiten ohne Highlight nicht erforderlich

## Audio

Zentrale Quelle: `src/shared/audio-pacing-style.js`.

- immer die ursprüngliche Datei verarbeiten
- Pausen ab ungefähr 0,24 Sekunden kürzen
- exakt 1,10x, Tonhöhe erhalten
- −16 LUFS integrierte Lautheit
- höchstens −1,5 dBTP True Peak
- optimiertes Audio niemals erneut beschleunigen
- danach Timeline, Szenen-Cues und Untertitel-Cues neu synchronisieren

## Bewegung, Übergänge und Sound

- nicht jede Szene bewegen
- Zoom normalerweise 2–6 %, maximal 8 %
- Schwenk maximal 4 %
- Hook `none`, Dauer 0
- danach nur `cut`, Dauer 0
- keine Crossfades, Schwarzblenden, Slides, Glitches, Spins oder Flash-Übergänge
- Hintergrundmusik aus
- null bis zwei dezente Soundeffekte pro Szene
- Voice-over hat Vorrang

## Qualitätskontrolle

Vor Freigabe prüfen:

- 155–175 Wörter und 55–60 Sekunden Voice-over
- 12–14 Szenen mit ausgeglichenen Dauern
- Hook sofort sichtbar
- Bildwelt nach dem Script begründet ausgewählt und konsequent eingehalten
- starkes Ende über mindestens zwei Szenen plus 0,7 Sekunden ruhiges Schlussbild
- jedes Bild erklärt exakt seinen Satz und nicht den Satz einer Nachbarszene
- sichtbare Bildbeschreibung, Zuordnungsgrund und zweite Prüfung vorhanden
- keine kopierte Hauptperson oder überladene Mehrschritt-Grafik
- natürliche Komposition ohne leere Mitte
- geplanter Bildtext korrekt auf Deutsch und exakt im Prompt
- kein zusätzlicher englischer oder erfundener Text
- Untertitel exakt bei 50 %, weiß, ohne Gelb und ohne Box
- Voice-over exakt 1,10x, −16 LUFS und höchstens −1,5 dBTP
- Bildwechsel und Audio-Cues synchron
- ausschließlich direkte harte Schnitte
- Cover auf kleiner Ansicht lesbar
