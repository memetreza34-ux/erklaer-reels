# Feste YouTube-Bildwelt — Serious Minimal Countryball Explainer · 16:9

**Stand: 2026-09-26**  
**Visual Policy Version: 5**  
**Design Quality Version: 1**  
**Cover Policy Version: 1**  
**Asset Generation Policy Version: 1**

Diese Datei definiert die verbindliche Bildwelt für alle **neuen** YouTube-Langvideos ab Schema 10.

Die Bildwelt bleibt dieselbe Serious-Minimal-Countryball-DNA wie bei den Reels. V5 ändert **nicht** den Zeichenstil. V5 erhöht ausschließlich Art Direction, Komposition, Farbkontrolle, Typografie, Kartenqualität und visuelle Dichte.

- Reel-Quellwelt: `serious-minimal-countryball-explainer`
- YouTube-Style-ID: `serious-minimal-countryball-explainer-youtube-16x9`
- Formatabweichung: **16:9 horizontal statt 9:16 vertikal**
- neue Qualitätsstufe: **Premium Countryball Design Layer**

## Unveränderte visuelle DNA — HARD LOCK

- seriöse, cleane, minimalistische 2D-Countryball-Erklärwelt
- perfekt runde Countryball-Akteure, wenn ein Akteur sinnvoll ist
- einfache weiße Augen
- kräftige, saubere schwarze Konturen
- flache kontrollierte 2D-Farben
- nur leichte grafische Schattierung
- keine normalen illustrierten Menschen
- keine humanoiden Cartoon-Personen
- keine Stickfiguren
- kein Fotorealismus
- kein 3D/Pixar/Clay/Anime
- nicht kindisch, nicht albern

**Premium bedeutet niemals Stilwechsel.** Premium bedeutet bessere Gestaltung innerhalb genau dieser Bildwelt.

## PREMIUM DESIGN LAYER V1 — HARD LOCK

Jeder neue Bildprompt muss wie ein bewusst art-direktiertes Erklärbild geplant werden, nicht wie eine lose Sammlung von Symbolen.

### 1. Komposition

Pflicht:
- ein dominantes Hauptmotiv
- klare Blickführung
- sichtbare Beziehung zwischen den Elementen
- bewusste Größenhierarchie
- ausgewogene negative Fläche
- wichtige Elemente nicht zufällig mittig stapeln
- bei geeigneten Szenen Vordergrund, Mittelgrund und Hintergrund als einfache 2D-Ebenen nutzen
- Überlagerungen, diagonale Wege, Grenzlinien, Pfeile oder räumliche Trennung gezielt einsetzen

Verboten:
- kleines Motiv verloren auf leerer Fläche
- starres „Countryball + Label + nichts sonst“-Template als Standard
- wahllose Icon-Reihe
- symmetrische Standardanordnung ohne inhaltlichen Grund

### 2. Farbgestaltung

- pro Bild eine bewusste Hauptpalette
- normalerweise 1 dominante Grundfarbe + 1–2 kontrollierte Akzentfarben
- Akzente dienen der Aussage, nicht der Dekoration
- Kontrast so wählen, dass Karte, Figur und Text sofort lesbar bleiben
- keine zufällig knallbunte Farbmischung
- benachbarte Bilder dürfen Palette und Hintergrund bewusst variieren, ohne die Bildwelt zu verlassen

### 3. Typografie

Wenn Text vorgesehen ist:
- kurze deutsche Aussage
- klare visuelle Hierarchie
- große, saubere Sans-Serif-/Condensed-Anmutung
- genügend Abstand zum Hauptmotiv
- hoher Kontrast
- Text als Teil der Komposition statt nachträgliches Etikett
- keine langen Sätze
- keine Fake-Schrift oder englischen Labels

### 4. Karten und Grenzen

Bei Geografie-/Geschichtsthemen:
- vereinfachte, aber eindeutige Silhouetten
- saubere Grenzlinien
- wenige kontrollierte Farben
- Routen und Bewegungsrichtungen deutlich
- Labels nur wenn wirklich nötig
- relevante Region visuell priorisieren
- keine überladene Atlas-Optik
- keine winzigen unlesbaren Staaten-/Stadtlabels

### 5. Visuelles Erzählen

Bevorzugt werden Beziehungen statt Objektlisten:
- vorher → nachher
- Ursache → Folge
- geteilt → verbunden
- innen → außen
- Angriff → Gegenbewegung
- Grenze → Route → Hindernis
- Zentrum → Peripherie
- zwei Systeme im direkten Vergleich

Ein Bild darf minimal sein, muss aber eine klare visuelle Aussage tragen.

## Kompositionsmodi

Primär:
1. `minimal-symbolic`
2. `supported-explainer`
3. `simple-mini-scene`
4. `map-spatial-explainer`
5. `conceptual-metaphor`
6. `before-after`
7. `cause-effect`
8. `route-progression`

Benachbarte Bilder sollen nicht mechanisch dieselbe Komposition wiederholen.

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

Flaggenmuster nur, wenn Geografie, Politik oder kulturelle Identität inhaltlich relevant sind. Historische Gruppen ohne passende moderne Flagge werden neutral oder historisch passend codiert.

