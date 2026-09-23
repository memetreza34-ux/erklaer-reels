# Feste Bildwelt — Universal Editorial Stickman World v1.2

Diese Datei definiert die **verbindliche globale Bildwelt** für alle YouTube-Langvideos in diesem Repository.

Style-ID: `universal-editorial-stickman-v1.2`

## Grundidee

Die YouTube-Bildwelt ist eine hochwertige digitale **2D Editorial-Stickman-Explainer-Welt**. Menschen bleiben konsequent minimalistische Stickman-Figuren, während Umgebungen, Karten, Objekte und historische Schauplätze deutlich reichhaltiger und glaubwürdiger gestaltet werden dürfen.

Die Bildwelt ist **nicht** der ausgewaschene beige historische Cartoon-/Schulbuch-Look. Sie ist außerdem vollständig von der Reel-Bildwelt getrennt.

## Verbindliche Gestaltung

- 16:9 horizontal
- hochwertige digitale 2D-Editorial-Illustration
- klare, saubere Linien
- moderne, präzise Bildsprache
- moderate bis kräftige, szenengerechte Farben
- natürliche Lichtwirkung
- subtile 2D-Schattierung und glaubwürdige Materialien
- Umgebung darf detaillierter sein als die Figuren
- klare räumliche Tiefe und gute Komposition
- ein klarer visueller Zweck pro Bild
- historische Szenen wirken wie moderne Editorial-Illustrationen, **nicht** wie alte Manuskripte, Pergamentzeichnungen oder Kinderbuchbilder

## Figuren-System — HARD LOCK

**Jeder sichtbare Mensch muss Stickman bleiben**, auch kleine Hintergrundfiguren.

Verbindlich:
- runder oder leicht ovaler Kopf
- sehr einfacher heller Kopf ohne realistische Hautmodellierung
- kleine schwarze Punktaugen
- einfacher Mund nur wenn für Ausdruck nötig
- dünne, vereinfachte Arme und Beine
- stark vereinfachter Torso
- historische Kleidung nur als reduzierte äußere Form, nicht als detaillierte normale Cartoon-Person
- Emotion über Pose, Blickrichtung und minimale Gesichtselemente

**STYLE FAIL:**
- normale Cartoon-Menschen
- semi-realistische Menschen
- detaillierte Gesichter
- realistische Körperproportionen
- gemischte Figurenstile innerhalb eines Bildes
- Hintergrundmenschen, die keine Stickmen sind

Die Szene bestimmt **WAS** gezeigt wird. Die Master-Referenz bestimmt **WIE** alles aussieht.

## Umgebung und Farben

Umgebungen dürfen reichhaltig und glaubwürdig sein:
- Städte, Straßen, Gebäude, Landschaften, Innenräume
- Karten, Küsten, Flüsse, Berge und historische Architektur
- Objekte mit klaren Materialien und natürlicher Lichtwirkung
- moderate bis kräftige Farben mit gutem Kontrast

Verboten als Standardlook:
- beige/sepia-dominante Gesamtpalette
- ausgewaschene Pastellfarben
- Papier-/Pergamenttextur über dem ganzen Bild
- antiker Manuskriptlook
- Schulbuchkarten-Ästhetik
- flache braun-orange Einheitswelt

Beige, Braun oder Sand dürfen lokal vorkommen, aber nie die gesamte visuelle DNA dominieren.

## Karten und Diagramme

Karten bleiben Teil derselben modernen Editorial-Welt:
- klare Küsten und Grenzen
- reduzierte, gut lesbare Flächen
- moderne Farbkontraste
- wenige gezielte Marker/Pfeile
- keine überladenen historischen Atlas-Karten
- keine automatisch erzeugten englischen Kartenlabels
- keine pseudo-historischen Ornamente

## Master-Reference-Lock für Google Flow

Für jedes neue Video gilt:

1. Bild 00 separat als Thumbnail erzeugen.
2. **Bild 01 zuerst separat erzeugen und als Master-Style-Frame prüfen.**
3. Bild 01 muss die richtige Figurenanatomie, Linienart, Farbintensität, Schattierung, Materialwirkung und Gesamtästhetik zeigen.
4. Nach Freigabe wird Bild 01 bei **jedem weiteren Bild** als visuelle Referenz angehängt.
5. Ab Bild 02 darf die Bildwelt nicht neu interpretiert werden.

