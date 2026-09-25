# Feste YouTube-Bildwelt — Serious Minimal Countryball Explainer · 16:9

**Stand: 2026-09-25**  
**Visual Policy Version: 4**  
**Cover Policy Version: 1**  
**Asset Generation Policy Version: 1**

Diese Datei definiert die verbindliche Bildwelt für alle **neuen** YouTube-Langvideos.

YouTube übernimmt wieder die ursprüngliche aktive Reel-Bild-DNA und adaptiert sie nur auf 16:9.

- Reel-Quellwelt: `serious-minimal-countryball-explainer`
- YouTube-Style-ID: `serious-minimal-countryball-explainer-youtube-16x9`
- einzige Formatabweichung: **16:9 horizontal statt 9:16 vertikal**

Die Premium-Editorial-Bildwelt aus Visual Policy V3 ist für neue YouTube-Projekte **nicht mehr aktiv**.

## Verbindliche visuelle DNA

- seriöse, cleane, minimalistische 2D-Countryball-Erklärwelt
- perfekt runde Countryball-artige Akteure, wenn ein Akteur sinnvoll ist
- einfache weiße Augen
- kräftige, saubere schwarze Konturen
- flache kontrollierte 2D-Farben
- nur leichte grafische Schattierung
- geringe bis mittlere kontrollierte Detaildichte
- ein dominantes Hauptmotiv
- normalerweise 0–3 sinnvolle Zusatzobjekte
- einfacher einfarbiger oder gedämpfter Hintergrund, leichter Verlauf oder subtile Textur erlaubt
- starke Symbolik statt realistischer Vollszenen
- erwachsene informative Wirkung, **nicht kindisch und nicht albern**
- Karten, Diagramme und historische Inhalte werden in dieselbe reduzierte Formsprache übersetzt

## Figuren-System — HARD LOCK

Wenn ein Akteur gebraucht wird:

- perfekt runder Kugelkörper
- niemals oval, bohnenförmig oder eiförmig
- keine getrennten menschlichen Köpfe
- einfache weiße Augen
- kräftige schwarze Konturen
- reduzierte kontrollierte Mimik
- kleine einfache Arme/Hände/Füße nur wenn die Handlung sie wirklich braucht
- keine Haare, Hälse oder realistischen Gesichter

Flaggenmuster nur, wenn Geografie, Politik oder kulturelle Identität inhaltlich relevant sind. Bei historischen Gruppen ohne passende moderne Flagge werden neutrale/historisch passende Farbcodes und wenige Symbole verwendet.

Wenn ein Objekt, eine Karte oder ein Symbol die Aussage klarer erklärt, ist kein Countryball zwingend nötig.

### Verboten

- normale illustrierte Menschen
- humanoide Cartoon-Personen
- Stickfiguren
- realistische Menschen
- realistische Hände/Haut
- fotorealistische Vollszenen
- glossy 3D
- Pixar/Clay/Anime
- übertriebene Gag-Gesichter oder kindische Mimik

## Drei Haupt-Kompositionsmodi

### 1. Minimal Symbolic
Ein großes Hauptmotiv + 0–1 sinnvolles Symbol.

### 2. Supported Explainer
Ein großes Hauptmotiv + 1–3 relevante Requisiten, Symbole oder Cues.

### 3. Simple Mini Scene
Ein klarer Countryball-Akteur oder ein Objekt + eine stark reduzierte Kontextstruktur.

Ergänzend erlaubt: reduzierte Map/Spatial-Explainer und Conceptual Metaphor, solange die Serious-Minimal-Countryball-DNA erhalten bleibt.

Historische Themen werden **nicht** als realistische Gemälde, cineastische Städte oder detaillierte Menschenszenen dargestellt, sondern in diese reduzierte Erklärwelt übersetzt.

## Anti-Lifeless — ohne Stilwechsel

Die alte Bildwelt bleibt bestehen, aber Prompts sollen trotzdem lebendig und verständlich sein.

Vermeiden:
- kleines Hauptmotiv verloren in riesiger leerer Fläche
- generische Icon-Collage
- mechanisch dieselbe Komposition in jedem Bild
- dekorative Objekte ohne Aussage
- immer derselbe Countryball mittig ohne Handlung

Erlaubt und erwünscht:
- klare Richtung durch Pfeile, Wege oder Blickführung
- unterschiedliche Größenverhältnisse
- Karten, Grenzen und Symbole mit klarer Funktion
- einfache Vorder-/Hintergrund-Trennung, wenn sie hilft
- unterschiedliche Anordnung der wenigen Elemente

**Clean ≠ leer. Minimal ≠ leblos.** Aber die Lösung bleibt minimal und Countryball-basiert, statt in eine realistische Editorial-Szene zu wechseln.

## FIRST SCENE = COVER — HARD LOCK

