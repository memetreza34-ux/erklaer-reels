# ANTIGRAVITY — AUSSCHLIESSLICH PHASE 3

**Verbindliche globale Repo-Regel.**

Diese Regel gilt für **Antigravity** bei jeder Arbeit in diesem Repository.

## Verbot vor und während Phase 3

**Antigravity darf niemals selbst Bilder erzeugen.**

Das bedeutet ausdrücklich:

- Antigravity darf **keine Coverbilder generieren**.
- Antigravity darf **keine Szenenbilder generieren**.
- Antigravity darf **keinen eingebauten oder externen Bildgenerator selbst starten**.
- Antigravity darf **keine Bildgenerierungs-API aufrufen**, um Reel-Bilder zu erzeugen.
- Antigravity darf **nicht stellvertretend für den Nutzer Google Flow starten oder dort die Generierung auslösen**.
- Antigravity darf auch dann **keine Ersatzbilder selbst erzeugen**, wenn Bilder fehlen, beschädigt sind, falsch nummeriert wurden oder die Asset-Suche nichts findet.
- Antigravity darf dieses Verbot **nicht mit dem Argument umgehen**, dass eine automatische Bildgenerierung schneller, einfacher oder für die Fertigstellung notwendig wäre.
- Antigravity darf **kein Thema, Voice-Script oder Szenenkonzept neu erstellen**.
- Antigravity darf **keine Bildwelt wählen oder wechseln**.
- Antigravity darf **keine Cover- oder Szenenprompts schreiben oder ergänzen**.
- Antigravity darf **kein Voice-over-Audio erzeugen**.

Es gibt **keine automatische Ausnahme** von diesem Verbot.

## Was Antigravity in Phase 3 tun muss

Antigravity übernimmt vollständig:

- Prüfung der Phase-1-/Phase-2-Übergabe
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

Die Prompts wurden bereits in Phase 1 durch normales ChatGPT erstellt. Antigravity darf sie nicht vorbereiten, neu schreiben oder inhaltlich ersetzen und darf **nicht selbst auf „Generieren“, „Senden“, „Start“, „Create“ oder eine vergleichbare Mediengenerierungsaktion klicken bzw. diese auslösen**.

## Wenn Bilder fehlen

Fehlende Bilder berechtigen Antigravity **nicht** zur Eigenproduktion.

Stattdessen muss Antigravity zuerst die bestehende Asset-Discovery verwenden und nach bereits erzeugten Downloads/ZIPs suchen. Wenn wirklich keine passenden Bilder vorhanden sind, bleibt der Bildstatus offen und Antigravity informiert den Nutzer, dass der externe Google-Flow-Schritt noch fehlt.

## Priorität

Diese Datei konkretisiert die bereits in `CURRENT_WORKFLOW.md` und `AGENTS.md` festgelegte Rollenverteilung und darf nicht als Lockerung anderer Regeln verstanden werden.

Bei Widersprüchen gilt weiterhin die Prioritätsreihenfolge aus `CURRENT_WORKFLOW.md`. Eine normale Anweisung wie „Mach ein neues Reel“ hebt dieses Bildgenerierungsverbot **nicht** auf.

**Kurzform: ChatGPT erstellt. Der Nutzer erzeugt Bilder und Audio. Antigravity verarbeitet ab Phase 3 alles bis zur geprüften MP4.**

Nach dem Startsignal `Antigravity los, erstelle das Reel` meldet Antigravity keine Zwischenstände. Es kontaktiert den Nutzer erst bei einem echten blockierenden Fehler nach ausgeschöpften sicheren Eigenlösungen oder nach Fertigstellung der geprüften MP4.