Merksatz:

> The scene prompt determines WHAT is shown. The master image determines HOW everything looks.

Die 5er-Regel bleibt erhalten: Nach dem separaten Master-Frame werden die restlichen Bilder in kontrollierten Wellen mit maximal fünf aktiven Generierungen erzeugt.

## Sichtbarer Text — DEUTSCH-HARD-LOCK

Für **jedes deutsche YouTube-Projekt** gilt ohne Ausnahme:

- **Jeder sichtbare lesbare Text im Bild muss Deutsch sein.**
- Das gilt für Überschriften, Kartenlabels, Schilder, Diagramme, Callouts, Legenden, Pfeilbeschriftungen, Kalendertexte, UI-artige Elemente und sonstige Wörter.
- Flow darf keine englischen Standardlabels ergänzen.
- Englischer sichtbarer Text = **HARD FAIL → Bild regenerieren**.
- Pseudo-Schrift oder unleserlicher Text = **HARD FAIL → Bild regenerieren oder Text entfernen**.
- Wenn ein Text nicht ausdrücklich benötigt wird, lieber **gar keinen Text** erzeugen.
- Eigennamen, die im Deutschen identisch geschrieben werden, dürfen natürlich unverändert bleiben.

Beispiele:
- `ATLANTIC OCEAN` → verboten
- `ATLANTISCHER OZEAN` → erlaubt
- `MEDITERRANEAN SEA` → verboten
- `MITTELMEER` → erlaubt
- `WEST / EAST` → verboten
- `WEST / OST` → erlaubt

## Thumbnail

Bild 00 nutzt dieselbe Bildwelt, darf aber:
- stärkeren Kontrast
- größere Motive
- klarere Emotion
- größere deutsche Headline
verwenden.

Bild 00 bleibt ausschließlich Thumbnail und kommt nie in die Videotimeline.

## Visuelle Komplexität A–E

- A — sehr einfach: 4–5 s geplant; echte Timeline max. 6,5 s
- B — einfach: 5–7 s geplant; echte Timeline max. 8,5 s
- C — mittel: 7–9 s geplant; echte Timeline max. 10,5 s
- D — komplex: 9–12 s geplant; echte Timeline max. 13,5 s
- E — sehr komplex: 12–15 s geplant; echte Timeline max. 16,0 s

Komplexität bedeutet nicht, ein Bild künstlich vollzustopfen. Ein Bild behält einen klaren visuellen Zweck.

## Motion nach A–E

- A: sehr leichter Push
- B: ruhiger Pan
- C: narrativer Pan/Push
- D: langsamer Scan/Pull
- E: besonders ruhige Übersicht

Motion bleibt subtil.

## Verbotene Stilabweichungen

Nicht verwenden:
- beige historische Cartoon-/Kinderbuch-Welt
- normale oder semi-realistische Cartoon-Menschen
- gemischte Menschenstile
- Countryballs
- Fotorealismus
- Anime/Manga
- 3D-/Pixar-Look
- Clay-/Knetstil
- Hochglanz-Render
- Stockfoto-Ästhetik
- überladene Infografiken
- alte Atlas-/Pergamentkarten
- englischen sichtbaren Text in deutschen Projekten
- harte Stilwechsel zwischen Szenen

## Prompt-Regel

Prompts selbst werden auf Englisch geschrieben. **Sichtbarer Text im erzeugten Bild folgt jedoch immer der Projektsprache; bei deutschen Videos ausschließlich Deutsch.**

Der feste Master-Prefix lautet sinngemäß:

```text
Universal Editorial Stickman World v1.2, 16:9 horizontal, premium clean digital 2D editorial illustration, every visible human including background people is a minimalist stickman with a round or slightly oval head, tiny black eyes, minimal mouth, thin simplified limbs and strongly simplified body, richer believable environments with natural lighting and subtle 2D shading, moderate-to-vivid scene-appropriate colors, crisp modern composition, one clear visual purpose, no beige/sepia wash, no parchment texture, no historical-manuscript look, no normal cartoon humans, no semi-realistic people, no photorealism, no 3D, no countryballs. For German projects, every readable word visible anywhere in the image must be German; do not generate English labels or pseudo-text.
```
