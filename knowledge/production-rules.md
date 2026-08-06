# Produktionsregeln

## Ziel

Jedes Reel erklärt einen Begriff, ein System oder einen Zusammenhang so einfach, dass Zuschauer ihn ohne Vorwissen verstehen.

## Script

- ein durchgehender deutscher Erzähler
- direkte Hook ohne lange Einleitung
- 155–175 Wörter
- 55–60 Sekunden nach Optimierung auf exakt 1,10x
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

## Starkes Ende

Die letzten zwei Szenen müssen eine echte Auflösung bilden:

1. persönliche Prüf-, Erkenntnis- oder Entscheidungsfrage
2. konkrete Lösung und kurzer einprägsamer Abschlusssatz

Verboten sind ein abruptes Ende nach einer Aufzählung, eine schulische Zusammenfassung und ein einziges überladenes Bild mit mehreren Handlungsschritten.

## Bilder und Timing

- Hook-Bild ab Sekunde 0
- 12–14 visuelle Momente, Standard 13
- sichtbare Veränderung ungefähr alle 3,5–5 Sekunden
- Bildwechsel nach Sinnabschnitten und Audio-Cues
- jede Szene zeigt genau einen klaren Moment
- keine mehrfach dargestellte Hauptperson innerhalb eines Bildes
- pro Reel eine konsistente Bildwelt
- Bildprompts Englisch
- keine zufälligen Wörter, Fantasie-Labels, Logos oder Wasserzeichen

## Deutscher Text im Bild

Wo es zur Szene passt, wird kurzer deutscher Text direkt in das Bild integriert.

- Zielbereich: ungefähr 55–85 % der Szenen
- normalerweise 1–5 Wörter; ein einzelnes Wort reicht
- der Text darf klein, mittel oder groß sein
- geeignete Formen: Überschrift, Schild, Etikett, Karte, Dokument, Display, Gegenstandsbeschriftung oder Schlussaussage
- `imageText` enthält den exakten deutschen Wortlaut
- der englische Bildprompt fordert genau diesen deutschen Wortlaut in Anführungszeichen an
- Bildtext darf den Untertitel nicht wortgleich wiederholen
- kein englischer sichtbarer Text und keine erfundene Schrift
- keine langen Absätze und keine unnötig große Textmenge
- Text nicht erzwingen, wenn das Motiv ohne Text klarer ist oder die Generierung darunter leiden würde

## Natürliche Komposition

- Hauptmotive dürfen die exakte Bildmitte normal nutzen und hinter Untertiteln liegen.
- Untertitel sind ein Overlay; das Bild wird dafür nicht künstlich freigeräumt.
- Keine leere horizontale Untertitelzone, kein Mittelstreifen und keine getrennten Bildhälften.
- Keine gestapelten Panels, leeren Bäume, Pfeile oder großen Textplatzhalter.
- Die Illustration muss auch ohne Untertitel vollständig und natürlich wirken.

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
- kurze natürliche Restpause behalten
- exakt 1,10x, Tonhöhe erhalten
- −16 LUFS integrierte Lautheit
- höchstens −1,5 dBTP True Peak
- Lautheitsbereich 11 LRA
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

- 155–175 Wörter und 55–60 Sekunden
- 12–14 Szenen
- Hook sofort sichtbar
- Bildwelt erst nach dem Script begründet ausgewählt
- starkes Ende über mindestens zwei Szenen
- jedes Bild erklärt genau seinen Satz und zeigt nur einen klaren Moment
- keine kopierte Hauptperson oder überladene Mehrschritt-Grafik
- natürliche Komposition ohne leere Mitte
- kurzer geplanter Bildtext in passenden Szenen
- geplanter Bildtext korrekt auf Deutsch und exakt im Prompt
- kein zusätzlicher englischer oder erfundener Text
- Bildtext wiederholt Untertitel nicht wortgleich
- Untertitel exakt bei 50 %, weiß, ohne Gelb und ohne Box
- Voice-over exakt 1,10x, −16 LUFS und höchstens −1,5 dBTP
- Bildwechsel und Audio-Cues synchron
- ausschließlich direkte harte Schnitte
- Cover auf kleiner Ansicht lesbar
