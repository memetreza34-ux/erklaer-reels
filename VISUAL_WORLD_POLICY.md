# VISUAL WORLD POLICY

`CURRENT_WORKFLOW.md` ist bei Widersprüchen maßgeblich.

Für neue Reels gibt es drei Hauptbildwelten. Die Bildwelt wird nach dem fertigen Script gewählt und innerhalb eines Reels konsistent gehalten.

## 1. `human-editorial-cartoon` — Köpfe-Welt

Diese Welt ist für Psychologie, Verhalten, Gefühle, Denken und soziale Mechanismen gedacht.

Verbindliche Merkmale:
- ein dominanter großer Kopf oder ein sehr klarer Gesichts-Close-up als Hauptmotiv
- maximal kleine Gruppen, wenn möglich 1–3 Köpfe
- starke Mimik und klare Blickrichtung
- wenig Körper; keine generischen Ganzkörper-Gruppenkompositionen
- Augen, Gedanken, innere Konflikte oder mentale Mechanismen direkt am/in/um den Kopf visualisieren
- erwachsener 2D-Editorial-/Dokumentar-Look, nicht kindlich
- schnelle 1-Sekunden-Lesbarkeit

### Verbotene Fehlinterpretation

`human-editorial-cartoon` bedeutet **nicht** einfach „normale Cartoon-Menschen“. Überfüllte Klassenraum-, Gruppen- oder Halb-/Ganzkörper-Szenen mit kleinen Köpfen verfehlen die Köpfe-Welt.

### Mehrere Bildphasen

Zusätzliche Bilder sind sinnvoll, wenn der zweite Schritt einen anderen mentalen Fokus zeigt, z. B.:

```text
Gesicht/Emotion → Gedankenmechanismus
Unsicherheit → innerer Konflikt
soziale Reaktion → Close-up der Wahrnehmung
```

Keine feste Gesamtzahl erzwingen.

---

## 2. `round-country-characters` — Länder-Welt

Diese Welt ist für Länder, Geografie, Grenzen, Geschichte, internationale Unterschiede und gesellschaftliche Systeme gedacht.

### Nicht verhandelbare Figurenregel

**Jede anthropomorphe Länderfigur ist immer eine vollständig runde Kugel.**

Verbindliche Merkmale:
- vollständige kreisrunde/kugelförmige Country-Charaktere als Figurenkörper
- vereinfachte, aber klar erkennbare Flaggenmuster direkt auf der runden Kugel
- einfache weiße Augen; höchstens winzige Arme/Beine
- keine menschlichen Köpfe oder menschlichen Torsi als Hauptfiguren
- erwachsener 2D-Editorial-/Dokumentar-Look

**Strikt verboten:**
- Länderumriss oder Karten-Silhouette als Körper der Figur
- Augen, Gesicht, Mund, Arme oder Beine auf einer Länder-/Kontinentform
- Australien-, Brasilien-, USA-, Deutschland- usw. als anthropomorphe Kartenform
- unregelmäßig geformte „Countryballs“ statt echter runder Kugeln

Karten, Grenzen, Straßen, Küsten, Länderumrisse und territoriale Formen dürfen weiterhin vorkommen, aber **nur als gesichtslose Hintergrund-/Erklärgrafik**. Eine Kartenform darf niemals selbst der Charakter sein.

Wenn ein Prompt eine Länderfigur erwähnt, muss er ausdrücklich die Formulierung sinngemäß enthalten:

> complete perfectly round country sphere / circular country ball; never a map-shaped character

### Mehrere Bildphasen

Diese Welt eignet sich besonders oft für zusätzliche Bildwechsel, weil geografische Erklärungen natürliche Zoomstufen besitzen:

```text
Welt/Kontinent → Land
Land → Grenze/Nachbar
historische Karte → heutige Situation
Land A → Vergleich mit Land B
Überblick → Detail
```

Trotzdem gilt ausdrücklich **keine feste Zielsumme** wie 16–18 Bilder. Die Bildanzahl bleibt pro Reel und pro Szene individuell.

---

## 3. `visual-metaphor` — Metaphern-Welt

Diese Welt ist für abstrakte Mechanismen, Ursache-Wirkung, Denkmodelle und unsichtbare Prozesse gedacht.

Verbindliche Merkmale:
- ein starkes Hauptsymbol
- klare visuelle Hierarchie
- möglichst in einer Sekunde verständliche Metapher
- typische Motive: Anker, Magnet, Waage, Domino, Mauer, Filter, Trichter, Seil, Käfig
- keine überladene Symbolsammlung

### Mehrere Bildphasen

Ein starkes Einzelmotiv darf lange genug stehen. Ein zweites Bild ist nur sinnvoll, wenn es einen echten zweiten Erklärungsschritt zeigt:

```text
Metapher/Mechanismus → Konsequenz
Ausgangszustand → sichtbare Wirkung
Problem → Auflösung
```

Keine feste Gesamtzahl erzwingen.

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
- technische IDs wie `scene-04-image-02`
- sonstige Workflow-Metadaten aus der Sammeldatei

Für **jede einzelne Bildphase** gilt eine harte Text-Whitelist:
- wenn `imageText`/Cover-Headline gesetzt ist, ist **genau dieser Text der einzige erlaubte lesbare Text im Bild**
- wenn `imageText` leer ist, muss das Bild **vollständig ohne lesbaren Text** erzeugt werden

Diese Regel gilt auch dann, wenn technische Labels unmittelbar vor dem Bildprompt in einer Sammeldatei stehen. Sie sind ausschließlich Steuerinformationen und dürfen niemals gerendert werden.

---

# Bilddichte — globale Regel

Die alte Annahme `eine narrative Szene = genau ein Bild` ist aufgehoben.

Jede narrative Szene erhält:
- 1 Bild, wenn es reicht
- 2 Bilder, wenn ein weiterer visueller Schritt klar verbessert
- 3 Bilder nur selten

Wenn ein einziges Still-Bild ungefähr 3,5–4 Sekunden oder länger stehen würde, wird eine zusätzliche Bildphase aktiv geprüft. Sie wird nicht automatisch hinzugefügt.

Entscheidend ist nicht die Bildwelt und nicht eine Quote, sondern:
- Verständlichkeit
- visueller Informationsgewinn
- Abwechslung
- Rhythmus
- Vermeidung unnötig langer statischer Stellen

Jedes zusätzliche Bild muss einen begründbaren Mehrwert haben.