Wenn Karte, Objekt oder Symbol die Aussage klarer erklärt, ist kein Countryball zwingend nötig.

## Anti-Lifeless

**Clean ≠ leer. Minimal ≠ leblos. Premium ≠ realistisch.**

Vermeiden:
- zu viel leere Fläche ohne Funktion
- generische Icon-Collage
- immer derselbe Countryball mittig
- langweilige horizontale Aufreihung
- gleichförmige Karten mit nur anderem Label

Erwünscht:
- klare Richtung und Bewegung
- Größenkontrast
- Layering
- Vorder-/Hintergrund-Trennung
- kontrollierte Schatten
- bewusst gesetzte Akzentfarbe
- sinnvolle Überlappung
- Karten, Grenzen und Dokumente mit klarer Funktion

## FIRST SCENE = COVER — HARD LOCK

- **Bild 01 ist Cover und erste Videoszene zugleich.**
- Bild 01 beginnt bei 0,0 s.
- Bild 01 enthält eine starke kurze deutsche Cover-Überschrift.
- `03-export/THUMBNAIL.png` wird direkt aus `Bild 01.png` kopiert.
- kein Bild 00
- kein separates Thumbnail

## Asset Generation Policy V1

- Bild 01 wird exakt 3-mal als temporärer Cover-Kandidat erzeugt.
- genau 1 Gewinner bleibt und wird final einmal zu `Bild 01.png` benannt.
- die anderen 2 Cover-Kandidaten werden verworfen.
- Bild 02–NN wird jeweils exakt einmal erzeugt.
- keine manuellen Prüfstopps nach 5er-Wellen.
- maximal 5 aktive Generierungen gleichzeitig = nur Parallelitätsregel.
- alle finalen Bilder liegen flach in `00-bildprompts/images/`.

## Jedes Bild unabhängig — HARD LOCK

- kein erzeugtes Bild wird als Referenz an ein späteres Bild angehängt
- Bild 01 ist kein Master-Style-Frame
- jedes Bild wird aus seinem eigenen vollständigen Textprompt erzeugt
- Konsistenz kommt aus dem geschriebenen Style-Lock
- keine Image-to-Image-Stilvererbung

## Sichtbarer Text — DEUTSCH-HARD-LOCK

Für deutsche Projekte:
- jeder sichtbare lesbare Text muss Deutsch sein
- englischer sichtbarer Text = HARD FAIL
- Pseudo-Schrift = HARD FAIL
- wenn Text nicht nötig ist, keinen Text erzeugen
- ausdrücklich vorgegebener Text exakt übernehmen

## Session-Schutz

Bei Wechsel auf Visual Policy V5 eine frische Flow-Sitzung verwenden. Sitzungen mit V3-Premium-Editorial oder V4-Prompts gelten für neue V5-Projekte als veraltet.

## Prompt-Pflichtmarker

Jeder neue Schema-10+-Masterprompt beginnt mit:

```text
YOUTUBE_VISUAL_POLICY_VERSION: 5
DESIGN_QUALITY_VERSION: 1
ADAPTIVE_PACING_VERSION: 3
COVER_POLICY_VERSION: 1
ASSET_GENERATION_POLICY_VERSION: 1
ACTIVE_STYLE_ID: serious-minimal-countryball-explainer-youtube-16x9
```

## Fester Premium-Style-Prefix

```text
Serious Minimal Countryball Explainer visual world, exactly matching the Reel visual DNA and adapted only to a 16:9 YouTube canvas. Premium art direction inside the same flat 2D Countryball world: perfectly round ball actors when useful, simple white eyes, thick clean black outlines, controlled flat colors, restrained soft graphic shading, strong focal hierarchy, deliberate visual balance, intentional negative space, clear foreground/midground/background layering when useful, one dominant idea, meaningful scale contrast, purposeful overlaps, clean routes/borders/arrows, refined simplified maps, high-contrast German typography when requested, and one coherent palette with controlled accent colors. The result should feel polished, editorially composed and premium without becoming realistic, painterly, 3D or human-based. No normal illustrated humans, no humanoid cartoon people, no stick figures, no photorealism, no glossy 3D, no Pixar, no clay, no anime, no busy icon collage. Every visible readable word in German projects must be German. Generate independently from text only; never use a previous generated image as visual reference.
```

## Qualitätsprüfung

1. Entspricht das Bild eindeutig der Serious-Minimal-Countryball-Welt?
2. Wirkt die Komposition bewusst gestaltet statt zufällig zusammengestellt?
3. Gibt es eine klare Größen- und Blickhierarchie?
4. Ist die Farbpalette kontrolliert und hochwertig?
5. Ist die negative Fläche ausgewogen statt leer?
6. Erzählt das Bild eine Beziehung/Handlung statt nur Symbole aufzulisten?
7. Sind Karten, Grenzen, Pfeile und Routen sauber lesbar?
8. Ist Typografie sauber integriert, falls Text vorgesehen ist?
9. Fehlen normale Menschen, Stickfiguren, Realismus und 3D?
10. Wurde kein vorheriges Bild als Referenz verwendet?
11. Ist Bild 01 zugleich Cover + erste Szene?
12. Liegen am Ende nur die finalen `Bild NN.png` im einen Bilderordner?
