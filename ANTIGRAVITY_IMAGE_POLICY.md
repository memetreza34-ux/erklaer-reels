# ANTIGRAVITY — ABSOLUTES BILDGENERIERUNGSVERBOT

**Verbindliche globale Repo-Regel.**

Diese Regel gilt für **Antigravity** bei jeder Reel-Erstellung, jeder Reparatur, jedem neuen Chat und jedem automatischen Produktionslauf in diesem Repository.

## Verbot

**Antigravity darf niemals selbst Bilder erzeugen.**

Das bedeutet ausdrücklich:

- Antigravity darf **keine Coverbilder generieren**.
- Antigravity darf **keine Szenenbilder generieren**.
- Antigravity darf **keinen eingebauten oder externen Bildgenerator selbst starten**.
- Antigravity darf **keine Bildgenerierungs-API aufrufen**, um Reel-Bilder zu erzeugen.
- Antigravity darf **nicht stellvertretend für den Nutzer Google Flow starten oder dort die Generierung auslösen**.
- Antigravity darf auch dann **keine Ersatzbilder selbst erzeugen**, wenn Bilder fehlen, beschädigt sind, falsch nummeriert wurden oder die Asset-Suche nichts findet.
- Antigravity darf dieses Verbot **nicht mit dem Argument umgehen**, dass eine automatische Bildgenerierung schneller, einfacher oder für die Fertigstellung notwendig wäre.

Es gibt **keine automatische Ausnahme** von diesem Verbot.

## Was Antigravity stattdessen tun darf und soll

Antigravity erstellt vollständig:

- Thema und Script
- Szenenplanung
- Cover-Prompt
- einzelne Szenenprompts
- `all-image-prompts/all-image-prompts.txt`
- Nummerierung `Bild 00`, `Bild 01`, ...
- Produktions- und Statusdateien
- Suche nach bereits vorhandenen Bildern
- sichere ZIP-Suche und ZIP-Entpackung
- visuelle Zwei-Pass-QC
- Bildzuordnung
- Audio-Pacing
- Untertitel-/Word-Sync
- Finalizer, Render-Validierung und Video-Render, sobald die extern erzeugten Bilder wirklich vorhanden und geprüft sind

## Wer die Bilder erzeugt

Der **Nutzer startet Google Flow selbst** durch einmaliges Einfügen und Absenden der vollständigen Datei:

```text
all-image-prompts/all-image-prompts.txt
```

Erst **nach diesem Nutzer-Start** darf Google Flow die Bilder gemäß dem verbindlichen seriellen Flow-Vertrag erzeugen.

Antigravity darf die Prompts vorbereiten, aber **nicht selbst auf „Generieren“, „Senden“, „Start“, „Create“ oder eine vergleichbare Bildgenerierungsaktion klicken bzw. diese auslösen**.

## Wenn Bilder fehlen

Fehlende Bilder berechtigen Antigravity **nicht** zur Eigenproduktion.

Stattdessen muss Antigravity zuerst die bestehende Asset-Discovery verwenden und nach bereits erzeugten Downloads/ZIPs suchen. Wenn wirklich keine passenden Bilder vorhanden sind, bleibt der Bildstatus offen und Antigravity informiert den Nutzer, dass der externe Google-Flow-Schritt noch fehlt.

## Priorität

Diese Datei konkretisiert die bereits in `CURRENT_WORKFLOW.md` und `AGENTS.md` festgelegte Rollenverteilung und darf nicht als Lockerung anderer Regeln verstanden werden.

Bei Widersprüchen gilt weiterhin die Prioritätsreihenfolge aus `CURRENT_WORKFLOW.md`. Eine normale Anweisung wie „Mach ein neues Reel“ hebt dieses Bildgenerierungsverbot **nicht** auf.

**Kurzform: Antigravity schreibt Bildprompts und verarbeitet vorhandene Bilder — Antigravity erzeugt niemals selbst Bilder.**
