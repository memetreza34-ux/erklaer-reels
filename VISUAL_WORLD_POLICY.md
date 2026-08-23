# VISUAL WORLD POLICY

`CURRENT_WORKFLOW.md` ist bei Widersprüchen maßgeblich.

## Aktiver Zustand ab 2026-08-23

Für **alle neuen Reels** ist ausschließlich diese Bildwelt aktiv:

## `round-country-characters` — Kugel-Welt / Welt Nummer 1

Diese Welt wird ab sofort **für alle Themenbereiche** verwendet, nicht nur für Länder- und Geografie-Themen.

### Nicht verhandelbare Figurenregel

**Jede anthropomorphe Hauptfigur ist immer eine vollständig runde Kugel.**

Verbindliche Merkmale:
- vollständige kreisrunde/kugelförmige Editorial-Charaktere als Figurenkörper
- einfache weiße Augen
- höchstens winzige Arme/Beine
- erwachsener 2D-Editorial-/Dokumentar-Look
- starke 1-Sekunden-Lesbarkeit
- keine normalen Menschen als Hauptfiguren

### Länder-Themen

Bei Ländern wird das vereinfachte, klar erkennbare Flaggenmuster direkt auf die runde Kugel gelegt.

Beispiele:
- Deutschland → runde Kugel mit Deutschland-Flaggenmuster
- USA → runde Kugel mit vereinfachtem USA-Flaggenmuster
- Brasilien → runde Kugel mit vereinfachtem Brasilien-Flaggenmuster

### Nicht-Länder-Themen

Auch Psychologie, Politik, Gesellschaft oder abstrakte Mechanismen werden in derselben Kugel-Welt erzählt.

Dafür werden neutrale runde Kugelfiguren verwendet, zum Beispiel:
- einfache Farbflächen
- kleine klare Symbole
- visuelle Rollenmerkmale
- Emotion über Augen/Blick/Position

Dabei bleiben Körperform und Stil exakt kugelförmig. Keine menschlichen Köpfe oder Torsi.

### Strikt verboten

- Länderumriss oder Karten-Silhouette als Körper der Figur
- Augen, Gesicht, Mund, Arme oder Beine auf einer Länder-/Kontinentform
- unregelmäßig geformte „Countryballs“ statt echter runder Kugeln
- normale menschliche Figuren als Hauptcharaktere
- menschliche Köpfe als Hauptbildwelt

Karten, Grenzen, Straßen, Küsten, Länderumrisse und territoriale Formen dürfen weiterhin vorkommen, aber **nur als gesichtslose Hintergrund-/Erklärgrafik**.

Jeder Prompt für ein neues Reel muss sinngemäß enthalten:

> Every anthropomorphic main character must be a complete perfectly round editorial ball/sphere character. Never use a map-shaped character and never use a normal human character as the main figure.

Bei Länderfiguren zusätzlich:

> Use the simplified flag pattern wrapped across the perfectly round sphere.

---

# Pausierte Bildwelten

Bis der Nutzer sie ausdrücklich wieder aktiviert, sind diese Welten **außer Kraft** und dürfen für neue Reels nicht ausgewählt werden:

## `human-editorial-cartoon` — PAUSIERT

Historische Beschreibung bleibt nur zur Abwärtskompatibilität erhalten. Neue Psychologie-/Verhaltensthemen werden trotzdem in der Kugel-Welt umgesetzt.

## `visual-metaphor` — PAUSIERT

Historische Beschreibung bleibt nur zur Abwärtskompatibilität erhalten. Neue abstrakte Themen werden ebenfalls in der Kugel-Welt umgesetzt; Metaphern dürfen als Hintergrundobjekte vorkommen, aber die Hauptfiguren bleiben Kugeln.

---

# Mehrere Bildphasen

Die Kugel-Welt eignet sich für zusätzliche Bildwechsel, wenn sie einen echten Mehrwert bringen:

```text
Überblick → Detail
Karte → Zoom
Ausgangslage → Folge
Figur → innerer Mechanismus
Land A → Land B
historische Situation → heutige Situation
```

Es gibt keine feste Zielsumme an Bildern.

Wenn ein einziges Still-Bild ungefähr 3,5–4 Sekunden oder länger stehen würde, wird eine zusätzliche Bildphase aktiv geprüft. Sie wird nicht automatisch hinzugefügt.

---

# Sichtbarer Text in generierten Bildern — globale Pflichtregel

Workflow- und Produktionsdaten sind **niemals Bildinhalt**.

In einem generierten Bild dürfen niemals sichtbar erscheinen:
- `BILD 00`, `BILD 01`, `Bild 1` usw.
- `COVER`
- `SZENE`, `SCENE`
- `BILDPHASE`, `IMAGE PHASE`
- `DATEINAME`, Dateinamen oder Dateiendungen
- `GOOGLE FLOW`, `PROMPT`, `STYLE-REFERENZ`, `ZIEL`
- technische IDs
- sonstige Workflow-Metadaten

Für **jede einzelne Bildphase** gilt eine harte Text-Whitelist:
- wenn `imageText`/Cover-Headline gesetzt ist, ist **genau dieser Text der einzige erlaubte lesbare Text im Bild**
- wenn `imageText` leer ist, muss das Bild **vollständig ohne lesbaren Text** erzeugt werden

---

# Google-Flow-Qualitätsregel

Mehrere Visual-Prompts dürfen nicht mehr gemeinsam als Mega-Prompt an Google Flow gegeben werden.

Für die eigentliche Generierung gilt:
- **eine Prompt-Datei = genau ein Bild**
- genau ein aktiver Generierungsvorgang
- vollständig warten
- Ergebnis prüfen
- erst dann nächster Einzelprompt

Die Steuerdatei und das Manifest enthalten keine vollständigen Visual-Prompts und sind nicht als Bildgenerierungs-Prompt gedacht.
