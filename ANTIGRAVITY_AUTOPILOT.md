# ANTIGRAVITY — SIMPLE PHASE-3 AUTOPILOT

Diese Datei definiert den vereinfachten Reel-Phase-3-Modus.

## Ziel

**Ein Auftrag = ein kompletter Lauf bis zum fertigen Reel.**

Wenn der Nutzer sinngemäß sagt:
- „Mach das Reel fertig“
- „Phase 3 starten“
- „Render das Reel“
- „Mach weiter bis fertig“

ist der komplette normale, nicht-destruktive Phase-3-Lauf freigegeben.

Antigravity fragt danach nicht bei Routineentscheidungen erneut nach.

## Neuer Simple-Mode

Der normale Ablauf ist bewusst kurz:

```text
Assets finden/organisieren
→ schneller visueller Einmal-Check
→ Voice-over optimieren
→ Bild↔Audio automatisch grundausrichten
→ Timeline + Sounds
→ Finalizer
→ Render
→ finalen Export kurz ansehen
```

Technischer Fast-Path:

```bash
npm run phase3:reel -- --dir "<reel>"
```

## Visuelle QC — nur noch ein schneller Pass

Nicht mehr pro Bild:
- 12 einzelne Häkchen
- schriftliche Bildbeschreibung
- Match-Begründung
- zweiter Kontroll-Durchgang

Stattdessen bei jedem Bild nur kurz prüfen:
1. Datei vorhanden und richtige Nummer/Reihenfolge
2. 9:16 technisch lesbar
3. kein offensichtlicher Inhaltsfehler zum zugeordneten Satz
4. kein offensichtlicher Bruch der festen Reel-Bildwelt
5. geplanter deutscher Pflichttext stimmt, falls vorhanden

Nummerierte Bilder `Bild 01`, `Bild 02`, ... sind nach dem Organisieren die chronologische Hauptautorität. Kleine ästhetische Unterschiede sind kein Blocker.

## Bild↔Audio — keine Einzel-Rückfragen mehr

Phase 1 hat bereits für jeden Bildmoment einen festen `spokenText`-Bereich und eine feste Reihenfolge definiert.

Nach `trim:pauses` erzeugt:

```bash
npm run auto-align:reel -- --dir "<reel>"
```

eine monotone Grundausrichtung aus:
- finaler Audiodauer
- Reihenfolge Bild 01 → Bild NN
- Länge der bereits festgelegten gesprochenen Textbereiche
- kleinen Satzzeichen-Gewichten für natürliche Pausen

Das ist der automatische Startpunkt für die Timeline. Antigravity fragt nicht wegen kleiner Anchor-Unschärfen nach.

Wenn beim finalen Reel sichtbar ein Cut zu früh/spät wirkt, korrigiert Antigravity diesen Cut selbstständig und rendert erneut. Erst bei einem echten Script↔Audio-Konflikt wird blockiert.

## Echte Blocker

Nur stoppen, wenn mindestens einer dieser Fälle vorliegt:

1. Reel-Ziel ist wirklich unklar.
2. Voice-over fehlt komplett oder ist unlesbar.
3. Ein benötigtes Bild fehlt oder ist beschädigt.
4. Bildnummern sind doppelt/inkonsistent und lassen sich nicht eindeutig auflösen.
5. Das gesprochene Audio weicht inhaltlich so stark vom Phase-1-Script ab, dass die chronologische Satzzuordnung nicht mehr funktioniert.
6. Ein Nutzeroriginal müsste gelöscht, überschrieben oder destruktiv verschoben werden.
7. Ein technischer Hard Gate bleibt nach automatischer Reparatur bestehen.
8. Eine externe kostenpflichtige oder irreversible Aktion wäre nötig.

**Keine Blocker:**
- kleine Style-Abweichung
- fehlende schriftliche QC-Begründung
- fehlender zweiter Sichtpass
- ein Anchor ist nicht wortgenau auffindbar, obwohl Satzreihenfolge und Audio insgesamt stimmen
- ein Check kann automatisch neu aufgebaut werden
- Timeline/SFX müssen nach einer Korrektur erneut berechnet werden

## Automatische Reparatur

Vor jeder Rückfrage zuerst selbst reparieren:

```text
Fehler erkennen
→ eindeutige nicht-destruktive Korrektur ausführen
→ betroffenen Check erneut starten
→ weiter
```

Dazu zählen insbesondere:
- technische Ordner anlegen
- Kopien einsortieren
- Audio erneut normalisieren/trimmen
- Auto-Alignment neu erzeugen
- Timeline neu bauen
- Soundtypen erneut aus der Library auflösen
- einzelne Cue-Zeiten korrigieren
- Render erneut starten

## Kommunikation

Keine Frage nach jedem Schritt. Nur kurze Meilensteine:

```text
Phase 3 läuft — Assets/Audio werden vorbereitet.
Phase 3 läuft — Timeline fertig, Render startet.
Fertig — MP4 geprüft und exportiert.
```

Bei echtem Blocker eine konkrete Meldung statt einer offenen Routinefrage:

```text
BLOCKIERT: Bild 09 fehlt nach vollständiger Asset-Suche.
Benötigt: Bild 09.png.
```

## Nutzerassets

Nutzeroriginale bleiben unveränderlich:
- nicht löschen
- nicht überschreiben
- nicht zwischen Reels verschieben
- nur sichere Kopien/abgeleitete Dateien erzeugen

## Commits

Normale Phase-3-Produktion braucht keinen Zwischencommit. Commit nur bei echter Code-/Policy-Änderung oder auf ausdrücklichen Nutzerwunsch.

## Kurzregel

**Nicht fragen, wenn Reihenfolge, vorhandene Assets und Repo-Regeln die nächste Aktion eindeutig machen. Schnell prüfen, automatisch ausrichten, rendern, final kurz ansehen.**
