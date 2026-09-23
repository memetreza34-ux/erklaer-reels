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

### Einmalige echte visuelle QC

Nach dem Routing prüft Antigravity jedes aktuelle Bild **genau einmal wirklich visuell** auf:
- Datei vorhanden und lesbar
- 9:16 / technisch brauchbar
- Bildinhalt passt zur zugeordneten Narration und zum konkreten Bildmoment
- Bildreihenfolge ist korrekt
- gleiche `Serious Minimal Countryball Explainer`-Welt
- Pflichttext korrekt, falls für das Bild vorgesehen

Die Prüfung wird in `review/visual-inspection.json` festgehalten. Für jedes bestandene Bild müssen nach der echten Sichtprüfung vorhanden sein:
- `status: "passed"`
- ein nicht-leerer `reviewer`
- ein gültiger `reviewedAt`-Zeitpunkt
- alle für das Bild vorgesehenen semantischen Checks auf `true`
- der automatisch erzeugte aktuelle `reviewFingerprint`

**Wichtig:** Die Freigabe ist an Bildbytes + geplante Szenenbedeutung gebunden. Wird ein Bild ausgetauscht oder Narration/Visual-Idee geändert, erzeugt die Pipeline einen neuen Fingerprint und setzt die alte Freigabe automatisch auf `pending` zurück.

Die technische Prüfung darf eine semantische Sichtprüfung nicht simulieren. Dateiname, Auflösung und korrekte Nummer reichen nicht als Beweis, dass der Inhalt stimmt.

Der erste `check:visuals --strict`-Lauf kann deshalb bewusst mit `pending` stoppen und die aktuelle Prüfliste erzeugen. Antigravity sieht die Bilder anschließend einmal an, trägt nur tatsächlich bestätigte Ergebnisse ein und startet denselben Schritt ohne Rückfrage erneut, z. B.:

```bash
npm run phase3:reel -- --dir "<reel>" --from "Einmalige schnelle visuelle QC"
```

Kleine ästhetische Unterschiede blockieren nicht. Falscher Inhalt, falsche Reihenfolge, klarer Stilbruch oder nicht bestätigte semantische Prüfung sind Hard Fails.

Zusätzlich prüft das Bildtext-Hard-Gate den tatsächlich sichtbaren deutschen Text per OCR. Eine reine Behauptung in Prompt oder Plan genügt nicht.

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
- falsche Reihenfolge oder falscher Inhalt
- schwerer Stilbruch
- Pflichttext klar falsch oder OCR-Gate schlägt fehl
- semantische Sichtprüfung eines aktuellen Bildes ist nicht bestanden
- Render-/Toolfehler, der nicht automatisch behoben werden kann

Wenn die Sichtprüfung lediglich noch `pending` ist, ist **keine Nutzerfreigabe** nötig: Antigravity führt den einen echten Sichtdurchgang selbst aus und setzt danach den Lauf fort.

Dann den **konkreten Blocker** nennen. Keine allgemeinen Rückfragen und keine Freigabe für bereits klare Schritte einholen.

## Untertitel

Neue Reels haben keine Untertitel und keinen aktiven Word-Sync. `sync:words` ist Legacy und gehört nicht in Phase 3.

## Kurzform

**Arman erzeugt Audio + Bilder. Antigravity routet sie nach Bildnummer, prüft jedes aktuelle Bild einmal tatsächlich gegen Narration/Reihenfolge/Bildwelt, optimiert Audio, richtet Bild↔Audio automatisch aus, bindet SFX, baut die Timeline und rendert. Bildtausch oder Szenenänderung invalidiert die Sichtfreigabe automatisch. Fragen nur bei echten Hard Blockern.**
