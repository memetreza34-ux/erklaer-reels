# Produktionsregeln

## Ziel

Jedes Reel erklärt einen Begriff, ein System oder einen Zusammenhang so einfach, dass Zuschauer ihn ohne Vorwissen verstehen.

## Script

- ein durchgehender deutscher Erzähler
- direkte, verständliche Hook ohne lange Einleitung
- Thema möglichst sofort nennen und direkt erklären
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
- Bildwechsel werden nach Sinnabschnitten und Audio-Cues geplant, nicht in starren Zeitblöcken.
- Pro Reel eine zusammenhängende Bildwelt.
- Zwischen Reels dürfen die Bildwelten wechseln.
- Bildprompts sind Englisch; sichtbarer Bildtext ist nur erlaubt, wenn er ausdrücklich benötigt wird, und dann ausschließlich korrekt auf Deutsch.
- Unerwünschte englische Wörter, Fantasietext, Labels, Logos und Wasserzeichen sind verboten.

## Natürliche Bildkomposition

- Hauptmotive dürfen die geometrische Bildmitte normal nutzen.
- Keine künstlich freigehaltene horizontale Mittelzone.
- Kein leerer Streifen quer durch das Bild.
- Keine voneinander getrennte obere und untere Bildhälfte nur wegen der Untertitel.
- Keine riesigen leeren Baumstämme, Pfeile oder Flächen als Platzhalter für Text.
- Vergleichsbilder möglichst seitlich oder als zusammenhängende Szene aufbauen.
- Die Illustration muss auch ohne Untertitel vollständig und natürlich komponiert wirken.
- Nur kleine unverzichtbare Details nicht direkt hinter dem unteren Untertitelbereich platzieren.

## Untertitel

Die zentrale Quelle ist `src/shared/subtitle-style.js`.

- Position: `lower`
- vertikale Position: exakt 76 % der Bildhöhe
- durchgehend weiches Weiß `#F5F7FA`
- keine gelbe Wortmarkierung
- keine schwarze Hintergrundbox und kein Balken
- Lesbarkeit durch dunkle Kontur und dezenten Schatten
- normalerweise 3–6 Wörter pro Einblendung
- höchstens zwei Zeilen
- keine Wort-für-Wort-Karaoke-Animation
- integrierten Bildtext nicht wortgleich wiederholen
- exakte Einzelwortzeiten sind ohne Wort-Highlight nicht erforderlich

## Audio

Die zentrale Quelle ist `src/shared/audio-pacing-style.js`.

- Voice-over immer von der ursprünglichen Datei verarbeiten
- Pausen ab ungefähr 0,24 Sekunden kürzen
- kurze natürliche Restpause behalten
- Geschwindigkeit exakt `1.10x`
- Tonhöhe erhalten
- integrierte Lautheit auf `-16 LUFS` normalisieren
- True Peak auf `-1,5 dBTP` begrenzen
- Lautheitsbereich `11 LRA`
- bereits optimiertes Audio niemals erneut beschleunigen
- nach jeder Audioänderung Timeline, Szenen-Cues und Untertitel-Cues neu synchronisieren

## Bewegung, Übergänge und Sound

- Planung in `effects/effects-plan.json`
- nicht jede Szene benötigt Bewegung
- Zoom normalerweise 2–6 %, maximal 8 %
- Schwenk maximal 4 %
- Hook ohne Übergang: `none`, Dauer 0
- danach ausschließlich direkte harte Schnitte: `cut`, Dauer 0
- keine Crossfades, Schwarzblenden, Slides, Glitches, Spins oder Flash-Übergänge
- kein schwarzes Zwischenbild
- Hintergrundmusik standardmäßig aus
- null bis zwei dezente Soundeffekte pro Szene
- Voice-over hat immer Vorrang

## Stärkste Bildwelten

1. Menschliche Editorial-Cartoonfiguren für Psychologie und Gesellschaft
2. Runde Länderfiguren für neutrale Länder- und Geografieerklärungen
3. Starke visuelle Metaphern für abstrakte Begriffe und Hooks

Vergleichspanels oder Build-up-Sequenzen nur einsetzen, wenn sie das Thema klarer machen.

## Qualitätskontrolle

Vor der Freigabe prüfen:

- Ist das Hook-Bild sofort sichtbar?
- Erklärt jedes Bild genau den zugehörigen Satz?
- Stimmt jeder Bildwechsel mit seinem Audio-Cue überein?
- Wirkt jede Illustration als natürliche zusammenhängende Komposition?
- Gibt es keinen leeren Mittelstreifen oder künstlich getrennte Bildhälften?
- Enthält das Bild keine unerwünschten englischen oder erfundenen Wörter?
- Bleiben Figuren, Konturen und Proportionen konsistent?
- Stehen Untertitel exakt bei 76 % Bildhöhe?
- Sind alle Wörter weiß, ohne gelbe Markierung und ohne schwarze Box?
- Bleiben Untertitel durch Kontur und Schatten lesbar?
- Ist das Voice-over exakt auf `1.10x` verarbeitet?
- Sind `-16 LUFS` und `-1,5 dBTP` eingestellt?
- Sind Zooms und Schwenks dezent und begründet?
- Werden ausschließlich direkte harte Schnitte verwendet?
- Ist das Cover auf kleiner Ansicht lesbar?
