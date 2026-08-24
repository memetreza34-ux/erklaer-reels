# VISUAL WORLD POLICY

`CURRENT_WORKFLOW.md` ist bei Widersprüchen maßgeblich.

## Aktiver Modus ab 2026-08-24

Bis zu einer ausdrücklichen neuen Nutzerentscheidung ist **nur eine Bildwelt aktiv**:

`round-country-characters`

Die früheren Welten `human-editorial-cartoon` und `visual-metaphor` sind pausiert und dürfen nicht autonom ausgewählt werden.

Die Kugel-Welt ist **nicht an Länder-, Geschichts- oder Politikthemen gebunden**. Sie ist die visuelle Markenwelt für alle geeigneten Erklärthemen: Alltag, Psychologie, Verhalten, Beziehungen, Gesellschaft, Kultur, Wissenschaft, Technik, Internet, Lernen, Arbeit, Wirtschaft, Gesundheit, Ernährung, Sprache, Geschichte, Geografie und weitere starke Warum-Fragen.

---

## `round-country-characters` — globale Hauptwelt

### Identitätsregel: dieselbe echte Country-Ball-Form bei jedem Thema

Die Figurenform darf sich **niemals** an das Thema anpassen. Nur Farbe, Flagge, kleine Symbole, Requisiten und Handlung ändern sich.

Ein Land, eine Person, eine Gruppe, ein Gedanke, eine Gewohnheit, eine Emotion oder eine abstrakte Kraft benutzt immer dieselbe Grundgeometrie:

- der **komplette sichtbare Körper ist ein perfekter geometrischer Kreis / eine echte Country-Ball-Kugel**
- sichtbare Körperbreite und Körperhöhe sind gleich: **1:1-Kreis**, nicht gestreckt
- die runde Außenkontur bleibt auch beim Sitzen, Laufen, Drücken, Zögern oder bei Emotionen unverformt
- Augen sitzen direkt auf der Kugel
- es gibt **keinen separaten Kopf, Hals, Rumpf, Brustkorb, Schultern, Taille oder Hüften**
- höchstens winzige, einfache Arme/Beine sitzen direkt am Rand der Kugel
- Länder: vereinfachtes Flaggenmuster direkt auf derselben Kugel
- Nicht-Länder: **exakt dieselbe Country-Ball-Körperform**, nur mit neutraler Editorial-Farbe oder kleinem Symbol statt Flagge

### Harte Geometrie-Sperre für Prompts

Bei jeder anthropomorphen Figur muss die folgende Bedeutung ausdrücklich enthalten sein:

> EXACT COUNTRYBALL GEOMETRY LOCK: the entire character body is one perfect geometric 1:1 circle, equal visible width and height, with eyes directly on the circle. No separate head, neck, shoulders or torso. Never deform the circle for pose or emotion. Non-country roles use exactly the same classic countryball body geometry, only without a flag.

Zusätzlich müssen Prompts die falschen Formen ausdrücklich ausschließen:

> NO oval, egg-shaped, bean-shaped, capsule-shaped, pear-shaped, teardrop-shaped or humanoid character bodies.

**Wichtig:** Wörter wie `person`, `sitting`, `posture`, `body language` oder emotionale Posen dürfen niemals dazu führen, dass Flow einen menschlich geformten Körper baut. Wenn eine Handlung normalerweise den Körper verformen würde, bleibt die Kugel trotzdem perfekt rund und die Handlung wird über Position, Augen, winzige Gliedmaßen, Requisiten und Komposition gezeigt.

### Strikt verboten

- ovale, eiförmige, bohnenförmige, kapselartige, birnenförmige oder tropfenförmige Figuren
- humanoider Kopf mit darunterliegendem Körper
- separater Kopf, Hals, Schultern, Brustkorb, Rumpf, Taille oder Hüfte
- vertikal oder horizontal gestreckte Kugelfiguren
- Country-Ball nur als „Kopf“ eines menschlichen Körpers
- Länderumriss oder Karten-Silhouette als Körper einer Figur
- Augen, Mund, Arme oder Beine auf einer Länder-/Kontinentform
- unregelmäßige geografische Formen als „Countryball“
- menschliche Köpfe/Torsi als primäre Figurenwelt

Karten, Grenzen, Straßen, Küsten, Länderumrisse und territoriale Formen dürfen vorkommen, aber nur als **gesichtslose Erklär-/Hintergrundgrafik**.

### Visuelle Grammatik für Nicht-Länder-Themen

Die Kugeln sollen auch bei abstrakten Themen sofort verständlich bleiben:
- einzelne Person/Rolle → eine dominante perfekte neutrale Country-Ball-Kugel
- Gruppe/Mehrheit → mehrere klar verwandte perfekte Kugeln
- Gedanke/Erinnerung → kleine Nebenform, Gedankenblase oder eingebettetes Symbol; wenn anthropomorph, ebenfalls perfekte Kugel
- System/Plattform/Institution → Kugel + eindeutiges Requisit oder Interface-Motiv
- Ursache/Folge → räumliche Richtung, Pfeil, Kontrast oder klarer Vorher-/Nachher-Wechsel
- Emotion/Gewohnheit/abstrakte Kraft → perfekte Kugel + Symbolik und Szene; keine Körperverformung

