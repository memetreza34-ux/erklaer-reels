# ANTIGRAVITY — ABSOLUTES BILDGENERIERUNGSVERBOT

**Verbindliche globale Repo-Regel.**

Diese Regel gilt für **Antigravity** bei jeder Reel-Erstellung, jeder Reparatur, jedem neuen Chat und jedem automatischen Produktionslauf in diesem Repository.

## Verbot

**Antigravity darf niemals selbst Reel-Bilder erzeugen.**

Das bedeutet ausdrücklich:

- keine Coverbilder generieren
- keine Szenenbilder generieren
- keinen eingebauten oder externen Bildgenerator selbst starten
- keine Bildgenerierungs-API für Reel-Bilder aufrufen
- nicht stellvertretend für den Nutzer Google Flow starten oder dort die Generierung auslösen
- keine Ersatzbilder selbst erzeugen, wenn Bilder fehlen, beschädigt oder falsch nummeriert sind
- dieses Verbot nicht mit Zeitdruck, Bequemlichkeit oder Produktionsfortschritt umgehen

Es gibt **keine automatische Ausnahme** von diesem Verbot.

## Was Antigravity stattdessen tun darf und soll

Antigravity erstellt bzw. bearbeitet vollständig:

- Thema und Script
- Szenenplanung
- individuelle Bilddichte und Bildphasen
- Cover-Prompt
- einzelne Szenen-/Bildphasen-Prompts
- den vollständigen seriellen Google-Flow-Gesamtprompt
- Nummerierung `Bild 00`, `Bild 01`, ...
- Caption und Quellen
- Produktions- und Statusdateien
- Suche nach bereits vorhandenen Bildern
- sichere ZIP-Suche und ZIP-Entpackung
- visuelle Zwei-Pass-QC
- Bildzuordnung
- Audio-Pacing und Szenen-Synchronisierung
- Finalizer, Render-Validierung und Video-Render, sobald die extern erzeugten Bilder und das Audio wirklich vorhanden und geprüft sind

**Nicht Teil des aktiven Workflows:** Untertitel, Karaoke, Subtitle-Cues oder Word-Sync.

## Wer die Bilder erzeugt

Der **Nutzer startet Google Flow selbst** durch einmaliges Einfügen und Absenden der verbindlichen Datei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

`all-image-prompts/all-image-prompts.txt` ist nur die identische technische Spiegeldatei.

Der frühere separate `google-flow-controller.txt` ist deaktiviert und nicht der normale Einstieg.

Erst **nach diesem Nutzer-Start** darf Google Flow die Bilder gemäß dem seriellen Flow-Vertrag erzeugen.

Antigravity darf die Prompts vorbereiten, aber **nicht selbst auf „Generieren“, „Senden“, „Start“, „Create“ oder eine vergleichbare Bildgenerierungsaktion klicken bzw. diese auslösen**.

## Google-Flow-Vertrag: genau EIN Masterprompt für das ganze Reel

Der Nutzer schickt **genau eine Nachricht** an den Google-Flow-Agenten: `00-bildprompts/99-alle-bildprompts.txt`.

Diese eine Nachricht enthält:

- alle Workflow-Anweisungen
- die feste Reel-Bildwelt
- die komplette Bildreihenfolge
- alle einzelnen Bildprompts
- die exakten Dateinamen
- die Ordnerregel

Trotzdem ist die Ausführung **streng seriell** und niemals als Mehrbild-/Serien-Generierung zu behandeln.

### Vor Bild 00

Google Flow muss zuerst genau einen gemeinsamen Medienordner / eine Sammlung anlegen:

```text
00-FERTIGE-REEL-BILDER
```

Dieser Ordner ist der einzige Zielordner für die final akzeptierten Bilder dieses Reels.

### Für jedes einzelne Bild

```text
genau 1 aktuellen Bildprompt lesen
→ genau 1 Bildgenerator-Aufruf
→ vollständig warten
→ sichtbar gegen Prompt + Reel-Bildwelt prüfen
→ falls falsch: nur dieses aktuelle Bild einzeln neu erzeugen
→ exakt in Bild NN.png umbenennen
→ Umbenennung prüfen
→ sofort in 00-FERTIGE-REEL-BILDER legen/verschieben/einsortieren
→ Ordnerablage prüfen
→ erst dann den nächsten Bildprompt freigeben
```

**Verboten:**

- alle Bilder auf einmal generieren
- mehrere Bildprompts in einem Generator-Aufruf
- Batch-/Serien-/Galerie-Funktionen
- parallele Bildgenerierung
- mehrere queued Jobs
- mehrere Varianten gleichzeitig
- spätere Bilder starten, während das aktuelle Bild noch läuft
- unbenannte Bilder ansammeln und erst am Ende sortieren
- erst am Ende einen Ordner anlegen

Wenn Flow ein Bild **nicht** korrekt umbenennen oder **nicht** im vorgesehenen Ordner bestätigen kann, muss der Lauf **stoppen**. Es dürfen dann keine späteren Bilder erzeugt werden.

### Abschluss

Der Auftrag ist erst abgeschlossen, wenn der gemeinsame Ordner exakt die geplante Anzahl finaler Bilder enthält:

```text
Bild 00.png
Bild 01.png
Bild 02.png
...
```

Keine fehlende Nummer, keine doppelte Nummer und keine unbenannten finalen Bilder.

## Wenn Bilder fehlen

Fehlende Bilder berechtigen Antigravity **nicht** zur Eigenproduktion.

Stattdessen zuerst die bestehende Asset-Discovery ausführen und nach bereits erzeugten Downloads/ZIPs suchen. Wenn wirklich keine passenden Bilder vorhanden sind, bleibt der Bildstatus offen und Antigravity informiert den Nutzer, dass der externe Google-Flow-Schritt noch fehlt.

## Untertitel und Word-Sync

Der aktuelle Reel-Standard ist untertitelfrei:

- keine Untertitel
- keine Karaoke-Markierung
- keine Subtitle-Cues
- `sync:words` ist im aktiven Produktionsworkflow nicht erforderlich und darf nicht als Pflichtschritt eingeführt werden

Historische Word-Sync-Helfer sind nur Legacy-Diagnosewerkzeuge. Siehe `LEGACY_TOOLS.md`.

## Priorität

Diese Datei konkretisiert die bereits in `CURRENT_WORKFLOW.md` und `AGENTS.md` festgelegte Rollenverteilung und darf nicht als Lockerung anderer Regeln verstanden werden.

Bei Widersprüchen gilt weiterhin die Prioritätsreihenfolge aus `CURRENT_WORKFLOW.md`. Eine normale Anweisung wie „Mach ein neues Reel“ hebt dieses Bildgenerierungsverbot **nicht** auf.

**Kurzform: Antigravity schreibt EINEN kompletten Masterprompt für das ganze Reel; Google Flow erzeugt daraus streng Bild für Bild, benennt sofort um und sammelt jedes fertige Bild sofort im einen gemeinsamen Ordner. Antigravity erzeugt niemals selbst Reel-Bilder.**
