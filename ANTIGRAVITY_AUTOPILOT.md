# ANTIGRAVITY — AUTONOMER PHASE-3-MODUS

Diese Datei definiert den gewünschten Arbeitsmodus für Antigravity bei Reel-Phase 3.

Ziel: **ein Auftrag, dann autonom bis zum Ergebnis arbeiten**. Antigravity soll den Nutzer nicht zwischen normalen Produktionsschritten immer wieder um Erlaubnis, Bestätigung oder ein weiteres „Go“ bitten.

## Was als vollständige Freigabe gilt

Wenn der Nutzer sinngemäß sagt:

- „Mach das Reel fertig“
- „Phase 3 starten“
- „Render das Reel“
- „Mach weiter bis zum fertigen Reel“
- „Antigravity soll loslegen“

ist damit der komplette normale Phase-3-Ablauf für das eindeutig gemeinte Reel freigegeben.

Diese Freigabe umfasst alle **nicht-destruktiven, repo-internen Routineaktionen**, die nötig sind, um das Reel gemäß `CURRENT_WORKFLOW.md` fertigzustellen.

Antigravity fragt danach **nicht erneut** vor jedem einzelnen Schritt.

## Ohne Rückfrage automatisch ausführen

Nach einmaliger Freigabe darf und soll Antigravity selbstständig:

- den aktuellen Reel-Ordner und Status lesen
- vorhandene Bilder, ZIPs und Audiodateien suchen
- ZIPs sicher entpacken
- Nutzerassets über die vorgesehenen Import-/Organize-Pfade als Kopie einsortieren
- Dateinummern und Asset-Zuordnung prüfen
- visuelle QC ausführen
- abgeleitete Arbeitsdateien neu erzeugen
- Audio-Pausen straffen
- Audio auf 1,10x optimieren
- Lautheit normalisieren
- reale Audiodauer nachmessen
- Bild↔Audio-Mapping lesen und aus dem finalen Audio ausrichten
- vorhandene SFX aus der zentralen Library binden
- Timeline erzeugen und bei behebbaren technischen Fehlern erneut erzeugen
- Finalizer und Render-Validierung ausführen
- bei behebbaren Fehlern automatisch korrigieren und den betreffenden Check erneut starten
- das finale Reel rendern
- den finalen Export prüfen
- Statusdateien aktualisieren

Für diese Routineaktionen ist **keine erneute Nutzerbestätigung** erforderlich.

## Nicht bei jedem Teilschritt berichten

Während eines normalen Phase-3-Laufs soll Antigravity nicht nach jedem Befehl anhalten und fragen, ob es weitermachen darf.

Falsch:

```text
Assets gefunden. Soll ich sie organisieren?
Audio organisiert. Soll ich es optimieren?
Audio optimiert. Soll ich Sounds synchronisieren?
Timeline fertig. Soll ich rendern?
```

Richtig:

```text
Phase 3 gestartet.
→ Assets
→ visuelle QC
→ Audio
→ Mapping
→ Sounds
→ Timeline
→ Finalizer
→ Render-QC
→ Render
→ Abschluss-QC
```

Nur bei einem echten Blocker wird der Nutzer eingebunden.

## Wann wirklich gestoppt werden muss

Antigravity stoppt und fragt nur, wenn eine Entscheidung ohne Nutzer nicht sicher möglich ist, zum Beispiel:

1. **Reel-Ziel unklar** — mehrere mögliche Reel-Ordner und nicht erkennbar, welcher gemeint ist.
2. **Pflichtasset fehlt wirklich** — nach Asset-Discovery fehlt z. B. Voice-over oder ein benötigtes Bild.
3. **Nutzeroriginal müsste destruktiv verändert werden** — Löschen, Überschreiben oder Verschieben eines unveränderlichen Originals wäre nötig.
4. **Bildzuordnung bleibt nach Prüfung mehrdeutig** — zwei Assets passen gleich plausibel und eine falsche Zuordnung würde den Inhalt verfälschen.
5. **Bild↔Audio-Anker ist nicht eindeutig** — nicht raten; nur dann Rückfrage oder konkrete Blockermeldung.
6. **Hard Gate schlägt fehl und lässt sich mit den vorhandenen Assets/Repo-Regeln nicht automatisch beheben.**
7. **Externe kostenpflichtige/irreversible Aktion** außerhalb des normalen lokalen Repo-Workflows wäre nötig.