Kein starres Farbcodesystem erzwingen. Entscheidend sind Wiedererkennbarkeit, 1-Sekunden-Lesbarkeit und eine klare visuelle Handlung.

---

# Bewährter alter Visual-Look — verbindlich

Die Prompt-Qualität soll dem früheren ausführlichen Stil entsprechen. Neue Prompts dürfen nicht in generische „Sphere World“-Kurzprompts abrutschen.

Verbindlicher visueller Grundblock:

> Vertical 9:16 premium mature 2D editorial country-character illustration. Warm off-white textured paper background, deep navy borders and map shapes, muted rust, mustard, cobalt and forest-green accents, bold clean hand-inked outlines, flat geometric shading, subtle grain, high contrast, sophisticated documentary tone, not childish.

Zusätzlich:
- klare, hochwertige Editorial-Komposition
- ein dominanter visueller Gedanke pro Bild
- starke 1-Sekunden-Lesbarkeit
- **exakte 1:1-Country-Ball-Geometrie vor Pose oder Ausdruck priorisieren**
- Karten nur, wenn sie den Inhalt wirklich erklären
- keine billige Icon-Sammlung oder generische Infografik
- kein 3D, keine Fotorealistik
- volle 9:16-Fläche ohne Untertitelband
- `Bild 00` definiert Liniengewicht, Papiertextur, Palette, **exakte Kugelgeometrie** und Editorial-Finish für alle Folgeframes

## Verbindlicher Prompt-Aufbau

Jeder visuelle Quellprompt folgt dem bewährten Aufbau:

1. **Format + vollständiger Editorial-Stil**
2. **EXACT COUNTRYBALL GEOMETRY LOCK** inklusive 1:1-Kreis und Verbotsformen
3. **konkrete Bildkomposition und Handlung**, ohne die Kugel für eine Pose zu deformieren
4. **exakter sichtbarer deutscher Text**, falls vorgesehen
5. **negative Regeln**: kein anderer lesbarer Text, kein Englisch, keine Logos, kein Wasserzeichen, kein 3D, keine Fotorealistik
6. **volle 9:16-Komposition**, keine Subtitle-Safe-Zone

Sekundäre Bildphasen dürfen kompakter sein und `Match Bild 00.png exactly` verwenden, müssen aber die exakte Kugelgeometrie ausdrücklich beibehalten.

---

# Google-Flow-Export — aktueller verbindlicher Stand

Die **verbindliche Nutzerdatei** ist:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Sie enthält den vollständigen seriellen Gesamtprompt mit Auftrag, Serienregeln, Dateinamen, Style-Master und danach allen vollständigen Bildprompts in Reihenfolge.

Technische identische Spiegeldatei:

```text
all-image-prompts/all-image-prompts.txt
```

Die Dateien unter

```text
all-image-prompts/image-prompts/Bild NN.txt
```

bleiben nur interne Sicherungen der reinen visuellen Quellprompts.

Der frühere separate `google-flow-controller.txt` ist **deaktiviert** und nicht der normale Google-Flow-Einstieg.

Trotz Gesamtprompt gilt strikt: genau ein Bildgenerator-Aufruf → vollständig warten → umbenennen → prüfen → erst danach das nächste Bild. Keine Queue, kein Batch und keine Parallelgenerierung.

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

Die technischen Überschriften des Gesamtprompts sind reine Steuerung und dürfen niemals in das generierte Bild übernommen werden.

---

# Visuelle QC der Figurenform

Ein Bild darf den Visual-QC-Check **nicht** bestehen, wenn eine anthropomorphe Figur zwar ungefähr rund wirkt, aber als ovaler/ei-/bohnenförmiger Mensch gezeichnet wurde.

Bei jeder sichtbaren Figur prüfen:
- Außenkontur als echter Kreis erkennbar
- sichtbare Breite ungefähr gleich sichtbarer Höhe
- kein separater Kopf oder Torso
- keine Schultern/Hals/Taille
- Augen direkt auf der Kugel
- Pose verändert die Kugelform nicht
- Nicht-Länder-Figur besitzt dieselbe Geometrie wie eine Länder-Country-Ball-Figur

Wenn einer dieser Punkte klar verletzt ist: `visualWorldMatch = false`, `characterModelConsistent = false` und der spezielle Geometrie-Check muss fehlschlagen.

---

# Bilddichte

Die Bildanzahl bleibt individuell.

Jede narrative Szene erhält:
- 1 Bild, wenn es reicht
- 2 Bilder, wenn ein weiterer visueller Schritt klar verbessert
- 3 Bilder nur selten

Wenn ein einzelnes Still-Bild ungefähr 3,5–4 Sekunden oder länger stehen würde, wird eine zusätzliche Bildphase aktiv geprüft, aber nicht automatisch erzwungen.

Entscheidend sind Verständlichkeit, visueller Informationsgewinn, Abwechslung und Rhythmus.