- **Bild 01 ist Cover und erste Videoszene zugleich.**
- Bild 01 beginnt bei 0,0 s.
- Bild 01 enthält eine starke kurze deutsche Cover-Überschrift.
- `03-export/THUMBNAIL.png` wird direkt aus `Bild 01.png` kopiert.
- kein Bild 00
- kein separates Thumbnail

## Asset Generation Policy V1

- Bild 01 wird **exakt 3-mal** als temporärer Cover-Kandidat erzeugt.
- genau 1 Gewinner bleibt und wird final einmal zu `Bild 01.png` benannt.
- die anderen 2 Cover-Kandidaten werden verworfen.
- Bild 02–NN wird jeweils **exakt einmal** erzeugt.
- keine manuellen Prüfstopps nach 5er-Wellen.
- maximal 5 aktive Generierungen gleichzeitig = nur Parallelitätsregel.
- alle finalen Bilder liegen flach in `00-bildprompts/images/`.

## Jedes Bild unabhängig — HARD LOCK

Die **Bildwelt** ist zurückgesetzt, die problematische alte Referenzlogik jedoch nicht.

- kein erzeugtes Bild wird als Referenz an ein späteres Bild angehängt
- Bild 01 ist kein Master-Style-Frame
- jedes Bild wird aus seinem eigenen vollständigen Textprompt erzeugt
- Konsistenz kommt aus dem geschriebenen Serious-Minimal-Countryball-Style-Lock
- keine Image-to-Image-Stilvererbung

Damit bleibt die alte Bildwelt erhalten, ohne dass spätere Bilder Layout und Perspektive von Bild 01 kopieren.

## Hintergrund

Bevorzugt:
- einfarbige oder gedämpfte Farbfläche
- einfacher Farbverlauf
- subtile Papier-/Korntextur
- ein einzelnes Kontextobjekt oder stark vereinfachte Struktur

Nicht als Standard:
- detaillierte realistische Innenräume
- cineastische Vollszenen
- fotorealistische Landschaften
- komplexe realistische Architekturkulissen
- überladene historische Gemälde

## Karten und Diagramme

- klare dicke Konturen
- einfache Flächen
- wenige kontrollierte Farben
- wenige Pfeile und Marker
- Countryball-Symbole nur bei echten Akteuren
- keine alten realistischen Atlas-Karten
- keine Satellitenkarten
- keine automatisch erzeugten englischen Labels

## Sichtbarer Text — DEUTSCH-HARD-LOCK

Für deutsche Projekte:
- jeder sichtbare lesbare Text muss Deutsch sein
- englischer sichtbarer Text = **HARD FAIL**
- Pseudo-Schrift = **HARD FAIL**
- wenn Text nicht nötig ist, keinen Text erzeugen
- ausdrücklich vorgegebener Text exakt übernehmen

## Session-Schutz

Da die Bildwelt mit Visual Policy V4 wieder geändert wurde, muss für aktuelle/neue Generierungen eine **frische Flow-Sitzung** verwendet werden.

Eine Sitzung mit `premium-editorial-explainer-illustration-youtube-16x9` ist für V4 veraltet.

## Prompt-Pflichtmarker

Jeder neue Masterprompt beginnt mit:

```text
YOUTUBE_VISUAL_POLICY_VERSION: 4
COVER_POLICY_VERSION: 1
ASSET_GENERATION_POLICY_VERSION: 1
ACTIVE_STYLE_ID: serious-minimal-countryball-explainer-youtube-16x9
```

Fester Style-Prefix:

```text
Serious Minimal Countryball Explainer visual world, exactly matching the active Reel visual DNA, adapted only to a 16:9 horizontal YouTube canvas: clean serious minimal 2D countryball explainer, perfectly round ball characters when an actor is useful, simple white eyes, thick clean black outlines, flat controlled colors, minimal soft graphic shading, low-to-medium controlled detail, one dominant focal subject, zero to three meaningful supporting props, simple solid or muted background with optional subtle texture or gradient, strong symbolic storytelling, adult and informative, not childish, no normal illustrated humans, no humanoid cartoon people, no stick figures, no photorealism, no realistic full scenes, no glossy 3D, no Pixar, no clay, no anime, no busy icon collage. For German projects every readable visible word must be German; no English labels and no pseudo-text. Generate this image independently from text only; do not use any previous generated image as a visual reference.
```

## Qualitätsprüfung

1. Entspricht das Bild eindeutig der Serious-Minimal-Countryball-Welt?
2. Sind Akteure perfekt rund statt humanoid?
3. Fehlen normale Menschen, Stickfiguren und realistische Vollszenen?
4. Erklärt das Bild den vorgesehenen Gedanken schnell?
5. Ist es minimal, aber nicht leer oder leblos?
6. Sind nur sinnvolle Zusatzobjekte vorhanden?
7. Ist sichtbarer Text ausschließlich Deutsch?
8. Wurde kein vorheriges Bild als Referenz verwendet?
9. Ist Bild 01 zugleich Cover + erste Szene?
10. Liegen am Ende nur die finalen `Bild NN.png` im einen Bilderordner?
