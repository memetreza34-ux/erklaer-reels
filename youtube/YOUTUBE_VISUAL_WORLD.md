# Feste Bildwelt — Serious Minimal Countryball Explainer · YouTube 16:9

Diese Datei definiert die verbindliche Bildwelt für alle neuen YouTube-Langvideos.

YouTube übernimmt **dieselbe künstlerische Welt wie die aktiven Reels**.

- Reel-Quellwelt: `serious-minimal-countryball-explainer`
- YouTube-Style-ID: `serious-minimal-countryball-explainer-youtube-16x9`
- einzige Formatabweichung: **16:9 horizontal statt 9:16 vertikal**

Die visuelle DNA darf gegenüber der Reel-Welt nicht neu interpretiert werden.

## Verbindliche visuelle DNA

- seriöse, cleane, minimalistische 2D-Countryball-Erklärwelt
- kräftige, saubere schwarze Konturen
- flache kontrollierte 2D-Farben
- nur leichte grafische Schattierung
- geringe bis mittlere kontrollierte Detaildichte
- ein dominantes Hauptmotiv
- normalerweise 0–3 sinnvolle Zusatzobjekte
- einfacher einfarbiger oder gedämpfter Hintergrund, leichter Verlauf oder subtile Textur erlaubt
- starke Symbolik statt realistischer Vollszenen
- erwachsene informative Wirkung, nicht kindisch und nicht albern
- 16:9-Komposition für YouTube, ansonsten dieselbe Welt wie Reels

## Figuren-System — HARD LOCK

Wenn ein Akteur gebraucht wird:

- perfekt runder Countryball-artiger Kugelkörper
- niemals oval, bohnenförmig oder eiförmig
- keine getrennten menschlichen Köpfe
- einfache weiße Augen
- kräftige schwarze Konturen
- reduzierte kontrollierte Mimik
- kleine einfache Arme/Hände/Füße nur wenn die Handlung sie wirklich braucht
- keine Haare, Hälse oder realistischen Gesichter

Flaggenmuster nur, wenn Geografie, Politik oder kulturelle Identität inhaltlich relevant sind. Bei historischen Gruppen ohne moderne Flagge werden neutrale oder historisch passende Farbcodes und wenige Requisiten/Symbole verwendet; keine erfundenen modernen Nationalflaggen.

Wenn ein Objekt, eine Karte oder ein Symbol die Aussage klarer erklärt, ist kein Countryball zwingend nötig.

### Verboten

- Stickfiguren
- normale illustrierte Menschen
- humanoide Cartoon-Personen
- realistische Menschen
- realistische Hände/Haut
- Countryball mit getrenntem Menschenkopf
- winzige dekorative Kugeln ohne Funktion
- übertriebene Gag-Gesichter, Zungen oder kindische Mimik

## Drei Kompositionsmodi

### 1. Minimal Symbolic
Ein großes Hauptmotiv plus 0–1 sinnvolles Symbol.

### 2. Supported Explainer
Ein großes Hauptmotiv plus 1–3 relevante Requisiten, Symbole oder Cues.

### 3. Simple Mini Scene
Ein klarer Countryball-Akteur oder ein Objekt plus eine stark reduzierte Kontextstruktur.

Auch bei historischen Themen keine überladenen realistischen Stadt- oder Schlachtszenen. Historische Inhalte werden in dieselbe reduzierte Countryball-Formsprache übersetzt.

## Hintergrund

Bevorzugt:

- einfarbige oder gedämpfte Farbfläche
- einfacher Farbverlauf
- subtile Papier-/Korntextur
- ein einzelnes Kontextobjekt oder eine stark vereinfachte Struktur

Nicht als Standard:

- detaillierte realistische Innenräume
- cineastische Vollszenen
- fotorealistische Landschaften
- komplexe realistische Architekturkulissen
- überladene historische Gemälde

## Karten und Diagramme

Karten und Diagramme werden in derselben Serious-Minimal-Countryball-Welt dargestellt:

- klare dicke Konturen
- einfache Flächen
- wenige Farben
- wenige Pfeile und Marker
- Countryball-Symbole nur wenn sie einen echten Akteur darstellen
- keine alten Atlas-Karten
- keine realistischen Satellitenkarten
- keine automatisch erzeugten englischen Kartenlabels

## World-Lock / Master-Reference

1. Bild 00 separat als Thumbnail erzeugen.
2. Bild 01 separat erzeugen und streng auf die Reel-Countryball-Welt prüfen.
3. Bild 01 wird danach Master-Style-Frame.
4. Ab Bild 02 wird Bild 01 bei jeder Generierung als visuelle Referenz angehängt.
5. Motiv, Requisiten, Perspektive und Hintergrundfarbe dürfen wechseln; die künstlerische Welt nicht.

Merksatz:

> The scene prompt determines WHAT is shown. The Reel Countryball visual world and the approved Bild 01 determine HOW it looks.

## Sichtbarer Text — DEUTSCH-HARD-LOCK

Für jedes deutsche YouTube-Projekt gilt:

- jeder sichtbare lesbare Text muss Deutsch sein
- gilt für Headlines, Kartenlabels, Schilder, Legenden, Diagramme, Callouts, Kalender und Hintergrundtext
- englischer sichtbarer Text = HARD FAIL
- Pseudo-Schrift/unleserlicher Text = HARD FAIL
- wenn Text nicht nötig ist, keinen Text erzeugen

Beispiele:

- `ATLANTIC OCEAN` → verboten
- `ATLANTISCHER OZEAN` → erlaubt
- `MEDITERRANEAN SEA` → verboten
- `MITTELMEER` → erlaubt
- `WEST / EAST` → verboten
- `WEST / OST` → erlaubt

## Thumbnail

Bild 00 verwendet dieselbe Countryball-Welt, darf aber stärkeren Kontrast, größere Motive und eine große deutsche Headline verwenden. Bild 00 kommt nie in die Videotimeline.

## A–E-Pacing

- A: 4–5 s geplant; max. 6,5 s gemessen
- B: 5–7 s geplant; max. 8,5 s
- C: 7–9 s geplant; max. 10,5 s
- D: 9–12 s geplant; max. 13,5 s
- E: 12–15 s geplant; max. 16,0 s

Die Komplexitätsklasse ändert nicht die Bildwelt. Auch ein D-/E-Bild bleibt clean und kontrolliert.

## Prompt-Regel

Prompts werden auf Englisch geschrieben. Sichtbarer Bildtext folgt der Projektsprache; bei deutschen Projekten ausschließlich Deutsch.

Fester YouTube-Master-Prefix:

```text
Serious Minimal Countryball Explainer visual world, exactly matching the active Reel visual DNA, adapted only to a 16:9 horizontal YouTube canvas: clean serious minimal 2D countryball explainer, perfectly round ball characters when an actor is useful, simple white eyes, thick clean black outlines, flat controlled colors, minimal soft graphic shading, low-to-medium controlled detail, one dominant focal subject, zero to three meaningful supporting props, simple solid or muted background with optional subtle texture or gradient, strong symbolic storytelling, not childish, no normal illustrated humans, no humanoid cartoon people, no stick figures, no photorealism, no realistic rooms, no glossy 3D, no Pixar, no clay, no anime, no busy icon collage. For German projects every readable visible word must be German; no English labels and no pseudo-text.
```