Eine normale Warnung, ein erneut ausführbarer Check oder eine automatisch korrigierbare abgeleitete Datei ist **kein Grund für eine Rückfrage**.

## Automatische Reparatur vor Rückfrage

Bei einem Fehler gilt zuerst:

```text
Fehler erkennen
→ Ursache bestimmen
→ wenn nicht-destruktiv und eindeutig behebbar: automatisch korrigieren
→ denselben Check erneut ausführen
→ weiter
```

Beispiele für automatische Reparaturen:

- abgeleitete JSON-/Timeline-Datei neu aufbauen
- fehlende Zielordner anlegen
- Kopien korrekt einsortieren
- bekannte SFX erneut aus Library auflösen
- Audio-Normalisierung erneut ausführen
- Endstille erneut trimmen
- Timeline nach korrigierten Cue-Zeiten neu bauen
- Render nach bestandenem Gate erneut starten

## Keine unnötigen Commits während Produktion

Routine-Phase-3 ist **Produktionsarbeit, kein Repo-Refactoring**.

Antigravity soll nicht nach jedem kleinen Zwischenschritt committen. Dadurch würden unnötig oft Tests und Freigaben ausgelöst.

- Kein Commit nur wegen Asset-Discovery, Audio-Trim, Timeline-Build oder Zwischen-QC.
- Wenn kein Code/keine Policy geändert wird, ist für den normalen Produktionslauf kein Zwischencommit nötig.
- Einen Commit nur erstellen, wenn der Nutzer ihn verlangt oder tatsächlich Code/Repo-Regeln geändert wurden.
- Die bestehende Regel „vor jedem Commit npm test“ bleibt unverändert, gilt aber eben nur, wenn wirklich committed wird.

## Ein-Kommando-Fast-Path

Für den standardisierten technischen Teil von Phase 3 gibt es den Fast-Path:

```bash
npm run phase3:reel -- --dir "<reel>"
```

Dieser Befehl führt die normalen technischen Schritte seriell aus und stoppt nur, wenn ein echter Hard Gate oder technischer Fehler auftritt.

Antigravity darf vor bzw. zwischen diesen Schritten notwendige inhaltliche Arbeiten wie die exakte Bild↔Audio-Ausrichtung autonom erledigen, ohne erneut um Freigabe zu bitten.

## Kommunikation

Während des Laufs nur kurze Statusmeldungen bei sinnvollen Meilensteinen, nicht bei jedem Shell-Befehl.

Empfohlen:

```text
Phase 3 läuft — Assets und Audio werden geprüft.
Phase 3 läuft — Mapping/Timeline fertig, Render startet.
Fertig — MP4 geprüft und exportiert.
```

Bei Blocker:

```text
BLOCKIERT: Bild 09 fehlt nach vollständiger Asset-Suche.
Benötigt: genau Bild 09 für Szene 5, Phase 2.
```

Keine offene Frage stellen, wenn die nächste korrekte Aktion bereits eindeutig aus den Repo-Regeln hervorgeht.

## Grenzen

Diese Policy kann Antigravity-Agentenfragen und unnötige Workflow-Unterbrechungen reduzieren. **Echte Sicherheits-/Berechtigungsdialoge der IDE, des Betriebssystems oder einer Plattform können durch Repo-Anweisungen nicht abgeschaltet werden.** Wenn die Umgebung selbst eine zwingende Bestätigung verlangt, muss sie weiterhin vom Nutzer erteilt werden.

## Kurzform

**Ein Auftrag = Freigabe für den kompletten normalen, nicht-destruktiven Phase-3-Lauf. Antigravity arbeitet bis zum fertigen Reel selbstständig durch, repariert eindeutige Probleme automatisch und fragt nur bei echten Blockern.**
