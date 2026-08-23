# VISUAL WORLD POLICY

`CURRENT_WORKFLOW.md` ist bei Widersprüchen maßgeblich.

## Aktiver Modus ab 2026-08-23

Bis zu einer ausdrücklichen neuen Nutzerentscheidung ist **nur eine Bildwelt aktiv**:

`round-country-characters`

Die früheren Welten `human-editorial-cartoon` und `visual-metaphor` sind vorerst pausiert und dürfen nicht autonom ausgewählt werden.

Diese aktive Kugel-Welt wird für **alle erlaubten Themen** benutzt, nicht nur für Länder oder Geografie.

---

## `round-country-characters` — globale Hauptwelt

### Nicht verhandelbare Figurenregel

Jede anthropomorphe Hauptfigur ist eine **vollständig runde Kugel**.

Für Länderfiguren:
- complete perfectly round circular country ball / sphere
- vereinfachtes, klar erkennbares Flaggenmuster direkt auf der runden Kugel
- einfache weiße Augen
- höchstens winzige Arme/Beine

Für nicht-länderspezifische Rollen:
- ebenfalls vollständig runde Kugelfigur
- neutrale Farben oder passende Symbole statt Flagge
- keine menschlichen Köpfe oder Torsi als Hauptfigur

### Strikt verboten

- Länderumriss oder Karten-Silhouette als Körper einer Figur
- Augen, Mund, Arme oder Beine auf einer Länder-/Kontinentform
- unregelmäßige geografische Formen als „Countryball“
- menschliche Köpfe/Torsi als primäre Figurenwelt

Karten, Grenzen, Straßen, Küsten, Länderumrisse und territoriale Formen dürfen vorkommen, aber nur als **gesichtslose Erklär-/Hintergrundgrafik**.

---

# Bewährter alter Visual-Look — verbindlich

Die Prompt-Qualität soll wieder dem früheren Stil entsprechen. Neue Prompts dürfen nicht in generische „Sphere World“-Kurzprompts abrutschen.

Verbindlicher visueller Grundblock:

> Vertical 9:16 premium mature 2D editorial country-character illustration. Warm off-white textured paper background, deep navy borders and map shapes, muted rust, mustard, cobalt and forest-green accents, bold clean hand-inked outlines, flat geometric shading, subtle grain, high contrast, sophisticated documentary tone, not childish.

Zusätzlich:
- klare, hochwertige Editorial-Komposition
- ein dominanter visueller Gedanke pro Bild
- starke 1-Sekunden-Lesbarkeit
- Karten nur, wenn sie den Inhalt wirklich erklären
- keine billige Icon-Sammlung oder generische Infografik
- kein 3D, keine Fotorealistik
- volle 9:16-Fläche ohne Untertitelband
- `Bild 00` definiert Liniengewicht, Papiertextur, Palette, Kugelproportionen und Editorial-Finish für alle Folgeframes

## Verbindlicher Prompt-Aufbau

Jeder visuelle Quellprompt folgt wieder dem früheren Aufbau:

1. **Format + vollständiger Editorial-Stil**
2. **konkrete Bildkomposition und Handlung**
3. **runde Kugelfiguren passend zum Thema**
4. **exakter sichtbarer deutscher Text**, falls vorgesehen
5. **negative Regeln**: kein anderer lesbarer Text, kein Englisch, keine Logos, kein Wasserzeichen, kein 3D, keine Fotorealistik
6. **volle 9:16-Komposition**, keine Subtitle-Safe-Zone

Sekundäre Bildphasen dürfen kompakter sein und `matching Bild 00.png exactly` verwenden, aber sie müssen klar in derselben hochwertigen Welt bleiben.

## Export-Regel

Die seriellen Dateien `all-image-prompts/image-prompts/Bild NN.txt` enthalten ausschließlich den **eigentlichen visuellen Quellprompt**. Der Exporter darf keine technischen Wrapper, Quality-Gates, Dateinamen, Szenenlabels oder Workflow-Instruktionen in diesen Prompt hineinmischen.

Die serielle Steuerung lebt nur in `google-flow-controller.txt`.

---

# Sichtbarer Text — globale Pflichtregel

Workflow- und Produktionsdaten sind niemals Bildinhalt.

Nie sichtbar im Bild:
- `BILD 00`, `BILD 01`, `Bild 1` usw.
- `COVER`
- `SZENE`, `SCENE`
- `BILDPHASE`, `IMAGE PHASE`
- `DATEINAME`, Dateinamen oder Dateiendungen
- `GOOGLE FLOW`, `PROMPT`, `STYLE-REFERENZ`, `ZIEL`
- technische IDs
- sonstige Workflow-Metadaten

Pro Bild gilt:
- `imageText`/Cover-Headline gesetzt → genau dieser Text ist der einzige erlaubte lesbare Text
- `imageText` leer → überhaupt kein lesbarer Text

---

# Bilddichte

Die Bildanzahl bleibt individuell.

Jede narrative Szene erhält:
- 1 Bild, wenn es reicht
- 2 Bilder, wenn ein weiterer visueller Schritt klar verbessert
- 3 Bilder nur selten

Wenn ein einzelnes Still-Bild ungefähr 3,5–4 Sekunden oder länger stehen würde, wird eine zusätzliche Bildphase aktiv geprüft, aber nicht automatisch erzwungen.

Entscheidend sind Verständlichkeit, visueller Informationsgewinn, Abwechslung und Rhythmus.
