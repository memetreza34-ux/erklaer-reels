# ANTIGRAVITY — REEL-PHASE-3 UND BILDREGEL

**Verbindlich für alle Reels. YouTube bleibt separat.**

## Antigravity erzeugt keine Reel-Bilder

Antigravity darf keine fehlenden Reel-Bilder selbst generieren und keine Assets aus einem anderen Reel als Ersatz verwenden. Die Bilder werden in Phase 2 extern erzeugt und im aktuellen Reel abgelegt.

Verbindliche Nutzerdatei für Google Flow:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Die Bilder werden dort streng seriell erzeugt:

```text
1 Bild erzeugen → warten → prüfen → Bild NN.png → ablegen → erst dann nächstes Bild
```

Keine Queue, keine Parallelgenerierung, keine späteren Bilder vor Abschluss des aktuellen Bildes.

## Phase 3 arbeitet im Simple Mode

Normaler Einstieg:

```bash
npm run phase3:reel -- --dir "<reel>"
```

Antigravity soll danach **nicht bei jedem Zwischenschritt nachfragen**. Der Lauf arbeitet selbstständig bis zum Render, solange kein echter Hard Blocker vorliegt.

### Automatisches Routing

`Bild 01`, `Bild 02`, `Bild 03` usw. bilden die bereits in Phase 1 festgelegte globale chronologische Bildreihenfolge. Diese Nummern dürfen Phase 3 direkt auf die geplanten Bildmomente routen.

Nicht mehr erforderlich:
- schriftliche Bildbeschreibung pro Bild
- Match-Begründung pro Bild
- zweite unabhängige Zuordnungsprüfung
- manuelle Bestätigung jedes Sprachankers
- Zwischenfreigabe nach jedem Pipeline-Schritt

### Einmalige schnelle visuelle QC

Nach dem Routing prüft Antigravity die Bilder **einmal** auf:
- Datei vorhanden und lesbar
- 9:16 / technisch brauchbar
- grob passend zum zugeordneten Satz/Bildmoment
- gleiche `Serious Minimal Countryball Explainer`-Welt
- Pflichttext korrekt, falls für das Bild vorgesehen

Kleine ästhetische Unterschiede blockieren nicht. Nur offensichtlicher falscher Inhalt, falsche Reihenfolge, klarer Stilbruch, kaputte Datei oder falscher Pflichttext sind Hard Fails.

### Bild↔Audio

Das finale Voice-over ist die Masterspur. Phase 1 liefert bereits die feste Satz↔Bild-Reihenfolge. Phase 3 erzeugt daraus automatisch eine monotone zeitliche Grundausrichtung und baut die Timeline ohne Einzel-Rückfragen.

Richtwerte:
- Szenencut ca. 0,10 s vor dem Szenenbeginn
- interner Bildcut ca. 0,08 s vor dem Bild-Cue
- SFX ca. 0,04 s vor dem sichtbaren Cut
- Adaptive Dense V2: meist 2,5–3,8 s je Bildmoment, technische Untergrenze ca. 2,2 s
- keine starren gleich langen Blöcke

### Hard Blocker — hier darf Antigravity stoppen

Nur bei Problemen, die nicht sicher autonom lösbar sind:
- erwartetes Bild fehlt
- doppelte Bildnummer
- mehrere unklare Voice-over-Dateien
- Audio fehlt oder ist beschädigt
- Bilddatei ist beschädigt/unlesbar
- offensichtliche falsche Reihenfolge oder falscher Inhalt
- schwerer Stilbruch
- Pflichttext klar falsch
- Render-/Toolfehler, der nicht automatisch behoben werden kann

Dann den **konkreten Blocker** nennen. Keine allgemeinen Rückfragen und keine Freigabe für bereits klare Schritte einholen.

## Untertitel

Neue Reels haben keine Untertitel und keinen aktiven Word-Sync. `sync:words` ist Legacy und gehört nicht in Phase 3.

## Kurzform

**Arman erzeugt Audio + Bilder. Antigravity routet sie automatisch nach Bildnummer, macht einen schnellen Sichtcheck, optimiert Audio, richtet Bild↔Audio automatisch aus, bindet SFX, baut die Timeline und rendert. Fragen nur bei echten Hard Blockern.**
